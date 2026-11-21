"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const APK_DOWNLOAD_URL =
  "https://github.com/saroj0090/DoomsplayAndroid/releases/download/v1.0.0/Doomsplay.apk";

const STORAGE_KEY = "doomsplay_apk_popup_dismissed_v1";

export function AppDownloadPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 1. Do not display on watch pages to avoid covering stream player controls
    if (pathname.startsWith("/watch")) {
      setIsVisible(false);
      return;
    }

    // 2. Check if user already dismissed the popup in this session
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (isDismissed === "1") {
        setIsVisible(false);
        return;
      }
    } catch {
      // Ignore storage errors in private mode
    }

    // 3. Detect if currently running inside the Android WebView app
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      const isWebView =
        ua.includes("wv") ||
        ua.includes("doomsplayandroid") ||
        (ua.includes("android") && ua.includes("version/"));

      if (isWebView) {
        setIsVisible(false);
        return;
      }
    }

    // Safe to display after initial mount
    setIsVisible(true);
  }, [pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors
    }
  };

  if (!isVisible || pathname.startsWith("/watch")) return null;

  return (
    <>
      {/* Mobile & Tablet: Compact, Non-intrusive Glass Pill */}
      <aside
        aria-label="Download Android App"
        className="fixed top-16 sm:top-20 right-3 sm:right-6 lg:hidden z-30 transition-all duration-300 pointer-events-auto select-none animate-fade-in"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[#0e0e13]/90 py-1.5 pl-2.5 pr-1.5 backdrop-blur-2xl shadow-xl hover:border-red-600/40 transition">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600/20 text-red-500">
            <Smartphone size={13} className="stroke-[2.5]" />
          </div>
          <a
            href={APK_DOWNLOAD_URL}
            download="Doomsplay.apk"
            onClick={handleDismiss}
            className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition-colors"
          >
            <span>Get App</span>
            <Download size={13} className="text-red-500 stroke-[2.5]" />
          </a>
          <button
            onClick={handleDismiss}
            aria-label="Close download popup"
            className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white active:scale-90"
          >
            <X size={12} />
          </button>
        </div>
      </aside>

      {/* Desktop: Refined Floating Promotion Card */}
      <aside
        aria-label="Download Android App"
        className="hidden lg:block fixed top-20 right-8 lg:right-12 xl:right-14 z-30 w-72 transition-all duration-300 ease-out pointer-events-auto select-none opacity-100 translate-y-0 scale-100 animate-fade-in"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0e0e13]/95 p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition hover:border-red-600/40 group">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-red-600/15 blur-2xl transition group-hover:bg-red-600/25" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            aria-label="Close download popup"
            className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white active:scale-90"
          >
            <X size={14} />
          </button>

          {/* Card Header & Content */}
          <div className="flex items-start gap-2.5 pr-5">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/30 text-red-500 shadow-sm">
              <Smartphone size={16} className="stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-red-600/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-red-400 border border-red-500/30">
                  <Sparkles size={9} />
                  Android
                </span>
                <span className="text-[10.5px] font-medium text-white/40">v1.0.0</span>
              </div>
              <h3 className="mt-1 text-xs font-bold leading-snug text-white tracking-tight">
                Official Doomsplay APK
              </h3>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-2.5 pt-0.5">
            <a
              href={APK_DOWNLOAD_URL}
              download="Doomsplay.apk"
              onClick={handleDismiss}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-600 py-1.5 px-3 text-center text-xs font-extrabold text-white shadow-lg shadow-red-600/30 transition-all duration-200 hover:bg-red-700 active:scale-[0.98]"
            >
              <Download size={13} className="stroke-[2.5]" />
              <span>Download APK</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
