import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("achievement_kehumasan")
        .select('id, wilayah_kerja, kategori, sub_kategori, medali, urutan')
        .order('urutan', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message, code: "SERVER ERROR" }, { status: 500 })
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request){
    const supabase = await createClient();
    
    const {user, err} = await requireAdmin(supabase);
    if(err) return err;

    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Body tidak valid.", code: "VALIDATION_ERROR" }, { status: 400 });

}