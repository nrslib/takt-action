# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TAKT Action is a GitHub Action that provides AI-powered PR review and task automation using [TAKT](https://github.com/nrslib/takt). It runs as a `node20` action, triggered by `pull_request` and `issue_comment` events.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | TypeScript build |
| `npm run package` | Bundle with ncc for distribution |
| `npm run test` | Run all tests |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint |
| `npm run all` | Lint → Build → Test → Package |
| `npx vitest run src/__tests__/context.test.ts` | Run single test file |

## Architecture

```
action.yml (GitHub Action definition)
  → dist/index.js (ncc-bundled entrypoint)
    → src/index.ts (entrypoint)
      → src/context.ts (GitHub context helpers: PR diff, comment parsing)
      → src/runner.ts (takt CLI execution)
      → src/review.ts (Review output parsing, PR comment posting)
```

### Event Flow

1. **pull_request** (opened/synchronize) → Resolve PR number → Fetch diff → Run takt review piece → Post inline comments
2. **issue_comment** (created, `@takt` mention) → Parse comment → Run takt piece → Reply with results

## Directory Structure

```
takt-action/
├── .github/workflows/ci.yml   # CI pipeline
├── src/
│   ├── index.ts                # Action entrypoint
│   ├── context.ts              # GitHub context helpers
│   ├── review.ts               # Review parsing & posting
│   └── __tests__/
│       └── context.test.ts     # Tests
├── dist/                       # ncc bundle (committed for Action distribution)
├── action.yml                  # GitHub Action definition
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── eslint.config.js
```

## Issue Roadmap

| # | Title | Status |
|---|-------|--------|
| #1 | PR diff をレビューコンテキストとして自動取得 | Skeleton implemented |
| #2 | レビュー結果を PR インラインコメントとして投稿 | Skeleton implemented |
| #3 | GitHub App として配布 | Planned |
| #4 | PR コメントでの対話的レビュー（@takt メンション） | Skeleton implemented |
| #5 | PR コメントで追加指示→コード変更自動反映 | Skeleton implemented |

## TAKT CLI Notes

- takt v0.5.0+ で `--workflow` は `--piece` に統一
- パイプラインモード: `takt --pipeline --issue <N> --piece <name> --repo <owner/repo>`
- 主要オプション: `--piece`, `--model`, `--provider`, `--quiet`, `--auto-pr`, `--skip-git`

## TypeScript Notes

- ESM modules with `.js` extensions in imports
- Strict TypeScript with `noUncheckedIndexedAccess`
- Bundle with `@vercel/ncc` for GitHub Action distribution (`dist/` is committed)
- `dist/` must be regenerated via `npm run package` before release
