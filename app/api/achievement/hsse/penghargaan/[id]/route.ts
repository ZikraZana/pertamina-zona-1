import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

// PUT: update data penghargaan berdasarkan id (admin only)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();

        const { user, err } = await requireAdmin(supabase);
        if (err) return err;

        const { id } = await params;
        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });
        }
        const { wilayah_kerja, predikat, nama_kegiatan, tahun, urutan } = body;

        if (typeof wilayah_kerja !== "string" || !wilayah_kerja.trim()) {
            return NextResponse.json({ error: 'Field "wilayah_kerja" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        if (!["Gold", "Silver", "Bronze"].includes(predikat)) {
            return NextResponse.json({ error: 'Field "predikat" tidak valid.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        if (typeof nama_kegiatan !== "string" || !nama_kegiatan.trim()) {
            return NextResponse.json({ error: 'Field "nama_kegiatan" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        const tahunNumber = Number(tahun);
        if (!Number.isInteger(tahunNumber) || tahunNumber < 2000) {
            return NextResponse.json({ error: 'Field "tahun" harus berupa tahun yang valid.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        let urutanNumber = 0;
        if (urutan !== undefined && urutan !== null) {
            const parsed = Number(urutan);
            if (!Number.isInteger(parsed) || parsed < 0) {
                return NextResponse.json({ error: 'Field "urutan" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
            }
            urutanNumber = parsed;
        }

        const { data, error } = await supabase
            .from("achievement_hsse_penghargaan")
            .update({
                wilayah_kerja,
                predikat,
                nama_kegiatan,
                tahun: tahunNumber,
                urutan: urutanNumber,
                updated_by: user.id,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: "Data penghargaan tidak ditemukan" }, { status: 404 });
        }

        const { error: logError } = await supabase.from("activity_logs").insert({
            actor_id: user!.id,
            action: "update",
            entity_type: "achievement_hsse_penghargaan",
            entity_label: nama_kegiatan,
        });
        if (logError) console.error("Gagal mencatat activity log:", logError.message);

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal memperbarui data penghargaan:", err);
        return NextResponse.json({ error: err.message ?? "Gagal memperbarui data penghargaan" }, { status: 500 });
    }
}

// DELETE: hapus data penghargaan berdasarkan id (admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();

        const { user, err } = await requireAdmin(supabase);
        if (err) return err;

        const { id } = await params;

        const { data: existing } = await supabase
            .from("achievement_hsse_penghargaan")
            .select("nama_kegiatan")
            .eq("id", id)
            .single();

        const { error } = await supabase
            .from("achievement_hsse_penghargaan")
            .delete()
            .eq("id", id);

        if (error) throw error;

        const { error: logError } = await supabase.from("activity_logs").insert({
            actor_id: user!.id,
            action: "delete",
            entity_type: "achievement_hsse_penghargaan",
            entity_label: existing?.nama_kegiatan ?? id,
        });
        if (logError) console.error("Gagal mencatat activity log:", logError.message);

        return NextResponse.json({ message: "Data penghargaan berhasil dihapus" }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal menghapus data penghargaan:", err);
        return NextResponse.json({ error: err.message ?? "Gagal menghapus data penghargaan" }, { status: 500 });
    }
}