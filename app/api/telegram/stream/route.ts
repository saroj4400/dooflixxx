import { NextRequest, NextResponse } from "next/server";
import { getTelegramDirectFileUrl } from "@/lib/telegram";

/**
 * GET /api/telegram/stream?fileId=...
 *
 * Streams authorized video content from Telegram's Bot API to the browser.
 * Protects TELEGRAM_BOT_TOKEN completely by proxying headers and chunks on the server.
 * Supports HTTP Range requests for video scrubbing and seeking.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return new NextResponse("File ID required", { status: 400 });
  }

  const directUrl = await getTelegramDirectFileUrl(fileId);
  if (!directUrl) {
    return new NextResponse("Telegram file unavailable or unauthorized", { status: 404 });
  }

  try {
    const rangeHeader = request.headers.get("range");
    const fetchHeaders: HeadersInit = {};
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const upstreamResponse = await fetch(directUrl, {
      headers: fetchHeaders
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      return new NextResponse("Failed to fetch stream from Telegram storage", {
        status: upstreamResponse.status
      });
    }

    const responseHeaders = new Headers();
    const forwardHeaders = ["content-type", "content-length", "content-range", "accept-ranges"];
    forwardHeaders.forEach((header) => {
      const val = upstreamResponse.headers.get(header);
      if (val) responseHeaders.set(header, val);
    });

    if (!responseHeaders.has("content-type")) {
      responseHeaders.set("content-type", "video/mp4");
    }
    if (!responseHeaders.has("accept-ranges")) {
      responseHeaders.set("accept-ranges", "bytes");
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Error streaming Telegram file:", error);
    return new NextResponse("Streaming error", { status: 500 });
  }
}
