import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck, Info, ChevronRight, Scale, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms — Doomsplay",
  description: "Review the Terms of Service governing your use of the Doomsplay platform."
};

export default function TermsPage() {
  return (
    <div className="mx-auto min-h-[75vh] max-w-4xl px-4 pt-28 sm:pt-32 md:pt-36 pb-16 sm:px-6 md:px-8">
      {/* Breadcrumbs & Navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs text-white/50">
        <Link href="/" className="flex items-center gap-1 transition hover:text-white">
          <ArrowLeft size={13} />
          <span>Home</span>
        </Link>
        <ChevronRight size={12} className="text-white/30" />
        <span className="text-white">Terms</span>
      </div>

      {/* Legal & Info Tab Navigation */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <Link
          href="/about"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <Info size={14} />
          <span>About</span>
        </Link>
        <Link
          href="/privacy"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <ShieldCheck size={14} />
          <span>Privacy</span>
        </Link>
        <Link
          href="/terms"
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500"
        >
          <FileText size={14} />
          <span>Terms</span>
        </Link>
      </div>

      {/* Main Content Card */}
      <article className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0c0c12]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 text-red-500">
                <Scale size={18} />
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                Terms
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-white/50">
              User rights, platform conditions, and legal terms of service.
            </p>
          </div>
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-bold text-sky-400">
            Terms of Service
          </span>
        </div>

        {/* Exact Content Required */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-white/80">
          <p>
            These Terms of Service govern your use of Doomsplay. By accessing or using our platform, you agree to be bound by these terms. We reserve the right to modify these terms at any time. Users must be at least 13 years of age to use our services. Any violation of these terms may result in account termination.
          </p>
        </div>

        {/* Quick Links Section in Content */}
        <div className="mt-10 rounded-xl border border-white/5 bg-white/[0.03] p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/90">
            Quick Links
          </h2>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium">
            <Link href="/about" className="text-white/60 hover:text-white transition">
              → About Us
            </Link>
            <Link href="/privacy" className="text-white/60 hover:text-white transition">
              → Privacy Policy
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
