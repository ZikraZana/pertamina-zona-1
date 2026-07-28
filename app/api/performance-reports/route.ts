import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabase = await createClient();

    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    let query = supabase
        .from("performance_reports")
        .select("id, title, report_date, file_name, file_size, created_at, updated_at, uploaded_by:profiles!performance_reports_uploaded_by_fkey(full_name), updated_by:profiles!performance_reports_updated_by_fkey(full_name), category")
        .order("report_date", { ascending: false });

    if (category) {
        query = query.eq("category", category);
    }

    const { data, error } = await query;

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
            { error: "Hanya admin yang bisa mengunggah laporan." },
            { status: 403 }
        )
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const reportDate = formData.get("report_date");
    const category = formData.get("category")

    const VALID_CATEGORIES = ["weekly", "biweekly", "monthly", "others"];
    if (typeof category !== "string" || !VALID_CATEGORIES.includes(category)) {
        return NextResponse.json({ error: "Kategori laporan tidak valid." }, { status: 400 });
    }

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "File PDF Wajib diisi." }, { status: 400 })
    }
    const ALLOWED_TYPES = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Format file tidak didukung." }, { status: 400 });
    }

    const title = file.name.replace(/\.pdf$/i, "");

    if (typeof reportDate !== "string" || !reportDate) {
        return NextResponse.json({ error: "Tanggal laporan wajib diisi." }, { status: 400 });
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `${reportDate}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
        .from("performance-reports")
        .upload(storagePath, file, {
            contentType: "application/pdf",
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: inserted, error: insertError } = await supabase
        .from("performance_reports")
        .insert({
            title: title,
            report_date: reportDate,
            file_path: storagePath,
            file_name: file.name,
            file_size: file.size,
            uploaded_by: user.id,
            category: category,
        })
        .select("id, title, report_date, file_name, file_size, created_at, category, uploaded_by:profiles!performance_reports_uploaded_by_fkey(full_name)")
        .single();

    if (insertError) {
        await supabase.storage.from("performance-reports").remove([storagePath]);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ report: inserted }, { status: 201 });

}