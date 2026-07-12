"use client";

import { useState } from "react";
import { logbookEntries, type LogbookPhoto } from "./blogData";

const formatTanggal = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));

const ContentBlog = () => {
    const [lightbox, setLightbox] = useState<LogbookPhoto | null>(null);

    const entries = [...logbookEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <>
            <div className="min-h-full bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-5xl">
                    {/* Header halaman */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-blue-900">
                            Blog Aktivitas Tim
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Dokumentasi aktivitas mingguan selama magang di Pertamina Zona 1
                        </p>
                    </div>

                    {/* Timeline */}
                    <ol className="relative border-l-2 border-slate-200 pl-6 sm:pl-8">
                        {entries.map((entry) => (
                            <li key={entry.id} className="mb-8 last:mb-0">
                                {/* Titik penanda di garis timeline */}
                                <span className="absolute -left-2.25 mt-1.5 h-4 w-4 rounded-full border-4 border-slate-100 bg-blue-900" />

                                {/* Kartu konten */}
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="inline-block rounded-full bg-blue-900/10 px-2.5 py-0.75 text-[11px] font-semibold text-blue-900">
                                            {entry.week}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">
                                            {formatTanggal(entry.date)}
                                        </span>
                                    </div>

                                    <h2 className="mb-1.5 text-base font-bold text-blue-900 sm:text-lg">
                                        {entry.title}
                                    </h2>
                                    <p className="text-sm leading-relaxed text-slate-700">
                                        {entry.description}
                                    </p>

                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {entry.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Galeri foto */}
                                    {entry.photos && entry.photos.length > 0 ? (
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {entry.photos.map((photo, i) => (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    key={i}
                                                    src={photo.src}
                                                    alt={photo.alt}
                                                    loading="lazy"
                                                    onClick={() => setLightbox(photo)}
                                                    className="aspect-square w-full cursor-pointer rounded-lg border border-slate-200 object-cover transition-opacity hover:opacity-90"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-6 text-xs italic text-slate-400">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.6}
                                            >
                                                <rect x="3" y="6" width="18" height="13" rx="2" />
                                                <circle cx="12" cy="12.5" r="3.2" />
                                                <path strokeLinecap="round" d="M8 6l1.5-2.2h5L16 6" />
                                            </svg>
                                            Foto kegiatan menyusul
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            {/* Lightbox foto */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-5"
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setLightbox(null)}
                            aria-label="Tutup"
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow hover:text-blue-900"
                        >
                            &times;
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lightbox.src}
                            alt={lightbox.alt}
                            className="max-h-[85vh] w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ContentBlog;
