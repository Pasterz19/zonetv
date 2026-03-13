"use server";

/**
 * Bzyk83 Local Files Parser and Importer
 * Reads local E2 files and converts to IPTV format
 */

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { readFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

// Path to local bzyk83 files
const BZYK83_BASE_PATH = "/home/damian/Pobrane/Lista-bzyk83-hb-13E-13.10.2025/Lista bzyk83 hb 13E 13.10.2025";

export interface E2Service {
  sid: string;
  tsid: string;
  onid: string;
  namespace: string;
  name: string;
  provider: string;
  type: 'tv' | 'radio' | 'data';
  url?: string;
  isIPTV: boolean;
}

export interface E2Bouquet {
  name: string;
  filename: string;
  services: E2Service[];
  category: string;
}

export interface IPTVChannel {
  name: string;
  url: string;
  originalUrl: string;
  serviceRef: string;
  groupTitle: string;
  tvgId?: string;
  tvgName?: string;
  logo?: string;
}

/**
 * Parse lamedb file - the main service database
 */
function parseLamedb(content: string): Map<string, E2Service> {
  const services = new Map<string, E2Service>();
  const lines = content.split('\n').map(l => l.trim());
  
  let inServices = false;
  let currentTransponder: string | null = null;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    if (line === 'services') {
      inServices = true;
      i++;
      continue;
    }
    
    if (line === 'end' && inServices) {
      inServices = false;
      i++;
      continue;
    }
    
    // Transponder reference format: namespace:tsid:onid
    if (inServices && /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(line)) {
      currentTransponder = line;
      i++;
      continue;
    }
    
    // Service line format: sid:tsid:onid:stype:... (hex values)
    if (inServices) {
      const match = line.match(/^([0-9a-f]+):([0-9a-f]+):([0-9a-f]+):([0-9a-f]+):/i);
      if (match && i + 2 < lines.length) {
        const sid = match[1].toLowerCase();
        const tsid = match[2].toLowerCase();
        const onid = match[3].toLowerCase();
        const stype = parseInt(match[4], 16);
        
        const name = lines[i + 1]?.replace(/[\x00-\x1F]/g, '').trim() || 'Unknown';
        const providerLine = lines[i + 2] || '';
        const provider = providerLine.startsWith('p:') 
          ? providerLine.substring(2).replace(/[\x00-\x1F]/g, '').trim() 
          : 'Unknown';
        
        // Determine type
        let type: 'tv' | 'radio' | 'data' = 'tv';
        if (stype === 2) type = 'radio';
        else if (stype === 1) type = 'tv';
        else if (stype > 2) type = 'data';
        
        const service: E2Service = {
          sid,
          tsid,
          onid,
          namespace: currentTransponder?.split(':')[0] || '820000',
          name,
          provider,
          type,
          isIPTV: false,
        };
        
        // Build service reference key
        const ref = `${stype.toString(16)}:${sid}:${tsid}:${onid}:${service.namespace}`;
        services.set(ref, service);
        
        i += 2; // Skip name and provider lines
      }
    }
    
    i++;
  }
  
  return services;
}

/**
 * Parse userbouquet file and extract IPTV channels with URLs
 */
function parseUserBouquet(content: string, filename: string, lamedbServices: Map<string, E2Service>): IPTVChannel[] {
  const channels: IPTVChannel[] = [];
  const lines = content.split('\n').map(l => l.trim());
  
  let bouquetName = '';
  let i = 0;
  let debugCount = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Parse bouquet name
    if (line.startsWith('#NAME')) {
      bouquetName = line.substring(5).trim();
      i++;
      continue;
    }
    
    // Skip section markers (section headers with 1:64)
    if (/^#SERVICE\s+1:64:/.test(line)) {
      i++;
      continue;
    }
    
    // Parse IPTV service line
    if (line.startsWith('#SERVICE')) {
      const serviceContent = line.substring(8).trim();
      
      // Split by colon
      const parts = serviceContent.split(':');
      
      // Find URL index - it's the part that starts with http%3a or https%3a
      let urlIndex = -1;
      for (let j = 6; j < parts.length - 1; j++) {
        const partLower = parts[j].toLowerCase();
        if (partLower.startsWith('http%3a') || partLower.startsWith('https%3a')) {
          urlIndex = j;
          break;
        }
      }
      
      // If found URL, parse the service
      if (urlIndex !== -1 && urlIndex + 1 < parts.length) {
        const type = parts[0];
        const stype = parts[1];
        const sid = parts[2];
        const tsid = parts[3];
        const onid = parts[4];
        const namespace = parts[5];
        const encodedUrl = parts[urlIndex];
        const name = parts.slice(urlIndex + 1).join(':');
        
        if (encodedUrl && encodedUrl.length > 0 && name) {
          // Decode URL (replace %3a with :)
          let decodedUrl = encodedUrl.replace(/%3a/gi, ':');
          
          // This is an IPTV service - convert proxy URL to direct URL
          const directUrl = convertProxyToDirect(decodedUrl);
          
          console.log(`[Bzyk83] Channel: ${name.trim()}`);
          console.log(`[Bzyk83]   Original URL: ${encodedUrl}`);
          console.log(`[Bzyk83]   Decoded URL: ${decodedUrl}`);
          console.log(`[Bzyk83]   Direct URL: ${directUrl}`);
          console.log(`[Bzyk83]   Valid: ${directUrl ? isValidStreamUrl(directUrl) : 'NO URL'}`);
          
          if (directUrl && isValidStreamUrl(directUrl)) {
            channels.push({
              name: name.trim() || 'Unknown',
              url: directUrl,
              originalUrl: decodedUrl,
              serviceRef: `${stype}:${sid}:${tsid}:${onid}:${namespace}`,
              groupTitle: bouquetName || filename.replace('userbouquet.', '').replace('.tv', ''),
            });
          } else {
            console.log(`[Bzyk83]   SKIPPED - Invalid URL`);
          }
        }
      } else {
        console.log(`[Bzyk83] No URL found in line with ${parts.length} parts`);
        if (urlIndex === -1) {
          // Debug: show all parts
          console.log(`[Bzyk83] Line parts:`, parts);
        }
      }
    }
    
    i++;
  }
  
  console.log(`[Bzyk83] parseUserBouquet returning ${channels.length} channels`);
  return channels;
}

/**
 * Decode URL-encoded string from E2 format
 */
function decodeE2Url(encoded: string): string {
  try {
    // Replace %3a with : and decode
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

/**
 * Convert Enigma2 proxy URL to direct streaming URL
 */
function convertProxyToDirect(url: string): string | null {
  // Remove proxy prefixes
  const proxyPatterns = [
    /^https?:\/\/127\.0\.0\.1:\d+\//,
    /^https?:\/\/localhost:\d+\//,
    /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+\//,
  ];
  
  let directUrl = url;
  
  for (const pattern of proxyPatterns) {
    if (pattern.test(directUrl)) {
      directUrl = directUrl.replace(pattern, '');
      
      // Ensure protocol is present
      if (!directUrl.startsWith('http://') && !directUrl.startsWith('https://')) {
        directUrl = 'https://' + directUrl;
      }
      break;
    }
  }
  
  // Validate it's a streaming URL
  if (!directUrl.match(/^https?:\/\//i)) {
    return null;
  }
  
  return directUrl;
}

/**
 * Check if URL is a valid streaming URL
 * More permissive - accepts most HTTP/HTTPS URLs as potential streams
 */
function isValidStreamUrl(url: string): boolean {
  console.log(`[Bzyk83] Checking URL: ${url}`);
  
  // Basic HTTP/HTTPS check
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.log(`[Bzyk83]   REJECTED: Not HTTP/HTTPS`);
    return false;
  }
  
  // Accept URLs with streaming extensions
  if (/\.(m3u8|m3u|ts|mp4|mpd|m4v|m4a|f4m|ism|mp3|aac|ogg|webm)(\?.*)?$/i.test(url)) {
    console.log(`[Bzyk83]   ACCEPTED: Has streaming extension`);
    return true;
  }
  
  // Accept URLs from known streaming domains
  const streamingDomains = [
    'vod.', 'stream.', 'live.', 'media.', 'cdn.', 'hls.', 'dash.',
    'tv.', 'video.', 'watch.', 'play.', 'cast.', 'relay.',
    'tvp.pl', 'cda.pl', 'ipla.tv', 'player.pl', 'redbull.tv',
    'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
    'twitch.tv', 'facebook.com', 'instagram.com',
    'cloudflare', 'akamaized', 'fastly'
  ];
  
  const urlLower = url.toLowerCase();
  for (const domain of streamingDomains) {
    if (urlLower.includes(domain)) {
      console.log(`[Bzyk83]   ACCEPTED: Contains domain ${domain}`);
      return true;
    }
  }
  
  // Accept URLs with streaming-related paths
  if (/(?:stream|live|play|video|watch|manifest|playlist|chunklist|media|segment|broadcast)/i.test(url)) {
    console.log(`[Bzyk83]   ACCEPTED: Has streaming path`);
    return true;
  }
  
  // Accept any HTTPS URL as potential stream (fallback)
  if (url.startsWith('https://')) {
    console.log(`[Bzyk83]   ACCEPTED: HTTPS fallback`);
    return true;
  }
  
  console.log(`[Bzyk83]   REJECTED: No valid streaming pattern found`);
  return false;
}

/**
 * Get list of available IPTV bouquets from local files
 */
export async function getLocalBzyk83Bouquets() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }
  
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    console.log("[Bzyk83] Reading from path:", BZYK83_BASE_PATH);
    
    // Check if directory exists
    try {
      await fs.access(BZYK83_BASE_PATH);
    } catch (e) {
      console.error("[Bzyk83] Directory not accessible:", e);
      return { error: "Directory not found or not accessible: " + BZYK83_BASE_PATH };
    }
    
    // Read lamedb
    const lamedbPath = path.join(BZYK83_BASE_PATH, 'lamedb');
    console.log("[Bzyk83] Reading lamedb from:", lamedbPath);
    
    const lamedbContent = await fs.readFile(lamedbPath, 'utf-8');
    console.log("[Bzyk83] Lamedb size:", lamedbContent.length);
    
    const services = parseLamedb(lamedbContent);
    console.log("[Bzyk83] Parsed services:", services.size);
    
    // Find all userbouquet files
    const files = await fs.readdir(BZYK83_BASE_PATH);
    console.log("[Bzyk83] Files in directory:", files.length);
    
    const bouquetFiles = files.filter(f => f.startsWith('userbouquet') && f.endsWith('.tv'));
    console.log("[Bzyk83] Bouquet files found:", bouquetFiles.length);
    
    const bouquets: Array<{
      filename: string;
      name: string;
      channelCount: number;
      iptvChannels: number;
      preview: string[];
    }> = [];
    
    for (const filename of bouquetFiles) {
      console.log("[Bzyk83] Processing:", filename);
      
      const content = await fs.readFile(
        path.join(BZYK83_BASE_PATH, filename),
        'utf-8'
      );
      
      const channels = parseUserBouquet(content, filename, services);
      console.log("[Bzyk83] Channels found in", filename, ":", channels.length);
      
      // Extract name from first line
      const nameMatch = content.match(/#NAME\s*(.+)/);
      const name = nameMatch?.[1]?.trim() || filename;
      
      if (channels.length > 0) {
        bouquets.push({
          filename,
          name,
          channelCount: channels.length,
          iptvChannels: channels.length,
          preview: channels.slice(0, 3).map(c => c.name),
        });
      }
    }
    
    console.log("[Bzyk83] Total bouquets with channels:", bouquets.length);
    
    return {
      success: true,
      bouquets: bouquets.sort((a, b) => b.channelCount - a.channelCount),
      totalChannels: bouquets.reduce((sum, b) => sum + b.channelCount, 0),
    };
    
  } catch (error) {
    console.error("[Bzyk83] Error reading files:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Import specific bouquet from local files
 */
export async function importLocalBouquet(filename: string, options?: {
  autoEnable?: boolean;
  categoryPrefix?: string;
  forceImport?: boolean; // Skip duplicate check
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }
  
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    // Read lamedb for service reference
    const lamedbContent = await fs.readFile(
      path.join(BZYK83_BASE_PATH, 'lamedb'),
      'utf-8'
    );
    const services = parseLamedb(lamedbContent);
    
    // Read bouquet file
    const content = await fs.readFile(
      path.join(BZYK83_BASE_PATH, filename),
      'utf-8'
    );
    
    const channels = parseUserBouquet(content, filename, services);
    
    console.log(`[Bzyk83] Parsed ${channels.length} channels from ${filename}`);
    if (channels.length > 0) {
      console.log(`[Bzyk83] First 3 channels:`);
      channels.slice(0, 3).forEach((ch, i) => {
        console.log(`  ${i+1}. ${ch.name} -> ${ch.url}`);
      });
    }
    
    if (channels.length === 0) {
      return { error: "No IPTV channels found in this bouquet" };
    }
    
    // Import to database
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    console.log(`[Bzyk83] Starting import of ${channels.length} channels from ${filename}`);
    
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      console.log(`[Bzyk83] Processing channel ${i+1}/${channels.length}: ${channel.name}`);
      
      try {
        // Check if exists (unless forceImport)
        if (!options?.forceImport) {
          const existing = await prisma.channel.findFirst({
            where: {
              OR: [
                { streamUrl: channel.url },
                { tvgId: channel.serviceRef },
              ],
            },
          });
          
          if (existing) {
            skipped++;
            if (skipped <= 5) {
              console.log(`[Bzyk83] Skipping duplicate: ${channel.name}`);
              console.log(`[Bzyk83]   Existing URL: ${existing.streamUrl}`);
              console.log(`[Bzyk83]   New URL: ${channel.url}`);
              console.log(`[Bzyk83]   Existing tvgId: ${existing.tvgId}`);
              console.log(`[Bzyk83]   New tvgId: ${channel.serviceRef}`);
            }
            continue;
          }
        }
        
        // Determine group title
        const groupTitle = options?.categoryPrefix 
          ? `${options.categoryPrefix} - ${channel.groupTitle}`
          : channel.groupTitle;
        
        // Create channel with unique name if force import
        let channelName = channel.name;
        if (options?.forceImport && skipped > 0) {
          channelName = `${channel.name} (Bzyk83)`;
        }
        
        // Create channel
        await prisma.channel.create({
          data: {
            name: channelName,
            streamUrl: channel.url,
            groupTitle: groupTitle,
            tvgId: channel.serviceRef,
            tvgName: channel.name,
            enabled: options?.autoEnable ?? false,
            imageUrl: "",
          },
        });
        
        imported++;
        if (imported <= 5) {
          console.log(`[Bzyk83] Imported: ${channel.name}`);
          console.log(`[Bzyk83]   URL: ${channel.url}`);
          console.log(`[Bzyk83]   tvgId: ${channel.serviceRef}`);
          console.log(`[Bzyk83]   enabled: ${options?.autoEnable ?? false}`);
        }
      } catch (err) {
        errors.push(`Failed to import ${channel.name}: ${(err as Error).message}`);
      }
    }
    
    console.log(`[Bzyk83] Import complete: ${imported} imported, ${skipped} skipped from ${filename}`);
    
    revalidatePath("/admin/channels");
    revalidatePath("/dashboard");
    
    return {
      success: true,
      total: channels.length,
      imported,
      skipped,
    };
    
  } catch (error) {
    console.error("[Bzyk83] Import error:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Import all IPTV bouquets from local files
 */
export async function importAllLocalBouquets(options?: {
  autoEnable?: boolean;
  forceImport?: boolean; // Skip duplicate check
  excludePatterns?: string[];
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }
  
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    // Get all bouquets
    const result = await getLocalBzyk83Bouquets();
    if ('error' in result || !result.bouquets) {
      return result;
    }
    
    let totalImported = 0;
    let totalSkipped = 0;
    const importedBouquets: string[] = [];
    
    for (const bouquet of result.bouquets) {
      // Skip excluded patterns
      if (options?.excludePatterns?.some(p => 
        bouquet.filename.includes(p) || bouquet.name.includes(p)
      )) {
        continue;
      }
      
      const importResult = await importLocalBouquet(bouquet.filename, {
        autoEnable: options?.autoEnable,
        forceImport: options?.forceImport,
      });
      
      if ('success' in importResult && importResult.imported !== undefined) {
        totalImported += importResult.imported;
        totalSkipped += importResult.skipped;
        if (importResult.imported > 0) {
          importedBouquets.push(bouquet.name);
        }
      }
    }
    
    return {
      success: true,
      totalImported,
      totalSkipped,
      bouquetsCount: importedBouquets.length,
    };
    
  } catch (error) {
    console.error("[Bzyk83] Bulk import error:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Generate M3U playlist from local bzyk83 files
 */
export async function generateLocalM3U(filenames?: string[]) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }
  
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    // Read lamedb
    const lamedbContent = await fs.readFile(
      path.join(BZYK83_BASE_PATH, 'lamedb'),
      'utf-8'
    );
    const services = parseLamedb(lamedbContent);
    
    const filesToProcess = filenames || (await fs.readdir(BZYK83_BASE_PATH))
      .filter(f => f.startsWith('userbouquet') && f.endsWith('.tv'));
    
    const lines: string[] = [
      '#EXTM3U',
      '# Generated from Bzyk83 E2 list',
      '',
    ];
    
    for (const filename of filesToProcess) {
      const content = await fs.readFile(
        path.join(BZYK83_BASE_PATH, filename),
        'utf-8'
      );
      
      const channels = parseUserBouquet(content, filename, services);
      
      if (channels.length > 0) {
        // Extract bouquet name
        const nameMatch = content.match(/#NAME\s*(.+)/);
        const bouquetName = nameMatch?.[1]?.trim() || filename;
        
        lines.push(`#EXTGRP:${bouquetName}`);
        
        for (const channel of channels) {
          const tvgId = channel.serviceRef || '';
          lines.push(`#EXTINF:-1 tvg-id="${tvgId}" group-title="${channel.groupTitle}",${channel.name}`);
          lines.push(channel.url);
          lines.push('');
        }
      }
    }
    
    return {
      success: true,
      m3uContent: lines.join('\n'),
      totalChannels: lines.filter(l => l.startsWith('#EXTINF')).length,
    };
    
  } catch (error) {
    console.error("[Bzyk83] M3U generation error:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Import channels from generated M3U content
 */
export async function importM3UContent(m3uContent: string, options?: {
  autoEnable?: boolean;
  categoryPrefix?: string;
  forceImport?: boolean; // Skip duplicate check
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }
  
  try {
    // Parse M3U content
    const lines = m3uContent.split('\n');
    const channels: Array<{
      name: string;
      url: string;
      tvgId: string;
      groupTitle: string;
    }> = [];
    
    let currentEntry: Partial<typeof channels[0]> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('#EXTINF:')) {
        const nameMatch = trimmed.match(/,(.+)$/);
        const groupMatch = trimmed.match(/group-title="([^"]+)"/);
        const idMatch = trimmed.match(/tvg-id="([^"]+)"/);
        
        currentEntry = {
          name: nameMatch ? nameMatch[1].trim() : 'Unknown',
          groupTitle: groupMatch ? groupMatch[1] : 'Imported',
          tvgId: idMatch ? idMatch[1] : '',
        };
      } else if (trimmed && !trimmed.startsWith('#') && trimmed.startsWith('http') && currentEntry.name) {
        currentEntry.url = trimmed;
        channels.push(currentEntry as typeof channels[0]);
        currentEntry = {};
      }
    }
    
    if (channels.length === 0) {
      return { error: "No channels found in M3U content" };
    }
    
    // Import to database
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    for (const channel of channels) {
      try {
        // Check if exists (unless forceImport)
        if (!options?.forceImport) {
          const existing = await prisma.channel.findFirst({
            where: {
              OR: [
                { streamUrl: channel.url },
                { tvgId: channel.tvgId },
              ],
            },
          });
          
          if (existing) {
            skipped++;
            continue;
          }
        }
        
        // Create channel with unique name if force import
        let channelName = channel.name;
        if (options?.forceImport && skipped > 0) {
          channelName = `${channel.name} (Bzyk83)`;
        }
        
        await prisma.channel.create({
          data: {
            name: channelName,
            streamUrl: channel.url,
            groupTitle: options?.categoryPrefix 
              ? `${options.categoryPrefix} - ${channel.groupTitle}`
              : channel.groupTitle,
            tvgId: channel.tvgId,
            tvgName: channel.name,
            enabled: options?.autoEnable ?? true,
            imageUrl: "",
          },
        });
        
        imported++;
      } catch (err) {
        errors.push(`Failed to import ${channel.name}: ${(err as Error).message}`);
      }
    }
    
    revalidatePath("/admin/channels");
    revalidatePath("/dashboard");
    revalidatePath("/tv");
    
    return {
      success: true,
      total: channels.length,
      imported,
      skipped,
    };
    
  } catch (error) {
    console.error("[Bzyk83] M3U import error:", error);
    return { error: (error as Error).message };
  }
}
