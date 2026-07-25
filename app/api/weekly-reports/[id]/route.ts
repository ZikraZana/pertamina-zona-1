import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/weekly-reports/[id]
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
            { error: "Hanya admin yang bisa menghapus weekly report." },
            { status: 403 }
        );
    }

    const { data: report, error: fetchError } = await supabase
        .from("weekly_reports")
        .select("file_path")
        .eq("id", id)
        .single();

    if (fetchError || !report) {
        return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    await supabase.storage.from("weekly-reports").remove([report.file_path]);

    const { error: deleteError } = await supabase
        .from("weekly_reports")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// PATCH /api/weekly-reports/[id]
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
            { error: "Hanya admin yang bisa mengedit weekly report." },
            { status: 403 }
        );
    }

    const { data: existingReport, error: fetchError } = await supabase
        .from("weekly_reports")
        .select("file_path")
        .eq("id", id)
        .single();

    if (fetchError || !existingReport) {
        return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const reportDate = formData.get("report_date");

    const updateData: {
        report_date?: string;
        file_path?: string;
        file_name?: string;
        file_size?: number;
        updated_by: string;
        updated_at: string;
    } = {
        updated_by: user.id,
        updated_at: new Date().toISOString(),
    };

    if (typeof reportDate === "string" && reportDate) {
        updateData.report_date = reportDate;
    }

    let oldFilePathToDelete: string | null = null;

    if (file instanceof File) {
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "File harus berformat PDF." }, { status: 400 });
        }

        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const newDate = typeof reportDate === "string" && reportDate ? reportDate : existingReport.file_path.split("/")[0];
        const storagePath = `${newDate}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
            .from("weekly-reports")
            .upload(storagePath, file, {
                contentType: "application/pdf",
                upsert: false,
            });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        updateData.file_path = storagePath;
        updateData.file_name = file.name;
        updateData.file_size = file.size;
        oldFilePathToDelete = existingReport.file_path;
    }

    const { data: updated, error: updateError } = await supabase
        .from("weekly_reports")
        .update(updateData)
        .eq("id", id)
        .select("id, title, report_date, file_name, file_size, created_at, updated_at")
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (oldFilePathToDelete) {
        await supabase.storage.from("weekly-reports").remove([oldFilePathToDelete]);
    }

    return NextResponse.json({ report: updated });
}