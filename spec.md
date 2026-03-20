# NEET Study Playlist

## Current State
Previous draft expired. Rebuilding from conversation history.

## Requested Changes (Diff)

### Add
- Full NEET Study Playlist app with subject/chapter/video organization
- Telegram import wizard: paste Telegram group link + Gemini API key to auto-organize lectures
- Gemini AI analysis: categorizes lectures into Physics/Chemistry/Biology by chapter
- Preview tree of imported subjects/chapters before finalizing
- Manual playlist management: add subjects, chapters, videos
- Progress tracking per chapter/playlist
- Help section UI

### Modify
- N/A (rebuild)

### Remove
- N/A (rebuild)

## Implementation Plan
1. Backend: subjects, chapters, playlists, videos data model with CRUD
2. Backend: progress tracking per video
3. Frontend: dashboard with subject/chapter tree view
4. Frontend: Telegram import wizard (client-side Gemini API call)
5. Frontend: manual add subject/chapter/video flows
6. Frontend: progress tracking UI
7. Frontend: help section
