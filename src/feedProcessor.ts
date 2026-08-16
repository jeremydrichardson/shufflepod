import Parser from 'rss-parser';
import { Feed } from 'feed';

interface FeedItem extends Parser.Item {
  enclosure?: {
    url: string;
    type?: string;
    length?: string;
  };
  itunes?: {
    duration?: string;
    explicit?: string;
    image?: string;
  };
}

interface ParsedFeed extends Parser.Output<FeedItem> {
  itunes?: {
    author?: string;
    image?: string;
    owner?: {
      name?: string;
      email?: string;
    };
  };
}

export class FeedProcessor {
  private parser: Parser<ParsedFeed, FeedItem>;

  constructor() {
    this.parser = new Parser({
      timeout: 30000,
      customFields: {
        feed: ['itunes'],
        item: ['itunes', 'enclosure'],
      },
    });
  }

  async fetchFeed(feedUrl: string): Promise<ParsedFeed> {
    return this.parser.parseURL(feedUrl);
  }

  shuffleFeed(originalFeed: ParsedFeed, seed?: number, baseUrl?: string): string {
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
