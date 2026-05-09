"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  title: string;
  status: string;
  uploaded_file_path: string | null;
  extracted_text: string | null;
  created_at: string;
};

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [project, setProject] = useState<Project | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);

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
        .select("id, title, status, uploaded_file_path, extracted_text, created_at")
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

  async function handleExtractText() {
    if (!project?.uploaded_file_path) {
      setMessage("This project does not have an uploaded file.");
      return;
    }

    if (!project.title.toLowerCase().endsWith(".pptx")) {
      setMessage("Text extraction currently supports .pptx files only.");
      return;
    }

    setExtracting(true);
    setMessage("");

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("uploads")
      .download(project.uploaded_file_path);

    if (downloadError || !fileBlob) {
      setMessage(downloadError?.message || "Could not download uploaded file.");
      setExtracting(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", fileBlob, project.title);

    const response = await fetch("/api/extract-pptx", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Failed to extract text.");
      setExtracting(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        extracted_text: result.extractedText,
        status: "text_extracted",
      })
      .eq("id", project.id);

    if (updateError) {
      setMessage(updateError.message);
      setExtracting(false);
      return;
    }

    setProject({
      ...project,
      extracted_text: result.extractedText,
      status: "text_extracted",
    });

    setMessage("Text extracted successfully.");
    setExtracting(false);
  }

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
            <p className="mt-5 rounded-xl bg-white/10 p-4 text-sm text-slate-200">
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

              <button
                onClick={handleExtractText}
                disabled={extracting}
                className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-60"
              >
                {extracting ? "Extracting text..." : "Extract text from PowerPoint"}
              </button>

              {project.extracted_text && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
                  <h3 className="text-xl font-semibold">Extracted text</h3>
                  <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-sm text-slate-300">
                    {project.extracted_text}
                  </pre>
                </div>
              )}
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
