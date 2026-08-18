import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

// GET: ambil semua data proper
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("achievement_hsse_proper")
            .select("*")
            .order("urutan", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Gagal mengambil data proper:", err);
        return NextResponse.json(
            { error: err.message ?? "Gagal mengambil data proper" },
            { status: 500 }
        );
    }
}

// POST: tambah data proper baru
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        const { user, err } = await requireAdmin(supabase);
        if (err) return err;

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });
        }
        const { wilayah_kerja, peringkat, tahun, keterangan, urutan } = body;

        if (typeof wilayah_kerja !== "string" || !wilayah_kerja.trim()) {
            return NextResponse.json({ error: 'Field "wilayah_kerja" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        if (typeof peringkat !== "string" || !peringkat.trim()) {
            return NextResponse.json({ error: 'Field "peringkat" wajib diisi.', code: "VALIDATION_ERROR" }, { status: 400 });
        }
        const tahunNumber = Number(tahun);
        if (!Number.isInteger(tahunNumber) || tahunNumber < 1900) {
            return NextResponse.json({ error: 'Field "tahun" harus berupa tahun yang valid.', code: "VALIDATION_ERROR" }, { status: 400 });
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
            .from("achievement_hsse_proper")
            .insert([{
                wilayah_kerja,
                peringkat,
                tahun: tahunNumber,
                keterangan: keterangan ?? null,
                urutan: urutanNumber,
                created_by: user.id,
            }])
            .select()
            .single();

        if (error) throw error;

        const { error: logError } = await supabase.from("activity_logs").insert({
            actor_id: user!.id,
            action: "insert",
            entity_type: "achievement_hsse_proper",
            entity_label: `Proper ${wilayah_kerja} ${tahunNumber}`,
        });
        if (logError) console.error("Gagal mencatat activity log:", logError.message);

        return NextResponse.json({ data }, { status: 201 });
    } catch (err: any) {
        console.error("Gagal menambah data proper:", err);
        return NextResponse.json({ error: err.message ?? "Gagal menambah data proper" }, { status: 500 });
    }
}