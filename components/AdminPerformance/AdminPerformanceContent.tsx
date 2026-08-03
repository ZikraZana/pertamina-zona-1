"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import OverviewTab from "./OverviewTab";
import PerformanceReportTab from "./PerformanceReportTab";
import AdminLog from "./AdminLog";
import AdminProfile from "./AdminProfile";

const AdminPerformanceContent = () => {
    const supabase = useMemo(() => createClient(), []);

    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState<string | null>(null);
    const [role, setRole] = useState<"admin" | "user" | null>(null);
    const [activeTabMain, setActiveTabMain] = useState<"dashboard" | "adminProfile">("dashboard");
    const [activeTab, setActiveTab] = useState<"wilayah" | "performance" | "adminLog">("wilayah");
    const [fullName, setFullName] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setLoginError("Email atau password salah");
        }
    }

    async function handleLogout() {
        setLoginError(null);
        const { error } = await supabase.auth.signOut();
        if (error) {
            setLoginError("Gagal Logout");
        }
    }

    useEffect(() => {
        async function checkLogin() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);

            const { data: profile } = await supabase
                .from("profiles")
                .select("role, full_name")
                .eq("id", data.user?.id)
                .single();

            if (profile?.role === "admin") {
                setRole("admin");
            } else {
                setRole("user");
            }
            setFullName(profile?.full_name ?? null);

            setAuthLoading(false);
        }
        checkLogin();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            checkLogin();
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [supabase]);

    return (
        <div className="flex min-h-screen flex-col bg-slate-100 p-3 sm:p-4 lg:p-6">
            <div className="mx-auto mb-4 w-full max-w-5xl">
                <h1 className="group relative z-10 mb-1 w-fit cursor-default bg-linear-to-b from-blue-900 to-blue-500 bg-clip-text text-xl font-bold text-transparent transition-transform duration-300 ease-out hover:-translate-y-1 sm:text-2xl lg:text-3xl">
                    {user ? `Selamat Datang, ${fullName ?? user.email}!` : "Admin"}
                </h1>
                <p className="text-sm text-blue-900/70">
                    Kelola data yang tampil di halaman Overview dan Performance Report.
                </p>
            </div>

            {authLoading && (
                <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-lg">
                    Memuat...
                </div>
            )}

            {/* ================= Belum login ================= */}
            {!authLoading && !user && (
                <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
                    <p className="mb-4 text-sm text-slate-600">
                        Silakan login untuk mengakses halaman admin.
                    </p>
                    <form onSubmit={handleLogin} className="flex flex-col gap-3 text-left">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                placeholder="nama@perusahaan.com"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                        {loginError && <p className="text-xs font-medium text-red-600">{loginError}</p>}
                        <button
                            type="submit"
                            className="mt-1 cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                        >
                            Masuk
                        </button>
                    </form>
                </div>
            )}

            {/* ================= Sudah login tapi bukan admin ================= */}
            {!authLoading && user && role === "user" && (
                <div className="mx-auto w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-lg">
                    <p className="mb-4 text-sm text-amber-700">
                        Akun <span className="font-semibold">{user.email}</span> tidak memiliki akses admin.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                        Logout
                    </button>
                </div>
            )}

            {/* ================= Sudah login sebagai admin ================= */}
            {!authLoading && user && role === "admin" && (
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                    <div className="flex flex-col items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
                        <div className="text-sm text-slate-600">
                            Masuk sebagai <span className="font-semibold text-blue-900">{user.email}</span>
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                Admin
                            </span>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setActiveTabMain("dashboard")}
                                className={[
                                    " flex cursor-pointer items-center gap-1.5 self-start rounded-full px-4.5 py-2 text-xs  transition-colors",
                                    activeTabMain === "dashboard"
                                        ? "bg-blue-900 text-white shadow-sm font-bold"
                                        : "border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100",
                                ].join(" ")}
                            >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTabMain("adminProfile")}
                                className={[
                                    " flex cursor-pointer items-center gap-1.5 self-start rounded-full px-4.5 py-2 text-xs transition-colors",
                                    activeTabMain === "adminProfile"
                                        ? "bg-blue-900 text-white shadow-sm font-bold"
                                        : "border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100",
                                ].join(" ")}
                            >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Admin Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-400"
                            >
                                Logout
                            </button>

                        </div>
                    </div>

                    {activeTabMain === "dashboard" && (
                        <>

                            <div className="flex gap-2 border-b border-slate-200">
                                <button
                                    onClick={() => setActiveTab("wilayah")}
                                    className={[
                                        "cursor-pointer border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
                                        activeTab === "wilayah"
                                            ? "border-blue-900 text-blue-900"
                                            : "border-transparent text-slate-400 hover:text-slate-600",
                                    ].join(" ")}
                                >
                                    Wilayah Kerja
                                </button>
                                <button
                                    onClick={() => setActiveTab("performance")}
                                    className={[
                                        "cursor-pointer border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
                                        activeTab === "performance"
                                            ? "border-blue-900 text-blue-900"
                                            : "border-transparent text-slate-400 hover:text-slate-600",
                                    ].join(" ")}
                                >
                                    Performance Report
                                </button>
                                <button
                                    onClick={() => setActiveTab("adminLog")}
                                    className={[
                                        "cursor-pointer border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
                                        activeTab === "adminLog"
                                            ? "border-blue-900 text-blue-900"
                                            : "border-transparent text-slate-400 hover:text-slate-600",
                                    ].join(" ")}
                                >
                                    Admin Log
                                </button>

                            </div>
                            {activeTab === "wilayah" && <OverviewTab />}
                            {activeTab === "performance" && (
                                <PerformanceReportTab userEmail={user?.email ?? ""} role={role ?? "user"} onLogout={handleLogout} />
                            )}
                            {activeTab === "adminLog" && <AdminLog />}
                        </>
                    )}

                    {activeTabMain === "adminProfile" && (
                        <>
                            <AdminProfile userId={user!.id} userEmail={user!.email!} />
                        </>
                    )}



                </div>
            )}
        </div>
    );
};

export default AdminPerformanceContent;