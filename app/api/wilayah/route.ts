import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const WILAYAH_FIELDS = [
    "kode",
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

// GET /api/wilayah — publik, dipakai halaman Overview untuk menampilkan data.
export async function GET() {
    const supabase = await createClient();

    const { data: rows, error } = await supabase
        .from("wilayah_kerja")
        .select(WILAYAH_FIELDS.join(", "));

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Susun jadi Record<kode, WilayahData> biar gampang dipakai di frontend
    const data: Record<string, unknown> = {};
    for (const row of rows ?? []) {
        const r = row as unknown as Record<string, unknown>;
        data[r.kode as string] = r;
    }

    return NextResponse.json({ data });
}