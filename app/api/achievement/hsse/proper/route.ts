import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: ambil semua data proper
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("achievement_hsse_proper")
            .select("*")
            .order("urutan", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal mengambil data proper:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal mengambil data proper" },
            { status: 500 }
        );
    }
}

// POST: tambah data proper baru
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await req.json();
        const { wilayah_kerja, peringkat, tahun, keterangan, urutan } = body;

        if (!wilayah_kerja || !peringkat || !tahun) {
            return NextResponse.json(
                { error: "wilayah_kerja, peringkat, dan tahun wajib diisi" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("achievement_hsse_proper")
            .insert([
                {
                    wilayah_kerja,
                    peringkat,
                    tahun,
                    keterangan: keterangan ?? null,
                    urutan: urutan ?? 0,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data }, { status: 201 });
    } catch (err: any) {
        console.error("Gagal menambah data proper:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal menambah data proper" },
            { status: 500 }
        );
    }
}