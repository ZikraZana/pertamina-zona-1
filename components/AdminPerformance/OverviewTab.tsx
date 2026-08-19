"use client";

import { useEffect, useMemo, useState } from "react";
import { toastSuccess, toastError } from "@/lib/alert";

// ============================================================
// TIPE DATA WILAYAH KERJA
// ============================================================

type WilayahData = {
    kode: string;
    nama_wilayah: string | null;
    provinsi: string | null;
    kabupaten_kota: string | null;
    jenis_wk: string | null;
    tahun_berdiri: string | null;
    luas_wilayah: string | null;
    part_interest: string | null;
    kkp: string | null;
    produksi_minyak: string | null;
    produksi_gas: string | null;
    tanggal_produksi: string | null;
    nama_fasilitas: string | null;
    jenis_fasilitas: string | null;
    jumlah_fasilitas: string | null;
    drilling_rigs: string | null;
    workover_rigs: string | null;
};

type AsetData = {
    id: string;
    wilayah_kerja: string;
    tipe_aset: string;
    kategori: string;
    jumlah_active: string | null;
    jumlah_non_active: string | null;
    total: string | null;
};

const emptyWilayah = (kode: string): WilayahData => ({
    kode,
    nama_wilayah: null, provinsi: null, kabupaten_kota: null, jenis_wk: null, tahun_berdiri: null,
    luas_wilayah: null, part_interest: null, kkp: null, produksi_minyak: null, produksi_gas: null,
    tanggal_produksi: null, nama_fasilitas: null, jenis_fasilitas: null, jumlah_fasilitas: null,
    drilling_rigs: null, workover_rigs: null,
});

const TEXT_FIELDS: { key: keyof WilayahData; label: string }[] = [
    { key: "nama_wilayah", label: "Nama Wilayah Kerja" },
    { key: "kabupaten_kota", label: "Kabupaten/Kota" },
    { key: "tahun_berdiri", label: "Tahun Berdiri" },
    { key: "luas_wilayah", label: "Luas Wilayah" },
    { key: "part_interest", label: "Participating Interest" },
];

const PROVINSI_SUMATERA: string[] = [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Barat",
    "Riau",
    "Kepulauan Riau",
    "Jambi",
    "Bengkulu",
    "Sumatera Selatan",
    "Kepulauan Bangka Belitung",
    "Lampung",
];

const JENIS_WK_OPTIONS: string[] = ["Gross Split", "Cost Recovery"];

const PRODUKSI_FIELDS: { key: keyof WilayahData; label: string; placeholder?: string }[] = [
    { key: "produksi_minyak", label: "Produksi Minyak (MBOPD)" },
    { key: "produksi_gas", label: "Produksi Gas (MMSCFD)" },
];

const FASILITAS_FIELDS: { key: keyof WilayahData; label: string }[] = [
    { key: "nama_fasilitas", label: "Nama Fasilitas" },
    { key: "jenis_fasilitas", label: "Jenis Fasilitas" },
    { key: "jumlah_fasilitas", label: "Jumlah" },
];

// ============================================================
// DAFTAR KATEGORI ASET
// ============================================================

const WELLS_CATEGORIES: string[] = [
    "Exploration & Delineation",
    "Producer",
    "Injector",
    "Total Sumur",
];

const SURFACE_CATEGORIES: string[] = [
    "Process Facilities",
    "Offshore Platforms",
    "Swamp Platforms",
    "Gas Compressors",
    "Pipeline",
];

const RIG_FIELDS: { key: keyof WilayahData; label: string }[] = [
    { key: "drilling_rigs", label: "Drilling Rigs" },
    { key: "workover_rigs", label: "Workover Rigs" },
];

const OverviewTab = () => {
    const [wilayahList, setWilayahList] = useState<WilayahData[]>([]);
    const [asetList, setAsetList] = useState<AsetData[]>([]);
    const [asetLoading, setAsetLoading] = useState(false);

    const [dataLoading, setDataLoading] = useState(true);
    const [selectedKode, setSelectedKode] = useState<string | null>(null);
    const [form, setForm] = useState<WilayahData | null>(null);

    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    async function fetchOverview() {
        setDataLoading(true);
        try {
            const res = await fetch("/api/overview/wilayah_kerja");
            const json = await res.json();
            setWilayahList(json.data ?? []);
        } catch (err) {
            console.error("Gagal memuat data overview:", err);
        } finally {
            setDataLoading(false);
        }
    }

    async function fetchAset(kode: string) {
        setAsetLoading(true);
        try {
            const res = await fetch(`/api/overview/wilayah_aset?wilayah_kerja=${encodeURIComponent(kode)}`);
            const json = await res.json();
            setAsetList(json.data ?? []);
        } catch (err) {
            console.error("Gagal memuat data aset:", err);
        } finally {
            setAsetLoading(false);
        }
    }

    useEffect(() => {
        fetchOverview();
    }, []);

    const sidebarList = useMemo(() => {
        return wilayahList.map((w) => ({ kode: w.kode, nama: w.nama_wilayah || w.kode }));
    }, [wilayahList]);

    function selectWilayah(kode: string) {
        setSelectedKode(kode);
        const existing = wilayahList.find((w) => w.kode === kode);
        setForm(existing ? { ...emptyWilayah(kode), ...existing } : emptyWilayah(kode));
        setSaveError(null);
        setSaveSuccess(false);
        fetchAset(kode);
    }

    function updateField(key: keyof WilayahData, value: string) {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    // ------------------------------------------------------------
    // handleChangeAset — sekarang identifikasi baris pakai (tipeAset + kategori),
    // BUKAN id, karena kategori yang belum ada datanya di database belum punya id.
    // Kalau baris untuk kategori itu belum ada di asetList, kita BUAT baris baru
    // di state (belum ke database, baru kesimpen pas "Simpan Perubahan").
    // ------------------------------------------------------------
    function handleChangeAset(
        tipeAset: string,
        kategori: string,
        field: "jumlah_active" | "jumlah_non_active" | "total",
        value: string
    ) {
        setAsetList((prev) => {
            const idx = prev.findIndex((a) => a.tipe_aset === tipeAset && a.kategori === kategori);

            if (idx === -1) {
                // Baris belum ada -> buat baru. id sementara pakai string kosong,
                // nanti backend yang generate id asli waktu disimpan.
                const newItem: AsetData = {
                    id: "",
                    wilayah_kerja: selectedKode ?? "",
                    tipe_aset: tipeAset,
                    kategori,
                    jumlah_active: null,
                    jumlah_non_active: null,
                    total: null,
                    [field]: value,
                };
                return [...prev, newItem];
            }

            // Baris sudah ada -> update field-nya saja
            return prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
        });
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form) return;

        setSaveLoading(true);

        const { kode, ...fields } = form;

        try {
            const res = await fetch(`/api/overview/wilayah_kerja/${encodeURIComponent(kode)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields),
            });
            const json = await res.json();

            if (!res.ok) {
                toastError(json.error || "Gagal menyimpan perubahan.");
                return;
            }

            toastSuccess("Perubahan wilayah kerja berhasil disimpan.");
            await fetchOverview();
        } catch {
            toastError("Gagal menyimpan perubahan. Periksa koneksi internet.");
        } finally {
            setSaveLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
            {/* ---------- Daftar wilayah kerja ---------- */}
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Wilayah Kerja</p>
                {dataLoading && <p className="text-xs text-slate-400">Memuat...</p>}
                {sidebarList.map((w) => (
                    <button
                        key={w.kode}
                        onClick={() => selectWilayah(w.kode)}
                        className={[
                            "cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                            selectedKode === w.kode ? "bg-blue-900 text-white" : "text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                    >
                        {w.nama}
                    </button>
                ))}
            </div>

            {/* ---------- Form edit ---------- */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                {!form ? (
                    <p className="text-sm text-slate-400">Pilih wilayah kerja di sebelah kiri untuk mulai mengedit.</p>
                ) : (
                    <form onSubmit={handleSave} className="flex flex-col gap-6">
                        <FieldSection title="Informasi Umum">
                            <TextInput label="Nama Wilayah Kerja" value={form.nama_wilayah} onChange={(v) => updateField("nama_wilayah", v)} />
                            <SelectInput
                                label="Provinsi"
                                value={form.provinsi}
                                onChange={(v) => updateField("provinsi", v)}
                                options={PROVINSI_SUMATERA}
                            />
                            <TextInput label="Kabupaten/Kota" value={form.kabupaten_kota} onChange={(v) => updateField("kabupaten_kota", v)} />
                            <SelectInput
                                label="Jenis Wilayah Kerja"
                                value={form.jenis_wk}
                                onChange={(v) => updateField("jenis_wk", v)}
                                options={JENIS_WK_OPTIONS}
                            />
                            <TextInput label="Tahun Berdiri" value={form.tahun_berdiri} onChange={(v) => updateField("tahun_berdiri", v)} />
                            <TextInput label="Luas Wilayah" value={form.luas_wilayah} onChange={(v) => updateField("luas_wilayah", v)} />
                            <TextInput label="Participating Interest" value={form.part_interest} onChange={(v) => updateField("part_interest", v)} />
                            <TextArea label="KKP / Komitmen Kerja Pasti" value={form.kkp} onChange={(v) => updateField("kkp", v)} />
                        </FieldSection>

                        <FieldSection title="Produksi">
                            <DateInput label="Tanggal Data" value={form.tanggal_produksi} onChange={(v) => updateField("tanggal_produksi", v)} />
                            {PRODUKSI_FIELDS.map((f) => (
                                <TextInput key={f.key} label={f.label} value={form[f.key]} onChange={(v) => updateField(f.key, v)} placeholder={f.placeholder} />
                            ))}
                        </FieldSection>

                        <FieldSection title="Fasilitas">
                            {FASILITAS_FIELDS.map((f) => (
                                <TextInput key={f.key} label={f.label} value={form[f.key]} onChange={(v) => updateField(f.key, v)} />
                            ))}
                        </FieldSection>

                        <FieldSection title="Number of Assets — Wells">
                            {asetLoading ? (
                                <p className="text-xs text-slate-400">Memuat...</p>
                            ) : (
                                <AsetTable
                                    headerLabel="Wells"
                                    categories={WELLS_CATEGORIES}
                                    tipeAset="wells"
                                    asetList={asetList}
                                    onChange={handleChangeAset}
                                />
                            )}
                        </FieldSection>

                        <FieldSection title="Number of Assets — Surface Facilities">
                            {asetLoading ? (
                                <p className="text-xs text-slate-400">Memuat...</p>
                            ) : (
                                <AsetTable
                                    headerLabel="Surface Facilities"
                                    categories={SURFACE_CATEGORIES}
                                    tipeAset="surface_facilities"
                                    asetList={asetList}
                                    onChange={handleChangeAset}
                                />
                            )}
                        </FieldSection>

                        <FieldSection title="Rigs">
                            {RIG_FIELDS.map((f) => (
                                <TextInput key={f.key} label={f.label} value={form[f.key]} onChange={(v) => updateField(f.key, v)} />
                            ))}
                        </FieldSection>

                        <button
                            type="submit"
                            disabled={saveLoading}
                            className="w-fit cursor-pointer rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saveLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

function FieldSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-blue-900">{title}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function TextInput({
    label, value, onChange, placeholder,
}: { label: string; value: string | null; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
            <input
                type="text"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
        </div>
    );
}

function TextArea({
    label, value, onChange,
}: { label: string; value: string | null; onChange: (v: string) => void }) {
    return (
        <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
            <textarea
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
        </div>
    );
}

function SelectInput({
    label, value, onChange, options,
}: { label: string; value: string | null; onChange: (v: string) => void; options: string[] }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
            <select
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}

function DateInput({
    label, value, onChange,
}: { label: string; value: string | null; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
            <input
                type="date"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
        </div>
    );
}

// ============================================================
// AsetTable — render dari daftar kategori TETAP (categories),
// isi nilainya dicari dari asetList (data database) kalau ada.
// ============================================================
function AsetTable({
    headerLabel, categories, tipeAset, asetList, onChange,
}: {
    headerLabel: string;
    categories: string[];
    tipeAset: string;
    asetList: AsetData[];
    onChange: (tipeAset: string, kategori: string, field: "jumlah_active" | "jumlah_non_active" | "total", value: string) => void;
}) {
    function findItem(kategori: string) {
        return asetList.find((a) => a.tipe_aset === tipeAset && a.kategori === kategori);
    }

    return (
        <div className="sm:col-span-2 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{headerLabel}</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">Active</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">Non-Active</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((kategori) => {
                        const item = findItem(kategori);
                        return (
                            <tr key={kategori} className="border-b border-slate-100 last:border-b-0">
                                <td className="px-4 py-2 text-slate-600">{kategori}</td>
                                {(["jumlah_active", "jumlah_non_active", "total"] as const).map((field) => (
                                    <td key={field} className="px-2 py-2">
                                        <input
                                            type="text"
                                            value={item?.[field] ?? ""}
                                            onChange={(e) => onChange(tipeAset, kategori, field, e.target.value)}
                                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-center text-sm outline-none focus:border-blue-500"
                                        />
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default OverviewTab;