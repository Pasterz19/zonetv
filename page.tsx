import { auth } from '@/lib/auth';
import { query, runQuery } from '@/server/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ContentManager } from './content-manager';

export const dynamic = 'force-dynamic';

// Helper to convert libsql results to plain objects
function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Server Actions
async function createMovie(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const title = String(formData.get('title') ?? '');
  const category = String(formData.get('category') ?? 'Inne');
  const description = String(formData.get('description') ?? '');
  const imageUrl = String(formData.get('imageUrl') ?? '');
  const externalUrl = String(formData.get('externalUrl') ?? '');
  const duration = formData.get('duration') ? parseInt(String(formData.get('duration'))) : null;
  const releaseYear = formData.get('releaseYear') ? parseInt(String(formData.get('releaseYear'))) : null;

  if (!title || !externalUrl) return;

  await runQuery(
    `INSERT INTO Movie (id, title, category, description, imageUrl, externalUrl, duration, releaseYear, isPublished, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
    [crypto.randomUUID(), title, category, description, imageUrl, externalUrl, duration, releaseYear]
  );

  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/movies');
}

async function deleteMovie(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const movieId = formData.get('movieId') as string;
  if (!movieId) return;

  await runQuery('DELETE FROM Movie WHERE id = ?', [movieId]);
  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/movies');
}

async function createSeries(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const title = String(formData.get('title') ?? '');
  const category = String(formData.get('category') ?? 'Inne');
  const description = String(formData.get('description') ?? '');
  const imageUrl = String(formData.get('imageUrl') ?? '');
  const releaseYear = formData.get('releaseYear') ? parseInt(String(formData.get('releaseYear'))) : null;

  if (!title) return;

  await runQuery(
    `INSERT INTO Series (id, title, category, description, imageUrl, releaseYear, isPublished, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
    [crypto.randomUUID(), title, category, description, imageUrl, releaseYear]
  );

  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/series');
}

async function deleteSeries(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const seriesId = formData.get('seriesId') as string;
  if (!seriesId) return;

  // Delete episodes, seasons, then series
  await runQuery('DELETE FROM Episode WHERE seasonId IN (SELECT id FROM Season WHERE seriesId = ?)', [seriesId]);
  await runQuery('DELETE FROM Season WHERE seriesId = ?', [seriesId]);
  await runQuery('DELETE FROM Series WHERE id = ?', [seriesId]);

  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/series');
}

async function createChannel(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const name = String(formData.get('name') ?? '');
  const imageUrl = String(formData.get('imageUrl') ?? '');
  const streamUrl = String(formData.get('streamUrl') ?? '');
  const groupTitle = String(formData.get('groupTitle') ?? '');

  if (!name || !streamUrl) return;

  await runQuery(
    `INSERT INTO Channel (id, name, imageUrl, streamUrl, groupTitle, enabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
    [crypto.randomUUID(), name, imageUrl, streamUrl, groupTitle || null]
  );

  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/tv');
  revalidatePath('/dashboard');
}

async function deleteChannel(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const channelId = formData.get('channelId') as string;
  if (!channelId) return;

  await runQuery('DELETE FROM ChannelBufferPreference WHERE channelId = ?', [channelId]);
  await runQuery('DELETE FROM EpgProgram WHERE channelId = ?', [channelId]);
  await runQuery('DELETE FROM Channel WHERE id = ?', [channelId]);

  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/tv');
  revalidatePath('/dashboard');
}

async function deleteManyMovies(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const movieIdsJson = formData.get('movieIds') as string;
  if (!movieIdsJson) return;

  const movieIds: string[] = JSON.parse(movieIdsJson);
  if (movieIds.length === 0) return;

  // Delete all selected movies
  for (const movieId of movieIds) {
    await runQuery('DELETE FROM WatchProgress WHERE contentId = ? AND contentType = ?', [movieId, 'MOVIE']);
    await runQuery('DELETE FROM Favorite WHERE contentId = ? AND contentType = ?', [movieId, 'MOVIE']);
    await runQuery('DELETE FROM Movie WHERE id = ?', [movieId]);
  }

  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/movies');
}

async function deleteManySeries(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const seriesIdsJson = formData.get('seriesIds') as string;
  if (!seriesIdsJson) return;

  const seriesIds: string[] = JSON.parse(seriesIdsJson);
  if (seriesIds.length === 0) return;

  // Delete all selected series
  for (const seriesId of seriesIds) {
    await runQuery('DELETE FROM WatchProgress WHERE contentId = ? AND contentType = ?', [seriesId, 'SERIES']);
    await runQuery('DELETE FROM Favorite WHERE contentId = ? AND contentType = ?', [seriesId, 'SERIES']);
    await runQuery('DELETE FROM Episode WHERE seasonId IN (SELECT id FROM Season WHERE seriesId = ?)', [seriesId]);
    await runQuery('DELETE FROM Season WHERE seriesId = ?', [seriesId]);
    await runQuery('DELETE FROM Series WHERE id = ?', [seriesId]);
  }

  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/series');
}

async function deleteManyChannels(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const channelIdsJson = formData.get('channelIds') as string;
  if (!channelIdsJson) return;

  const channelIds: string[] = JSON.parse(channelIdsJson);
  if (channelIds.length === 0) return;

  // Delete all selected channels
  for (const channelId of channelIds) {
    await runQuery('DELETE FROM ChannelBufferPreference WHERE channelId = ?', [channelId]);
    await runQuery('DELETE FROM EpgProgram WHERE channelId = ?', [channelId]);
    await runQuery('DELETE FROM Channel WHERE id = ?', [channelId]);
  }

  revalidatePath('/admin/content');
  revalidatePath('/admin');
  revalidatePath('/tv');
  revalidatePath('/dashboard');
}

export { createMovie, deleteMovie, deleteManyMovies, createSeries, deleteSeries, deleteManySeries, createChannel, deleteChannel, deleteManyChannels };

export default async function ContentManagementPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const [moviesRaw, seriesRaw, channelsRaw] = await Promise.all([
    query<{
      id: string;
      title: string;
      category: string;
      description: string;
      imageUrl: string;
      externalUrl: string;
      createdAt: string;
    }>('SELECT id, title, category, description, imageUrl, externalUrl, createdAt FROM Movie ORDER BY createdAt DESC'),
    query<{
      id: string;
      title: string;
      category: string;
      description: string;
      imageUrl: string;
      createdAt: string;
      seasonCount: number;
      episodeCount: number;
    }>(
      `SELECT s.id, s.title, s.category, s.description, s.imageUrl, s.createdAt,
        (SELECT COUNT(*) FROM Season WHERE seriesId = s.id) as seasonCount,
        (SELECT COUNT(*) FROM Episode e JOIN Season se ON e.seasonId = se.id WHERE se.seriesId = s.id) as episodeCount
       FROM Series s ORDER BY s.createdAt DESC`
    ),
    query<{
      id: string;
      name: string;
      imageUrl: string;
      streamUrl: string;
      groupTitle: string | null;
      enabled: number;
      createdAt: string;
    }>('SELECT id, name, imageUrl, streamUrl, groupTitle, enabled, createdAt FROM Channel ORDER BY createdAt DESC'),
  ]);

  // Convert to plain objects for client components
  const movies = moviesRaw.map(m => toPlainObject(m));
  const series = seriesRaw.map(s => toPlainObject(s));
  const channels = channelsRaw.map(c => toPlainObject(c));

  return (
    <ContentManager
      movies={movies}
      series={series}
      channels={channels}
      createMovie={createMovie}
      deleteMovie={deleteMovie}
      deleteManyMovies={deleteManyMovies}
      createSeries={createSeries}
      deleteSeries={deleteSeries}
      deleteManySeries={deleteManySeries}
      createChannel={createChannel}
      deleteChannel={deleteChannel}
      deleteManyChannels={deleteManyChannels}
    />
  );
}
