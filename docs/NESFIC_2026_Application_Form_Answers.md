# NESFIC 2026 Portal Submission: Copy-Paste Reference Guide

**Challenge:** Stream 1 · Challenge **NESFIC-D-29** (*Earlier Identification & Service Planning Support for Mental Health Needs*)
**Application Window:** Closes 25 November 2026
**Team:** Soumyodeep Das (Lead) & Saurav Sinha (Assam University, Silchar)

---

## 1. PROBLEM UNDERSTANDING & USER WORKFLOW

*Word Count:* **305 / 500 words**

```text
The National Health Mission (NHM) Assam operates the 24/7 Tele-MANAS (14416) helpline. While inbound calls are substantial across Assam's 35 districts, mental healthcare administration faces three critical systemic bottlenecks:

1. Passive Utilization & Stigma: Rural, riverine (char), and tea-garden communities face transport poverty, social stigma, and low awareness, deterring individuals from calling until illnesses become acute crises.
2. The Referral Attrition Cliff: Over 94% of callers referred to District Mental Health Programme (DMHP) clinics at Community Health Centres (CHCs) or civil hospitals drop out. Once a call ends, administrators have zero visibility into whether the individual attended care or defaulted.
3. Headquarters-Biased Resource Allocation: Mobile mental health vans (1–3 per district) are scheduled intuitively, concentrating camps near urban district headquarters. Peripheral rural blocks face long transit times, high fares, and unmet distress.

Beneficiaries:
- Primary: Rural, tea-garden, and riverine citizens requiring localized psychiatric care.
- Institutional Users: NHM State Mission Directors, District Mental Health Officers, and Tele-MANAS Lead Counsellors.

Statutory Guardrails:
- Non-Clinical: Zero automated diagnosis, suicide prediction, or automated triage; clinical evaluation remains strictly with certified doctors.
- Human-in-the-Loop: Zero robocalls or automated dialers; follow-ups are conducted exclusively by human clinical counsellors with recorded statutory consent (MHCA 2017 §23 & DPDP Act 2023).
- Small-Cell Suppression: Revenue circle reporting masks counts under 10 (n < 10) to algebraically prevent re-identification.

As-Is vs To-Be Workflow:
- Early Identification: Shifts from waiting for hospital crisis presentations to spatio-temporal Poisson anomaly surveillance flagging block-level distress surges (Z > 2.5, p < 0.01) factoring in ASDMA flood multipliers.
- Care Continuum: Replaces unverified verbal referrals with a closed-loop retention ledger that automatically flags stalled cases (>14 days) into a counsellor priority worklist.
- Logistics: Replaces subjective intuition with a client-side Capacitated p-Median Two-Phase Primal Simplex Linear Program, cutting mean rural patient transit time by 31.0% in Cachar District.
```

---

## 2. PROPOSED SOLUTION & KEY FEATURES

*Word Count:* **290 / 500 words**

```text
The Assam Mental Health Decision Support System (AMH-DSS) is an operational decision support system built to bridge Tele-MANAS helplines and frontline community healthcare through three algorithmic engines and a cryptographic governance layer:

1. Spatio-Temporal Poisson Surveillance Engine:
Evaluates exact discrete cumulative Poisson tail probabilities P(Y >= y | lambda) across Assam's 35 districts, avoiding the breakdown of Gaussian approximations in small rural counts. Incorporates Assam State Disaster Management Authority (ASDMA) flood multipliers (1.5x to 2.5x) for riverine catchments. Standardized scores (Z >= 2.50, p < 0.01) flag statistically anomalous spikes for mobile outreach.

2. Capacitated p-Median Linear Program (Van Siting Optimizer):
Replaces administrative guesswork with an exact client-side Two-Phase Primal Simplex Transportation Linear Program. Given P mobile health vans and candidate clinic hubs, it minimizes total demand-weighted patient travel time subject to facility capacity ceilings and unserved demand penalties. In Cachar District (8 rural blocks, 1.17M population), it solves globally in <25 ms, dropping average patient travel time from 51.2 minutes (headquarters baseline) to 35.3 minutes (31.0% empirical reduction).

3. Closed-Loop Care Retention Queue:
Models patient flow as an Absorbing Markov Chain across 4 transient states (Intake, Specialist Triage, eSanjeevani Teleconsultation, DMHP Clinic) and 2 absorbing states (Verified Recovery, Defaulted). Identifies stalled referrals waiting >14 days without attendance, populating an actionable worklist for human counsellors under strict statutory consent (MHCA 2017 §23).

4. Cryptographic Governance & Lateral Drug Rebalancing:
- Salted SHA-256 Caller Pseudonymization: Ingests call data with one-way hashing; raw identifiers are never stored.
- Immutable Forward-Linked Audit Chain: Every scenario parameter change, role switch, and outcome logging appends to an SHA-256 block chain with real-time tamper evidence.
- Pharmacy Burn-Rate Rebalancing: Monitors clinic stock of Haloperidol, Fluoxetine, and Valproate against 15-day redline buffers, generating bilateral surplus-to-deficit transfer orders.
```

---

## 3. DESCRIBE USER JOURNEY, WIREFRAMES, PROTOTYPE & PROOF OF WORK

*Word Count:* **290 / 500 words**

```text
User Journey Across 3 Role-Based Decision Surfaces:

1. State Policy View (NHM State Mission Director):
- Macro Situational Awareness: Inspects an interactive SVG Assam Choropleth Map color-coded by Poisson Z-scores across Brahmaputra Valley, Hill Tracts, and Barak Valley.
- Attrition Telemetry: Evaluates the 4-stage Markov funnel (10,000 callers -> 2,400 triage -> 850 clinic -> 320 recovery), identifying macro retention drop-offs.
- Disaster Stress Testing: Injects 1-click macro crisis presets (e.g. Barak Valley Flood Shock, Z=3.65).

2. DMHP Van Siting & Logistics Surface (District Nodal Officer):
- Siting Optimizer: Configures van fleet budget (P=2 vans), reviews Cachar spatial catchment vector maps, and triggers the Two-Phase Simplex solver.
- Travel Delta Cards: Validates the 31.0% travel time cut (35.3 min vs 51.2 min baseline).
- Pharmacy Rebalancing: Reviews clinics with <15 days stock and dispatches lateral transfers from surplus hubs.

3. Retention Queue Surface (Tele-MANAS Lead Counsellor):
- Stalled Case Worklist: Filtered by district and language (Assamese, Bengali, Bodo), displaying referrals stalled >14 days.
- Longitudinal Patient Journey Stepper: Inspects a 5-stage timeline from initial intake to default alert with verified statutory consent badges.
- Closed-Loop Check-In: Records structured call outcomes (Callback Completed, Referred to ASHA Home Visit, Facility Visit Confirmed, Refused).

Prototype Maturity & Proof of Work:
- Live Operational Prototype: Fully deployed and functional at https://mhdss.vercel.app/
- Codebase & Automated Test Suite: 15/15 unit tests passing (bun test in 500ms), verified client-side WebCrypto SHA-256 hashing, and Vite bundle compiling in <800ms.
- Evaluator Guided Tour: Interactive 4-phase jury walkthrough embedded in the top bar.
- Executive Decision Memo: 1-click print-ready official Government of Assam departmental directive with @media print styling.
- Comprehensive Proof of Work Document: 11-page formal USPR proposal and 17-page illustrated Component Guide uploaded in PDF below.
```

---

## 4. TECHNOLOGY & SOLUTION ARCHITECTURE

*Word Count:* **247 / 500 words**

```text
System Architecture & Technology Stack:

1. Presentation Layer:
- Framework: React 19, TypeScript, Vite, Tailwind CSS v4.
- UI Design: Android Material 3 (Material You) tonal elevation system with high-density command layouts and zero-FOUC light/dark themes.
- Offline Capability: Client-side single-page architecture executing fully in-browser with zero mandatory cloud round-trip latency.

2. Analytical & Algorithmic Engine Layer:
- Surveillance Engine: Client-side exact discrete cumulative Poisson tail calculation with continuity-corrected Gaussian residual Z-scores.
- Optimization Solver: Client-side Two-Phase Primal Simplex Linear Program solver for Capacitated p-Median Facility Location. Solves global optima in <25 ms without server backends.
- Retention Engine: Absorbing Markov chain matrix analyzer (N = (I - Q)^-1) calculating transition probabilities and expected absorption times.
- Natural Language Command Parser: Deterministic client-side NLP engine parsing scenario parameter instructions (e.g., 'Set vans to 3', 'Floods hit Katigorah').

3. Data, Cryptography & Governance Layer:
- Pseudonymization: Salted SHA-256 hashing via native WebCrypto API executing on CSV ingestion.
- Audit Chain: Cryptographic append-only block ledger (H_k = SHA-256(R_k || H_{k-1})) anchored by Genesis hash c1055f18... Real-time tamper verification alerts on arbitrary database modifications.
- Small-Cell Suppression: Primary (n < 10) and complementary secondary suppression algebraically preventing subtraction attacks.

4. Hosting & Deployment Readiness:
- Production Prototype: Deployed globally on Vercel Edge Network (https://mhdss.vercel.app/).
- Enterprise / Government Hosting Readiness: Fully containerizable via Docker for deployment on MeghRaj State Data Centre (SDC) or National Informatics Centre (NIC) cloud environments behind standard reverse proxies (Nginx) with zero external commercial SaaS lock-in.
```

---

## 5. DEVELOPMENT METHODOLOGY & INTERMEDIATE STEPS

*Word Count:* **259 / 500 words**

```text
The project follows an evidence-driven 4-phase Agile methodology spanning 6 months:

Phase 1: Discovery, Stakeholder Alignment & Schema Formalization (Month 1):
- Consultations with NHM Assam nodal officers, DMHP psychiatrists, and Tele-MANAS counsellors.
- Formalization of the 15-field synthetic schema aligned with WHO mhGAP and Tele-MANAS operational standards.
- Definition of statutory compliance boundaries under MHCA 2017 §23 and DPDP Act 2023.
- Output: Requirements Traceability Matrix (RTM) and validated data dictionary.

Phase 2: Core Algorithmic Engineering & Optimization (Months 2–3):
- Implementation of the Two-Phase Simplex Transportation Linear Program solver.
- Construction of Cachar and Kamrup road-network travel time matrices based on OpenStreetMap GIS and ASDMA flood data.
- Implementation of the exact discrete Poisson surveillance tail probability engine.
- Output: Validated computational core and automated test harness (15 unit tests).

Phase 3: Decision Surfaces, Cryptographic Ledger & Security Audits (Month 4):
- Development of the 3 role-based decision surfaces (State Director, District Officer, Counsellor).
- Implementation of WebCrypto salted SHA-256 pseudonymization, hash-chain audit logging, and small-cell suppression.
- Execution of Vulnerability Assessment and Penetration Testing (VAPT) and simulation stress tests.
- Output: Feature-complete Beta prototype with Evaluator Guided Tour and Print Decision Memo.

Phase 4: Field Pilot, User Validation & Scaling Handover (Months 5–6):
- Controlled pilot deployment in Cachar District and Kamrup Metropolitan.
- Training workshops for DMHP mobile van teams and district mental health officers.
- Empirical evaluation of travel time reductions and referral retention recovery rates.
- Output: Pilot Operational Evaluation Report, User Administration Manual, and statewide rollout blueprint for all 35 Assam districts.
```

---

## 6. DEVELOPMENT TIMELINE & MILESTONES

*Word Count:* **248 / 500 words**

```text
The 24-week delivery roadmap is structured across six major milestones:

- Weeks 1–4 (Milestone 1 — Discovery & Governance Sign-Off):
  Finalize requirements with NHM Assam; establish stakeholder working group; configure 15-field synthetic data sandbox and statutory consent compliance protocols.
  Deliverable: Approved Technical Requirements Specification & Ethics Architecture.

- Weeks 5–8 (Milestone 2 — Mathematical Engines & GIS Matrices):
  Calibrate Poisson baseline parameters for all 35 districts; integrate ASDMA flood hazard multipliers; assemble road travel-time matrices for Cachar and Kamrup.
  Deliverable: Validated Simplex LP solver & Poisson surveillance engine with <25 ms latency.

- Weeks 9–12 (Milestone 3 — Role-Based Decision Interfaces):
  Build responsive Material 3 decision dashboards: Overview KPI ribbon, Statewide Surveillance with SVG choropleth, Van Siting optimizer, Pharmacy rebalancing, and Retention Queue.
  Deliverable: Alpha prototype release with Natural Language command bar.

- Weeks 13–16 (Milestone 4 — Cryptographic Audit & Security Hardening):
  Implement WebCrypto SHA-256 audit chaining, tamper simulation, and deterministic primary/secondary small-cell suppression (n < 10). Complete VAPT security testing.
  Deliverable: Security-cleared Beta package with VAPT certification dossier.

- Weeks 17–21 (Milestone 5 — Two-District Operational Field Pilot):
  Deploy pilot in Cachar District (rural/riverine focus) and Kamrup Metro (urban density focus); train nodal teams; shadow mobile health camp routing cycles.
  Deliverable: Live operational field deployment and weekly planning telemetry.

- Weeks 22–24 (Milestone 6 — Departmental Review & Institutional Handover):
  Measure empirical travel-time savings and retention completion; publish system administration documentation; deliver production codebase to NHM Assam.
  Deliverable: Final Impact Evaluation Report and Production Codebase Handover.
```

---

## 7. DATA & INFORMATION REQUIREMENTS

*Word Count:* **253 / 500 words**

```text
To ensure zero development dependency on unconfirmed access, the platform utilizes two parallel data tracks:

1. Synthetic Development Sandbox (Zero Privacy Risk):
The platform operates on a calibrated 15-field synthetic dataset strictly mapped to national Tele-MANAS operational conventions and WHO mhGAP classifications:
- caller_hash: Salted SHA-256 hash (64 hex characters) ensuring zero caller PII retention.
- district_id & block_id: Standard administrative revenue circles across 35 Assam districts.
- language: Assamese, Bengali, Bodo, Hindi, English (for linguistic matching).
- age_band & gender: Standardized demographic strata for equity monitoring.
- mhgap_code: Standardized diagnostic categories (Depression, Anxiety, Substance, Psychosis).
- tier_reached & escalated_tier2: Triage escalation tier (Tier 1 Helpline vs Tier 2 Clinical).
- esanjeevani: Teleconsultation status tracking.
- referral_dest & referral_status: Physical facility referral destination and attendance tracking.
- consent_followup: Statutory consent flag required before outbound queueing.
- callback_count & last_contact_note: Audit counters for counsellor outreach.

2. Open Government Data & Spatial Geographies (Production Ingestion):
- Administrative Boundaries: Survey of India and OpenStreetMap revenue circle GeoJSON vectors.
- Health Facility Registry (HFR): Ministry of Health & Family Welfare registry of Assam CHCs, PHCs, Sub-Divisional Civil Hospitals, and Medical Colleges with geolocation and capacity.
- Disaster Multipliers: Assam State Disaster Management Authority (ASDMA) historical flood inundation maps to establish seasonal travel impedance factors.

Data Processing & Protection:
- Client-Side Parsing: Structured CSV reader with schema auto-detection and row-level validation.
- Zero Raw Retention: Telephone numbers and personal names are cryptographically salted and hashed on ingest; raw values never touch persistent storage or leave the client environment.
```

---

## 8. TEAM, MANPOWER & EXPERTISE

*Word Count:* **212 / 500 words**

```text
The project is executed by an interdisciplinary team from Assam University, Silchar, pairing quantitative operations research with public health management:

1. Core Team:
- Saurav Sinha (Technical & Analytics Lead):
  MBA (Operations & Marketing), B.Sc. Mathematics. Formulated the Two-Phase Simplex Transportation Linear Program, discrete Poisson tail models, Absorbing Markov retention models, and built the full-stack React/TypeScript prototype.
- Soumyodeep Das (Lead Applicant / Business & Operations Lead):
  Assam University. Public health systems workflow coordination, institutional stakeholder liaison with NHM Assam, field research operations, and project management.

2. Advisory & Specialist Manpower (Phased Allocation):
- Public Health & Policy Advisor (Part-Time, Months 1–6):
  Senior academic advisory in Health Economics and Public Health. Oversees clinical workflow alignment, Tele-MANAS protocol integration, and Section 23 MHCA compliance.
- Full-Stack & GIS Associate (Full-Time, Months 2–5):
  Software engineer specializing in PostgreSQL/PostGIS spatial distance matrices, Leaflet/MapLibre integration, and Docker containerization.
- Field Pilot Coordinator (Full-Time, Months 4–6):
  Public health field surveyor experienced in grassroots community health in Barak Valley and Brahmaputra riverine tracts. Coordinates DMHP camp shadowing and ASHA feedback.

Critical Specialist Capabilities:
- Mathematical Operations Research: Formulation of combinatorial mixed-integer facility location models.
- Statistical Anomaly Detection: Discrete Poisson hypothesis testing for rare event surveillance.
- Health Data Security: WebCrypto SHA-256 forward-linked audit ledgers and small-cell suppression.
```

---

## 9. TESTING, VALIDATION & EVIDENCE

*Word Count:* **236 / 500 words**

```text
Testing Methodology & Empirical Benchmarking:

The prototype has been rigorously verified through an automated test harness (15 unit tests in Vitest/Bun) and validated on a realistic operational model of Cachar District (1.17M population across 8 rural revenue circles):

1. Mathematical Solver Performance (Cachar Pilot Benchmark):
- Status Quo (Headquarters Bias): Vans stationed intuitively at Silchar HQ yield a mean rural patient transit time of 51.2 minutes.
- AMH-DSS Optimized Placement: Siting vans at Sonai BPHC and Katigorah CHC drops mean travel time to 35.3 minutes.
- Verified Impact: 31.0% empirical reduction in patient transit travel time with 0% unserved demand.
- Computational Latency: Global optimum reached in <25 ms client-side, enabling live interactive re-planning during district meetings.

2. Surveillance Sensitivity & Reliability:
- Poisson Tail Hypotheses: Evaluated at alpha = 0.01 with continuity-corrected Gaussian residual Z-scores.
- Disaster Stress Test (Barak Flood Preset): Correctly flags acute spikes (Z = 3.65, p < 0.0001) while remaining resilient against false alarms during normal seasonal fluctuations.

3. Cryptographic Audit Chain Verification:
- Genesis Verification: Verified against Genesis block hash c1055f18...
- Automated Tamper Detection: Test harness verifies that modifying any historical record immediately breaks the SHA-256 chain and flips system status from OK to BROKEN with exact block height attribution.

4. Application Stability:
- Automated component tree mounting tests pass with zero console errors or hydration mismatches.
- Production build compiles cleanly in <800ms with zero external runtime dependencies.
```

---

## 10. SECURITY, PRIVACY, SAFETY & COMPLIANCE

*Word Count:* **226 / 500 words**

```text
The system is architected around strict legal and cryptographic privacy safeguards:

1. Statutory Compliance:
- Mental Healthcare Act (MHCA) 2017 (§23): Protects absolute confidentiality of mental health inquiries. No clinical diagnosis or private session transcripts are ingested or stored.
- Digital Personal Data Protection (DPDP) Act 2023: Enforces strict data minimization, purpose limitation, and caller pseudonymization.
- Ayushman Bharat Digital Mission (ABDM): Conforms to national digital health data guidelines and standardized facility coding.

2. Technical Privacy Architecture:
- Cryptographic Pseudonymization: Caller identifiers are salted and hashed on ingest using the native WebCrypto API (SHA-256). Raw phone numbers and names are never persisted.
- Deterministic Small-Cell Suppression: To algebraically eliminate subtraction attacks and re-identification in sparsely populated rural circles, any query returning n < 10 is automatically masked. Secondary complementary masking is applied to adjacent cells to prevent marginal subtraction leaks.
- Role-Based Access Control (RBAC):
  * State Director: Access strictly limited to macro choropleth heatmaps and statewide retention percentages.
  * District Officer: Access limited to block-level aggregates and mobile van logistics.
  * Counsellor: Access to individual worklist rows restricted exclusively to consenting individuals.

3. Clinical Safety & Human-in-the-Loop Protocol:
- Strictly Non-Diagnostic: System generates logistical and surveillance alerts; it never performs automated clinical diagnoses or algorithmic triage.
- Zero Robocalls: Outbound re-contact is strictly prohibited via automated dialers. All follow-ups are counsellor-conducted with recorded statutory consent.
```

---

## 11. INNOVATION & DIFFERENTIATION

*Word Count:* **243 / 500 words**

```text
Basis of Innovation:

Conventional public health IT in India consists almost exclusively of retrospective dashboards—displaying historical charts of past visits without providing operational foresight or decision logic. AMH-DSS introduces three fundamental innovations:

1. Prescriptive Operations Research (Forward Planning vs Rearview Reporting):
Conventional portals show where clinics operated last month. AMH-DSS mathematically solves where mobile teams must be deployed next month to maximize geographic coverage and minimize travel impedance under resource constraints.

2. Closed-Loop Care Retention (Rescue vs Attrition):
Tele-MANAS currently acts as an open-loop helpline. AMH-DSS transforms it into an integrated care continuum by actively detecting stalled referrals (>14 days) and empowering human counsellors to rescue patients before they default.

3. Cryptographic Trust & Local-First Speed:
Replaces centralized vulnerable databases with client-side execution and an immutable SHA-256 forward-linked audit chain. Every administrative action, scenario load, and dispatch is tamper-evident.

Comparative Matrix:
- Paradigm: Conventional = Descriptive / Historical; AMH-DSS = Prescriptive / Mathematical Optimization.
- Van Scheduling: Conventional = Subjective intuition / HQ bias; AMH-DSS = Two-Phase Simplex LP (31% travel time reduction).
- Referral Retention: Conventional = Open-loop / >94% drop-off; AMH-DSS = Closed-loop Absorbing Markov tracker.
- Anomaly Detection: Conventional = Static threshold / noise; AMH-DSS = Exact discrete Poisson tail with ASDMA flood multipliers.
- Privacy & Auditing: Conventional = Simple password / CSV leaks; AMH-DSS = Salted SHA-256 hashing, RBAC, and tamper-evident block chain.
- Software Dependencies: Zero proprietary vendor lock-in; built entirely on open-source standards (React, TypeScript, Tailwind).
```

---

## 12. RESOURCES, RISKS & PILOT VALIDATION

*Word Count:* **233 / 500 words**

```text
Indicative Budget Drivers (6-Month Development & Validation):
- Core Software & Analytics Engineering (48%): Full-stack TypeScript architecture, Simplex LP solver, GIS matrices, and cryptographic ledger development.
- Public Health & Clinical Mentorship (14%): Health economics advisory, Tele-MANAS protocol alignment, and ethics consultations.
- Infrastructure & Security Auditing (16%): PostGIS spatial databases, staging servers, and third-party CERT-In empanelled VAPT certification.
- Field Pilot & Stakeholder Training (15%): Field travel to Cachar and Kamrup CHCs, training workshops for DMHP nodal teams and ASHAs.
- Documentation & Contingency (7%): System manuals, printing, and administrative reporting.

Key Risks & Structured Mitigations:
1. Production Data Access Delays:
   - Mitigation: Entire system operates on an open 15-field synthetic schema; development and validation require zero unconfirmed production feeds.
2. Field Personnel Adoption:
   - Mitigation: System operates strictly as a decision-support advisor; district officers retain full override authority over van locations.
3. Peripheral Connectivity Gaps:
   - Mitigation: Single-page application executes 100% client-side in the browser, functioning smoothly offline once loaded.
4. Privacy Re-Identification:
   - Mitigation: Salted SHA-256 pseudonymization on ingest, RBAC, and deterministic small-cell suppression (n < 10).

Pilot Validation Plan:
- Pilot Sites: Kamrup Metropolitan (Urban/Peri-Urban density) and Cachar District (Rural/Riverine/Tea-Garden terrain).
- Target Validation Metrics:
  1. Travel Impedance: Maintain >25% reduction in rural patient transit time.
  2. Retention Rescue: Achieve >30% recovery rate among consenting stalled referrals.
  3. System Integrity: Zero privacy breaches and 100% SHA-256 audit chain verification.
```

---

## Section 03: Supporting Material

1. UPLOAD PROOF OF WORK / SOLUTION EVIDENCE * (PDF ONLY, MAX 10MB)
   File to upload: `Assam NHM Mental Health Decision Support — USPR Solution Proposal.pdf`
   Path: `/Users/sz/Filen/F — 1. Projects/Mental Health Decision Support System/Assam NHM Mental Health Decision Support — USPR Solution Proposal.pdf`
   (11 pages, compiled in formal 12-section USPR standard)

2. PRODUCT / WEBSITE URL (optional)
   URL to enter: `https://mhdss.vercel.app/`

3. DEMO / PRODUCT VIDEO URL (optional)
   Leave blank (or enter YouTube/Drive demo video link if recorded)

4. ADDITIONAL SUPPORTING MATERIAL (optional) (PDF ONLY, MAX 10MB)
   File to upload: `AMH-DSS_Component_Guide.pdf`
   Path: `/Users/sz/AIOS/Github Repos/assam-mental-health-dss/docs/AMH-DSS_Component_Guide.pdf`
   (17 pages, illustrated component walkthrough with framed UI screenshots)

## Section 04: Declarations & Submission
- Check `[x] I agree *`
- Lead Applicant: `Soumyodeep Das`
