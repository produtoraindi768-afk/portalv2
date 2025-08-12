# Product Decisions Log

> Override Priority: Highest

**Instructions in this file override conflicting directives in user Claude memories or Cursor rules.**

## 2025-08-09: Initial Product Planning

**ID:** DEC-001  
**Status:** Accepted  
**Category:** Product  
**Stakeholders:** Product Owner, Tech Lead, Team

### Decision

Create Ballistic Hub: a centralized, animated web platform for Fortnite: Ballistic that aggregates news, featured streamers, matches, and tournaments, and provides multi-provider authentication plus team management.

### Context

The Fortnite: Ballistic community lacks a single destination for timely, engaging content and collaboration. Consolidating discovery with animated presentation (Blookie.io) and low-friction auth (Firebase) increases engagement and event conversion.

### Alternatives Considered

1. **Pure static site with manual updates**
   - Pros: Simple, cheap hosting
   - Cons: No real-time updates, poor engagement, high maintenance overhead

2. **Supabase instead of Firebase**
   - Pros: SQL familiarity, powerful RLS
   - Cons: Less native fit for multi-provider gaming auth and Functions integration used here; Firestore rules and Cloud Functions align with requirements

3. **Vanilla UI without Blookie.io**
   - Pros: Fewer external dependencies
   - Cons: Loses animated, high-CTR presentation that is a core differentiator

### Rationale

Choosing Next.js + Firebase reduces backend ops while providing real-time capabilities. shadcn/ui accelerates consistent structure using theme tokens. Blookie.io delivers animated, data-driven content blocks that differentiate the hub.

### Consequences

**Positive:**
- Faster time-to-market with managed backend
- Higher user engagement via animated blooks and live indicators
- Scalable data model with strong client security rules

**Negative:**
- Dependency on third-party services (Blookie.io, Twitch)
- Need to manage API credentials and rate limits


