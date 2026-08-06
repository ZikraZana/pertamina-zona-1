import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_rencana_kerja")
        .select('id, jenis_rk, nama_rk, jumlah_minyak, jumlah_gas, wilayah_kerja, urutan')
        .order('urutan', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 })
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
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

    const { jumlah_minyak, jumlah_gas, urutan } = body;

    const isValidAmount = (value: unknown) =>
        value === null || value === undefined || (typeof value === "number" && Number.isFinite(value) && value >= 0);

    if (!isValidAmount(jumlah_minyak)) {
        return NextResponse.json({ error: 'Field "jumlah_minyak" harus berupa angka dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (!isValidAmount(jumlah_gas)) {
        return NextResponse.json({ error: 'Field "jumlah_gas" harus berupa angka dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if ((jumlah_minyak === null || jumlah_minyak === undefined) && (jumlah_gas === null || jumlah_gas === undefined)) {
        return NextResponse.json({ error: 'Isi minimal salah satu dari "jumlah_minyak" atau "jumlah_gas".', code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (urutan !== undefined && (typeof urutan !== "number" || !Number.isInteger(urutan) || urutan < 0)) {
        return NextResponse.json({ error: 'Field "urutan" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("achievement_rencana_kerja")
        .insert({
            jenis_rk: body.jenis_rk,
            nama_rk: body.nama_rk,
            jumlah_minyak: jumlah_minyak ?? null,
            jumlah_gas: jumlah_gas ?? null,
            wilayah_kerja: body.wilayah_kerja,
            urutan: urutan ?? 0,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message, code: "SERVER_ERROR" }, { status: 500 });

    const { error: logError } = await supabase.from("activity_logs").insert({
        actor_id: user.id, action: "insert", entity_type: "achievement_rencana_kerja", entity_label: body.nama_rk,
    });
    if (logError) console.error("Gagal mencatat activity log:", logError.message);

    return NextResponse.json({ data }, { status: 201 });
}