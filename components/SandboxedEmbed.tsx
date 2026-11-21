"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

/**
 * SandboxedEmbed - iframe wrapper for third-party player embeds.
 *
 * Why a sandbox and not injected JS: the Android app blocks popups by injecting
 *   window.open = () => null  and  target="_blank" -> "_self"
 * into the player page, which works because a WebView loads the player as its
 * top-level document. On a website the player is a cross-origin iframe, so the
 * same-origin policy stops you from touching its code. The browser-enforced
 * equivalent is the iframe `sandbox` attribute:
 *
 *   strict  (default) no allow-popups, no allow-top-navigation*, no allow-modals,
 *                     no allow-downloads  ->  popups, new tabs and redirects of
 *                     your page are blocked by the browser itself.
 *   relaxed           adds allow-popups + allow-popups-to-escape-sandbox. This
 *                     LETS popups through, unsandboxed. Avoid.
 *   none              no sandbox at all.
 *
 * Some providers detect the sandbox and refuse to play. For providers in
 * "strict" mode the viewer can flip a per-host "compatibility mode" (sandbox
 * off), remembered in localStorage. While the sandbox is off, a beforeunload
 * guard asks before the embed can navigate the whole page away.
 */

export type SandboxMode = "strict" | "relaxed" | "none";

const SANDBOX_STRICT =
    "allow-scripts allow-same-origin allow-forms allow-presentation";
const SANDBOX_RELAXED = `${SANDBOX_STRICT} allow-popups allow-popups-to-escape-sandbox`;
const COMPAT_KEY = "cinemate:embed-compat-hosts";

function hostOf(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return "";
    }
}

function readCompatHosts(): string[] {
    try {
        const raw = window.localStorage.getItem(COMPAT_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
            ? parsed.filter((h): h is string => typeof h === "string")
            : [];
    } catch {
        return [];
    }
}

function writeCompatHosts(hosts: string[]) {
    try {
        window.localStorage.setItem(COMPAT_KEY, JSON.stringify(hosts));
    } catch {
        /* storage unavailable (private mode): the choice just won't persist */
    }
}

export interface SandboxedEmbedProps {
    src: string;
    title: string;
    /** Baseline from the provider config. Defaults to "strict". */
    mode?: SandboxMode;
    className?: string;
    allow?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export function SandboxedEmbed({
    src,
    title,
    mode = "strict",
    className = "h-full w-full border-0 bg-black",
    allow = "autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; clipboard-write; web-share",
    onLoad,
    onError
}: SandboxedEmbedProps) {
    const host = hostOf(src);
    const [compat, setCompat] = useState(false);

    // Read the saved choice after mount so server and client markup match.
    useEffect(() => {
        setCompat(readCompatHosts().includes(host));
    }, [host]);

    // Viewer compatibility mode only ever relaxes a "strict" baseline.
    const effective: SandboxMode = mode === "strict" && compat ? "none" : mode;
    const sandbox =
        effective === "none"
            ? undefined
            : effective === "relaxed"
                ? SANDBOX_RELAXED
                : SANDBOX_STRICT;
    const protectedMode = effective === "strict";

    // Without the sandbox, ask before the embed can navigate the page away.
    // Fires on real unloads only (not on Next.js client-side routing).
    useEffect(() => {
        if (protectedMode) return;
        const guard = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", guard);
        return () => window.removeEventListener("beforeunload", guard);
    }, [protectedMode]);

    const toggle = () => {
        const hosts = readCompatHosts();
        const next = compat ? hosts.filter((h) => h !== host) : [...hosts, host];
        writeCompatHosts(Array.from(new Set(next)));
        setCompat(!compat);
    };

    const badgeBase =
        "absolute left-2 top-2 z-20 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-semibold text-white/70 backdrop-blur-md";

    return (
        <>
            <iframe
                // Remount when the mode changes: sandbox only takes effect on navigation.
                key={`${src}|${effective}`}
                src={src}
                title={title}
                sandbox={sandbox}
                allow={allow}
                allowFullScreen
                referrerPolicy="origin"
                onLoad={onLoad}
                onError={onError}
                className={className}
            />

            {mode === "strict" ? (
                <button
                    type="button"
                    onClick={toggle}
                    title={
                        compat
                            ? "Compatibility mode is on: this player may open popups. Click to turn protection back on."
                            : "Popups and redirects from this player are blocked. If the video won't play, click to switch to compatibility mode."
                    }
                    className={`${badgeBase} opacity-60 transition hover:opacity-100 focus-visible:opacity-100`}
                >
                    {compat ? (
                        <>
                            <ShieldAlert size={12} className="text-amber-400" />
                            <span>Compatibility mode</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck size={12} className="text-emerald-400" />
                            <span>Popups blocked</span>
                        </>
                    )}
                </button>
            ) : (
                <div className={`${badgeBase} pointer-events-none opacity-60`}>
                    <ShieldAlert size={12} className="text-amber-400" />
                    <span>Popups possible</span>
                </div>
            )}
        </>
    );
}