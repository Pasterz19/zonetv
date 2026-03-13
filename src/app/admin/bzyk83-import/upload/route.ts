import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { importM3UContent } from '../actions';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const autoEnable = formData.get('autoEnable') === 'true';
    const forceImport = formData.get('forceImport') === 'true';
    const categoryPrefix = formData.get('categoryPrefix') as string || 'Upload';

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith('.m3u') && !file.name.endsWith('.m3u8')) {
      return NextResponse.json({ error: "Invalid file type. Only .m3u and .m3u8 files are allowed" }, { status: 400 });
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB" }, { status: 400 });
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const content = new TextDecoder('utf-8').decode(buffer);

    // Import channels
    const result = await importM3UContent(content, {
      autoEnable,
      forceImport,
      categoryPrefix,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Bzyk83] Upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Upload failed' },
      { status: 500 }
    );
  }
}
