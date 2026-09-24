import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { FeedProcessor } from '../feedProcessor.js';

describe('FeedProcessor', () => {
  let processor: FeedProcessor;

  beforeEach(() => {
    processor = new FeedProcessor();
  });

  describe('shuffleFeed', () => {
    it('should shuffle episodes with a seed', () => {
      const mockFeed = {
        title: 'Test Podcast',
        description: 'Test Description',
        link: 'https://example.com',
        items: [
          { title: 'Episode 1', guid: 'ep1', link: 'https://example.com/ep1' },
          { title: 'Episode 2', guid: 'ep2', link: 'https://example.com/ep2' },
          { title: 'Episode 3', guid: 'ep3', link: 'https://example.com/ep3' },
          { title: 'Episode 4', guid: 'ep4', link: 'https://example.com/ep4' },
          { title: 'Episode 5', guid: 'ep5', link: 'https://example.com/ep5' },
        ],
      };

      const result = processor.shuffleFeed(mockFeed, 12345);

      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain('🔀 Test Podcast');
      expect(result).toContain('Episode 1');
      expect(result).toContain('Episode 2');
      expect(result).toContain('Episode 3');
      expect(result).toContain('Episode 4');
      expect(result).toContain('Episode 5');
    });

    it('should produce consistent shuffle with same seed', () => {
      const mockFeed = {
        title: 'Test Podcast',
        description: 'Test Description',
        link: 'https://example.com',
        items: [
          { title: 'Episode 1', guid: 'ep1', link: 'https://example.com/ep1' },
          { title: 'Episode 2', guid: 'ep2', link: 'https://example.com/ep2' },
          { title: 'Episode 3', guid: 'ep3', link: 'https://example.com/ep3' },
        ],
      };

      const result1 = processor.shuffleFeed(mockFeed, 42);
      const result2 = processor.shuffleFeed(mockFeed, 42);

      expect(result1).toBe(result2);
    });

    it('should produce different shuffle with different seed', () => {
      const mockFeed = {
        title: 'Test Podcast',
        description: 'Test Description',
        link: 'https://example.com',
        items: [
          { title: 'Episode 1', guid: 'ep1', link: 'https://example.com/ep1' },
          { title: 'Episode 2', guid: 'ep2', link: 'https://example.com/ep2' },
          { title: 'Episode 3', guid: 'ep3', link: 'https://example.com/ep3' },
          { title: 'Episode 4', guid: 'ep4', link: 'https://example.com/ep4' },
          { title: 'Episode 5', guid: 'ep5', link: 'https://example.com/ep5' },
        ],
      };

      const result1 = processor.shuffleFeed(mockFeed, 42);
      const result2 = processor.shuffleFeed(mockFeed, 99);

      expect(result1).not.toBe(result2);
    });

    it('should handle feed with enclosures', () => {
      const mockFeed = {
        title: 'Test Podcast',
        description: 'Test Description',
        link: 'https://example.com',
        items: [
          {
            title: 'Episode 1',
            guid: 'ep1',
            link: 'https://example.com/ep1',
            enclosure: {
              url: 'https://example.com/audio1.mp3',
              type: 'audio/mpeg',
              length: '12345',
            },
          },
        ],
      };

      const result = processor.shuffleFeed(mockFeed, 12345);

      expect(result).toContain('https://example.com/audio1.mp3');
      expect(result).toContain('audio/mpeg');
    });

    it('should add shuffle emoji to title', () => {
      const mockFeed = {
        title: 'My Podcast',
        description: 'Test Description',
        link: 'https://example.com',
        items: [],
      };

      const result = processor.shuffleFeed(mockFeed, 12345);

      expect(result).toContain('🔀 My Podcast');
    });

    it('should handle missing optional fields', () => {
      const mockFeed = {
        title: 'Test Podcast',
        items: [
          {
            guid: 'ep1',
          },
        ],
      };

      const result = processor.shuffleFeed(mockFeed, 12345);

      expect(result).toContain('Test Podcast');
      expect(result).toContain('Untitled Episode');
    });

    it('should generate valid RSS XML structure', () => {
      const mockFeed = {
        title: 'Test Podcast',
        description: 'Test Description',
        link: 'https://example.com',
        items: [
          { title: 'Episode 1', guid: 'ep1', link: 'https://example.com/ep1' },
        ],
      };

      const result = processor.shuffleFeed(mockFeed, 12345);

      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain('<rss');
      expect(result).toContain('<channel>');
      expect(result).toContain('<title>');
      expect(result).toContain('<description>');
      expect(result).toContain('<item>');
      expect(result).toContain('</channel>');
      expect(result).toContain('</rss>');
    });

    it('should include generator tag', () => {
      const mockFeed = {
        title: 'Test Podcast',
        items: [],
      };

      const result = processor.shuffleFeed(mockFeed, 12345);

      expect(result).toContain('ShufflePod');
    });
  });

  describe('processAndShuffle', () => {
    it('should be defined', () => {
      expect(processor.processAndShuffle).toBeDefined();
      expect(typeof processor.processAndShuffle).toBe('function');
    });
  });

  describe('extractFeedUrl', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('returns a direct RSS URL unchanged', async () => {
      const result = await processor.extractFeedUrl('https://example.com/feed.xml');

      expect(result).toEqual({
        feedUrl: 'https://example.com/feed.xml',
        wasConverted: false,
      });
    });

    it('converts an Apple Podcasts URL via the iTunes lookup API', async () => {
      global.fetch = (async () =>
        ({
          ok: true,
          json: async () => ({
            resultCount: 1,
            results: [{ feedUrl: 'https://feeds.example.com/rss' }],
          }),
        }) as Response) as typeof fetch;

      const result = await processor.extractFeedUrl(
        'https://podcasts.apple.com/us/podcast/the-bible-project/id1050832450'
      );

      expect(result).toEqual({
        feedUrl: 'https://feeds.example.com/rss',
        wasConverted: true,
        source: 'Apple Podcasts',
      });
    });

    it('converts an itunes.apple.com URL', async () => {
      global.fetch = (async () =>
        ({
          ok: true,
          json: async () => ({
            resultCount: 1,
            results: [{ feedUrl: 'https://feeds.simplecast.com/3NVmUWZO' }],
          }),
        }) as Response) as typeof fetch;

      const result = await processor.extractFeedUrl(
        'https://itunes.apple.com/us/podcast/the-bible-project/id1050832450'
      );

      expect(result.wasConverted).toBe(true);
      expect(result.feedUrl).toBe('https://feeds.simplecast.com/3NVmUWZO');
    });
  });
});
