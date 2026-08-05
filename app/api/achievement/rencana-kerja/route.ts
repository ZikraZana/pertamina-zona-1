import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_rencana_kerja")
        .select('jenis_rk, nama_rk, jenis_produksi, jumlah_produksi, wilayah_kerja');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

    const { data, error } = await supabase
        .from("achievement_rencana_kerja")
        .insert({
            jenis_rk: body.jenis_rk,
            nama_rk: body.nama_rk,
            jenis_produksi: body.jenis_produksi,
            jumlah_produksi: body.jumlah_produksi,
            wilayah_kerja: body.wilayah_kerja,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("activity_logs").insert({
        actor_id: user.id, action: "insert", entity_type: "achievement_rencana_kerja", entity_label: body.nama_rk,
    });

    return NextResponse.json({ data }, { status: 201 });
}