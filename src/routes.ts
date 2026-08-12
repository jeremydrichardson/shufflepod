import { Router, Request, Response } from 'express';
import { FeedProcessor } from './feedProcessor';
import { config } from './config';

const router = Router();
const feedProcessor = new FeedProcessor();

router.get('/', (req: Request, res: Response) => {
  res.json({
    app: config.appName,
    version: '0.1.0',
    description: config.appDescription,
    endpoints: {
      shuffle: '/shuffle?url=<podcast_feed_url>&seed=<optional_seed>',
      health: '/health',
    },
  });
});

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

router.get('/shuffle', async (req: Request, res: Response) => {
  const { url, seed } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Feed URL is required' });
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const seedNumber = seed ? parseInt(seed as string, 10) : undefined;
  if (seed && isNaN(seedNumber as number)) {
    return res.status(400).json({ error: 'Seed must be a number' });
  }

  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const rssContent = await feedProcessor.processAndRandomize(
      url,
      seedNumber,
      baseUrl
    );

    res
      .set({
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': `public, max-age=${config.cacheTtlSeconds}`,
      })
      .send(rssContent);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Error processing feed',
      details: errorMessage,
    });
  }
});

export default router;
