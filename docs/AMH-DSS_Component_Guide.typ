#set page(
  paper: "a4",
  margin: (top: 2.2cm, bottom: 2.2cm, left: 2.2cm, right: 2.2cm),
  header: align(right)[
    #text(size: 8.5pt, fill: rgb("#64748b"))[
      *Assam Mental Health Decision Support System (AMH-DSS)* · Component Guide
    ]
  ],
  footer: context {
    let page_number = counter(page).display()
    let total_pages = counter(page).final().first()
    align(center)[
      #text(size: 8.5pt, fill: rgb("#94a3b8"))[
        Page #page_number of #total_pages · Prepared for Saurav Sinha & Soumyodeep Das · Assam University
      ]
    ]
  }
)

#set text(
  font: ("Helvetica Neue", "Arial"),
  size: 10pt,
  fill: rgb("#191c1e"),
  lang: "en",
  spacing: 118%
)

#set par(justify: true, leading: 0.62em)

#let primary = rgb("#1f5fbf")
#let secondary = rgb("#164a96")
#let dark-slate = rgb("#1e293b")
#let light-bg = rgb("#f8fafc")
#let border-color = rgb("#e2e8f0")
#let alert-bg = rgb("#eff6ff")
#let alert-border = rgb("#93c5fd")
#let green-bg = rgb("#f0fdf4")
#let green-border = rgb("#86efac")
#let amber-bg = rgb("#fffbeb")
#let amber-border = rgb("#fcd34d")

#let callout(title, body, fill-color: alert-bg, stroke-color: alert-border) = {
  block(
    fill: fill-color,
    stroke: (left: 4pt + stroke-color, rest: 1pt + border-color),
    inset: 10pt,
    radius: (right: 4pt),
    width: 100%,
    spacing: 11pt,
    [
      #text(weight: "bold", size: 10.5pt, fill: secondary)[#title] \
      #v(3pt)
      #text(size: 9.5pt)[#body]
    ]
  )
}

// A three-question block used for every component
#let component(name, purpose, built, does, note: none) = {
  block(
    breakable: false,
    inset: (left: 10pt),
    stroke: (left: 2.5pt + primary),
    spacing: 13pt,
    [
      #text(size: 11.5pt, weight: "bold", fill: secondary)[#name] \
      #v(3pt)
      #grid(
        columns: (2.1cm, 1fr),
        column-gutter: 8pt,
        row-gutter: 5pt,
        text(size: 9pt, weight: "bold", fill: rgb("#64748b"))[Why it exists],
        text(size: 9.5pt)[#purpose],
        text(size: 9pt, weight: "bold", fill: rgb("#64748b"))[How it is made],
        text(size: 9.5pt)[#built],
        text(size: 9pt, weight: "bold", fill: rgb("#64748b"))[What it does],
        text(size: 9.5pt)[#does],
      )
      #if note != none [
        #v(3pt)
        #text(size: 9pt, style: "italic", fill: rgb("#475569"))[#note]
      ]
    ]
  )
}

#align(center)[
  #text(size: 10pt, weight: "bold", fill: primary, tracking: 1.5pt)[
    GOVERNMENT OF ASSAM · NATIONAL HEALTH MISSION (NHM) · NESFIC 2026
  ] \
  #v(4pt)
  #text(size: 20pt, weight: "black", fill: dark-slate)[
    Every Part of the Website, Explained
  ] \
  #v(2pt)
  #text(size: 13pt, weight: "medium", fill: rgb("#475569"))[
    A Section-by-Section Component Guide in Plain English
  ] \
  #v(6pt)
  #text(size: 9.5pt, fill: rgb("#64748b"))[
    *For Saurav Sinha & Soumyodeep Das* \
    Assam University, Silchar · Department of Business Administration · 14 November 2026
  ]
]

#v(14pt)

#callout(
  "How to read this guide",
  [
    The website is built from about twenty separate pieces. Each piece below gets the same three questions answered:
    *why it exists* (the problem it solves), *how it is made* (what it is built out of, in ordinary words), and
    *what it does* (what you see when you use it).
    \
    #v(2pt)
    Technical words are avoided on purpose. Where a real term is unavoidable, it is explained the first time it appears.
    Section numbers match the order of the tabs along the top of the website, so you can read this beside the live site.
  ],
  fill-color: light-bg,
  stroke-color: primary,
)

#v(6pt)

#outline(title: [Contents], indent: auto, depth: 2)

#pagebreak()

= The Big Picture

Before the parts, the shape of the whole thing.

The website is a single page that swaps its middle section in and out. It is not seven separate websites — it is
one page with seven different views. A strip at the top stays put, the middle changes when you click a tab, and a
thin footer sits at the bottom. Nearly everything the system knows lives in one shared box of numbers that every
view can read, so changing a number in one place updates the others immediately.

#callout(
  "The one idea that explains the whole design",
  [
    The system never guesses at runtime. All the heavy thinking — counting unusual call volumes, working out which
    health camps to place where, deciding which medicine to move from one clinic to another — is done by small,
    separate calculation files. The screens only *show* the results and let you *change the inputs*.
    \
    #v(2pt)
    That separation is why the site loads instantly, works offline once loaded, and why no patient data ever leaves
    the browser. There is no server behind it doing sums.
  ],
  fill-color: green-bg,
  stroke-color: green-border,
)

== The shell that holds everything together

#component(
  "App.tsx — the frame of the house",
  [
    Something has to decide which of the seven views is showing, and hold the few settings that are not tied to one
    view (how many mobile vans are available, whether the guided tour is open, whether the printable memo is open).
  ],
  [
    It is a single React component. It keeps a short list of settings in memory, and it renders the top strip, then
    *one* middle view chosen by the current tab, then the footer. When you click a tab, it writes the chosen view into
    the page address (`?view=pharmacy`), so a refresh or a shared link lands on the same screen.
  ],
  [
    It draws the frame, switches views without reloading, remembers the last view in the address bar, and passes the
    shared numbers down to whichever view is showing.
  ],
  note: "This is the only file that knows all seven views exist. Each view knows nothing about the others.",
)

#component(
  "scenarioDataContext.tsx — the shared box of numbers",
  [
    Seven screens all need the same underlying numbers: the 15 districts, the clinic medicine stocks, the 434 stalled
    patient referrals, the audit log, who is logged in, which district is selected, and whether dark mode is on.
    Without one shared source, each screen would keep its own copy and they would drift apart.
  ],
  [
    A single shared store built into React. It loads the starting data once, then holds it in memory. It also saves
    two things to the browser's local storage — the chosen theme and the current user role — so they survive a refresh.
  ],
  [
    It is the source of truth. When you change a medicine stock in the Pharmacy screen and then click to the Overview,
    the Overview already reflects it, because both read the same box. It also records every change into the audit log
    automatically.
  ],
  note: "If something on two different screens ever disagreed, this file would be where to look.",
)

#pagebreak()

= The Top Strip (Header)

The part that never moves. It is doing four jobs at once, which is why it looks busy.

#component(
  "Navbar.tsx — the top strip",
  [
    A person using this in a district office needs to know, at a glance, four things before trusting any number:
    where am I in the system, what am I allowed to see, whose data am I looking at, and is this data still unaltered.
  ],
  [
    One component with two rows. The thin upper row carries the small status chips. The thicker lower row carries the
    name and the seven tabs. The seven tabs are described once in a short list and drawn in a loop, which is why adding
    a tab later is a one-line change rather than seven copy-pastes.
  ],
  [
    Shows the Government of Assam / NHM line, the compliance label, the role picker, the district picker, the
    integrity light, and the light/dark switch. Then the seven tabs, each with a counter bubble on Retention showing
    how many patients are waiting.
  ],
  note: "The counter on the Retention tab is live — it drops from 321 to 320 the moment a counsellor logs a check-in.",
)

== The small chips in the upper row

#component(
  "The role picker (State Director / District Officer / Counsellor)",
  [
    Real health data is not equally visible to everyone. A senior official may see totals but not individual patients;
    a counsellor needs the individual list to make the phone call. The system has to enforce that difference rather than
    trust people to look away.
  ],
  [
    A small dropdown backed by one of three allowed values. Every screen reads this value and decides how much detail to
    render. Switching it is itself written into the audit log, so the record shows who looked at what.
  ],
  [
    On the Retention screen specifically: as State Director or District Officer you see the totals and a notice that
    individual case rows are restricted. Switch to Counsellor and the full 434-case worklist appears. This is why the
    same screen can look almost empty or very full depending on who is "logged in".
  ],
)

#component(
  "The district picker (All Districts + 15 districts)",
  [
    A state-level official needs the whole state. A district officer only cares about their own district and is
    distracted by the rest. The same screens must serve both.
  ],
  [
    A dropdown listing "All Districts" plus the 15 districts held in the shared box. Choosing one narrows every
    calculation and every count on every screen to that district.
  ],
  [
    Narrows the whole system. Pick Cachar and the Overview inflow drops from 3,857 calls to 520, and the outliers
    from 8 districts to 1. Nothing is hidden — the totals genuinely recompute for the smaller area.
  ],
)

#component(
  "The SHA-256 integrity light",
  [
    The system claims its records have not been quietly edited. A claim like that is worthless unless someone can see
    the answer at a glance, in the moment.
  ],
  [
    A small coloured dot plus text, reading the same validity flag that the Audit screen uses. "OK" means the chain of
    fingerprints still links up; "BROKEN" means a record was altered after it was written.
  ],
  [
    Green and "SHA-256 OK" in normal use. If someone tries to tamper with a stored record on the Audit screen, this
    light flips to red across the whole site, because every screen reads the same flag.
  ],
)

#component(
  "The light / dark switch",
  [
    District offices are not all lit the same way, and a long day of reading pale screens is genuinely tiring. This is a
    comfort feature, not a technical one.
  ],
  [
    A button that flips a single setting held in the shared box. That setting adds or removes one label on the page,
    and the style sheet has two complete colour sets — one for each mode — that swap over when the label changes.
  ],
  [
    Switches every surface, text colour and badge between the light and dark palettes instantly. Your choice is
    remembered after a refresh.
  ],
  note: "Both palettes were checked so that text stays readable against its background in either mode. The dark mode is not just the light mode inverted.",
)

#pagebreak()

= Tab 1 — Overview

The "morning briefing" screen. Its job is to answer "is anything wrong today, and where" in about five seconds.

#component(
  "The four big number cards",
  [
    A senior official will not read a table of 15 districts. They need the four facts that determine whether today
    requires action: how many people called, how many districts are unusual, how many patients have dropped out of care,
    and whether any clinic is running out of medicine.
  ],
  [
    Four cards, each showing one headline number with a short plain sentence underneath and a thin coloured bar.
    The numbers are not typed in — they are counted from the shared data every time the screen draws. The bar width is
    the share of the relevant whole, so a glance shows "8 of 15" without reading.
  ],
  [
    Tele-MANAS inflow (calls in the last 30 days), surge outliers (districts whose call volume is statistically
    unusual), stalled care queue (patients over 14 days without a visit), and critical medicines (clinics under 15 days
    of stock). Each card also carries a one- or two-word verdict such as "Action prompt" or "Human follow-up".
  ],
  note: "The four cards answer four different questions on purpose: how much demand, where it is unusual, whether patients are being lost, and whether treatment can continue.",
)

#component(
  "The surge list — districts flagged as unusual",
  [
    A raw call count is misleading. A small hill district with 40 calls might be far more alarming than a city with 400,
    because the hill district normally gets 8. This section exists to compare each district against its own normal
    rather than against other districts.
  ],
  [
    Each flagged district appears as a row with a coloured spine down the left edge. The row shows the district, its
    region and population, the percentage change, a "Z" figure, and the expected-versus-actual call counts. The Z
    figure is a standardised score: how many "typical wobbles" away from normal this is. Anything beyond about 2.5 is
    flagged. The rows are generated by the surveillance engine, not written by hand.
  ],
  [
    Ranks the genuinely alarming districts at the top, each with the evidence beside it, and links through to the full
    Surveillance screen for the complete table.
  ],
  note: "The Z figure looks technical but means something simple: how surprising this number is. Z = 6.3 means 'this basically does not happen by chance'.",
)

#component(
  "The three action panels (vans, stalled care, pharmacy)",
  [
    Knowing something is wrong is not the same as knowing what to do. Each panel converts one finding into one
    concrete next step with a link to the screen where you would actually do it.
  ],
  [
    Three compact panels side by side. Each is a short summary plus a button that jumps to the relevant working screen.
    The "Cachar mobile van optimisation" panel, for example, shows the result of the camp-placement calculation
    (31.0% saved, 35.3 minutes versus 51.2) and offers a button straight to the planning screen.
  ],
  [
    Turns observation into action: "here is the problem, here is the screen where you fix it". Without these the
    Overview would be a report; with them it is a starting point.
  ],
)

#pagebreak()

= Tab 2 — Surveillance

The detection engine. This screen answers "which districts are genuinely unusual, and how sure are we".

#component(
  "The abnormal-call detector",
  [
    Mental distress shows up in phone calls before it shows up in hospital records. But call volumes naturally rise and
    fall, and during floods they rise everywhere. A system that shouts at every rise is useless; one that stays silent
    during a real flood is dangerous.
  ],
  [
    A small calculation file compares the calls a district actually received against the number it would normally
    expect, given its population and season. It then asks a precise question: if nothing unusual were happening, how
    likely is a number this high? That likelihood is the p-value. A p-value below 0.01 is treated as a real signal.
    A flood multiplier is applied to districts in flood zones so that a predictable flood-driven rise is not mistaken
    for something new.
  ],
  [
    Produces, for every district, an expected count, an actual count, a Z score and a p-value, then flags the ones that
    clear the bar. The screen lists the flagged districts as alert cards and shows the rest in a full sortable table.
    Each row states plainly whether it exceeded the threshold.
  ],
  note: "This deliberately does not diagnose anyone. It flags a place and time for a human to look into. That distinction is stated on the screen itself.",
)

#component(
  "The regional grouping (Normal weather / Barak Valley / Brahmaputra Valley / Hill Districts)",
  [
    Assam's regions behave differently. A number that is alarming in the hills may be ordinary in the Brahmaputra
    valley. Grouping by region stops the reader from comparing things that are not comparable.
  ],
  [
    Each district carries a region label in the data. The screen uses that label to group rows and to colour the
    region markers, so the eye can jump to the region it cares about.
  ],
  [
    Lets a district officer find their area quickly, and makes it obvious when a whole region is moving together
    rather than one district spiking alone.
  ],
)

#component(
  "The scenario presets (four buttons)",
  [
    An empty demonstration system proves nothing. Evaluators need to see the system react to a real event, quickly,
    without anyone typing data in live.
  ],
  [
    Four buttons, each holding a prepared set of changes: a normal baseline, a Barak Valley flood, a Brahmaputra
    river crisis, and a festival-period surge. Pressing one applies all of its changes at once and records that it
    happened in the audit log.
  ],
  [
    Recreates a realistic crisis in one click, so the same screens can be shown reacting to it. This is what the
    evaluator tour uses to demonstrate the system under stress.
  ],
  note: "These are demonstration scenarios, clearly labelled as such. They are not predictions of real events.",
)

#pagebreak()

= Tab 3 — Van Siting

The planning engine. This screen answers "we have two mobile health vans and eight blocks — where should each van park".

#component(
  "The camp placement calculator",
  [
    Two vans cannot serve eight blocks at once. Someone must choose which two locations to use, knowing that people will
    have to travel to reach them. Choosing badly means some people travel for two hours; choosing well means most
    people travel far less. That choice should be made by arithmetic, not by whoever speaks loudest in the meeting.
  ],
  [
    A calculation file tries every possible combination of two facilities out of the six available, and for each
    combination works out the cheapest way to assign all eight blocks to those two. It then keeps the combination with
    the lowest total. The travel times come from a measured table of road times between each block and each facility,
    so the answer reflects real geography rather than straight-line distance.
  ],
  [
    Names the two blocks where the vans should park, states how much travel time that saves compared with simply
    parking at headquarters, and shows the calculation time. The current result is a 31.0% reduction — 35.3 minutes of
    average travel instead of 51.2.
  ],
  note: "The key phrase on screen is 'Optimal'. It means no other arrangement of two vans produces a lower total travel time. That is a guarantee, not an estimate.",
)

#component(
  "The catchment map",
  [
    A list of two place names does not show a person how the district actually reorganises. A picture does, instantly.
  ],
  [
    A hand-drawn diagram of Cachar district with its eight blocks positioned roughly geographically, and the six health
    facilities marked. Dotted lines connect each block to the facility chosen for it, so the routing is visible at a
    glance. The two active camp locations are highlighted.
  ],
  [
    Shows which villages feed into which camp. A reader can see at once whether the eastern blocks are being served or
    left to travel far.
  ],
)

#component(
  "The optimization impact cards",
  [
    The improvement figure needs to be trustworthy and checkable, not just a large confident percentage.
  ],
  [
    Two side-by-side cards: what happens if vans park at headquarters (the naive approach), and what happens with the
    calculated placement. Each shows the resulting average travel time. The difference between them is the saving.
  ],
  [
    Makes the before-and-after explicit, so the 31.0% improvement can be verified by reading two numbers rather than
    trusting one.
  ],
)

#component(
  "The block table and the van count control",
  [
    Planners need to see the assumptions behind the answer — how many people live in each block, how many are expected to
    need care, and how bad the flooding is there — and they need to try "what if we had three vans instead of two".
  ],
  [
    A table with one row per block showing population, expected distress rate, flood severity and resulting demand, plus
    which camp it was assigned to and how long people travel. A small control changes the number of available vans, which
    re-runs the whole calculation immediately.
  ],
  [
    Lets anyone audit the inputs and watch the recommendation change when resources change. Increasing the van count
    changes the recommended locations, which is exactly the comparison a decision-maker needs.
  ],
)

#pagebreak()

= Tab 4 — Pharmacy

The supply screen. This answers "which clinic is about to run out, and what do we move where".

#component(
  "The days-of-cover display",
  [
    "We have 4,000 tablets" says nothing useful. "We have four days left" says everything. Medicine risk has to be
    expressed in time remaining, not in stock counts.
  ],
  [
    For each clinic and each of the three essential medicines, the system divides current stock by the daily rate at
    which it is being used, producing a number of days. Each line is then sorted into one of three bands: comfortable
    (more than 30 days), low (15 to 30 days), and critical (under 15 days).
  ],
  [
    Shows every facility-medicine line with its days of cover and a coloured band. A reader can immediately count how
    many lines fall in each band — currently 13 lines comfortable, 2 low, and 3 critical, out of 18 lines in total.
  ],
  note: "The 15-day line is the important one. It is set to allow enough time for a physical transfer to happen before the shelf is empty.",
)

#component(
  "The rebalancing recommendations",
  [
    A district often has too much of a medicine in one clinic and too little in another nearby. Buying more is slower and
    costs money; moving what already exists is faster and free. But someone has to work out the sensible transfers.
  ],
  [
    The system looks for a clinic with a comfortable surplus and pairs it with a clinic in deficit, for the same
    medicine, and works out how many tablets to move so the receiving clinic reaches a safe buffer and the giving clinic
    stays safe too. Each recommendation is presented as a donor, a recipient, and a quantity.
  ],
  [
    Produces concrete transfer instructions — for example, moving 3,854 tablets of Fluoxetine from a surplus clinic to
    one in deficit — with the resulting days-of-cover at both ends shown, so the effect of the move is visible before
    it is approved.
  ],
)

#component(
  "The dispatch button and its feedback",
  [
    A recommendation that cannot be acted on is only advice. The screen has to let someone record that the transfer was
    actually dispatched, and prevent the same transfer being ordered twice.
  ],
  [
    Each recommendation carries a single action button. Pressing it marks that specific transfer as dispatched, changes
    the button's appearance and wording, and writes an entry into the audit log.
  ],
  [
    Converts a suggestion into a recorded action. Once pressed, the button reads "Dispatched" and is no longer
    clickable, so the same transfer cannot be double-ordered.
  ],
)

#pagebreak()

= Tab 5 — Retention

The follow-up screen. This answers "who has been lost, and has anybody actually called them".

#component(
  "The care funnel",
  [
    The system must show *why* a follow-up queue exists at all. Of everyone who calls the helpline, very few end up
    receiving sustained treatment, and without someone chasing them they quietly disappear.
  ],
  [
    Four stacked steps showing how a large starting number shrinks: 10,000 initial callers, 2,400 reaching specialist
    triage, 850 referred to a clinic, and only about 320 completing verified recovery. Each step shows both the number
    and the percentage, so the drop-off is unmistakable.
  ],
  [
    Makes the scale of the problem visible in one glance, and justifies why the rest of the screen — the chasing — is
    worth staff time.
  ],
  note: "The funnel is the argument for the whole retention feature. Without it, the worklist looks like bureaucracy rather than rescue.",
)

#component(
  "The three status counters",
  [
    Any follow-up process needs to distinguish three states: still waiting, actively being chased, and successfully
    back in care. A single "stalled" number cannot show progress.
  ],
  [
    Three counters that are recomputed from the patient list each time it changes — how many are waiting for a
    counsellor check-in, how many have active outreach in the field, and how many have resumed care.
  ],
  [
    Shows whether the team is making progress. Logging a check-in moves a patient out of the first counter and into the
    second, so the numbers visibly shift as work is done — 321 waiting and 96 in field becomes 320 and 97.
  ],
)

#component(
  "The patient worklist table",
  [
    Someone has to actually make the phone calls, and they need to know who to call and why that person is on the list.
  ],
  [
    A paginated table with one row per patient, showing a case reference, the village area, the language and need
    category, how long they have been stalled, and the clinic they were referred to. Each row has a single action
    button. The table is only fully visible to the Counsellor role, as described in the header section.
  ],
  [
    Gives the counsellor a concrete list to work through, and records the outcome of each call so the same patient is
    not chased twice and the case history is complete.
  ],
  note: "The language column exists because advice in the wrong language is not advice. It is there to be used when making the call.",
)

#component(
  "The check-in outcome dialog",
  [
    "Did you call them?" is not enough. What happened on the call determines the next step, and it has to be captured in
    a consistent way rather than in free text.
  ],
  [
    Pressing the action button opens a small dialog offering four fixed outcomes: a completed callback (the case stays
    open), referral to a village health worker (an ASHA, who visits the home — the case stays open), a confirmed clinic
    visit (the case closes as attended), or the patient declining further contact (the case closes as not attended).
  ],
  [
    Records what happened and updates the patient's status accordingly, which moves the counters and the row's label.
    The two outcomes that mean "still needs us" keep the case open; the two that mean "resolved either way" close it.
  ],
  note: "Only two of the four outcomes actually clear a case from the queue. That is deliberate — getting in touch is not the same as getting care.",
)

#component(
  "The privacy notice and the small-number protection",
  [
    Patient lists are sensitive, and in a small village a count of "3 people with a particular condition" effectively
    identifies those three people. Showing such a number would breach the privacy law the system claims to follow.
  ],
  [
    The system checks any small group before displaying it. If a cell would contain fewer than ten people, the number
    is suppressed rather than shown. A companion rule hides a second figure when it could be used, together with a
    visible one, to work out a hidden one by subtraction. A short explanatory panel on the screen states this plainly
    for anyone reviewing the system.
  ],
  [
    Prevents the site from accidentally revealing individuals through arithmetic. Where a number is withheld, the screen
    says so instead of showing a misleading zero.
  ],
  note: "This is the part of the system most worth understanding. It is the difference between a demo and something a government could actually deploy.",
)

#pagebreak()

= Tab 6 — Audit

The trust screen. This answers "can we prove nobody quietly changed the record".

#component(
  "The fingerprint chain",
  [
    Any logged change is worthless if the log itself can be edited afterwards. The system needs a way to make silent
    editing detectable, permanently.
  ],
  [
    Every entry gets a fingerprint computed from its own contents *plus the fingerprint of the entry before it*.
    Because each fingerprint depends on the previous one, altering any entry changes its fingerprint, which breaks the
    link to every entry after it. Recomputing the whole chain to cover the change would itself be detectable because the
    earlier fingerprints are recorded elsewhere.
  ],
  [
    Makes the log tamper-evident. The screen states whether the chain currently links up correctly, and shows each
    entry's own fingerprint alongside the previous one so the linking is visible, not just asserted.
  ],
  note: "The word is tamper-*evident*, not tamper-proof. Nothing can stop someone editing a file; the point is that the edit can never be hidden.",
)

#component(
  "The entry table",
  [
    An auditor needs to see who did what, when, and in what role — in a form they can read without technical help.
  ],
  [
    A table with one row per recorded action: a sequential entry number, the date and time, the role in use at the
    time, the scope (which district), the kind of action, a plain description, and the two fingerprints. Entries are
    added automatically whenever anyone changes a scenario, switches role, or logs a patient outcome.
  ],
  [
    Provides a complete, readable history of every change made in the session, newest first.
  ],
)

#component(
  "The tamper test and reset buttons",
  [
    A claim of tamper-detection is unconvincing unless a reviewer can trigger a tamper and watch the system catch it.
    Otherwise the green "OK" light proves nothing.
  ],
  [
    One button deliberately alters a stored entry to simulate an attack; another clears the session and returns
    everything to its starting state. Both are ordinary buttons on the screen, available to anyone reviewing.
  ],
  [
    Pressing the tamper button immediately flips the integrity light to red and explains that the chain no longer
    links, demonstrating the protection live rather than describing it. The reset button returns the demonstration to a
    clean state for the next viewer.
  ],
  note: "This is the strongest single thing on the site to show an evaluator. It converts a claim into a demonstration in about two seconds.",
)

#pagebreak()

= Tab 7 — Method

The honesty screen. This answers "how do you know, and what can this not do".

#component(
  "The formula page",
  [
    Operators should not have to read mathematics to use the system, but a reviewer or a faculty member will insist on
    seeing it. Rather than clutter the working screens with equations, they are all collected here on one page.
  ],
  [
    A single scrollable page with one short block per engine — detection, placement, follow-up — each stating the idea
    in a sentence and then the actual formula in a monospaced box. The formulas match what the calculation files really
    do, because they are the same expressions.
  ],
  [
    Lets a technical reviewer verify the method without slowing down an operator. The working screens link here instead
    of embedding maths.
  ],
)

#component(
  "The compliance and limitation notes",
  [
    Every decision-support system has limits, and a system that hides them is less trustworthy than one that names them.
    Stating limitations up front also protects the team from over-claiming.
  ],
  [
    Plain text sections listing the legal basis for the privacy rules (the Mental Healthcare Act and the data protection
    law) and an explicit list of what the system does not do — it does not diagnose, does not replace clinical
    judgement, and relies on demonstration data rather than live government feeds.
  ],
  [
    Sets honest expectations. A reviewer reads what the system claims, what it refuses to claim, and what it would need
    before real deployment.
  ],
  note: "The limitations section is not a weakness in a submission. It is usually the section that makes reviewers trust the rest.",
)

#pagebreak()

= The Overlay Tools

Things that appear on top of whichever tab you are on, rather than being tabs themselves.

#component(
  "The plain-English command bar",
  [
    Most users of a government system will not learn a menu hierarchy. Typing a sentence is faster than hunting for the
    right screen and the right control.
  ],
  [
    A text box at the top of the working area that reads a short typed instruction, picks out the district, the action
    and the value, and applies it. It recognises a limited set of phrasings rather than general language, and it says so
    when it does not understand.
  ],
  [
    Turns a sentence into a change. Typing "Set vans to 3" updates the van count and re-runs the placement calculation;
    "Floods hit Katigorah" raises that block's flood severity. If it cannot parse the sentence it replies with examples
    of what it does understand rather than failing silently.
  ],
  note: "It answers with a confirmation message naming exactly what it changed, so a mistyped command cannot quietly alter a figure.",
)

#component(
  "The evaluator tour",
  [
    A reviewer has limited time and will not discover the system's strengths by clicking around. The walkthrough makes
    sure the four strongest points are seen, in order, in about a minute.
  ],
  [
    A floating panel with four prepared stops: detection, placement, follow-up, and the audit chain. Each stop switches
    to the relevant tab, explains in two sentences what makes it notable, and offers one button that triggers the
    demonstration — such as injecting the flood scenario. There is also an automatic advance option for hands-free
    presenting.
  ],
  [
    Guides a viewer through the strongest evidence without them needing to know where anything is. It is the difference
    between a reviewer poking at a screen and a reviewer being shown a coherent argument.
  ],
  note: "Each stop names which of the challenge's criteria it demonstrates, so the connection to the brief is explicit rather than implied.",
)

#component(
  "The printable decision memo",
  [
    The website convinces someone sitting at a computer. The decision it recommends has to travel — to a meeting, a
    signature, a file. A screen does not travel; a document does.
  ],
  [
    A single generated document laid out like an official government directive, with a reference number, a date, a
    classification line, a headline summary of four key figures, and four numbered sections covering detection, van
    deployment, medicine transfers and follow-up. Every figure is pulled live from the same shared data as the screens,
    and it carries the current audit fingerprint at the bottom.
  ],
  [
    Produces a printable decision brief with the same numbers as the screen. Printing it yields clean black text on
    white paper — the navigation, tabs and buttons are deliberately removed from the printed page.
  ],
  note: "The memo is generated from live data rather than hand-written, so it can never disagree with what the screens currently show.",
)

#pagebreak()

= The Machinery Underneath

The parts a user never sees. Worth knowing because this is where the system actually earns trust.

#component(
  "The calculation files (engine folder)",
  [
    Mixing arithmetic into screen code makes it impossible to test and easy to break. Keeping it separate means the
    numbers can be checked independently of how they are displayed.
  ],
  [
    Five small, self-contained files: detection, placement, medicine movement, the audit recorder, and the seed data.
    Each takes plain numbers in and gives plain numbers out, with no knowledge of buttons or screens. A separate test
    file checks that the well-known results still come out the same.
  ],
  [
    Does all the actual thinking. Because they are isolated, the fourteen automated tests can confirm the answers are
    correct without opening a browser.
  ],
  note: "If a number on screen looks wrong, these files are where to look — not the screens.",
)

#component(
  "The sample data",
  [
    The system must be demonstrable before any government data is connected, and must never expose a real patient during
    a demonstration.
  ],
  [
    Fifteen districts with realistic populations and regions, eight Cachar blocks with a measured road-time table
    between them, six health facilities with medicine stocks, and 434 generated patient referrals with case references
    and plausible details. All of it is made up, consistent, and held in plain files.
  ],
  [
    Gives every screen something realistic to show. Because the patient details are generated rather than real, the
    demonstration carries no privacy risk at all.
  ],
  note: "The word for this is synthetic data. It is a feature, not a shortcut, and the limitations page says so explicitly.",
)

#component(
  "The CSV import path",
  [
    Eventually real data will arrive from a government system, almost certainly as a spreadsheet export. There needs to
    be a defined way for that data to enter, or the whole thing stays a closed demo forever.
  ],
  [
    A small reader that accepts a structured spreadsheet file, checks the columns it expects, rejects rows that do not
    fit, and reports what it did. It is the intended doorway between the demonstration and a real feed.
  ],
  [
    Provides the upgrade path. Nothing in the screens changes — the imported data simply replaces the sample data in the
    shared box.
  ],
  note: "This is the piece to point at when asked 'how would this work with real data'. The answer is already built.",
)

#pagebreak()

= Quick Reference

== Which screen answers which question

#table(
  columns: (3.4cm, 1fr),
  stroke: none,
  align: (left, left),
  inset: (x: 6pt, y: 5pt),
  table.header(
    [*Tab*], [*The question it answers*],
  ),
  [Overview], [Is anything unusual today, and roughly where?],
  [Surveillance], [Exactly which districts are unusual, and how confident are we?],
  [Van Siting], [Given limited vans, where should we park them?],
  [Pharmacy], [Which clinic runs out first, and what do we move?],
  [Retention], [Who has been lost, and has anyone followed up?],
  [Audit], [Can we prove the record was not edited?],
  [Method], [How does it work, and what can it not do?],
)

#v(10pt)

== Which tool to use when

#table(
  columns: (4.2cm, 1fr),
  stroke: none,
  align: (left, left),
  inset: (x: 6pt, y: 5pt),
  table.header(
    [*Tool*], [*Use it when*],
  ),
  [Command bar], [You know what you want to change and would rather type it than find the control],
  [Evaluator tour], [Someone is seeing the system for the first time and you have one minute],
  [Decision memo], [Something needs to leave the screen — a meeting, a signature, a file],
  [Scenario presets], [You need to show the system reacting to a real event, immediately],
  [Role picker], [You need to show that privacy is enforced, or to unlock the patient list],
)

#v(10pt)

#callout(
  "The one-sentence summary of the whole site",
  [
    Seven screens each answer one question an official actually asks; a shared box of numbers keeps them consistent; a
    separate set of small calculation files does the thinking; an unbroken chain of fingerprints proves nothing was
    quietly changed; and a printable document carries the decision out of the room.
  ],
  fill-color: green-bg,
  stroke-color: green-border,
)
