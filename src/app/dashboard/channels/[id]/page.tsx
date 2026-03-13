import { auth } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma/client';
import { redirect } from 'next/navigation';
import { ChannelPlayerOverlay } from '@/components/channel-player-overlay';
import { getYouTubeId } from '@/lib/video-utils';
import { hasActiveSubscription } from '@/lib/subscription';

const db = new PrismaClient();

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ChannelDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    redirect('/dashboard');
  }
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const isActive = await hasActiveSubscription(session.user.id as string);
  if (!isActive) {
    redirect('/dashboard');
  }

  const channel = await db.channel.findUnique({ where: { id } });
  if (!channel) {
    redirect('/dashboard');
  }

  const ytId = getYouTubeId(channel.streamUrl);

  const bufferPref = await db.channelBufferPreference.findUnique({
    where: {
      userId_channelId: {
        userId: session.user.id as string,
        channelId: channel.id,
      },
    },
    select: { bufferSeconds: true },
  });

  const bufferSeconds = bufferPref?.bufferSeconds ?? 15;

  return (
    <ChannelPlayerOverlay
      channelId={channel.id}
      name={channel.name}
      streamUrl={channel.streamUrl}
      ytId={ytId}
      initialBufferSeconds={bufferSeconds}
    />
  );
}
