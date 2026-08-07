import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

const VALID_MEDALI = ["gold", "silver", "bronze"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });

    const stringFields = ["wilayah_kerja", "kategori", "sub_kategori"] as const;
    for (const field of stringFields) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
            return NextResponse.json({ error: `Field "${field}" wajib diisi.`, code: "VALIDATION_ERROR" }, { status: 400 });
        }
    }

    if (!VALID_MEDALI.includes(body.medali)) {
        return NextResponse.json({ error: 'Field "medali" harus salah satu dari: gold, silver, bronze.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { urutan } = body;
    if (urutan !== undefined && (typeof urutan !== "number" || !Number.isInteger(urutan) || urutan < 0)) {
        return NextResponse.json({ error: 'Field "urutan" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data: existing } = await supabase.from("achievement_kehumasan").select("id").eq("id", id).single();
    if (!existing) return NextResponse.json({ error: "Data tidak ditemukan.", code: "NOT_FOUND" }, { status: 404 });

    const { data, error } = await supabase
        .from("achievement_kehumasan")
        .update({
            wilayah_kerja: body.wilayah_kerja,
            kategori: body.kategori,
            sub_kategori: body.sub_kategori,
            medali: body.medali,
            urutan: urutan ?? 0,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "update", entity_type: "achievement_kehumasan", entity_label: body.wilayah_kerja,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const { data: existing } = await supabase.from("achievement_kehumasan").select("wilayah_kerja").eq("id", id).single();
    if (!existing) return NextResponse.json({ error: "Data tidak ditemukan.", code: "NOT_FOUND" }, { status: 404 });

    const { error } = await supabase.from("achievement_kehumasan").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "delete", entity_type: "achievement_kehumasan", entity_label: existing?.wilayah_kerja ?? id,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ success: true });
}