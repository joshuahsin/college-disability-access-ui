# Campus Access — frontend

React (Vite) frontend for the `college-disability-access` Django API. Lets students browse
campus venues, see crowd-reported accessibility features, vote to confirm/dispute reports,
and discuss them in comments.

## Setup

```bash
npm install
cp .env.example .env   # points at the Django API, defaults to http://localhost:8000/api
npm run dev             # http://localhost:5173
```

Run the Django backend (`college-disability-access`) alongside this on `localhost:8000` —
its `DJANGO_CORS_ALLOWED_ORIGINS` already includes `http://localhost:5173`.

## Structure

- `src/api/` — axios client with JWT access/refresh handling, plus one file per API resource
  (`auth`, `resources` for campuses/venues/features/submissions/confirmations/comments)
- `src/context/AuthContext.jsx` — login/register/logout state, backed by the token store
- `src/components/` — shared UI (nav, forms, badges, voting, comments)
- `src/pages/` — routed pages: login, register, venue list, venue detail

## Notes / assumptions

- Campuses, venues, and features are browsable without an account (the API allows anonymous
  reads there); viewing a venue's reported submissions and voting/commenting requires login,
  matching the API's `IsAuthenticated`-only permissions on those endpoints.
- A venue's feature list is paired with its latest submission per feature (submissions are
  fetched once per venue and grouped client-side, since the API returns them newest-first).
- This was scaffolded directly from the Django API contract (models/serializers/views) since
  the earlier "Evaluating Hackathon Project Feasibility" chat wasn't available in this session
  — revisit styling/IA choices against that discussion if they conflict.
