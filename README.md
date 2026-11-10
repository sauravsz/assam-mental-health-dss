# Assam Mental Health Decision Support System (AMH-DSS)

**Operational Decision Support System for Government of Assam · National Health Mission (NHM) & Health & Family Welfare Department**  
**Challenge:** NESFIC 2026 · Stream 1 · Challenge **NESFIC-D-29** — *Earlier Identification & Service Planning Support for Mental Health Needs*  
**Application Window:** Closes 25 November 2026 · ₹40L Grant Stream  
**Team:** Saurav Sinha & Soumyodeep Das (Assam University, Silchar)  

---

## Deliverables & Quick Links

- **Live Operational Prototype:** [https://mentalhealthdss.vercel.app/](https://mentalhealthdss.vercel.app/)
- **GitHub Repository:** [https://github.com/sauravsz/assam-mental-health-dss](https://github.com/sauravsz/assam-mental-health-dss)
- **Official Problem Statement:** [NESFIC-D-29 Portal](https://startup.assam.gov.in/nesfic26/problem-statements/nesfic-d-29)
- **Solution Proposal Document:** 11-page formal proposal compiled from `main.typ` in the 12-section USPR standard (`Assam NHM Mental Health Decision Support — USPR Solution Proposal.pdf`)
- **Student & Faculty Master Guide:** 8-page viva defense & mathematical foundations guide (`Assam NHM Mental Health DSS — Student & Faculty Master Guide.pdf`)

---

## Executive Summary

Every month, thousands of citizens call Assam's 24/7 Tele-MANAS helpline (14416). However, over **94% of callers who require in-person clinical psychiatric or psychotherapeutic evaluation never reach a facility** due to transport poverty, social stigma, and long transit times across flood-prone riverine terrains.

The Assam Mental Health Decision Support System (AMH-DSS) bridges this operational gap through three client-side algorithmic engines governed by a cryptographically verifiable SHA-256 audit ledger:
1. **Surveillance Engine:** Discrete Poisson tail anomaly detection factoring in Assam State Disaster Management Authority (ASDMA) flood multipliers.
2. **Resource Planning Engine:** Capacitated $p$-Median Linear Program solved client-side via Two-Phase Primal Simplex in $<25\text{ ms}$, achieving a **31.0% travel-time reduction** in Cachar District.
3. **Care Retention Engine:** Absorbing Markov Chain care-funnel analyzer with closed-loop human counsellor check-ins under Section 23 of the Mental Healthcare Act 2017.

The entire system executes 100% client-side in the browser with **zero backend round-trip latency**, zero persistent cloud storage of patient health information, and full compliance with the Digital Personal Data Protection (DPDP) Act 2023.

---

## Architecture & Core Modules

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AMH-DSS SHARED REACT CONTEXT                          │
│          <ScenarioProvider> (Role, District Filter, Theme, Audit Chain)          │
└────────┬───────────────────┬───────────────────┬───────────────────┬────────────┘
         │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   SURVEILLANCE  │ │    VAN SITING   │ │    PHARMACY     │ │    RETENTION    │
│  Exact Poisson  │ │ Two-Phase LP    │ │ Tablet Burn     │ │ Absorbing Markov│
│  Tail P(Y ≥ y)  │ │ Simplex Solver  │ │ Days-of-Cover   │ │ Funnel N=(I-Q)⁻¹│
│  Z > 2.5 Alert  │ │ 31% Time Cut    │ │ Lateral Orders  │ │ 3.2% Recovery   │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │                   │
         └───────────────────┼───────────────────┴───────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE & STATUTORY PRIVACY LAYER                         │
│  - Salted SHA-256 Caller Pseudonymization on Ingest (WebCrypto API)             │
│  - Genesis Block Hash Chain: c1055f1808600ae5788767db1beb2edebe2fc23c4d876...  │
│  - Primary (n < 10) & Complementary Secondary Small-Cell Suppression            │
│  - MHCA 2017 §23 Confidentiality & DPDP Act 2023 Statutory Consent Logging     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Module 1 — Surveillance (Earlier Identification)
- **Engine:** `src/engine/stateSurveillance.ts`
- **Mathematical Formulation:** Evaluates the exact cumulative discrete Poisson tail probability across 35 Assam districts:
  $$P(Y \ge y \mid \lambda) = 1 - \sum_{k=0}^{y-1} \frac{\lambda^k e^{-\lambda}}{k!}$$
- **Statistical Significance:** Continuity-corrected Gaussian Z-scores with $Z \ge 2.5$ and $p < 0.01$ significance thresholds prevent false alarms in small rural block counts ($n < 30$), where uncorrected Gaussian approximations break down.
- **Crisis Multipliers:** Integrates ASDMA seasonal flood multipliers ($1.5\times$ to $2.5\times$) for riverine catchments (e.g., Katigorah, Sonai, Dhemaji, Dhubri).

### Module 2 — Camp Siting & Logistics Optimization
- **Engine:** `src/engine/solver.ts`
- **Mathematical Formulation:** Exact client-side Two-Phase Primal Simplex solver for the Capacitated $p$-Median Transportation Linear Program:
  $$\min Z = \sum_{i \in I} \sum_{j \in J} d_i \cdot c_{ij} \cdot x_{ij} + M \sum_{i \in I} u_i$$
  subject to:
  $$\sum_{j \in J} x_{ij} + u_i = 1 \quad \forall i \in I$$
  $$\sum_{i \in I} d_i x_{ij} \le K_j y_j \quad \forall j \in J$$
  $$\sum_{j \in J} y_j = P, \quad y_j \in \{0, 1\}, \quad x_{ij} \ge 0, \quad u_i \ge 0$$
- **Benchmark Performance (Cachar Pilot):** 8 rural blocks, 5 candidate clinic hubs, $P = 2$ mobile health vans. Solves globally in $<25\text{ ms}$, dropping mean patient travel time from **51.2 minutes** (conventional headquarters-first baseline) down to **35.3 minutes** (**31.0% reduction**).
- **Interactive Catchment Vectors:** Direct visual mapping of block-to-facility allocation lines and van nodes.

### Module 3 — Emergency Pharmaceutical Logistics
- **Engine:** `src/engine/drugPlanner.ts`
- **Formulation:** Evaluates facility tablet consumption rates based on expected block distress rates:
  $$\text{Daily Burn} = \frac{\text{Distress Patients} \times \text{Usage Rate} \times 4}{30}$$
  Standard drug usage rates: Haloperidol (0.12), Fluoxetine (0.35), Sodium Valproate (0.20).
- **Days of Cover:** Linear bullet bars track stock levels against 15-day critical redline markers and 30-day target buffers.
- **Lateral Rebalancing:** One-click automated transfer engine matches donor facilities ($>30$ days cover) with deficit clinics ($<15$ days), strictly preserving safety buffer thresholds.

### Module 4 — Care Retention Queue & Follow-up Navigation
- **Engine:** `src/engine/referralData.ts` & `src/components/RetentionQueue.tsx`
- **Markov Model:** Formulated as an Absorbing Markov Chain with 4 transient states (Intake, Specialist Escalation, eSanjeevani, DMHP Camp) and 2 absorbing states (Verified Recovery $A_1$, Defaulted $A_2$). Fundamental matrix $N = (I - Q)^{-1}$ proves that without proactive navigation, **only 3.2% of callers reach verified recovery**, exposing the 96.8% attrition cliff.
- **Counsellor Priority Queue:** Surfaces stalled referrals waiting $>14$ days, sorted by crisis severity and repeat contact frequency.
- **Clinical Governance:** Mandates human-in-the-loop calls with recorded statutory consent. Robocalls and automated dialers are architecturally prohibited under MHCA 2017 §23.

### Module 5 — Cryptographic Governance & DPDP Compliance
- **Engine:** `src/engine/auditLogger.ts` & `src/engine/csvIngest.ts`
- **SHA-256 Ledger:** Immutable forward-linked cryptographic block chain:
  $$H_k = \text{SHA-256}(R_k \parallel H_{k-1})$$
  Genesis Block: `c1055f1808600ae5788767db1beb2edebe2fc23c4d876bed0cb8386e90a8ec9d`. Any retrospective record tampering flips ledger state from `OK` to `BROKEN` with exact block-height attribution.
- **Data Minimization:** Tele-MANAS caller phone numbers and names are pseudonymized via salted SHA-256 hashes immediately upon CSV ingestion. Raw identifiers are never retained.
- **Small-Cell Suppression:** Enforces Primary ($n < 10$) and Secondary (Complementary) cell suppression on all clinical aggregate tables to algebraically prevent subtraction attacks.

---

## Interactive Features & Evaluator Tools

### 1. Evaluator Guided Tour ("Jury Mode")
Located in the navigation bar (`EvaluatorTour.tsx`), this modal guides reviewers through the 4 core evaluation criteria of NESFIC-D-29:
- **Phase 1 (Surveillance):** Injects a 2.5x flood shock into Cachar, taking calls to 680 with Poisson $Z = 3.65$ ($p < 0.0001$).
- **Phase 2 (Optimization):** Triggers client-side Two-Phase Simplex LP to prove the 31.0% travel-time drop (35.3 min vs 51.2 min).
- **Phase 3 (Retention):** Highlights the 4-stage Markov retention funnel and initiates a counsellor follow-up check-in.
- **Phase 4 (Governance):** Verifies the Genesis SHA-256 chain and simulates an instant tamper detection event.
- Includes 10-second auto-play, manual step jumping, and direct mathematical briefings.

### 2. Macro Disaster Scenario Presets
One-click stress testing embedded in `NaturalLanguageBar.tsx` (`scenarioPresets.ts`):
- **Post-Monsoon Baseline:** Standard statewide equilibrium across all 35 Assam districts.
- **Barak Valley Flood Shock ($Z = 3.65$):** Severe Barak River inundation in Cachar, Karimganj, and Hailakandi with Fluoxetine stockouts.
- **Brahmaputra Riverine Crisis ($Z = 2.92$):** Riverine char flooding in Dhubri (420 calls) and Lakhimpur.
- **Festival Anxiety Surge ($Z = 3.84$):** Urban distress peak in Kamrup Metropolitan (620 calls) and Dibrugarh.

### 3. Official NHM Executive Decision Memo (Print / PDF)
Clicking the **Memo** button launches an institutional Government of Assam Decision Brief (`ExecutiveDecisionMemo.tsx`):
- Document Reference: `NHM-ASSAM/MHDSS/2026/OP-01`.
- Synthesizes 4 directive tables: Active Poisson Alerts, Authorized Mobile Camp Sites, Lateral Drug Rebalancing Orders, and Stalled Care Queues.
- Integrated `@media print` A4 stylesheet: clicking "Print / Save PDF" automatically suppresses navbars, command bars, and buttons to render a formal 2-page black-and-white policy memo with authority signature blocks.

---

## Design System: Android Material 3 (Material You)

The user interface uses Google's latest **Android Material 3** expressive tonal palette:
- **Light Mode:** Dynamic surface `#FFFFFF`, background `#F8F9FA`, primary `#00639B`, on-surface `#191C1E`.
- **Dark Mode:** Deep slate surface `#16191E`, background `#101317`, primary `#9BCAFF`, on-surface `#E1E2E8`.
- **Multi-Column Command Canvas:** Expanded viewport (`max-w-[1400px]`) utilizing 60/40 balanced cockpit splits that eliminate vertical scrolling and cramped layouts.
- **Persistence & Zero FOUC:** Theme preference stored in `localStorage` with zero-flash early inline script execution.

---

## 7 Application Views

| View | Deep Link | Purpose |
|---|---|---|
| **Overview** | `?view=overview` | Executive KPI ribbon, Poisson surge alerts, active lateral transfers, and quick-action launcher |
| **Surveillance** | `?view=state` | 35-district Poisson monitoring leaderboard, ASDMA flood crisis toggles, and zone breakdowns |
| **Van Siting** | `?view=planner` | Cachar DMHP camp optimizer, Two-Phase Simplex LP solver, catchment vectors, and travel-time cards |
| **Pharmacy** | `?view=pharmacy` | 15-day redline stock cover inventory, linear bullet graphs, and bilateral transfer dispatch simulator |
| **Retention** | `?view=queue` | 4-stage Markov funnel, RBAC-enforced stalled referral queue ($>14$ days), and consent check-in modal |
| **Audit Log** | `?view=audit` | SHA-256 block chain inspection, tamper-evidence simulation, and salted Tele-MANAS CSV data ingestion |
| **Method** | `?view=method` | Mathematical formulations, LP simplex tableau equations, Markov matrices, and statutory references |

---

## Repository Map

```
assam-mental-health-dss/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                # Header bar, RBAC role, district selector, SHA-256 pill, M3 theme toggle
│   │   ├── NaturalLanguageBar.tsx    # NLP command input, 4 macro disaster presets, quick-tour launcher
│   │   ├── OverviewView.tsx          # Executive cockpit, Poisson threshold bars, quick transfers
│   │   ├── StatePolicyView.tsx       # Statewide Poisson surveillance leaderboard & flood overlays
│   │   ├── DMHPCampPlanner.tsx       # Cachar 2-Phase Simplex LP optimizer & catchment vector map
│   │   ├── PharmacyView.tsx          # Drug days-of-cover bullet bars & bilateral lateral transfers
│   │   ├── RetentionQueue.tsx        # 4-stage Markov funnel & RBAC-gated counsellor follow-up table
│   │   ├── AuditLogView.tsx          # Cryptographic SHA-256 ledger & salted CSV ingestion engine
│   │   ├── MethodView.tsx            # Complete mathematical proofs, matrices, and statutory standards
│   │   ├── EvaluatorTour.tsx         # 4-phase interactive jury walkthrough with auto-play
│   │   └── ExecutiveDecisionMemo.tsx # Print-ready Government of Assam Decision Memo (@media print)
│   ├── engine/
│   │   ├── types.ts                  # Core TypeScript interfaces (Block, Facility, Referral, Audit, Drug)
│   │   ├── stateSurveillance.ts      # Discrete Poisson tail probabilities, Z-scores, and Markov matrices
│   │   ├── solver.ts                 # Two-Phase Primal Simplex LP transportation optimizer (pure TS)
│   │   ├── cacharData.ts             # Cachar 8-block travel-time matrix, clinic hubs, and coordinates
│   │   ├── drugPlanner.ts            # Daily tablet burn-rate model, days of cover, and transfer recommendations
│   │   ├── referralData.ts           # Synthetic Tele-MANAS referral generator & small-cell suppression
│   │   ├── auditLogger.ts            # SHA-256 cryptographic hash chain, verification, and tamper simulation
│   │   ├── csvIngest.ts              # Tele-MANAS CSV validator & salted WebCrypto pseudonymization
│   │   ├── scenarioPresets.ts        # 4 macro disaster stress-test scenarios (Baseline, Flood, Upper Assam, Festival)
│   │   ├── commandParser.ts          # Natural language scenario command interpreter
│   │   ├── scenarioDataContext.tsx   # Global <ScenarioProvider> React context with local persistence
│   │   └── engine.test.ts            # 13-test Vitest verification suite (Poisson, Simplex, SHA-256, Presets)
│   ├── App.tsx                       # Root view router, modal states, and layout container
│   ├── index.css                     # Tailwind CSS v4, Android M3 tonal tokens, and @media print styles
│   └── main.tsx                      # Vite React 19 application entrypoint
├── test_suite.py                     # Python algorithmic benchmark suite
├── package.json                      # Bun / Vite / React 19 dependencies
├── vite.config.ts                    # Vite configuration
└── README.md                         # Project documentation
```

---

## Verification & Testing

The test suite runs with sub-200ms execution latency:

```bash
# Run Vitest algorithmic test suite
bun test

# Production build (TypeScript validation + Vite bundle)
bun run build

# Local development server
bun run dev
```

### Test Suite Coverage (13 Pass · 0 Fail)
- **Poisson Surveillance:** Verifies boundary conditions ($y=0 \implies p=1.0$), baseline stability ($y = \lambda \implies p \approx 0.50$), and significant surges ($y \gg \lambda \implies Z > 2.5, p < 0.001$).
- **Two-Phase Simplex LP:** Proves global optimality over baseline ($Z^* \le Z_{\text{baseline}}$), full demand conservation across all 8 blocks, and exact active facility sizing ($|Y| = P$).
- **Cryptographic Audit Chain:** Verifies genuine Genesis SHA-256 hash, valid hash linkage across sequential mutations, and instant tampering detection via `simulateTamper()`.
- **Scenario Presets:** Confirms mathematical consistency of all 4 macro disaster scenarios.

---

## Statutory & Ethical Compliance

- **Mental Healthcare Act 2017 (MHCA §23):** Complete confidentiality of mental health records. No automated robocalling, interactive voice response (IVR) spam, or unverified contact. All follow-ups are human counsellor-initiated with explicit patient consent.
- **Digital Personal Data Protection Act 2023 (DPDP §6):** Data minimization enforced client-side. Phone numbers and names are salted and hashed upon ingestion; raw identifiers are never persisted.
- **Small-Cell Suppression Standard:** Any reporting cell with fewer than 10 cases ($n < 10$) is masked, and complementary row/column cells are suppressed to prevent algebraic reconstruction attacks.

---

## Limitations & Production Roadmap

1. **Synthetic Pilot Data:** Call distributions and travel times reflect representative pilot estimates for Cachar District and Assam's 35 districts. Full field deployment requires linking authorized Tele-MANAS call logs through the Module 4 CSV ingestion pipeline.
2. **Road Network Routing:** The current travel-time matrix uses empirical block-to-block transit estimates. The production roadmap integrates OpenStreetMap / OSRM matrix routing with live ASDMA flood road blockage feeds.
3. **Institutional Deployment:** Designed for zero-dependency client-side execution on Vercel Edge. Production enterprise rollout targets the National Informatics Centre (NIC) MeghRaj Cloud with FastAPI / PostgreSQL (PostGIS) and single sign-on (SSO).

---

## Authors

- **Saurav Sinha** — [GitHub](https://github.com/sauravsz) · Assam University, Silchar  
- **Soumyodeep Das** — Assam University, Silchar  

*Developed for the Government of Assam National Health Mission (NHM) & Health & Family Welfare Department NESFIC 2026 Innovation Challenge (Stream 1 · NESFIC-D-29).*
