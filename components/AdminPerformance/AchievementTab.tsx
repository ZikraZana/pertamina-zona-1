"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useEffect, useState } from "react";
import { confirmDelete, confirmAction, toastSuccess, toastError } from "@/lib/alert";

// "wpnb" = kotak kecil target WPNB (%) yang tampil di bawah 3 kartu produksi.
type ProduksiData = {
    type: "minyak" | "gas" | "migas";
    realization: number;
    target: number;
    period: string;
    unit: string;
    wpnb: number;
};

// State form realisasi/target disimpan sebagai string mentah selagi diketik
// (mis. "1," di tengah mengetik "1,000") supaya tidak "terpotong" tiap keystroke.
type ProduksiFormState = {
    type: "minyak" | "gas" | "migas";
    realization: string;
    target: string;
    period: string;
    unit: string;
    wpnb: string;
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

type PenghargaanItem = {
    id: string;
    wilayah_kerja: string;
    predikat: "Gold" | "Silver" | "Bronze";
    nama_kegiatan: string;
    tahun: number;
    urutan: number;
};

// "Others" — kategori tambahan Top Project di luar Pencapaian Naratif & ABI NBD.
type OthersItem = {
    id: string;
    title: string;
    detail: string;
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

// HSSE - Others
type HsseOthersItem = {
    id: string;
    indikator: string;
    realisasi: number;
    satuan: string;
    periode: string;
    target_others: number;
    tahun_target: number;
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
    const [rkFormOpen, setRkFormOpen] = useState(true);
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
    
    const [hsseSubTab, setHsseSubTab] = useState<"proper" | "security" | "others">("proper");
    const [securityKategori, setSecurityKategori] = useState<"" | "kejadian" | "penghargaan">("");
    const [topProjectSubTab, setTopProjectSubTab] = useState<"naratif" | "abi" | "others">("naratif");

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

    // ---------- State Penghargaan (Security) ----------
    const [penghargaanItems, setPenghargaanItems] = useState<PenghargaanItem[]>([]);
    const [penghargaanListLoading, setPenghargaanListLoading] = useState(true);
    const [penghargaanFormOpen, setPenghargaanFormOpen] = useState(false);
    const [penghargaanForm, setPenghargaanForm] = useState({ wilayah_kerja: "", predikat: "Gold" as "Gold" | "Silver" | "Bronze", nama_kegiatan: "", tahun: "" });
    const [penghargaanEditingId, setPenghargaanEditingId] = useState<string | null>(null);
    const [penghargaanLoading, setPenghargaanLoading] = useState(false);
    const [penghargaanError, setPenghargaanError] = useState<string | null>(null);

    // ---------- State HSSE - Others ----------
    const [hsseOthersItems, setHsseOthersItems] = useState<HsseOthersItem[]>([]);
    const [hsseOthersListLoading, setHsseOthersListLoading] = useState(true);
    const [hsseOthersFormOpen, setHsseOthersFormOpen] = useState(false);
    const [hsseOthersForm, setHsseOthersForm] = useState({
    indikator: "",
    realisasi: "",
    satuan: "",
    periode: "",
    target_others: "",
    tahun_target: String(new Date().getFullYear()),
    });
    const [hsseOthersEditingId, setHsseOthersEditingId] = useState<string | null>(null);
    const [hsseOthersLoading, setHsseOthersLoading] = useState(false);
    const [hsseOthersError, setHsseOthersError] = useState<string | null>(null);

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

    // ---------- State Top Project: Others ----------
    const [othersItems, setOthersItems] = useState<OthersItem[]>([]);
    const [othersListLoading, setOthersListLoading] = useState(true);
    const [othersFormOpen, setOthersFormOpen] = useState(false);
    const [othersForm, setOthersForm] = useState({ title: "", detail: "" });
    const [othersEditingId, setOthersEditingId] = useState<string | null>(null);
    const [othersLoading, setOthersLoading] = useState(false);
    const [othersError, setOthersError] = useState<string | null>(null);

    // ---------- State Top Project: ABI NBD ----------
    const [abiItems, setAbiItems] = useState<AbiItem[]>([]);
    const [abiListLoading, setAbiListLoading] = useState(true);
    const [abiFormOpen, setAbiFormOpen] = useState(false);
    const [abiForm, setAbiForm] = useState({ title: "", unit: "", realization: "", target: "", period: "" });
    const [abiEditingId, setAbiEditingId] = useState<string | null>(null);
    const [abiLoading, setAbiLoading] = useState(false);
    const [abiError, setAbiError] = useState<string | null>(null);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [printUrl, setPrintUrl] = useState<string | null>(null);
    const [printLoading, setPrintLoading] = useState(false);
    const [printError, setPrintError] = useState<string | null>(null);

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
        fetchPenghargaanItems();
        fetchHsseOthersItems();
        fetchInovasiItems();
        fetchKehumasanItems();
        fetchWilayahKerjaList();
        fetchNaratifItems();
        fetchAbiItems();
        fetchOthersItems();
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

    // ---------- Fungsi Penghargaan (Security) ----------
    async function fetchPenghargaanItems() {
        setPenghargaanListLoading(true);
        try {
            const res = await fetch("/api/achievement/hsse/penghargaan");
            const json = await res.json();
            setPenghargaanItems(json.data ?? []);
        } finally {
            setPenghargaanListLoading(false);
        }
    }

    function resetPenghargaanForm() {
        setPenghargaanForm({ wilayah_kerja: "", predikat: "Gold", nama_kegiatan: "", tahun: "" });
        setPenghargaanEditingId(null);
        setPenghargaanFormOpen(false);
        setPenghargaanError(null);
    }

    function startEditPenghargaan(item: PenghargaanItem) {
        setPenghargaanForm({
            wilayah_kerja: item.wilayah_kerja,
            predikat: item.predikat,
            nama_kegiatan: item.nama_kegiatan,
            tahun: String(item.tahun),
        });
        setPenghargaanEditingId(item.id);
        setPenghargaanFormOpen(true);
        setPenghargaanError(null);
    }

    async function handleSubmitPenghargaan(e: React.FormEvent) {
        e.preventDefault();
        setPenghargaanError(null);
        setPenghargaanLoading(true);

        const existingItem = penghargaanEditingId ? penghargaanItems.find((item) => item.id === penghargaanEditingId) : null;
        const urutan = existingItem ? existingItem.urutan : penghargaanItems.length;

        const payload = {
            wilayah_kerja: penghargaanForm.wilayah_kerja,
            predikat: penghargaanForm.predikat,
            nama_kegiatan: penghargaanForm.nama_kegiatan,
            tahun: Number(penghargaanForm.tahun),
            urutan,
        };

        const url = penghargaanEditingId ? `/api/achievement/hsse/penghargaan/${penghargaanEditingId}` : "/api/achievement/hsse/penghargaan";
        const method = penghargaanEditingId ? "PUT" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setPenghargaanLoading(false);
            return;
        }

        await fetchPenghargaanItems();
        resetPenghargaanForm();
        setPenghargaanLoading(false);
        toastSuccess(penghargaanEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeletePenghargaan(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/hsse/penghargaan/${id}`, { method: "DELETE" });
        await fetchPenghargaanItems();
        toastSuccess("Data berhasil dihapus.");
    }

    // ---------- Fungsi HSSE - Others ----------
    async function fetchHsseOthersItems() {
        setHsseOthersListLoading(true);
        try {
            const res = await fetch("/api/achievement/hsse/others");
            const json = await res.json();
            setHsseOthersItems(json.data ?? []);
        } finally {
            setHsseOthersListLoading(false);
        }
    }

    function resetHsseOthersForm() {
    setHsseOthersForm({
        indikator: "",
        realisasi: "",
        satuan: "",
        periode: "",
        target_others: "",
        tahun_target: String(new Date().getFullYear()),
    });
    setHsseOthersEditingId(null);
    setHsseOthersError(null);
}
    

    function startEditHsseOthers(item: HsseOthersItem) {
    setHsseOthersForm({
        indikator: item.indikator,
        realisasi: String(item.realisasi),
        satuan: item.satuan,
        periode: item.periode,
        target_others: String(item.target_others),
        tahun_target: String(item.tahun_target),
    });
    setHsseOthersEditingId(item.id);
    setHsseOthersFormOpen(true);
    setHsseOthersError(null);
}

    async function handleSubmitHsseOthers(e: React.FormEvent) {
    e.preventDefault();
    setHsseOthersError(null);

    if (!hsseOthersForm.indikator.trim() || !hsseOthersForm.satuan.trim() || !hsseOthersForm.periode.trim()) {
        toastError("Indikator, Satuan, dan Periode wajib diisi.");
        return;
    }

    setHsseOthersLoading(true);

    const existingItem = hsseOthersEditingId ? hsseOthersItems.find((item) => item.id === hsseOthersEditingId) : null;
    const urutan = existingItem ? existingItem.urutan : hsseOthersItems.length;

    const payload = {
        indikator: hsseOthersForm.indikator,
        realisasi: parseFormattedNumber(hsseOthersForm.realisasi),
        satuan: hsseOthersForm.satuan,
        periode: hsseOthersForm.periode,
        target_others: parseFormattedNumber(hsseOthersForm.target_others),
        tahun_target: Number(hsseOthersForm.tahun_target),
        urutan,
    };

    const url = hsseOthersEditingId ? `/api/achievement/hsse/others/${hsseOthersEditingId}` : "/api/achievement/hsse/others";
    const method = hsseOthersEditingId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();

    if (!res.ok) {
        toastError(json.error ?? "Gagal menyimpan data.");
        setHsseOthersLoading(false);
        return;
    }

    await fetchHsseOthersItems();
    resetHsseOthersForm();
    setHsseOthersLoading(false);
    toastSuccess(hsseOthersEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
}

    async function handleDeleteHsseOthers(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/hsse/others/${id}`, { method: "DELETE" });
        await fetchHsseOthersItems();
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

    // ---------- Fungsi Others ----------
    async function fetchOthersItems() {
        setOthersListLoading(true);
        try {
            const res = await fetch("/api/achievement/top-project/top-project-others");
            const json = await res.json();
            setOthersItems(json.data ?? []);
        } finally {
            setOthersListLoading(false);
        }
    }

    function resetOthersForm() {
        setOthersForm({ title: "", detail: "" });
        setOthersEditingId(null);
        setOthersFormOpen(false);
        setOthersError(null);
    }

    function startEditOthers(item: OthersItem) {
        setOthersForm({ title: item.title, detail: item.detail });
        setOthersEditingId(item.id);
        setOthersFormOpen(true);
        setOthersError(null);
    }

    async function handleSubmitOthers(e: React.FormEvent) {
        e.preventDefault();
        setOthersLoading(true);

        const payload = {
            title: othersForm.title,
            detail: othersForm.detail,
            urutan: othersEditingId
                ? othersItems.find((it) => it.id === othersEditingId)?.urutan ?? 0
                : othersItems.length,
        };
        const url = othersEditingId ? `/api/achievement/top-project/top-project-others/${othersEditingId}` : "/api/achievement/top-project/top-project-others";
        const method = othersEditingId ? "PATCH" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();

        if (!res.ok) {
            toastError(json.error ?? "Gagal menyimpan data.");
            setOthersLoading(false);
            return;
        }

        await fetchOthersItems();
        resetOthersForm();
        setOthersLoading(false);
        toastSuccess(othersEditingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    }

    async function handleDeleteOthers(id: string) {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        await fetch(`/api/achievement/top-project/top-project-others/${id}`, { method: "DELETE" });
        await fetchOthersItems();
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
                wpnb: (current.wpnb ?? 0).toLocaleString("en-US"),
            });
        } else {
            setForm({
                type: selectedJenis,
                realization: "0",
                target: "0",
                period: "",
                unit: "",
                wpnb: "0",
            });
        }
        setSaveSuccess(false);
        setSaveError(null);
    }, [selectedJenis, data]);

    function updateField(key: keyof ProduksiFormState, value: string) {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    /** Khusus field angka (realisasi/target): saring karakter tidak valid sebelum disimpan ke state. */
    function updateNumberField(key: "realization" | "target" | "wpnb", raw: string) {
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
                wpnb: parseFormattedNumber(form.wpnb),
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

    async function openPrintModal() {
        setPrintModalOpen(true);
        setPrintLoading(true);
        setPrintError(null);

        try {
            const res = await fetch("/api/achievement/print");
            if (!res.ok) {
                const json = await res.json();
                setPrintError(json.error ?? "Gagal membuat PDF.");
                return;
            }
            const blob = await res.blob();
            setPrintUrl(URL.createObjectURL(blob));
        } catch {
            setPrintError("Gagal membuat PDF. Periksa koneksi internet.");
        } finally {
            setPrintLoading(false);
        }
    }

    function closePrintModal() {
        if (printUrl) URL.revokeObjectURL(printUrl);
        setPrintUrl(null);
        setPrintModalOpen(false);
        setPrintError(null);
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

    const CATEGORY_ICONS: Record<string, string> = {
        "produksi": "🛢️",
        "rencana-kerja": "🏗️",
        "proper": "🍃",
        "inovasi": "💡",
        "top-project": "🚀",
        "kehumasan": "🤝",
    };

    const CATEGORY_LABELS: Record<string, string> = {
        "produksi": "Produksi",
        "rencana-kerja": "Rencana Kerja",
        "proper": "HSSE",
        "inovasi": "Inovasi",
        "top-project": "Top Project",
        "kehumasan": "Kehumasan",
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            {/* ---------- Tombol Print ---------- */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={openPrintModal}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                >
                    🖨️ Print Semua Achievement
                </button>
            </div>

            <div className="flex gap-4">
                {/* ---------- Sidebar Kategori ---------- */}
                <div className="w-56 shrink-0 self-start rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-slate-400">Kategori</p>
                    <div className="flex flex-col gap-1.5">
                        {(["produksi", "rencana-kerja", "proper", "inovasi", "top-project", "kehumasan"] as const).map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={[
                                    "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                                    activeTab === key
                                        ? "bg-blue-900 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-100",
                                ].join(" ")}
                            >
                                <span>{CATEGORY_ICONS[key]}</span>
                                {CATEGORY_LABELS[key]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ---------- Konten Kategori Aktif ---------- */}
                <div className="min-w-0 flex-1 flex flex-col gap-4">

                    {activeTab === "produksi" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-slate-100 pb-3 text-center text-base font-bold uppercase tracking-wide text-blue-900">Produksi</h2>

                            <div className="mb-5 grid grid-cols-3 gap-3">
                                {(["minyak", "gas", "migas"] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setSelectedJenis(type)}
                                        className={[
                                            "cursor-pointer rounded-lg py-3 text-sm font-semibold capitalize transition-colors",
                                            selectedJenis === type
                                                ? "bg-blue-900 text-white shadow-sm"
                                                : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                                        ].join(" ")}
                                    >
                                        {`Produksi ${type}`}
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
                                            <div className="mb-5 rounded-lg bg-slate-50 p-4">
                                                <div className="mb-3 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-3xl font-bold text-blue-900">{realization.toLocaleString("en-US")} <span className="text-sm font-normal text-slate-400">{form.unit}</span></p>
                                                        <p className="mt-1 text-xs text-slate-400">Dari target {target.toLocaleString("en-US")} {form.unit} | {form.period}</p>
                                                    </div>
                                                    <span className="shrink-0 text-lg font-bold text-blue-900">{persen}%</span>
                                                </div>
                                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                                                    <div
                                                        className="h-full rounded-full bg-blue-900 transition-all"
                                                        style={{ width: `${Math.min(persen, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Realisasi ({form.unit || "-"})</label>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="mis. 1,234.5"
                                                    value={form.realization}
                                                    onChange={(e) => updateNumberField("realization", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Target ({form.unit || "-"})</label>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="mis. 1,234.5"
                                                    value={form.target}
                                                    onChange={(e) => updateNumberField("target", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Unit</label>
                                                <select
                                                    value={form.unit}
                                                    onChange={(e) => updateField("unit", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                >
                                                    <option value="" disabled>Pilih Unit</option>
                                                    <option value="BOPD">BOPD</option>
                                                    <option value="MMSCFD">MMSCFD</option>
                                                    <option value="MMBOEPD">MMBOEPD</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Periode</label>
                                                <input
                                                    type="month"
                                                    value={labelToMonthValue(form.period)}
                                                    onChange={(e) => updateField("period", monthValueToLabel(e.target.value))}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">WPNB (%)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="mis. 80"
                                                value={form.wpnb}
                                                onChange={(e) => updateNumberField("wpnb", e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={saveLoading}
                                            className="mt-1 w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-slate-100 pb-3 text-center text-base font-bold uppercase tracking-wide text-blue-900">Rencana Kerja</h2>

                            {false && manageJenisOpen && (
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
                                <form onSubmit={handleSubmitRk} className="mb-6 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                    <select
                                        value={rkForm.wilayah_kerja}
                                        onChange={(e) => setRkForm({ ...rkForm, wilayah_kerja: e.target.value })}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Pilih Wilayah Kerja</option>
                                        {wilayahKerjaList.map((nama) => (
                                            <option key={nama} value={nama}>{nama}</option>
                                        ))}
                                    </select>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Jenis Rencana Kerja</label>
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
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                                                            placeholder="Ketik nama jenis baru"
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
                                                            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Nama Rencana Kerja</label>
                                            <input
                                                placeholder="Contoh: PPS-015A"
                                                value={rkForm.nama_rk}
                                                onChange={(e) => setRkForm({ ...rkForm, nama_rk: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Jumlah Minyak (BOPD)</label>
                                            <input
                                                placeholder="Masukkan angka jumlah minyak"
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={rkForm.jumlah_minyak}
                                                onChange={(e) => setRkForm({ ...rkForm, jumlah_minyak: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Jumlah Gas (MMSCFD)</label>
                                            <input
                                                placeholder="Masukkan angka jumlah gas"
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={rkForm.jumlah_gas}
                                                onChange={(e) => setRkForm({ ...rkForm, jumlah_gas: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <p className="-mt-1 text-xs text-slate-400">Isi salah satu atau keduanya: Jumlah Minyak atau Jumlah Gas</p>

                                    <div className="flex flex-col gap-2">
                                        <button type="submit" disabled={rkLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                            {rkLoading ? "Menyimpan..." : rkEditingId ? "Simpan Perubahan" : "Tambah"}
                                        </button>

                                        <button type="button" onClick={resetRkForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
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
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {groupedRkItems.map(([jenis, items]) => (
                                            <div key={jenis} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                                                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-900">
                                                    {jenis} <span className="font-normal normal-case text-slate-400">({items.length} Data)</span>
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
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-slate-100 pb-3 text-center text-base font-bold uppercase tracking-wide text-blue-900">HSSE</h2>

                            <div className="mb-5 grid grid-cols-3 gap-3">
                                {(["proper", "security", "others"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setHsseSubTab(tab)}
                                        className={[
                                            "cursor-pointer rounded-lg py-3 text-sm font-semibold capitalize transition-colors",
                                            hsseSubTab === tab
                                                ? "bg-blue-900 text-white shadow-sm"
                                                : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                                        ].join(" ")}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {hsseSubTab === "proper" && (
                                <>
                                    <form onSubmit={handleSubmitProper} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Wilayah Kerja</label>
                                                <select
                                                    value={properForm.wilayah_kerja}
                                                    onChange={(e) => setProperForm({ ...properForm, wilayah_kerja: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Pilih Wilayah Kerja</option>
                                                    {wilayahKerjaList.map((nama) => (
                                                        <option key={nama} value={nama}>{nama}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Peringkat</label>
                                                <select
                                                    value={properForm.peringkat}
                                                    onChange={(e) => setProperForm({ ...properForm, peringkat: e.target.value as "Biru" | "Hijau" | "Emas" })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                >
                                                    <option value="Biru">Biru</option>
                                                    <option value="Hijau">Hijau</option>
                                                    <option value="Emas">Emas</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Tahun</label>
                                                <input
                                                    placeholder="2025"
                                                    type="number"
                                                    value={properForm.tahun}
                                                    onChange={(e) => setProperForm({ ...properForm, tahun: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Keterangan (Opsional)</label>
                                                <input
                                                    placeholder="Contoh: Rapor Sementara"
                                                    value={properForm.keterangan}
                                                    onChange={(e) => setProperForm({ ...properForm, keterangan: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button type="submit" disabled={properLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                                {properLoading ? "Menyimpan..." : properEditingId ? "Simpan Perubahan" : "Tambah"}
                                            </button>
                                            {properEditingId && (
                                                <button type="button" onClick={resetProperForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                            )}
                                        </div>
                                    </form>

                                    {properListLoading ? (
                                        <ListSkeleton />
                                    ) : properItems.length === 0 ? (
                                        <EmptyState label="Belum ada data PROPER." />
                                    ) : (
                                        <ul className="flex flex-col gap-2">
                                            {properItems.map((item) => (
                                                <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/40 px-4 py-3 text-sm transition-colors hover:bg-blue-50">
                                                    <div className="min-w-0">
                                                        <span className="truncate font-bold text-blue-900">{item.wilayah_kerja}</span>
                                                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                                            <span className={`h-2 w-2 rounded-full ${PERINGKAT_STYLE[item.peringkat].split(" ")[0]}`} />
                                                            {item.tahun}
                                                        </p>
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
                                </>
                            )}

                                                        {hsseSubTab === "security" && (
                                <>
                                    <div className="mb-5">
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Pilih Kategori</label>
                                        <select
                                            value={securityKategori}
                                            onChange={(e) => setSecurityKategori(e.target.value as "" | "kejadian" | "penghargaan")}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        >
                                            <option value="">Pilih Kategori</option>
                                            <option value="kejadian">Kejadian</option>
                                            <option value="penghargaan">Penghargaan</option>
                                        </select>
                                    </div>

                                    {securityKategori === "kejadian" && (
                                        <>
                                    <form onSubmit={handleSubmitSecurity} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Wilayah Kerja</label>
                                                <select
                                                    value={securityForm.wilayah_kerja}
                                                    onChange={(e) => setSecurityForm({ ...securityForm, wilayah_kerja: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Pilih Wilayah Kerja</option>
                                                    {wilayahKerjaList.map((nama) => (
                                                        <option key={nama} value={nama}>{nama}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Tanggal</label>
                                                <input
                                                    type="date"
                                                    value={securityForm.tanggal}
                                                    onChange={(e) => setSecurityForm({ ...securityForm, tanggal: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Nama Kejadian</label>
                                                <input
                                                    placeholder="Contoh: Penggagalan ITAP...)"
                                                    value={securityForm.judul}
                                                    onChange={(e) => setSecurityForm({ ...securityForm, judul: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button type="submit" disabled={securityLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                                {securityLoading ? "Menyimpan..." : securityEditingId ? "Simpan Perubahan" : "Tambah"}
                                            </button>
                                            {securityEditingId && (
                                                <button type="button" onClick={resetSecurityForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                            )}
                                        </div>
                                    </form>

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
                                                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/40 px-4 py-3 text-sm transition-colors hover:bg-blue-50">
                                                        <div className="min-w-0 flex-1">
                                                            <span className="truncate font-bold text-blue-900">{item.judul}</span>
                                                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                                                {item.wilayah_kerja}, {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                                            </p>
                                                        </div>
                                                        <div className="flex shrink-0 gap-1">
                                                                                                                        <button onClick={() => handleDeleteSecurity(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                                                                        </li>
                                                ))}
                                        </ul>
                                    )}
                                        </>
                                    )}

                                    {securityKategori === "penghargaan" && (
                                        <>
                                    <form onSubmit={handleSubmitPenghargaan} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Wilayah Kerja</label>
                                                <input
                                                    placeholder="Contoh: 5 field (Rantau, Pangsu, Lirik, Jambi, Jambi Merang)"
                                                    value={penghargaanForm.wilayah_kerja}
                                                    onChange={(e) => setPenghargaanForm({ ...penghargaanForm, wilayah_kerja: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Predikat</label>
                                                <select
                                                    value={penghargaanForm.predikat}
                                                    onChange={(e) => setPenghargaanForm({ ...penghargaanForm, predikat: e.target.value as "Gold" | "Silver" | "Bronze" })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                >
                                                    <option value="Gold">Gold</option>
                                                    <option value="Silver">Silver</option>
                                                    <option value="Bronze">Bronze</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Nama Kegiatan</label>
                                                <input
                                                    placeholder="Contoh: Audit Sistem Manajemen Pengamanan"
                                                    value={penghargaanForm.nama_kegiatan}
                                                    onChange={(e) => setPenghargaanForm({ ...penghargaanForm, nama_kegiatan: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Tahun</label>
                                                <input
                                                    type="number"
                                                    placeholder="2025"
                                                    value={penghargaanForm.tahun}
                                                    onChange={(e) => setPenghargaanForm({ ...penghargaanForm, tahun: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button type="submit" disabled={penghargaanLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                                {penghargaanLoading ? "Menyimpan..." : penghargaanEditingId ? "Simpan Perubahan" : "Tambah"}
                                            </button>
                                            {penghargaanEditingId && (
                                                <button type="button" onClick={resetPenghargaanForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                            )}
                                        </div>
                                    </form>

                                    {penghargaanListLoading ? (
                                        <ListSkeleton />
                                    ) : penghargaanItems.length === 0 ? (
                                        <EmptyState label="Belum ada data penghargaan." />
                                    ) : (
                                        <ul className="flex flex-col gap-2">
                                            {penghargaanItems
                                                .slice()
                                                .sort((a, b) => a.urutan - b.urutan)
                                                .map((item) => (
                                                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/40 px-4 py-3 text-sm transition-colors hover:bg-blue-50">
                                                        <div className="min-w-0 flex-1">
                                                            <span className="truncate font-bold text-blue-900">{item.predikat} - {item.nama_kegiatan}</span>
                                                            <p className="mt-0.5 truncate text-xs text-slate-500">{item.wilayah_kerja} | {item.tahun}</p>
                                                        </div>
                                                        <div className="flex shrink-0 gap-1">
                                                            <button onClick={() => startEditPenghargaan(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                                                <PencilIcon />
                                                            </button>
                                                            <button onClick={() => handleDeletePenghargaan(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                                                                        </li>
                                                ))}
                                        </ul>
                                    )}
                                        </>
                                    )}
                                </>
                            )}

                           {hsseSubTab === "others" && (
                                    <>
                                        <form onSubmit={handleSubmitHsseOthers} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-semibold text-blue-900">Indikator</label>
                                                    <input
                                                        placeholder="Contoh: Reduksi Emisi"
                                                        value={hsseOthersForm.indikator}
                                                        onChange={(e) => setHsseOthersForm({ ...hsseOthersForm, indikator: e.target.value })}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-semibold text-blue-900">Realisasi</label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="Masukkan Angka Realisasi"
                                                        value={hsseOthersForm.realisasi}
                                                        onChange={(e) => setHsseOthersForm({ ...hsseOthersForm, realisasi: sanitizeNumberInput(e.target.value) })}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-semibold text-blue-900">Satuan</label>
                                                    <input
                                                        placeholder="Masukkan Satuan Realisasi"
                                                        value={hsseOthersForm.satuan}
                                                        onChange={(e) => setHsseOthersForm({ ...hsseOthersForm, satuan: e.target.value })}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-semibold text-blue-900">Periode</label>
                                                    <input
                                                        type="month"
                                                        value={labelToMonthValue(hsseOthersForm.periode)}
                                                        onChange={(e) => setHsseOthersForm({ ...hsseOthersForm, periode: monthValueToLabel(e.target.value) })}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-semibold text-blue-900">Target</label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="Masukkan Angka Target"
                                                        value={hsseOthersForm.target_others}
                                                        onChange={(e) => setHsseOthersForm({ ...hsseOthersForm, target_others: sanitizeNumberInput(e.target.value) })}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-semibold text-blue-900">Tahun Target</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Masukkan Tahun Target"
                                                        value={hsseOthersForm.tahun_target}
                                                        onChange={(e) => setHsseOthersForm({ ...hsseOthersForm, tahun_target: e.target.value })}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button type="submit" disabled={hsseOthersLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                                    {hsseOthersLoading ? "Menyimpan..." : hsseOthersEditingId ? "Simpan Perubahan" : "Tambah"}
                                                </button>
                                                <button type="button" onClick={resetHsseOthersForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                            </div>
                                        </form>

                                        {hsseOthersListLoading ? (
                                            <ListSkeleton />
                                        ) : hsseOthersItems.length === 0 ? (
                                            <EmptyState label="Belum ada data indikator lainnya." />
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {hsseOthersItems
                                                    .slice()
                                                    .sort((a, b) => a.urutan - b.urutan)
                                                    .map((item) => {
                                                        const persen = item.target_others > 0 ? Math.round((item.realisasi / item.target_others) * 100) : 0;
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-blue-50/40 px-4 py-3.5 transition-colors hover:bg-blue-50"
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-bold text-blue-900">
                                                                        Realisasi {item.indikator} - {item.realisasi.toLocaleString("en-US")} {item.satuan}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-slate-400">{item.periode}</p>
                                                                    <p className="mt-0.5 text-xs text-slate-400">{persen}% dari Target {item.tahun_target}</p>
                                                                </div>
                                                                <div className="flex shrink-0 gap-1">
                                                                    <button onClick={() => startEditHsseOthers(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                                                        <PencilIcon />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteHsseOthers(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                                                        <TrashIcon />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </>
                                )}
                        </div>
                    )}

                    {/* ---------- Card Inovasi ---------- */}
                    {activeTab === "inovasi" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-slate-100 pb-3 text-center text-base font-bold uppercase tracking-wide text-blue-900">Inovasi</h2>

                            <form onSubmit={handleSubmitInovasi} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Wilayah Kerja</label>
                                        <select
                                            value={inovasiForm.wilayah_kerja}
                                            onChange={(e) => setInovasiForm({ ...inovasiForm, wilayah_kerja: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Pilih Wilayah Kerja</option>
                                            {wilayahKerjaList.map((nama) => (
                                                <option key={nama} value={nama}>{nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Pencapaian</label>
                                        <input
                                            placeholder="Contoh: Best Presentation"
                                            value={inovasiForm.pencapaian}
                                            onChange={(e) => setInovasiForm({ ...inovasiForm, pencapaian: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Nama Inovasi</label>
                                        <input
                                            value={inovasiForm.nama_inovasi}
                                            onChange={(e) => setInovasiForm({ ...inovasiForm, nama_inovasi: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Nama Acara (Opsional)</label>
                                        <input
                                            value={inovasiForm.nama_acara}
                                            onChange={(e) => setInovasiForm({ ...inovasiForm, nama_acara: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button type="submit" disabled={inovasiLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                        {inovasiLoading ? "Menyimpan..." : inovasiEditingId ? "Simpan Perubahan" : "Tambah"}
                                    </button>
                                    {inovasiEditingId && (
                                        <button type="button" onClick={resetInovasiForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                    )}
                                </div>
                            </form>

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

                    {/* ---------- Card Top Project ---------- */}
                    {activeTab === "top-project" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-slate-100 pb-3 text-center text-base font-bold uppercase tracking-wide text-blue-900">Top Project</h2>

                            <div className="mb-5 grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTopProjectSubTab("naratif")}
                                    className={[
                                        "cursor-pointer rounded-lg py-3 text-sm font-semibold transition-colors",
                                        topProjectSubTab === "naratif"
                                            ? "bg-blue-900 text-white shadow-sm"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                                    ].join(" ")}
                                >
                                    Pencapaian
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTopProjectSubTab("abi")}
                                    className={[
                                        "cursor-pointer rounded-lg py-3 text-sm font-semibold transition-colors",
                                        topProjectSubTab === "abi"
                                            ? "bg-blue-900 text-white shadow-sm"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                                    ].join(" ")}
                                >
                                    ABI NBD
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTopProjectSubTab("others")}
                                    className={[
                                        "cursor-pointer rounded-lg py-3 text-sm font-semibold transition-colors",
                                        topProjectSubTab === "others"
                                            ? "bg-blue-900 text-white shadow-sm"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                                    ].join(" ")}
                                >
                                    Others
                                </button>
                            </div>

                            {topProjectSubTab === "naratif" && (
                                <>
                                    <form onSubmit={handleSubmitNaratif} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Judul</label>
                                            <input
                                                placeholder="Contoh: New Technology Velocity String"
                                                value={naratifForm.title}
                                                onChange={(e) => setNaratifForm({ ...naratifForm, title: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Detail</label>
                                            <input
                                                placeholder="Contoh: PPS-12 dan PPS-15"
                                                value={naratifForm.detail}
                                                onChange={(e) => setNaratifForm({ ...naratifForm, detail: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button type="submit" disabled={naratifLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                                {naratifLoading ? "Menyimpan..." : naratifEditingId ? "Simpan Perubahan" : "Tambah"}
                                            </button>
                                            {naratifEditingId && (
                                                <button type="button" onClick={resetNaratifForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                            )}
                                        </div>
                                    </form>

                                    {naratifListLoading ? (
                                        <ListSkeleton />
                                    ) : naratifItems.length === 0 ? (
                                        <EmptyState label="Belum ada data pencapaian." />
                                    ) : (
                                        <ul className="flex flex-col gap-2">
                                            {naratifItems.map((item) => (
                                                <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/40 px-4 py-3 text-sm transition-colors hover:bg-blue-50">
                                                    <div className="min-w-0">
                                                        <span className="truncate font-bold text-blue-900">{item.title}</span>
                                                        <p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p>
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
                                </>
                            )}

                            {topProjectSubTab === "abi" && (
                                <>
                                    <form onSubmit={handleSubmitAbi} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Judul</label>
                                            <input
                                                placeholder="Contoh: ABI NBD Asset Integrity"
                                                value={abiForm.title}
                                                onChange={(e) => setAbiForm({ ...abiForm, title: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Realisasi</label>
                                                <input
                                                    placeholder="0"
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    value={abiForm.realization}
                                                    onChange={(e) => setAbiForm({ ...abiForm, realization: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Target</label>
                                                <input
                                                    placeholder="0"
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    value={abiForm.target}
                                                    onChange={(e) => setAbiForm({ ...abiForm, target: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Unit</label>
                                                <input
                                                    placeholder="Contoh: Juta USD"
                                                    value={abiForm.unit}
                                                    onChange={(e) => setAbiForm({ ...abiForm, unit: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-blue-900">Periode/Keterangan</label>
                                                <input
                                                    placeholder="Contoh: 18 ABI NBD, Cost Saving 21%"
                                                    value={abiForm.period}
                                                    onChange={(e) => setAbiForm({ ...abiForm, period: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button type="submit" disabled={abiLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                                {abiLoading ? "Menyimpan..." : abiEditingId ? "Simpan Perubahan" : "Tambah"}
                                            </button>
                                            {abiEditingId && (
                                                <button type="button" onClick={resetAbiForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                            )}
                                        </div>
                                    </form>

                                    {abiListLoading ? (
                                        <ListSkeleton />
                                    ) : abiItems.length === 0 ? (
                                        <EmptyState label="Belum ada data ABI NBD." />
                                    ) : (
                                        <ul className="flex flex-col gap-2">
                                            {abiItems.map((item) => {
                                                const persen = item.target > 0 ? Math.round((item.realization / item.target) * 100) : 0;
                                                return (
                                                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/40 px-4 py-3 text-sm transition-colors hover:bg-blue-50">
                                                        <div className="min-w-0">
                                                            <span className="truncate font-bold text-blue-900">{item.title}</span>
                                                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                                                {item.realization.toLocaleString("en-US")} / {item.target.toLocaleString("en-US")} {item.unit} ({persen}%) · {item.period}
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
                                </>
                            )}

                            {topProjectSubTab === "others" && (
                                <>
                                    <form onSubmit={handleSubmitOthers} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Judul</label>
                                            <input
                                                placeholder="Contoh: Penghargaan Lainnya"
                                                value={othersForm.title}
                                                onChange={(e) => setOthersForm({ ...othersForm, title: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-blue-900">Detail</label>
                                            <input
                                                placeholder="Contoh: Deskripsi singkat pencapaian"
                                                value={othersForm.detail}
                                                onChange={(e) => setOthersForm({ ...othersForm, detail: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button type="submit" disabled={othersLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                                {othersLoading ? "Menyimpan..." : othersEditingId ? "Simpan Perubahan" : "Tambah"}
                                            </button>
                                            {othersEditingId && (
                                                <button type="button" onClick={resetOthersForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                            )}
                                        </div>
                                    </form>

                                    {othersListLoading ? (
                                        <ListSkeleton />
                                    ) : othersItems.length === 0 ? (
                                        <EmptyState label="Belum ada data lainnya." />
                                    ) : (
                                        <ul className="flex flex-col gap-2">
                                            {othersItems.map((item) => (
                                                <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/40 px-4 py-3 text-sm transition-colors hover:bg-blue-50">
                                                    <div className="min-w-0">
                                                        <span className="truncate font-bold text-blue-900">{item.title}</span>
                                                        <p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p>
                                                    </div>
                                                    <div className="flex shrink-0 gap-1">
                                                        <button onClick={() => startEditOthers(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                                            <PencilIcon />
                                                        </button>
                                                        <button onClick={() => handleDeleteOthers(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ---------- Card Kehumasan ---------- */}
                    {activeTab === "kehumasan" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-slate-100 pb-3 text-center text-base font-bold uppercase tracking-wide text-blue-900">Kehumasan</h2>

                            <form onSubmit={handleSubmitKehumasan} className="mb-5 flex flex-col gap-4 rounded-lg bg-blue-50/40 p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Wilayah Kerja</label>
                                        <select
                                            value={kehumasanForm.wilayah_kerja}
                                            onChange={(e) => setKehumasanForm({ ...kehumasanForm, wilayah_kerja: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Pilih Wilayah Kerja</option>
                                            {wilayahKerjaList.map((nama) => (
                                                <option key={nama} value={nama}>{nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Peringkat</label>
                                        <select
                                            value={kehumasanForm.medali}
                                            onChange={(e) => setKehumasanForm({ ...kehumasanForm, medali: e.target.value as "gold" | "silver" | "bronze" })}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        >
                                            <option value="gold">🥇 Gold Winner</option>
                                            <option value="silver">🥈 Silver Winner</option>
                                            <option value="bronze">🥉 Bronze Winner</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Nama Kategori</label>
                                        <input
                                            placeholder="Contoh: Manajemen Krisis"
                                            value={kehumasanForm.kategori}
                                            onChange={(e) => setKehumasanForm({ ...kehumasanForm, kategori: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-blue-900">Nama Sub Kategori</label>
                                        <input
                                            placeholder="Contoh: Krisis & Pasca Krisis"
                                            value={kehumasanForm.sub_kategori}
                                            onChange={(e) => setKehumasanForm({ ...kehumasanForm, sub_kategori: e.target.value })}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-blue-900">Foto Penghargaan (Opsional)</label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => setKehumasanImageFile(e.target.files?.[0] ?? null)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-blue-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white focus:border-blue-500"
                                    />
                                    {kehumasanExistingImagePath && !kehumasanImageFile && (
                                        <p className="mt-1 text-[11px] text-slate-400">Sudah ada foto tersimpan. Pilih file baru untuk menggantinya, atau biarkan kosong untuk tetap memakai foto lama.</p>
                                    )}
                                    {kehumasanImageFile && (
                                        <p className="mt-1 text-[11px] text-blue-700">File dipilih: {kehumasanImageFile.name}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button type="submit" disabled={kehumasanLoading} className="w-full cursor-pointer rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                        {kehumasanLoading ? "Menyimpan..." : kehumasanEditingId ? "Simpan Perubahan" : "Tambah"}
                                    </button>
                                    {kehumasanEditingId && (
                                        <button type="button" onClick={resetKehumasanForm} className="w-full cursor-pointer rounded-lg border border-slate-300 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50">Batal</button>
                                    )}
                                </div>
                            </form>

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
            </div>

            {/* ---------- Modal Preview PDF ---------- */}
            {printModalOpen && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-3 sm:p-6"
                    onClick={closePrintModal}
                >
                    <div
                        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <h3 className="text-sm font-bold text-blue-900 sm:text-base">Laporan Achievement — Zona 1</h3>
                            <div className="flex items-center gap-2">
                                {printUrl && (
                                    <a
                                        href={printUrl}
                                        download="laporan-achievement-zona-1.pdf"
                                        className="cursor-pointer rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                                    >
                                        Download
                                    </a>
                                )}
                                <button
                                    onClick={closePrintModal}
                                    aria-label="Tutup"
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden bg-slate-100">
                            {printLoading && (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-slate-400">Menyiapkan PDF...</p>
                                </div>
                            )}
                            {printError && (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-red-600">{printError}</p>
                                </div>
                            )}
                            {printUrl && !printLoading && (
                                <iframe src={printUrl} title="Laporan Achievement" className="h-full w-full" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementTab;