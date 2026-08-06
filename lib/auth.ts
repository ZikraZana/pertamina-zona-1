import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Memastikan request berasal dari user yang sudah login DAN berrole admin.
 * Pakai di endpoint API yang hanya boleh diakses admin.
 *
 * Return { user, err: null } kalau lolos.
 * Return { user, err: NextResponse } kalau gagal — langsung `return err` di route.
 */
export async function requireAdmin(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            user: null,
            err: NextResponse.json({ error: "Silakan login terlebih dahulu.", code: "UNAUTHORIZED" }, { status: 401 }),
        };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return {
            user,
            err: NextResponse.json({ error: "Hanya admin yang bisa melakukan aksi ini.", code: "FORBIDDEN" }, { status: 403 }),
        };
    }

    return { user, err: null };
}