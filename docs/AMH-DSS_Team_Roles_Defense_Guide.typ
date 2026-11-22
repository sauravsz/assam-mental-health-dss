#set document(
  title: "AMH-DSS Team Roles, Responsibilities & Defense Guide",
  author: "Saurav Sinha & Soumyodeep Das — Assam University, Silchar",
  date: auto,
)

#set page(
  paper: "a4",
  margin: (top: 1.8cm, bottom: 1.8cm, left: 2.0cm, right: 2.0cm),
  header: context {
    let page_num = counter(page).get().first()
    if page_num > 1 [
      #grid(
        columns: (1fr, 1fr),
        align: (left, right),
        [#text(size: 8.0pt, fill: rgb("#64748b"), weight: "bold")[AMH-DSS · Team Roles & Defense Guide]],
        [#text(size: 8.0pt, fill: rgb("#64748b"))[NESFIC 2026 · Challenge NESFIC-D-29]],
      )
      #v(-2pt)
      #line(length: 100%, stroke: 0.4pt + rgb("#cbd5e1"))
    ]
  },
  footer: context {
    line(length: 100%, stroke: 0.4pt + rgb("#cbd5e1"))
    v(2pt)
    let page_num = counter(page).get().first()
    let total_pages = counter(page).final().first()
    grid(
      columns: (1fr, 1fr),
      align: (left, right),
      [#text(size: 8.0pt, fill: rgb("#94a3b8"))[Assam University, Silchar · Application ID: NESFIC-S1-EAA29641]],
      [#text(size: 8.0pt, fill: rgb("#64748b"), weight: "bold")[Page #page_num of #total_pages]],
    )
  },
)

#set text(
  font: ("Charter", "Georgia"),
  size: 9.0pt,
  fill: rgb("#1e293b"),
  lang: "en",
  spacing: 115%,
)

#set par(justify: true, leading: 0.52em)
#set heading(numbering: none)
#show heading: set text(font: ("Helvetica Neue", "Arial"), fill: rgb("#0f172a"))

#show heading.where(level: 1): it => block(breakable: false, width: 100%)[
  #v(8pt)
  #line(length: 100%, stroke: 0.8pt + rgb("#93c5fd"))
  #v(2pt)
  #text(size: 12pt, weight: "bold", fill: rgb("#0b3b75"))[#it]
  #v(2pt)
]

#show heading.where(level: 2): it => block(breakable: false, width: 100%)[
  #v(7pt)
  #text(size: 10.2pt, weight: "bold", fill: rgb("#1d5fb3"))[#it]
  #v(2.5pt)
]

#show heading.where(level: 3): it => block(breakable: false, width: 100%)[
  #v(5pt)
  #text(size: 9.0pt, weight: "bold", fill: rgb("#334155"))[#it]
  #v(2pt)
]

#show raw: set text(font: ("Menlo", "Courier New"), size: 8.0pt)

// ─── Custom UI Helpers ───

#let callout(title, body, fill-color: rgb("#eff6ff"), stroke-color: rgb("#3b82f6")) = {
  block(
    breakable: false,
    fill: fill-color,
    stroke: (left: 3.5pt + stroke-color, rest: 0.5pt + rgb("#cbd5e1")),
    inset: (x: 10pt, y: 7pt),
    radius: (right: 4pt),
    width: 100%,
    spacing: 7pt,
    [
      #text(weight: "bold", size: 9.2pt, fill: stroke-color)[#title] \
      #v(2pt)
      #text(size: 8.8pt, fill: rgb("#1e293b"))[#body]
    ]
  )
}

#let qa-block(q, a) = {
  block(
    breakable: false,
    fill: rgb("#f8fafc"),
    stroke: 0.5pt + rgb("#cbd5e1"),
    inset: (x: 10pt, y: 7pt),
    radius: 4pt,
    width: 100%,
    spacing: 7pt,
    [
      #text(weight: "bold", size: 9.0pt, fill: rgb("#0b3b75"))[Q: #q] \
      #v(2pt)
      #text(size: 8.8pt, fill: rgb("#1e293b"))[#a]
    ]
  )
}

// ─── Document Header / Banner ───

#align(center)[
  #block(
    fill: rgb("#f0f4f9"),
    inset: (x: 14pt, y: 8pt),
    radius: 6pt,
    stroke: 0.8pt + rgb("#bfdbfe"),
    width: 100%,
  )[
    #text(size: 8.0pt, weight: "bold", tracking: 1.2pt, fill: rgb("#0b3b75"))[
      NORTH EAST SEVA FIRST INNOVATION CHALLENGE (NESFIC 2026) · STREAM 1
    ]
    #v(2pt)
    #text(size: 15pt, weight: "bold", fill: rgb("#0f172a"))[
      AMH-DSS: Team Roles, Defense & Pitch Guide
    ]
    #v(2pt)
    #text(size: 9.5pt, style: "italic", fill: rgb("#334155"))[
      Operational Ownership Matrix, Jury Defense Scripts, and Synchronized 10-Minute Presentation Split
    ]
    #v(6pt)
    #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
    #v(4pt)
    #grid(
      columns: (1fr, 1fr),
      align: (left, right),
      [
        #text(size: 8.0pt, fill: rgb("#1e293b"))[
          *Challenge:* NESFIC-D-29 · Mental Health Identification & Siting \
          *Application ID:* `NESFIC-S1-EAA29641` (Submitted) \
          *Submission Date:* 22 November 2026
        ]
      ],
      [
        #text(size: 8.0pt, fill: rgb("#1e293b"))[
          *Institution:* Assam University, Silchar \
          *Lead Applicant:* Soumyodeep Das \
          *Member 2 (Tech Lead):* Saurav Sinha \
          *Verified Prototype:* #link("https://mhdss.vercel.app/")[https://mhdss.vercel.app/]
        ]
      ]
    )
  ]
]

#v(6pt)

= 1. Executive Summary & Two-Pillar Operating Model

With the formal submission of proposal `NESFIC-S1-EAA29641` to the Government of Assam National Health Mission portal, the team enters the *Evaluation, Jury Defense, and Field Pilot Preparation* phase. To present a unified, highly authoritative front during technical review and investor/jury defense, the project operates under a strict two-pillar division of ownership:

#table(
  columns: (1.3fr, 1.8fr, 1.8fr),
  inset: 3.8pt,
  stroke: 0.5pt + rgb("#cbd5e1"),
  fill: (x, y) => if y == 0 { rgb("#0b3b75") } else if calc.even(y) { rgb("#f8fafc") } else { none },
  table.header([*Dimension*], [*Saurav Sinha (Member 2)*], [*Soumyodeep Das (Lead Applicant)*]),
  [*Core Domain*],
  [*Technical, Quantitative & Architecture*],
  [*Public Health Operations, Liaison & Governance*],

  [*Primary Designation*],
  [Analytics & Systems Engineering Lead],
  [Operations Lead & Institutional Representative],

  [*Key Deliverables*],
  [Working platform, mathematical solvers, benchmarks, test suites, and GitHub codebase.],
  [Public health workflow SOPs, stakeholder liaison with NHM Assam, statutory compliance, and pilot trial execution.],

  [*Jury Defense Role*],
  [Executes live interactive demo, defends mathematical formulations, algorithmic latency, and cryptographic data security.],
  [Articulates public health problem, policy alignment, Tele-MANAS/DMHP workflow integration, budget justification, and pilot scaling.],

  [*Academic Anchor*],
  [MBA (Operations) & B.Sc. (Mathematics), Assam University.],
  [Healthcare Systems & Field Coordination, Assam University.],
)

#v(8pt)

#callout(
  "The Core Presentation Principle",
  "During jury defense, Soumyodeep owns the 'Why' (the public health crisis, the 94% referral attrition cliff, policy compliance, and the pilot roadmap), while Saurav owns the 'How' (the mathematical optimization, client-side linear program, Poisson surveillance math, and cryptographic ledger). Neither member interrupts the other's domain; each validates the other's evidence."
)

= 2. Part 1 — Saurav Sinha (Technical & Analytics Lead)

== 2.1 Core Ownership Areas

1. *Mathematical Formulations & Solvers*:
   - *Two-Phase Primal Simplex LP*: Formulates and maintains the Capacitated $p$-Median facility location optimizer that connects Cachar District's 8 revenue circles to optimal clinic hubs (Sonai BPHC and Katigorah CHC) in under 25 milliseconds directly in the browser thread.
   - *Exact Poisson Tail Surveillance*: Formulates the discrete cumulative distribution function $P(Y >= y | lambda)$ with continuity-corrected Gaussian residual $Z$-scores and ASDMA seasonal flood hazard crisis multipliers ($1.5times$ to $2.5times$).
   - *Absorbing Markov Care Progression*: Formulates the 4-stage transient and 2-stage absorbing Markov chain model ($N = (I - Q)^(-1)$) that powers the referral retention worklist.

2. *Frontend & Systems Engineering*:
   - Maintains the client-side React 19 / TypeScript / Vite / Tailwind CSS v4 web platform.
   - Ensures zero-roundtrip client-side architecture remains stable, responsive, and persistent across light/dark themes via the Google Android Material 3 tonal elevation system.
   - Maintains the interactive SVG Assam Choropleth Map covering 15 monitored districts with click-to-filter capability.
   - Maintains the bilateral psychotropic drug inventory rebalancer across Haloperidol, Fluoxetine, and Valproate.

3. *Cryptographic Governance & Data Security*:
   - Implements native browser WebCrypto API (`crypto.subtle`) for salted SHA-256 caller pseudonymization at ingestion time.
   - Implements the forward-linked append-only cryptographic hash ledger ($H_k = "SHA-256"(R_k || H_(k-1))$) anchored by Genesis block `c1055f18...`.
   - Enforces automated Primary ($n < 10$) and Secondary Complementary small-cell suppression logic to algebraically prevent demographic re-identification.

4. *Codebase & Deployment Reliability*:
   - Guarantees 100% test pass rate across all 15 automated unit tests in Vitest and Bun.
   - Maintains the production deployment at *#link("https://mhdss.vercel.app/")[https://mhdss.vercel.app/]*.
   - Manages the GitHub source code repository at *#link("https://github.com/sauravsz/assam-mental-health-dss")[github.com/sauravsz/assam-mental-health-dss]*.

== 2.2 Saurav's Defense Q&A (Technical Panel Defense)

#qa-block(
  "Why did you write a custom Two-Phase Simplex LP in TypeScript instead of calling an established Python library (SciPy/PuLP) on a cloud server?",
  "A public health decision support system for rural Assam cannot rely on continuous high-speed internet or server round-trip latency. By compiling the Two-Phase Simplex LP directly into client-side TypeScript, the optimization executes in under 25 milliseconds directly in the browser thread. District Health Officers can drag van sliders and re-plan routes live during review meetings even in remote CHCs with zero connectivity. Furthermore, client-side execution means patient call records never leave the local machine, providing absolute data privacy."
)

#v(4pt)

#qa-block(
  "Why choose Poisson surveillance over an AI/deep learning model?",
  "Deep neural networks are opaque 'black boxes' prone to hallucinations and require vast historical training datasets that Tele-MANAS simply does not possess. Poisson anomaly detection is deterministic, statistically proven, and the gold standard in public health epidemiology. By calculating exact discrete cumulative Poisson tail probabilities with continuity-corrected Z-scores and ASDMA flood multipliers, we detect statistically significant surges (p below 0.01) while remaining completely resilient against false alarms during calm seasonal variations."
)

#v(4pt)

#qa-block(
  "How do you mathematically prove the system is tamper-evident?",
  "Every administrative action, van parameter mutation, and drug transfer dispatches a transaction into an append-only cryptographic hash chain anchored by a hardcoded Genesis block (hash c1055f18...). In our automated test suite, we simulate an attacker altering a historical database entry; within under 5 milliseconds, the verification engine detects the broken SHA-256 pointer and flips system status from OK to BROKEN with exact block-height attribution."
)

== 2.3 Saurav's Immediate Action Items (Weeks 1–4)
- *Deployment Monitoring*: Ensure 100% uptime and zero-console-error status on [https://mhdss.vercel.app/](https://mhdss.vercel.app/).
- *Offline Fallback Video*: Record a clean, high-resolution 3-minute screen capture of the live system demonstrating all 7 views in case conference WiFi is unstable during evaluation.
- *Statewide Matrix Expansion*: Draft the preliminary OpenStreetMap transit matrix data structures to expand road routing from Cachar District to Kamrup Metropolitan.

= 3. Part 2 — Soumyodeep Das (Lead Applicant & Operations Lead)

== 3.1 Core Ownership Areas

1. *Public Health Context & Problem Framing*:
   - Articulating the *94% referral attrition cliff*: explaining why Tele-MANAS callers currently disappear after receiving verbal clinic advice.
   - Explaining *transport poverty and monsoon geography*: how riverine *char* tracts and tea-garden estates in peripheral blocks (e.g. Katigorah, Dholai) prevent poor citizens from traveling to urban civil hospitals.
   - Explaining the *headquarters bias*: why mobile health vans intuitively sit near town civil hospitals rather than serving remote, high-burden rural communities.

2. *Institutional Alignment & Stakeholder Liaison*:
   - Primary official contact for the National Health Mission (NHM) Assam, the Directorate of Health Services (DHS), and the NESFIC 2026 organizing committee.
   - Coordinating liaison with District Mental Health Programme (DMHP) nodal officers, psychiatrists, and Tele-MANAS lead counsellors.
   - Securing formal academic institutional endorsement and ethics advisory letters from Assam University faculty.

3. *Statutory, Legal & Ethical Boundaries*:
   - *Section 23 of the Mental Healthcare Act (MHCA) 2017*: Proving that AMH-DSS ingests zero diagnostic transcripts or psychotherapy notes; maintaining absolute patient confidentiality.
   - *Digital Personal Data Protection (DPDP) Act 2023*: Demonstrating that all caller identifiers are pseudonymized prior to processing, and only consenting individuals appear on counsellor follow-up queues.
   - *Strict Non-Clinical Boundary*: Emphasizing that AMH-DSS *never* diagnoses mental illness or computes automated suicide triage—it strictly optimizes logistics and queues human counsellors.

4. *Operational Pilot & Budget Justification*:
   - Defending the 6-month grant budget allocation (48% Core Engineering, 14% Mentorship, 16% Cloud/VAPT, 15% Two-District Field Travel, 7% Documentation).
   - Directing the two-district field pilot trial comparing Cachar District (rural/riverine/tea-garden terrain) against Kamrup Metropolitan (high-density urban environment).

== 3.2 Soumyodeep's Defense Q&A (Operations & Policy Defense)

#qa-block(
  "What is the single biggest operational problem this system solves for NHM Assam?",
  "Tele-MANAS (14416) is a vital 24/7 lifeline, but it currently operates as an open-loop system. Over 94% of callers advised to visit physical DMHP clinics or civil hospitals never show up, and administrators have zero tracking of clinic attendance. AMH-DSS closes this loop. It detects patients stalled over 14 days without confirmed facility attendance and populates a prioritized worklist for certified human counsellors to conduct compassionate, structured check-ins before patients disengage permanently."
)

#v(4pt)

#qa-block(
  "Will doctors and district health officers resist adopting another software portal?",
  "AMH-DSS is designed strictly as an advisory decision support platform, not an administrative burden or mandatory data entry tool. District Nodal Officers retain 100% override authority over camp locations. Instead of replacing medical judgment, it equips officers with mathematical evidence: demonstrating that shifting a van from Silchar town hospital to Sonai BPHC and Katigorah CHC reduces patient travel time by 31.0%. It converts intuitive administrative guesswork into quantified public health impact."
)

#v(4pt)

#qa-block(
  "Does this system pose clinical or safety risks to vulnerable citizens?",
  "No. The platform enforces two inviolable clinical boundaries. First, it is strictly non-diagnostic: it never attempts algorithmic psychiatric classification or automated suicide scoring. Second, it enforces a strict human-in-the-loop protocol: automated robocalls and unsolicited dialers are strictly prohibited. All outreach is conducted by trained human counsellors, and exclusively when recorded statutory consent was granted during intake."
)

== 3.3 Soumyodeep's Immediate Action Items (Weeks 1–4)
- *Portal & Email Vigilance*: Monitor `sauravsinhasz14@gmail.com` and the NESFIC portal dashboard daily for evaluation notifications, shortlist announcements, or document verification requests.
- *Faculty Endorsements*: Coordinate with senior faculty in Health Economics / Management at Assam University to finalize official mentorship sign-off letters.
- *Executive One-Pager*: Prepare a concise 1-page departmental brief summarizing the empirical Cachar benchmark for distribution to NHM Assam reviewers.

#pagebreak()
= 4. Joint Pitch Choreography (10-Minute Presentation Split)

When invited for the final evaluation presentation or jury defense interview, structure the session with disciplined, synchronized handoffs:

#table(
  columns: (1fr, 1.2fr, 2.2fr, 1.6fr),
  inset: 3.8pt,
  stroke: 0.5pt + rgb("#cbd5e1"),
  fill: (x, y) => if y == 0 { rgb("#0b3b75") } else if calc.even(y) { rgb("#f8fafc") } else { none },
  table.header([*Time*], [*Speaker*], [*Core Focus & Narrative*], [*Screen Surface*]),
  [*0:00 -- 2:30* \ (2.5 min)],
  [#strong[Soumyodeep Das] \ (Operations Lead)],
  [#strong[The Crisis & Operational Need]: Introduce Tele-MANAS (14416). Explain the 94% referral attrition cliff, transport poverty in rural Assam, and administrative headquarters bias. Define the project's public health goal.],
  [Slide / High-level Overview Diagram],

  [*2:30 -- 6:30* \ (4.0 min)],
  [#strong[Saurav Sinha] \ (Tech Lead)],
  [#strong[Live Operational Platform & Proof of Work]: Walk through https://mhdss.vercel.app/. Demonstrate the Two-Phase Simplex LP optimizer (31.0% Cachar travel cut in under 25 ms), Poisson surveillance ($Z$ anomaly flags), and the SHA-256 tamper-evident audit ledger.],
  [Live Interactive Prototype (Browser)],

  [*6:30 -- 8:00* \ (1.5 min)],
  [#strong[Soumyodeep Das] \ (Operations Lead)],
  [#strong[Care Continuum, Governance & Privacy]: Demonstrate the closed-loop retention queue, Section 23 MHCA compliance, DPDP consent gating, and zero-robocall human check-in protocol.],
  [Retention Queue & Patient Journey Modal],

  [*8:00 -- 10:00* \ (2.0 min)],
  [#strong[Both Members] \ (Joint Split)],
  [#strong[Field Pilot Roadmap & Q&A Defense]: Outline the 6-month Cachar & Kamrup deployment plan. Soumyodeep handles policy, pilot logistics, and budget; Saurav handles mathematical, algorithmic, and security queries.],
  [Milestone Roadmap & Impact Dossier],
)

= 5. File Reference Ledger & Official Credentials

#table(
  columns: (1.5fr, 1.5fr, 2fr),
  inset: 3.6pt,
  stroke: 0.5pt + rgb("#cbd5e1"),
  fill: (x, y) => if y == 0 { rgb("#0b3b75") } else { none },
  table.header([*Document / Asset*], [*Primary Location*], [*Description*]),
  [*Submitted Portal Answers*],
  [`docs/NESFIC_2026_Application_Form_Answers.md`],
  [Complete copy-paste text for all 12 portal fields with zero markup characters (< or >).],

  [*USPR Solution Proposal PDF*],
  [`Assam NHM Mental Health Decision Support — USPR Solution Proposal.pdf`],
  [Official 11-page technical proposal submitted in Section 03 as primary Proof of Work.],

  [*Component Guide PDF*],
  [`docs/AMH-DSS_Component_Guide.pdf`],
  [17-page illustrated system walkthrough submitted in Section 03 as supporting material.],

  [*Faculty Pitch Script*],
  [`Assam NHM Mental Health Decision Support — Faculty Guide Pitch Script.md`],
  [Comprehensive elevator pitch, meeting scripts, and MBA operations research defense notes.],

  [*Live Prototype Deployment*],
  [#link("https://mhdss.vercel.app/")[https://mhdss.vercel.app/]],
  [Production local-first web application deployed on Vercel Edge with automated jury walkthrough.],

  [*GitHub Source Repository*],
  [#link("https://github.com/sauravsz/assam-mental-health-dss")[github.com/sauravsz/assam-mental-health-dss]],
  [Public version-controlled repository with 15 passing unit tests and full TypeScript codebase.],
)
