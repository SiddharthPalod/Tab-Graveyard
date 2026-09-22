# ☠️ Tab Graveyard — Master Architecture

## Phase 0 — Define the MVP

The 3 Core ComponentsThe Engine (Background Worker): Silently observes Chrome. It logs timestamps, active durations, and close events to IndexedDB without ever interrupting the user.The Graveyard (The Database): The underlying IndexedDB ledger storing every tab's metadata, history, and behavioral profile.The Tombstone (The Popup UI): The drop-down menu when you click the extension icon. This is the user's safety net and control center.How Tabs Live and Die Now1. The Natural Death (Manual Close)You click the "X" on a tab.Under the hood: The Engine catches onRemoved and marks it Dead in the Graveyard.The Experience: The tab vanishes from the browser, but if you click the Tombstone icon, that tab is sitting right at the top under "Recently Deceased," ready to be revived with one click.2. The Mass Extinction (Browser Close)You close Chrome entirely without session restore.Under the hood: The Engine recognizes the window closing. All active tabs are marked Dead and grouped by timestamp into a single Session.The Experience: Next time you open Chrome, you start fresh. You click the Tombstone icon, and it says: "Previous Session (34 tabs) buried yesterday at 11:32 PM. [Resurrect All]".3. The Active Sweep (Decluttering via the Tombstone)This is how we solve the hoarding problem with zero friction.You have 50 tabs open. You feel overwhelmed. You click the extension icon to open the Tombstone.Inside the popup, it shows you the Behavioral Mirror we talked about:You have 15 Zombie Tabs (untouched for 3 days).[ 🧹 Sweep to Graveyard ]You click that button. The extension instantly closes those 15 tabs in your browser. They are safely packed away into the Graveyard, and you can breathe again.Why This Nails the Psychology of Tab HoardingUsers hoard tabs because they are terrified of "losing the thought." If they bookmark it, it goes into a folder they'll never check. If they use Chrome History, it's a nightmare to search.By making the Tombstone the popup UI, you give them a visual, omnipresent safety net. They are willing to close tabs because the Tombstone is always right there in the toolbar. It feels like moving a paper from your active desk to the top drawer, rather than throwing it in the trash.

The extension tracks tab usage silently and gives users a safe, anxiety-free way to collapse clutter without feeling like they are deleting important links.

No accounts.
No backend.
No manual tagging.
Everything local.

**Stack:**

```text
Chrome Extension — Manifest V3
TypeScript
React
IndexedDB
Tailwind

```

---

## Phase 1 — Tab Tracking Engine

Build the silent observer.

### Chrome APIs

```text
chrome.tabs
chrome.windows
chrome.sessions
chrome.storage

```

Store this structure in IndexedDB:

```json
{
  "tabId": 123,
  "url": "https://github.com/...",
  "title": "Building a Database",
  "domain": "github.com",
  "openedAt": "...",
  "lastActivatedAt": "...",
  "totalActiveTime": 1842,
  "activationCount": 7,
  "status": "aging"
}

```

Rely only on what the browser provides consistently. If an event is flaky, drop it.

---

## Phase 2 — Tab Lifecycle

Define the state machine. Tabs degrade automatically based on inactivity.

| State | Condition | Visual Cue |
| --- | --- | --- |
| 🟢 Alive | Active recently | Normal browser behavior |
| 🟡 Aging | 3+ days inactive | Dust settling |
| 🟠 Forgotten | 14+ days inactive | Cobwebs |
| 💀 Dead | 30+ days inactive | Buried |

Never auto-delete a tab. Just change its internal status to track how much of the user's browser is currently occupied by dead weight.

---

## Phase 3 — The Graveyard UI

Build a fast, local dashboard that leans into the cemetery aesthetic. It should feel like a fun relief to visit, not a sterile settings page.

```text
☠️ TAB GRAVEYARD

204 tabs buried. Browser breathing normally.

┌──────────────────────────┐
│ 🪦 React Documentation   │
│ Dead for 31 days         │
│ Visited 14 times         │
│                          │
│ [REVIVE] [BURY FOREVER]  │
└──────────────────────────┘

```

---

## Phase 4 — The Tombstone Tab (The Spatial Memory Fix)

This is the core solution to tab hoarding. Users keep tabs open because they use the tab bar as a spatial to-do list.

Give them a middle ground. Let them select 15 tabs from a specific research rabbit hole and click: **[Collapse to Tombstone]**.

The extension closes those 15 tabs and opens **ONE** pinned tab in their place:

```text
[Icon: 🪦] React Project Research (15 buried)
──────────────────────────────────────────
Collapsed on Oct 24. 

[RESURRECT ALL] 

Contents:
- React Docs: Hooks
- StackOverflow: useEffect infinite loop
- GitHub: React router

---

## Phase 5 — The Behavioral Mirror (Zero-Input Profiling)

Replace manual tagging with passive behavioral analysis. Show users exactly how they are (not) using their tabs to break the illusion that everything is important.

Use the data from Phase 1 to categorize the graveyard automatically:

```text
☠️ YOUR PURGATORY

👻 The Phantoms (42 tabs)
Opened in background, viewed < 5 seconds. 
(You just wanted to save the link).

🧟 The Zombies (15 tabs)
Clicked for 2 seconds daily, never read. 
(You are just making sure they are still there).

🏺 The Artifacts (8 tabs)
Spent 2+ hours here last week, 0 minutes this week. 
(You are done with this project).

```

This requires simple thresholds (`totalActiveTime`, `activationCount`, `lastActivatedAt`). No ML required.

---

## Phase 5 — The Behavioral Mirror (Zero-Input Profiling)
Replace manual tagging with passive behavioral analysis. Show users exactly how they are (not) using their tabs to break the illusion that everything is important.

Use the data from Phase 1 to categorize the graveyard automatically:

☠️ YOUR PURGATORY

👻 The Phantoms (42 tabs)
Opened in background, viewed < 5 seconds. 
(You just wanted to save the link).

🧟 The Zombies (15 tabs)
Clicked for 2 seconds daily, never read. 
(You are just making sure they are still there).

🏺 The Artifacts (8 tabs)
Spent 2+ hours here last week, 0 minutes this week. 
(You are done with this project).

This requires simple thresholds (totalActiveTime, activationCount, lastActivatedAt). No ML required.

## Phase 6 — Temporal Sessions & One-Click Sweeps
Build features that clear clutter effortlessly.

1. Resurrect Session Group tabs opened or active around the same time window into deterministic temporal sessions. Let users restore an entire past workspace with one click.

2. The One-Click Sweep Allow users to clear out specific profiles of tabs instantly without confirmation dialogs.

[ 🧹 Sweep all Phantoms to Graveyard ] [ 🧹 Collapse all YouTube tabs to one Tombstone ]

Because resurrection is guaranteed and instantaneous, users will trust the sweep.

---

## Phase 7 — Search & Filters

Make retrieval bulletproof.

```text
Search: `github`
Filter: `Domain` + `Status: Dead`
Filter: `Profile: Artifacts` + `Date > 30 days`
and so on..

```

Since everything is indexed locally in IndexedDB, this search should resolve in milliseconds.

---

## Phase 8 — Graveyard Topics (Local Statistics)

Extract simple keyword frequency from the `Title`, `URL`, and `Domain` to create automatic folders.

```text
"Raft implementation"
"Raft consensus paper"
"Distributed database"
"etcd consensus"

      ↓

🧠 Distributed Systems (17 buried tabs)

```

Strip stop words and count occurrences. Present this as "Your forgotten interests."

---

## Phase 9 — Optional Local Embeddings

If you want to push the technical boundaries, add a small, in-browser embedding model (like Xenova/transformers.js) to map semantic relationships.

```text
      Tab Title + URL
             ↓
      Local Embedding
             ↓
    In-Browser Vector DB
             ↓
      Semantic Topics

```

This allows the extension to link "How Raft achieves consensus" with "CockroachDB internals" even if they share zero exact keywords. Keep it strictly client-side to maintain privacy guarantees.

---

## Phase 10 — Package & Publish

Finalize the asset pipeline.

```text
README (Focus heavily on the "Spatial Memory" and "Zero Friction" angles)
Screenshots (Show the Tombstone tab in action)
Demo GIF (Record sweeping 50 tabs into one Tombstone instantly)
Privacy explanation (Highlight "Everything Local")
Chrome Web Store package
GitHub repository

```