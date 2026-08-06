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
    jenis_rk:
    string;
    nama_rk: string;
    jenis_produksi: string;
    jumlah_produksi: number;
    wilayah_kerja: string
};

type InovasiItem = {
    id: string;
    pencapaian: string;
    nama_inovasi: string;
    nama_acara: string;
    wilayah_kerja: string
};

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
    const [rkForm, setRkForm] = useState({ jenis_rk: "Bor", nama_rk: "", jenis_produksi: "minyak", jumlah_produksi: "", wilayah_kerja: "" });
    const [rkEditingId, setRkEditingId] = useState<string | null>(null);
    const [rkLoading, setRkLoading] = useState(false);

    // ---------- State Inovasi ----------
    const [inovasiItems, setInovasiItems] = useState<InovasiItem[]>([]);
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
        const res = await fetch("/api/achievement/rencana-kerja");
        const json = await res.json();
        setRkItems(json.data ?? []);
    }

    function resetRkForm() {
        setRkForm({ jenis_rk: "Bor", nama_rk: "", jenis_produksi: "minyak", jumlah_produksi: "", wilayah_kerja: "" });
        setRkEditingId(null);
    }

    function startEditRk(item: RKItem) {
        setRkForm({ jenis_rk: item.jenis_rk, nama_rk: item.nama_rk, jenis_produksi: item.jenis_produksi, jumlah_produksi: String(item.jumlah_produksi), wilayah_kerja: item.wilayah_kerja });
        setRkEditingId(item.id);
    }

    async function handleSubmitRk(e: React.FormEvent) {
        e.preventDefault();
        setRkLoading(true);
        const payload = { ...rkForm, jumlah_produksi: Number(rkForm.jumlah_produksi) };
        const url = rkEditingId ? `/api/achievement/rencana-kerja/${rkEditingId}` : "/api/achievement/rencana-kerja";
        const method = rkEditingId ? "PATCH" : "POST";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
        const res = await fetch("/api/achievement/inovasi");
        const json = await res.json();
        setInovasiItems(json.data ?? []);
    }

    function resetInovasiForm() {
        setInovasiForm({ pencapaian: "", nama_inovasi: "", nama_acara: "", wilayah_kerja: "" });
        setInovasiEditingId(null);
    }

    function startEditInovasi(item: InovasiItem) {
        setInovasiForm({ pencapaian: item.pencapaian, nama_inovasi: item.nama_inovasi, nama_acara: item.nama_acara, wilayah_kerja: item.wilayah_kerja });
        setInovasiEditingId(item.id);
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
                <h2 className="mb-4 text-sm font-bold text-blue-900">Rencana Kerja</h2>
                <form onSubmit={handleSubmitRk} className="mb-4 grid grid-cols-2 gap-3">
                    <select value={rkForm.jenis_rk} onChange={(e) => setRkForm({ ...rkForm, jenis_rk: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                        <option value="Bor">Bor</option>
                        <option value="Workover">Workover</option>
                    </select>
                    <select value={rkForm.jenis_produksi} onChange={(e) => setRkForm({ ...rkForm, jenis_produksi: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                        <option value="minyak">Minyak</option>
                        <option value="gas">Gas</option>
                    </select>
                    <input placeholder="Nama RK (misal PPS-015A)" value={rkForm.nama_rk} onChange={(e) => setRkForm({ ...rkForm, nama_rk: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                    <input placeholder="Jumlah Produksi (BOPD)" type="number" step="any" value={rkForm.jumlah_produksi} onChange={(e) => setRkForm({ ...rkForm, jumlah_produksi: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                    <input placeholder="Wilayah Kerja (misal Field Jambi)" value={rkForm.wilayah_kerja} onChange={(e) => setRkForm({ ...rkForm, wilayah_kerja: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                    <div className="col-span-2 flex gap-2">
                        <button type="submit" disabled={rkLoading} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                            {rkEditingId ? "Simpan Perubahan" : "Tambah"}
                        </button>
                        {rkEditingId && <button type="button" onClick={resetRkForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">Batal</button>}
                    </div>
                </form>
                <ul className="flex flex-col gap-2">
                    {rkItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <div>
                                <span className="font-semibold text-blue-900">{item.nama_rk}</span>
                                <span className="ml-2 text-xs text-slate-400">{item.jenis_rk} · {item.wilayah_kerja} · {item.jumlah_produksi} BOPD</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEditRk(item)} className="text-xs font-semibold text-blue-700 hover:underline">Edit</button>
                                <button onClick={() => handleDeleteRk(item.id)} className="text-xs font-semibold text-red-600 hover:underline">Hapus</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ---------- Card Inovasi ---------- */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-bold text-blue-900">Inovasi</h2>
                <form onSubmit={handleSubmitInovasi} className="mb-4 grid grid-cols-2 gap-3">
                    <input placeholder="Pencapaian (misal Best Presentation)" value={inovasiForm.pencapaian} onChange={(e) => setInovasiForm({ ...inovasiForm, pencapaian: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                    <input placeholder="Nama Inovasi" value={inovasiForm.nama_inovasi} onChange={(e) => setInovasiForm({ ...inovasiForm, nama_inovasi: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                    <input placeholder="Nama Acara" value={inovasiForm.nama_acara} onChange={(e) => setInovasiForm({ ...inovasiForm, nama_acara: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                    <input placeholder="Wilayah Kerja" value={inovasiForm.wilayah_kerja} onChange={(e) => setInovasiForm({ ...inovasiForm, wilayah_kerja: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                    <div className="col-span-2 flex gap-2">
                        <button type="submit" disabled={inovasiLoading} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                            {inovasiEditingId ? "Simpan Perubahan" : "Tambah"}
                        </button>
                        {inovasiEditingId && <button type="button" onClick={resetInovasiForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">Batal</button>}
                    </div>
                </form>
                <ul className="flex flex-col gap-2">
                    {inovasiItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <div>
                                <span className="font-semibold text-blue-900">{item.pencapaian}</span>
                                <span className="ml-2 text-xs text-slate-400">{item.nama_inovasi} · {item.nama_acara}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEditInovasi(item)} className="text-xs font-semibold text-blue-700 hover:underline">Edit</button>
                                <button onClick={() => handleDeleteInovasi(item.id)} className="text-xs font-semibold text-red-600 hover:underline">Hapus</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AchievementTab;