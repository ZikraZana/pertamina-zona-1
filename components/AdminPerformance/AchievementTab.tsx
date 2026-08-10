"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useEffect, useState } from "react";

type ProduksiData = {
    jenis: "minyak" | "gas" | "migas";
    realisasi: number;
    target: number;
    periode: string;
    unit: string;
};

// State form realisasi/target disimpan sebagai string mentah selagi diketik
// (mis. "1," di tengah mengetik "1,000") supaya tidak "terpotong" tiap keystroke.
type ProduksiFormState = {
    jenis: "minyak" | "gas" | "migas";
    realisasi: string;
    target: string;
    periode: string;
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

type InovasiItem = {
    id: string;
    pencapaian: string;
    nama_inovasi: string;
    nama_acara: string;
    wilayah_kerja: string
};

type KehumasanItem = {
    id: string;
    wilayah_kerja: string;
    kategori: string;
    sub_kategori: string;
    medali: "gold" | "silver" | "bronze";
    urutan: number;
    image_path: string | null;
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
    onEdit,
    onDelete,
}: {
    item: RKItem;
    index: number;
    onEdit: (item: RKItem) => void;
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

const MEDALI_STYLE: Record<KehumasanItem["medali"], { label: string; className: string }> = {
    gold: { label: "🥇 Gold", className: "bg-amber-100 text-amber-800" },
    silver: { label: "🥈 Silver", className: "bg-slate-200 text-slate-700" },
    bronze: { label: "🥉 Bronze", className: "bg-orange-100 text-orange-800" },
};

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
    const [activeTab, setActiveTab] = useState<"produksi" | "rencana-kerja" | "inovasi" | "kehumasan">("produksi");
    const [selectedJenis, setSelectedJenis] = useState<"minyak" | "gas" | "migas">("minyak");
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
    const [rkEditingId, setRkEditingId] = useState<string | null>(null);
    const [rkLoading, setRkLoading] = useState(false);
    const [rkError, setRkError] = useState<string | null>(null);

    // ---------- State Inovasi ----------
    const [inovasiItems, setInovasiItems] = useState<InovasiItem[]>([]);
    const [inovasiListLoading, setInovasiListLoading] = useState(true);
    const [inovasiFormOpen, setInovasiFormOpen] = useState(false);
    const [inovasiForm, setInovasiForm] = useState({ pencapaian: "", nama_inovasi: "", nama_acara: "", wilayah_kerja: "" });
    const [inovasiEditingId, setInovasiEditingId] = useState<string | null>(null);
    const [inovasiLoading, setInovasiLoading] = useState(false);

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
        fetchKehumasanItems();
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
        setRkError(null);

        if (!rkForm.jumlah_minyak.trim() && !rkForm.jumlah_gas.trim()) {
            setRkError("Isi minimal salah satu: Jumlah Minyak atau Jumlah Gas.");
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
            setRkError(json.error ?? "Gagal menyimpan data.");
            setRkLoading(false);
            return;
        }

        await fetchRkItems();
        resetRkForm();
        setRkLoading(false);
    }

    async function handleDeleteRk(id: string) {
        if (!window.confirm("Hapus data ini?")) return;
        await fetch(`/api/achievement/rencana-kerja/${id}`, { method: "DELETE" });
        await fetchRkItems();
    }

    /** Setelah drag-reorder, simpan urutan baru semua item yang posisinya bergeser ke server. */
    async function reorderRk(fromIndex: number, toIndex: number) {
        setRkItems((currentItems) => {
            const start = Math.min(fromIndex, toIndex);
            const end = Math.max(fromIndex, toIndex);
            const affected = currentItems.slice(start, end + 1);

            Promise.all(
                affected.map((item, i) =>
                    fetch(`/api/achievement/rencana-kerja/${item.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            jenis_rk: item.jenis_rk,
                            nama_rk: item.nama_rk,
                            jumlah_minyak: item.jumlah_minyak,
                            jumlah_gas: item.jumlah_gas,
                            wilayah_kerja: item.wilayah_kerja,
                            urutan: start + i,
                        }),
                    })
                )
            ).catch(() => {
                fetchRkItems();
            });

            return currentItems;
        });
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
        setInovasiForm({ pencapaian: item.pencapaian, nama_inovasi: item.nama_inovasi, nama_acara: item.nama_acara, wilayah_kerja: item.wilayah_kerja });
        setInovasiEditingId(item.id);
        setInovasiFormOpen(true);
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
            setKehumasanError(json.error ?? "Gagal menyimpan data.");
            setKehumasanLoading(false);
            return;
        }

        await fetchKehumasanItems();
        resetKehumasanForm();
        setKehumasanLoading(false);
    }

    async function handleDeleteKehumasan(id: string) {
        if (!window.confirm("Hapus data ini?")) return;
        await fetch(`/api/achievement/kehumasan/${id}`, { method: "DELETE" });
        await fetchKehumasanItems();
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

    useEffect(() => {
        const current = data[selectedJenis];
        if (current) {
            setForm({
                jenis: current.jenis,
                realisasi: current.realisasi.toLocaleString("en-US"),
                target: current.target.toLocaleString("en-US"),
                periode: current.periode,
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
    function updateNumberField(key: "realisasi" | "target", raw: string) {
        setForm((prev) => (prev ? { ...prev, [key]: sanitizeNumberInput(raw) } : prev));
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
                realisasi: parseFormattedNumber(form.realisasi),
                target: parseFormattedNumber(form.target),
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

    // Kelompokkan kehumasanItems per wilayah_kerja untuk tampilan admin.
    // Urutan relatif dalam tiap grup tetap ikut urutan array asli (yang sudah
    // diurutkan server berdasarkan `urutan`), jadi konsisten dengan halaman publik.
    const groupedKehumasanItems: Record<string, KehumasanItem[]> = {};
    for (const item of kehumasanItems) {
        if (!groupedKehumasanItems[item.wilayah_kerja]) {
            groupedKehumasanItems[item.wilayah_kerja] = [];
        }
        groupedKehumasanItems[item.wilayah_kerja].push(item);
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            {/* ---------- Tab Navigasi ---------- */}
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {(
                    [
                        { key: "produksi", label: "Produksi" },
                        { key: "rencana-kerja", label: "Rencana Kerja" },
                        { key: "inovasi", label: "Inovasi" },
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
                        {(["minyak", "gas", "migas"] as const).map((jenis) => (
                            <button
                                key={jenis}
                                type="button"
                                onClick={() => setSelectedJenis(jenis)}
                                className={[
                                    "flex-1 cursor-pointer rounded-md py-1.5 text-xs font-semibold capitalize transition-colors",
                                    selectedJenis === jenis
                                        ? "bg-white text-blue-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700",
                                ].join(" ")}
                            >
                                Produksi {jenis}
                            </button>
                        ))}
                    </div>

                    {dataLoading ? (
                        <ListSkeleton />
                    ) : form ? (
                        <>
                            {(() => {
                                const realisasi = parseFormattedNumber(form.realisasi);
                                const target = parseFormattedNumber(form.target);
                                const persen = target > 0 ? Math.round((realisasi / target) * 100) : 0;

                                return (
                                    <div className="mb-4 rounded-lg bg-slate-50 p-3">
                                        <div className="mb-2 flex items-end justify-between">
                                            <div>
                                                <p className="text-lg font-bold text-blue-900">{realisasi.toLocaleString("en-US")} <span className="text-xs font-normal text-slate-400">{form.unit}</span></p>
                                                <p className="text-[11px] text-slate-400">dari target {target.toLocaleString("en-US")} {form.unit} · {form.periode}</p>
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
                                            value={form.realisasi}
                                            onChange={(e) => updateNumberField("realisasi", e.target.value)}
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
                                        value={labelToMonthValue(form.periode)}
                                        onChange={(e) => updateField("periode", monthValueToLabel(e.target.value))}
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

                    {rkFormOpen && (
                        <form onSubmit={handleSubmitRk} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                            <select value={rkForm.jenis_rk} onChange={(e) => setRkForm({ ...rkForm, jenis_rk: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                                <option value="Bor">Bor</option>
                                <option value="Workover">Workover</option>
                            </select>
                            <input placeholder="Nama RK (misal PPS-015A)" value={rkForm.nama_rk} onChange={(e) => setRkForm({ ...rkForm, nama_rk: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                            <input placeholder="Jumlah Minyak (BOPD, opsional)" type="number" step="any" min="0" value={rkForm.jumlah_minyak} onChange={(e) => setRkForm({ ...rkForm, jumlah_minyak: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                            <input placeholder="Jumlah Gas (MMSCFD, opsional)" type="number" step="any" min="0" value={rkForm.jumlah_gas} onChange={(e) => setRkForm({ ...rkForm, jumlah_gas: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                            <input placeholder="Wilayah Kerja (misal Field Jambi)" value={rkForm.wilayah_kerja} onChange={(e) => setRkForm({ ...rkForm, wilayah_kerja: e.target.value })} className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />

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

                                const { initialIndex, index } = source;
                                if (initialIndex === index) return;

                                setRkItems((items) => {
                                    const newItems = [...items];
                                    const [moved] = newItems.splice(initialIndex, 1);
                                    newItems.splice(index, 0, moved);
                                    return newItems;
                                });
                                reorderRk(initialIndex, index);
                            }}
                        >
                            <ul className="flex flex-col gap-2">
                                {rkItems.map((item, index) => (
                                    <SortableRkItem
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        onEdit={startEditRk}
                                        onDelete={handleDeleteRk}
                                    />
                                ))}
                            </ul>
                        </DragDropProvider>
                    )}
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
                            <input placeholder="Nama Acara" value={inovasiForm.nama_acara} onChange={(e) => setInovasiForm({ ...inovasiForm, nama_acara: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" required />
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
                        <ul className="flex flex-col gap-2">
                            {inovasiItems.map((item) => (
                                <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                                    <div className="min-w-0">
                                        <span className="truncate font-semibold text-blue-900">{item.pencapaian}</span>
                                        <p className="mt-0.5 truncate text-xs text-slate-400">
                                            {[item.nama_inovasi, item.nama_acara, item.wilayah_kerja].filter(Boolean).join(" · ")}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        <button onClick={() => startEditInovasi(item)} title="Edit" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                            <PencilIcon />
                                        </button>
                                        <button onClick={() => handleDeleteInovasi(item.id)} title="Hapus" className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
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
                            <div className="flex flex-col gap-4">
                                {Object.entries(groupedKehumasanItems).map(([field, items]) => (
                                    <div key={field}>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{field}</p>
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
                                    </div>
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