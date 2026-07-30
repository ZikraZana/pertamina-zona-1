"use client";

import { useEffect, useState } from "react";

type ActivityLog = {
    id: string;
    action: string;
    entity_type: string;
    entity_label: string;
    created_at: string;
    actor: { full_name: string | null } | null;
};

const ACTION_CONFIG: Record<string, { label: string; badgeClass: string; iconBg: string; icon: React.ReactNode }> = {
    insert: {
        label: "mengunggah",
        badgeClass: "bg-emerald-100 text-emerald-700",
        iconBg: "bg-emerald-600",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
        ),
    },
    update: {
        label: "mengubah",
        badgeClass: "bg-amber-100 text-amber-700",
        iconBg: "bg-amber-500",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a1 1 0 00-1 1v15a1 1 0 001 1h15a1 1 0 001-1v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        ),
    },
    delete: {
        label: "menghapus",
        badgeClass: "bg-red-100 text-red-700",
        iconBg: "bg-red-600",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0v13a1 1 0 01-1 1H8a1 1 0 01-1-1V7h10z" />
            </svg>
        ),
    },
};

const ENTITY_LABELS: Record<string, string> = {
    performance_report: "laporan",
    overview: "data wilayah kerja",
};

function formatDateTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string | null | undefined) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

const AdminLog = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch("/api/activity-logs");
                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? "Gagal memuat log.");
                setLogs(json.logs);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Gagal memuat log.");
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, []);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-blue-900">Log Aktivitas Admin</h2>
                    <p className="text-xs text-slate-400">Riwayat perubahan pada Performance Report dan Wilayah Kerja.</p>
                </div>
                {!loading && logs.length > 0 && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                        {logs.length} aktivitas
                    </span>
                )}
            </div>

            {loading && (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
                    ))}
                </div>
            )}

            {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
            )}

            {!loading && !error && logs.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <span className="text-3xl">🗂️</span>
                    <p className="text-xs text-slate-400">Belum ada aktivitas tercatat.</p>
                </div>
            )}

            {!loading && logs.length > 0 && (
                <ul className="relative flex flex-col gap-1">
                    {logs.map((log, idx) => {
                        const config = ACTION_CONFIG[log.action] ?? {
                            label: log.action,
                            badgeClass: "bg-slate-100 text-slate-700",
                            iconBg: "bg-slate-500",
                            icon: null,
                        };
                        const isLast = idx === logs.length - 1;

                        return (
                            <li key={log.id} className="relative flex gap-3 pb-4">
                                {/* garis timeline */}
                                {!isLast && (
                                    <span className="absolute left-4 top-9 h-full w-px bg-slate-200" />
                                )}

                                {/* ikon aksi */}
                                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
                                    {config.icon}
                                </span>

                                {/* konten */}
                                <div className="flex flex-1 flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5">
                                    <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[9px] font-bold text-white">
                                            {getInitials(log.actor?.full_name)}
                                        </span>
                                        <span className="font-semibold text-blue-900">
                                            {log.actor?.full_name ?? "Admin tidak diketahui"}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${config.badgeClass}`}
                                        >
                                            {config.label}
                                        </span>
                                        <span className="text-slate-500">{ENTITY_LABELS[log.entity_type] ?? log.entity_type}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-800">
                                        &quot;{log.entity_label}&quot;
                                    </p>
                                    <p className="text-[11px] text-slate-400">{formatDateTime(log.created_at)}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default AdminLog;