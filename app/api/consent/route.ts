import { NextRequest, NextResponse } from "next/server";
import { recordConsent } from "@/lib/consent/recorder";
import { validateConsentPayload } from "@/lib/consent/validator";
import type { ConsentPayload } from "@/types/consent";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ConsentPayload>;

    const validation = validateConsentPayload(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid consent payload", missing_fields: validation.missing_fields },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;
    const userAgent = request.headers.get("user-agent");

    const result = await recordConsent(body as ConsentPayload, ipAddress, userAgent);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Consent recording error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
