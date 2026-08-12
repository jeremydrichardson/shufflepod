# ShufflePod

A TypeScript service for creating shuffled and custom podcast feeds. Take any existing podcast RSS feed and randomize the episode order, or (coming soon) turn your Plex playlists into podcast feeds.

## Features

### Current Features
- **Shuffle Existing Podcast Feeds**: Take any podcast RSS feed and randomize the episode order
- **Reproducible Shuffling**: Use optional seed parameter for consistent shuffling
- **RESTful API**: Simple HTTP API built with Express and TypeScript
- **Docker Support**: Easy deployment with Docker and docker-compose
- **Type Safety**: Full TypeScript support for better developer experience

### Planned Features
- **Plex Integration**: Convert Plex playlists into podcast feeds
- **Feed Caching**: Improved performance with intelligent caching
- **Custom Feed Filtering**: Select specific episodes or date ranges

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd shufflepod
```

2. Build and run with docker-compose:
```bash
docker-compose up -d
```

3. The service will be available at `http://localhost:3000`

### Local Development

1. Install Node.js 20 or higher

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run dev
```

4. Or build and run in production mode:
```bash
npm run build
npm start
```

## API Usage

### Shuffle a Podcast Feed

**Endpoint**: `GET /shuffle`

**Parameters**:
- `url` (required): The URL of the original podcast feed
- `seed` (optional): Integer seed for reproducible shuffling

**Example**:
```bash
curl "http://localhost:3000/shuffle?url=https://example.com/podcast/feed.xml"
```

**With seed for reproducible shuffling**:
```bash
curl "http://localhost:3000/shuffle?url=https://example.com/podcast/feed.xml&seed=12345"
```

### Using in Podcast Apps

Most podcast apps allow you to add feeds by URL. Simply copy the shuffle URL and paste it into your podcast app:

```
http://localhost:3000/shuffle?url=https://example.com/podcast/feed.xml
```

If you want the same shuffle order every time, add a seed:
```
http://localhost:3000/shuffle?url=https://example.com/podcast/feed.xml&seed=42
```

### Check Service Health

**Endpoint**: `GET /health`

```bash
curl http://localhost:3000/health
```

## Configuration

Configuration can be set via environment variables or a `.env` file:

- `BASE_URL`: Base URL for the service (default: `http://localhost:3000`)
- `PORT`: Port to bind to (default: `3000`)
- `HOST`: Host to bind to (default: `0.0.0.0`)
- `CACHE_TTL_SECONDS`: Cache duration in seconds (default: `3600`)
- `MAX_FEED_SIZE_MB`: Maximum feed size in megabytes (default: `50`)
- `REQUEST_TIMEOUT_MS`: Timeout for fetching feeds in milliseconds (default: `30000`)

## Use Cases

### Random Episode Discovery
Breathe new life into your favorite podcasts by listening to episodes in random order. Great for:
- Educational podcasts where episode order doesn't matter
- Comedy podcasts
- News/current events archives
- Interview shows

### Different Shuffle Per Device
Use different seeds for different devices to get unique shuffle orders:
- Phone: `seed=1`
- Tablet: `seed=2`
- Desktop: `seed=3`

### Sharing Custom Orders
Share your favorite shuffle with friends by sharing your seed number.

## Architecture

The service is built with TypeScript and designed with modularity in mind:

```
shufflepod/
├── src/
│   ├── index.ts           # Express app setup and server
│   ├── routes.ts          # API route definitions
│   ├── feedProcessor.ts   # RSS feed processing and randomization
│   ├── config.ts          # Configuration management
│   └── __tests__/         # Test files
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── Dockerfile            # Container configuration
```

This architecture makes it easy to add new features like Plex integration as separate modules.

## Future: Plex Integration

The planned Plex integration will allow you to:
- Connect to your Plex Media Server
- Select audio playlists
- Generate podcast feeds from your playlists
- Keep feeds in sync with playlist changes

The modular architecture is designed to support this feature in the same service.

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express
- **RSS Parsing**: rss-parser
- **RSS Generation**: feed
- **HTTP Client**: axios
- **Testing**: Jest + Supertest

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Troubleshooting

### Feed Not Loading
- Verify the original feed URL is accessible
- Check that the feed is a valid RSS/Atom feed
- Ensure the feed size is under the configured limit

### Timeout Errors
- Increase `REQUEST_TIMEOUT_MS` for slow feeds
- Check your network connection
- Verify the source feed is responding

### Docker Issues
- Ensure port 3000 is not already in use
- Try `docker-compose down` and `docker-compose up --build` to rebuild

### TypeScript Build Errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `dist` folders and reinstall
- Check that you're using Node.js 20 or higher

## Support

For issues and feature requests, please use the GitHub issue tracker.
