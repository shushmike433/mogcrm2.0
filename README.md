# MogCRM AI

A clean Next.js App Router foundation for a business CRM workspace, with Firebase email/password authentication, protected dashboard routes, and workspace-scoped lead listing.

## Requirements

- Node.js 20.9 or later
- npm
- A Firebase project with Authentication (Email/Password) and Cloud Firestore enabled

## Run locally

```bash
npm install
cp .env.example .env.local
# Fill in the Firebase web app values in .env.local
npm run dev
```

Visit http://localhost:3000. Validate changes with `npm run lint`, `npm run typecheck`, and `npm run build`.

## Firebase configuration

Create a Firebase web app and copy its config into `.env.local`. Enable **Authentication → Email/Password**. Firestore user documents are expected at `users/{uid}` with a string `clientId` field. Lead records are queried from `leads` where `clientId` matches that value.

Create security rules that restrict each user to their own account and authorized business data. Never deploy permissive test rules or put admin credentials in `NEXT_PUBLIC_*` variables. A Firebase web API key is a client identifier, not a substitute for Firestore security rules.

## Routes

- `/` redirects to `/dashboard` when signed in, otherwise `/login`.
- `/login` supports registration and sign-in.
- `/dashboard` is the overview.
- `/dashboard/leads` queries Firestore leads for the signed-in user's client.
- `/dashboard/calls`, `/dashboard/appointments`, `/dashboard/reviews`, and `/dashboard/settings` are scaffolded workspace sections.

## Notes

The calls, appointments, reviews, and settings sections are presentation scaffolds; they do not claim to provide connected or persisted functionality yet. Add the relevant data models, Firestore access rules, and service integrations before relying on them in production.
