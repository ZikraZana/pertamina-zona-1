import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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

    const { urutan } = body;
    if (urutan !== undefined && (typeof urutan !== "number" || !Number.isInteger(urutan) || urutan < 0)) {
        return NextResponse.json({ error: 'Field "urutan" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data: existing } = await supabase.from("achievement_inovasi").select("id, urutan").eq("id", id).single();
    if (!existing) return NextResponse.json({ error: "Data tidak ditemukan.", code: "NOT_FOUND" }, { status: 404 });

    const { data, error } = await supabase
        .from("achievement_inovasi")
        .update({
            pencapaian: body.pencapaian,
            nama_inovasi: body.nama_inovasi,
            nama_acara: namaAcara,
            wilayah_kerja: body.wilayah_kerja,
            urutan: urutan ?? existing.urutan,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
        })
        .eq("id", id)

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    // skip_log: true dikirim saat PATCH ini dipanggil dari reorder (drag-and-drop) --
    // reorder tidak dicatat ke activity log sama sekali.
    if (!body.skip_log) {
        const { error: logError } = await supabase.from("activity_logs").insert({
            actor_id: user!.id, action: "update", entity_type: "achievement_inovasi", entity_label: body.nama_inovasi,
        });
        if (logError) console.error("Gagal mencatat activity log:", logError.message);
    }

    return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const { data: existing } = await supabase.from("achievement_inovasi").select("nama_inovasi").eq("id", id).single();
    if (!existing) return NextResponse.json({ error: "Data tidak ditemukan.", code: "NOT_FOUND" }, { status: 404 });

    const { error } = await supabase.from("achievement_inovasi").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "delete", entity_type: "achievement_inovasi", entity_label: existing?.nama_inovasi ?? id,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ success: true });
}