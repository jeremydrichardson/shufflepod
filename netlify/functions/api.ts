import { Hono } from 'hono';
import { handle } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { nanoid } from 'nanoid';
import { FeedProcessor } from '../../src/feedProcessor.js';

const app = new Hono();
const feedProcessor = new FeedProcessor();

interface FeedMetadata {
  id: string;
  originalUrl: string;
  title: string;
  feedUrl: string;
  seed?: number;
  createdAt: string;
}

async function getMetadataStore() {
  return getStore('feed-metadata');
}

async function getFeedStore() {
  return getStore('feeds');
}

app.get('/health', (c) => {
  return c.json({ status: 'healthy' });
});

app.get('/feeds', async (c) => {
  try {
    const store = await getMetadataStore();
    const metadataList = await store.get('feed-list', { type: 'json' }) || [];
    return c.json({ feeds: metadataList });
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return c.json({ error: 'Failed to fetch feeds', feeds: [] }, 500);
  }
});

app.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { url, seed } = body;

    if (!url || typeof url !== 'string') {
      return c.json({ error: 'Feed URL is required' }, 400);
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return c.json({ error: 'Invalid URL format' }, 400);
    }

    const parsedSeed = seed ? parseInt(seed, 10) : Date.now();

    const originalFeed = await feedProcessor.fetchFeed(url);
    
    const feedId = nanoid(10);
    const baseUrl = `${new URL(c.req.url).origin}/api/feed/${feedId}`;
    
    const shuffledXml = feedProcessor.shuffleFeed(originalFeed, parsedSeed, baseUrl);

    const feedStore = await getFeedStore();
    await feedStore.set(feedId, shuffledXml);

    const metadata: FeedMetadata = {
      id: feedId,
      originalUrl: url,
      title: originalFeed.title || 'Untitled Podcast',
      feedUrl: `/api/feed/${feedId}`,
      seed: parsedSeed,
      createdAt: new Date().toISOString(),
    };

    const metadataStore = await getMetadataStore();
    const existingList = (await metadataStore.get('feed-list', { type: 'json' })) || [];
    const updatedList = [metadata, ...existingList];
    await metadataStore.set('feed-list', JSON.stringify(updatedList));

    return c.json({
      success: true,
      feed: metadata,
    });
  } catch (error) {
    console.error('Error generating feed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to generate feed', details: errorMessage }, 500);
  }
});

app.get('/feed/:id', async (c) => {
  try {
    const feedId = c.req.param('id');
    
    const store = await getFeedStore();
    const feedXml = await store.get(feedId, { type: 'text' });

    if (!feedXml) {
      return c.text('Feed not found', 404);
    }

    return c.body(feedXml, 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return c.text('Error fetching feed', 500);
  }
});

app.delete('/feed/:id', async (c) => {
  try {
    const feedId = c.req.param('id');
    
    const feedStore = await getFeedStore();
    await feedStore.delete(feedId);

    const metadataStore = await getMetadataStore();
    const existingList: FeedMetadata[] = (await metadataStore.get('feed-list', { type: 'json' })) || [];
    const updatedList = existingList.filter((feed) => feed.id !== feedId);
    await metadataStore.set('feed-list', JSON.stringify(updatedList));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting feed:', error);
    return c.json({ error: 'Failed to delete feed' }, 500);
  }
});

export default handle(app);
