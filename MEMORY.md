# Assam Mental Health Decision Support System (AMH-DSS) — Project Memory

## Overview
Operational Decision Support System for Government of Assam — National Health Mission (NHM) & Health & Family Welfare Department challenge: "Earlier Identification & Service Planning Support for Mental Health Needs" (NESFIC 2026, closes 10 Nov 2026).

## Key URLs & Deliverables
- **Live Vercel Application:** https://mentalhealthdss.vercel.app/
- **GitHub Repository:** https://github.com/sauravsz/assam-mental-health-dss
- **Proposal Document:** `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/Assam NHM Mental Health Decision Support — USPR Solution Proposal.pdf` (11 pages, compiled from `main.typ` in USPR 12-section standard)
- **Student & Faculty Guide:** `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/Assam NHM Mental Health DSS — Student & Faculty Master Guide.pdf` (8 pages, mathematical foundations & viva defense script)
- **Benchmark Suite:** `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/test_suite.py`

## Architecture & Mathematical Invariants
- **Engine 1 (Surveillance):** Spatio-temporal Poisson anomaly detection ($Z > 2.5$) with flood crisis covariates (Barak/Brahmaputra). Target refinement: Exact Poisson tail probability $P(Y \ge y \mid \lambda)$ for sparse rural cells ($\lambda < 10$).
- **Engine 2 (Planning):** Capacitated $p$-Median Facility Location Mixed-Integer Linear Program ($\min \sum d_i c_{ij} x_{ij} + M \sum u_i$). Proven 31.0% travel-time reduction in Cachar District (35.3 min vs 51.2 min baseline). Target refinement: Exact Hitchcock-Koopmans transportation LP assignment over greedy index ordering.
- **Engine 3 (Retention):** Closed-loop care tracking for stalled referrals ($>14$ days) with verified statutory consent and human-in-the-loop counsellors (zero robocalls). Target refinement: Absorbing Markov Chain transition modeling.
- **Compliance:** MHCA 2017 §23, DPDP Act 2023, SHA-256 pseudonymization, small-cell suppression ($n < 10$). Target refinement: Complementary secondary suppression against algebraic subtraction leaks.
- **Frontend Design:** Expo design system (Inter typography, clean white canvas, hairline borders, plain-English human framing, expandable math drawers).

## Current State & Next Steps
- Status: Fully operational, mobile-optimized, deployed on Vercel edge, repository synchronized with GitHub.
- Immediate Next Actions:
  1. Implement exact Transportation Simplex solver in `src/engine/solver.ts` to replace greedy assignment tie-breaking.
  2. Implement exact cumulative Poisson tail probabilities in `src/engine/stateSurveillance.ts`.
  3. Add secondary complementary cell suppression in `src/engine/referralData.ts`.
  4. Synchronize mathematical write-ups in proposal and faculty guide PDFs before meeting with advisor.
