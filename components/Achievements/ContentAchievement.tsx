"use client";

import { useEffect, useState } from "react";

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
    accentColor: "amber" | "sky";
}) {
    const colors = {
        amber: { bar: "bg-amber-500", text: "text-amber-600", chip: "bg-amber-50 text-amber-700" },
        sky: { bar: "bg-sky-500", text: "text-sky-600", chip: "bg-sky-50 text-sky-700" },
    }[accentColor];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{periode}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${colors.chip}`}>
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

function RankedListCard({
    title, subtitle, items, accentColor,
}: {
    title: string;
    subtitle: string;
    items: { label: string; value: string; field: string }[];
    accentColor: "amber" | "sky";
}) {
    const colors = {
        amber: { badge: "bg-amber-500", value: "text-amber-600" },
        sky: { badge: "bg-sky-500", value: "text-sky-600" },
    }[accentColor];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>

            <div className="mt-4 flex flex-col divide-y divide-slate-100">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${colors.badge} text-xs font-bold text-white`}
                        >
                            {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.field}</p>
                        </div>
                        <span className={`shrink-0 text-sm font-extrabold ${colors.value}`}>{item.value}</span>
                    </div>
                ))}
            </div>
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
    return n.toLocaleString('id-ID');
}

type ProduksiData = {
    jenis: "minyak" | "gas";
    realisasi: number;
    target: number;
    periode: string;
    unit: string;
}

type RencanaKerja = {
    jenis_rk: string;
    nama_rk: string;
    jenis_produksi: "minyak" | "gas";
    jumlah_produksi: number;
    wilayah_kerja: string;
}

type Inovasi = {
    pencapaian: string;
    nama_inovasi: string;
    nama_acara: string;
    wilayah_kerja: string;
}


const AchievementsContent = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("produksi");
    const [produksiData, setProduksiData] = useState<Record<string, ProduksiData>>({});
    const [rencanaKerja, setRencanaKerja] = useState<Record<string, RencanaKerja[]>>({});
    const [inovasi, setInovasi] = useState<Inovasi[]>([]);

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

        fetchProduksi()
        fetchRencanaKerja()
        fetchInovasi()
    }, []);

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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                    </div>
                )}

                {activeTab === "rencana-kerja" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {rencanaKerja.Bor && (
                            <>
                                <RankedListCard
                                    title="Top 5 Capaian RK Bor"
                                    subtitle="Realisasi produksi sumur terbaik"
                                    accentColor="amber"
                                    items={
                                        rencanaKerja.Bor
                                            .sort((a, b) => b.jumlah_produksi - a.jumlah_produksi)
                                            .slice(0, 5)
                                            .map((item) => ({
                                                label: item.nama_rk,
                                                field: item.wilayah_kerja,
                                                value: formatAngkaID(item.jumlah_produksi)
                                            }))
                                    }
                                />
                            </>
                        )}

                        <div className="flex flex-col gap-4">
                            {rencanaKerja.Workover && (
                                <>
                                    <RankedListCard
                                        title="Pencapaian RK Workover"
                                        subtitle="Realisasi produksi hasil workover"
                                        accentColor="sky"
                                        items={
                                            rencanaKerja.Workover
                                                .sort((a, b) => b.jumlah_produksi - a.jumlah_produksi)
                                                .slice(0, 5)
                                                .map((item) => ({
                                                    label: item.nama_rk,
                                                    field: item.wilayah_kerja,
                                                    value: formatAngkaID(item.jumlah_produksi)
                                                }))
                                        }
                                    />
                                </>
                            )}

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
                        </div>
                    </div>
                )}

                {activeTab === "hsse" && (
                    <div className="flex flex-col gap-4">
                        {/* PROPER */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                            <p className="text-sm font-semibold text-slate-500">PROPER</p>
                            <div className="mt-4 flex flex-col gap-3">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                                        Biru
                                    </span>
                                    <p className="text-sm leading-relaxed text-slate-700">
                                        Semua Field di Zona 1 mendapatkan peringkat ini (Rapor Sementara tahun 2025).
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                        Calon Hijau
                                    </span>
                                    <p className="text-sm leading-relaxed text-slate-700">
                                        4 Field: NSO, Rantau, Pangkalan Susu, Jambi Merang.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                                        Emas 2024
                                    </span>
                                    <p className="text-sm leading-relaxed text-slate-700">
                                        Diraih PEP Field Rantau. PROPER Hijau diraih PEP Field Pangkalan Susu, PEP Field Jambi, dan PHE Jambi Merang.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECURITY */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                            <p className="text-sm font-semibold text-slate-500">SECURITY</p>
                            <div className="mt-4 flex flex-col divide-y divide-slate-100">
                                {[
                                    { text: "Penggagalan dan Penangkapan Pelaku Illegal Tapping", field: "Rantau", date: "11 Feb 2025" },
                                    { text: "Penggagalan ITAP Trunkline Kenali Asam – Ketaling", field: "Jambi", date: "31 Mei 2025" },
                                    { text: "Penangkapan tangan pelaku ITAP", field: "Jambi", date: "24 Sept 2025" },
                                    { text: "Penggagalan ITAP di KP 04 SKN", field: "Jambi Merang", date: "27 Agt 2025" },
                                ].map((event, i) => (
                                    <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-800">{event.text}</p>
                                            <p className="text-xs text-slate-400">{event.field}</p>
                                        </div>
                                        <span className="shrink-0 text-xs font-medium text-slate-400">{event.date}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3">
                                <p className="text-sm font-semibold text-amber-800">
                                    Predikat Gold — 5 Field
                                </p>
                                <p className="mt-0.5 text-xs text-amber-700">
                                    Rantau, Pangkalan Susu, Lirik, Jambi, Jambi Merang — Audit Sistem Manajemen Pengamanan (SMP) 2025
                                </p>
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
                            field: [item.nama_inovasi, item.nama_acara].filter(Boolean).join(" - ") + `, ${item.wilayah_kerja}`,
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {[
                                {
                                    title: "New Technology Velocity String",
                                    detail: "PPS-12 dan PPS-15",
                                },
                                {
                                    title: "Rejuvenation Mature Oil Field",
                                    detail: "Pulau Panjang – Pangkalan Susu",
                                },
                                {
                                    title: "POPE Padang Pancuran",
                                    detail: "Desember 2025",
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <p className="text-sm font-bold leading-snug text-blue-900">{item.title}</p>
                                    <p className="mt-1.5 text-xs text-slate-500">{item.detail}</p>
                                </div>
                            ))}
                        </div>

                        {/* Pencapaian ABI NBD (investasi vs realisasi) */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <ProductionCard
                                title="ABI NBD Asset Integrity"
                                unit="Juta USD"
                                realisasi="9,3"
                                target="11,8"
                                percentValue={79}
                                periode="18 ABI NBD terselesaikan · Cost Saving 21%"
                                accentColor="amber"
                            />
                            <ProductionCard
                                title="ABI NBD HSSE & Process Safety"
                                unit="Juta USD"
                                realisasi="1,6"
                                target="1,8"
                                percentValue={89}
                                periode="4 ABI NBD terselesaikan · Cost Saving 11%"
                                accentColor="sky"
                            />
                            <ProductionCard
                                title="ABI NBD Fasilitas Produksi"
                                unit="Juta USD"
                                realisasi="2,2"
                                target="2,6"
                                percentValue={85}
                                periode="4 ABI NBD terselesaikan · Cost Saving 15,38%"
                                accentColor="amber"
                            />
                        </div>
                    </div>
                )}

                {activeTab === "kehumasan" && (
                    <div className="flex flex-col gap-4">
                        {/* Ringkasan medali (podium) */}
                        <div className="grid grid-cols-3 items-end gap-3">
                            {/* Silver */}
                            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg">
                                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-slate-200/40 blur-xl" />
                                <span className="text-3xl">🥈</span>
                                <p className="mt-2 flex items-center justify-center gap-1.5">
                                    {/* <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-sm font-extrabold text-white">
                                        1
                                    </span> */}
                                </p>
                                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">1 Silver Winner</p>
                            </div>

                            {/* Gold */}
                            <div className="group relative -mt-8 overflow-hidden rounded-2xl border border-amber-300 bg-linear-to-b from-amber-50 to-white p-5 text-center shadow-lg ring-1 ring-amber-200 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl">
                                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-300/30 blur-xl" />
                                <span className="text-4xl drop-shadow-sm">🥇</span>
                                <p className="mt-2 flex items-center justify-center gap-1.5">
                                    {/* <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-base font-extrabold text-white shadow-sm">
                                        2
                                    </span> */}
                                </p>
                                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-amber-700">2 Gold Winner</p>
                            </div>

                            {/* Bronze */}
                            <div className="group relative overflow-hidden rounded-2xl border border-orange-200 bg-linear-to-b from-orange-50 to-white p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg">
                                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-200/40 blur-xl" />
                                <span className="text-3xl">🥉</span>
                                <p className="mt-2 flex items-center justify-center gap-1.5">
                                    {/* <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm font-extrabold text-white">
                                        2
                                    </span> */}
                                </p>
                                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-orange-700">2 Bronze Winner</p>
                            </div>
                        </div>

                        {/* Detail per field */}
                        {/* Detail per field */}
                        <div className="flex flex-col gap-4">
                            <FieldAwardCard
                                field="PT Pertamina EP Rantau Field"
                                awards={[
                                    {
                                        text: "Kategori Manajemen Krisis Sub Kategori Krisis & Pasca Krisis",
                                        medal: "gold",
                                        //imageUrl: "/images/kehumasan/rantau-gold.jpg",
                                    },
                                    {
                                        text: "Kategori Program Komunikasi Social Responsibility Sub Kategori Community Based Development",
                                        medal: "bronze",
                                        //imageUrl: "/images/kehumasan/rantau-bronze.jpg",
                                    },
                                ]}
                            />
                            <FieldAwardCard
                                field="PT Pertamina EP Jambi Field"
                                awards={[
                                    {
                                        text: "Kategori Program Komunikasi Social Responsibility Sub Kategori Community Based Development",
                                        medal: "silver",
                                        // imageUrl belum diisi -> tampil placeholder (Foto)
                                    },
                                ]}
                            />
                            <FieldAwardCard
                                field="PT Pertamina EP Lirik Field"
                                awards={[
                                    {
                                        text: "Kategori Manajemen Krisis Sub Kategori Krisis & Pasca Krisis",
                                        medal: "gold",

                                    },
                                ]}
                            />
                            <FieldAwardCard
                                field="PT Pertamina EP Pangkalan Susu Field"
                                awards={[
                                    {
                                        text: "Kategori Program Komunikasi Social Responsibility Sub Kategori Community Based Development",
                                        medal: "bronze",

                                    },
                                ]}
                            />
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default AchievementsContent;