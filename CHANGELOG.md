# Changelog

All notable changes to the BidMetric project will be documented in this file.

## [Unreleased] - 2026-03-01
### Added
- **Stage 1 (Backend Architecture):**
  - Added `018_bidmetric_backend_architecture.sql` for real-estate specific schema: `builders`, `builder_projects`, `project_inventory`, `site_visits`, `assisted_closings`, `loan_attachments`, `billing_events`, `anti_leak_registry`.
  - Added Zod schemas for validation of backend APIs via `lib/types/bidmetric.ts`.
  - Added Backend Services (`LeadService`, `BillingService`) with state machines.
  - Added API route `POST /api/leads/[id]/reveal` for revealing builder leads and triggering wallet charges.
  - Added Vitest integration test `backend.test.ts` for end-to-end mock capability.

- **Stage 2 (Frontend Architecture):**
  - Added Builder Portal Dashboard at `/builder`.
  - Added Buyer Portal Dashboard at `/buyer`.
  - Added Admin metrics Dashboard at `/admin`.
  - Added Internal Ops Dashboard at `/ops` for Cab + Biometric tracking.

- **Stage 3 (Production Readiness):**
  - Setup GitHub Actions CI Pipeline (`.github/workflows/ci.yml`).
  - Added `DEPLOYMENT.md`.
  - Added this `CHANGELOG.md`.

### Changed
- Refactored `MASTER_IMPLEMENTATION_BLUEPRINT.md` to reflect the multi-stage deployment of the above portals and schema.
- Integrated Zod for strict type safety in Next.js Server App Router endpoints instead of basic validation.
