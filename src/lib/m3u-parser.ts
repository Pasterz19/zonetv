export interface M3UEntry {
  tvgId: string;
  tvgName: string;
  tvgLogo: string;
  groupTitle: string;
  name: string;
  url: string;
  raw: string;
}

export function parseM3U(content: string): M3UEntry[] {
  const entries: M3UEntry[] = [];
  let currentEntry: Partial<M3UEntry> = {};
  
  let startIndex = 0;
  let endIndex = 0;
  const len = content.length;
  
  while (startIndex < len) {
    endIndex = content.indexOf('\n', startIndex);
    if (endIndex === -1) endIndex = len;
    
    let line = content.substring(startIndex, endIndex).trim();
    startIndex = endIndex + 1;
    
    if (!line) continue;
    
    if (line.startsWith("#EXTINF:")) {
        const getAttr = (key: string) => {
            const keyStr = key + '="';
            const idx = line.indexOf(keyStr);
            if (idx === -1) return "";
            const endIdx = line.indexOf('"', idx + keyStr.length);
            if (endIdx === -1) return "";
            return line.substring(idx + keyStr.length, endIdx);
        };
        
        const tvgId = getAttr("tvg-id");
        const tvgName = getAttr("tvg-name");
        const tvgLogo = getAttr("tvg-logo");
        const groupTitle = getAttr("group-title");
        
        const lastCommaIndex = line.lastIndexOf(',');
        const name = lastCommaIndex !== -1 ? line.substring(lastCommaIndex + 1).trim() : "Unknown";

        currentEntry = {
            tvgId, tvgName, tvgLogo, groupTitle: groupTitle || "Uncategorized",
            name, raw: line
        };
    } else if (line.startsWith("http") || line.startsWith("rtmp") || line.startsWith("mms")) {
        if (currentEntry.name) {
             entries.push({
                tvgId: currentEntry.tvgId || "",
                tvgName: currentEntry.tvgName || "",
                tvgLogo: currentEntry.tvgLogo || "",
                groupTitle: currentEntry.groupTitle || "Uncategorized",
                name: currentEntry.name || "Unknown",
                url: line,
                raw: currentEntry.raw || "",
            });
            currentEntry = {};
        }
    }
  }
  
  return entries;
}
