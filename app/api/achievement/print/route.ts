import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { AchievementPdfDocument, PdfData } from "@/components/AdminPerformance/AchievementPdfDocument";


export async function GET() {
    const supabase = await createClient();

    const [
        produksiRes,
        rkRes,
        properRes,
        securityRes,
        inovasiRes,
        naratifRes,
        abiRes,
        kehumasanRes
    ] = await Promise.all([
        supabase.from("achievement_produksi").select("type, realization, target, unit, period"),
        supabase.from("achievement_rencana_kerja").select("id, jenis_rk, nama_rk, jumlah_minyak, jumlah_gas, wilayah_kerja").order("urutan", { ascending: true }),
        supabase.from("achievement_hsse_proper").select("id, wilayah_kerja, peringkat, tahun, keterangan"),
        supabase.from("achievement_hsse_security").select("id, judul, wilayah_kerja, tanggal").order("urutan", { ascending: true }),
        supabase.from("achievement_inovasi").select("id, pencapaian, nama_inovasi, nama_acara, wilayah_kerja").order("urutan", { ascending: true }),
        supabase.from("achievement_top_project_naratif").select("id, title, detail").order("urutan", { ascending: true }),
        supabase.from("achievement_top_project_abi").select("id, title, unit, realization, target, period").order("urutan", { ascending: true }),
        supabase.from("achievement_kehumasan").select("id, wilayah_kerja, kategori, sub_kategori, medali").order("urutan", { ascending: true }),
    ])

    // Kalau salah satu query error, hentikan dan laporkan -- daripada PDF
    // ke-generate dengan data yang cuma sebagian.
    const firstError = [produksiRes, rkRes, properRes, securityRes, inovasiRes, naratifRes, abiRes, kehumasanRes]
        .find((res) => res.error)?.error;

    if (firstError) {
        return NextResponse.json({ error: firstError.message, code: "SERVER_ERROR" }, { status: 500 });
    }

    const data: PdfData = {
        produksi: produksiRes.data ?? [],
        rencanaKerja: rkRes.data ?? [],
        hsseProper: properRes.data ?? [],
        hsseSecurity: securityRes.data ?? [],
        inovasi: inovasiRes.data ?? [],
        topProjectNaratif: naratifRes.data ?? [],
        topProjectAbi: abiRes.data ?? [],
        kehumasan: kehumasanRes.data ?? [],
    };

    const pdfBuffer = await renderToBuffer(AchievementPdfDocument({ data }));

    return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'inline; filename="laporan-achievement-zona-1.pdf"',
        },
    });
}