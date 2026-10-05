import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";


export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { user, err } = await requireAdmin(supabase);
    if (err) return err;
    const body = await request.json();

    const { indikator, realisasi, satuan, periode, tahun_target, target_others, urutan } = body;

    const { data, error } = await supabase
        .from("achievement_hsse_others")
        .update({ indikator, realisasi, satuan, periode, tahun_target, target_others, urutan, updated_at: new Date().toISOString(), updated_by: user.id })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
        .from("achievement_hsse_others")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}