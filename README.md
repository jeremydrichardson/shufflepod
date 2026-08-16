# ShufflePod 🔀

A simple service for creating shuffled podcast feeds. Enter any podcast RSS feed URL and get back a permanently shuffled version that you can add to your podcast app (like Overcast).

## Features

- **Simple Web Interface**: Easy form to generate shuffled feeds
- **Static Feed Generation**: Creates permanent RSS feeds you can add to any podcast app
- **Reproducible Shuffling**: Optional seed parameter for consistent shuffle orders
- **Feed Management**: View and manage all your generated feeds in one place
- **Netlify Ready**: Deployed as serverless functions with blob storage

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

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build the project**:
```bash
npm run build
```

3. **Deploy**:
```bash
netlify deploy --prod
```

### Environment Setup

No environment variables needed! The app uses Netlify Blobs for storage, which is automatically configured when deployed to Netlify.

## How It Works

### Architecture

```
┌─────────────────┐
│  Web Interface  │  (public/index.html)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Netlify         │  (Hono API)
│ Functions       │  /api/generate, /api/feeds, /api/feed/:id
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Netlify Blobs   │  (Feed storage)
│ • feeds         │  (XML files)
│ • feed-metadata │  (JSON list)
└─────────────────┘
```

### Flow

1. **User enters podcast feed URL** in the web interface
2. **API fetches and parses** the original RSS feed
3. **Episodes are shuffled** (with optional seed)
4. **New RSS feed is generated** and saved to Netlify Blobs
5. **Unique feed URL is returned** (e.g., `/api/feed/abc123xyz`)
6. **User adds URL to podcast app** (Overcast, Apple Podcasts, etc.)

### Storage

- **Netlify Blobs**: Serverless key-value storage for generated feeds
- **Two stores**:
  - `feeds`: Stores the actual RSS XML content
  - `feed-metadata`: Stores the list of feeds with metadata (title, date, seed, etc.)

## API Endpoints

### `POST /api/generate`
Generate a new shuffled feed.

**Request Body**:
```json
{
  "url": "https://example.com/podcast/feed.xml",
  "seed": 12345  // optional
}
```

**Response**:
```json
{
  "success": true,
  "feed": {
    "id": "abc123xyz",
    "originalUrl": "https://example.com/podcast/feed.xml",
    "title": "My Podcast",
    "feedUrl": "/api/feed/abc123xyz",
    "seed": 12345,
    "createdAt": "2026-08-16T03:58:00.000Z"
  }
}
```

### `GET /api/feeds`
List all generated feeds.

**Response**:
```json
{
  "feeds": [
    {
      "id": "abc123xyz",
      "originalUrl": "https://example.com/podcast/feed.xml",
      "title": "My Podcast",
      "feedUrl": "/api/feed/abc123xyz",
      "seed": 12345,
      "createdAt": "2026-08-16T03:58:00.000Z"
    }
  ]
}
```

### `GET /api/feed/:id`
Get a specific shuffled feed (RSS XML).

**Response**: RSS 2.0 XML

### `DELETE /api/feed/:id`
Delete a generated feed.

**Response**:
```json
{
  "success": true
}
```

### `GET /api/health`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy"
}
```

## Technology Stack

- **Framework**: [Hono](https://hono.dev/) - Fast, lightweight web framework
- **Runtime**: Node.js 20+ (Netlify Functions)
- **Storage**: [Netlify Blobs](https://docs.netlify.com/blobs/overview/) - Serverless key-value storage
- **RSS Parsing**: [rss-parser](https://www.npmjs.com/package/rss-parser)
- **RSS Generation**: [feed](https://www.npmjs.com/package/feed)
- **Frontend**: Vanilla HTML/CSS/JavaScript

## Use Cases

### Random Episode Discovery
Breathe new life into your favorite podcasts by listening to episodes in random order. Perfect for:
- Educational podcasts where episode order doesn't matter
- Comedy shows
- Interview podcasts
- News archives

### Multiple Shuffles
Generate different shuffled versions of the same podcast:
- Use seed `1` for your morning commute version
- Use seed `2` for your workout version
- Use seed `3` for your evening version

### Share Custom Orders
Create a specific shuffle and share the feed URL with friends so they experience the same episode order.

## Using with Podcast Apps

### Overcast (Recommended)
1. Copy the feed URL from ShufflePod
2. Open Overcast app
3. Tap "+" to add a podcast
4. Paste the URL
5. Tap "Add"

### Apple Podcasts
1. Copy the feed URL
2. Open Apple Podcasts
3. Go to Library → Shows
4. Tap "..."
5. Select "Add a Show by URL"
6. Paste and add

### Pocket Casts
1. Copy the feed URL
2. Open Pocket Casts
3. Tap "Search"
4. Paste the URL in the search box
5. Add the podcast

## Development

### Project Structure
```
shufflepod/
├── public/
│   └── index.html           # Web interface
├── src/
│   └── feedProcessor.ts     # Feed parsing and shuffling
├── netlify/
│   └── functions/
│       └── api.ts           # Hono API routes
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies
└── tsconfig.json          # TypeScript config
```

### Local Testing
```bash
# Install dependencies
npm install

# Run with Netlify Dev (includes functions + blobs emulation)
npm run dev

# Build TypeScript
npm run build
```

### Adding Features

The codebase is designed to be extended. Future features could include:
- Plex Media Server integration (turn playlists into podcast feeds)
- Feed filtering (date ranges, episode selection)
- Automatic feed updates on a schedule
- User authentication for private feeds

## Limitations

- **One-time generation**: Feeds are generated once and don't auto-update with new episodes from the source
- **No authentication**: Generated feed URLs are public (anyone with the URL can access)
- **Storage limits**: Netlify Blobs has storage limits on free tier

## Future Enhancements

- [ ] Plex Media Server integration
- [ ] Scheduled feed regeneration to pick up new episodes
- [ ] Feed filtering options
- [ ] User accounts and private feeds
- [ ] Feed analytics (play counts, etc.)

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker.
