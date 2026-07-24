import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("weekly_reports")
        .select("id, title, report_date, file_name, file_size, created_at")
        .order("report_date", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reports: data });
}

export async function POST(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Silahkan login terlebih dahulu." }, { status: 401 })
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return NextResponse.json(
            { error: "Hanya admin yang bisa mengunggah weekly report." },
            { status: 403 }
        )
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    const reportDate = formData.get("report_date");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "File PDF Wajib diisi" }, { status: 400 })
    }
    if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "File harus berformat PDF." }, { status: 400 });
    }
    if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Judul laporan wajib diisi." }, { status: 400 });
    }
    if (typeof reportDate !== "string" || !reportDate) {
        return NextResponse.json({ error: "Tanggal laporan wajib diisi." }, { status: 400 });
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `${reportDate}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
        .from("weekly-reports")
        .upload(storagePath, file, {
            contentType: "application/pdf",
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: inserted, error: insertError } = await supabase
        .from("weekly_reports")
        .insert({
            title: title.trim(),
            report_date: reportDate,
            file_path: storagePath,
            file_name: file.name,
            file_size: file.size,
            uploaded_by: user.id,
        })
        .select("id, title, report_date, file_name, file_size, created_at")
        .single();

    if (insertError) {
        await supabase.storage.from("weekly-reports").remove([storagePath]);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ report: inserted }, { status: 201 });

}