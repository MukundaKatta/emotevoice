# EmoteVoice

> Empathic Voice AI Platform for Emotion Detection and Synthesis

EmoteVoice is a platform for capturing, analyzing, and responding to human emotions through voice and text. Features real-time emotion detection via the Web Audio API, sentiment analysis, and emotion-aware text-to-speech synthesis.

## Features

- **Voice Recorder** -- Capture audio with real-time Web Audio API processing
- **Emotion Detection** -- Analyze vocal cues for emotion classification in real time
- **Emotion-Aware TTS** -- Generate speech that conveys specified emotional tones
- **Dashboard Analytics** -- Aggregate emotion trends and session statistics
- **Timeline View** -- Chronological display of emotion events during recordings
- **Emotion Heatmap** -- Visual heatmap of detected emotions over time
- **Sentiment Analysis** -- Text-based sentiment scoring alongside voice analysis
- **Demo Gallery** -- Pre-recorded samples showcasing platform capabilities
- **API Builder** -- Configure and test EmoteVoice API endpoints
- **Batch Analysis** -- Process multiple audio files for emotion analysis
- **Emotion Triggers** -- Set up automated actions based on detected emotional states

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, CVA, tailwind-merge
- **UI Components:** Radix UI (Dialog, Dropdown, Progress, Select, Slider, Switch, Tabs, Tooltip)
- **Visualization:** D3.js, Recharts
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand
- **Animation:** Framer Motion
- **Icons:** Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your SUPABASE_URL and SUPABASE_ANON_KEY

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx              # Voice recorder and emotion TTS
  dashboard/            # Analytics overview
  timeline/             # Emotion event timeline
  heatmap/              # Emotion heatmap visualization
  sentiment/            # Text sentiment analysis
  demos/                # Demo recordings gallery
  api-builder/          # API configuration tool
  batch-analysis/       # Batch audio processing
  triggers/             # Emotion-based automation
components/
  layout/               # App shell and navigation
  voice/                # Voice recorder and TTS components
```

## License

MIT
