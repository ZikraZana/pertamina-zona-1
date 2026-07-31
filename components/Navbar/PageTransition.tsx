"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

type PageTransitionContextValue = {
    navigateWithSplash: (href: string) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition() {
    const ctx = useContext(PageTransitionContext);
    if (!ctx) throw new Error("usePageTransition harus dipakai di dalam PageTransitionProvider");
    return ctx;
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [fadingOut, setFadingOut] = useState(false);

    function navigateWithSplash(href: string) {
        setVisible(true);
        setFadingOut(false);

        // Tahan splash screen sebentar, lalu pindah halaman di baliknya
        setTimeout(() => {
            router.push(href);
        }, 500);

        // Mulai fade-out splash setelah halaman baru sempat dimuat
        setTimeout(() => setFadingOut(true), 1400);
        setTimeout(() => setVisible(false), 2000);
    }

    return (
        <PageTransitionContext.Provider value={{ navigateWithSplash }}>
            {children}
            {visible && (
                <div
                    className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
                        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
                    }`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/logo-pertamina.png"
                        alt="Logo Pertamina"
                        className="h-20 w-20 animate-splash-logo sm:h-24 sm:w-24"
                    />
                    <h1 className="mt-4 animate-splash-text text-lg font-bold text-blue-900 sm:text-xl">
                        Pertamina Hulu Rokan Zona 1
                    </h1>
                    <p className="mt-1 animate-splash-text text-sm font-medium text-slate-500">
                        Melayani Sepenuh Hati
                    </p>
                </div>
            )}
        </PageTransitionContext.Provider>
    );
}