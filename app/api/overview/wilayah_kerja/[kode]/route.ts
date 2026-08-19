import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = [
    "nama_wilayah", "provinsi", "kabupaten_kota", "jenis_wk", "tahun_berdiri",
    "luas_wilayah", "part_interest", "kkp", "produksi_minyak", "produksi_gas",
    "tanggal_produksi", "nama_fasilitas", "jenis_fasilitas", "jumlah_fasilitas",
    "drilling_rigs", "workover_rigs",
] as const;

type RouteParams = { params: Promise<{ kode: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
    const { kode } = await params;
    const supabase = await createClient();

    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Body request tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
        if (field in body) {
            updatePayload[field] = body[field] === "" ? null : body[field];
        }
    }

    if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: "Tidak ada field yang diubah.", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    updatePayload.updated_at = new Date().toISOString();
    updatePayload.updated_by = user!.id;

    const { data, error } = await supabase
        .from("overview_wilayah_kerja")
        .update(updatePayload)
        .eq("kode", kode)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });
    }

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user.id,
        action: "update",
        entity_type: "overview",
        entity_label: data?.nama_wilayah,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data });
}