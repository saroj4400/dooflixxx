import Link from "next/link";
import { Film, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-cinema shadow-inner">
        <Film size={38} />
      </div>

      <span className="mt-6 text-xs font-black uppercase tracking-widest text-cinema">
        Error 404
      </span>

      <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Title Not Found</h1>

      <p className="mt-3 text-sm leading-relaxed text-white/50">
        The movie, show, or scene you are trying to reach may have moved or is no longer in our
        active discovery catalogue.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-cinema px-6 py-3 text-sm font-black text-black shadow-lg shadow-cinema/20 hover:bg-cinema-light transition active:scale-95"
        >
          <Home size={16} />
          <span>Home Feed</span>
        </Link>

        <Link
          href="/new-popular"
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition active:scale-95"
        >
          <Compass size={16} />
          <span>Trending Titles</span>
        </Link>
      </div>
    </div>
  );
}
