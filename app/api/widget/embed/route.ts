import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const platformUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const { searchParams } = new URL(request.url);

  const params = new URLSearchParams();
  searchParams.forEach((value, key) => params.set(key, value));

  const snippet = `<script src="${platformUrl}/api/widget?${params.toString()}" defer></script>`;

  return new NextResponse(snippet, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
