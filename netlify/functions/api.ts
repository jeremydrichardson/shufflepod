import { Hono } from 'hono';
import { handle } from '@netlify/functions';
import { FeedProcessor } from '../../src/feedProcessor.js';

const app = new Hono();
const feedProcessor = new FeedProcessor();

app.get('/health', (c) => {
  return c.json({ status: 'healthy' });
});

app.get('/feed', async (c) => {
  try {
    const url = c.req.query('url');
    const seedParam = c.req.query('seed');

    if (!url || typeof url !== 'string') {
      return c.json({ error: 'Feed URL is required' }, 400);
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return c.json({ error: 'Invalid URL format' }, 400);
    }

    const seed = seedParam ? parseInt(seedParam, 10) : undefined;
    if (seedParam && isNaN(seed as number)) {
      return c.json({ error: 'Seed must be a number' }, 400);
    }

    const baseUrl = new URL(c.req.url).origin;
    const shuffledXml = await feedProcessor.processAndShuffle(url, seed, baseUrl);

    return c.body(shuffledXml, 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (error) {
    console.error('Error generating feed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to generate feed', details: errorMessage }, 500);
  }
});

export default handle(app);
