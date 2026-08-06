import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, err: NextResponse.json({ error: "Silakan login.", code: "UNAUTHORIZED" }, { status: 401 }) };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return { user, err: NextResponse.json({ error: "Hanya admin.", code: "FORBIDDEN" }, { status: 403 }) };
    return { user, err: null };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });

    const stringFields = ["jenis_rk", "nama_rk", "wilayah_kerja"] as const;
    for (const field of stringFields) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
            return NextResponse.json({ error: `Field "${field}" wajib diisi.`, code: "VALIDATION_ERROR" }, { status: 400 });
        }
    }
    if (!["minyak", "gas"].includes(body.jenis_produksi)) {
        return NextResponse.json({ error: 'Field "jenis_produksi" harus "minyak" atau "gas".', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (typeof body.jumlah_produksi !== "number" || !Number.isFinite(body.jumlah_produksi) || body.jumlah_produksi < 0) {
        return NextResponse.json({ error: 'Field "jumlah_produksi" harus berupa angka dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("achievement_rencana_kerja")
        .update({
            jenis_rk: body.jenis_rk,
            nama_rk: body.nama_rk,
            jenis_produksi: body.jenis_produksi,
            jumlah_produksi: body.jumlah_produksi,
            wilayah_kerja: body.wilayah_kerja,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "update", entity_type: "achievement_rencana_kerja", entity_label: body.nama_rk,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const { data: existing } = await supabase.from("achievement_rencana_kerja").select("nama_rk").eq("id", id).single();

    const { error } = await supabase.from("achievement_rencana_kerja").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "delete", entity_type: "achievement_rencana_kerja", entity_label: existing?.nama_rk ?? id,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ success: true });
}