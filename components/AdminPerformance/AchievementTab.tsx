"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useEffect, useState } from "react";
import { confirmDelete, confirmAction, toastSuccess, toastError } from "@/lib/alert";

type ProduksiData = {
    type: "minyak" | "gas" | "migas";
    realization: number;
    target: number;
    period: string;
    unit: string;
};

// State form realisasi/target disimpan sebagai string mentah selagi diketik
// (mis. "1," di tengah mengetik "1,000") supaya tidak "terpotong" tiap keystroke.
type ProduksiFormState = {
    type: "minyak" | "gas" | "migas";
    realization: string;
    target: string;
    period: string;
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
    realization: number;
    target: number;
    period: string;
    urutan: number;
};

type InovasiItem = {
    id: string;
    pencapaian: string;
    nama_inovasi: string;
    nama_acara: string | null;
    wilayah_kerja: string
    urutan: number;
};

type KehumasanItem = {
    id: string;
    wilayah_kerja: string;
    kategori: string;
    sub_kategori: string;
    medali: "gold" | "silver" | "bronze";
    urutan: number;
    urutan_wilayah: number;
    image_path: string | null;
};

type ProperItem = {
    id: string;
    wilayah_kerja: string;
    peringkat: "Biru" | "Hijau" | "Emas";
    tahun: number;
    keterangan: string | null;
};

type SecurityFormItem = {
    id: string;
    judul: string;
    wilayah_kerja: string;
    tanggal: string;
    urutan: number;
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

function DragHandleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
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

// ============================================================
// SUB-KOMPONEN: item Rencana Kerja yang bisa di-drag urutannya
// ============================================================

function SortableRkItem({
    item,
    index,
    group,
    onEdit,
    onDelete,
}: {
    item: RKItem;
    index: number;
    group: string;
    onEdit: (item: RKItem) => void;
    onDelete: (id: string) => void;
}) {
    const { ref, handleRef, isDragging } = useSortable({ id: item.id, index, group });

    return (
        <li
            ref={ref}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30"
        >
            <button
                type="button"
                ref={handleRef}
                title="Geser untuk mengubah urutan"
                className="shrink-0 cursor-grab touch-none rounded-lg p-1.5 text-black transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
            >
                <DragHandleIcon />
            </button>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate font-semibold text-blue-900">{item.nama_rk}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">{item.jenis_rk}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                    {item.wilayah_kerja}
                    {item.jumlah_minyak !== null && ` · ${item.jumlah_minyak.toLocaleString("en-US")} BOPD`}
                    {item.jumlah_gas !== null && ` · ${item.jumlah_gas.toLocaleString("en-US")} MMSCFD`}
                </p>
            </div>

            <div className="flex shrink-0 gap-1">
                <button onClick={() => onEdit(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                    <PencilIcon />
                </button>
                <button onClick={() => onDelete(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
}

// ============================================================
// SUB-KOMPONEN: item Inovasi yang bisa di-drag urutannya (list flat,
// tidak dikelompokkan seperti Kehumasan)
// ============================================================

function SortableInovasiItem({
    item,
    index,
    onEdit,
    onDelete,
}: {
    item: InovasiItem;
    index: number;
    onEdit: (item: InovasiItem) => void;
    onDelete: (id: string) => void;
}) {
    const { ref, handleRef, isDragging } = useSortable({ id: item.id, index });

    return (
        <li
            ref={ref}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30"
        >
            <button
                type="button"
                ref={handleRef}
                title="Geser untuk mengubah urutan"
                className="shrink-0 cursor-grab touch-none rounded-lg p-1.5 text-black transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
            >
                <DragHandleIcon />
            </button>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate font-semibold text-blue-900">{item.pencapaian}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                    {[item.nama_inovasi, item.nama_acara, item.wilayah_kerja].filter(Boolean).join(" · ")}
                </p>
            </div>

            <div className="flex shrink-0 gap-1">
                <button onClick={() => onEdit(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                    <PencilIcon />
                </button>
                <button onClick={() => onDelete(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
}

const MEDALI_STYLE: Record<KehumasanItem["medali"], { label: string; className: string }> = {
    gold: { label: "🥇 Gold", className: "bg-amber-100 text-amber-800" },
    silver: { label: "🥈 Silver", className: "bg-slate-200 text-slate-700" },
    bronze: { label: "🥉 Bronze", className: "bg-orange-100 text-orange-800" },
};

const PERINGKAT_STYLE: Record<ProperItem["peringkat"], string> = {
    Biru: "bg-sky-100 text-sky-700",
    Hijau: "bg-emerald-100 text-emerald-700",
    Emas: "bg-amber-100 text-amber-700",
};

// ============================================================
// SUB-KOMPONEN: card pembungkus 1 grup wilayah_kerja, urutan
// GRUP diatur lewat tombol panah naik/turun (bukan drag) --
// supaya tidak bentrok dengan drag urutan item DALAM grup, yang
// tetap pakai @dnd-kit di level yang sama.
// ============================================================

function WilayahGroupCard({
    field,
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    children,
}: {
    field: string;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <div className="mb-2 flex items-center gap-1.5">
                <div className="flex shrink-0 flex-col gap-0.5">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        title="Naikkan urutan wilayah kerja"
                        className="cursor-pointer rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        title="Turunkan urutan wilayah kerja"
                        className="cursor-pointer rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{field}</p>
            </div>
            {children}
        </div>
    );
}

// ============================================================
// SUB-KOMPONEN: item Kehumasan yang bisa di-drag, DIBATASI dalam
// grup wilayah_kerja yang sama (prop `group`) -- @dnd-kit/react
// otomatis mencegah drag lintas-grup ketika prop ini diisi.
// ============================================================

function SortableKehumasanItem({
    item,
    index,
    group,
    onEdit,
    onDelete,
}: {
    item: KehumasanItem;
    index: number;
    group: string;
    onEdit: (item: KehumasanItem) => void;
    onDelete: (id: string) => void;
}) {
    const { ref, handleRef, isDragging } = useSortable({ id: item.id, index, group });
    const medali = MEDALI_STYLE[item.medali];

    return (
        <li
            ref={ref}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30"
        >
            <button
                type="button"
                ref={handleRef}
                title="Geser untuk mengubah urutan"
                className="shrink-0 cursor-grab touch-none rounded-lg p-1.5 text-black transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
            >
                <DragHandleIcon />
            </button>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate font-semibold text-blue-900">{item.wilayah_kerja}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${medali.className}`}>{medali.label}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-400">{item.kategori} · {item.sub_kategori}</p>
            </div>

            <div className="flex shrink-0 gap-1">
                <button onClick={() => onEdit(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                    <PencilIcon />
                </button>
                <button onClick={() => onDelete(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
}

// ============================================================
// HELPER: input angka format "1,000.5" (koma ribuan, titik desimal)
// ============================================================

/** Buang koma ribuan lalu ubah ke number murni. Contoh: "1,234.5" -> 1234.5 */
function parseFormattedNumber(str: string): number {
    const cleaned = str.replace(/,/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
}

/** Saring ketikan supaya cuma angka, koma, dan satu titik desimal yang lolos. */
function sanitizeNumberInput(raw: string): string {
    let value = raw.replace(/[^0-9.,]/g, "");
    const firstDot = value.indexOf(".");
    if (firstDot !== -1) {
        value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
    }
    return value;
}

// ============================================================
// HELPER: konversi periode antara input type="month" ("2026-08")
// dan teks tampilan Indonesia ("Agustus 2026")
// ============================================================

const NAMA_BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-08" -> "Agustus 2026". Kalau format tidak dikenali, dikembalikan apa adanya. */
function monthValueToLabel(monthValue: string): string {
    const match = /^(\d{4})-(\d{2})$/.exec(monthValue);
    if (!match) return monthValue;
    const [, year, month] = match;
    const index = Number(month) - 1;
    if (index < 0 || index > 11) return monthValue;
    return `${NAMA_BULAN[index]} ${year}`;
}

/** "Agustus 2026" -> "2026-08". Kalau tidak dikenali, dikembalikan string kosong. */
function labelToMonthValue(label: string): string {
    const match = /^([A-Za-zé]+)\s+(\d{4})$/.exec(label.trim());
    if (!match) return "";
    const [, namaBulan, year] = match;
    const index = NAMA_BULAN.findIndex((n) => n.toLowerCase() === namaBulan.toLowerCase());
    if (index === -1) return "";
    return `${year}-${String(index + 1).padStart(2, "0")}`;
}

const AchievementTab = () => {
    const [activeTab, setActiveTab] = useState<"produksi" | "rencana-kerja" | "proper" | "inovasi" | "kehumasan" | "top-project">("produksi");
    const [selectedJenis, setSelectedJenis] = useState<"minyak" | "gas" | "migas">("minyak");
    const [wilayahKerjaList, setWilayahKerjaList] = useState<string[]>([]);
    const [data, setData] = useState<Record<string, ProduksiData>>({});
    const [dataLoading, setDataLoading] = useState(true);
    const [form, setForm] = useState<ProduksiFormState | null>(null);

    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ---------- State Rencana Kerja ----------
    const [rkItems, setRkItems] = useState<RKItem[]>([]);
    const [rkListLoading, setRkListLoading] = useState(true);
    const [rkFormOpen, setRkFormOpen] = useState(false);
    const [rkForm, setRkForm] = useState({ jenis_rk: "Bor", nama_rk: "", jumlah_minyak: "", jumlah_gas: "", wilayah_kerja: "", urutan: "" });
    const [isAddingNewJenis, setIsAddingNewJenis] = useState(false);
    const [newJenisInput, setNewJenisInput] = useState("");
    const [rkEditingId, setRkEditingId] = useState<string | null>(null);
    const [rkLoading, setRkLoading] = useState(false);
    const [rkError, setRkError] = useState<string | null>(null);
    const [manageJenisOpen, setManageJenisOpen] = useState(false);
    const [renamingJenis, setRenamingJenis] = useState<string | null>(null);
    const [renameInput, setRenameInput] = useState("");
    const [jenisActionLoading, setJenisActionLoading] = useState(false);

    // ---------- State Inovasi ----------
    const [inovasiItems, setInovasiItems] = useState<InovasiItem[]>([]);
    const [inovasiListLoading, setInovasiListLoading] = useState(true);
    const [inovasiFormOpen, setInovasiFormOpen] = useState(false);
    const [inovasiForm, setInovasiForm] = useState({ pencapaian: "", nama_inovasi: "", nama_acara: "", wilayah_kerja: "" });
    const [inovasiEditingId, setInovasiEditingId] = useState<string | null>(null);
    const [inovasiLoading, setInovasiLoading] = useState(false);

    // ---------- State PROPER ----------
    const [properItems, setProperItems] = useState<ProperItem[]>([]);
    const [properListLoading, setProperListLoading] = useState(true);
    const [properFormOpen, setProperFormOpen] = useState(false);
    const [properForm, setProperForm] = useState<{
        wilayah_kerja: string;
        peringkat: "Biru" | "Hijau" | "Emas";
        tahun: string;
        keterangan: string;
    }>({ wilayah_kerja: "", peringkat: "Biru", tahun: String(new Date().getFullYear()), keterangan: "" });
    const [properEditingId, setProperEditingId] = useState<string | null>(null);
    const [properLoading, setProperLoading] = useState(false);
    const [properError, setProperError] = useState<string | null>(null);

    // ---------- State Security ----------
    const [securityItems, setSecurityItems] = useState<SecurityFormItem[]>([]);
    const [securityListLoading, setSecurityListLoading] = useState(true);
    const [securityFormOpen, setSecurityFormOpen] = useState(false);
    const [securityForm, setSecurityForm] = useState({ judul: "", wilayah_kerja: "", tanggal: "" });
    const [securityEditingId, setSecurityEditingId] = useState<string | null>(null);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [securityError, setSecurityError] = useState<string | null>(null);

    // ---------- State Kehumasan ----------
    const [kehumasanItems, setKehumasanItems] = useState<KehumasanItem[]>([]);
    const [kehumasanListLoading, setKehumasanListLoading] = useState(true);
    const [kehumasanFormOpen, setKehumasanFormOpen] = useState(false);
    const [kehumasanForm, setKehumasanForm] = useState<{
        wilayah_kerja: string;
        kategori: string;
        sub_kategori: string;
        medali: "gold" | "silver" | "bronze";
    }>({ wilayah_kerja: "", kategori: "", sub_kategori: "", medali: "gold" });
    const [kehumasanImageFile, setKehumasanImageFile] = useState<File | null>(null);
    const [kehumasanExistingImagePath, setKehumasanExistingImagePath] = useState<string | null>(null);
    const [kehumasanEditingId, setKehumasanEditingId] = useState<string | null>(null);
    const [kehumasanLoading, setKehumasanLoading] = useState(false);
    const [kehumasanError, setKehumasanError] = useState<string | null>(null);

    // ---------- State Top Project: Naratif ----------
    const [naratifItems, setNaratifItems] = useState<NaratifItem[]>([]);
    const [naratifListLoading, setNaratifListLoading] = useState(true);
    const [naratifFormOpen, setNaratifFormOpen] = useState(false);
    const [naratifForm, setNaratifForm] = useState({ title: "", detail: "" });
    const [naratifEditingId, setNaratifEditingId] = useState<string | null>(null);
    const [naratifLoading, setNaratifLoading] = useState(false);
    const [naratifError, setNaratifError] = useState<string | null>(null);

    // ---------- State Top Project: ABI NBD ----------
    const [abiItems, setAbiItems] = useState<AbiItem[]>([]);
    const [abiListLoading, setAbiListLoading] = useState(true);
    const [abiFormOpen, setAbiFormOpen] = useState(false);
    const [abiForm, setAbiForm] = useState({ title: "", unit: "", realization: "", target: "", period: "" });
    const [abiEditingId, setAbiEditingId] = useState<string | null>(null);
    const [abiLoading, setAbiLoading] = useState(false);
    const [abiError, setAbiError] = useState<string | null>(null);

    async function fetchData() {
        setDataLoading(true);
        try {
            const res = await fetch("/api/achievement/produksi");
            const json = await res.json();
            const map: Record<string, ProduksiData> = {};
            for (const row of json.data ?? []) {
                map[row.type] = row;
            }
            setData(map);
        } finally {
            setDataLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        fetchRkItems();
        fetchProperItems();
        fetchSecurityItems();
        fetchInovasiItems();
        fetchKehumasanItems();
        fetchWilayahKerjaList();
        fetchNaratifItems();
        fetchAbiItems();
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
        setIsAddingNewJenis(false);
        setNewJenisInput("");
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

        if (!rkForm.jumlah_minyak.trim() && !rkForm.jumlah_gas.trim()) {
            toastError("Isi minimal salah satu: Jumlah Minyak atau Jumlah Gas.");
            return;
        }

        setRkLoading(true);
        const payload = {
            jenis_rk: rkForm.jenis_rk,
            nama_rk: rkForm.nama_rk,
            jumlah_minyak: rkForm.jumlah_minyak.trim() ? Number(rkForm.jumlah_minyak) : null,
            jumlah_gas: rkForm.jumlah_gas.trim() ? Number(rkForm.jumlah_gas) : null,
            wilayah_kerja: rkForm.wilayah_kerja,
            urutan: rkEditingId ? Number(rkForm.urutan) : rkItems.length,
        };
        const url = rkEditingId ? `/api/achievement/rencana-kerja/${rkEditingId}` : "/api/achievement/rencana-kerja";
        const method = rkEditingId ? "PATCH" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setRkLoading(false);
            return;
        }

        await fetchRkItems();
        resetRkForm();
        setRkLoading(false);
        toastSuccess(rkEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeleteRk(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/rencana-kerja/${id}`, { method: "DELETE" });
        await fetchRkItems();
        toastSuccess("Data berhasil dihapus.");
    }

    // Sama seperti reorderRkInGroup dulunya reorderRk (berbasis index global) --
    // sekarang list RK dikelompokkan per jenis, jadi reorder ikut per-grup.
    async function reorderRkInGroup(jenis: string, allItems: RKItem[]) {
        const itemsInGroup = allItems.filter((it) => it.jenis_rk === jenis);

        await Promise.all(
            itemsInGroup.map((item, i) =>
                fetch(`/api/achievement/rencana-kerja/${item.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jenis_rk: item.jenis_rk,
                        nama_rk: item.nama_rk,
                        jumlah_minyak: item.jumlah_minyak,
                        jumlah_gas: item.jumlah_gas,
                        wilayah_kerja: item.wilayah_kerja,
                        urutan: i,
                        skip_log: true,
                    }),
                })
            )
        ).catch(() => {
            fetchRkItems();
        });
    }

    const jenisRkOptions = Array.from(
        new Set(["Bor", "Workover", ...rkItems.map((item) => item.jenis_rk), rkForm.jenis_rk].filter(Boolean))
    );

    // Hitung jumlah item per jenis, buat ditampilkan di panel kelola jenis
    const jenisRkSummary = jenisRkOptions
        .filter((jenis) => rkItems.some((item) => item.jenis_rk === jenis))
        .map((jenis) => ({
            jenis,
            count: rkItems.filter((item) => item.jenis_rk === jenis).length,
        }));

    function startRenameJenis(jenis: string) {
        setRenamingJenis(jenis);
        setRenameInput(jenis);
    }

    async function handleRenameJenis() {
        if (!renamingJenis) return;
        const trimmed = renameInput.trim();
        if (!trimmed || trimmed === renamingJenis) {
            setRenamingJenis(null);
            return;
        }

        setJenisActionLoading(true);
        try {
            const res = await fetch("/api/achievement/rencana-kerja/jenis", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jenis_lama: renamingJenis, jenis_baru: trimmed }),
            });
            if (!res.ok) {
                const json = await res.json();
                toastError(json.error ?? "Gagal mengubah nama jenis.");
                return;
            }
            await fetchRkItems();
            setRenamingJenis(null);
            toastSuccess("Nama jenis berhasil diubah.");
        } finally {
            setJenisActionLoading(false);
        }
    }

    async function handleDeleteJenis(jenis: string, count: number) {
        const confirmed = await confirmDelete(`Jenis "${jenis}" beserta ${count} data di dalamnya akan dihapus secara permanen.`);
        if (!confirmed) return;

        setJenisActionLoading(true);
        try {
            const res = await fetch(`/api/achievement/rencana-kerja/jenis?jenis=${encodeURIComponent(jenis)}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const json = await res.json();
                toastError(json.error ?? "Gagal menghapus jenis.");
                return;
            }
            await fetchRkItems();
            toastSuccess("Jenis dan seluruh datanya berhasil dihapus.");
        } finally {
            setJenisActionLoading(false);
        }
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
        setInovasiForm({ pencapaian: item.pencapaian, nama_inovasi: item.nama_inovasi, nama_acara: item.nama_acara ?? "", wilayah_kerja: item.wilayah_kerja });
        setInovasiEditingId(item.id);
        setInovasiFormOpen(true);
    }

    async function handleSubmitInovasi(e: React.FormEvent) {
        e.preventDefault();
        setInovasiLoading(true);
        const url = inovasiEditingId ? `/api/achievement/inovasi/${inovasiEditingId}` : "/api/achievement/inovasi";
        const method = inovasiEditingId ? "PATCH" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(inovasiForm) });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setInovasiLoading(false);
            return;
        }

        await fetchInovasiItems();
        resetInovasiForm();
        setInovasiLoading(false);
        toastSuccess(inovasiEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeleteInovasi(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/inovasi/${id}`, { method: "DELETE" });
        await fetchInovasiItems();
        toastSuccess("Data berhasil dihapus.");
    }

    /**
     * Setelah drag-reorder Inovasi (list flat, tidak dikelompokkan), hitung
     * ulang `urutan` untuk SEMUA item lalu kirim PATCH untuk tiap item.
     */
    async function reorderInovasi(newItems: InovasiItem[]) {
        await Promise.all(
            newItems.map((item, i) =>
                fetch(`/api/achievement/inovasi/${item.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pencapaian: item.pencapaian,
                        nama_inovasi: item.nama_inovasi,
                        nama_acara: item.nama_acara,
                        wilayah_kerja: item.wilayah_kerja,
                        urutan: i,
                        skip_log: true,
                    }),
                })
            )
        ).catch(() => {
            fetchInovasiItems();
        });
    }

    // ---------- Fungsi PROPER ----------
    async function fetchProperItems() {
        setProperListLoading(true);
        try {
            const res = await fetch("/api/achievement/hsse/proper");
            const json = await res.json();
            setProperItems(json.data ?? []);
        } finally {
            setProperListLoading(false);
        }
    }

    function resetProperForm() {
        setProperForm({ wilayah_kerja: "", peringkat: "Biru", tahun: String(new Date().getFullYear()), keterangan: "" });
        setProperEditingId(null);
        setProperFormOpen(false);
        setProperError(null);
    }

    function startEditProper(item: ProperItem) {
        setProperForm({
            wilayah_kerja: item.wilayah_kerja,
            peringkat: item.peringkat,
            tahun: String(item.tahun),
            keterangan: item.keterangan ?? "",
        });
        setProperEditingId(item.id);
        setProperFormOpen(true);
        setProperError(null);
    }

    async function handleSubmitProper(e: React.FormEvent) {
        e.preventDefault();
        setProperError(null);
        setProperLoading(true);

        const existingItem = properEditingId ? properItems.find((item) => item.id === properEditingId) : null;
        const urutan = existingItem ? (existingItem as any).urutan ?? 0 : properItems.length;

        const payload = {
            wilayah_kerja: properForm.wilayah_kerja,
            peringkat: properForm.peringkat,
            tahun: Number(properForm.tahun),
            keterangan: properForm.keterangan.trim() ? properForm.keterangan.trim() : null,
            urutan,
        };

        const url = properEditingId ? `/api/achievement/hsse/proper/${properEditingId}` : "/api/achievement/hsse/proper";
        const method = properEditingId ? "PUT" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setProperLoading(false);
            return;
        }

        await fetchProperItems();
        resetProperForm();
        setProperLoading(false);
        toastSuccess(properEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeleteProper(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/hsse/proper/${id}`, { method: "DELETE" });
        await fetchProperItems();
        toastSuccess("Data berhasil dihapus.");
    }

    // ---------- Fungsi Security ----------
    async function fetchSecurityItems() {
        setSecurityListLoading(true);
        try {
            const res = await fetch("/api/achievement/hsse/security");
            const json = await res.json();
            setSecurityItems(json.data ?? []);
        } finally {
            setSecurityListLoading(false);
        }
    }

    function resetSecurityForm() {
        setSecurityForm({ judul: "", wilayah_kerja: "", tanggal: "" });
        setSecurityEditingId(null);
        setSecurityFormOpen(false);
        setSecurityError(null);
    }

    function startEditSecurity(item: SecurityFormItem) {
        setSecurityForm({ judul: item.judul, wilayah_kerja: item.wilayah_kerja, tanggal: item.tanggal });
        setSecurityEditingId(item.id);
        setSecurityFormOpen(true);
        setSecurityError(null);
    }

    async function handleSubmitSecurity(e: React.FormEvent) {
        e.preventDefault();
        setSecurityError(null);
        setSecurityLoading(true);

        const existingItem = securityEditingId ? securityItems.find((item) => item.id === securityEditingId) : null;
        const urutan = existingItem ? existingItem.urutan : securityItems.length;

        const payload = {
            judul: securityForm.judul,
            wilayah_kerja: securityForm.wilayah_kerja,
            tanggal: securityForm.tanggal,
            urutan,
        };

        const url = securityEditingId ? `/api/achievement/hsse/security/${securityEditingId}` : "/api/achievement/hsse/security";
        const method = securityEditingId ? "PUT" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setSecurityLoading(false);
            return;
        }

        await fetchSecurityItems();
        resetSecurityForm();
        setSecurityLoading(false);
        toastSuccess(securityEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeleteSecurity(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/hsse/security/${id}`, { method: "DELETE" });
        await fetchSecurityItems();
        toastSuccess("Data berhasil dihapus.");
    }

    // ---------- Fungsi Kehumasan ----------
    async function fetchKehumasanItems() {
        setKehumasanListLoading(true);
        try {
            const res = await fetch("/api/achievement/kehumasan");
            const json = await res.json();
            setKehumasanItems(json.data ?? []);
        } finally {
            setKehumasanListLoading(false);
        }
    }

    function resetKehumasanForm() {
        setKehumasanForm({ wilayah_kerja: "", kategori: "", sub_kategori: "", medali: "gold" });
        setKehumasanImageFile(null);
        setKehumasanExistingImagePath(null);
        setKehumasanEditingId(null);
        setKehumasanFormOpen(false);
        setKehumasanError(null);
    }

    function startEditKehumasan(item: KehumasanItem) {
        setKehumasanForm({ wilayah_kerja: item.wilayah_kerja, kategori: item.kategori, sub_kategori: item.sub_kategori, medali: item.medali });
        setKehumasanImageFile(null);
        setKehumasanExistingImagePath(item.image_path ?? null);
        setKehumasanEditingId(item.id);
        setKehumasanFormOpen(true);
        setKehumasanError(null);
    }

    async function handleSubmitKehumasan(e: React.FormEvent) {
        e.preventDefault();
        setKehumasanError(null);
        setKehumasanLoading(true);

        const existingItem = kehumasanEditingId ? kehumasanItems.find((item) => item.id === kehumasanEditingId) : null;
        const urutan = existingItem ? existingItem.urutan : kehumasanItems.length;

        // FormData, bukan JSON -- karena sekarang bisa bawa file gambar sekaligus
        const formData = new FormData();
        formData.append("wilayah_kerja", kehumasanForm.wilayah_kerja);
        formData.append("kategori", kehumasanForm.kategori);
        formData.append("sub_kategori", kehumasanForm.sub_kategori);
        formData.append("medali", kehumasanForm.medali);
        formData.append("urutan", String(urutan));
        if (kehumasanImageFile) {
            formData.append("image", kehumasanImageFile);
        }
        // Kalau kehumasanImageFile null (admin gak pilih file baru), "image" gak
        // di-append sama sekali -- di API, formData.get("image") jadi null,
        // yang berarti "pertahankan foto lama" (lihat logic PATCH di route.ts)

        const url = kehumasanEditingId ? `/api/achievement/kehumasan/${kehumasanEditingId}` : "/api/achievement/kehumasan";
        const method = kehumasanEditingId ? "PATCH" : "POST";
        // PENTING: jangan set header Content-Type manual -- biarkan browser yang
        // otomatis set multipart/form-data dengan boundary yang benar
        const res = await fetch(url, { method, body: formData });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setKehumasanLoading(false);
            return;
        }

        await fetchKehumasanItems();
        resetKehumasanForm();
        setKehumasanLoading(false);
        toastSuccess(kehumasanEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeleteKehumasan(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/kehumasan/${id}`, { method: "DELETE" });
        await fetchKehumasanItems();
        toastSuccess("Data berhasil dihapus.");
    }

    /**
     * Setelah drag-reorder DALAM SATU GRUP (wilayah_kerja) Kehumasan, hitung ulang
     * `urutan` cuma untuk item-item dalam grup tersebut (mulai dari 0 lagi), lalu
     * kirim PATCH untuk tiap item di grup itu. Item di grup lain tidak disentuh.
     */
    async function reorderKehumasanInGroup(field: string, allItems: KehumasanItem[]) {
        const itemsInGroup = allItems.filter((it) => it.wilayah_kerja === field);

        await Promise.all(
            itemsInGroup.map((item, i) => {
                const formData = new FormData();
                formData.append("wilayah_kerja", item.wilayah_kerja);
                formData.append("kategori", item.kategori);
                formData.append("sub_kategori", item.sub_kategori);
                formData.append("medali", item.medali);
                formData.append("urutan", String(i));
                formData.append("skip_log", "true");
                // tidak append "image" -- reorder tidak pernah mengubah foto,
                // jadi backend akan pertahankan image_path yang sudah ada

                return fetch(`/api/achievement/kehumasan/${item.id}`, {
                    method: "PATCH",
                    body: formData,
                });
            })
        ).catch(() => {
            fetchKehumasanItems();
        });
    }

    /**
     * Setelah urutan GRUP wilayah kerja ditukar lewat tombol panah, hitung
     * ulang `urutan_wilayah` untuk SEMUA grup sesuai posisi barunya, lalu PATCH
     * semua item di tiap grup yang urutan_wilayah-nya berubah.
     */
    async function reorderWilayahGroup(newOrderedFields: string[], allItems: KehumasanItem[]) {
        await Promise.all(
            newOrderedFields.flatMap((field, groupIndex) => {
                const itemsInGroup = allItems.filter((it) => it.wilayah_kerja === field);
                return itemsInGroup.map((item) => {
                    const formData = new FormData();
                    formData.append("wilayah_kerja", item.wilayah_kerja);
                    formData.append("kategori", item.kategori);
                    formData.append("sub_kategori", item.sub_kategori);
                    formData.append("medali", item.medali);
                    formData.append("urutan", String(item.urutan));
                    formData.append("urutan_wilayah", String(groupIndex));
                    formData.append("skip_log", "true");
                    // tidak append "image" -- reorder tidak pernah mengubah foto

                    return fetch(`/api/achievement/kehumasan/${item.id}`, {
                        method: "PATCH",
                        body: formData,
                    });
                });
            })
        ).catch(() => {
            fetchKehumasanItems();
        });
    }

    /** Tukar posisi 1 grup wilayah kerja dengan tetangganya (naik/turun), lalu simpan ke server. */
    function moveWilayahGroup(field: string, direction: "up" | "down") {
        const currentIndex = orderedWilayahKerjaKeys.indexOf(field);
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (currentIndex === -1 || targetIndex < 0 || targetIndex >= orderedWilayahKerjaKeys.length) return;

        const newOrderedFields = [...orderedWilayahKerjaKeys];
        [newOrderedFields[currentIndex], newOrderedFields[targetIndex]] = [newOrderedFields[targetIndex], newOrderedFields[currentIndex]];

        reorderWilayahGroup(newOrderedFields, kehumasanItems).then(fetchKehumasanItems);
    }

    async function fetchWilayahKerjaList() {
        try {
            const res = await fetch("/api/overview/wilayah_kerja");
            const json = await res.json();
            const names = (json.data ?? [])
                .map((w: any) => w.nama_wilayah)
                .filter(Boolean);
            setWilayahKerjaList(names);
        } catch (err) {
            console.error("Gagal mengambil daftar wilayah kerja:", err);
        }
    }

    // ---------- Fungsi Naratif ----------
    async function fetchNaratifItems() {
        setNaratifListLoading(true);
        try {
            const res = await fetch("/api/achievement/top-project/top-project-naratif");
            const json = await res.json();
            setNaratifItems(json.data ?? []);
        } finally {
            setNaratifListLoading(false);
        }
    }

    function resetNaratifForm() {
        setNaratifForm({ title: "", detail: "" });
        setNaratifEditingId(null);
        setNaratifFormOpen(false);
        setNaratifError(null);
    }

    function startEditNaratif(item: NaratifItem) {
        setNaratifForm({ title: item.title, detail: item.detail });
        setNaratifEditingId(item.id);
        setNaratifFormOpen(true);
        setNaratifError(null);
    }

    async function handleSubmitNaratif(e: React.FormEvent) {
        e.preventDefault();
        setNaratifLoading(true);

        const payload = {
            title: naratifForm.title,
            detail: naratifForm.detail,
            urutan: naratifEditingId
                ? naratifItems.find((it) => it.id === naratifEditingId)?.urutan ?? 0
                : naratifItems.length,
        };
        const url = naratifEditingId ? `/api/achievement/top-project/top-project-naratif/${naratifEditingId}` : "/api/achievement/top-project/top-project-naratif";
        const method = naratifEditingId ? "PATCH" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setNaratifLoading(false);
            return;
        }

        await fetchNaratifItems();
        resetNaratifForm();
        setNaratifLoading(false);
        toastSuccess(naratifEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeleteNaratif(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/top-project/top-project-naratif/${id}`, { method: "DELETE" });
        await fetchNaratifItems();
        toastSuccess("Data berhasil dihapus.");
    }

    // ---------- Fungsi ABI NBD ----------
    async function fetchAbiItems() {
        setAbiListLoading(true);
        try {
            const res = await fetch("/api/achievement/top-project/top-project-abi");
            const json = await res.json();
            setAbiItems(json.data ?? []);
        } finally {
            setAbiListLoading(false);
        }
    }

    function resetAbiForm() {
        setAbiForm({ title: "", unit: "", realization: "", target: "", period: "" });
        setAbiEditingId(null);
        setAbiFormOpen(false);
        setAbiError(null);
    }

    function startEditAbi(item: AbiItem) {
        setAbiForm({
            title: item.title,
            unit: item.unit,
            realization: String(item.realization),
            target: String(item.target),
            period: item.period,
        });
        setAbiEditingId(item.id);
        setAbiFormOpen(true);
        setAbiError(null);
    }

    async function handleSubmitAbi(e: React.FormEvent) {
        e.preventDefault();
        setAbiError(null);

        if (!abiForm.realization.trim() || !abiForm.target.trim()) {
            toastError("Realisasi dan Target wajib diisi.");
            return;
        }

        setAbiLoading(true);
        const payload = {
            title: abiForm.title,
            unit: abiForm.unit,
            realization: Number(abiForm.realization),
            target: Number(abiForm.target),
            period: abiForm.period,
            urutan: abiEditingId
                ? abiItems.find((it) => it.id === abiEditingId)?.urutan ?? 0
                : abiItems.length,
        };
        const url = abiEditingId ? `/api/achievement/top-project/top-project-abi/${abiEditingId}` : "/api/achievement/top-project/top-project-abi";
        const method = abiEditingId ? "PATCH" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setAbiLoading(false);
            return;
        }

        await fetchAbiItems();
        resetAbiForm();
        setAbiLoading(false);
        toastSuccess(abiEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeleteAbi(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/top-project/top-project-abi/${id}`, { method: "DELETE" });
        await fetchAbiItems();
        toastSuccess("Data berhasil dihapus.");
    }

    useEffect(() => {
        const current = data[selectedJenis];
        if (current) {
            setForm({
                type: current.type,
                realization: current.realization.toLocaleString("en-US"),
                target: current.target.toLocaleString("en-US"),
                period: current.period,
                unit: current.unit,
            });
            setSaveSuccess(false);
            setSaveError(null);
        }
    }, [selectedJenis, data]);

    function updateField(key: keyof ProduksiFormState, value: string) {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    /** Khusus field angka (realisasi/target): saring karakter tidak valid sebelum disimpan ke state. */
    function updateNumberField(key: "realization" | "target", raw: string) {
        setForm((prev) => (prev ? { ...prev, [key]: sanitizeNumberInput(raw) } : prev));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form) return;

        setSaveLoading(true);

        const res = await fetch("/api/achievement/produksi", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: form.type,
                realization: parseFormattedNumber(form.realization),
                target: parseFormattedNumber(form.target),
                period: form.period,
                unit: form.unit,
            }),
        });

        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan.");
        } else {
            toastSuccess("Data produksi berhasil disimpan.");
            await fetchData();
        }
        setSaveLoading(false);
    }

    const groupedRkItems: [string, RKItem[]][] = jenisRkOptions
        .filter((jenis) => rkItems.some((item) => item.jenis_rk === jenis))
        .map((jenis) => [jenis, rkItems.filter((item) => item.jenis_rk === jenis)]);

    // Kelompokkan kehumasanItems per wilayah_kerja untuk tampilan admin.
    // Urutan relatif dalam tiap grup tetap ikut urutan array asli (yang sudah
    // diurutkan server berdasarkan `urutan`), jadi konsisten dengan halaman publik.
    const groupedKehumasanItemsUnordered: Record<string, KehumasanItem[]> = {};
    for (const item of kehumasanItems) {
        if (!groupedKehumasanItemsUnordered[item.wilayah_kerja]) {
            groupedKehumasanItemsUnordered[item.wilayah_kerja] = [];
        }
        groupedKehumasanItemsUnordered[item.wilayah_kerja].push(item);
    }

    // Urutan GRUP (bukan urutan item dalam grup) ditentukan oleh urutan_wilayah
    // -- diambil dari item pertama tiap grup, karena semua item dalam 1 grup
    // seharusnya punya urutan_wilayah yang sama (di-sync tiap kali grup ditukar).
    const orderedWilayahKerjaKeys = Object.keys(groupedKehumasanItemsUnordered).sort((a, b) => {
        const urutanA = groupedKehumasanItemsUnordered[a][0]?.urutan_wilayah ?? 0;
        const urutanB = groupedKehumasanItemsUnordered[b][0]?.urutan_wilayah ?? 0;
        return urutanA - urutanB;
    });
    const groupedKehumasanItems: [string, KehumasanItem[]][] = orderedWilayahKerjaKeys.map((field) => [
        field,
        groupedKehumasanItemsUnordered[field],
    ]);

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {/* ---------- Tab Navigasi ---------- */}
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {(
                    [
                        { key: "produksi", label: "Produksi" },
                        { key: "rencana-kerja", label: "Rencana Kerja" },
                        { key: "proper", label: "HSSE" },
                        { key: "inovasi", label: "Inovasi" },
                        { key: "top-project", label: "Top Project" },
                        { key: "kehumasan", label: "Kehumasan" },
                    ] as const
                ).map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={[
                            "flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors",
                            activeTab === tab.key
                                ? "bg-blue-900 text-white shadow-sm font-semibold"
                                : "text-slate-600 hover:bg-slate-200",
                        ].join(" ")}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "produksi" && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-blue-900">Produksi</h2>

                    <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
                        {(["minyak", "gas", "migas"] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSelectedJenis(type)}
                                className={[
                                    "flex-1 cursor-pointer rounded-md py-1.5 text-xs font-semibold capitalize transition-colors",
                                    selectedJenis === type
                                        ? "bg-white text-blue-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700",
                                ].join(" ")}
                            >
                                Produksi {type}
                            </button>
                        ))}
                    </div>

                    {dataLoading ? (
                        <ListSkeleton />
                    ) : form ? (
                        <>
                            {(() => {
                                const realization = parseFormattedNumber(form.realization);
                                const target = parseFormattedNumber(form.target);
                                const persen = target > 0 ? Math.round((realization / target) * 100) : 0;

                                return (
                                    <div className="mb-4 rounded-lg bg-slate-50 p-3">
                                        <div className="mb-2 flex items-end justify-between">
                                            <div>
                                                <p className="text-lg font-bold text-blue-900">{realization.toLocaleString("en-US")} <span className="text-xs font-normal text-slate-400">{form.unit}</span></p>
                                                <p className="text-[11px] text-slate-400">dari target {target.toLocaleString("en-US")} {form.unit} · {form.period}</p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">{persen}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-blue-900 transition-all"
                                                style={{ width: `${Math.min(persen, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}

                            <form onSubmit={handleSave} className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Realisasi</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="mis. 1,234.5"
                                            value={form.realization}
                                            onChange={(e) => updateNumberField("realization", e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Target</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="mis. 1,234.5"
                                            value={form.target}
                                            onChange={(e) => updateNumberField("target", e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">Unit</label>
                                    <select
                                        value={form.unit}
                                        onChange={(e) => updateField("unit", e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="" disabled>Pilih Unit</option>
                                        <option value="BOPD">BOPD</option>
                                        <option value="MMSCFD">MMSCFD</option>
                                        <option value="MMBOEPD">MMBOEPD</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">Periode</label>
                                    <input
                                        type="month"
                                        value={labelToMonthValue(form.period)}
                                        onChange={(e) => updateField("period", monthValueToLabel(e.target.value))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

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
                        </>
                    ) : null}
                </div>
            )}

            {/* ---------- Card Rencana Kerja ---------- */}
            {activeTab === "rencana-kerja" && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionHeader
                        title="Rencana Kerja"
                        isFormOpen={rkFormOpen}
                        onToggle={() => (rkFormOpen ? resetRkForm() : setRkFormOpen(true))}
                    />

                    <button
                        type="button"
                        onClick={() => setManageJenisOpen((prev) => !prev)}
                        className="mb-3 text-xs font-semibold text-blue-700 hover:underline"
                    >
                        {manageJenisOpen ? "Sembunyikan kelola jenis" : "Kelola Jenis RK"}
                    </button>

                    {manageJenisOpen && (
                        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            {jenisRkSummary.length === 0 ? (
                                <p className="text-xs text-slate-400">Belum ada jenis RK.</p>
                            ) : (
                                jenisRkSummary.map(({ jenis, count }) => (
                                    <div key={jenis} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                                        {renamingJenis === jenis ? (
                                            <div className="flex flex-1 items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={renameInput}
                                                    onChange={(e) => setRenameInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleRenameJenis()}
                                                    className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs outline-none focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRenameJenis}
                                                    disabled={jenisActionLoading}
                                                    className="shrink-0 cursor-pointer rounded-md bg-blue-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                                >
                                                    Simpan
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRenamingJenis(null)}
                                                    className="shrink-0 cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {jenis} <span className="font-normal text-slate-400">({count} data)</span>
                                                </span>
                                                <div className="flex shrink-0 gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => startRenameJenis(jenis)}
                                                        className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"
                                                    >
                                                        Rename
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteJenis(jenis, count)}
                                                        disabled={jenisActionLoading}
                                                        className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                                                    >
                                                        Hapus Semua
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {rkFormOpen && (
                        <form onSubmit={handleSubmitRk} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                            {!isAddingNewJenis ? (
                                <select
                                    value={rkForm.jenis_rk}
                                    onChange={(e) => {
                                        if (e.target.value === "__new__") {
                                            setIsAddingNewJenis(true);
                                            setNewJenisInput("");
                                        } else {
                                            setRkForm({ ...rkForm, jenis_rk: e.target.value });
                                        }
                                    }}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                >
                                    {jenisRkOptions.map((jenis) => (
                                        <option key={jenis} value={jenis}>{jenis}</option>
                                    ))}
                                    <option value="__new__">+ Tambah jenis baru...</option>
                                </select>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Ketik nama jenis baru, lalu klik OK"
                                            value={newJenisInput}
                                            onChange={(e) => setNewJenisInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    const trimmed = newJenisInput.trim();
                                                    if (!trimmed) return;
                                                    setRkForm({ ...rkForm, jenis_rk: trimmed });
                                                    setIsAddingNewJenis(false);
                                                }
                                            }}
                                            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const trimmed = newJenisInput.trim();
                                                if (!trimmed) return;
                                                setRkForm({ ...rkForm, jenis_rk: trimmed });
                                                setIsAddingNewJenis(false);
                                            }}
                                            className="shrink-0 cursor-pointer rounded-lg bg-blue-900 px-3 text-xs font-semibold text-white hover:bg-blue-800"
                                        >
                                            OK
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNewJenis(false)}
                                            className="shrink-0 cursor-pointer rounded-lg border border-slate-300 px-3 text-xs text-slate-600 hover:bg-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Ketik nama jenis, lalu tekan Enter atau klik OK.</p>
                                </div>
                            )}
                            <input placeholder="Nama RK (misal PPS-015A)" value={rkForm.nama_rk} onChange={(e) => setRkForm({ ...rkForm, nama_rk: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                            <input placeholder="Jumlah Minyak (BOPD, opsional)" type="number" step="any" min="0" value={rkForm.jumlah_minyak} onChange={(e) => setRkForm({ ...rkForm, jumlah_minyak: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                            <input placeholder="Jumlah Gas (MMSCFD, opsional)" type="number" step="any" min="0" value={rkForm.jumlah_gas} onChange={(e) => setRkForm({ ...rkForm, jumlah_gas: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                            <select
                                value={rkForm.wilayah_kerja}
                                onChange={(e) => setRkForm({ ...rkForm, wilayah_kerja: e.target.value })}
                                className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Pilih Wilayah Kerja</option>
                                {wilayahKerjaList.map((nama) => (
                                    <option key={nama} value={nama}>{nama}</option>
                                ))}
                            </select>

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
                        <DragDropProvider
                            onDragEnd={(event) => {
                                if (event.canceled) return;
                                const { source } = event.operation;
                                if (!isSortable(source)) return;

                                const { initialIndex, index, group } = source;
                                if (initialIndex === index || group === undefined) return;

                                setRkItems((currentItems) => {
                                    // initialIndex/index di sini adalah index DALAM GRUP,
                                    // jadi perlu dipetakan balik ke posisi global sebelum splice.
                                    const groupItems = currentItems.filter((it) => it.jenis_rk === group);
                                    const movedItem = groupItems[initialIndex];
                                    const targetItem = groupItems[index];
                                    if (!movedItem || !targetItem) return currentItems;

                                    const globalFrom = currentItems.findIndex((it) => it.id === movedItem.id);
                                    const globalTo = currentItems.findIndex((it) => it.id === targetItem.id);

                                    const newItems = [...currentItems];
                                    const [moved] = newItems.splice(globalFrom, 1);
                                    newItems.splice(globalTo, 0, moved);

                                    reorderRkInGroup(group as string, newItems);
                                    return newItems;
                                });
                            }}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                {groupedRkItems.map(([jenis, items]) => (
                                    <div key={jenis} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                            {jenis} <span className="font-normal normal-case text-slate-400">({items.length} data)</span>
                                        </p>
                                        <ul className="flex flex-col gap-2">
                                            {items.map((item, index) => (
                                                <SortableRkItem
                                                    key={item.id}
                                                    item={item}
                                                    index={index}
                                                    group={jenis}
                                                    onEdit={startEditRk}
                                                    onDelete={handleDeleteRk}
                                                />
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </DragDropProvider>
                    )}
                </div>
            )}

            {/* ---------- Card HSSE (PROPER + Security) ---------- */}
            {activeTab === "proper" && (
                <div className="flex flex-col gap-6">
                    {/* --- Sub-section: PROPER --- */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionHeader
                            title="PROPER"
                            isFormOpen={properFormOpen}
                            onToggle={() => (properFormOpen ? resetProperForm() : setProperFormOpen(true))}
                        />

                        {properFormOpen && (
                            <form onSubmit={handleSubmitProper} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                                <input
                                    placeholder="Wilayah Kerja (misal Field Rantau)"
                                    value={properForm.wilayah_kerja}
                                    onChange={(e) => setProperForm({ ...properForm, wilayah_kerja: e.target.value })}
                                    className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    required
                                />
                                <select
                                    value={properForm.peringkat}
                                    onChange={(e) => setProperForm({ ...properForm, peringkat: e.target.value as "Biru" | "Hijau" | "Emas" })}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="Biru">Biru</option>
                                    <option value="Hijau">Hijau</option>
                                    <option value="Emas">Emas</option>
                                </select>
                                <input
                                    placeholder="Tahun"
                                    type="number"
                                    value={properForm.tahun}
                                    onChange={(e) => setProperForm({ ...properForm, tahun: e.target.value })}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    required
                                />
                                <input
                                    placeholder="Keterangan (opsional, misal Rapor Sementara)"
                                    value={properForm.keterangan}
                                    onChange={(e) => setProperForm({ ...properForm, keterangan: e.target.value })}
                                    className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />

                                {properError && (
                                    <p className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{properError}</p>
                                )}

                                <div className="col-span-2 flex gap-2">
                                    <button type="submit" disabled={properLoading} className="cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                        {properLoading ? "Menyimpan..." : properEditingId ? "Simpan Perubahan" : "Tambah"}
                                    </button>
                                    <button type="button" onClick={resetProperForm} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white">Batal</button>
                                </div>
                            </form>
                        )}

                        {properListLoading ? (
                            <ListSkeleton />
                        ) : properItems.length === 0 ? (
                            <EmptyState label="Belum ada data PROPER." />
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {properItems.map((item) => (
                                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="truncate font-semibold text-blue-900">{item.wilayah_kerja}</span>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PERINGKAT_STYLE[item.peringkat]}`}>
                                                    {item.peringkat} {item.tahun}
                                                </span>
                                            </div>
                                            {item.keterangan && (
                                                <p className="mt-0.5 truncate text-xs text-slate-400">{item.keterangan}</p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <button onClick={() => startEditProper(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                                <PencilIcon />
                                            </button>
                                            <button onClick={() => handleDeleteProper(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* --- Sub-section: Security --- */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionHeader
                            title="SECURITY"
                            isFormOpen={securityFormOpen}
                            onToggle={() => (securityFormOpen ? resetSecurityForm() : setSecurityFormOpen(true))}
                        />

                        {securityFormOpen && (
                            <form onSubmit={handleSubmitSecurity} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                                <input
                                    placeholder="Judul Kejadian (misal Penggagalan ITAP...)"
                                    value={securityForm.judul}
                                    onChange={(e) => setSecurityForm({ ...securityForm, judul: e.target.value })}
                                    className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    required
                                />
                                <select
                                    value={securityForm.wilayah_kerja}
                                    onChange={(e) => setSecurityForm({ ...securityForm, wilayah_kerja: e.target.value })}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    required
                                >
                                    <option value="">Pilih Wilayah Kerja</option>
                                    {wilayahKerjaList.map((nama) => (
                                        <option key={nama} value={nama}>{nama}</option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={securityForm.tanggal}
                                    onChange={(e) => setSecurityForm({ ...securityForm, tanggal: e.target.value })}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    required
                                />

                                {securityError && (
                                    <p className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{securityError}</p>
                                )}

                                <div className="col-span-2 flex gap-2">
                                    <button type="submit" disabled={securityLoading} className="cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                        {securityLoading ? "Menyimpan..." : securityEditingId ? "Simpan Perubahan" : "Tambah"}
                                    </button>
                                    <button type="button" onClick={resetSecurityForm} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white">Batal</button>
                                </div>
                            </form>
                        )}

                        {securityListLoading ? (
                            <ListSkeleton />
                        ) : securityItems.length === 0 ? (
                            <EmptyState label="Belum ada data security." />
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {securityItems
                                    .slice()
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((item) => (
                                        <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                                            <div className="min-w-0 flex-1">
                                                <span className="truncate font-semibold text-blue-900">{item.judul}</span>
                                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                                    {item.wilayah_kerja} · {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <button onClick={() => startEditSecurity(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                                    <PencilIcon />
                                                </button>
                                                <button onClick={() => handleDeleteSecurity(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* ---------- Card Inovasi ---------- */}
            {activeTab === "inovasi" && (
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
                            <input placeholder="Nama Acara (opsional)" value={inovasiForm.nama_acara} onChange={(e) => setInovasiForm({ ...inovasiForm, nama_acara: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
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
                        <DragDropProvider
                            onDragEnd={(event) => {
                                if (event.canceled) return;
                                const { source } = event.operation;
                                if (!isSortable(source)) return;

                                const { initialIndex, index } = source;
                                if (initialIndex === index) return;

                                setInovasiItems((currentItems) => {
                                    const newItems = [...currentItems];
                                    const [moved] = newItems.splice(initialIndex, 1);
                                    newItems.splice(index, 0, moved);

                                    reorderInovasi(newItems);
                                    return newItems;
                                });
                            }}
                        >
                            <ul className="flex flex-col gap-2">
                                {inovasiItems.map((item, index) => (
                                    <SortableInovasiItem
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        onEdit={startEditInovasi}
                                        onDelete={handleDeleteInovasi}
                                    />
                                ))}
                            </ul>
                        </DragDropProvider>
                    )}
                </div>
            )}

            {/* ---------- Card Top Project: Naratif ---------- */}
            {activeTab === "top-project" && (
                <>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionHeader
                            title="Top Project — Pencapaian"
                            isFormOpen={naratifFormOpen}
                            onToggle={() => (naratifFormOpen ? resetNaratifForm() : setNaratifFormOpen(true))}
                        />

                        {naratifFormOpen && (
                            <form onSubmit={handleSubmitNaratif} className="mb-4 flex flex-col gap-3 rounded-lg bg-slate-50 p-3">
                                <input placeholder="Judul (misal New Technology Velocity String)" value={naratifForm.title} onChange={(e) => setNaratifForm({ ...naratifForm, title: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                                <input placeholder="Detail (misal PPS-12 dan PPS-15)" value={naratifForm.detail} onChange={(e) => setNaratifForm({ ...naratifForm, detail: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />

                                {naratifError && (
                                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{naratifError}</p>
                                )}

                                <div className="flex gap-2">
                                    <button type="submit" disabled={naratifLoading} className="cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                        {naratifLoading ? "Menyimpan..." : naratifEditingId ? "Simpan Perubahan" : "Tambah"}
                                    </button>
                                    <button type="button" onClick={resetNaratifForm} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white">Batal</button>
                                </div>
                            </form>
                        )}

                        {naratifListLoading ? (
                            <ListSkeleton />
                        ) : naratifItems.length === 0 ? (
                            <EmptyState label="Belum ada data pencapaian." />
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {naratifItems.map((item) => (
                                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                                        <div className="min-w-0">
                                            <span className="truncate font-semibold text-blue-900">{item.title}</span>
                                            <p className="mt-0.5 truncate text-xs text-slate-400">{item.detail}</p>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <button onClick={() => startEditNaratif(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                                <PencilIcon />
                                            </button>
                                            <button onClick={() => handleDeleteNaratif(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ---------- Card Top Project: ABI NBD ---------- */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionHeader
                            title="Top Project — ABI NBD"
                            isFormOpen={abiFormOpen}
                            onToggle={() => (abiFormOpen ? resetAbiForm() : setAbiFormOpen(true))}
                        />

                        {abiFormOpen && (
                            <form onSubmit={handleSubmitAbi} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                                <input placeholder="Judul (misal ABI NBD Asset Integrity)" value={abiForm.title} onChange={(e) => setAbiForm({ ...abiForm, title: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                                <input placeholder="Unit (misal Juta USD)" value={abiForm.unit} onChange={(e) => setAbiForm({ ...abiForm, unit: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                                <input placeholder="Periode/Keterangan (misal 18 ABI NBD, Cost Saving 21%)" value={abiForm.period} onChange={(e) => setAbiForm({ ...abiForm, period: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                                <input placeholder="Realisasi" type="number" step="any" min="0" value={abiForm.realization} onChange={(e) => setAbiForm({ ...abiForm, realization: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                                <input placeholder="Target" type="number" step="any" min="0" value={abiForm.target} onChange={(e) => setAbiForm({ ...abiForm, target: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />

                                {abiError && (
                                    <p className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{abiError}</p>
                                )}

                                <div className="col-span-2 flex gap-2">
                                    <button type="submit" disabled={abiLoading} className="cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                        {abiLoading ? "Menyimpan..." : abiEditingId ? "Simpan Perubahan" : "Tambah"}
                                    </button>
                                    <button type="button" onClick={resetAbiForm} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white">Batal</button>
                                </div>
                            </form>
                        )}

                        {abiListLoading ? (
                            <ListSkeleton />
                        ) : abiItems.length === 0 ? (
                            <EmptyState label="Belum ada data ABI NBD." />
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {abiItems.map((item) => {
                                    const persen = item.target > 0 ? Math.round((item.realization / item.target) * 100) : 0;
                                    return (
                                        <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                                            <div className="min-w-0">
                                                <span className="truncate font-semibold text-blue-900">{item.title}</span>
                                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                                    {item.realization.toLocaleString("en-EN")} / {item.target.toLocaleString("en-EN")} {item.unit} ({persen}%) · {item.period}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <button onClick={() => startEditAbi(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                                    <PencilIcon />
                                                </button>
                                                <button onClick={() => handleDeleteAbi(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </>
            )}

            {/* ---------- Card Kehumasan ---------- */}
            {activeTab === "kehumasan" && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionHeader
                        title="Kehumasan"
                        isFormOpen={kehumasanFormOpen}
                        onToggle={() => (kehumasanFormOpen ? resetKehumasanForm() : setKehumasanFormOpen(true))}
                    />

                    {kehumasanFormOpen && (
                        <form onSubmit={handleSubmitKehumasan} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                            <input placeholder="Wilayah Kerja (misal Field Rantau)" value={kehumasanForm.wilayah_kerja} onChange={(e) => setKehumasanForm({ ...kehumasanForm, wilayah_kerja: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                            <input placeholder="Kategori (misal Manajemen Krisis)" value={kehumasanForm.kategori} onChange={(e) => setKehumasanForm({ ...kehumasanForm, kategori: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                            <input placeholder="Sub Kategori (misal Krisis & Pasca Krisis)" value={kehumasanForm.sub_kategori} onChange={(e) => setKehumasanForm({ ...kehumasanForm, sub_kategori: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                            <select value={kehumasanForm.medali} onChange={(e) => setKehumasanForm({ ...kehumasanForm, medali: e.target.value as "gold" | "silver" | "bronze" })} className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                                <option value="gold">🥇 Gold Winner</option>
                                <option value="silver">🥈 Silver Winner</option>
                                <option value="bronze">🥉 Bronze Winner</option>
                            </select>

                            <div className="col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Foto Penghargaan (opsional)</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => setKehumasanImageFile(e.target.files?.[0] ?? null)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 focus:border-blue-500"
                                />
                                {kehumasanExistingImagePath && !kehumasanImageFile && (
                                    <p className="mt-1 text-[11px] text-slate-400">Sudah ada foto tersimpan. Pilih file baru untuk menggantinya, atau biarkan kosong untuk tetap memakai foto lama.</p>
                                )}
                                {kehumasanImageFile && (
                                    <p className="mt-1 text-[11px] text-blue-700">File dipilih: {kehumasanImageFile.name}</p>
                                )}
                            </div>

                            {kehumasanError && (
                                <p className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{kehumasanError}</p>
                            )}

                            <div className="col-span-2 flex gap-2">
                                <button type="submit" disabled={kehumasanLoading} className="cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                    {kehumasanLoading ? "Menyimpan..." : kehumasanEditingId ? "Simpan Perubahan" : "Tambah"}
                                </button>
                                <button type="button" onClick={resetKehumasanForm} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white">Batal</button>
                            </div>
                        </form>
                    )}

                    {kehumasanListLoading ? (
                        <ListSkeleton />
                    ) : kehumasanItems.length === 0 ? (
                        <EmptyState label="Belum ada data kehumasan." />
                    ) : (
                        <DragDropProvider
                            onDragEnd={(event) => {
                                if (event.canceled) return;
                                const { source } = event.operation;
                                if (!isSortable(source)) return;

                                const { initialIndex, index, group } = source;
                                if (initialIndex === index || group === undefined) return;

                                setKehumasanItems((currentItems) => {
                                    // `initialIndex`/`index` di sini adalah index DALAM GRUP
                                    // (bukan index array global), karena prop `group` diisi
                                    // di useSortable. Perlu dipetakan balik ke posisi global
                                    // sebelum splice supaya urutan array penuh tetap benar.
                                    const groupItems = currentItems.filter((it) => it.wilayah_kerja === group);
                                    const movedItem = groupItems[initialIndex];
                                    const targetItem = groupItems[index];
                                    if (!movedItem || !targetItem) return currentItems;

                                    const globalFrom = currentItems.findIndex((it) => it.id === movedItem.id);
                                    const globalTo = currentItems.findIndex((it) => it.id === targetItem.id);

                                    const newItems = [...currentItems];
                                    const [moved] = newItems.splice(globalFrom, 1);
                                    newItems.splice(globalTo, 0, moved);

                                    reorderKehumasanInGroup(group as string, newItems);
                                    return newItems;
                                });
                            }}
                        >
                            <div className="flex flex-col gap-3">
                                {groupedKehumasanItems.map(([field, items], groupIndex) => (
                                    <WilayahGroupCard
                                        key={field}
                                        field={field}
                                        canMoveUp={groupIndex > 0}
                                        canMoveDown={groupIndex < groupedKehumasanItems.length - 1}
                                        onMoveUp={() => moveWilayahGroup(field, "up")}
                                        onMoveDown={() => moveWilayahGroup(field, "down")}
                                    >
                                        <ul className="flex flex-col gap-2">
                                            {items.map((item, index) => (
                                                <SortableKehumasanItem
                                                    key={item.id}
                                                    item={item}
                                                    index={index}
                                                    group={field}
                                                    onEdit={startEditKehumasan}
                                                    onDelete={handleDeleteKehumasan}
                                                />
                                            ))}
                                        </ul>
                                    </WilayahGroupCard>
                                ))}
                            </div>
                        </DragDropProvider>
                    )}
                </div>
            )}
        </div>
    );
};

export default AchievementTab;