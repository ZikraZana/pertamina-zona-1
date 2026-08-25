import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/achievement/produksi — publik, tampil di halaman /achievements
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("achievement_produksi")
    .select("type, realization, target, period, unit, wpnb");

  if (error) {
    return NextResponse.json(
      { error: error.message, code: "SERVER_ERROR" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data });
}

// PATCH /api/achievement/produksi — admin only, update salah satu type
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const { user, err } = await requireAdmin(supabase);
  if (err) return err;

  const body = await request.json().catch(() => null);
  if (!body)
    return NextResponse.json(
      { error: "Body tidak valid.", code: "VALIDATION_ERROR" },
      { status: 400 },
    );

  const { type, realization, target, period, unit, wpnb } = body;

  if (!["minyak", "gas", "migas"].includes(type)) {
    return NextResponse.json(
      { error: "type tidak valid.", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  if (
    typeof realization !== "number" ||
    !Number.isFinite(realization) ||
    realization < 0
  ) {
    return NextResponse.json(
      {
        error: 'Field "realisasi" harus berupa angka dan tidak boleh negatif.',
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }
  if (
    typeof wpnb !== "number" ||
    !Number.isFinite(wpnb) ||
    wpnb < 0
  ) {
    return NextResponse.json(
      {
        error: 'Field "wpnb" harus berupa angka dan tidak boleh negatif.',
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }
  if (typeof target !== "number" || !Number.isFinite(target) || target < 0) {
    return NextResponse.json(
      {
        error: 'Field "target" harus berupa angka dan tidak boleh negatif.',
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }
  if (typeof period !== "string" || !period.trim()) {
    return NextResponse.json(
      { error: 'Field "periode" wajib diisi.', code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }
  if (typeof unit !== "string" || !unit.trim()) {
    return NextResponse.json(
      { error: 'Field "unit" wajib diisi.', code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  // Upsert supaya row "wpnb" otomatis kebuat pas admin pertama kali simpan.
  const { data, error } = await supabase
    .from("achievement_produksi")
    .upsert(
      {
        type,
        realization,
        target,
        period,
        unit,
        wpnb,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "type" },
    )
    .select()
    .single();

  if (error)
    return NextResponse.json(
      { error: error.message, code: "SERVER_ERROR" },
      { status: 500 },
    );

  const { error: logError } = await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "update",
    entity_type: "achievement_produksi",
    entity_label: `Produksi ${type}`,
  });
  if (logError) console.error("Gagal mencatat activity log:", logError.message);

  return NextResponse.json({ data });
}
