import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getChatCompletion } from "@/lib/openai";
import { sendWhatsAppMessage, sendSms } from "@/lib/twilio";
import { NextResponse } from "next/server";

const PAYLOAD_TYPE = "application/x-www-form-urlencoded";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes(PAYLOAD_TYPE)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const from = params.get("From") ?? "";
  const messageBody = (params.get("Body") ?? "").trim();
  const numMedia = parseInt(params.get("NumMedia") ?? "0", 10);

  if (!messageBody && numMedia === 0) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  const normalizedFrom = from.replace(/^whatsapp:/, "").replace(/\s/g, "");

  const { data: profile } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, full_name, is_subscribed")
    .eq("phone_number", normalizedFrom)
    .maybeSingle();

  if (!profile || !profile.is_subscribed) {
    const reply =
      "You're not subscribed to Destiny yet, or this number isn't linked. Subscribe at the app and add your phone number to receive guidance here.";
    await replyToSender(from, reply);
    return twimlResponse("");
  }

  const { data: matrixRow } = await getSupabaseAdmin()
    .from("destiny_matrices")
    .select("matrix_data")
    .eq("user_id", profile.id)
    .single();

  const { data: recentMessages } = await getSupabaseAdmin()
    .from("messages")
    .select("role, content")
    .eq("user_id", profile.id)
    .in("channel", ["whatsapp", "sms"])
    .order("created_at", { ascending: false })
    .limit(20);

  const history = (recentMessages ?? []).reverse().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const { buildSystemPrompt } = await import("@/lib/openai");
  const userName = profile.full_name?.split(" ")[0] ?? null;
  const matrix = matrixRow?.matrix_data as import("@/lib/destiny-matrix").DestinyMatrixResult | null;
  const systemPrompt = buildSystemPrompt(userName, matrix);

  const responseText = await getChatCompletion(systemPrompt, [
    ...history,
    { role: "user", content: messageBody },
  ]);

  await getSupabaseAdmin().from("messages").insert([
    {
      user_id: profile.id,
      role: "user",
      content: messageBody,
      channel: from.startsWith("whatsapp:") ? "whatsapp" : "sms",
    },
    {
      user_id: profile.id,
      role: "assistant",
      content: responseText,
      channel: from.startsWith("whatsapp:") ? "whatsapp" : "sms",
    },
  ]);

  await replyToSender(from, responseText);

  return twimlResponse("");
}

async function replyToSender(from: string, body: string): Promise<void> {
  try {
    if (from.startsWith("whatsapp:")) {
      await sendWhatsAppMessage(from, body);
    } else {
      await sendSms(from, body);
    }
  } catch (err) {
    console.error("Twilio send error:", err);
  }
}

function twimlResponse(message: string): NextResponse {
  const twiml = message
    ? `<Response><Message>${escapeXml(message)}</Message></Response>`
    : "<Response></Response>";
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>${twiml}`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
