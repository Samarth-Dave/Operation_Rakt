# 🎯 Operation Rakt — Live Demo Walkthrough
### SIH Internal Round · 3-Minute Scripted Demo

---

> [!IMPORTANT]
> **Before demo day:** Wipe the Neo4j database (`Wipe Database` button) so you start with a completely empty graph. This makes the live graph-building moment dramatically more powerful.

---

## Pre-Demo Checklist

- [ ] `docker compose up -d` — Neo4j running at `bolt://localhost:7687`
- [ ] `uvicorn app.main:app --host 0.0.0.0 --port 8000` — Backend live
- [ ] `npm run dev` — Frontend live at `http://localhost:5173`
- [ ] Click **Wipe Database** — confirm empty graph (0 Nodes, 0 Links in sidebar)
- [ ] Browser is full-screen, font size comfortable for the room
- [ ] Keep the 4 FIR `.txt` files open in a text editor as a backup

---

## The Story You're Telling

> *"Mumbai Anti-Extortion Cell receives 4 separate FIRs across 3 police stations spanning 6 weeks. In the current system, they sit in 4 different folders. Nobody connects the dots. Operation Rakt does it in real-time."*

---

## Act 1 — The Problem (0:00 – 0:30)

**What to say:**

> "Judges, every year thousands of FIRs are filed across Indian police stations — handwritten, in Hindi-English mix, unstructured. Intelligence silos mean that FIR-0187 filed in Andheri and FIR-0192 filed in Jogeshwari never talk to each other, even if they describe the same criminal gang.

> Operation Rakt changes that. Watch what happens when I upload just the first FIR."

**What to click:** Nothing yet — just show the clean empty graph canvas.

---

## Act 2 — FIR #1: The First Node Appears (0:30 – 1:00)

**Click:** `Ingest FIR` button in the left sidebar.

The upload modal opens. Point out the pipeline steps at the bottom:
`OCR / Text Parse → Gemini Extraction → BNS 2023 Tagging → Human Review → Neo4j Upsert`

**Click:** `Case #1 — Andheri Extortion`

**While Gemini is processing (10-15s), say:**
> "The document is being run through our OCR pipeline, then sent to Gemini with a strict JSON schema — it cannot free-text hallucinate, it can only fill structured slots: Person, Object, Location, Event. Each field maps to the POLE international law enforcement data model."

**When the Human Review screen appears:**

Point to the extracted entities. Key things to highlight:
- **Person:** `Chhotu` (Suspect), `Vikram` (Syndicate Leader, Delhi), `Shankar Yadav`, `Rajesh Kumar Agarwal` (Victim)
- **Object:** `Bajaj Pulsar MH-02-AB-1234` — a specific, real vehicle registration
- **Location:** `Agarwal Textile Mills`, `Shankar Tea Stall, Lokhandwala`
- **Event:** `Extortion Demand ₹2L`
- **BNS Tag:** `Section 308 — Extortion`

> "This is the Human-in-the-Loop screen. If OCR misread a digit on a vehicle plate — which happens on scanned documents — the IO can fix it here before it's permanently committed to the graph. This is what makes the evidence court-admissible."

**Click:** `Commit to Knowledge Graph`

**Watch:** The graph appears with ~8 nodes. Say:
> "We now have our first cluster — a victim, a suspect, a vehicle, a money drop location, and an unidentified kingpin named Vikram in Delhi."

---

## Act 3 — FIR #2: The Graph Grows & Links Appear (1:00 – 1:30)

**Click:** `Ingest FIR` → `Case #2 — Jogeshwari Threat`

**While processing, say:**
> "This is a completely separate FIR, filed 7 days later at a different police station — Jogeshwari East. The IO there doesn't know about the Andheri case."

**When Review screen appears:**
- Highlight **Deepak Jadhav**, **Maruti Swift MH-04-CD-5678**, **Royal Hotel Goregaon West**, and that `Ramesh` is mentioned as a money collector — same location as in FIR #1.

**Click:** `Commit to Knowledge Graph`

**Watch:** The graph re-renders. `Ramesh / Royal Hotel` node will merge with the existing node from FIR #1 (because MERGE, not CREATE). Point to this:

> "Notice — the system used Cypher MERGE, not INSERT. `Royal Hotel, Goregaon West` already existed from FIR #1. The graph has automatically connected Andheri and Jogeshwari. Two FIRs, one intelligence picture."

---

## Act 4 — FIR #3: The Hawala Spine Revealed (1:30 – 2:00)

**Click:** `Ingest FIR` → `Case #3 — Crime Branch Hawala`

> "This is an Intelligence Bureau tip-off filed by SI Priya Deshmukh. It names the full money trail."

**When Review screen appears**, highlight:
- **Ramesh Gupta** — HDFC Bank A/C ending 4589, cash deposits 15-20 lakh/month
- **Vikram Singh Tomar** — Delhi, the kingpin. 3 prior extortion cases.
- **Suresh Pandey** — Thane, logistics coordinator
- **Toyota Fortuner MH-01-EF-9012** — Ramesh's vehicle
- **Honda City DL-03-GH-3456** — Vikram's Delhi vehicle
- The explicit money flow: `Victim → Shankar → Ramesh → Vikram`

**Click:** `Commit to Knowledge Graph`

**Watch:** Graph explodes in complexity — now 25-30 nodes. Say:
> "We now have a fully connected criminal network spanning Mumbai suburbs and Delhi — assembled from 3 separate FIRs in under 90 seconds."

---

## Act 5 — Network Analysis: Who Is the Kingpin? (2:00 – 2:20)

**Click:** `Analyze Network` button.

> "Traditional databases are passive storage. We now run live mathematical analysis — Betweenness Centrality and PageRank — via Neo4j's Graph Data Science library."

**Watch:** The red intel banner appears at the bottom. A node starts glowing with a dashed ring.

> "The algorithm has identified **Ramesh Gupta** as the single critical bottleneck — Betweenness score 0.40. He's not the most feared person on the street. But mathematically, he is the bridge between every street-level extortionist in Andheri and Jogeshwari, and the Delhi syndicate leadership. Without him, money doesn't move."

**Click on Ramesh Gupta's node.**

Point out the Node Detail panel on the right: Betweenness score, PageRank, description, the linked bank account.

---

## Act 6 — Kingpin Arrest Simulation (2:20 – 2:50)

> "Before Inspector Raj sends a strike team tonight, he asks one question: *If we arrest Ramesh, does the gang collapse or just reorganize?*"

**Toggle:** `Simulate Arrest` switch in the sidebar (turns red).

**Click on Ramesh Gupta's node on the canvas.**

**Watch the graph shatter.** The network fragments into isolated clusters, each recolored.

> "Watch the canvas. This is a real graph computation — not a scripted animation. The system has removed Ramesh's node, recomputed connected components, and identified that the network has fragmented into **3 isolated clusters**. The Andheri street collectors are now severed from Thane logistics, and Thane is severed from Delhi leadership."

Point to the red Intel Banner at the bottom showing `1 → 3 Components`.

> "Raid Ramesh tonight. The syndicate is blind."

---

## Act 7 — FIR #4: Live Ingest During Demo (Optional — if time allows)

**Click:** `Ingest FIR` → `Case #4 — Versova Assault`

> "A fourth FIR just came in — a physical assault in Versova. Watch: Deepak and Bunty appear. And Ramesh's name is mentioned again as the collection drop."

After commit: Versova nodes connect directly into the now-arrested-simulation graph, making the fragmentation even clearer.

---

## Closing Line (2:50 – 3:00)

> "We chose to build Modules A and C to full mathematical depth — real OCR, real LLM extraction, real graph computation — rather than four modules shallowly. Everything you saw today was live. Every node was real. Every centrality score was computed in real-time by Neo4j GDS. Operation Rakt turns investigative intelligence from a filing cabinet into a tactical weapon."

---

## 🛡️ If Something Goes Wrong

| Problem | Recovery |
|---|---|
| LLM API timeout | Click the Case button again — Gemini auto-retries |
| Graph looks empty after commit | Click `Analyze Network` — forces a graph refresh |
| Node doesn't merge properly | The MERGE uses name + label — slight name variation in LLM output is the cause. Point it out as the "human-in-the-loop screen prevents this" |
| Backend crashes | `uvicorn app.main:app --host 0.0.0.0 --port 8000` — restarts in 3s, graph is in Neo4j |
| Neo4j container stopped | `docker compose up -d` — data persists in volume |

---

## Key Numbers to Know Cold

| Metric | Value |
|---|---|
| Total nodes after all 4 FIRs | ~31 |
| Total relationships | ~65 |
| Top bridge node | **Ramesh Gupta** |
| Betweenness score | **0.4031** |
| Network fragmentation after arrest | **1 → 3 components** |
| Monthly syndicate revenue (per FIR) | ₹50–80 lakh |
| BNS sections covered | Section 308 (Extortion), Section 111 (Organised Crime), Section 115 (Assault) |
