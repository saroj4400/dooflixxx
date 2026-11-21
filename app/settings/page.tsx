
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    User,
    Play,
    Bell,
    Palette,
    Languages,
    Shield,
    Headphones,
    Info,
    LogOut,
    ChevronRight,
    ArrowLeft,
    Monitor,
    Subtitles,
    Volume2,
    Film,
    Tv,
    Megaphone,
    Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
    const { user, profile } = useAuth();
    const [videoQuality, setVideoQuality] = useState("Auto");
    const [autoplay, setAutoplay] = useState(true);
    const [subtitles, setSubtitles] = useState(true);
    const [movieAlerts, setMovieAlerts] = useState(true);
    const [tvAlerts, setTvAlerts] = useState(true);
    const [announcements, setAnnouncements] = useState(false);
    const [darkTheme, setDarkTheme] = useState(true);
    const [language, setLanguage] = useState("English");
    const [subtitleLanguage, setSubtitleLanguage] = useState("English");

    const toggle = (value: boolean, setter: (v: boolean) => void) => (
        <button
            onClick={() => setter(!value)}
            className={`relative w-12 h-6 rounded-full transition-colors ${value ? "bg-red-600" : "bg-zinc-700"
                }`}
            aria-label="Toggle setting"
            role="switch"
            aria-checked={value}
        >
            <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-7" : "left-1"
                    }`}
            />
        </button>
    );

    const section = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
        <section className="mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101012]">
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
                <span className="text-red-500">{icon}</span>
                <h2 className="font-semibold text-white">{title}</h2>
            </div>
            <div className="px-5">{children}</div>
        </section>
    );

    const row = (label: string, description: string, control: React.ReactNode) => (
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] py-4 last:border-0">
            <div className="min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="mt-1 text-xs text-zinc-500">{description}</p>
            </div>
            {control}
        </div>
    );

    const select = (
        value: string,
        setter: (v: string) => void,
        options: string[]
    ) => (
        <select
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="max-w-[135px] rounded-lg border border-white/10 bg-[#1c1c20] px-3 py-2 text-xs text-white outline-none"
        >
            {options.map((option) => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    );

    return (
        <main className="min-h-screen bg-[#060608] px-4 pb-32 pt-8 text-white sm:px-6">
            <div className="mx-auto max-w-3xl">

                <Link
                    href="/"
                    className="relative z-50 mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>

                <div className="mb-8">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                        DOOMSPLAY
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Personalize your Doomsplay experience
                    </p>
                </div>

                {section("My Account", <User size={19} />,
                    <>
                        {row("Profile information", "Manage your personal details",
                            <ChevronRight size={18} className="text-zinc-500" />)}
                        {row("Name", "Your Doomsplay display name",
                            <span className="max-w-[150px] truncate text-xs text-zinc-400">{profile?.full_name || (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "Not signed in")}</span>)}
                        {row("Email", "Your registered email address",
                            <span className="max-w-[150px] truncate text-xs text-zinc-400">{user?.email || "Not signed in"}</span>)}
                        <button type="button" onClick={() => window.dispatchEvent(new Event("doomsplay:open-auth"))} className="flex w-full items-center justify-between py-4 text-sm font-medium text-red-500">
                            {user ? "Edit profile" : "Sign in or create an account"} <ChevronRight size={17} />
                        </button>
                    </>
                )}

                {section("Playback", <Play size={19} />,
                    <>
                        {row("Video Quality", "Choose your preferred streaming quality",
                            select(videoQuality, setVideoQuality, ["Auto", "1080p", "720p", "480p"]))}
                        {row("Autoplay", "Automatically play the next episode",
                            toggle(autoplay, setAutoplay))}
                        {row("Subtitles", "Enable subtitles during playback",
                            toggle(subtitles, setSubtitles))}
                    </>
                )}

                {section("Notifications", <Bell size={19} />,
                    <>
                        {row("New movie alerts", "Get notified about new movies",
                            toggle(movieAlerts, setMovieAlerts))}
                        {row("New TV show alerts", "Discover newly released TV shows",
                            toggle(tvAlerts, setTvAlerts))}
                        {row("Announcements", "Receive Doomsplay updates",
                            toggle(announcements, setAnnouncements))}
                    </>
                )}

                {section("Appearance", <Palette size={19} />,
                    <>
                        {row("Dark theme", "Use the cinematic dark interface",
                            toggle(darkTheme, setDarkTheme))}
                        {row("Interface", "Your current interface",
                            <span className="text-xs text-zinc-400">Cinematic</span>)}
                    </>
                )}

                {section("Language", <Languages size={19} />,
                    <>
                        {row("App language", "Choose your interface language",
                            select(language, setLanguage, ["English", "Hindi", "Spanish", "French", "Arabic"]))}
                        {row("Subtitle language", "Preferred subtitle language",
                            select(subtitleLanguage, setSubtitleLanguage, ["English", "Hindi", "Spanish", "French", "Arabic"]))}
                    </>
                )}

                {section("Privacy & Security", <Shield size={19} />,
                    <>
                        <Link href="/privacy-policy" className="flex items-center justify-between border-b border-white/[0.05] py-4 text-sm text-zinc-300">
                            Privacy Policy <ChevronRight size={17} className="text-zinc-500" />
                        </Link>
                        <Link href="/account-security" className="flex items-center justify-between py-4 text-sm text-zinc-300">
                            Account Security <ChevronRight size={17} className="text-zinc-500" />
                        </Link>
                    </>
                )}

                {section("Support", <Headphones size={19} />,
                    <>
                        <Link href="/help" className="flex items-center justify-between border-b border-white/[0.05] py-4 text-sm text-zinc-300">
                            Help Center <ChevronRight size={17} className="text-zinc-500" />
                        </Link>
                        <Link href="/contact" className="flex items-center justify-between border-b border-white/[0.05] py-4 text-sm text-zinc-300">
                            Contact Support <ChevronRight size={17} className="text-zinc-500" />
                        </Link>
                        <Link href="/report-problem" className="flex items-center justify-between py-4 text-sm text-zinc-300">
                            Report a Problem <ChevronRight size={17} className="text-zinc-500" />
                        </Link>
                    </>
                )}

                {section("About Doomsplay", <Info size={19} />,
                    <>
                        {row("App Version", "Current application version",
                            <span className="text-xs text-zinc-500">1.0.0</span>)}
                        {row("Platform", "Your streaming experience",
                            <span className="text-xs text-zinc-500">Doomsplay</span>)}
                    </>
                )}

                {user && <button
                    onClick={() => { void createClient().auth.signOut(); }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] py-4 font-semibold text-red-500 transition hover:bg-red-500/15"
                >
                    <LogOut size={19} />
                    Sign Out
                </button>}

                <div className="py-8 text-center">
                    <p className="text-xs font-bold tracking-[0.3em] text-zinc-600">
                        DOOMSPLAY
                    </p>
                    <p className="mt-2 text-[11px] text-zinc-700">
                        CINEMATIC ENTERTAINMENT · VERSION 1.0
                    </p>
                </div>

            </div>
        </main>
    );
}
