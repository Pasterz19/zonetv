import { Suspense } from "react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { query } from "@/server/db"
import { Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TVInterface } from "@/components/tv/tv-interface"

export const dynamic = "force-dynamic"

// Channel type for TV interface
interface Channel {
  id: string
  name: string
  imageUrl: string
  streamUrl: string | null
  groupTitle: string | null
  epgPrograms: {
    id: string
    start: Date
    stop: Date
    title: string
    description: string | null
  }[]
  isFavorite?: boolean
}

async function TvContent(props: { searchParams?: Promise<{ query?: string; group?: string }> }) {
  const session = await auth()
  const searchParams = await props.searchParams

  if (!session?.user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Radio className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase">
              Dostęp tylko dla <span className="text-primary">zalogowanych</span>
            </h2>
            <p className="text-muted-foreground font-medium">
              Zaloguj się aby oglądać ponad 100 kanałów TV na żywo w najwyższej jakości.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full px-12 h-14 text-lg font-bold uppercase tracking-tight">
            <Link href="/auth/login">Zaloguj się teraz</Link>
          </Button>
        </div>
      </div>
    )
  }

  const queryFilter = searchParams?.query || ""
  const groupFilter = searchParams?.group || ""
  const now = new Date().toISOString()

  // Query channels with current EPG program
  const channelsRows = await query<any[]>(`
    SELECT
      c.id, c.name, c."imageUrl", c."streamUrl", c."groupTitle",
      e.id as "epgId", e.start as "epgStart", e.stop as "epgStop", e.title as "epgTitle", e.description as "epgDescription"
    FROM Channel c
    LEFT JOIN EpgProgram e ON e."channelId" = c.id
      AND datetime(e.start) <= datetime(?) AND datetime(e.stop) >= datetime(?)
    WHERE c.enabled = 1
    ORDER BY c.name ASC
  `, [now, now])

  // Transform rows into channels with EPG
  const channels: Channel[] = channelsRows.map((row: any) => ({
    id: row.id,
    name: row.name,
    imageUrl: row.imageUrl || "/tv-placeholder.png",
    streamUrl: row.streamUrl,
    groupTitle: row.groupTitle,
    epgPrograms: row.epgId ? [{
      id: row.epgId,
      start: new Date(row.epgStart),
      stop: new Date(row.epgStop),
      title: row.epgTitle,
      description: row.epgDescription,
    }] : [],
    isFavorite: false,
  }))

  // Check subscription
  const subRows = await query<any[]>(
    `SELECT id FROM Subscription
     WHERE "userId" = ? AND active = 1
     AND ("endsAt" IS NULL OR datetime("endsAt") > datetime(?))`,
    [session.user.id, now]
  )
  const hasSubscription = subRows.length > 0

  // Get favorites
  const favRows = await query<{ contentId: string }[]>(
    `SELECT "contentId" FROM Favorite
     WHERE "userId" = ? AND "contentType" = 'CHANNEL'`,
    [session.user.id]
  )
  const favoriteIds = new Set(favRows.map(f => f.contentId))

  // Mark favorites
  channels.forEach(ch => {
    ch.isFavorite = favoriteIds.has(ch.id)
  })

  // Apply filters if needed
  let filteredChannels = channels
  if (queryFilter) {
    const q = queryFilter.toLowerCase()
    filteredChannels = filteredChannels.filter(ch =>
      ch.name.toLowerCase().includes(q) ||
      ch.epgPrograms.some(p => p.title.toLowerCase().includes(q))
    )
  }
  if (groupFilter) {
    filteredChannels = filteredChannels.filter(ch =>
      ch.groupTitle?.toLowerCase() === groupFilter.toLowerCase()
    )
  }

  return (
    <TVInterface
      channels={filteredChannels}
      hasSubscription={hasSubscription}
    />
  )
}

function TvLoading() {
  return (
    <div className="mx-auto max-w-[1800px] px-4 py-12 space-y-12 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-full w-full rounded-3xl" />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TvPage(props: { searchParams?: Promise<{ query?: string; group?: string }> }) {
  return (
    <Suspense fallback={<TvLoading />}>
      <TvContent searchParams={props.searchParams} />
    </Suspense>
  )
}
