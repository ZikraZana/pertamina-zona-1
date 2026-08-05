import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, err: NextResponse.json({ error: "Silakan login." }, { status: 401 }) };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return { user, err: NextResponse.json({ error: "Hanya admin." }, { status: 403 }) };
    return { user, err: null };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "update", entity_type: "achievement_rencana_kerja", entity_label: body.nama_rk,
    });

    return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const { data: existing } = await supabase.from("achievement_rencana_kerja").select("nama_rk").eq("id", id).single();

    const { error } = await supabase.from("achievement_rencana_kerja").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "delete", entity_type: "achievement_rencana_kerja", entity_label: existing?.nama_rk ?? id,
    });

    return NextResponse.json({ success: true });
}