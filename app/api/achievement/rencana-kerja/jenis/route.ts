import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

// PATCH — rename semua item dengan jenis_rk lama jadi jenis_rk baru
export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });

    const { jenis_lama, jenis_baru } = body;

    if (typeof jenis_lama !== "string" || !jenis_lama.trim()) {
        return NextResponse.json({ error: 'Field "jenis_lama" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (typeof jenis_baru !== "string" || !jenis_baru.trim()) {
        return NextResponse.json({ error: 'Field "jenis_baru" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("achievement_rencana_kerja")
        .update({ jenis_rk: jenis_baru.trim() })
        .eq("jenis_rk", jenis_lama)
        .select();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id,
        action: "update",
        entity_type: "achievement_rencana_kerja_jenis",
        entity_label: `${jenis_lama} → ${jenis_baru}`,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data, affected: data?.length ?? 0 });
}

// DELETE — hapus semua item dengan jenis_rk tertentu
export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get("jenis");

    if (!jenis) {
        return NextResponse.json({ error: 'Parameter "jenis" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data: existing } = await supabase
        .from("achievement_rencana_kerja")
        .select("id")
        .eq("jenis_rk", jenis);

    const { error } = await supabase
        .from("achievement_rencana_kerja")
        .delete()
        .eq("jenis_rk", jenis);

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user!.id,
        action: "delete",
        entity_type: "achievement_rencana_kerja_jenis",
        entity_label: `${jenis} (${existing?.length ?? 0} item)`,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ success: true, deleted: existing?.length ?? 0 });
}