import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type AsetInput = {
    wilayah_kerja: string;
    tipe_aset: string;
    kategori: string;
    jumlah_active: string | null;
    jumlah_non_active: string | null;
    total: string | null;
};

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

export async function PATCH(request: Request) {
    const supabase = await createClient();

    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!Array.isArray(body)) {
        return NextResponse.json(
            { error: "Body request harus berupa array data aset.", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    const rows: AsetInput[] = body.map((item) => ({
        wilayah_kerja: item.wilayah_kerja,
        tipe_aset: item.tipe_aset,
        kategori: item.kategori,
        jumlah_active: item.jumlah_active === "" ? null : item.jumlah_active,
        jumlah_non_active: item.jumlah_non_active === "" ? null : item.jumlah_non_active,
        total: item.total === "" ? null : item.total,
    }));

    const { data, error } = await supabase
        .from("overview_wilayah_aset")
        .upsert(rows, { onConflict: "wilayah_kerja,tipe_aset,kategori" })
        .select();

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ data });
}