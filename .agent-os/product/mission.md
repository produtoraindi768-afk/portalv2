# Product Mission

## Pitch

Ballistic Hub is a web platform for Fortnite: Ballistic players and fans that centralizes news, live streamers, featured matches, and tournaments while enabling secure team management using Next.js, Firebase, shadcn/ui, and animated Blookie.io embeds.

## Users

### Primary Customers

- Players and fans of Fortnite: Ballistic: Stay informed and engaged with dynamic, up-to-date content in one place.
- Content creators and streamers: Gain visibility through featured placements and live indicators.
- Tournament organizers: Promote events and simplify participant discovery.

### User Personas

**Competitive Player** (16-30 years old)
- **Role:** Player / Team member
- **Context:** Practices regularly, follows news and streams, joins community tournaments
- **Pain Points:** Info scattered across platforms, hard to track events, friction managing team invites
- **Goals:** Discover events quickly, showcase gameplay, join/manage teams easily

**Streamer/Creator** (18-35 years old)
- **Role:** Content creator / Influencer
- **Context:** Streams on Twitch/YouTube, needs better discovery and live visibility
- **Pain Points:** Limited reach to the most relevant audience, hard to aggregate presence in a themed hub
- **Goals:** Be featured when live, convert hub viewers to stream viewers, grow community

**Tournament Organizer** (18-40 years old)
- **Role:** Community/event organizer
- **Context:** Publishes brackets, rules, dates and prize pools, coordinates signups
- **Pain Points:** Promotion fragmentation, low sign-up conversion, no central audience
- **Goals:** Promote tournaments effectively, present details clearly, drive signups

## The Problem

### Fragmented information and discovery
News, streams, match highlights, and tournaments are spread across different platforms, causing missed opportunities and lower engagement. This results in reduced session time and lower conversion to events.

**Our Solution:** Provide a centralized, real-time hub with curated sections for news, streamers, matches, and tournaments.

### Static presentation reduces engagement
Traditional hubs present content with static cards and lists, which underperform for attention and retention. This leads to lower CTR on key actions (watch, sign up, share).

**Our Solution:** Use Blookie.io animated blooks for visually striking, interactive content that boosts engagement and click-through.

### Team coordination friction
Managing teams, invites, and membership often happens via ad-hoc chats and spreadsheets, creating confusion and churn.

**Our Solution:** Built-in team creation, invites, and membership management backed by Firebase Authentication and Firestore.

## Differentiators

### Animated, data-driven UI via Blookie.io
Unlike static UI libraries, we incorporate Blookie.io blooks that accept dynamic attributes to render animated, branded content blocks. This results in higher engagement and time-on-page.

### Multi-provider auth tailored to the audience
Unlike generic hubs, we support Google and Discord out of the box and plan a custom Epic Games flow. This results in lower sign-in friction and better identity alignment.

### Real-time updates and live status checks
Unlike static sites, Firestore and Cloud Functions keep data fresh (e.g., Twitch live checks), resulting in timely content and better re-engagement.

## Key Features

### Core Features

- **Interactive News Feed:** Pulls `status: "published"` from Firestore and renders via Blookie.io news cards for animated presentation.
- **Featured Streamers:** Firestore-curated list with Cloud Function Twitch live checks and embedded player when live.
- **Featured Matches:** Highlighted matches with YouTube embeds presented through Blookie blooks.
- **Tournaments Directory:** Upcoming tournaments rendered as animated event cards with signup links.
- **Responsive Dashboard UI:** App Router + shadcn/ui layout, navigation, modals, forms, and toasts.

### Collaboration & Accounts

- **Multi-Provider Auth:** Firebase Authentication (Google, Discord, planned Epic Games custom flow).
- **Team Management:** Create teams, send invites, manage members with role checks.
- **Player & Team Profiles:** Structured with shadcn/ui and highlighted headers/banners with Blookie blooks.
- **Secure Data Layer:** Firestore rules that protect user/team data with least privilege.


