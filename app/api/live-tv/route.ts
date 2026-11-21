import { NextRequest, NextResponse } from "next/server";
import { getLiveChannels } from "@/lib/livetv";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase().trim();
    const category = searchParams.get("category")?.toLowerCase().trim();
    const language = searchParams.get("language")?.toLowerCase().trim();

    let channels = await getLiveChannels();

    if (category && category !== "all") {
      channels = channels.filter((c) => c.category.toLowerCase() === category);
    }

    if (language && language !== "all") {
      channels = channels.filter((c) =>
        Array.isArray(c.languages)
          ? c.languages.some((l) => l.toLowerCase() === language)
          : c.language?.toLowerCase() === language
      );
    }

    if (q) {
      channels = channels.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.altNames?.some((alt) => alt.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q) ||
          (c.country && c.country.toLowerCase().includes(q)) ||
          (c.language && c.language.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      channels,
      total: channels.length
    });
  } catch (error) {
    console.error("[LiveTV API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live channels" },
      { status: 500 }
    );
  }
}
