import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const VALID_MEDALI = ["gold", "silver", "bronze"] as const;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const formData = await request.formData();

    const wilayah_kerja = formData.get("wilayah_kerja");
    const kategori = formData.get("kategori");
    const sub_kategori = formData.get("sub_kategori");
    const medali = formData.get("medali");
    const urutan = formData.get("urutan");
    const file = formData.get("image");

    const stringFields: [string, FormDataEntryValue | null][] = [
        ["wilayah_kerja", wilayah_kerja],
        ["kategori", kategori],
        ["sub_kategori", sub_kategori],
    ];
    for (const [name, value] of stringFields) {
        if (typeof value !== "string" || !value.trim()) {
            return NextResponse.json({ error: `Field "${name}" wajib diisi.`, code: "VALIDATION_ERROR" }, { status: 400 });
        }
    }

    if (typeof medali !== "string" || !VALID_MEDALI.includes(medali as any)) {
        return NextResponse.json({ error: 'Field "medali" harus salah satu dari: gold, silver, bronze.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    let urutanNumber = 0;
    if (urutan !== null) {
        const parsed = Number(urutan);
        if (!Number.isInteger(parsed) || parsed < 0) {
            return NextResponse.json({ error: 'Field "urutan" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        urutanNumber = parsed;
    }

    const { data: existing } = await supabase
        .from("achievement_kehumasan")
        .select("id, image_path")
        .eq("id", id)
        .single();
    if (!existing) return NextResponse.json({ error: "Data tidak ditemukan.", code: "NOT_FOUND" }, { status: 404 });

    let imagePath: string | null = existing.image_path;
    let oldImageToDelete: string | null = null;

    if (file instanceof File && file.size > 0) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.", code: "VALIDATION_ERROR" }, { status: 400 });
        }

        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const storagePath = `${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
            .from("achievement-photos")
            .upload(storagePath, file, { contentType: file.type, upsert: false });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message, code: "SERVER_ERROR" }, { status: 500 });
        }

        oldImageToDelete = existing.image_path;
        imagePath = storagePath;
    }

    const { data, error } = await supabase
        .from("achievement_kehumasan")
        .update({
            wilayah_kerja,
            kategori,
            sub_kategori,
            medali,
            urutan: urutanNumber,
            image_path: imagePath,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    if (oldImageToDelete) {
        await supabase.storage.from("achievement-photos").remove([oldImageToDelete]);
    }

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "update", entity_type: "achievement_kehumasan", entity_label: wilayah_kerja as string,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const { data: existing } = await supabase
        .from("achievement_kehumasan")
        .select("wilayah_kerja, image_path")
        .eq("id", id)
        .single();
    if (!existing) return NextResponse.json({ error: "Data tidak ditemukan.", code: "NOT_FOUND" }, { status: 404 });

    const { error } = await supabase.from("achievement_kehumasan").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    if (existing.image_path) {
        await supabase.storage.from("achievement-photos").remove([existing.image_path]);
    }

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "delete", entity_type: "achievement_kehumasan", entity_label: existing?.wilayah_kerja ?? id,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ success: true });
}