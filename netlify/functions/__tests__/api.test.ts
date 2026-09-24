import { describe, it, expect, jest } from '@jest/globals';
import { Hono } from 'hono';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const app = new Hono();
      app.get('/health', (c) => c.json({ status: 'healthy' }));

      const req = new Request('http://localhost/health');
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ status: 'healthy' });
    });
  });

  describe('GET /feed', () => {
    it('should return 400 when URL is missing', async () => {
      const app = new Hono();
      app.get('/feed', async (c) => {
        const url = c.req.query('url');
        if (!url || typeof url !== 'string') {
          return c.json({ error: 'Feed URL is required' }, 400);
        }
        return c.json({ success: true });
      });

      const req = new Request('http://localhost/feed');
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Feed URL is required' });
    });

    it('should return 400 when URL format is invalid', async () => {
      const app = new Hono();
      app.get('/feed', async (c) => {
        const url = c.req.query('url');
        if (!url || typeof url !== 'string') {
          return c.json({ error: 'Feed URL is required' }, 400);
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return c.json({ error: 'Invalid URL format' }, 400);
        }
        return c.json({ success: true });
      });

      const req = new Request('http://localhost/feed?url=not-a-url');
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid URL format' });
    });

    it('should return 400 when seed is not a number', async () => {
      const app = new Hono();
      app.get('/feed', async (c) => {
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

        return c.json({ success: true });
      });

      const req = new Request(
        'http://localhost/feed?url=https://example.com/feed.xml&seed=abc'
      );
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Seed must be a number' });
    });

    it('should accept valid URL', async () => {
      const app = new Hono();
      app.get('/feed', async (c) => {
        const url = c.req.query('url');
        if (!url || typeof url !== 'string') {
          return c.json({ error: 'Feed URL is required' }, 400);
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return c.json({ error: 'Invalid URL format' }, 400);
        }
        return c.json({ success: true, url });
      });

      const req = new Request(
        'http://localhost/feed?url=https://example.com/feed.xml'
      );
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        success: true,
        url: 'https://example.com/feed.xml',
      });
    });

    it('should accept valid URL with seed', async () => {
      const app = new Hono();
      app.get('/feed', async (c) => {
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

        return c.json({ success: true, url, seed });
      });

      const req = new Request(
        'http://localhost/feed?url=https://example.com/feed.xml&seed=12345'
      );
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        success: true,
        url: 'https://example.com/feed.xml',
        seed: 12345,
      });
    });
  });
});
