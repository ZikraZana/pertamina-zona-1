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
        .from("achievement_inovasi")
        .update({
            pencapaian: body.pencapaian,
            nama_inovasi: body.nama_inovasi,
            nama_acara: body.nama_acara,
            wilayah_kerja: body.wilayah_kerja,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "update", entity_type: "achievement_inovasi", entity_label: body.nama_inovasi,
    });

    return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const { data: existing } = await supabase.from("achievement_inovasi").select("nama_inovasi").eq("id", id).single();

    const { error } = await supabase.from("achievement_inovasi").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("activity_logs").insert({
        actor_id: user!.id, action: "delete", entity_type: "achievement_inovasi", entity_label: existing?.nama_inovasi ?? id,
    });

    return NextResponse.json({ success: true });
}