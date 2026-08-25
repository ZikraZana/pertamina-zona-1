import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

// GET: ambil semua data HSSE - Others
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("achievement_hsse_others")
            .select("*")
            .order("urutan", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal mengambil data HSSE others:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal mengambil data HSSE others" },
            { status: 500 }
        );
    }
}

// POST: tambah data HSSE - Others baru
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        const { user, err } = await requireAdmin(supabase);
        if (err) return err;

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });
        }
        const { judul, wilayah_kerja, tanggal, urutan } = body;

        if (typeof judul !== "string" || !judul.trim()) {
            return NextResponse.json({ error: 'Field "judul" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        if (typeof wilayah_kerja !== "string" || !wilayah_kerja.trim()) {
            return NextResponse.json({ error: 'Field "wilayah_kerja" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        if (typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
            return NextResponse.json({ error: 'Field "tanggal" harus berupa tanggal yang valid.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        let urutanNumber = 0;
        if (urutan !== undefined && urutan !== null) {
            const parsed = Number(urutan);
            if (!Number.isInteger(parsed) || parsed < 0) {
                return NextResponse.json({ error: 'Field "urutan" harus berupa bilangan bulat dan tidak boleh negatif.', code: "VALIDATION_ERROR" }, { status: 400 });
            }
            urutanNumber = parsed;
        }

        const { data, error } = await supabase
            .from("achievement_hsse_others")
            .insert([{
                judul,
                wilayah_kerja,
                tanggal,
                urutan: urutanNumber,
                created_by: user.id,
            }])
            .select()
            .single();

        if (error) throw error;

        const { error: logError } = await supabase.from("activity_logs").insert({
            actor_id: user!.id,
            action: "insert",
            entity_type: "achievement_hsse_others",
            entity_label: judul,
        });
        if (logError) console.error("Gagal mencatat activity log:", logError.message);

        return NextResponse.json({ data }, { status: 201 });
    } catch (err: any) {
        console.error("Gagal menambah data HSSE others:", err);
        return NextResponse.json({ error: err.message ?? "Gagal menambah data HSSE others" }, { status: 500 });
    }
}