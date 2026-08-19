import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('overview_wilayah_kerja')
        .select('kode, nama_wilayah, provinsi, kabupaten_kota, jenis_wk, tahun_berdiri, luas_wilayah, part_interest, kkp, produksi_minyak, produksi_gas, tanggal_produksi, nama_fasilitas, jenis_fasilitas, jumlah_fasilitas, drilling_rigs, workover_rigs')
        .order('nama_wilayah', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 })
    }

    return NextResponse.json({ data })
}