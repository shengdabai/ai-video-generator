# ai-video-generator

Describe a video in one line — AI (Gemini) enhances the prompt and generates a shot-by-shot storyboard. React Native + Expo app, TypeScript backend.

## Business Context

- **Category:** content automation product
- **Audience:** creators and small teams that want to turn ideas into repeatable publishing or video-production workflows.
- **Repository status:** Public repository. Keep examples, docs, and issues free of credentials, private data, and machine-specific paths.
- **Topics:** ai, ai-video, expo, gemini, react-native, storyboard, typescript, video-generation

## What This Project Is For

- Describe a video in one line — AI (Gemini) enhances the prompt and generates a shot-by-shot storyboard. React Native + Expo app, TypeScript backend.
- Move content production from ad hoc drafting to a repeatable pipeline.
- Preserve human review points while automating the mechanical steps.

## Where It Fits

This repository is meant to turn content work into an inspectable pipeline: source material in, structured drafts or production artifacts out, with review points kept explicit.

## Technical Overview

- **Primary language:** TypeScript
- **Detected stack:** TypeScript, Node.js / JavaScript tooling, React, Tailwind CSS
- **Default branch:** `main`
- **Visibility:** `PUBLIC`
- **License:** MIT License

## Repository Map

- `App.tsx`
- `LICENSE`
- `README.md`
- `SECURITY.md`
- `app.json`
- `babel.config.js`
- `demo`
- `docs`
- `server`
- `src`

## Quick Start

Use the commands that match the current project state:

```bash
npm install
npm run dev
npm start
npm run build
npm run lint
```

| Command | Purpose |
|---|---|
| `npm run dev` | tsx watch src/index.ts |
| `npm start` | node dist/index.js |
| `npm run build` | tsc |
| `npm run lint` | eslint . --ext .ts,.tsx |

## Operating Notes

- Keep real credentials out of the repository. Use local environment files, GitHub repository secrets, or the deployment platform secret manager.
- If a `.env.example` file exists, treat it as documentation only; never commit filled-in `.env` files.
- Before publishing screenshots, demos, or client examples, remove private names, internal paths, account IDs, and API endpoints.
- The `Repository Hygiene` workflow is intended as a lightweight guardrail, not a replacement for product-specific tests.

## Delivery Checklist

- [ ] README describes the user, business outcome, and operating boundary.
- [ ] Setup or preview commands are current.
- [ ] No real secrets, private user data, or machine-local state are tracked.
- [ ] Screenshots, demos, or sample outputs are safe to share publicly when the repository is public.
- [ ] Product-specific tests or smoke checks are documented before production use.

## Roadmap

- Tighten the fastest path from clone to useful demo.
- Add project-specific screenshots, sample outputs, or a short walkthrough where useful.
- Promote repeated manual steps into scripts, tests, or documented workflows.
- Keep security, privacy, and licensing boundaries explicit as the project evolves.

## Maintainer Notes

Maintained by [Tony Sheng](https://github.com/shengdabai). This README is written as a business-facing handoff: it should help a future collaborator, client, or reviewer understand why the repository exists, how to inspect it, and what must be true before it is reused or shipped.
