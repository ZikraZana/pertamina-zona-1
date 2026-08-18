import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('achievement_inovasi')
        .select('id, pencapaian, nama_inovasi, nama_acara, wilayah_kerja, urutan, created_at, created_by')
        .order('urutan', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 })
    }

    return NextResponse.json({ data })
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });

    const requiredFields = ["pencapaian", "nama_inovasi", "wilayah_kerja"] as const;
    for (const field of requiredFields) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
            return NextResponse.json({ error: `Field "${field}" wajib diisi.`, code: "VALIDATION_ERROR" }, { status: 400 });
        }
    }

    // nama_acara boleh kosong (nullable di DB), tapi kalau diisi harus string
    if (body.nama_acara !== undefined && body.nama_acara !== null && typeof body.nama_acara !== "string") {
        return NextResponse.json({ error: 'Field "nama_acara" harus berupa teks.', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const namaAcara = typeof body.nama_acara === "string" && body.nama_acara.trim() ? body.nama_acara.trim() : null;

    const { count } = await supabase
        .from("achievement_inovasi")
        .select("id", { count: "exact", head: true });

    const { data, error } = await supabase
        .from("achievement_inovasi")
        .insert({
            pencapaian: body.pencapaian,
            nama_inovasi: body.nama_inovasi,
            nama_acara: namaAcara,
            wilayah_kerja: body.wilayah_kerja,
            urutan: count ?? 0,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user.id, action: "insert", entity_type: "achievement_inovasi", entity_label: body.nama_inovasi,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data }, { status: 201 });
}