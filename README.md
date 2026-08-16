# ShufflePod 🔀

A simple service for creating shuffled podcast feeds. Enter any podcast RSS feed URL and get back a dynamically shuffled version that you can add to your podcast app (like Overcast).

## Features

- **Simple Web Interface**: Easy form to generate shuffled feed URLs
- **Dynamic Generation**: Feeds are generated fresh on each request
- **Reproducible Shuffling**: Optional seed parameter for consistent shuffle orders
- **Always Up-to-date**: Automatically includes new episodes from the source feed
- **Netlify Ready**: Deployed as serverless functions with zero storage needed

## Quick Start (Local Development)

1. **Install dependencies**:
```bash
npm install
```

2. **Run locally with Netlify Dev**:
```bash
npm run dev
```

3. **Open in browser**:
```
http://localhost:8888
```

## Deployment to Netlify

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/shufflepod)

### Manual Deploy

1. **Push to GitHub**

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings are auto-detected from `netlify.toml`
   - Click "Deploy"

### Using Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## How It Works

### Architecture

```
User → Web UI → Enter feed URL + seed
                      ↓
                Generate URL:
                /api/feed?url=X&seed=Y
                      ↓
            Add to Overcast
                      ↓
        Overcast polls periodically
                      ↓
    Netlify Function fetches source
                      ↓
            Shuffle with seed
                      ↓
        Return shuffled RSS XML
```

### Dynamic Generation

Unlike static feed generators, ShufflePod generates feeds **on-demand**:

1. You create a feed URL with your parameters
2. Overcast (or any podcast app) requests that URL
3. Our serverless function:
   - Fetches the original podcast feed
   - Shuffles episodes using your seed
   - Returns the shuffled RSS XML
4. Overcast caches the result for ~4-12 hours
5. When new episodes appear, they're automatically included in the shuffle

### Handling New Episodes

When new episodes are added to the source feed:
- All episodes (old + new) are shuffled together
- Using the same seed ensures consistent ordering
- New episodes get randomly mixed in with old ones

This means episode positions may shift when new episodes arrive, but the shuffle remains deterministic with your seed.

## API Endpoints

### `GET /api/feed`

Generate and return a shuffled RSS feed.

**Query Parameters**:
- `url` (required): The original podcast feed URL
- `seed` (optional): Integer seed for reproducible shuffling

**Examples**:

With seed (consistent shuffle):
```
GET /api/feed?url=https://example.com/podcast.xml&seed=12345
```

Without seed (random shuffle based on timestamp):
```
GET /api/feed?url=https://example.com/podcast.xml
```

**Response**: RSS 2.0 XML
**Cache**: 1 hour (`Cache-Control: public, max-age=3600`)

### `GET /api/health`

Health check endpoint.

**Response**:
```json
{
  "status": "healthy"
}
```

## Using with Podcast Apps

### Overcast (Recommended)
1. Generate feed URL using the web interface
2. Copy the URL
3. Open Overcast app
4. Tap "+" → Add by URL
5. Paste and add

### Apple Podcasts
1. Generate and copy feed URL
2. Open Apple Podcasts
3. Library → Shows → "..." → Add a Show by URL
4. Paste and add

### Pocket Casts
1. Generate and copy feed URL
2. Open Pocket Casts
3. Search → Paste URL
4. Add the podcast

## Technology Stack

- **Hono**: Ultra-fast web framework for serverless
- **Netlify Functions**: Serverless Node.js functions
- **TypeScript**: Full type safety
- **RSS Parser**: Parse any podcast feed format
- **Feed Library**: Generate RSS 2.0 compliant feeds
- **Zero Storage**: Fully stateless, no database needed

## Use Cases

### Random Episode Discovery
Experience podcasts in a fresh order:
- Educational content where order doesn't matter
- Comedy shows for variety
- Interview podcasts for surprise guests
- News/event archives in random order

### Consistent Shuffles
Use seeds to create deterministic shuffles:
- Same shuffle across devices (use same seed)
- Different shuffle per device (use different seeds)
- Share your shuffle with friends (share your seed)

### Examples

**Personal shuffle (seed based on your birthday)**:
```
/api/feed?url=https://podcast.com/feed.xml&seed=19900515
```

**Daily shuffle (seed based on day of year)**:
```
/api/feed?url=https://podcast.com/feed.xml&seed=228
```

**Completely random (no seed)**:
```
/api/feed?url=https://podcast.com/feed.xml
```

## Development

### Project Structure
```
shufflepod/
├── public/
│   └── index.html              # Web interface
├── src/
│   └── feedProcessor.ts        # Feed parsing and shuffling
├── netlify/
│   └── functions/
│       └── api.ts              # Hono API endpoint
├── netlify.toml               # Netlify configuration
├── package.json               # Dependencies
└── tsconfig.json             # TypeScript config
```

### Local Testing
```bash
npm install
npm run dev       # Runs on localhost:8888
```

### Building
```bash
npm run build     # Compiles TypeScript
```

## Performance

- **Caching**: 1-hour cache on RSS responses
- **Serverless**: Scales automatically with demand
- **Cold Start**: ~500ms on first request
- **Warm Response**: ~100-200ms

Overcast typically polls feeds every 4-12 hours, so cold starts are rare.

## Limitations

- **No persistent shuffle tracking**: Episodes may shift when new episodes arrive
- **No listen history**: Podcast app handles this (e.g., Overcast)
- **Source feed dependency**: If source is slow/down, shuffle will be affected
- **URL length**: Very long feed URLs may hit browser limits

## Why Dynamic?

We chose dynamic generation over static files because:

1. **Always fresh**: New episodes automatically included
2. **Zero storage**: No database, no blob storage, no maintenance
3. **Simpler**: Fewer moving parts, easier to debug
4. **Podcast app caching**: Apps cache anyway, so generation cost is minimal
5. **Netlify-friendly**: Serverless functions are perfect for this

## Future Enhancements

Planned features:
- [ ] Plex Media Server integration (playlists → podcast feeds)
- [ ] Feed filtering (date ranges, keyword search)
- [ ] Multiple shuffle algorithms
- [ ] Feed preview before adding to app

## Troubleshooting

### Feed not loading in podcast app
- Verify the source feed URL is accessible
- Check that URL is properly encoded
- Try the feed URL in a browser first

### Episodes in different order
- This happens when new episodes are added
- Use the same seed for consistent reshuffling
- Without a seed, shuffle is based on timestamp

### Slow generation
- First request may be slow (cold start)
- Subsequent requests cached for 1 hour
- Large feeds (500+ episodes) take longer

## Contributing

Contributions welcome! Please submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Support

For issues and feature requests, use the GitHub issue tracker.
