"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

type ProduksiData = {
    jenis: "minyak" | "gas";
    realisasi: number;
    target: number;
    periode: string;
    unit: string;
};

type RKItem = {
    id: string;
    jenis_rk: string;
    nama_rk: string;
    jumlah_minyak: number | null;
    jumlah_gas: number | null;
    wilayah_kerja: string;
    urutan: number;
};

type InovasiItem = {
    id: string;
    pencapaian: string;
    nama_inovasi: string;
    nama_acara: string;
    wilayah_kerja: string
};

// ============================================================
// ICONS (inline SVG, konsisten dengan gaya ikon di PerformanceReportTab)
// ============================================================

function PlusIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
    );
}

function PencilIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113 3L7.5 19.85l-4 1 1-4L16.862 4.487z" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9.5 7V5.5a1.5 1.5 0 011.5-1.5h2a1.5 1.5 0 011.5 1.5V7m-8 0l.6 12a2 2 0 002 1.9h5.8a2 2 0 002-1.9L18 7" />
        </svg>
    );
}

function EmptyIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h6M9 9h1M5 21h14a2 2 0 002-2V7.5L15.5 3H7a2 2 0 00-2 2v2" />
        </svg>
    );
}

// ============================================================
// SUB-KOMPONEN: header section + tombol toggle tambah
// ============================================================

function SectionHeader({
    title,
    isFormOpen,
    onToggle,
}: {
    title: string;
    isFormOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-blue-900">{title}</h2>
            <button
                type="button"
                onClick={onToggle}
                className={[
                    "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    isFormOpen
                        ? "border border-slate-300 text-slate-600 hover:bg-slate-50"
                        : "bg-blue-900 text-white hover:bg-blue-800",
                ].join(" ")}
            >
                {isFormOpen ? (
                    "Tutup Form"
                ) : (
                    <>
                        <PlusIcon /> Tambah Data
                    </>
                )}
            </button>
        </div>
    );
}

// ============================================================
// SUB-KOMPONEN: empty state
// ============================================================

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 py-8 text-center">
            <EmptyIcon />
            <p className="text-xs text-slate-400">{label}</p>
        </div>
    );
}

// ============================================================
// SUB-KOMPONEN: loading skeleton untuk list
// ============================================================

function ListSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
            ))}
        </div>
    );
}

const AchievementTab = () => {
    const [selectedJenis, setSelectedJenis] = useState<"minyak" | "gas">("minyak");
    const [data, setData] = useState<Record<string, ProduksiData>>({});
    const [dataLoading, setDataLoading] = useState(true);
    const [form, setForm] = useState<ProduksiData | null>(null);

    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ---------- State Rencana Kerja ----------
    const [rkItems, setRkItems] = useState<RKItem[]>([]);
    const [rkListLoading, setRkListLoading] = useState(true);
    const [rkFormOpen, setRkFormOpen] = useState(false);
    const [rkForm, setRkForm] = useState({ jenis_rk: "Bor", nama_rk: "", jumlah_minyak: "", jumlah_gas: "", wilayah_kerja: "", urutan: "" });
    const [rkEditingId, setRkEditingId] = useState<string | null>(null);
    const [rkLoading, setRkLoading] = useState(false);
    const [rkError, setRkError] = useState<string | null>(null);

    // ---------- State Inovasi ----------
    const [inovasiItems, setInovasiItems] = useState<InovasiItem[]>([]);
    const [inovasiListLoading, setInovasiListLoading] = useState(true);
    const [inovasiFormOpen, setInovasiFormOpen] = useState(false);
    const [inovasiForm, setInovasiForm] = useState({ pencapaian: "", nama_inovasi: "", nama_acara: "", wilayah_kerja: "" });
    const [inovasiEditingId, setInovasiEditingId] = useState<string | null>(null);
    const [inovasiLoading, setInovasiLoading] = useState(false);

    async function fetchData() {
        setDataLoading(true);
        try {
            const res = await fetch("/api/achievement/produksi");
            const json = await res.json();
            const map: Record<string, ProduksiData> = {};
            for (const row of json.data ?? []) {
                map[row.jenis] = row;
            }
            setData(map);
        } finally {
            setDataLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        fetchRkItems();
        fetchInovasiItems();
    }, []);

    // ---------- Fungsi Rencana Kerja ----------
    async function fetchRkItems() {
        setRkListLoading(true);
        try {
            const res = await fetch("/api/achievement/rencana-kerja");
            const json = await res.json();
            setRkItems(json.data ?? []);
        } finally {
            setRkListLoading(false);
        }
    }

    function resetRkForm() {
        setRkForm({ jenis_rk: "Bor", nama_rk: "", jumlah_minyak: "", jumlah_gas: "", wilayah_kerja: "", urutan: "" });
        setRkEditingId(null);
        setRkFormOpen(false);
        setRkError(null);
    }

    function startEditRk(item: RKItem) {
        setRkForm({
            jenis_rk: item.jenis_rk,
            nama_rk: item.nama_rk,
            jumlah_minyak: item.jumlah_minyak !== null ? String(item.jumlah_minyak) : "",
            jumlah_gas: item.jumlah_gas !== null ? String(item.jumlah_gas) : "",
            wilayah_kerja: item.wilayah_kerja,
            urutan: String(item.urutan),
        });
        setRkEditingId(item.id);
        setRkFormOpen(true);
        setRkError(null);
    }

    async function handleSubmitRk(e: React.FormEvent) {
        e.preventDefault();
        setRkError(null);

        if (!rkForm.jumlah_minyak.trim() && !rkForm.jumlah_gas.trim()) {
            setRkError("Isi minimal salah satu: Jumlah Minyak atau Jumlah Gas.");
            return;
        }

        setRkLoading(true);
        const payload = {
            jenis_rk: rkForm.jenis_rk,
            nama_rk: rkForm.nama_rk,
            jumlah_minyak: rkForm.jumlah_minyak.trim() ? Number(rkForm.jumlah_minyak) : null,
            jumlah_gas: rkForm.jumlah_gas.trim() ? Number(rkForm.jumlah_gas) : null,
            wilayah_kerja: rkForm.wilayah_kerja,
            urutan: rkForm.urutan.trim() ? Number(rkForm.urutan) : 0,
        };
        const url = rkEditingId ? `/api/achievement/rencana-kerja/${rkEditingId}` : "/api/achievement/rencana-kerja";
        const method = rkEditingId ? "PATCH" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();

        if (!res.ok) {
            setRkError(json.error ?? "Gagal menyimpan data.");
            setRkLoading(false);
            return;
        }

        await fetchRkItems();
        resetRkForm();
        setRkLoading(false);
    }

    async function handleDeleteRk(id: string) {
        if (!window.confirm("Hapus data ini?")) return;
        await fetch(`/api/achievement/rencana-kerja/${id}`, { method: "DELETE" });
        await fetchRkItems();
    }

    // ---------- Fungsi Inovasi ----------
    async function fetchInovasiItems() {
        setInovasiListLoading(true);
        try {
            const res = await fetch("/api/achievement/inovasi");
            const json = await res.json();
            setInovasiItems(json.data ?? []);
        } finally {
            setInovasiListLoading(false);
        }
    }

    function resetInovasiForm() {
        setInovasiForm({ pencapaian: "", nama_inovasi: "", nama_acara: "", wilayah_kerja: "" });
        setInovasiEditingId(null);
        setInovasiFormOpen(false);
    }

    function startEditInovasi(item: InovasiItem) {
        setInovasiForm({ pencapaian: item.pencapaian, nama_inovasi: item.nama_inovasi, nama_acara: item.nama_acara, wilayah_kerja: item.wilayah_kerja });
        setInovasiEditingId(item.id);
        setInovasiFormOpen(true);
    }

    async function handleSubmitInovasi(e: React.FormEvent) {
        e.preventDefault();
        setInovasiLoading(true);
        const url = inovasiEditingId ? `/api/achievement/inovasi/${inovasiEditingId}` : "/api/achievement/inovasi";
        const method = inovasiEditingId ? "PATCH" : "POST";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(inovasiForm) });
        await fetchInovasiItems();
        resetInovasiForm();
        setInovasiLoading(false);
    }

    async function handleDeleteInovasi(id: string) {
        if (!window.confirm("Hapus data ini?")) return;
        await fetch(`/api/achievement/inovasi/${id}`, { method: "DELETE" });
        await fetchInovasiItems();
    }

    useEffect(() => {
        if (data[selectedJenis]) {
            setForm(data[selectedJenis]);
            setSaveSuccess(false);
            setSaveError(null);
        }
    }, [selectedJenis, data]);

    function updateField(key: keyof ProduksiData, value: string) {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form) return;

        setSaveLoading(true);
        setSaveError(null);
        setSaveSuccess(false);

        const res = await fetch("/api/achievement/produksi", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jenis: form.jenis,
                realisasi: Number(form.realisasi),
                target: Number(form.target),
                periode: form.periode,
                unit: form.unit,
            }),
        });

        const json = await res.json();

        if (!res.ok) {
            setSaveError(json.error ?? "Gagal menyimpan.");
        } else {
            setSaveSuccess(true);
            await fetchData();
        }
        setSaveLoading(false);
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-bold text-blue-900">Produksi</h2>

                <div className="mb-4">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Jenis</label>
                    <select
                        value={selectedJenis}
                        onChange={(e) => setSelectedJenis(e.target.value as "minyak" | "gas")}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="minyak">Produksi Minyak</option>
                        <option value="gas">Produksi Gas</option>
                    </select>
                </div>

                {dataLoading && <p className="text-xs text-slate-400">Memuat...</p>}

                {!dataLoading && form && (
                    <form onSubmit={handleSave} className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Realisasi</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.realisasi}
                                    onChange={(e) => updateField("realisasi", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Target</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.target}
                                    onChange={(e) => updateField("target", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Unit</label>
                            <input
                                type="text"
                                value={form.unit}
                                onChange={(e) => updateField("unit", e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Periode</label>
                            <input
                                type="text"
                                value={form.periode}
                                onChange={(e) => updateField("periode", e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        {form.realisasi && form.target && Number(form.target) > 0 && (
                            <p className="text-xs text-slate-500">
                                Preview: <span className="font-semibold text-blue-900">{Math.round((Number(form.realisasi) / Number(form.target)) * 100)}%</span> dari target
                            </p>
                        )}

                        {saveError && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{saveError}</p>
                        )}
                        {saveSuccess && (
                            <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">Data tersimpan.</p>
                        )}

                        <button
                            type="submit"
                            disabled={saveLoading}
                            className="w-fit cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saveLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </form>
                )}
            </div>

            {/* ---------- Card Rencana Kerja ---------- */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader
                    title="Rencana Kerja"
                    isFormOpen={rkFormOpen}
                    onToggle={() => (rkFormOpen ? resetRkForm() : setRkFormOpen(true))}
                />

                {rkFormOpen && (
                    <form onSubmit={handleSubmitRk} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                        <select value={rkForm.jenis_rk} onChange={(e) => setRkForm({ ...rkForm, jenis_rk: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                            <option value="Bor">Bor</option>
                            <option value="Workover">Workover</option>
                        </select>
                        <input placeholder="Urutan Tampil (misal 1)" type="number" step="1" min="0" value={rkForm.urutan} onChange={(e) => setRkForm({ ...rkForm, urutan: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        <input placeholder="Nama RK (misal PPS-015A)" value={rkForm.nama_rk} onChange={(e) => setRkForm({ ...rkForm, nama_rk: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                        <input placeholder="Jumlah Minyak (BOPD, opsional)" type="number" step="any" min="0" value={rkForm.jumlah_minyak} onChange={(e) => setRkForm({ ...rkForm, jumlah_minyak: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        <input placeholder="Jumlah Gas (MMSCFD, opsional)" type="number" step="any" min="0" value={rkForm.jumlah_gas} onChange={(e) => setRkForm({ ...rkForm, jumlah_gas: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        <input placeholder="Wilayah Kerja (misal Field Jambi)" value={rkForm.wilayah_kerja} onChange={(e) => setRkForm({ ...rkForm, wilayah_kerja: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />

                        <p className="col-span-2 -mt-1 text-[11px] text-slate-400">Isi minimal salah satu: Jumlah Minyak atau Jumlah Gas.</p>

                        {rkError && (
                            <p className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{rkError}</p>
                        )}

                        <div className="col-span-2 flex gap-2">
                            <button type="submit" disabled={rkLoading} className="cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                {rkLoading ? "Menyimpan..." : rkEditingId ? "Simpan Perubahan" : "Tambah"}
                            </button>
                            <button type="button" onClick={resetRkForm} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white">Batal</button>
                        </div>
                    </form>
                )}

                {rkListLoading ? (
                    <ListSkeleton />
                ) : rkItems.length === 0 ? (
                    <EmptyState label="Belum ada data rencana kerja." />
                ) : (
                    <ul className="flex flex-col gap-2">
                        {rkItems.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">#{item.urutan}</span>
                                        <span className="truncate font-semibold text-blue-900">{item.nama_rk}</span>
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">{item.jenis_rk}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {item.wilayah_kerja}
                                        {item.jumlah_minyak !== null && ` · ${item.jumlah_minyak.toLocaleString("id-ID")} BOPD`}
                                        {item.jumlah_gas !== null && ` · ${item.jumlah_gas.toLocaleString("id-ID")} MMSCFD`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <button onClick={() => startEditRk(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                        <PencilIcon />
                                    </button>
                                    <button onClick={() => handleDeleteRk(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ---------- Card Inovasi ---------- */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader
                    title="Inovasi"
                    isFormOpen={inovasiFormOpen}
                    onToggle={() => (inovasiFormOpen ? resetInovasiForm() : setInovasiFormOpen(true))}
                />

                {inovasiFormOpen && (
                    <form onSubmit={handleSubmitInovasi} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                        <input placeholder="Pencapaian (misal Best Presentation)" value={inovasiForm.pencapaian} onChange={(e) => setInovasiForm({ ...inovasiForm, pencapaian: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                        <input placeholder="Nama Inovasi" value={inovasiForm.nama_inovasi} onChange={(e) => setInovasiForm({ ...inovasiForm, nama_inovasi: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                        <input placeholder="Nama Acara" value={inovasiForm.nama_acara} onChange={(e) => setInovasiForm({ ...inovasiForm, nama_acara: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                        <input placeholder="Wilayah Kerja" value={inovasiForm.wilayah_kerja} onChange={(e) => setInovasiForm({ ...inovasiForm, wilayah_kerja: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                        <div className="col-span-2 flex gap-2">
                            <button type="submit" disabled={inovasiLoading} className="cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                {inovasiLoading ? "Menyimpan..." : inovasiEditingId ? "Simpan Perubahan" : "Tambah"}
                            </button>
                            <button type="button" onClick={resetInovasiForm} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white">Batal</button>
                        </div>
                    </form>
                )}

                {inovasiListLoading ? (
                    <ListSkeleton />
                ) : inovasiItems.length === 0 ? (
                    <EmptyState label="Belum ada data inovasi." />
                ) : (
                    <ul className="flex flex-col gap-2">
                        {inovasiItems.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                                <div className="min-w-0">
                                    <span className="truncate font-semibold text-blue-900">{item.pencapaian}</span>
                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                        {[item.nama_inovasi, item.nama_acara, item.wilayah_kerja].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <button onClick={() => startEditInovasi(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                        <PencilIcon />
                                    </button>
                                    <button onClick={() => handleDeleteInovasi(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AchievementTab;