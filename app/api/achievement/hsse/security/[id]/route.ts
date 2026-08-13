import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

// PUT: update data security berdasarkan id (admin only)
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
        const { judul, wilayah_kerja, tanggal, urutan } = body;

        if (typeof judul !== "string" || !judul.trim()) {
            return NextResponse.json({ error: 'Field "judul" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        if (typeof wilayah_kerja !== "string" || !wilayah_kerja.trim()) {
            return NextResponse.json({ error: 'Field "wilayah_kerja" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        if (typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
            return NextResponse.json({ error: 'Field "tanggal" harus berupa tanggal yang valid.', code: "VALIDATION_ERROR" }, { status: 400 });
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
            .from("achievement_hsse_security")
            .update({ judul, wilayah_kerja, tanggal, urutan: urutanNumber })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: "Data security tidak ditemukan" }, { status: 404 });
        }

        const { error: logError } = await supabase.from("activity_logs").insert({
            actor_id: user!.id,
            action: "update",
            entity_type: "achievement_hsse_security",
            entity_label: judul,
        });
        if (logError) console.error("Gagal mencatat activity log:", logError.message);

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal memperbarui data security:", err);
        return NextResponse.json({ error: err.message ?? "Gagal memperbarui data security" }, { status: 500 });
    }
}

// DELETE: hapus data security berdasarkan id (admin only)
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
            .from("achievement_hsse_security")
            .select("judul")
            .eq("id", id)
            .single();

        const { error } = await supabase
            .from("achievement_hsse_security")
            .delete()
            .eq("id", id);

        if (error) throw error;

        const { error: logError } = await supabase.from("activity_logs").insert({
            actor_id: user!.id,
            action: "delete",
            entity_type: "achievement_hsse_security",
            entity_label: existing?.judul ?? id,
        });
        if (logError) console.error("Gagal mencatat activity log:", logError.message);

        return NextResponse.json({ message: "Data security berhasil dihapus" }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal menghapus data security:", err);
        return NextResponse.json({ error: err.message ?? "Gagal menghapus data security" }, { status: 500 });
    }
}