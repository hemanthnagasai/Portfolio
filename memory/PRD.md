# Life Portfolio — Hemanth Naga Sai Chakka

## Original Problem Statement
Build an elite, multi-dimensional "Life Portfolio" — deeper than a resume. Three dimensions (Professional, Personal, Emotional/Love) on one single-user site. Cinematic, evolving, custom cursor, grain textures, distinct theme per world. Includes ATS-friendly PDF resume.

## User Choices
- Option E: Full Life Portfolio System
- Single-user personal site (for Hemanth)
- All three worlds visible publicly on one site
- Fully public Emotional dimension
- Separate `/recruiter` route with ATS-friendly PDF download
- Evolve & totally reimagine visuals: cinematic, motion, custom cursor, grain, distinct theme per dimension
- Direction approved: Professional (graphite + cyan), Personal (cream/ochre + forest green), Emotional (midnight indigo + candlelight amber), Gateway (dark cinematic)
- Skip AI features for now

## Architecture
- **Frontend**: React 19 + React Router v7 + Framer Motion + Tailwind CSS
- **Backend**: FastAPI + MongoDB (motor) + ReportLab (PDF generation)
- **Routes**: `/`, `/professional`, `/personal`, `/emotional`, `/recruiter`
- **Fonts**: Cormorant Garamond, Outfit, JetBrains Mono, Lora, Caveat, Playfair Display, Spectral, IBM Plex Sans (Google Fonts)

## What's Been Implemented (Jan 2026)
- **Gateway (`/`)**: Cinematic dark hero with digital avatar, animated name reveal, 3 portal cards (Professional/Personal/Emotional) with hover transitions, recruiter link
- **Professional (`/professional`)**: Dark graphite + cyan theme, data-grid background, hero heading "Data. Clarity. Initiative.", EY experience timeline, 2 projects, 3 education entries, 13 skill chips, 6 certs, Download Resume (PDF) button
- **Personal (`/personal`)**: Warm cream/ochre journal aesthetic, handwritten Caveat annotations, bio, 4 hobby cards (Singing, Cricket, Pencil Art, Exploring AI), 3 values, closing quote
- **Emotional (`/emotional`)**: Midnight indigo + candlelight amber, letter-unfolding animation (20 paragraphs with blur-in reveal on scroll), persistent candle glow following scroll, poetic signoff "— H."
- **Recruiter (`/recruiter`)**: Clean white ATS-friendly layout, prominent PDF download, no cinematic distractions, no world-switcher
- **Global systems**: Custom cursor morphs per dimension (gateway: white dot, professional: cyan cross, personal: soft ochre, emotional: amber flame), SVG grain overlay, world-switcher pill (sticky bottom center; hidden on `/recruiter`)
- **Backend endpoint**: `GET /api/resume/download` serves ATS-friendly PDF (generated with ReportLab) — 100% verified

## Testing Status
- Backend: 100% pass (pytest at `/app/backend/tests/test_life_portfolio_api.py`)
- Frontend: 100% pass (all routes, testids, counts, navigation, PDF download verified)
- No critical or minor issues

## Core Requirements (static)
1. Three-dimension architecture (Professional / Personal / Emotional)
2. Each world = distinct theme, tone, motion language
3. Gateway with avatar + 3 portals
4. ATS-friendly PDF resume download
5. Separate recruiter-only view
6. Cinematic, premium, slightly melancholic — never generic

## Prioritized Backlog (deferred)
- **P1**: Deploy to production (press Deploy on Emergent)
- **P2**: Audience-specific versions beyond `/recruiter` (e.g., `/dating`, `/network`)
- **P2**: Optional password gate on `/emotional` if Hemanth changes his mind
- **P2**: Contact form / social links footer
- **P3**: "Ask my portfolio" AI chat (using Emergent Universal Key) — visitors can chat with portfolio-as-Hemanth
- **P3**: AI resume variants generator (recruiter vs startup vs FAANG tailoring)
- **P3**: Analytics (which world visitors linger in most)
- **P3**: Visitor guestbook for the emotional letter

## Next Action Items
1. Review live site, refine any copy/imagery
2. Swap gateway avatar if you have a personal photo you'd like to use
3. Deploy when ready
