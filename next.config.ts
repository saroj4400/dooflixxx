import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Embed hosts allowed in iframes, derived from the provider URL templates in
 * lib/player.ts so a newly added server is allowed automatically. If the file
 * cannot be read, fall back to any https origin rather than breaking playback.
 */
function providerFrameSources(): string[] {
  try {
    const src = readFileSync(join(process.cwd(), "lib", "player.ts"), "utf8");
    const origins = new Set<string>();
    for (const m of src.matchAll(/["'`](https:\/\/[a-z0-9.-]+)(?:[/"'`?])/gi)) {
      origins.add(m[1].toLowerCase());
    }
    return origins.size > 0 ? Array.from(origins) : ["https:"];
  } catch {
    return ["https:"];
  }
}

// These directives do not touch script-src, so they cannot break Next.js itself.
const csp = [
  `frame-src 'self' ${providerFrameSources().join(" ")}`,
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'"
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Workers free setup: keep the same image URLs and layout without
    // requiring the separately billed Cloudflare Images optimization binding.
    unoptimized: true,
    remotePatterns: [
      // TMDB official image CDN
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**"
      },
      // Unsplash fallback images
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      // Google storage (BigBuckBunny thumbnail placeholder)
      {
        protocol: "https",
        hostname: "storage.googleapis.com"
      }
    ]
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          }
        ]
      }
    ];
  }
};

export default nextConfig;