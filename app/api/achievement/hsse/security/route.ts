import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: ambil semua data security
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("achievement_hsse_security")
            .select("*")
            .order("urutan", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal mengambil data security:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal mengambil data security" },
            { status: 500 }
        );
    }
}

// POST: tambah data security baru
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await req.json();
        const { judul, wilayah_kerja, tanggal, urutan } = body;

        if (!judul || !wilayah_kerja || !tanggal) {
            return NextResponse.json(
                { error: "judul, wilayah_kerja, dan tanggal wajib diisi" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("achievement_hsse_security")
            .insert([
                {
                    judul,
                    wilayah_kerja,
                    tanggal,
                    urutan: urutan ?? 0,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data }, { status: 201 });
    } catch (err: any) {
        console.error("Gagal menambah data security:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal menambah data security" },
            { status: 500 }
        );
    }
}