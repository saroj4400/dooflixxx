import { NextRequest, NextResponse } from "next/server";
import { getStreamingDiagnostics } from "@/lib/streaming/diagnostics";

export const dynamic = "force-dynamic";

/** Add ?probe=true to perform a bounded, server-side TMDB metadata check. */
export async function GET(request: NextRequest) {
  const probe = request.nextUrl.searchParams.get("probe") === "true";
  try {
    const report = await getStreamingDiagnostics({ probe });
    return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[API /streaming/diagnostics]", error);
    return NextResponse.json({ error: "Unable to build provider diagnostics" }, { status: 500 });
  }
}
