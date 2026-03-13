"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { parseM3U, M3UEntry } from "@/lib/m3u-parser";
import { revalidatePath } from "next/cache";

import { XMLParser } from "fast-xml-parser";

const prisma = new PrismaClient();

export async function importEpgFromUrl(url: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    console.log("Fetching EPG from:", url);
    const response = await fetch(url, { signal: AbortSignal.timeout(120000) }); // 2 min timeout
    if (!response.ok) {
      console.error("EPG fetch failed:", response.status, response.statusText);
      return { error: `HTTP ${response.status} ${response.statusText} from Provider` };
    }

    const text = await response.text();
    console.log("EPG raw text length:", text.length);
    if (!text.trim()) {
      return { error: "Empty response from EPG URL" };
    }
    return await processEpgData(text);

  } catch (error) {
    console.error("EPG Import Error:", error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { error: "Timeout: EPG download took too long (>2 min)" };
      }
      return { error: error.message };
    }
    return { error: "Unknown error during EPG import" };
  }
}

async function processEpgData(text: string) {
    // Parse XML
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: ""
    });
    const result = parser.parse(text);
    
    console.log("Parsed XML root keys:", Object.keys(result));
    if (!result.tv || !result.tv.programme) {
        console.error("Invalid XMLTV structure. Expected result.tv.programme");
        return { error: "Invalid XMLTV format or no programs found" };
    }

    const programs = Array.isArray(result.tv.programme) ? result.tv.programme : [result.tv.programme];
    console.log(`Found ${programs.length} programs`);

    // We need to map programs to our channels.
    // XMLTV uses 'channel' attribute in programme tag which corresponds to 'id' in channel tag.
    // Usually this ID is the 'tvg-id' we saved in our Channel model.
    
    // 1. Get all channels with tvgId
    const channels = await prisma.channel.findMany({
        where: { tvgId: { not: null } },
        select: { id: true, tvgId: true }
    });
    
    console.log(`Found ${channels.length} channels with tvgId`);
    const channelMap = new Map<string, string>(); // tvgId -> dbChannelId
    channels.forEach(c => {
        if (c.tvgId) channelMap.set(c.tvgId, c.id);
    });

    let logCounter = 0;
    const now = new Date();
    
    // For performance, let's process in chunks
    const validPrograms = [];
    
    for (const prog of programs) {
        const tvgId = prog.channel;
        const dbId = channelMap.get(tvgId);
        
        if (dbId) {
            // Parse dates. XMLTV format: YYYYMMDDhhmmss Z or +HHMM
            // Example: 20230101120000 +0000
            const parseXmlTvDate = (dateStr: string) => {
                if (!dateStr) return new Date();
                const y = parseInt(dateStr.substring(0, 4));
                const m = parseInt(dateStr.substring(4, 6)) - 1;
                const d = parseInt(dateStr.substring(6, 8));
                const h = parseInt(dateStr.substring(8, 10));
                const min = parseInt(dateStr.substring(10, 12));
                const s = parseInt(dateStr.substring(12, 14));
                return new Date(Date.UTC(y, m, d, h, min, s)); // Simplification
            };

            const start = parseXmlTvDate(prog.start);
            const stop = parseXmlTvDate(prog.stop);
            
            // Only import current or future programs, or recent past
            if (stop > now) {
                validPrograms.push({
                    channelId: dbId,
                    start,
                    stop,
                    title: typeof prog.title === 'object' ? prog.title['#text'] : prog.title, // Handle <title lang="en">...</title>
                    description: prog.desc ? (typeof prog.desc === 'object' ? prog.desc['#text'] : prog.desc) : null
                });
            }
        } else {
            // Log unmatched channels for debugging (only first 10 to avoid spam)
            if (logCounter < 10) {
                console.log(`No matching channel for tvgId: ${tvgId}`);
            }
        }
    }

    console.log(`Programs to import: ${validPrograms.length}`);
    
    // Bulk Insert with createMany for better performance
    const CHUNK_SIZE = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < validPrograms.length; i += CHUNK_SIZE) {
        const chunk = validPrograms.slice(i, i + CHUNK_SIZE);
        const result = await prisma.epgProgram.createMany({
            data: chunk as any,
            skipDuplicates: true,
        });
        insertedCount += result.count;
    }

    return { success: true, count: insertedCount };
}

export async function importEpgFromXtream(host: string, user: string, pass: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  let baseUrl = host;
  if (!baseUrl.startsWith("http")) baseUrl = `http://${baseUrl}`;
  
  const epgUrl = `${baseUrl}/xmltv.php?username=${user}&password=${pass}`;

  try {
    console.log("Fetching EPG from:", epgUrl);
    const response = await fetch(epgUrl, { signal: AbortSignal.timeout(120000) }); // 2 min timeout
    if (!response.ok) return { error: `HTTP ${response.status} from Provider` };

    const text = await response.text();
    return await processEpgData(text);

  } catch (error) {
    console.error("EPG Import Error:", error);
    return { error: (error as Error).message };
  }
}

export async function checkStreamStatus(url: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return { success: response.ok, status: response.status };
  } catch (error) {
    return { success: false, error: "Connection failed" };
  }
}

export async function fetchM3UFromXtream(host: string, user: string, pass: string, type: "m3u_plus" | "m3u" = "m3u_plus", output: "ts" | "hls" = "ts") {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  // Construct URL based on Xtream Codes standard
  // Standard: http://host:port/get.php?username=...&password=...&type=m3u_plus&output=ts
  
  // Ensure host has protocol
  let baseUrl = host;
  if (!baseUrl.startsWith("http")) baseUrl = `http://${baseUrl}`;
  
  const m3uUrl = `${baseUrl}/get.php?username=${user}&password=${pass}&type=${type}&output=${output}`;
  
  try {
    const response = await fetch(m3uUrl, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) return { error: `HTTP ${response.status} from Provider` };

    const arrayBuffer = await response.arrayBuffer();
    // Decode only first 30MB
    const maxBytes = 30 * 1024 * 1024;
    let text = "";
    
    if (arrayBuffer.byteLength > maxBytes) {
      text = new TextDecoder().decode(arrayBuffer.slice(0, maxBytes));
      const lastNewline = text.lastIndexOf('\n');
      if (lastNewline > 0) text = text.slice(0, lastNewline);
    } else {
      text = new TextDecoder().decode(arrayBuffer);
    }

    const entries = parseM3U(text);
    return { success: true, entries: entries.slice(0, 3000), totalFound: entries.length };
  } catch (error) {
    console.error("Xtream Fetch Error:", error);
    return { error: "Failed to connect to Xtream API" };
  }
}

export async function fetchM3U(url: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(60000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });
    
    if (!response.ok) return { error: `HTTP ${response.status} - ${response.statusText}` };

    const arrayBuffer = await response.arrayBuffer();
    // 100MB limit
    const maxBytes = 100 * 1024 * 1024;
    
    let text = "";
    if (arrayBuffer.byteLength > maxBytes) {
      text = new TextDecoder().decode(arrayBuffer.slice(0, maxBytes));
      const lastNewline = text.lastIndexOf('\n');
      if (lastNewline > 0) text = text.slice(0, lastNewline);
    } else {
      text = new TextDecoder().decode(arrayBuffer);
    }

    const entries = parseM3U(text);
    
    if (entries.length === 0) {
        return { error: "No entries found in M3U. Check format." };
    }
    
    return { success: true, entries: entries.slice(0, 3000) };

  } catch (error) {
    console.error("M3U Fetch Error:", error);
    return { error: `Fetch Failed: ${(error as Error).message}` };
  }
}

export async function importContent(items: M3UEntry[], type: "MOVIE" | "SERIES" | "CHANNEL") {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  let importCount = 0;

  for (const item of items) {
    try {
      if (type === "CHANNEL") {
        await prisma.channel.upsert({
          where: { streamUrl: item.url },
          create: {
            name: item.name || "Unknown Channel", // Default if missing
            streamUrl: item.url,
            imageUrl: item.tvgLogo || "",
            groupTitle: item.groupTitle || "Imported",
            tvgId: item.tvgId || "",
            tvgName: item.tvgName || "",
            tvgLogo: item.tvgLogo || "",
            enabled: true,
          },
          update: {
            name: item.name || "Unknown Channel",
            imageUrl: item.tvgLogo || "",
            groupTitle: item.groupTitle || "Imported",
            tvgId: item.tvgId || "",
            tvgName: item.tvgName || "",
            tvgLogo: item.tvgLogo || "",
          },
        });
      } else if (type === "MOVIE") {
        const existing = await prisma.movie.findFirst({ where: { externalUrl: item.url } });
        if (!existing) {
          await prisma.movie.create({
            data: {
              title: item.name || "Unknown Movie",
              category: item.groupTitle || "Imported",
              description: "Imported from M3U",
              imageUrl: item.tvgLogo || "",
              externalUrl: item.url,
            },
          });
        }
      } else if (type === "SERIES") {
        let series = await prisma.series.findFirst({ where: { title: item.groupTitle } });
        if (!series) {
          series = await prisma.series.create({
            data: {
              title: item.groupTitle || "Imported Series",
              category: "Imported",
              description: "Imported from M3U",
              imageUrl: item.tvgLogo || "",
            },
          });
        }

        let season = await prisma.season.findFirst({ where: { seriesId: series.id, number: 1 } });
        if (!season) {
          season = await prisma.season.create({
            data: {
              seriesId: series.id,
              number: 1,
            },
          });
        }

        const episodeCount = await prisma.episode.count({ where: { seasonId: season.id } });
        await prisma.episode.create({
          data: {
            seasonId: season.id,
            number: episodeCount + 1,
            title: item.name || "Episode",
            description: "Imported Episode",
            imageUrl: item.tvgLogo || "",
            externalUrl: item.url,
          },
        });
      }
      importCount++;
    } catch (e) {
      console.error(`Failed to import item ${item.name} (${item.url}):`, e);
      // We don't stop the loop, but we log it.
    }
  }

  revalidatePath("/admin/content");
  return { success: true, count: importCount };
}
