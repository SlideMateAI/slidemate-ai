export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
          SlideMate AI
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Fix messy PowerPoints in minutes.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Upload your slides, notes, or assignment brief. SlideMate AI turns them
          into a clean, editable PowerPoint with better structure, stronger bullet
          points, and speaker notes.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/upload"
            className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
          >
            Start fixing my presentation
          </a>

          <a
            href="/pricing"
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            View pricing
          </a>
        </div>
      </section>
    </main>
  );
}