
# BidMetric - Real Estate Intelligence & Bidding Platform

## 1. Project Overview
BidMetric is a real-estate intelligence and bidding platform that provides users with data-driven property valuations and facilitates transparent, real-time bidding for buying and renting properties.

### Core Value Proposition
"This app helps buyers and sellers determine true market value by combining predictive AI with transparent real-time bidding using verified historical and infrastructure data."

## 2. Target Audience
*   **Primary Users:** Informed Buyers (Tech-savvy millennials, 28-40, urban professionals) & Individual Sellers (Resale homeowners).
*   **Secondary Users:** Small-scale investors.
*   **Excluded:** Luxury properties, raw land, commercial leasing.

## 3. Key Features (MVP)
1.  **Predictive Market Valuation Engine:** AI-driven "Fair Market Value" report based on historical trends and future infrastructure projects.
2.  **Real-Time Competitive Bidding System:** Transparent, live bidding with anonymized competition.
3.  **Locality & Infrastructure Insights Dashboard:** Visualizes price drivers (metro lines, flood zones).
4.  **Verified Listing & Ownership Ledger:** Sellers create digital asset profiles with verified ownership.

## 4. Monetization Strategy
*   **Model:** Transaction Fee (Brokerage) based on successful online bidding/offers.
*   **Trigger:** Revenue is generated only when a transaction is successfully finalized on the platform.
*   **Mechanism:** RevenueCat will handle the fee processing logic (adapted for transaction fees where possible, or used for future premium features).

## 5. Technology Stack
*   **Mobile (iOS):** Swift + SwiftUI
*   **Mobile (Android):** Kotlin + Jetpack Compose
*   **Web (Admin/Portals):** Next.js / React (as implied by current workspace)
*   **Backend:** Supabase (PostgreSQL Database, Authentication, Real-time subscriptions)
*   **Payments:** RevenueCat (for managing transaction entitlements/subscriptions)

## 6. Implementation Plan

### Phase 1: Foundation & Auth
*   Set up Supabase Project (Tables: Profiles, Properties, Auctions, Bids).
*   Implement Authentication (Email/Password, Social Login).
*   Basic App Shell (Tab Navigation: Home, Search, Profile).

### Phase 2: Core Data & Listings
*   Display Property Listings with details.
*   Integrate Historical Data (dummy data for MVP if live API not available).
*   Implement "Valuation Engine" (basic logic displaying price trends).

### Phase 3: Bidding Engine
*   Real-time bidding functionality using Supabase Realtime.
*   Auction timer and logic.
*   Bid validation (increment rules).

### Phase 4: Monetization & Payments
*   Integrate RevenueCat SDK.
*   Implement Logic: Unlock "Bidder Contact" or "Finalize Deal" only after fee acknowledgment.
*   Setup Paywalls/Entitlement checks (e.g. "Pro" features for advanced data).

### Phase 5: Polish & Launch
*   UI/UX Refinement (Glassmorphism, Animations).
*   Error Handling & Loading States.
*   Final QA.

## 7. Security Rules
1.  **Environment Variables:** All API keys (Supabase, RevenueCat) in `.env`.
2.  **RLS Policies:** Strict Row Level Security on all tables.
3.  **Input Validation:** Sanitize all user inputs.

## 8. Credentials (Reference)
*   **Supabase URL:** `https://iwgopllwmpesnpsnqlwn.supabase.co`
*   **Supabase Anon Key:** (Stored in .env)
*   **RevenueCat API Key:** (Stored in .env)
