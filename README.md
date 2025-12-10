# Escape The Algorithm

A random toy to find interesting videos near you that you might not have discovered otherwise.

Instead of letting YouTube's recommendation algorithm decide what you should watch, this app shows you random videos uploaded near your location based on IP geolocation.

## How it works

1. When you load the app, it determines your approximate location from your IP address
2. It searches for the 10 most recent videos uploaded within 10 miles of your location
3. It picks one at random and shows it to you
4. If no videos are found, it expands the search radius (up to 1000 miles)
5. Videos you've seen are tracked in your browser so you always get something new

## Setup

### Prerequisites

- Node.js 18+
- A YouTube Data API v3 key

### Getting a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Copy the API key

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file in the root directory:

```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `YOUTUBE_API_KEY` environment variable in Vercel's project settings
4. Deploy!

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- YouTube Data API v3
- ip-api.com for geolocation

## License

MIT
