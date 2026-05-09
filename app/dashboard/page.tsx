"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Project = {
  id: string;
  title: string;
  status: string;
  uploaded_file_path: string | null;
  generated_file_path: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("projects")
        .select("id, title, status, uploaded_file_path, generated_file_path, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setProjects(data || []);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your projects
            </h1>
            <p className="mt-2 text-slate-300">
              Logged in as {user?.email}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/upload"
              className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400"
            >
              Upload new
            </a>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10"
            >
              Log out
            </button>
          </div>
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
            <p className="mt-2 text-3xl font-bold">{projects.length}</p>
            <p className="mt-1 text-sm text-slate-400">
              Files uploaded
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

        {message && (
          <p className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-200">
            {message}
          </p>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Recent uploads</h2>

          {projects.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-8">
              <p className="text-slate-300">
                You have not uploaded any presentations yet.
              </p>

              <a
                href="/upload"
                className="mt-6 inline-block rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
              >
                Upload your first presentation
              </a>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Status: {project.status}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Uploaded:{" "}
                        {new Date(project.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <a
                        href={`/preview?projectId=${project.id}`}
                        className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
                      >
                        Preview
                      </a>

                      <a
                        href="/download"
                        className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
