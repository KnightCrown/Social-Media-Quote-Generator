# Social Media Quote Generator

Production-ready Next.js app that bulk processes up to 20 images with a transparent PNG overlay and exports:

- Instagram Story: 1080 x 1920
- Instagram Post: 1080 x 1080

## Stack

- Next.js App Router + TypeScript
- Sharp for image processing
- Tailwind CSS for UI
- Temporary server storage (no long-term persistence)

## Features

- Drag-and-drop upload for multiple images
- Overlay upload (PNG with transparency)
- Scale + center crop (no stretching)
- Per-image processing with progress states
- Per-image output downloads
- Output mode selection (Post, Story, or Both)
- Thumbnail preview with click-to-enlarge before download
- Bulk ZIP download
- Basic validation (type, size, max files)
- Preview thumbnails and queue reordering

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Run development server

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

See `.env.example`.

- `MAX_FILES`: Max uploaded images per batch (default `20`)
- `MAX_FILE_SIZE_MB`: Max size per base image (default `15`)
- `MAX_OVERLAY_SIZE_MB`: Max size for overlay PNG (default `10`)
- `OUTPUT_JPEG_QUALITY`: JPEG export quality (default `90`)
- `TEMP_FILE_TTL_MINUTES`: Temporary file TTL before cleanup (default `30`)
- `NEXT_PUBLIC_MAX_FILES`: Client-side file count limit
- `NEXT_PUBLIC_MAX_FILE_SIZE_MB`: Client-side per-file size limit

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run start`: Start production server
- `npm run lint`: Run lint checks

## API Routes

- `POST /api/process`
  - FormData: `image` (JPG/PNG/WEBP), `overlay` (PNG), `outputMode` (`post` | `story` | `both`)
  - Returns selected outputs with download URLs
- `GET /api/files/:id`
  - Downloads a generated JPEG by temporary ID
- `POST /api/download`
  - JSON payload of selected generated files
  - Returns ZIP archive

## Vercel Notes

- Sharp routes explicitly run with Node runtime (`runtime = "nodejs"`)
- Processing is done sequentially per image and limited client concurrency (2 workers) to reduce memory spikes
- Generated files are written to temporary storage and cleaned by TTL

## Sample Assets

Two sample overlay PNGs are included in `public/samples`:

- `sample-overlay-story.png`
- `sample-overlay-post.png`

## Deployment

Deploy directly to Vercel:

1. Push repository to Git provider
2. Import project in Vercel
3. Set environment variables from `.env.example`
4. Deploy
