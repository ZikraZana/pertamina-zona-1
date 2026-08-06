import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_rencana_kerja")
        .select('id, jenis_rk, nama_rk, jenis_produksi, jumlah_produksi, wilayah_kerja');

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 })
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login.", code: "UNAUTHORIZED" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Hanya admin.", code: "FORBIDDEN" }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });

    const stringFields = ["jenis_rk", "nama_rk", "wilayah_kerja"] as const;
    for (const field of stringFields) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
            return NextResponse.json({ error: `Field "${field}" wajib diisi.`, code: "VALIDATION_ERROR" }, { status: 400 });
        }
    }
    if (!["minyak", "gas"].includes(body.jenis_produksi)) {
        return NextResponse.json({ error: 'Field "jenis_produksi" harus "minyak" atau "gas".', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (typeof body.jumlah_produksi !== "number" || !Number.isFinite(body.jumlah_produksi) || body.jumlah_produksi < 0) {
        return NextResponse.json({ error: 'Field "jumlah_produksi" harus berupa angka dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("achievement_rencana_kerja")
        .insert({
            jenis_rk: body.jenis_rk,
            nama_rk: body.nama_rk,
            jenis_produksi: body.jenis_produksi,
            jumlah_produksi: body.jumlah_produksi,
            wilayah_kerja: body.wilayah_kerja,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    await supabase.from("activity_logs").insert({
        actor_id: user.id, action: "insert", entity_type: "achievement_rencana_kerja", entity_label: body.nama_rk,
    });

    return NextResponse.json({ data }, { status: 201 });
}