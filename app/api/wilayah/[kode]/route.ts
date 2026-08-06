import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = [
    "nama_wilayah", "provinsi", "kabupaten_kota", "jenis_wk", "tahun_berdiri",
    "luas_wilayah", "part_interest", "kkp", "produksi_minyak", "produksi_gas",
    "tanggal_produksi", "nama_fasilitas", "jenis_fasilitas", "jumlah",
    "sumur_eksplorasi_active", "sumur_eksplorasi_non_active", "sumur_eksplorasi_total",
    "producer_active", "producer_non_active", "producer_total",
    "injector_active", "injector_non_active", "injector_total",
    "sumur_total_active", "sumur_total_non_active", "sumur_total_total",
    "process_facilities_active", "process_facilities_non_active", "process_facilities_total",
    "offshore_platforms_active", "offshore_platforms_non_active", "offshore_platforms_total",
    "swamp_platforms_active", "swamp_platforms_non_active", "swamp_platforms_total",
    "gas_compressors_active", "gas_compressors_non_active", "gas_compressors_total",
    "pipeline_active", "pipeline_non_active", "pipeline_total",
    "drilling_rigs", "workover_rigs",
] as const;

type RouteParams = { params: Promise<{ kode: string }> };



// PATCH /api/wilayah/[kode] — admin only. Simpan perubahan data.
export async function PATCH(request: Request, { params }: RouteParams) {
    const { kode } = await params;
    const supabase = await createClient();

    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
        if (field in body) {
            const value = (body as Record<string, unknown>)[field];
            updatePayload[field] = value === "" ? null : value;
        }
    }

    if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: "Tidak ada field yang diubah." }, { status: 400 });
    }

    updatePayload.updated_at = new Date().toISOString();
    updatePayload.updated_by = user!.id;

    const { data, error } = await supabase
        .from("wilayah_kerja")
        .upsert({ kode, ...updatePayload }, { onConflict: "kode" })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("activity_logs").insert({
        actor_id: user.id,
        action: "update",
        entity_type: "overview",
        entity_label: data?.nama_wilayah
    })

    return NextResponse.json({ wilayah: data });
}