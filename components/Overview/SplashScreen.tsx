"use client";

import { useEffect, useState } from "react";

const SplashScreen = () => {
    const [visible, setVisible] = useState(true);
    const [fadingOut, setFadingOut] = useState(false);

    useEffect(() => {
        // Logo & tagline tampil ~1.8 detik, lalu mulai fade-out selama 0.6 detik
        const fadeTimer = setTimeout(() => setFadingOut(true), 1800);
        const removeTimer = setTimeout(() => setVisible(false), 2400);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-600 ease-out ${
                fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/images/logo-pertamina.png"
                alt="Logo Pertamina"
                className="h-24 w-24 animate-splash-logo sm:h-28 sm:w-28"
            />

            <h1 className="mt-5 animate-splash-text text-xl font-bold text-blue-900 sm:text-2xl">
                Pertamina Hulu Rokan Zona 1
            </h1>
            <p className="mt-1 animate-splash-text text-sm font-medium text-slate-500 sm:text-base">
                Melayani Sepenuh Hati
            </p>
        </div>
    );
};

export default SplashScreen;