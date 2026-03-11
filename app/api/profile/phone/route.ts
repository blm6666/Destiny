import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { phone_number: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = typeof body.phone_number === "string" ? body.phone_number.trim() : "";
  if (!phone) {
    return NextResponse.json({ error: "phone_number required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ phone_number: phone })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update phone", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
