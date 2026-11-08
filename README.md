# Assam Mental Health DSS

**Decision Support System for NESFIC 2026 Challenge NESFIC-D-29** — *Earlier Identification & Service Planning Support for Mental Health Needs*

Government of Assam · National Health Mission (NHM) · Health & Family Welfare Department

> Every month, thousands of citizens call the 24/7 Tele-MANAS helpline (14416), but over 94% of people who need to see a doctor in person never reach a clinic due to stigma, lack of money for bus fares, and long distances. This system spots distress early, routes mobile clinic vans fairly, and follows up with callers — under clinical supervision, with privacy and auditable controls.

**State management note (fixed in the redesign):** all screens share one `<ScenarioProvider>` (React context). Role, district, and audit state propagate across every view — verified by the test suite (`bunx vitest run`).

**Live prototype:** https://mentalhealthdss.vercel.app/  
**Challenge:** https://startup.assam.gov.in/nesfic26/problem-statements/nesfic-d-29  
**Deadline:** 25 November 2026

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Figtree Variable (OFL) · Client-side, zero-backend deployment (Vercel Edge).

---

## What it does

Three decision-support modules, one SHA-256 audited data layer, all client-side (no server round-trip, ~25 ms optimizer latency).

### Module 1 — Surveillance (earlier identification)

**Engine:** `src/engine/stateSurveillance.ts` — exact cumulative discrete Poisson tail probabilities.

- For each of 15 representative Assam districts (pilot framing: Cachar + Kamrup Metropolitan; statewide expansion after validation), computes $P(Y \ge y \mid \lambda) = 1 - \sum_{k=0}^{y-1} \frac{\lambda^k e^{-\lambda}}{k!}$ with Z-score thresholding ($Z \ge 2.5$, $p < 0.01$ = alert flag, not proof of crisis)
- Distinguish from the Python co-prototype's Gaussian $Z = (y-\lambda)/\sqrt{\lambda}$ approximation, which breaks down for small rural block counts ($n < 30$)
- Flood multiplier overlays (ASDMA) for monsoon catchments (Katigorah, Sonai, etc.)

**UI:** `StatePolicyView.tsx`. Per-district call volume, Poisson base, Z-score, p-value, flood status, disparity gap, and emergency allocation cards.

### Module 2 — Camp siting + drug logistics (resource planning)

**Engine:** `src/engine/solver.ts` — exact Two-Phase Primal Simplex for the capacitated p-median transportation LP:

$$\min Z = \sum_i \sum_j d_i \cdot c_{ij} \cdot x_{ij} + M \cdot \sum_i u_i$$

subject to demand conservation, facility capacity, and $P$ mobile vans. Baseline = headquarters-first (district town mandatory).

**Result on Cachar (8 blocks, 2 vans):** mean travel time 35.3 min vs 51.2 min baseline = **31.0% reduction** (synthetic travel matrix; see limitations).

**UI:** `DMHPCampPlanner.tsx`. Interactive fleet size (1–3 vans), flood weight toggle, live recomputation on block/facility edits.

**Drug logistics (from co-prototype, integrated):** `src/engine/drugPlanner.ts`

- Daily tablet burn-rate: `burn = (expected distress patients × usage rate × 4) / 30` with Haloperidol 0.12, Fluoxetine 0.35, Valproate 0.20
- Days of cover = stock ÷ burn; alert under 15 days, transfer recommendation from >30-day surplus blocks
- Table + red/amber/green badges per facility × drug

### Module 3 — Referral retention queue (follow-up planning)

**Model:** absorbing Markov Chain over the care funnel — 4 transient states (Intake, Specialist Escalation, eSanjeevani, DMHP) and 2 absorbing states (Verified Recovery A₁, Defaulted A₂). Fundamental matrix $N = (I - Q)^{-1}$, absorption $B = N \cdot R$ gives **3.2% verified recovery** (320 / 10,000) vs 96.8% attrition — the case for proactive follow-up.

**Queue order:** crisis flag → repeat callers → longest wait. **4 distinct outcomes** (funnel-inflation fix): *Callback completed*, *Referred to ASHA*, *Facility visit confirmed*, *Refused*. Only "Facility visit confirmed" closes as attended; callbacks/ASHA visits keep the referral open.

**UI:** `RetentionQueue.tsx`. Case rows show Case ID, block, language, facility — never caller hash. Counts under 10 suppressed (primary + secondary complementary suppression, DPDP 2023).

### Views (7) — one screen per decision

Overview (default) · Surveillance · Deployment · Pharmacy · Retention · Audit & Ingest · Method — selected via `?view=settings` deep links. Operators link to Method for formulas instead of embedded math drawers.

### Module 4 — Security, RBAC, audit & CSV ingest (governance)

**Engine:** `src/engine/auditLogger.ts` — SHA-256 hash chain. Each entry stores `SHA256(own contents ‖ previousHash)`. Tampering with any historical record breaks every subsequent hash; the Audit tab shows **"Chain Broken"**. Logs role switches, solver runs, outcome logging, CSV uploads, resets, and refused exports.

**UI:** `AuditLogView.tsx` (2 sub-tabs: hash chain + CSV ingestion).

- **RBAC (3 roles):** *State Director* (all districts, Audit + CSV upload, no case rows), *District Officer* (own district, no case rows, no Audit tab), *Counsellor* (own district case rows + 4 outcome buttons only). Role + district filter live in `Navbar.tsx` and drive every view. `RetentionQueue` enforces: non-Counsellor sees aggregates only.
- **CSV ingestion (State Director only):** `src/engine/csvIngest.ts` — row validation, rejection of malformed rows, salted SHA-256 pseudonymization of caller IDs/phone numbers before storage. Raw identifiers never retained.
- **Chat-style NL commands:** `NaturalLanguageBar.tsx` + `commandParser.ts` — e.g. *"Add 1 van"*, *"Set Katigorah calls to 420"*, *"Deploy to Cachar"* — instant state recomputation.

---

## How to run

```bash
# Install (Bun recommended; npm/yarn also work)
bun install

# Dev server
bun run dev        # http://localhost:5173

# Production build + preview
bun run build      # tsc -b && vite build  → dist/
bun run preview
```

No backend, no env vars, no database. State persists in `localStorage` (keys `amh_dss_*_v1`). Reset via Navbar or `resetToDefaults()`.

## Repository map

```
src/
  engine/
    types.ts                  # Block, Facility, DistrictDistress, ReferralRecord, UserRole,
                              # AuditLogEntry, DrugBurnMetrics, CsvUploadResult
    stateSurveillance.ts      # Poisson tail + Markov chain + 15-district table
    solver.ts                 # Two-Phase Simplex p-median LP (pure TS)
    cacharData.ts             # 8-block Cachar travel matrix + facilities
    referralData.ts           # synthetic referrals, secondary suppression
    auditLogger.ts            # SHA-256 hash chain (append / verify / simulate-tamper)
    drugPlanner.ts            # tablet burn-rate, days-of-cover, inter-block transfers
    csvIngest.ts              # CSV parse, validation, salted SHA-256 pseudonymization
    commandParser.ts          # NL command bar parser
    scenarioDataContext.ts    # useScenarioData() hook — blocks/facilities/districts/referrals/audit
  components/
    Navbar.tsx                # top bar, tab nav, role + district selectors, SHA-256 status
    NaturalLanguageBar.tsx    # chat-style scenario commands
    StatePolicyView.tsx       # Module 1 — surveillance
    DMHPCampPlanner.tsx       # Module 2 — van siting + drug table
    RetentionQueue.tsx        # Module 3 — retention queue (RBAC-gated)
    AuditLogView.tsx          # Module 4 — audit chain + CSV upload
  App.tsx                     # 4 tab states: state | planner | queue | audit
```

## Challenge alignment (NESFIC-D-29)

| Requirement | Where |
|---|---|
| Analyse authorised programme data, flag patterns for human follow-up | Module 1 (Poisson surveillance) + CSV ingest |
| Support referral, outreach, camp/resource planning | Modules 2 (Simplex siting + drug transfers) + 3 (retention queue) |
| Dashboards & summaries for programme managers | `StatePolicyView` + Markov funnel analysis |
| Privacy, role-based access, auditable use | Module 4 (SHA-256 chain, RBAC matrix, pseudonymization, small-cell suppression) |
| Decision-support only; no autonomous diagnosis/counselling | Every alert is a flag; outcomes logged by humans; no automated contact |

## Privacy & compliance

- Caller IDs are one-way SHA-256 hashed (salted for uploads); raw values never stored
- Counts < 10 suppressed (primary + secondary complementary suppression) in all tables/exports
- Non-consenting callers counted but never listed; no individual risk score anywhere
- DPDP Act 2023 + Mental Healthcare Act 2017 §23 (confidentiality) aligned; all actions hash-chained (see `auditLogger.ts`)
- No automated calls/messages; all follow-up is counsellor-initiated with recorded consent

## Limitations & next steps (honest)

- **Synthetic data:** all numbers are illustrative; the pipeline is real, the results are not findings. Needs Tele-MANAS pilot extract before any operational use.
- **Travel matrix:** Cachar block-to-block times are estimated, not road-network routing. Needs OSM/OSRM integration for production.
- **No SSO / server RBAC:** roles are client-side demo context, not server-enforced. Production target: FastAPI + PostgreSQL/PostGIS + Next.js on NIC Cloud with real SSO and server-side audit.
- **30-day rolling check stage** (present in blueprint) not yet implemented; weekly $Z$ on 7-day windows is.
- Possible next step: wire real Tele-MANAS CSV from the department (via Module 4 ingest) and validate the Poisson alerts against field-verified flood events.

## Team

**Saurav Sinha** and **Soumyodeep Das** — merging two prototypes into one deployable system: the React/TypeScript client-side optimizer (Poisson + Simplex + Markov + NL command bar) and the Python/SQLite reference with RBAC, hash-chain audit, and CSV pseudonymization.

---

*Prototype v2.0 — "what was built" road-tested against the co-author's docx (3 Nov 2026) and merged; see git history for the merge commit.*
