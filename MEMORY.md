# Assam Mental Health Decision Support System (AMH-DSS) — Project Memory

## Overview
Operational Decision Support System for Government of Assam — National Health Mission (NHM) & Health & Family Welfare Department challenge: "Earlier Identification & Service Planning Support for Mental Health Needs" (NESFIC 2026, closes 10 Nov 2026).

## Key URLs & Deliverables
- **Live Vercel Application:** https://mentalhealthdss.vercel.app/
- **GitHub Repository:** https://github.com/sauravsz/assam-mental-health-dss
- **Proposal Document:** `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/Assam NHM Mental Health Decision Support — USPR Solution Proposal.pdf` (11 pages, compiled from `main.typ` in USPR 12-section standard)
- **Student & Faculty Guide:** `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/Assam NHM Mental Health DSS — Student & Faculty Master Guide.pdf` (8 pages, mathematical foundations & viva defense script)
- **Benchmark Suite:** `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/test_suite.py`

## Architecture & Mathematical Invariants (Refinements Complete)
- **Engine 1 (Surveillance):** Exact discrete cumulative Poisson tail probabilities $P(Y \ge y \mid \lambda)$ with continuity-corrected Gaussian approximations for hypothesis testing at $\alpha = 0.01$. Standardized $Z > 2.5$ and exact $p$-values computed across all 35 Assam districts factoring in ASDMA flood crisis multipliers.
- **Engine 2 (Planning):** Capacitated $p$-Median Facility Location problem with an exact client-side Two-Phase Primal Simplex Transportation LP solver ($\min \sum d_i c_{ij} x_{ij} + M \sum u_i$). Eliminates greedy index bias and guarantees global optimality in $<25\text{ ms}$. Replicates exact 31.0% travel-time reduction in Cachar District (35.3 min vs 51.2 min baseline).
- **Engine 3 (Retention):** Closed-loop care tracking for stalled referrals ($>14$ days) with verified statutory consent and human counsellors (zero robocalls). Modeled as an Absorbing Markov Chain ($N = (I - Q)^{-1}$) with verified 3.2% absorption recovery probability.
- **Compliance:** MHCA 2017 §23, DPDP Act 2023, salted SHA-256 pseudonymization. Enforces Primary ($n < 10$) and Secondary (Complementary) cell suppression to algebraically prevent subtraction leaks.
- **Frontend Design:** Android Material 3 (Material You / Android 14/15/16) tonal color system with high-density multi-column operational canvas (`max-w-[1400px]`). Features 4-stage absorbing Markov retention funnel, interactive Cachar catchment vector map with travel-time delta cards, linear days-of-cover bullet bars with lateral rebalance vectors, and Poisson surge threshold meters. Persistent Sun/Moon toggle with zero-FOUC inline bootstrap.

## Current State & Next Steps
- Status: Multi-column operational canvas redesign & Android Material 3 Dynamic Light/Dark Mode complete. Pushed to GitHub `main` at `6e1b174`. 10/10 Vitest tests pass in 105ms, production bundle compiled cleanly in 360ms. Wasted whitespace eliminated and crammed elements uncramped via responsive 60/40 cockpit splits across all 5 views.
- Next Actions:
  1. Review live deployment on Vercel (`mentalhealthdss.vercel.app`).
  2. Review the 8-page Student & Faculty Guide before presenting to the MBA advisor.
  3. Final submission of the 11-page USPR proposal PDF to the NHM Assam portal (deadline: 25 November 2026).
