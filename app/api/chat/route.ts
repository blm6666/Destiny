import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt, streamChatCompletion } from "@/lib/openai";
import { NextResponse } from "next/server";

const PAYWALL_AT = 10;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { message: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message } = body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, message_count")
    .eq("id", authUser.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.message_count >= PAYWALL_AT) {
    return NextResponse.json(
      { error: "Message limit reached", paywall: true },
      { status: 403 }
    );
  }

  const trimmedMessage = message.trim();
  if (!profile.full_name && trimmedMessage.length < 50 && !/\d/.test(trimmedMessage)) {
    await supabase
      .from("profiles")
      .update({ full_name: trimmedMessage })
      .eq("id", authUser.id);
  }

  const { data: matrixRow } = await supabase
    .from("destiny_matrices")
    .select("matrix_data")
    .eq("user_id", authUser.id)
    .single();

  const { data: historyRows } = await supabase
    .from("messages")
    .select("role, content")
    .eq("user_id", authUser.id)
    .eq("channel", "web")
    .order("created_at", { ascending: true })
    .limit(30);

  const history =
    historyRows?.map((r) => ({ role: r.role as "user" | "assistant", content: r.content })) ?? [];

  const userName = profile.full_name?.split(" ")[0] ?? null;
  const matrix = matrixRow?.matrix_data as import("@/lib/destiny-matrix").DestinyMatrixResult | null;
  const systemPrompt = buildSystemPrompt(userName, matrix);

  const { error: insertUserError } = await supabase.from("messages").insert({
    user_id: authUser.id,
    role: "user",
    content: trimmedMessage,
    channel: "web",
  });

  if (insertUserError) {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }

  await supabase
    .from("profiles")
    .update({ message_count: profile.message_count + 1 })
    .eq("id", authUser.id);

  const stream = await streamChatCompletion(systemPrompt, [
    ...history,
    { role: "user", content: trimmedMessage },
  ]);

  let fullContent = "";

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullContent += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } finally {
        if (fullContent) {
          await supabase.from("messages").insert({
            user_id: authUser.id,
            role: "assistant",
            content: fullContent,
            channel: "web",
          });
        }
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
