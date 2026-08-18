import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_top_project_abi")
        .select('id, title, unit, realisasi, target, periode, urutan')
        .order('urutan', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { user, err } = await requireAdmin(supabase);
    if (err) return err;

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });

    const stringFields = ["title", "unit", "periode"] as const;
    for (const field of stringFields) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
            return NextResponse.json({ error: `Field "${field}" wajib diisi.`, code: "VALIDATION_ERROR" }, { status: 400 });
        }
    }

    const { realisasi, target, urutan } = body;
    const isValidNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0;

    if (!isValidNumber(realisasi)) {
        return NextResponse.json({ error: 'Field "realisasi" harus berupa angka dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (!isValidNumber(target)) {
        return NextResponse.json({ error: 'Field "target" harus berupa angka dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (urutan !== undefined && (typeof urutan !== "number" || !Number.isInteger(urutan) || urutan < 0)) {
        return NextResponse.json({ error: 'Field "urutan" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("achievement_top_project_abi")
        .insert({
            title: body.title,
            unit: body.unit,
            realisasi,
            target,
            periode: body.periode,
            urutan: urutan ?? 0,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user.id, action: "insert", entity_type: "achievement_top_project_abi", entity_label: body.title,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data }, { status: 201 });
}