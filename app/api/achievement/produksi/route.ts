import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/achievement/produksi — publik, tampil di halaman /achievements
export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_produksi")
        .select("jenis, realisasi, target, periode, unit");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

// PATCH /api/achievement/produksi — admin only, update salah satu jenis
export async function PATCH(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Hanya admin yang bisa mengubah data ini." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
    }

    const { jenis, realisasi, target, periode, unit } = body;

    if (!["minyak", "gas"].includes(jenis)) {
        return NextResponse.json({ error: "Jenis tidak valid." }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("achievement_produksi")
        .update({
            realisasi,
            target,
            periode,
            unit,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
        })
        .eq("jenis", jenis)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("activity_logs").insert({
        actor_id: user.id,
        action: "update",
        entity_type: "achievement_produksi",
        entity_label: `Produksi ${jenis}`,
    });

    return NextResponse.json({ data });
}