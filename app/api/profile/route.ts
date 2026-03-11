import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("message_count, full_name, date_of_birth, is_subscribed")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: "Profile not found", details: error?.message },
      { status: 404 }
    );
  }

  const { data: matrixRow } = await supabase
    .from("destiny_matrices")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    message_count: profile.message_count,
    full_name: profile.full_name,
    date_of_birth: profile.date_of_birth,
    is_subscribed: profile.is_subscribed,
    has_matrix: !!matrixRow,
  });
}
