"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  title: string;
  status: string;
  uploaded_file_path: string | null;
  created_at: string;
};

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [project, setProject] = useState<Project | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (!projectId) {
        setMessage("No project selected.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, title, status, uploaded_file_path, created_at")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        setMessage(error.message);
      } else {
        setProject(data);
      }

      setLoading(false);
    }

    loadProject();
  }, [projectId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-300">Loading preview...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/dashboard" className="text-sm text-blue-300 hover:text-blue-200">
          ← Back to dashboard
        </a>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Preview your project
          </h1>

          {message && (
            <p className="mt-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-200">
              {message}
            </p>
          )}

          {project && (
            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">Project title</p>
                <h2 className="mt-2 text-2xl font-semibold">{project.title}</h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">Status</p>
                <p className="mt-2 text-lg">{project.status}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">Uploaded file path</p>
                <p className="mt-2 break-all text-sm text-slate-300">
                  {project.uploaded_file_path}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-6">
                <h3 className="text-xl font-semibold">Next step</h3>
                <p className="mt-2 text-slate-300">
                  In the next step, SlideMate AI will read this uploaded file and
                  turn it into an improved slide outline.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="text-slate-300">Loading preview...</p>
          </div>
        </main>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
