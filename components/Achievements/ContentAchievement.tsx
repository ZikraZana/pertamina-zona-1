"use client";

import { useState } from "react";

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

function FieldAwardCard({ field, awards }: { field: string; awards: string[] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-blue-900">{field}</p>
            <ul className="space-y-2">
                {awards.map((award, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {award}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================

const AchievementsContent = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("produksi");

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
                        <ProductionCard
                            title="Produksi Minyak"
                            unit="BOPD"
                            realisasi="19.899"
                            target="21.845"
                            percentValue={91}
                            periode="YTD November 2025 · AR Nov 2025"
                            accentColor="amber"
                        />
                        <ProductionCard
                            title="Produksi Gas"
                            unit="MMSCFD"
                            realisasi="223,94"
                            target="246,15"
                            percentValue={91}
                            periode="YTD November 2025 · AR Nov 2025"
                            accentColor="sky"
                        />
                    </div>
                )}

                {activeTab === "rencana-kerja" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <RankedListCard
                        title="Top 5 Capaian RK Bor"
                        subtitle="Realisasi produksi sumur terbaik"
                        accentColor="amber"
                        items={[
                            { label: "PPS-015A", field: "Field Jambi", value: "848,35 BOPD" },
                            { label: "PPS-020", field: "Field Jambi", value: "330,31 BOPD" },
                            { label: "PPJ-068", field: "Field Pangkalan Susu", value: "179,19 BOPD" },
                            { label: "PPJ-067", field: "Field Pangkalan Susu", value: "129,44 BOPD" },
                            { label: "P-474", field: "Field Rantau", value: "70 BOPD" },
                        ]}
                    />
                    <div className="flex flex-col gap-4">
                        <RankedListCard
                            title="Pencapaian RK Workover"
                            subtitle="Realisasi produksi hasil workover"
                            accentColor="sky"
                            items={[
                                { label: "PPS-015B", field: "Field Jambi", value: "317,04 BOPD" },
                                { label: "PPS-12", field: "Field Jambi", value: "135,46 BOPD" },
                            ]}
                        />
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
                        items={[
                            { label: "Best Presentation", field: "PC Prove Velocity - Zona 1", value: "" },
                            { label: "Best Impact on Productivity", field: "Asia Pacific Quality Organization (APQO) - PC Prove Energy, Jambi Merang Field", value: "" },
                            { label: "Four Stars ★★★★", field: "Asia Pacific Quality Organization (APQO) - PC Prove Energy, Jambi Merang Field", value: "" },
                            { label: "2 Sertifikat Paten", field: "Kementrian Hukum RI - Finding Oil Losses Field Jambi (2025-2035)", value: "" },
                        ]}
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
                        {/* Ringkasan medali */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                                <p className="text-3xl font-extrabold text-amber-600">2</p>
                                <p className="mt-1 text-xs font-semibold text-amber-700">Gold Winner</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 text-center">
                                <p className="text-3xl font-extrabold text-slate-500">1</p>
                                <p className="mt-1 text-xs font-semibold text-slate-600">Silver Winner</p>
                            </div>
                            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center">
                                <p className="text-3xl font-extrabold text-orange-700">2</p>
                                <p className="mt-1 text-xs font-semibold text-orange-700">Bronze Winner</p>
                            </div>
                        </div>

                        {/* Detail per field */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FieldAwardCard
                                field="PT Pertamina EP Rantau Field"
                                awards={[
                                    "Kategori Manajemen Krisis Sub Kategori Krisis & Pasca Krisis — GOLD WINNER",
                                    "Kategori Program Komunikasi Social Responsibility Sub Kategori Community Based Development — BRONZE WINNER",
                                ]}
                            />
                            <FieldAwardCard
                                field="PT Pertamina EP Jambi Field"
                                awards={[
                                    "Kategori Program Komunikasi Social Responsibility Sub Kategori Community Based Development — SILVER WINNER",
                                ]}
                            />
                            <FieldAwardCard
                                field="PT Pertamina EP Lirik Field"
                                awards={[
                                    "Kategori Manajemen Krisis Sub Kategori Krisis & Pasca Krisis — GOLD WINNER",
                                ]}
                            />
                            <FieldAwardCard
                                field="PT Pertamina EP Pangkalan Susu Field"
                                awards={[
                                    "Kategori Program Komunikasi Social Responsibility Sub Kategori Community Based Development — BRONZE WINNER",
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