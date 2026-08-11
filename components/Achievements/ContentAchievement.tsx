"use client";

import React, { useEffect, useState } from "react";

type TabKey = "produksi" | "rencana-kerja" | "hsse" | "inovasi" | "top-project" | "kehumasan";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "produksi", label: "Produksi", icon: "🛢️" },
    { key: "rencana-kerja", label: "Rencana Kerja", icon: "🏗️" },
    { key: "hsse", label: "HSSE", icon: "🍃" },
    { key: "inovasi", label: "Inovasi", icon: "💡" },
    { key: "top-project", label: "Top Project", icon: "🚀" },
    { key: "kehumasan", label: "Kehumasan", icon: "🤝" },
];

// ============================================================
// SUB-KOMPONEN
// ============================================================

function ProductionCard({
    title, unit, realisasi, target, percentValue, periode, accentColor,
}: {
    title: string;
    unit: string;
    realisasi: string;
    target: string;
    percentValue: number;
    periode: string;
    accentColor: "amber" | "sky" | "emerald";
}) {
    const colors = {
        amber: { bar: "bg-amber-500", text: "text-amber-600", chip: "bg-amber-50 text-amber-700" },
        sky: { bar: "bg-sky-500", text: "text-sky-600", chip: "bg-sky-50 text-sky-700" },
        emerald: { bar: "bg-emerald-500", text: "text-emerald-600", chip: "bg-emerald-50 text-emerald-700" },
    }[accentColor];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{periode}</p>
                </div>
                <span className={`rounded-full px-2.5 text-center py-1 text-xs font-bold ${colors.chip}`}>
                    {percentValue}% RKAP
                </span>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">{realisasi}</span>
                <span className="text-sm font-medium text-slate-400">{unit}</span>
            </div>

            <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={`h-full rounded-full ${colors.bar} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentValue}%` }}
                    />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Realisasi</span>
                    <span>Target: <span className={`font-semibold ${colors.text}`}>{target} {unit}</span></span>
                </div>
            </div>
        </div>
    );
}

const ITEMS_PER_PAGE = 10;
const COLLAPSED_COUNT = 5;

function RankedListCard({
    title, subtitle, items, accentColor,
}: {
    title: string;
    subtitle: string;
    items: { label: string; value: string; field: React.ReactNode }[];
    accentColor: "amber" | "sky";
}) {
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(1);

    const colors = {
        amber: { badge: "bg-amber-500", value: "text-amber-600" },
        sky: { badge: "bg-sky-500", value: "text-sky-600" },
    }[accentColor];

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

    let visibleItems: typeof items;
    let startNumber: number;

    if (!expanded) {
        visibleItems = items.slice(0, COLLAPSED_COUNT);
        startNumber = 1;
    } else {
        const start = (page - 1) * ITEMS_PER_PAGE;
        visibleItems = items.slice(start, start + ITEMS_PER_PAGE);
        startNumber = start + 1;
    }

    function handleToggleExpand() {
        setExpanded((prev) => !prev);
        setPage(1);
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>

            <div className="mt-4 flex flex-col divide-y divide-slate-100">
                {visibleItems.map((item, i) => (
                    <div key={startNumber + i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${colors.badge} text-xs font-bold text-white`}
                        >
                            {startNumber + i}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.field}</p>
                        </div>
                        <span className={`shrink-0 text-sm font-extrabold ${colors.value}`}>{item.value}</span>
                    </div>
                ))}
            </div>

            {/* Pagination — cuma muncul kalau sedang expanded dan totalnya lebih dari 1 halaman */}
            {expanded && totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            className={[
                                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                                page === p ? "bg-blue-900 text-white" : "text-slate-500 hover:bg-slate-100",
                            ].join(" ")}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ›
                    </button>
                </div>
            )}

            {items.length > COLLAPSED_COUNT && (
                <button
                    type="button"
                    onClick={handleToggleExpand}
                    className="mt-3 w-full cursor-pointer rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50"
                >
                    {expanded ? "Tampilkan lebih sedikit" : `Lihat semua (${items.length})`}
                </button>
            )}
        </div>
    );
}

function AccordionCard({ title, items, defaultOpen = false }: { title: string; items: string[]; defaultOpen?: boolean }) {
    return (
        <details
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 open:pb-5 hover:-translate-y-1 hover:shadow-lg"
            open={defaultOpen}
        >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-blue-900 [&::-webkit-details-marker]:hidden">
                {title}
                <svg
                    className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </summary>
            <ul className="mt-3 list-outside list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </details>
    );
}
type AwardItem = {
    text: string;
    medal: "gold" | "silver" | "bronze";
    imageUrl?: string;
};

const MEDAL_ICON: Record<AwardItem["medal"], string> = {
    gold: "🥇",
    silver: "🥈",
    bronze: "🥉",
};

function AwardPhoto({ imageUrl, alt }: { imageUrl?: string; alt: string }) {
    return imageUrl ? (
        <img
            src={imageUrl}
            alt={alt}
            className="mt-3 h-64 w-full rounded-lg object-cover"
        />
    ) : (
        <div className="mt-3 flex h-64 w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-100 text-slate-400">
            <svg
                className="h-8 w-8"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3l18 18M4.5 4.5v15h15v-4.5" />
            </svg>
            <span className="text-sm font-medium">Gambar belum tersedia</span>
        </div>
    );
}

function FieldAwardCard({ field, awards }: { field: string; awards: AwardItem[] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-bold text-blue-900">{field}</p>
            <div className="mt-4 flex flex-col divide-y divide-slate-100">
                {awards.map((award, i) => (
                    <div key={i} className={i > 0 ? "pt-5" : ""}>
                        <p className="flex items-start gap-2 text-sm font-medium text-blue-900">
                            <span className="shrink-0">{MEDAL_ICON[award.medal]}</span>
                            {award.text}
                        </p>
                        <AwardPhoto imageUrl={award.imageUrl} alt={award.text} />
                    </div>
                ))}
            </div>
        </div>
    );
}
// ============================================================
// KOMPONEN UTAMA
// ============================================================
function formatAngkaID(n: number) {
    return n.toLocaleString('en-US');
}

function formatTanggalID(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** Gabungkan jumlah minyak & gas jadi satu string ringkas, skip yang kosong. */
function formatJumlahProduksi(jumlahMinyak: number | null, jumlahGas: number | null) {
    const parts: string[] = [];
    if (jumlahMinyak !== null) parts.push(`${formatAngkaID(jumlahMinyak)} BOPD`);
    if (jumlahGas !== null) parts.push(`${formatAngkaID(jumlahGas)} MMSCFD`);
    return parts.join(" / ");
}

type ProduksiData = {
    jenis: "minyak" | "gas" | "migas";
    realisasi: number;
    target: number;
    periode: string;
    unit: string;
}

type RencanaKerja = {
    jenis_rk: string;
    nama_rk: string;
    jumlah_minyak: number | null;
    jumlah_gas: number | null;
    wilayah_kerja: string;
    urutan: number;
}

type Inovasi = {
    pencapaian: string;
    nama_inovasi: string;
    nama_acara: string;
    wilayah_kerja: string;
}

type Kehumasan = {
    wilayah_kerja: string;
    kategori: string;
    sub_kategori: string;
    medali: "gold" | "silver" | "bronze";
    urutan: number;
    image_url: string | null;
}

type Proper = {
    id: string;
    wilayah_kerja: string;
    peringkat: "Biru" | "Hijau" | "Emas";
    tahun: number;
    keterangan: string | null;
    urutan: number;
};

type SecurityItem = {
    id: string;
    judul: string;
    wilayah_kerja: string;
    tanggal: string;
    urutan: number;
};

type NaratifItem = {
    id: string;
    title: string;
    detail: string;
    urutan: number;
};

type AbiItem = {
    id: string;
    title: string;
    unit: string;
    realisasi: number;
    target: number;
    periode: string;
    urutan: number;
};

const AchievementsContent = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("produksi");
    const [produksiData, setProduksiData] = useState<Record<string, ProduksiData>>({});
    const [rencanaKerja, setRencanaKerja] = useState<Record<string, RencanaKerja[]>>({});
    const [inovasi, setInovasi] = useState<Inovasi[]>([]);
    const [kehumasan, setKehumasan] = useState<Kehumasan[]>([]);
    const goldCount = kehumasan.filter((item) => item.medali === 'gold').length;
    const silverCount = kehumasan.filter((item) => item.medali === 'silver').length;
    const bronzeCount = kehumasan.filter((item) => item.medali === 'bronze').length;
    const [proper, setProper] = useState<Proper[]>([]);
    const [security, setSecurity] = useState<SecurityItem[]>([]);
    const [naratifItems, setNaratifItems] = useState<NaratifItem[]>([]);
    const [abiItems, setAbiItems] = useState<AbiItem[]>([]);

    useEffect(() => {
        async function fetchProduksi() {

            try {
                const res = await fetch('/api/achievement/produksi');
                const json = await res.json();
                const map: Record<string, ProduksiData> = {};
                for (const row of json.data ?? []) {
                    map[row.jenis] = row
                }
                setProduksiData(map);
            }
            catch (err) {
                console.error("Gagal mengambil data produksi:", err);
            }
        }
        async function fetchRencanaKerja() {

            try {
                const res = await fetch('/api/achievement/rencana-kerja');
                const json = await res.json();
                const map: Record<string, RencanaKerja[]> = {};
                for (const row of json.data ?? []) {

                    if (!map[row.jenis_rk]) {
                        map[row.jenis_rk] = [];
                    }
                    // Masukkan data ke dalam array tersebut
                    map[row.jenis_rk].push(row);
                }
                setRencanaKerja(map);
            }
            catch (err) {
                console.error("Gagal mengambil data rencana kerja:", err);
            }
        }
        async function fetchInovasi() {

            try {
                const res = await fetch('/api/achievement/inovasi');
                const json = await res.json();
                setInovasi(json.data ?? []);
            }
            catch (err) {
                console.error("Gagal mengambil data inovasi:", err);
            }
        }
        async function fetchKehumasan() {

            try {
                const res = await fetch('/api/achievement/kehumasan');
                const json = await res.json();
                setKehumasan(json.data ?? []);
            }
            catch (err) {
                console.error("Gagal mengambil data kehumasan:", err);
            }
        }
        async function fetchProper() {
            try {
                const res = await fetch('/api/achievement/hsse/proper');
                const json = await res.json();
                setProper(json.data ?? []);
            }
            catch (err) {
                console.error("Gagal mengambil data proper:", err);
            }
        }
        async function fetchSecurity() {
            try {
                const res = await fetch('/api/achievement/hsse/security');
                const json = await res.json();
                setSecurity(json.data ?? []);
            }
            catch (err) {
                console.error("Gagal mengambil data security:", err);
            }
        }
        async function fetchNaratif() {
            try {
                const res = await fetch('/api/achievement/top-project-naratif');
                const json = await res.json();
                setNaratifItems(json.data ?? []);
            }
            catch (err) {
                console.error("Gagal mengambil data top project (naratif):", err);
            }
        }

        async function fetchAbi() {
            try {
                const res = await fetch('/api/achievement/top-project-abi');
                const json = await res.json();
                setAbiItems(json.data ?? []);
            }
            catch (err) {
                console.error("Gagal mengambil data top project (ABI NBD):", err);
            }
        }

        fetchProduksi()
        fetchRencanaKerja()
        fetchInovasi()
        fetchKehumasan()
        fetchNaratif()
        fetchAbi()
        fetchProper()
        fetchSecurity()
    }, []);

    const groupedKehumasan: Record<string, AwardItem[]> = {};
    for (const row of kehumasan) {
        if (!groupedKehumasan[row.wilayah_kerja]) {
            groupedKehumasan[row.wilayah_kerja] = [];
        }

        groupedKehumasan[row.wilayah_kerja].push({
            text: `Kategori ${row.kategori} Sub Kategori ${row.sub_kategori}`,
            medal: row.medali,
            imageUrl: row.image_url ?? undefined,
        });
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6">
            <div className="text-center">
                <h1 className="group relative z-10 mb-2 shrink-0 w-fit mx-auto cursor-default bg-linear-to-b from-blue-900 to-blue-500 bg-clip-text text-xl sm:text-2xl lg:text-3xl text-center font-bold text-transparent transition-transform duration-300 ease-out hover:-translate-y-1">Achievements Zona 1</h1>
                <p className="mt-1 text-sm text-slate-500">Temukan berbagai pencapaian terbaik Pertamina Zona 1 melalui enam kategori capaian di bawah ini.</p>
            </div>

            {/* Tab navigasi */}
            <div className="flex flex-wrap justify-center gap-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={[
                            "flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out",
                            activeTab === tab.key
                                ? "border-[#0D366D] bg-[#0D366D] text-white shadow-sm -translate-y-1"
                                : "border-[#0D366D]/30 bg-white text-slate-600 hover:border-[#0D366D]/70 hover:text-[#0D366D]/70",
                        ].join(" ")}
                    >
                        <span className="text-base">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Isi tab */}
            <div className="animate-page-fade-in" key={activeTab}>
                {activeTab === "produksi" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {produksiData.minyak && (
                            <>
                                <ProductionCard
                                    title="Produksi Minyak"
                                    unit={produksiData.minyak.unit ?? "-"}
                                    realisasi={formatAngkaID(produksiData.minyak.realisasi ?? "-")}
                                    target={formatAngkaID(produksiData.minyak.target ?? "-")}
                                    percentValue={Math.round((produksiData.minyak.realisasi / produksiData.minyak.target) * 100) || 0}
                                    periode={produksiData.minyak.periode ?? "-"}
                                    accentColor="amber"
                                />
                            </>
                        )}
                        {produksiData.gas && (
                            <ProductionCard
                                title="Produksi Gas"
                                unit={produksiData.gas.unit ?? "-"}
                                realisasi={formatAngkaID(produksiData.gas.realisasi ?? "-")}
                                target={formatAngkaID(produksiData.gas.target ?? "-")}
                                percentValue={Math.round((produksiData.gas.realisasi / produksiData.gas.target) * 100) || 0}
                                periode={produksiData.gas.periode ?? "-"}
                                accentColor="sky"
                            />
                        )}
                        {produksiData.migas && (
                            <ProductionCard
                                title="Produksi Migas"
                                unit={produksiData.migas.unit ?? "-"}
                                realisasi={formatAngkaID(produksiData.migas.realisasi ?? "-")}
                                target={formatAngkaID(produksiData.migas.target ?? "-")}
                                percentValue={Math.round((produksiData.migas.realisasi / produksiData.migas.target) * 100) || 0}
                                periode={produksiData.migas.periode ?? "-"}
                                accentColor="emerald"
                            />
                        )}

                    </div>
                )}

                {activeTab === "rencana-kerja" && (
                    <div className="flex flex-col gap-4">
                        {Object.entries(rencanaKerja).map(([jenisRk, items]) => (
                            <RankedListCard
                                key={jenisRk}
                                title={`Capaian RK ${jenisRk}`}
                                subtitle="Realisasi produksi terbaik"
                                accentColor="amber"
                                items={items
                                    .slice()
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((item) => ({
                                        label: item.nama_rk,
                                        field: item.wilayah_kerja,
                                        value: formatJumlahProduksi(item.jumlah_minyak, item.jumlah_gas),
                                    }))}
                            />
                        ))}

                        {/* Capaian OPTIMUS — sementara dikomentari, belum ada di backend
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                            <p className="text-sm font-semibold text-slate-500">Capaian OPTIMUS</p>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold tracking-tight text-slate-900">8,2</span>
                                <span className="text-sm font-medium text-slate-400">Juta USD</span>
                            </div>
                            <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                120% dari Target
                            </span>
                        </div>
                        */}
                    </div>
                )}

                {activeTab === "hsse" && (
                    <div className="flex flex-col gap-4">
                        {/* PROPER */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                            <p className="text-sm font-semibold text-slate-500">PROPER</p>
                            <div className="mt-4 flex flex-col gap-3">
                                {proper
                                    .slice()
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((item) => {
                                        const badgeStyle = {
                                            Biru: "bg-sky-100 text-sky-700",
                                            Hijau: "bg-emerald-100 text-emerald-700",
                                            Emas: "bg-amber-100 text-amber-700",
                                        }[item.peringkat];

                                        return (
                                            <div key={item.id} className="flex items-start gap-3">
                                                <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${badgeStyle}`}>
                                                    {item.peringkat} {item.tahun}
                                                </span>
                                                <p className="text-sm leading-relaxed text-slate-700">
                                                    {item.wilayah_kerja}
                                                    {item.keterangan ? ` — ${item.keterangan}` : ""}
                                                </p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* SECURITY */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                            <p className="text-sm font-semibold text-slate-500">SECURITY</p>
                            <div className="mt-4 flex flex-col divide-y divide-slate-100">
                                {security
                                    .slice()
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((event) => (
                                        <div key={event.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-800">{event.judul}</p>
                                                <p className="text-xs text-slate-400">{event.wilayah_kerja}</p>
                                            </div>
                                            <span className="shrink-0 text-xs font-medium text-slate-400">{formatTanggalID(event.tanggal)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Reduksi Emisi */}
                        <ProductionCard
                            title="Reduksi Emisi"
                            unit="Ton CO2eq"
                            realisasi="22.484"
                            target="18.582"
                            percentValue={121}
                            periode="YTD Oktober 2025"
                            accentColor="sky"
                        />
                    </div>
                )}

                {activeTab === "inovasi" && (
                    <RankedListCard
                        title="Capaian Inovasi"
                        subtitle="Penghargaan dan pencapaian inovasi Zona 1"
                        accentColor="sky"
                        items={inovasi.map((item) => ({
                            label: item.pencapaian,
                            field: (
                                <>
                                    <span className="font-semibold text-slate-600">{item.nama_inovasi}</span>
                                    {item.nama_inovasi && item.nama_acara && " - "}
                                    <span className="font-semibold text-slate-600">{item.nama_acara}</span>
                                    {`, ${item.wilayah_kerja}`}
                                </>
                            ),
                            value: ""
                        }))}
                    // items={[
                    //     { label: "Best Presentation", field: "PC Prove Velocity - Zona 1", value: "" },
                    //     { label: "Best Impact on Productivity", field: "Asia Pacific Quality Organization (APQO) - PC Prove Energy, Jambi Merang Field", value: "" },
                    //     { label: "Four Stars ★★★★", field: "Asia Pacific Quality Organization (APQO) - PC Prove Energy, Jambi Merang Field", value: "" },
                    //     { label: "2 Sertifikat Paten", field: "Kementrian Hukum RI - Finding Oil Losses Field Jambi (2025-2035)", value: "" },
                    // ]}
                    />
                )}

                {activeTab === "top-project" && (
                    <div className="flex flex-col gap-4">
                        {/* Pencapaian naratif */}
                        {naratifItems.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {naratifItems
                                    .slice()
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            <p className="text-sm font-bold leading-snug text-blue-900">{item.title}</p>
                                            <p className="mt-1.5 text-xs text-slate-500">{item.detail}</p>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Pencapaian ABI NBD (investasi vs realisasi) */}
                        {abiItems.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {abiItems
                                    .slice()
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((item, i) => (
                                        <ProductionCard
                                            key={item.id}
                                            title={item.title}
                                            unit={item.unit}
                                            realisasi={item.realisasi.toLocaleString("id-ID")}
                                            target={item.target.toLocaleString("id-ID")}
                                            percentValue={item.target > 0 ? Math.round((item.realisasi / item.target) * 100) : 0}
                                            periode={item.periode}
                                            accentColor={i % 2 === 0 ? "amber" : "sky"}
                                        />
                                    ))}
                            </div>
                        )}

                        {naratifItems.length === 0 && abiItems.length === 0 && (
                            <p className="text-center text-sm text-slate-400">Belum ada data top project.</p>
                        )}
                    </div>
                )}

                {activeTab === "kehumasan" && (
                    <div className="flex flex-col gap-4">
                        {/* Ringkasan medali (podium) */}
                        {/* Ringkasan medali (podium) */}
                        <div className="grid grid-cols-3 items-end gap-3">
                            {/* Gold */}
                            <div className="group relative -mt-8 overflow-hidden rounded-2xl border border-amber-300 bg-linear-to-b from-amber-50 to-white p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg">
                                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-300/30 blur-xl" />
                                <div className="flex items-center justify-center gap-2">
                                    {/* <span className="text-3xl drop-shadow-sm">🥇</span> */}
                                    <span className="text-4xl font-extrabold text-amber-600">{goldCount}</span>
                                </div>
                                <p className="mt-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">🥇 Gold Winner</p>
                            </div>

                            {/* Silver */}
                            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg">
                                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-slate-200/40 blur-xl" />
                                <div className="flex items-center justify-center gap-2">
                                    {/* <span className="text-2xl">🥈</span> */}
                                    <span className="text-4xl font-extrabold text-slate-500">{silverCount}</span>
                                </div>
                                <p className="mt-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">🥈 Silver Winner</p>
                            </div>


                            {/* Bronze */}
                            <div className="group relative overflow-hidden rounded-2xl border border-orange-200 bg-linear-to-b from-orange-50 to-white p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg">
                                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-200/40 blur-xl" />
                                <div className="flex items-center justify-center gap-2">
                                    {/* <span className="text-2xl">🥉</span> */}
                                    <span className="text-4xl font-extrabold text-orange-700">{bronzeCount}</span>
                                </div>
                                <p className="mt-1.5 text-xs font-bold uppercase tracking-wide text-orange-700">🥉 Bronze Winner</p>
                            </div>
                        </div>

                        {/* Detail per field */}
                        <div className="flex flex-col gap-4">
                            {Object.entries(groupedKehumasan).map(([field, awards]) => (
                                <FieldAwardCard
                                    key={field}
                                    field={field}
                                    awards={awards}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AchievementsContent;