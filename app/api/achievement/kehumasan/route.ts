import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const VALID_MEDALI = ["gold", "silver", "bronze"] as const;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_kehumasan")
        .select('id, wilayah_kerja, kategori, sub_kategori, medali, urutan, urutan_wilayah, image_path')
        .order('urutan', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 })
    }

    // Konversi image_path (path relatif di bucket) jadi image_url (URL publik lengkap)
    // supaya frontend tinggal pakai langsung tanpa perlu tau apa-apa soal Supabase Storage.
    const dataWithUrl = (data ?? []).map((row) => {
        let image_url: string | null = null;
        if (row.image_path) {
            const { data: publicUrlData } = supabase.storage
                .from("achievement-photos")
                .getPublicUrl(row.image_path);
            image_url = publicUrlData.publicUrl;
        }
        return { ...row, image_url };
    });

    return NextResponse.json({ data: dataWithUrl });
}

export async function POST(request: Request) {
    const supabase = await createClient();

    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const formData = await request.formData();

    const wilayah_kerja = formData.get("wilayah_kerja");
    const kategori = formData.get("kategori");
    const sub_kategori = formData.get("sub_kategori");
    const medali = formData.get("medali");
    const urutan = formData.get("urutan");
    const urutan_wilayah = formData.get("urutan_wilayah");
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

    let urutanWilayahNumber = 0;
    if (urutan_wilayah !== null) {
        const parsed = Number(urutan_wilayah);
        if (!Number.isInteger(parsed) || parsed < 0) {
            return NextResponse.json({ error: 'Field "urutan_wilayah" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        urutanWilayahNumber = parsed;
    }

    let imagePath: string | null = null;
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

        imagePath = storagePath;
    }

    const { data, error } = await supabase
        .from("achievement_kehumasan")
        .insert({
            wilayah_kerja,
            kategori,
            sub_kategori,
            medali,
            urutan: urutanNumber,
            urutan_wilayah: urutanWilayahNumber,
            image_path: imagePath,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        if (imagePath) await supabase.storage.from("achievement-photos").remove([imagePath]);
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });
    }

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user.id, action: "insert", entity_type: "achievement_kehumasan", entity_label: wilayah_kerja as string,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data }, { status: 201 });
}