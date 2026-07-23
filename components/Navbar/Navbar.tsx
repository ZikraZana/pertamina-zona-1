"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// ============================================================
// DAFTAR MENU NAVBAR
// Tinggal tambahkan objek baru di sini setiap kali ada halaman
// dashboard baru (mis. minggu depan bikin halaman "Produksi").
// ============================================================
const navLinks = [
    { href: "/overview", label: "Overview" },
    { href: "/weekly_report", label: "Weekly Report" },
    // { href: "/produksi", label: "Produksi" },
];

const Navbar = () => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const isActive = (href: string) =>
        pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <header className="relative z-50 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo & judul */}
                <Link
                    href="/overview"
                    className="flex items-center gap-2.5"
                    onClick={() => setOpen(false)}
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-900 shadow-sm">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                            <path
                                d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12Z"
                                fill="#f59e0b"
                            />
                        </svg>
                    </span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-blue-900 sm:text-base">
                            Pertamina Zona 1
                        </span>
                        <span className="text-[10px] font-medium tracking-wide text-slate-400 sm:text-xs">
                            Dashboard Magang
                        </span>
                    </span>
                </Link>

                {/* Menu versi desktop */}
                <nav className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive(link.href)
                                    ? "bg-blue-900 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-900"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Tombol menu versi mobile */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Tutup menu" : "Buka menu"}
                    aria-expanded={open}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-900 md:hidden"
                >
                    {open ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Panel menu versi mobile */}
            <div
                className={`overflow-hidden border-t border-slate-200 transition-all duration-200 ease-in-out md:hidden ${open ? "max-h-60" : "max-h-0 border-t-0"
                    }`}
            >
                <nav className="flex flex-col gap-1 px-4 py-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive(link.href)
                                    ? "bg-blue-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-900"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
