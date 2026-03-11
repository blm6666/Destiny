import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") ?? "web";

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .eq("channel", channel)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load messages", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    messages: (data ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    })),
  });
}
