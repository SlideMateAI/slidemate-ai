"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your projects
            </h1>
            <p className="mt-2 text-slate-300">
              Logged in as {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10"
          >
            Log out
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-xl font-semibold">Start a new presentation</h2>
          <p className="mt-2 text-slate-300">
            Upload a messy PowerPoint, notes, or assignment brief and turn it
            into a clean editable deck.
          </p>

          <a
            href="/upload"
            className="mt-6 inline-block rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
          >
            Upload presentation
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Credits</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
            <p className="mt-1 text-sm text-slate-400">
              Export credits available
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Projects</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
            <p className="mt-1 text-sm text-slate-400">
              Presentations created
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Plan</h3>
            <p className="mt-2 text-3xl font-bold">Free</p>
            <p className="mt-1 text-sm text-slate-400">
              Preview outlines for free
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
