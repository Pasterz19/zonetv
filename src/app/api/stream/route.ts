import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for streaming

// Simple in-memory rate limiter (per IP)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  if (!record || now > record.resetAt) {
    // New window
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimiter.entries()) {
    if (now > record.resetAt) {
      rateLimiter.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// HLS Stream Proxy - omija problemy CORS
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Too many requests.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      console.error('[Stream Proxy] Missing URL parameter');
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Decode URL
    const decodedUrl = decodeURIComponent(url);
    console.log('[Stream Proxy] Fetching:', decodedUrl.substring(0, 100) + '...');

    // Security: Only allow specific protocols
    if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
      console.error('[Stream Proxy] Invalid protocol:', decodedUrl.substring(0, 50));
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
    }

    // Determine content type based on URL
    let contentType = 'application/octet-stream';
    if (decodedUrl.includes('.m3u8')) {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (decodedUrl.includes('.ts')) {
      contentType = 'video/mp2t';
    } else if (decodedUrl.includes('.m3u')) {
      contentType = 'audio/mpegurl';
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response: Response;
    try {
      // Fetch the stream with timeout
      response = await fetch(decodedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'VLC/3.0.0 LibVLC/3.0.0',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Icy-MetaData': '1',
        },
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      console.error('[Stream Proxy] Fetch error:', errorMessage);
      return NextResponse.json(
        { error: `Network error: ${errorMessage}` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error(`[Stream Proxy] HTTP error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Stream error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentTypeFromResponse = response.headers.get('content-type') || '';
    const finalContentType = contentTypeFromResponse || contentType;

    console.log('[Stream Proxy] Content-Type:', finalContentType);

    // For m3u8 files, rewrite URLs to use proxy
    if (finalContentType.includes('mpegurl') || 
        finalContentType.includes('m3u') || 
        decodedUrl.includes('.m3u8')) {
      
      let text: string;
      try {
        text = await response.text();
      } catch (textError) {
        console.error('[Stream Proxy] Failed to read m3u8:', textError);
        return NextResponse.json(
          { error: 'Failed to read playlist' },
          { status: 500 }
        );
      }

      console.log('[Stream Proxy] M3U8 content length:', text.length);
      
      // Get base URL for relative paths
      const lastSlashIndex = decodedUrl.lastIndexOf('/');
      const baseUrl = lastSlashIndex > 0 ? decodedUrl.substring(0, lastSlashIndex + 1) : '';
      
      // Rewrite URLs in m3u8 content
      const rewrittenText = text
        .split('\n')
        .map((line, index) => {
          const trimmedLine = line.trim();
          
          // Skip empty lines
          if (trimmedLine === '') {
            return '';
          }
          
          // Handle comment lines (starting with #)
          if (trimmedLine.startsWith('#')) {
            // Rewrite URI in EXT-X-KEY, EXT-X-MAP, etc.
            if (trimmedLine.includes('URI="')) {
              return trimmedLine.replace(/URI="([^"]+)"/, (match, uri) => {
                const absoluteUri = uri.startsWith('http') ? uri : baseUrl + uri;
                return `URI="/api/stream?url=${encodeURIComponent(absoluteUri)}"`;
              });
            }
            return trimmedLine;
          }
          
          // Rewrite segment URLs
          // Full URL
          if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
            return `/api/stream?url=${encodeURIComponent(trimmedLine)}`;
          }
          
          // Relative URL (not starting with /)
          if (!trimmedLine.startsWith('/') && baseUrl) {
            return `/api/stream?url=${encodeURIComponent(baseUrl + trimmedLine)}`;
          }
          
          // Absolute path or unknown - keep as is
          return trimmedLine;
        })
        .join('\n');

      console.log('[Stream Proxy] Rewritten M3U8 length:', rewrittenText.length);

      return new NextResponse(rewrittenText, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // For TS segments and other binary data, just proxy
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await response.arrayBuffer();
    } catch (bufferError) {
      console.error('[Stream Proxy] Failed to read binary data:', bufferError);
      return NextResponse.json(
        { error: 'Failed to read stream data' },
        { status: 500 }
      );
    }

    console.log('[Stream Proxy] Binary data length:', arrayBuffer.byteLength);

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': finalContentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('[Stream Proxy] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
