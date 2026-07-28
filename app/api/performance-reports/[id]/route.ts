import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/performance-reports/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return NextResponse.json(
            { error: "Hanya admin yang bisa menghapus laporan." },
            { status: 403 }
        );
    }

    const { data: report, error: fetchError } = await supabase
        .from("performance_reports")
        .select("file_path")
        .eq("id", id)
        .single();

    if (fetchError || !report) {
        return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    await supabase.storage.from("performance-reports").remove([report.file_path]);

    const { error: deleteError } = await supabase
        .from("performance_reports")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// PATCH /api/performance-reports/[id]
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return NextResponse.json(
            { error: "Hanya admin yang bisa mengedit laporan." },
            { status: 403 }
        );
    }

    const { data: existingReport, error: fetchError } = await supabase
        .from("performance_reports")
        .select("file_path")
        .eq("id", id)
        .single();

    if (fetchError || !existingReport) {
        return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const reportDate = formData.get("report_date");
    const category = formData.get("category");

    const updateData: {
        title?: string;
        report_date?: string;
        file_path?: string;
        file_name?: string;
        file_size?: number;
        category?: string;
        updated_by: string;
        updated_at: string;
    } = {
        updated_by: user.id,
        updated_at: new Date().toISOString(),
    };

    if (typeof reportDate === "string" && reportDate) {
        updateData.report_date = reportDate;
    }

    const VALID_CATEGORIES = ["weekly", "biweekly", "monthly", "others"];
    if (typeof category === "string" && category) {
        if (!VALID_CATEGORIES.includes(category)) {
            return NextResponse.json({ error: "Kategori laporan tidak valid." }, { status: 400 });
        }
        updateData.category = category;
    }

    let oldFilePathToDelete: string | null = null;

    if (file instanceof File) {
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

        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const newDate = typeof reportDate === "string" && reportDate ? reportDate : existingReport.file_path.split("/")[0];
        const storagePath = `${newDate}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
            .from("performance-reports")
            .upload(storagePath, file, {
                contentType: "application/pdf",
                upsert: false,
            });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        updateData.title = file.name.replace(/\.pdf$/i, "");
        updateData.file_path = storagePath;
        updateData.file_name = file.name;
        updateData.file_size = file.size;
        oldFilePathToDelete = existingReport.file_path;
    }

    const { data: updated, error: updateError } = await supabase
        .from("performance_reports")
        .update(updateData)
        .eq("id", id)
        .select("id, title, report_date, file_name, file_size, created_at, uploaded_by:profiles!performance_reports_uploaded_by_fkey(full_name),updated_at, updated_by:profiles!performance_reports_updated_by_fkey(full_name), category")
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (oldFilePathToDelete) {
        await supabase.storage.from("performance-reports").remove([oldFilePathToDelete]);
    }

    return NextResponse.json({ report: updated });
}