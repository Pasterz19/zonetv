import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      signal: req.signal,
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      return new NextResponse(`Upstream Error: ${response.status}${details ? `\n${details}` : ""}`, {
        status: response.status,
      });
    }

    if (!response.body) {
      return new NextResponse("No body", { status: 500 });
    }

    // Pass essential headers
    const headers = new Headers();
    if (response.headers.has("content-length")) {
      headers.set("Content-Length", response.headers.get("content-length")!);
    }
    headers.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    // If client aborted request, bubble as 499-like response
    if (error instanceof Error && error.name === "AbortError") {
      return new NextResponse("Client aborted", { status: 499 });
    }
    console.error("Proxy Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Proxy Error: ${msg}`, { status: 502 });
  }
}
