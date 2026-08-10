import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT: update data proper berdasarkan id
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;
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
            .update({
                wilayah_kerja,
                peringkat,
                tahun,
                keterangan: keterangan ?? null,
                urutan: urutan ?? 0,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return NextResponse.json(
                { error: "Data proper tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal memperbarui data proper:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal memperbarui data proper" },
            { status: 500 }
        );
    }
}

// DELETE: hapus data proper berdasarkan id
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { error } = await supabase
            .from("achievement_hsse_proper")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json(
            { message: "Data proper berhasil dihapus" },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Gagal menghapus data proper:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal menghapus data proper" },
            { status: 500 }
        );
    }
}