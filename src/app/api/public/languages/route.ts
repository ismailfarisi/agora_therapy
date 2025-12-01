import { NextResponse } from "next/server";
import { LANGUAGES, POPULAR_INDIAN_LANGUAGES, LANGUAGE_GROUPS } from "@/lib/constants/languages";

/**
 * Public API to fetch available languages
 * No authentication required - this is public data
 */
export async function GET() {
  try {
    return NextResponse.json({
      languages: LANGUAGES,
      popularIndianLanguages: POPULAR_INDIAN_LANGUAGES,
      languageGroups: LANGUAGE_GROUPS,
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}
