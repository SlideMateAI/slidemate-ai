"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const allowedExtensions = [".pptx", ".pdf", ".docx", ".txt"];
const maxFileSize = 25 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!isAllowed) {
      setMessage("Please upload a .pptx, .pdf, .docx, or .txt file.");
      setSelectedFile(null);
      return;
    }

    if (file.size > maxFileSize) {
      setMessage("File is too large. Maximum file size is 25MB.");
      setSelectedFile(null);
      return;
    }

    setMessage("");
    setSelectedFile(file);
  }

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      setMessage("Please log in first.");
      return;
    }

    if (!selectedFile) {
      setMessage("Please choose a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${user.id}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedFile.type || "application/octet-stream",
      });

    if (uploadError) {
      setMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: projectError } = await supabase.from("projects").insert({
      user_id: user.id,
      title: selectedFile.name,
      uploaded_file_path: filePath,
      status: "uploaded",
    });

    if (projectError) {
      setMessage(projectError.message);
      setUploading(false);
      return;
    }

    setMessage("Upload successful! Your project was saved.");
    setSelectedFile(null);
    setUploading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-slate-300">Loading upload page...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <a href="/dashboard" className="text-sm text-blue-300 hover:text-blue-200">
          ← Back to dashboard
        </a>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Upload your presentation
          </h1>

          <p className="mt-3 text-slate-300">
            Upload a messy PowerPoint, notes, or assignment brief. SlideMate AI
            will use it to create a cleaner presentation.
          </p>

          <form onSubmit={handleUpload} className="mt-8 space-y-6">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/70 px-6 py-12 text-center hover:bg-slate-900">
              <span className="text-lg font-semibold">
                Choose a file to upload
              </span>

              <span className="mt-2 text-sm text-slate-400">
                Accepted files: .pptx, .pdf, .docx, .txt
              </span>

              <span className="mt-1 text-sm text-slate-500">
                Maximum size: 25MB
              </span>

              <input
                type="file"
                accept=".pptx,.pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <p className="font-medium">Selected file:</p>
                <p className="mt-1 text-sm text-slate-300">
                  {selectedFile.name}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload presentation"}
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-xl bg-white/10 p-4 text-sm text-slate-200">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
