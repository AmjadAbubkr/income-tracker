# Phase 9: Release Safety and Data Correctness - Discussion Log

> **Audit trail only.** Decisions are captured in `09-CONTEXT.md`.

**Date:** 2026-08-12
**Phase:** 9-release-safety-and-data-correctness
**Mode:** Automatic decisions approved by the user when they accepted the
recommended two-phase remediation sequence.

## Exact money representation

| Option | Description | Selected |
|--------|-------------|----------|
| Integer minor units | Exact persisted values with no floating-point arithmetic | Yes |
| Floating-point values | Keep current implementation | No |

## Local profile safety

| Option | Description | Selected |
|--------|-------------|----------|
| Local session token and scoped caches | Preserves normal refresh behavior and stops bare-ID restoration | Yes |
| Bare localStorage user ID | Current behavior | No |

## Financial writes

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-store IndexedDB transactions | Commit related financial records together | Yes |
| Independent collection writes | Current behavior | No |

## Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Strict typecheck and focused regression tests | Required release gate | Yes |
| Manual-only verification | Current behavior | No |

## Deferred Ideas

Remaining user-facing v1 workflow gaps are deferred to Phase 10.
