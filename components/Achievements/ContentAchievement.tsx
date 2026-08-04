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

function StatCard({ title, percent, detail }: { title: string; percent: string; detail: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
            <p className="mt-2 text-4xl font-extrabold text-blue-900">{percent}</p>
            <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
    );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-blue-900">{title}</p>
            <ul className="list-outside list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function AccordionCard({ title, items, defaultOpen = false }: { title: string; items: string[]; defaultOpen?: boolean }) {
    return (
        <details
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm open:pb-5"
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
                <p className="mt-1 text-sm text-slate-500">Temukan berbagai pencapaian terbaik Pertamina Zona 1 melalui enam kategori utama di bawah ini.</p>
            </div>

            {/* Tab navigasi */}
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
                        <StatCard
                            title="Produksi Minyak"
                            percent="91%"
                            detail="19.899 BOPD realisasi / 21.845 BOPD target RKAP (YTD November 2025, AR Nov 2025)"
                        />
                        <StatCard
                            title="Produksi Gas"
                            percent="91%"
                            detail="223.94 MMSCFD realisasi / 246.15 MMSCFD target RKAP (YTD November 2025, AR Nov 2025)"
                        />
                    </div>
                )}

                {activeTab === "rencana-kerja" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ListCard
                            title="Top 5 Capaian RK Bor"
                            items={[
                                "PPS-015A – 848.35 BOPD (Field Jambi)",
                                "PPS-020 – 330.31 BOPD (Field Jambi)",
                                "PPJ-068 – 179.19 BOPD (Field Pangkalan Susu)",
                                "PPJ-067 – 129.44 BOPD (Field Pangkalan Susu)",
                                "P-474 – 70 BOPD (Field Rantau)",
                            ]}
                        />
                        <ListCard
                            title="Pencapaian RK Workover"
                            items={[
                                "PPS-015B – 317.04 BOPD (Field Jambi)",
                                "PPS-12 – 135.46 BOPD (Field Jambi)",
                                "Capaian OPTIMUS 8.2 Juta (120% dari Target)",
                            ]}
                        />
                    </div>
                )}

                {activeTab === "hsse" && (
                    <div className="flex flex-col gap-4">
                        <AccordionCard
                            title="PROPER"
                            defaultOpen
                            items={[
                                "Semua Field di Zona 1 mendapatkan peringkat Biru (Rapor Sementara tahun 2025). Calon Kandidat Hijau untuk 4 Field (NSO, Rantau, Pangkalan Susu, Jambi Merang).",
                                "Pada Tahun 2024, PROPER Emas diraih PEP Field Rantau. PROPER Hijau diraih PEP Field Pangsu, PEP Field Jambi, dan PHE Jambi Merang.",
                            ]}
                        />
                        <AccordionCard
                            title="SECURITY"
                            items={[
                                "Penggagalan dan Penangkapan Pelaku Illegal Tapping – Rantau (11 Februari 2025)",
                                "Penggagalan ITAP Trunkline Kenali Asam – Ketaling – Jambi (31 Mei 2025)",
                                "Penangkapan tangan pelaku ITAP – Jambi (24 Sept 2025)",
                                "Penggagalan ITAP di KP 04 SKN – Jambi Merang (27 Agt 2025)",
                                "Predikat Gold diraih 5 field (Rantau, Pangsu, Lirik, Jambi, Jambi Merang) dalam pelaksanaan Audit Sistem Manajemen Pengamanan (SMP) tahun 2025",
                            ]}
                        />
                        <AccordionCard
                            title="Lainnya"
                            items={[
                                "Pencapaian Realisasi Reduksi Emisi sebesar 22.484 Ton CO2eq (YTD Okt 25) atau 121% dari Target 2025",
                            ]}
                        />
                    </div>
                )}

                {activeTab === "inovasi" && (
                    <ListCard
                        title="Capaian Inovasi"
                        items={[
                            "Best Presentation PC Prove Velocity - Zona 1",
                            "Best Impact on Productivity pada Asia Pacific Quality Organization (APQO) - PC Prove Energy (Jambi Merang Field - Zona 1)",
                            "Four Stars ★★★★ pada Asia Pacific Quality Organization (APQO) - PC Prove Energy (Jambi Merang Field - Zona 1)",
                            "2 Sertifikat Paten dari Kementrian Hukum Republik Indonesia - Finding Oil Losses Field Jambi - (2025-2035)",
                        ]}
                    />
                )}

                {activeTab === "top-project" && (
                    <ListCard
                        title="Capaian Top Project"
                        items={[
                            "Keberhasilan aplikasi new technology Velocity String – (PPS-12 dan PPS-15)",
                            "Rejuvenation of mature oil field: Pulau Panjang – Pangkalan Susu",
                            "POPE Padang Pancuran, Desember 2025",
                            "Terselesainya 18 ABI NBD Asset Integrity dengan rencana investasi 11.8 Juta USD dan realisasi 9.3 Juta USD (Cost Saving 21%)",
                            "Terselesainya 4 ABI NBD HSSE dan Process Safety dengan investasi 1.8 Juta USD dan realisasi 1.6 Juta USD (Cost Saving 11%)",
                            "Terselesainya 4 ABI NBD penunjang fasilitas peningkatan produksi dengan rencana investasi 2.6 Juta USD dan realisasi 2.2 Juta USD (15.38%)",
                        ]}
                    />
                )}

                {activeTab === "kehumasan" && (
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
                )}
            </div>
        </div>
    );
};

export default AchievementsContent;