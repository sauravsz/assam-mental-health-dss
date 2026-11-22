# Assam Mental Health Decision Support System (AMH-DSS) — Project Memory

## Overview
Operational Decision Support System for Government of Assam — National Health Mission (NHM) & Health & Family Welfare Department challenge: "Earlier Identification & Service Planning Support for Mental Health Needs" (NESFIC 2026, Challenge NESFIC-D-29).
- **Submission Status:** Formally SUBMITTED on 22 Nov 2026 (Application ID: `NESFIC-S1-EAA29641`).
- **Team:** Soumyodeep Das (Lead Applicant / Operations Lead) & Saurav Sinha (Member 2 / Technical & Analytics Lead), Assam University, Silchar.

## Key URLs & Deliverables
- **Live Vercel Application:** https://mhdss.vercel.app/
- **GitHub Repository:** https://github.com/sauravsz/assam-mental-health-dss
- **Proposal Document:** `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/Assam NHM Mental Health Decision Support — USPR Solution Proposal.pdf` (11 pages, formal 12-section USPR standard with production UI screenshots, vector architecture diagram, Cachar benchmark, and 15/15 unit test results).
- **Component Guide:** `/Users/sz/AIOS/Github Repos/assam-mental-health-dss/docs/AMH-DSS_Component_Guide.pdf` (17 pages, illustrated component walkthrough with framed UI screenshots).
- **Team Roles & Defense Guide:** `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/AMH-DSS_Team_Roles_Defense_Guide.pdf` (5 pages, technical vs operations ownership matrix, jury defense Q&A, and 10-minute presentation choreography).
- **Submitted Portal Answers:** `docs/NESFIC_2026_Application_Form_Answers.md` (all 12 fields sanitized with zero markup `<` or `>` characters).

## Architecture & Mathematical Invariants
- **Engine 1 (Surveillance):** Exact discrete cumulative Poisson tail probabilities $P(Y \ge y \mid \lambda)$ with continuity-corrected Gaussian residual $Z$-scores ($Z \ge 2.50, p < 0.01$). Factored with ASDMA seasonal monsoon flood multipliers ($1.5\times$ to $2.5\times$).
- **Engine 2 (Planning):** Capacitated $p$-Median Facility Location problem with an exact client-side Two-Phase Primal Simplex Transportation LP solver ($\min \sum d_i c_{ij} x_{ij} + M \sum u_i$). Solves globally in $<25\text{ ms}$ in browser thread, replicating exact 31.0% travel-time reduction in Cachar District (35.3 min vs 51.2 min baseline).
- **Engine 3 (Retention):** Closed-loop care tracking for stalled referrals ($>14$ days) with verified statutory consent and certified human counsellors (zero automated robocalls). Modeled as an Absorbing Markov Chain ($N = (I - Q)^{-1}$).
- **Governance & Security:** MHCA 2017 §23, DPDP Act 2023, salted SHA-256 caller pseudonymization. WebCrypto forward-linked audit chain ($H_k = \text{SHA-256}(R_k \parallel H_{k-1})$) anchored by Genesis block `c1055f18...`. Primary ($n < 10$) and Secondary Complementary small-cell suppression.
- **Frontend Core:** React 19, TypeScript, Vite, Tailwind CSS v4, Google Android Material 3 tonal elevation system. Features interactive SVG Assam Choropleth Map, Cachar catchment vector map, reactive bilateral pharmacy rebalancer, 5-stage Patient Journey Modal, and print-ready A4 Decision Memo.

## Current State & Next Steps
- Status: Application formally submitted to NESFIC 2026. Codebase production-stable (15/15 Vitest tests pass in ~500ms, production build in ~800ms).
- Next Actions (Evaluation & Pilot Preparation Phase):
  1. Monitor registered email (`sauravsinhasz14@gmail.com`) and portal dashboard for shortlist announcements or evaluation interview scheduling.
  2. Finalize formal academic faculty endorsement letters from Assam University mentors in Health Economics / Management.
  3. Record a clean, local 3-minute screen capture walkthrough of the live platform as an offline presentation backup.
  4. Prepare preliminary GIS distance matrix expansion data structures for Kamrup Metropolitan.
