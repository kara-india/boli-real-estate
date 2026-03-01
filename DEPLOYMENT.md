# Deployment Guide - BidMetric V2

This guide outlines the production deployment process for the BidMetric Maharashtra platform.

## Infrastructure Stack
- **Frontend & APIs**: Vercel (Next.js 15 App Router)
- **Database & Auth**: Supabase Pro (PostgreSQL)
- **CI/CD**: GitHub Actions

## 1. Supabase Initialization
1. Create a new Supabase project in the chosen region (e.g., ap-south-1 Mumbai).
2. Configure **Row Level Security (RLS)** using `005_enable_rls.sql`.
3. Push the entire migration directory to the production database:
   ```bash
   npx supabase link --project-ref [YOUR_PROJECT_REF]
   npx supabase db push
   ```
4. Verify all 16+ tables (including `builders`, `leads`, `billing_events`, etc.) are created successfully.

## 2. Environment Variables Configuration
On Vercel, set the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Production Supabase API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Production Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for backend webhooks/admin scripts
- `RAZORPAY_KEY_ID`: Production Razorpay ID
- `RAZORPAY_KEY_SECRET`: Production Razorpay Secret

## 3. Deployment Steps
1. Push your changes to the `main` branch.
2. The GitHub Actions CI pipeline will trigger automatically, running `npm run lint`, `vitest run`, and `npm run build`.
3. If the CI passes, Vercel will automatically deploy the latest changes to the production domain.
4. Verify the 4 key portals exist and are accessible:
   - `/builder`
   - `/buyer`
   - `/admin`
   - `/ops`

## 4. Post-Deployment Verification
1. Attempt to register a new builder using a valid RERA number.
2. Complete the end-to-end "Lead Reveal" test to verify Wallet deductions.
3. Validate anti-circumvention logs are created in `audit_logs` appropriately.
