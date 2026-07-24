"use client"

import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react"

// ============================================================
// DATA DUMMY sementara, biar kalender ada isinya.
// Nanti ini diganti fetch asli ke /api/weekly-reports (step berikutnya).
// ============================================================
type WeeklyReport = {
    id: string;
    title: string;
    report_date: string; // YYYY-MM-DD
    file_name: string;
    file_size: number | null;
};

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function toDateKey(year: number, month: number, day: number) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

function formatDateLong(dateStr: string) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatFileSize(bytes: number | null) {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

const WeeklyReportContent = () => {
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

    async function fetchReports() {
        const res = await fetch("/api/weekly-reports");
        const json = await res.json();
        setReports(json.reports)
    }

    useEffect(() => {
        if (!user) return;
        fetchReports();
    }, [user])


    // ============================================================
    // STATE BARU — untuk kalender, panel, dan modal preview.
    // ============================================================
    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
    const [previewReport, setPreviewReport] = useState<WeeklyReport | null>(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [reports, setReports] = useState<WeeklyReport[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [downloadLoading, setDownloadLoading] = useState(false);

    // Peta tanggal -> laporan (nanti ganti DUMMY_REPORTS jadi data asli)
    const reportsByDate = useMemo(() => {
        const map = new Map<string, WeeklyReport[]>();
        for (const report of reports) {
            const list = map.get(report.report_date) ?? [];
            list.push(report);
            map.set(report.report_date, list);
        }
        return map;
    }, [reports]);

    function goToPrevMonth() {
        setViewMonth((m) => {
            if (m === 0) {
                setViewYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    }

    function goToNextMonth() {
        setViewMonth((m) => {
            if (m === 11) {
                setViewYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
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

    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDateReports = selectedDateKey ? reportsByDate.get(selectedDateKey) ?? [] : [];

    function handleDateClick(dateKey: string) {
        const dayReports = reportsByDate.get(dateKey);
        setSelectedDateKey(dateKey);
        if (dayReports && dayReports.length === 1) {
            openPreview(dayReports[0]);
        }
    }

    async function openPreview(report: WeeklyReport) {
        setPreviewReport(report);
        setPreviewUrl(null);
        setPreviewError(null);
        setPreviewLoading(true);
        try {
            const res = await fetch(`/api/weekly-reports/${report.id}/download`);
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
    }

    const [uploadDate, setUploadDate] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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

        if (droppedFile.type !== "application/pdf") {
            setUploadError("File harus berformat PDF.");
            return;
        }

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

        const res = await fetch("/api/weekly-reports", {
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
        setUploadSuccess("Weekly report berhasil diunggah.");
    }


    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="mx-auto mb-4 w-full max-w-5xl">
                <h1 className="group relative z-10 mb-1 w-fit cursor-default bg-linear-to-b from-blue-900 to-blue-500 bg-clip-text text-xl font-bold text-transparent transition-transform duration-300 ease-out hover:-translate-y-1 sm:text-2xl lg:text-3xl">
                    Weekly Report
                </h1>
                <p className="text-sm text-blue-900/70">
                    Lihat dan unduh laporan mingguan Pertamina Hulu Rokan Zona 1 lewat kalender di bawah ini.
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
                        Silakan login untuk melihat weekly report.
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
                                    className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                                >
                                    {showUploadForm ? "Tutup Form" : "+ Upload Laporan"}
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Upload form (admin only) */}
                    {role === "admin" && showUploadForm && (
                        <form onSubmit={handleUpload} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div>
                                <h3 className="text-sm font-bold text-blue-900">Unggah Weekly Report</h3>
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
                                        accept="application/pdf"
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
                                            <span className="text-xs font-semibold text-slate-600">Klik untuk pilih file PDF</span>
                                            <span className="text-[10px] text-slate-400">Hanya format .pdf</span>
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
                                    <button
                                        type="submit"
                                        disabled={uploadLoading}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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

                    <div className="flex flex-col gap-4 lg:flex-row">
                        {/* Kalender */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:flex-1">
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    onClick={goToPrevMonth}
                                    aria-label="Bulan sebelumnya"
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-900"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <span className="text-sm font-bold text-blue-900 sm:text-base">
                                    {MONTH_NAMES[viewMonth]} {viewYear}
                                </span>
                                <button
                                    onClick={goToNextMonth}
                                    aria-label="Bulan berikutnya"
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-900"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
                                {DAY_NAMES.map((d) => (
                                    <div key={d}>{d}</div>
                                ))}
                            </div>

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
                                            {hasReport && (
                                                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-900" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                                Tanggal dengan laporan tersedia
                            </div>
                        </div>

                        {/* Panel tanggal terpilih */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:w-72">
                            <h2 className="mb-3 text-sm font-bold text-blue-900">
                                {selectedDateKey ? formatDateLong(selectedDateKey) : "Pilih tanggal di kalender"}
                            </h2>

                            {selectedDateKey && selectedDateReports.length === 0 && (
                                <p className="text-xs text-slate-400">Tidak ada laporan pada tanggal ini.</p>
                            )}

                            <ul className="flex flex-col gap-2">
                                {selectedDateReports.map((report) => (
                                    <li key={report.id}>
                                        <button
                                            onClick={() => openPreview(report)}
                                            className="flex w-full flex-col items-start rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                                        >
                                            <span className="text-xs font-semibold text-blue-900">{report.title}</span>
                                            <span className="text-[10px] text-slate-400">
                                                {report.file_name} {report.file_size ? `· ${formatFileSize(report.file_size)}` : ""}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {!selectedDateKey && (
                                <div className="mt-2 flex flex-col gap-2">
                                    <p className="text-xs font-semibold text-slate-500">Laporan terbaru:</p>
                                    <ul className="flex flex-col gap-2">
                                        {reports.slice(0, 5).map((report) => (
                                            <li key={report.id}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDateKey(report.report_date);
                                                        openPreview(report);
                                                    }}
                                                    className="flex w-full flex-col items-start rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                                                >
                                                    <span className="text-xs font-semibold text-blue-900">{report.title}</span>
                                                    <span className="text-[10px] text-slate-400">{formatDateLong(report.report_date)}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= Modal preview PDF (UI saja) ================= */}
            {previewReport && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-3 sm:p-6"
                    onClick={() => setPreviewReport(null)}
                >
                    <div
                        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <div>
                                <h3 className="text-sm font-bold text-blue-900 sm:text-base">{previewReport.title}</h3>
                                <p className="text-[11px] text-slate-400">{formatDateLong(previewReport.report_date)}</p>
                            </div>
                            <div className="flex items-center gap-2">

                                {previewUrl && (
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloadLoading}
                                        className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {downloadLoading ? "Mengunduh..." : "Download"}
                                    </button>
                                )}

                                {role === "admin" && (
                                    <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                                        Hapus
                                    </button>
                                )}
                                <button
                                    onClick={closePreview}
                                    aria-label="Tutup"
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden bg-slate-100">
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
                                <iframe src={previewUrl} title={previewReport?.title} className="h-full w-full" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyReportContent