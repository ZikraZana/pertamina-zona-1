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

const AchievementTab = () => {
    const [selectedJenis, setSelectedJenis] = useState<"minyak" | "gas">("minyak");
    const [data, setData] = useState<Record<string, ProduksiData>>({});
    const [dataLoading, setDataLoading] = useState(true);
    const [form, setForm] = useState<ProduksiData | null>(null);

    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

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
    }, []);

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
        </div>
    );
};

export default AchievementTab;