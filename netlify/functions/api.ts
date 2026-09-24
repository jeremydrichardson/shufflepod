import type { Config } from '@netlify/functions';
import { Hono } from 'hono';
import { handle } from 'hono/netlify';
import { FeedProcessor } from '../../src/feedProcessor.js';

const feedProcessor = new FeedProcessor();

function createRoutes() {
  const routes = new Hono();

  routes.get('/health', (c) => {
    return c.json({ status: 'healthy' });
  });

  routes.get('/feed', async (c) => {
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

      const { feedUrl, wasConverted, source } = await feedProcessor.extractFeedUrl(url);

      const validation = await feedProcessor.validatePodcastFeed(feedUrl);
      if (!validation.valid) {
        return c.json({ error: 'Invalid podcast feed', details: validation.error }, 400);
      }

      const baseUrl = new URL(c.req.url).origin;
      const shuffledXml = await feedProcessor.processAndShuffle(feedUrl, seed, baseUrl);

      return c.body(shuffledXml, 200, {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Feed-Converted': wasConverted ? 'true' : 'false',
        'X-Feed-Source': source || 'direct',
      });
    } catch (error) {
      console.error('Error generating feed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return c.json({ error: 'Failed to generate feed', details: errorMessage }, 500);
    }
  });

  return routes;
}

const app = new Hono();
const routes = createRoutes();
app.route('/', routes);
app.route('/api', routes);

export { app };
export default handle(app);

export const config: Config = {
  path: '/api/*',
};
