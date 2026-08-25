import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

// Kategori "Others" di Top Project — untuk pencapaian yang nggak masuk
// Pencapaian Naratif ataupun ABI NBD. Strukturnya sama seperti top-project-naratif.

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_top_project_others")
        .select('id, title, detail, urutan')
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

    const stringFields = ["title", "detail"] as const;
    for (const field of stringFields) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
            return NextResponse.json({ error: `Field "${field}" wajib diisi.`, code: "VALIDATION_ERROR" }, { status: 400 });
        }
    }

    const { urutan } = body;
    if (urutan !== undefined && (typeof urutan !== "number" || !Number.isInteger(urutan) || urutan < 0)) {
        return NextResponse.json({ error: 'Field "urutan" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("achievement_top_project_others")
        .insert({
            title: body.title,
            detail: body.detail,
            urutan: urutan ?? 0,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user.id, action: "insert", entity_type: "achievement_top_project_others", entity_label: body.title,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data }, { status: 201 });
}