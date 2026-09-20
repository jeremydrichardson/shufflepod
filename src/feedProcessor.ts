import Parser from 'rss-parser';
import { Feed } from 'feed';

export class FeedProcessor {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 30000,
      customFields: {
        feed: ['itunes', 'language', 'copyright'],
        item: ['itunes', 'enclosure', 'author', 'creator'],
      },
    });
  }

  async validatePodcastFeed(feedUrl: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      
      if (!feed || typeof feed !== 'object') {
        return { valid: false, error: 'URL does not return a valid feed' };
      }

      if (!feed.items || !Array.isArray(feed.items) || feed.items.length === 0) {
        return { valid: false, error: 'Feed contains no episodes' };
      }

      const hasAudioContent = feed.items.some((item: any) => 
        item.enclosure?.url && 
        (item.enclosure.type?.includes('audio') || item.enclosure.url?.match(/\.(mp3|m4a|wav|ogg)$/i))
      );

      if (!hasAudioContent) {
        return { valid: false, error: 'Feed does not appear to be a podcast (no audio enclosures found)' };
      }

      return { valid: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { valid: false, error: `Failed to fetch or parse feed: ${errorMessage}` };
    }
  }

  async fetchFeed(feedUrl: string): Promise<any> {
    return this.parser.parseURL(feedUrl);
  }

  shuffleFeed(originalFeed: any, seed?: number, baseUrl?: string): string {
    const feed = new Feed({
      title: `🔀 ${originalFeed.title || 'Shuffled Podcast'}`,
      description: `Shuffled version of: ${originalFeed.description || originalFeed.title || 'Unknown Podcast'}`,
      id: originalFeed.link || baseUrl || 'https://shufflepod.netlify.app',
      link: originalFeed.link || baseUrl || 'https://shufflepod.netlify.app',
      language: originalFeed.language || 'en',
      image: originalFeed.image?.url || originalFeed.itunes?.image,
      copyright: originalFeed.copyright,
      generator: 'ShufflePod',
      feedLinks: {
        rss: baseUrl || 'https://shufflepod.netlify.app',
      },
    });

    const items = [...(originalFeed.items || [])];

    if (seed !== undefined) {
      this.seededShuffle(items, seed);
    } else {
      this.shuffle(items);
    }

    items.forEach((item) => {
      const feedItem: any = {
        title: item.title || 'Untitled Episode',
        id: item.guid || item.link || '',
        link: item.link || '',
        description: item.contentSnippet || item.content || item.summary || '',
        content: item.content || item.contentSnippet || item.summary || '',
        date: item.pubDate ? new Date(item.pubDate) : new Date(),
      };

      if (item.creator || item.author) {
        feedItem.author = [{ name: item.creator || item.author || '' }];
      }

      if (item.enclosure?.url) {
        feedItem.enclosure = {
          url: item.enclosure.url,
          type: item.enclosure.type || 'audio/mpeg',
          length: item.enclosure.length,
        };
      }

      if (item.itunes?.image) {
        feedItem.image = item.itunes.image;
      }

      feed.addItem(feedItem);
    });

    return feed.rss2();
  }

  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private seededShuffle<T>(array: T[], seed: number): void {
    let currentSeed = seed;
    const random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async processAndShuffle(feedUrl: string, seed?: number, baseUrl?: string): Promise<string> {
    const originalFeed = await this.fetchFeed(feedUrl);
    return this.shuffleFeed(originalFeed, seed, baseUrl);
  }
}
