export type LogbookPhoto = {
    src: string;
    alt: string;
};

export type LogbookEntry = {
    id: string;
    date: string; // format: YYYY-MM-DD
    week: string; // contoh: "Minggu 1"
    title: string;
    description: string;
    tags?: string[];
    photos?: LogbookPhoto[];
};

// ============================================================
// DATA LOGBOOK MAGANG
// ------------------------------------------------------------
// Cara nambah entri baru: copy salah satu objek di bawah,
// ganti isinya, taruh paling atas (biar tampil terbaru di atas).
//
// Cara nambah foto: taruh file foto di folder `public/blog/`,
// lalu isi array `photos` dengan path-nya, contoh:
//   photos: [{ src: "/blog/nama-file.jpg", alt: "Deskripsi foto" }]
//
// Kalau belum ada foto, biarkan photos: [] atau hapus field-nya,
// nanti otomatis muncul placeholder "foto menyusul".
// ============================================================
export const logbookEntries: LogbookEntry[] = [
    // {
    //     id: "minggu-2",
    //     date: "2026-07-10",
    //     week: "Minggu 2",
    //     title: "Membangun Halaman Overview Peta Wilayah Kerja",
    //     description:
    //         "Mengembangkan halaman overview dashboard berupa peta interaktif wilayah kerja Pertamina Zona 1. Peta menampilkan 6 wilayah kerja beserta informasi produksi minyak dan gas, fasilitas, serta jumlah sumur aktif di masing-masing wilayah.",
    //     tags: ["Frontend", "Next.js", "Dashboard"],
    //     photos: [
    //         { src: "/blog/contoh-1.svg", alt: "Contoh dokumentasi kegiatan minggu 2" },
    //         { src: "/blog/contoh-2.svg", alt: "Contoh dokumentasi kegiatan minggu 2" },
    //         { src: "/blog/contoh-3.svg", alt: "Contoh dokumentasi kegiatan minggu 2" },
    //     ],
    // },
    {
        id: "minggu-1",
        date: "2026-07-03",
        week: "Minggu 1",
        title: "Onboarding dan Pengenalan Lingkungan Kerja",
        description:
            "Hari pertama magang diisi dengan pengenalan tim, struktur organisasi perusahaan, serta briefing mengenai project dashboard yang akan dikerjakan selama masa magang berlangsung. Pada minggu ini, tim magang membuat website dashboard menggunakan Next.js, Tailwind CSS, dan TypeScript. Fokus utama adalah membangun halaman overview yang menampilkan peta wilayah kerja Pertamina Zona 1 beserta informasi terkait.",
        tags: ["Onboarding"],
        photos: [
            { src: "/blog/Bukti day 1.jpeg", alt: "Bukti day 1" },
            { src: "/blog/Bukti day 3.jpeg", alt: "Bukti day 3" },
            { src: "/blog/Bukti day 4.jpeg", alt: "Bukti day 4" },
            { src: "/blog/Bukti day 5.jpeg", alt: "Bukti day 5" },

        ],
    },
];
