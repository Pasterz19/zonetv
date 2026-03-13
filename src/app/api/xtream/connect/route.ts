import { NextRequest, NextResponse } from 'next/server';
import { query, runQuery } from '@/server/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

interface XtreamChannel {
  num: number;
  name: string;
  stream_icon: string;
  stream_url?: string;
  category_id: string;
  epg_channel_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Brak uprawnień' }, { status: 401 });
    }

    const body = await request.json();
    const { host, port, username, password } = body;

    if (!host || !username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Brak wymaganych danych' 
      });
    }

    // Build URL - remove protocol if present
    const cleanHost = host.replace(/^https?:\/\//, '');
    const portPart = port && port !== '80' ? `:${port}` : '';
    const baseUrl = `http://${cleanHost}${portPart}/player_api.php`;

    // Authenticate
    const authUrl = `${baseUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    
    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ZoneTV/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!authResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `Błąd połączenia: ${authResponse.status}` 
      });
    }

    const authData = await authResponse.json();

    // Check authentication
    if (authData.user_info?.status !== 'Active') {
      return NextResponse.json({ 
        success: false, 
        error: 'Konto nie jest aktywne lub błędne dane logowania' 
      });
    }

    // Get categories and channels in parallel
    const [categoriesRes, channelsRes] = await Promise.all([
      fetch(`${baseUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_live_categories`, {
        headers: { 'User-Agent': 'ZoneTV/1.0' }
      }),
      fetch(`${baseUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_live_streams`, {
        headers: { 'User-Agent': 'ZoneTV/1.0' }
      })
    ]);

    const categories: XtreamCategory[] = categoriesRes.ok ? await categoriesRes.json() : [];
    let channels: XtreamChannel[] = channelsRes.ok ? await channelsRes.json() : [];

    // Build stream URLs for channels
    const serverUrl = authData.server_info?.url || `http://${cleanHost}${portPart}`;
    channels = channels.map(ch => ({
      ...ch,
      stream_url: `${serverUrl}/live/${username}/${password}/${ch.num}.m3u8`
    }));

    return NextResponse.json({
      success: true,
      serverInfo: authData.server_info,
      userInfo: authData.user_info,
      categories: categories || [],
      channels: channels || []
    });

  } catch (error) {
    console.error('Xtream connect error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Błąd: ${(error as Error).message}` 
    });
  }
}
