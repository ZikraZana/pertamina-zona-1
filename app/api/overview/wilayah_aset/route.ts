import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const wilayahKerja = searchParams.get("wilayah_kerja");

    if (!wilayahKerja) {
        return NextResponse.json(
            { error: "Parameter wilayah_kerja wajib diisi.", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("overview_wilayah_aset")
        .select("id, wilayah_kerja, tipe_aset, kategori, jumlah_active, jumlah_non_active, total")
        .eq("wilayah_kerja", wilayahKerja)
        .order("id", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 })
    }

    return NextResponse.json({ data })
}