# Pronunciation Coach — Frontend

Next.js frontend for the Pronunciation Coach app. Deploy on Vercel (free tier).

## Runs with zero configured secrets

No API keys are required on the frontend. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL for production.

## Local development

```bash
cd pronunciation-coach-frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Ensure the backend is running on port 7860.

## Vercel deployment

1. Push this repo to GitHub.
2. Import project in [vercel.com](https://vercel.com).
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = your Hugging Face Space URL (e.g. `https://user-pronunciation-coach.hf.space`)
4. Deploy.

## Features

- DPDP consent modal (blocks recording until accepted)
- Browser recorder (Web Audio API / MediaRecorder) or file upload
- Client-side 30–45 second duration validation
- Results page with overall score, word highlights, feedback panel
- "Delete my results" button (right to erasure)

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
