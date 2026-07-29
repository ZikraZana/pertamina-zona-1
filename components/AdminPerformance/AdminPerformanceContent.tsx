"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

// ============================================================
// TIPE DATA WILAYAH KERJA (harus sama dengan yang di ContentOverview.tsx & /api/wilayah)
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
    jumlah: string | null;
    sumur_eksplorasi_active: string | null;
    sumur_eksplorasi_non_active: string | null;
    sumur_eksplorasi_total: string | null;
    producer_active: string | null;
    producer_non_active: string | null;
    producer_total: string | null;
    injector_active: string | null;
    injector_non_active: string | null;
    injector_total: string | null;
    sumur_total_active: string | null;
    sumur_total_non_active: string | null;
    sumur_total_total: string | null;
    process_facilities_active: string | null;
    process_facilities_non_active: string | null;
    process_facilities_total: string | null;
    offshore_platforms_active: string | null;
    offshore_platforms_non_active: string | null;
    offshore_platforms_total: string | null;
    swamp_platforms_active: string | null;
    swamp_platforms_non_active: string | null;
    swamp_platforms_total: string | null;
    gas_compressors_active: string | null;
    gas_compressors_non_active: string | null;
    gas_compressors_total: string | null;
    pipeline_active: string | null;
    pipeline_non_active: string | null;
    pipeline_total: string | null;
    drilling_rigs: string | null;
    workover_rigs: string | null;
};

const emptyWilayah = (kode: string): WilayahData => ({
    kode,
    nama_wilayah: null, provinsi: null, kabupaten_kota: null, jenis_wk: null, tahun_berdiri: null,
    luas_wilayah: null, part_interest: null, kkp: null, produksi_minyak: null, produksi_gas: null,
    tanggal_produksi: null, nama_fasilitas: null, jenis_fasilitas: null, jumlah: null,
    sumur_eksplorasi_active: null, sumur_eksplorasi_non_active: null, sumur_eksplorasi_total: null,
    producer_active: null, producer_non_active: null, producer_total: null,
    injector_active: null, injector_non_active: null, injector_total: null,
    sumur_total_active: null, sumur_total_non_active: null, sumur_total_total: null,
    process_facilities_active: null, process_facilities_non_active: null, process_facilities_total: null,
    offshore_platforms_active: null, offshore_platforms_non_active: null, offshore_platforms_total: null,
    swamp_platforms_active: null, swamp_platforms_non_active: null, swamp_platforms_total: null,
    gas_compressors_active: null, gas_compressors_non_active: null, gas_compressors_total: null,
    pipeline_active: null, pipeline_non_active: null, pipeline_total: null,
    drilling_rigs: null, workover_rigs: null,
});

const DEFAULT_WILAYAH_LIST: { kode: string; nama: string }[] = [
    { kode: "nso", nama: "North Sumatra Offshore (NSO)" },
    { kode: "p-susu", nama: "Pangkalan Susu" },
    { kode: "rantau", nama: "Rantau" },
    { kode: "lirik", nama: "Lirik" },
    { kode: "jambi", nama: "Jambi" },
    { kode: "jambi-merang", nama: "Jambi Merang" },
];

const TEXT_FIELDS: { key: keyof WilayahData; label: string }[] = [
    { key: "nama_wilayah", label: "Nama Wilayah" },
    { key: "provinsi", label: "Provinsi" },
    { key: "kabupaten_kota", label: "Kabupaten/Kota" },
    { key: "jenis_wk", label: "Jenis Wilayah Kerja" },
    { key: "tahun_berdiri", label: "Tahun Berdiri" },
    { key: "luas_wilayah", label: "Luas Wilayah" },
    { key: "part_interest", label: "Participating Interest" },
];

const PRODUKSI_FIELDS: { key: keyof WilayahData; label: string; placeholder?: string }[] = [
    { key: "tanggal_produksi", label: "Tanggal Data (YYYY-MM-DD)", placeholder: "2025-10-31" },
    { key: "produksi_minyak", label: "Produksi Minyak (Mbopd)" },
    { key: "produksi_gas", label: "Produksi Gas (MMscfd)" },
];

const FASILITAS_FIELDS: { key: keyof WilayahData; label: string }[] = [
    { key: "nama_fasilitas", label: "Nama Fasilitas" },
    { key: "jenis_fasilitas", label: "Jenis Fasilitas" },
    { key: "jumlah", label: "Jumlah" },
];

const SUMUR_GROUPS: { prefix: string; label: string }[] = [
    { prefix: "sumur_eksplorasi", label: "Exploration & Delineation" },
    { prefix: "producer", label: "Producer" },
    { prefix: "injector", label: "Injector" },
    { prefix: "sumur_total", label: "Total Sumur" },
];

const SURFACE_GROUPS: { prefix: string; label: string }[] = [
    { prefix: "process_facilities", label: "Process Facilities" },
    { prefix: "offshore_platforms", label: "Offshore Platforms" },
    { prefix: "swamp_platforms", label: "Swamp Platforms" },
    { prefix: "gas_compressors", label: "Gas Compressors" },
    { prefix: "pipeline", label: "Pipeline" },
];

const RIG_FIELDS: { key: keyof WilayahData; label: string }[] = [
    { key: "drilling_rigs", label: "Drilling Rigs" },
    { key: "workover_rigs", label: "Workover Rigs" },
];

const AdminPerformanceContent = () => {
    // ============================================================
    // STATE & LOGIC AUTH — sama persis dengan yang dipakai di
    // PerformanceContent.tsx, supaya session & role-nya konsisten
    // (satu akun admin untuk semua halaman dashboard).
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
            password,
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

            if (profile?.role === "admin") {
                setRole("admin");
            } else {
                setRole("user");
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
    // DATA OVERVIEW — daftar wilayah kerja & form edit
    // ============================================================
    const [wilayahMap, setWilayahMap] = useState<Record<string, WilayahData>>({});
    const [dataLoading, setDataLoading] = useState(true);
    const [selectedKode, setSelectedKode] = useState<string | null>(null);
    const [form, setForm] = useState<WilayahData | null>(null);

    const [newKode, setNewKode] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);

    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    async function fetchOverview() {
        setDataLoading(true);
        try {
            const res = await fetch("/api/wilayah");
            const json = await res.json();
            setWilayahMap(json.data ?? {});
        } catch (err) {
            console.error("Gagal memuat data overview:", err);
        } finally {
            setDataLoading(false);
        }
    }

    useEffect(() => {
        if (role === "admin") {
            fetchOverview();
        }
    }, [role]);

    // Gabungkan daftar wilayah kerja default dengan yang sudah ada di DB
    const wilayahList = useMemo(() => {
        const list = [...DEFAULT_WILAYAH_LIST];
        for (const kode of Object.keys(wilayahMap)) {
            if (!list.some((w) => w.kode === kode)) {
                list.push({ kode, nama: wilayahMap[kode]?.nama_wilayah || kode });
            }
        }
        return list.map((w) => ({ ...w, nama: wilayahMap[w.kode]?.nama_wilayah || w.nama }));
    }, [wilayahMap]);

    function selectWilayah(kode: string) {
        setSelectedKode(kode);
        setForm(wilayahMap[kode] ? { ...emptyWilayah(kode), ...wilayahMap[kode] } : emptyWilayah(kode));
        setSaveError(null);
        setSaveSuccess(false);
    }

    function handleAddWilayah(e: React.FormEvent) {
        e.preventDefault();
        const kode = newKode.trim().toLowerCase().replace(/\s+/g, "-");
        if (!kode) return;
        selectWilayah(kode);
        setNewKode("");
        setShowAddForm(false);
    }

    function updateField(key: keyof WilayahData, value: string) {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form) return;

        setSaveLoading(true);
        setSaveError(null);
        setSaveSuccess(false);

        const { kode, ...fields } = form;

        try {
            const res = await fetch(`/api/wilayah/${encodeURIComponent(kode)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields),
            });
            const json = await res.json();

            if (!res.ok) {
                setSaveError(json.error || "Gagal menyimpan perubahan.");
                return;
            }

            setSaveSuccess(true);
            await fetchOverview();
        } catch {
            setSaveError("Gagal menyimpan perubahan. Periksa koneksi internet.");
        } finally {
            setSaveLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-100 p-3 sm:p-4 lg:p-6">
            <div className="mx-auto mb-4 w-full max-w-5xl">
                <h1 className="group relative z-10 mb-1 w-fit cursor-default bg-linear-to-b from-blue-900 to-blue-500 bg-clip-text text-xl font-bold text-transparent transition-transform duration-300 ease-out hover:-translate-y-1 sm:text-2xl lg:text-3xl">
                    Admin — Wilayah Kerja
                </h1>
                <p className="text-sm text-blue-900/70">
                    Kelola data yang tampil di halaman Overview.
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
                        Silakan login untuk mengakses halaman admin.
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
                            className="mt-1 cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                        >
                            Masuk
                        </button>
                    </form>
                </div>
            )}

            {/* ================= Sudah login tapi bukan admin ================= */}
            {!authLoading && user && role === "user" && (
                <div className="mx-auto w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-lg">
                    <p className="mb-4 text-sm text-amber-700">
                        Akun <span className="font-semibold">{user.email}</span> tidak memiliki akses admin.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                        Logout
                    </button>
                </div>
            )}

            {/* ================= Sudah login sebagai admin ================= */}
            {!authLoading && user && role === "admin" && (
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                    <div className="flex flex-col items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
                        <div className="text-sm text-slate-600">
                            Masuk sebagai <span className="font-semibold text-blue-900">{user.email}</span>
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                Admin
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
                        {/* ---------- Daftar wilayah kerja ---------- */}
                        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Wilayah Kerja</p>
                            {dataLoading && <p className="text-xs text-slate-400">Memuat...</p>}
                            {wilayahList.map((w) => (
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

                            {!showAddForm ? (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="mt-2 cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-left text-xs font-semibold text-slate-500 hover:bg-slate-50"
                                >
                                    + Tambah Wilayah Kerja
                                </button>
                            ) : (
                                <form onSubmit={handleAddWilayah} className="mt-2 flex flex-col gap-2 rounded-lg border border-slate-200 p-2">
                                    <input
                                        type="text"
                                        value={newKode}
                                        onChange={(e) => setNewKode(e.target.value)}
                                        placeholder="mis. sungai-gerong"
                                        className="rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 cursor-pointer rounded-md bg-blue-900 px-2 py-1.5 text-xs font-semibold text-white hover:bg-blue-800">
                                            Tambah
                                        </button>
                                        <button type="button" onClick={() => setShowAddForm(false)} className="cursor-pointer rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100">
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* ---------- Form edit ---------- */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            {!form ? (
                                <p className="text-sm text-slate-400">Pilih wilayah kerja di sebelah kiri untuk mulai mengedit.</p>
                            ) : (
                                <form onSubmit={handleSave} className="flex flex-col gap-6">
                                    <FieldSection title="Info Umum">
                                        {TEXT_FIELDS.map((f) => (
                                            <TextInput key={f.key} label={f.label} value={form[f.key]} onChange={(v) => updateField(f.key, v)} />
                                        ))}
                                        <TextArea label="KKP / Komitmen Kerja Pasti" value={form.kkp} onChange={(v) => updateField("kkp", v)} />
                                    </FieldSection>

                                    <FieldSection title="Produksi">
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
                                        {SUMUR_GROUPS.map((g) => (
                                            <TripleField key={g.prefix} label={g.label} prefix={g.prefix} form={form} updateField={updateField} />
                                        ))}
                                    </FieldSection>

                                    <FieldSection title="Number of Assets — Surface Facilities">
                                        {SURFACE_GROUPS.map((g) => (
                                            <TripleField key={g.prefix} label={g.label} prefix={g.prefix} form={form} updateField={updateField} />
                                        ))}
                                    </FieldSection>

                                    <FieldSection title="Rig">
                                        {RIG_FIELDS.map((f) => (
                                            <TextInput key={f.key} label={f.label} value={form[f.key]} onChange={(v) => updateField(f.key, v)} />
                                        ))}
                                    </FieldSection>

                                    {saveError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{saveError}</p>}
                                    {saveSuccess && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">Perubahan tersimpan.</p>}

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
                </div>
            )}
        </div>
    );
};

// ============================================================
// SUB-KOMPONEN FORM
// ============================================================

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

function TripleField({
    label, prefix, form, updateField,
}: {
    label: string;
    prefix: string;
    form: WilayahData;
    updateField: (key: keyof WilayahData, value: string) => void;
}) {
    const activeKey = `${prefix}_active` as keyof WilayahData;
    const nonActiveKey = `${prefix}_non_active` as keyof WilayahData;
    const totalKey = `${prefix}_total` as keyof WilayahData;

    return (
        <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
            <div className="grid grid-cols-3 gap-2">
                <input
                    type="text"
                    value={form[activeKey] ?? ""}
                    onChange={(e) => updateField(activeKey, e.target.value)}
                    placeholder="Active"
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                />
                <input
                    type="text"
                    value={form[nonActiveKey] ?? ""}
                    onChange={(e) => updateField(nonActiveKey, e.target.value)}
                    placeholder="Non-Active"
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                />
                <input
                    type="text"
                    value={form[totalKey] ?? ""}
                    onChange={(e) => updateField(totalKey, e.target.value)}
                    placeholder="Total"
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                />
            </div>
        </div>
    );
}

export default AdminPerformanceContent;