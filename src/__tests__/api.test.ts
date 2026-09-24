import { describe, it, expect } from '@jest/globals';
import { app } from '../../netlify/functions/api.js';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const req = new Request('http://localhost/health');
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ status: 'healthy' });
    });

    it('should also respond at /api/health', async () => {
      const req = new Request('http://localhost/api/health');
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ status: 'healthy' });
    });
  });

  describe('GET /feed', () => {
    it('should return 400 when URL is missing', async () => {
      const req = new Request('http://localhost/feed');
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Feed URL is required' });
    });

    it('should return 400 when URL format is invalid', async () => {
      const req = new Request('http://localhost/feed?url=not-a-url');
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid URL format' });
    });

    it('should return 400 when seed is not a number', async () => {
      const req = new Request(
        'http://localhost/feed?url=https://example.com/feed.xml&seed=abc'
      );
      const res = await app.fetch(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Seed must be a number' });
    });
  });
});
