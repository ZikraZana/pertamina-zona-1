"use client"

import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react"

// ============================================================
// TIPE DATA LAPORAN
// ============================================================

type PerformanceReport = {
    id: string;
    title: string;
    report_date: string; // YYYY-MM-DD
    file_name: string;
    file_size: number | null;
    category: "weekly" | "biweekly" | "monthly" | "others";
    updated_at: string;
    uploaded_by: { full_name: string | null } | null;
    updated_by: { full_name: string | null } | null;
};

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const CATEGORY_TABS: { label: string; value: "weekly" | "biweekly" | "monthly" | "others" | null }[] = [
    { label: "Semua", value: null },
    { label: "Weekly", value: "weekly" },
    { label: "Biweekly", value: "biweekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Others", value: "others" },
];

function toDateKey(year: number, month: number, day: number) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

function formatDateLong(dateStr: string) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatFileSize(bytes: number | null) {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

function getCategoryLabel(category: string) {
    return CATEGORY_TABS.find((tab) => tab.value === category)?.label ?? category;
}

const PerformanceContent = () => {
    // ============================================================
    // STATE & LOGIC AUTH — PERSIS SEPERTI YANG SUDAH KAMU TULIS,
    // TIDAK DIUBAH SAMA SEKALI.
    // ============================================================
    const supabase = useMemo(() => createClient(), []);

    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState<string | null>(null);
    const [role, setRole] = useState<"admin" | "user" | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setLoginError("Email atau password salah");
        }
    }
    async function handleLogout() {
        setLoginError(null);

        const { error } = await supabase.auth.signOut();

        if (error) {
            setLoginError("Gagal Logout");
        }
    }

    useEffect(() => {
        async function checkLogin() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user?.id)
                .single();

            if (profile?.role == "admin") {
                setRole("admin")
            } else {
                setRole("user")
            }

            setAuthLoading(false);
        }
        checkLogin();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            checkLogin();
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [supabase]);


    // ============================================================
    // STATE BARU — untuk kalender, panel, dan modal preview.
    // ============================================================
    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
    const [previewReport, setPreviewReport] = useState<PerformanceReport | null>(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [reports, setReports] = useState<PerformanceReport[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<"weekly" | "biweekly" | "monthly" | "others" | null>(null);
    const isMonthlyMode = activeCategory === "monthly";


    async function fetchReports() {
        const url = activeCategory
            ? `/api/performance-reports?category=${activeCategory}`
            : "/api/performance-reports";
        const res = await fetch(url);
        const json = await res.json();
        setReports(json.reports)
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (previewReport) return;
            if (calendarPanelRef.current && !calendarPanelRef.current.contains(e.target as Node)) {
                setSelectedDateKey(null);
                setSelectedMonthIndex(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [previewReport]);

    useEffect(() => {
        if (!user) return;
        fetchReports();
    }, [user, activeCategory])

    const reportsByMonth = useMemo(() => {
        const map = new Map<number, PerformanceReport[]>();
        for (const report of reports) {
            const reportDate = new Date(`${report.report_date}T00:00:00`);
            if (reportDate.getFullYear() !== viewYear) continue;
            const list = map.get(reportDate.getMonth()) ?? [];
            list.push(report);
            map.set(reportDate.getMonth(), list);
        }
        return map;
    }, [reports, viewYear]);

    // Peta tanggal -> laporan, untuk lookup cepat di kalender
    const reportsByDate = useMemo(() => {
        const map = new Map<string, PerformanceReport[]>();
        for (const report of reports) {
            const list = map.get(report.report_date) ?? [];
            list.push(report);
            map.set(report.report_date, list);
        }
        return map;
    }, [reports]);

    const reportsInCurrentMonth = useMemo(() => {
        return reports.filter((report) => {
            const reportDate = new Date(`${report.report_date}T00:00:00`);
            return reportDate.getFullYear() === viewYear && reportDate.getMonth() === viewMonth;
        });
    }, [reports, viewYear, viewMonth]);



    const currentMonthReportsByCategory = useMemo(() => {
        const map = new Map<string, PerformanceReport[]>();
        for (const report of reportsInCurrentMonth) {
            const list = map.get(report.category) ?? [];
            list.push(report);
            map.set(report.category, list);
        }
        return map;
    }, [reportsInCurrentMonth]);

    const reportsInCurrentYear = useMemo(() => {
        return reports.filter((report) => {
            const reportDate = new Date(`${report.report_date}T00:00:00`);
            return reportDate.getFullYear() === viewYear;
        });
    }, [reports, viewYear]);

    const currentYearReportsByCategory = useMemo(() => {
        const map = new Map<string, PerformanceReport[]>();
        for (const report of reportsInCurrentYear) {
            const list = map.get(report.category) ?? [];
            list.push(report);
            map.set(report.category, list);
        }
        return map;
    }, [reportsInCurrentYear]);

    const selectedMonthReports = selectedMonthIndex !== null
        ? reportsByMonth.get(selectedMonthIndex) ?? []
        : [];

    const selectedMonthReportsByCategory = useMemo(() => {
        const map = new Map<string, PerformanceReport[]>();
        for (const report of selectedMonthReports) {
            const list = map.get(report.category) ?? [];
            list.push(report);
            map.set(report.category, list);
        }
        return map;
    }, [selectedMonthReports]);

    const selectedDateReports = selectedDateKey ? reportsByDate.get(selectedDateKey) ?? [] : [];

    const selectedDateReportsByCategory = useMemo(() => {
        const map = new Map<string, PerformanceReport[]>();
        for (const report of selectedDateReports) {
            const list = map.get(report.category) ?? [];
            list.push(report);
            map.set(report.category, list);
        }
        return map;
    }, [selectedDateReports]);

    function goToPrevMonth() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    }

    function goToNextMonth() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    }

    function goToPrevYear() {
        setViewYear((y) => y - 1);
    }

    function goToNextYear() {
        setViewYear((y) => y + 1);
    }

    const calendarCells = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const cells: { day: number | null; dateKey: string | null }[] = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push({ day: null, dateKey: null });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            cells.push({ day, dateKey: toDateKey(viewYear, viewMonth, day) });
        }
        while (cells.length % 7 !== 0) {
            cells.push({ day: null, dateKey: null });
        }
        return cells;
    }, [viewYear, viewMonth]);

    const monthCells = useMemo(() => {
        return MONTH_NAMES.map((name, index) => ({
            monthIndex: index,
            label: name,
        }));
    }, []);



    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());


    function handleDateClick(dateKey: string) {
        setSelectedDateKey(dateKey);
    }

    async function openPreview(report: PerformanceReport) {
        setPreviewReport(report);
        setPreviewUrl(null);
        setPreviewError(null);
        setPreviewLoading(true);
        try {
            const res = await fetch(`/api/performance-reports/${report.id}/download`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Gagal membuka file.");
            setPreviewUrl(json.url);
        } catch (err) {
            setPreviewError(err instanceof Error ? err.message : "Gagal membuka file.");
        } finally {
            setPreviewLoading(false);
        }
    }

    async function handleDownload() {
        if (!previewUrl || !previewReport) return;

        setDownloadLoading(true);
        try {
            const res = await fetch(previewUrl);
            if (!res.ok) throw new Error("Gagal mengunduh file.");
            const blob = await res.blob();

            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = previewReport.file_name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            setPreviewError(err instanceof Error ? err.message : "Gagal mengunduh file.");
        } finally {
            setDownloadLoading(false);
        }
    }

    function closePreview() {
        setPreviewReport(null);
        setPreviewUrl(null);
        setPreviewError(null);
        setIsEditing(false);
    }

    const [uploadDate, setUploadDate] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editDate, setEditDate] = useState("");
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editCategory, setEditCategory] = useState<"weekly" | "biweekly" | "monthly" | "others">("weekly");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [category, setCategory] = useState<"weekly" | "biweekly" | "monthly" | "others">("weekly");
    const reportRefs = useRef<Map<string, HTMLLIElement>>(new Map());
    const calendarPanelRef = useRef<HTMLDivElement>(null);



    function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault();   // wajib, biar browser tidak buka file-nya sendiri
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (!droppedFile) return;

        // if (droppedFile.type !== "application/pdf") {
        //     setUploadError("File harus berformat PDF.");
        //     return;
        // }

        setUploadError(null);
        setUploadFile(droppedFile);
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        setUploadError(null);
        setUploadSuccess(null);

        if (!uploadFile) {
            setUploadError("Pilih File PDF terlebih dahulu")
            return;
        }
        if (!uploadDate) {
            setUploadError("Tanggal Laporan wajib diisi")
            return;
        }

        setUploadLoading(true);

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("report_date", uploadDate);
        formData.append("category", category);

        const res = await fetch("/api/performance-reports", {
            method: "POST",
            body: formData,
        });

        const json = await res.json();

        if (!res.ok) {
            setUploadError(json.error ?? "Gagal mengunggah laporan")
            setUploadLoading(false)
            return;
        }

        await fetchReports();
        setUploadDate("");
        setUploadFile(null);
        setUploadLoading(false);
        setUploadSuccess("Laporan berhasil diunggah.");
    }

    async function handleDelete() {
        if (!previewReport) return;

        // konfirmasi dulu, biar nggak kehapus tanpa sengaja
        const confirmed = window.confirm(`Hapus laporan "${previewReport.title}"?`);
        if (!confirmed) return;

        // ... lanjutin sendiri: fetch ke /api/performance-reports/${previewReport.id}
        // dengan method DELETE, cek hasilnya, kalau sukses tutup modal & fetchReports() ulang

        const res = await fetch(`/api/performance-reports/${previewReport.id}`, {
            method: 'DELETE',
        })
        const json = await res.json()

        if (!res.ok) {
            setPreviewError(json.error ?? "Gagal menghapus laporan")
            return;
        }
        closePreview();
        await fetchReports();
    }

    function startEdit() {
        if (!previewReport) return;
        setEditDate(previewReport.report_date);
        setEditCategory(previewReport.category);
        setEditFile(null);
        setEditError(null);
        setIsEditing(true);
    }

    async function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!previewReport) return;

        setEditError(null);

        if (!editDate) {
            setEditError("Tanggal Laporan wajib diisi")
            return;
        }

        setEditLoading(true);

        const formData = new FormData();
        formData.append("report_date", editDate);
        formData.append("category", editCategory);
        if (editFile) formData.append("file", editFile);


        const res = await fetch(`/api/performance-reports/${previewReport.id}`, {
            method: 'PATCH',
            body: formData
        })

        const json = await res.json();

        if (!res.ok) {
            setEditError(json.error ?? "Gagal mengedit laporan")
            setEditLoading(false)
            return;
        }

        setPreviewReport(json.report);
        setIsEditing(false);
        setEditLoading(false)
        await fetchReports();

    }


    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="mx-auto mb-4 w-full max-w-5xl">
                <h1 className="group relative z-10 mb-1 w-fit cursor-default bg-linear-to-b from-blue-900 to-blue-500 bg-clip-text text-xl font-bold text-transparent transition-transform duration-300 ease-out hover:-translate-y-1 sm:text-2xl lg:text-3xl">
                    Performance Report
                </h1>
                <p className="text-sm text-blue-900/70">
                    Lihat dan unduh laporan kinerja Pertamina Hulu Rokan Zona 1 lewat kalender di bawah ini.
                </p>
            </div>

            {authLoading && (
                <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-lg">
                    Memuat...
                </div>
            )}

            {/* ================= Belum login ================= */}
            {!authLoading && !user && (
                <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
                    <p className="mb-4 text-sm text-slate-600">
                        Silakan login untuk melihat laporan.
                    </p>
                    <form onSubmit={handleLogin} className="flex flex-col gap-3 text-left">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                placeholder="nama@perusahaan.com"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                        {loginError && <p className="text-xs font-medium text-red-600">{loginError}</p>}
                        <button
                            type="submit"
                            className="mt-1 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                        >
                            Masuk
                        </button>
                    </form>
                </div>
            )}

            {/* ================= Sudah login ================= */}
            {!authLoading && user && (
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                    {/* User info bar */}
                    <div className="flex flex-col items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
                        <div className="text-sm text-slate-600">
                            Masuk sebagai <span className="font-semibold text-blue-900">{user.email}</span>
                            {role === "admin" && (
                                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                    Admin
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {role === "admin" && (
                                <button
                                    onClick={() => setShowUploadForm((v) => !v)}
                                    className="cursor-pointer rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                                >
                                    {showUploadForm ? "Tutup Form" : "+ Upload Laporan"}
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Upload form (admin only) */}
                    {role === "admin" && showUploadForm && (
                        <form onSubmit={handleUpload} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div>
                                <h3 className="text-sm font-bold text-blue-900">Unggah Laporan</h3>
                                <p className="text-xs text-slate-400">Judul laporan akan otomatis mengikuti nama file PDF.</p>
                            </div>

                            {uploadError && (
                                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{uploadError}</p>
                            )}
                            {uploadSuccess && (
                                <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-600">{uploadSuccess}</p>
                            )}

                            <div className="flex flex-col gap-4 sm:flex-row">
                                {/* Dropzone file PDF */}
                                <label
                                    htmlFor="upload-file-input"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={[
                                        "group relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
                                        isDragging
                                            ? "border-blue-500 bg-blue-100"
                                            : uploadFile
                                                ? "border-blue-300 bg-blue-50"
                                                : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50",
                                    ].join(" ")}
                                >
                                    <input
                                        id="upload-file-input"
                                        type="file"
                                        accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                                        className="sr-only"
                                        onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                                    />
                                    <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-900/60 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3-3.5 3 3.5M12 10.5V19M6.75 19h10.5a3.75 3.75 0 001.28-7.28 5.25 5.25 0 00-9.9-1.4A4.5 4.5 0 006.75 19z" />
                                    </svg>
                                    {uploadFile ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="max-w-55 truncate text-xs font-semibold text-blue-900">{uploadFile.name}</span>
                                            <span className="text-[10px] text-slate-400">{formatFileSize(uploadFile.size)} · klik untuk ganti file</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-xs font-semibold text-slate-600">Klik untuk pilih file laporan</span>
                                            <span className="text-[10px] text-slate-400">Format: PDF, PPT, Word, Excel</span>
                                        </div>
                                    )}
                                </label>

                                {/* Tanggal + submit */}
                                <div className="flex flex-col justify-between gap-3 sm:w-56">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Tanggal Laporan</label>
                                        <input
                                            type="date"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                            value={uploadDate}
                                            onChange={(e) => setUploadDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Kategori</label>
                                        <select value={category} onChange={(e) => setCategory(e.target.value as "weekly" | "biweekly" | "monthly" | "others")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="others">Others</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={uploadLoading}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                                    >
                                        {uploadLoading && (
                                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                        )}
                                        {uploadLoading ? "Mengunggah..." : "Unggah Laporan"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="mx-auto flex w-full max-w-5xl gap-2">
                        {CATEGORY_TABS.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => setActiveCategory(tab.value)}
                                className={[
                                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                                    activeCategory === tab.value
                                        ? "bg-blue-900 text-white"
                                        : "bg-white text-slate-600 hover:bg-blue-50",
                                ].join(" ")}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div ref={calendarPanelRef} className="flex flex-col gap-4 lg:flex-row">
                        {/* Kalender */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:flex-1">
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    onClick={isMonthlyMode ? goToPrevYear : goToPrevMonth}
                                    aria-label={isMonthlyMode ? "Tahun sebelumnya" : "Bulan sebelumnya"}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-900"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-blue-900 sm:text-base">
                                        {isMonthlyMode ? viewYear : `${MONTH_NAMES[viewMonth]} ${viewYear}`}
                                    </span>
                                    {reportsInCurrentMonth.length > 0 && (
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                            {reportsInCurrentMonth.length} laporan
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={isMonthlyMode ? goToNextYear : goToNextMonth}
                                    aria-label={isMonthlyMode ? "Tahun berikutnya" : "Bulan berikutnya"}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-900"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </div>

                            {!isMonthlyMode && (
                                <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
                                    {DAY_NAMES.map((d) => (
                                        <div key={d}>{d}</div>
                                    ))}
                                </div>
                            )}


                            {isMonthlyMode ? (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {monthCells.map((cell) => {
                                        const monthReports = reportsByMonth.get(cell.monthIndex);
                                        const hasReport = !!monthReports?.length;
                                        const isCurrentMonth = cell.monthIndex === today.getMonth() && viewYear === today.getFullYear();
                                        const isSelected = cell.monthIndex === selectedMonthIndex;

                                        return (
                                            <button
                                                key={cell.monthIndex}
                                                onClick={() => {
                                                    setViewMonth(cell.monthIndex);
                                                    setSelectedMonthIndex(cell.monthIndex);
                                                }}
                                                disabled={!hasReport}
                                                className={[
                                                    "relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-semibold transition-colors sm:text-sm",
                                                    hasReport
                                                        ? "cursor-pointer bg-blue-50 text-blue-900 hover:bg-blue-100"
                                                        : "cursor-default text-slate-400",
                                                    isSelected ? "ring-2 ring-blue-900" : "",
                                                    isCurrentMonth ? "border border-blue-900" : "",
                                                ].join(" ")}
                                            >
                                                {cell.label}
                                                {hasReport && monthReports!.length === 1 && (
                                                    <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-900" />
                                                )}
                                                {hasReport && monthReports!.length > 1 && (
                                                    <span className="absolute bottom-1 flex gap-0.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarCells.map((cell, idx) => {
                                        if (!cell.day || !cell.dateKey) {
                                            return <div key={idx} className="aspect-square" />;
                                        }
                                        const dayReports = reportsByDate.get(cell.dateKey);
                                        const hasReport = !!dayReports?.length;
                                        const isToday = cell.dateKey === todayKey;
                                        const isSelected = cell.dateKey === selectedDateKey;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleDateClick(cell.dateKey!)}
                                                disabled={!hasReport}
                                                className={[
                                                    "relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-semibold transition-colors sm:text-sm",
                                                    hasReport
                                                        ? "cursor-pointer bg-blue-50 text-blue-900 hover:bg-blue-100"
                                                        : "cursor-default text-slate-400",
                                                    isSelected ? "ring-2 ring-blue-900" : "",
                                                    isToday ? "border border-blue-900" : "",
                                                ].join(" ")}
                                            >
                                                {cell.day}
                                                {hasReport && dayReports!.length === 1 && (
                                                    <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-900" />
                                                )}
                                                {hasReport && dayReports!.length > 1 && (
                                                    <span className="absolute bottom-1 flex gap-0.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                                Tanggal dengan laporan tersedia
                            </div>
                        </div>

                        {/* Panel laporan tanggal terpilih */}
                        <div className="flex max-h-125 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:w-72">
                            <h2 className="mb-3 text-sm font-bold text-blue-900">
                                {isMonthlyMode
                                    ? (selectedMonthIndex !== null ? `${MONTH_NAMES[selectedMonthIndex]} ${viewYear}` : `Laporan ${viewYear}`)
                                    : (selectedDateKey ? formatDateLong(selectedDateKey) : `Laporan ${MONTH_NAMES[viewMonth]} ${viewYear}`)}
                            </h2>

                            {(() => {
                                let activeReports: PerformanceReport[];
                                let activeGroups: Map<string, PerformanceReport[]>;
                                let emptyMessage: string;

                                if (isMonthlyMode) {
                                    if (selectedMonthIndex !== null) {
                                        activeReports = selectedMonthReports;
                                        activeGroups = selectedMonthReportsByCategory;
                                        emptyMessage = "Tidak ada laporan di bulan ini.";
                                    } else {
                                        activeReports = reportsInCurrentYear;
                                        activeGroups = currentYearReportsByCategory;
                                        emptyMessage = "Belum ada laporan pada tahun ini.";
                                    }
                                } else {
                                    if (selectedDateKey) {
                                        activeReports = selectedDateReports;
                                        activeGroups = selectedDateReportsByCategory;
                                        emptyMessage = "Tidak ada laporan di tanggal ini.";
                                    } else {
                                        activeReports = reportsInCurrentMonth;
                                        activeGroups = currentMonthReportsByCategory;
                                        emptyMessage = "Belum ada laporan pada bulan ini.";
                                    }
                                }

                                if (activeReports.length === 0) {
                                    return <p className="text-xs text-slate-400">{emptyMessage}</p>;
                                }

                                return (
                                    <div className="flex flex-col gap-3 overflow-y-auto">
                                        {CATEGORY_TABS.filter((tab) => tab.value !== null).map((tab) => {
                                            const group = activeGroups.get(tab.value as string) ?? [];
                                            if (group.length === 0) return null;

                                            return (
                                                <div key={tab.label}>
                                                    <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                        {tab.label}
                                                    </h3>
                                                    <ul className="flex flex-col gap-2">
                                                        {group.map((report) => (
                                                            <li
                                                                key={report.id}
                                                                ref={(el) => {
                                                                    if (el) reportRefs.current.set(report.id, el);
                                                                    else reportRefs.current.delete(report.id);
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={() => openPreview(report)}
                                                                    className="cursor-pointer flex w-full flex-col items-start rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                                                                >
                                                                    <span className="text-xs font-semibold text-blue-900">{report.title}</span>
                                                                    {!(selectedDateKey || (isMonthlyMode && selectedMonthIndex !== null)) && (
                                                                        <span className="text-[10px] text-slate-400">{formatDateLong(report.report_date)}</span>
                                                                    )}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= Modal preview PDF (UI saja) ================= */}
            {previewReport && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-3 sm:p-6"
                    onClick={closePreview}
                >
                    <div
                        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <div>
                                <h3 className="text-sm font-bold text-blue-900 sm:text-base">{previewReport.title}</h3>
                                <p className="text-[11px] text-slate-400">{formatDateLong(previewReport.report_date)}</p>
                                <span className="mb-1 inline-block w-fit rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                                    {getCategoryLabel(previewReport.category)}
                                </span>
                                {previewReport.uploaded_by && (
                                    <p className="text-[10px] text-slate-400">
                                        Diupload oleh <b>{previewReport.uploaded_by.full_name ?? "tidak diketahui"}</b>
                                    </p>
                                )}
                                {previewReport.updated_by && (
                                    <p className="text-[10px] text-slate-400">
                                        Terakhir diubah oleh <b>{previewReport.updated_by.full_name ?? "tidak diketahui"}</b>
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">

                                {previewUrl && (
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloadLoading}
                                        className="cursor-pointer rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {downloadLoading ? "Mengunduh..." : "Download"}
                                    </button>
                                )}

                                {role === "admin" && !isEditing && (
                                    <button
                                        onClick={startEdit}
                                        className="cursor-pointer rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                                    >
                                        Edit
                                    </button>
                                )}


                                {role === "admin" && (
                                    <button onClick={handleDelete} className="cursor-pointer rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                                        Hapus
                                    </button>
                                )}
                                <button
                                    onClick={closePreview}
                                    aria-label="Tutup"
                                    className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden bg-slate-100">
                            {isEditing ? (
                                <form onSubmit={handleEdit} className="flex h-full flex-col gap-4 overflow-y-auto p-5">
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-900">Edit Laporan</h3>
                                        <p className="text-xs text-slate-400">Kosongkan file kalau tidak ingin mengganti PDF.</p>
                                    </div>

                                    {editError && (
                                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{editError}</p>
                                    )}

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Tanggal Laporan</label>
                                        <input
                                            type="date"
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Kategori</label>
                                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as "weekly" | "biweekly" | "monthly" | "others")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                                            <option value="weekly" >Weekly</option>
                                            <option value="biweekly">Bi-Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="others">Others</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Ganti File PDF (opsional)</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                                            onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none file:mr-2 file:rounded-md file:border-0 file:bg-blue-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                                        />
                                        {editFile && (
                                            <p className="mt-1 text-[10px] text-slate-400">{editFile.name} · {formatFileSize(editFile.size)}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={editLoading}
                                            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {previewLoading && (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                            Memuat pratinjau...
                                        </div>
                                    )}
                                    {previewError && (
                                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-600">
                                            {previewError}
                                        </div>
                                    )}
                                    {previewUrl && !previewLoading && (
                                        previewReport?.file_name.toLowerCase().endsWith(".pdf") ? (
                                            <iframe src={previewUrl} title={previewReport?.title} className="h-full w-full" />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-500">
                                                <p>Pratinjau tidak tersedia untuk format file ini.</p>
                                                <button
                                                    onClick={handleDownload}
                                                    className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                                                >
                                                    Download File
                                                </button>
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceContent