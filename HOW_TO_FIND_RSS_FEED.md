# How to Find the RSS Feed URL for a Podcast

The most common mistake when using ShufflePod is entering a **podcast web page URL** instead of the actual **RSS feed URL**.

## The Problem

❌ **iTunes/Apple Podcasts page URL** (won't work):
```
https://itunes.apple.com/us/podcast/the-bible-project/id1050832450
```

✅ **Actual RSS feed URL** (will work):
```
https://feeds.thebibleproject.com/podcast
```

## How to Find the Real RSS Feed URL

### Method 1: Use a Podcast RSS Finder Tool

1. Go to [GetRSSFeed.com](https://getrssfeed.com) or [PodcastAddict RSS Finder](https://podcastaddict.com/podcast-rss-finder)
2. Paste the iTunes/Spotify URL or search by podcast name
3. Copy the RSS feed URL

### Method 2: Desktop Podcast Apps

**Apple Podcasts (Mac)**:
1. Right-click on the podcast in your library
2. Select "Copy Podcast URL"
3. This gives you the RSS feed URL

**Overcast (iOS/Web)**:
1. Open the podcast
2. Tap the info button
3. Look for "Feed URL" and copy it

### Method 3: iTunes Lookup API

For iTunes URLs like `https://itunes.apple.com/us/podcast/NAME/id1050832450`:

1. Extract the ID (e.g., `1050832450`)
2. Visit: `https://itunes.apple.com/lookup?id=1050832450`
3. Look for the `"feedUrl"` field in the JSON response

Example:
```bash
curl "https://itunes.apple.com/lookup?id=1050832450" | grep feedUrl
```

### Method 4: Browser Developer Tools

1. Visit the podcast's website
2. Open browser developer tools (F12)
3. Look for `<link rel="alternate" type="application/rss+xml">` in the HTML
4. The `href` attribute contains the RSS feed URL

## Common Podcast RSS Feed Patterns

Many podcasts follow predictable patterns:

- **Libsyn**: `https://SHOWNAME.libsyn.com/rss`
- **Simplecast**: `https://feeds.simplecast.com/PODCAST_ID`
- **Spotify**: Spotify podcasts often don't have public RSS feeds
- **Custom domains**: `https://feeds.PODCAST.com/SHOWNAME`

## Example: The Bible Project

For The Bible Project podcast:

❌ Wrong URL:
```
https://itunes.apple.com/us/podcast/the-bible-project/id1050832450
```

✅ Correct RSS Feed URL:
```
https://feeds.thebibleproject.com/podcast
```

## Test Your RSS Feed URL

Before using it in ShufflePod, test it:

1. Paste the URL in your browser
2. You should see XML content starting with `<?xml version="1.0"?>`
3. Look for `<rss>` or `<feed>` tags
4. You should see `<item>` or `<entry>` tags with episode information

If you see HTML instead of XML, you have the wrong URL!

## Still Can't Find It?

If you can't find the RSS feed:
1. Search Google for: `"PODCAST NAME" RSS feed`
2. Check the podcast's official website
3. Contact the podcast creator
4. Some podcasts (especially Spotify exclusives) don't have public RSS feeds

## Need Help?

Open an issue on GitHub with:
- The podcast name
- The iTunes/Spotify URL you have
- Any error messages you're seeing

We'll help you find the correct RSS feed URL!
