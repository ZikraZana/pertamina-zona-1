"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

type Props = {
    userId: string;
    userEmail: string;
};

const AdminProfile = ({ userId, userEmail }: Props) => {
    const supabase = useMemo(() => createClient(), []);

    // ---------- Ambil data profil terbaru setiap kali component dibuka ----------
    const [fullName, setFullName] = useState("");
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            const { data } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", userId)
                .single();

            setFullName(data?.full_name ?? "");
            setProfileLoading(false);
        }
        fetchProfile();
    }, [userId, supabase]);

    // ---------- Edit nama ----------
    const [nameLoading, setNameLoading] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState(false);

    async function handleSaveName(e: React.FormEvent) {
        e.preventDefault();
        setNameError(null);
        setNameSuccess(false);
        setNameLoading(true);

        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName })
            .eq("id", userId);

        if (error) {
            setNameError("Gagal menyimpan nama.");
        } else {
            setNameSuccess(true);
        }
        setNameLoading(false);
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-bold text-blue-900">Informasi Akun</h2>

                {profileLoading && <p className="mb-3 text-xs text-slate-400">Memuat...</p>}

                <div className="mb-4">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                        {userEmail}
                    </p>
                </div>

                <form onSubmit={handleSaveName} className="flex flex-col gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Nama Lengkap</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    {nameError && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{nameError}</p>
                    )}
                    {nameSuccess && (
                        <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">Nama tersimpan.</p>
                    )}

                    <button
                        type="submit"
                        disabled={nameLoading}
                        className="w-fit cursor-pointer rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {nameLoading ? "Menyimpan..." : "Simpan Nama"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;