import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT: update data security berdasarkan id
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;
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
            .update({
                judul,
                wilayah_kerja,
                tanggal,
                urutan: urutan ?? 0,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return NextResponse.json(
                { error: "Data security tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal memperbarui data security:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal memperbarui data security" },
            { status: 500 }
        );
    }
}

// DELETE: hapus data security berdasarkan id
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { error } = await supabase
            .from("achievement_hsse_security")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json(
            { message: "Data security berhasil dihapus" },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Gagal menghapus data security:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal menghapus data security" },
            { status: 500 }
        );
    }
}