import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_hsse_others")
        .select("*")
        .order("urutan", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();

    const { indikator, realisasi, satuan, periode, tahun_target, target_others, urutan } = body;

    if (!indikator || realisasi === undefined || !satuan || !periode || !tahun_target || target_others === undefined) {
        return NextResponse.json({ error: "Field tidak lengkap" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("achievement_hsse_others")
        .insert({ indikator, realisasi, satuan, periode, tahun_target, target_others, urutan: urutan ?? 0 })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
}