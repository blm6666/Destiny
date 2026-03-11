import { createClient } from "@/lib/supabase/server";
import { calculateDestinyMatrix } from "@/lib/destiny-matrix";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { date_of_birth: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { date_of_birth } = body;
  if (!date_of_birth || typeof date_of_birth !== "string") {
    return NextResponse.json(
      { error: "date_of_birth required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const match = date_of_birth.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr!, 10);
  const month = parseInt(monthStr!, 10);
  const day = parseInt(dayStr!, 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const matrix = calculateDestinyMatrix(day, month, year);

  const { error: upsertError } = await supabase
    .from("destiny_matrices")
    .upsert(
      {
        user_id: user.id,
        date_of_birth: date_of_birth,
        matrix_data: matrix,
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    return NextResponse.json(
      { error: "Failed to save matrix", details: upsertError.message },
      { status: 500 }
    );
  }

  await supabase
    .from("profiles")
    .update({ date_of_birth })
    .eq("id", user.id);

  return NextResponse.json({ matrix });
}
