import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// SSRF Protection: check if host/IP is private or forbidden
function isForbiddenHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  // Localhost and loopback
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "[::1]" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost") ||
    host === "metadata.google.internal"
  ) {
    return true;
  }

  // IPv4 regex check for private & link-local ranges
  const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const p1 = parseInt(ipMatch[1], 10);
    const p2 = parseInt(ipMatch[2], 10);

    // 10.0.0.0/8
    if (p1 === 10) return true;
    // 127.0.0.0/8
    if (p1 === 127) return true;
    // 0.0.0.0/8
    if (p1 === 0) return true;
    // 172.16.0.0 - 172.31.255.255
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    // 192.168.0.0/16
    if (p1 === 192 && p2 === 168) return true;
    // 169.254.0.0/16 (Link-local / AWS & Cloud Metadata)
    if (p1 === 169 && p2 === 254) return true;
  }

  return false;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    }
  });
}

export async function GET(request: NextRequest) {
  const targetParam = request.nextUrl.searchParams.get("url");

  if (!targetParam) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 }
    );
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(targetParam);
  } catch {
    return NextResponse.json(
      { error: "Invalid target URL" },
      { status: 400 }
    );
  }

  // Validate protocol
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return NextResponse.json(
      { error: "Unsupported protocol. Only HTTP and HTTPS are permitted." },
      { status: 400 }
    );
  }

  // SSRF check
  if (isForbiddenHost(targetUrl.hostname)) {
    return NextResponse.json(
      { error: "Access to private or local network resources is forbidden." },
      { status: 403 }
    );
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "*/*",
        Referer: targetUrl.origin
      }
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 304) {
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const contentType = upstreamResponse.headers.get("content-type") || "";
    const isM3U8 =
      targetUrl.pathname.endsWith(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("application/x-mpegurl") ||
      contentType.includes("application/vnd.apple.mpegurl");

    if (isM3U8) {
      const text = await upstreamResponse.text();
      const lines = text.split(/\r?\n/);
      const rewrittenLines: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          rewrittenLines.push(line);
          continue;
        }

        // Rewrite URI attributes in tags like #EXT-X-KEY:...,URI="..." or #EXT-X-MAP:URI="..."
        if (trimmed.startsWith("#")) {
          const rewrittenTag = trimmed.replace(
            /URI="([^"]+)"/g,
            (_match, uriPath) => {
              const absUri = new URL(uriPath, targetUrl.toString()).toString();
              return `URI="/api/live-tv/proxy?url=${encodeURIComponent(absUri)}"`;
            }
          );
          rewrittenLines.push(rewrittenTag);
          continue;
        }

        // Stream segment or playlist URI
        const absoluteUri = new URL(trimmed, targetUrl.toString()).toString();
        rewrittenLines.push(`/api/live-tv/proxy?url=${encodeURIComponent(absoluteUri)}`);
      }

      return new Response(rewrittenLines.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    }

    // Binary media segment (TS / AAC / fMP4)
    const responseHeaders = new Headers();
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    if (contentType) responseHeaders.set("Content-Type", contentType);
    const contentLength = upstreamResponse.headers.get("content-length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);
    responseHeaders.set("Cache-Control", "public, max-age=60");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders
    });
  } catch (err: any) {
    console.error("[LiveTV Proxy] Upstream fetch failed:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to proxy stream", details: err?.message || "Unknown error" },
      { status: 502 }
    );
  }
}
