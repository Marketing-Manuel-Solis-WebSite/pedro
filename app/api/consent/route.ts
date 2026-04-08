import { NextRequest, NextResponse } from "next/server";
import { recordConsent } from "@/lib/consent/recorder";
import { validateConsentPayload } from "@/lib/consent/validator";
import type { ConsentPayload } from "@/types/consent";

// TODO: In production, restrict to actual firm domains instead of '*'
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ConsentPayload>;

    const validation = validateConsentPayload(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid consent payload", missing_fields: validation.missing_fields },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;
    const userAgent = request.headers.get("user-agent");

    const result = await recordConsent(body as ConsentPayload, ipAddress, userAgent);

    return NextResponse.json(result, { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error("Consent recording error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
