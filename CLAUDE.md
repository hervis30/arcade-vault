# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault ("Es una plataforma para jugar online y competir por la mayor cantidad de puntos") — an online arcade/gaming platform where players compete for points. Currently a freshly scaffolded Next.js app with no custom routes, components, or data layer yet.

## Commands

- `npm run dev` — start the dev server (also regenerates the `AGENTS.md` Next.js block above — see its note on committing that file)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config via `eslint-config-next`)

There is no test runner configured in this repo yet.

## Architecture

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`, no `tailwind.config.*`).
- App code lives under `app/`; path alias `@/*` maps to the repo root (`tsconfig.json`).
- **Before writing code, read the relevant guide under `node_modules/next/dist/docs/`** — this Next.js version has breaking changes vs. training data (see `AGENTS.md`).
- The README references a spec-driven workflow (`/spec`, `/spec-impl` commands from `Klerith/fernando-skills`, installed via `npx skills@latest add Klerith/fernando-skills`) but the skills are not yet installed in this repo.
