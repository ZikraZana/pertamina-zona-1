import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { data: report, error: fetchError } = await supabase
        .from("weekly_reports")
        .select("file_path, file_name, title")
        .eq("id", id)
        .single();

    if (fetchError || !report) {
        return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const { data: signed, error: signError } = await supabase.storage
        .from("weekly-reports")
        .createSignedUrl(report.file_path, 60 * 5);

    if (signError || !signed) {
        return NextResponse.json(
            { error: signError?.message ?? "Gagal membuat link file." },
            { status: 500 }
        );
    }

    return NextResponse.json({
        url: signed.signedUrl,
        file_name: report.file_name,
        title: report.title,
    });
}