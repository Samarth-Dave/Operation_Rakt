# Operation Rakt — Antigravity Build Prompt & 2-Day Roadmap
### Scope: Module A (Ingestion + POLE + BNS Tagging) + Module C (Graph + Centrality + Kingpin Simulation)
### Modules B & D: Architecture slide only, NOT built in code this round.

---

## 1. WHY THIS SCOPE

You have 2 days. Module A is a hard dependency for everything else (no populated graph = nothing to visualize, simulate, or query). Module C is your most visually convincing demo moment (graph shattering into clusters when you "arrest" a node). Together they form a complete, demoable story: **upload messy FIR → structured graph → tactical insight**. Module B (burner phone/alias resolution) and Module D (text-to-Cypher) become a documented "Phase 2" roadmap slide — this is normal and expected in SIH internal rounds, and a well-reasoned roadmap slide often scores better than a half-broken live feature.

---

## 2. THE PROMPT TO GIVE ANTIGRAVITY

Paste this as your main task prompt, and attach the original doc as reference context alongside it.

```
CONTEXT
I am building a working prototype for a Smart India Hackathon internal round demo,
happening in 2 days. I have attached our team's full solution document ("Operation
Rakt") describing 4 modules. For THIS build, I only need Module A and Module C
implemented end-to-end and working live. Do NOT attempt Module B (burner phone/alias
resolution) or Module D (text-to-Cypher assistant) in code — I will handle those as a
roadmap slide separately. Do not silently expand scope to include them.

GOAL
Build a working local prototype where:
1. I can upload a scanned/handwritten FIR (PDF or image).
2. The system OCRs it, extracts structured entities (Person, Object, Location,
   Event) via an LLM call constrained to a strict JSON schema, and tags the
   narrative with the relevant BNS 2023 section(s) from a provided reference list.
3. The extracted JSON is upserted into a Neo4j graph database as nodes and
   relationships (MERGE, not duplicate-create).
4. A React frontend visualizes this graph (react-force-graph or Cytoscape.js),
   shows node/edge details on click, and lets me manually correct any
   low-confidence OCR/extraction field before it commits to the graph
   (human-in-the-loop review screen).
5. On a graph with 15-20+ nodes across at least 3 mock FIRs, I can click
   "Analyze Network" and the backend runs Betweenness Centrality (and ideally
   PageRank) via Neo4j GDS, and the frontend highlights the top bridge node.
6. I can toggle "Simulate Arrest," click a node, and the frontend
   re-renders the graph with that node's edges virtually removed, visually
   splitting the graph into separate clusters if applicable. This should be
   a real graph computation (remove node, recompute connected components),
   not a scripted/fake animation.

TECH STACK (do not substitute unless something is truly broken)
- Backend: Python FastAPI
- OCR: pytesseract / Tesseract 5.0 (fallback: pdfplumber for digital PDFs)
- LLM: Gemini 1.5 Flash or GPT-4o-mini, called with a strict JSON schema
  system prompt (no free text allowed in response)
- Graph DB: Neo4j (AuraDB free tier is fine for this build), with GDS library
  enabled for centrality algorithms
- Frontend: React.js + react-force-graph
- Everything runs locally/cloud-free-tier — I do not have production
  infrastructure for this demo, just my laptop + cloud LLM/DB APIs.

CONSTRAINTS
- Work in VERTICAL SLICES: get one FIR fully working end-to-end (upload → OCR
  → JSON → graph → visualization) before adding more mock data or features.
  Do not build all backend pieces first and all frontend pieces last.
- After each major slice (ingestion pipeline, graph upsert, visualization,
  centrality, simulation), STOP and give me a way to test it before moving on.
- Generate realistic mock data for me: 3-4 fake FIR texts (Hindi-English mixed
  is fine) covering extortion, and a small BNS reference JSON (at minimum
  Section 111 - Organised Crime, Section 308 - Extortion) so the tagging step
  has something real to match against.
- Include a seed/reset script so I can wipe and reseed the Neo4j database
  quickly if a live demo goes wrong.
- Include basic error handling (e.g., OCR confidence too low -> flag for
  manual review instead of crashing) since this will be judged live.
- Do NOT build authentication, multi-user support, or production security —
  out of scope for a 2-day internal-round demo.
- Comment code sparingly but clearly enough that I can explain any part of
  it live if a judge asks "walk me through this."

DELIVERABLE FORMAT
Give me:
1. A short architecture summary of what you're about to build before writing code.
2. The project built incrementally in the vertical slices above.
3. A final README with exact run instructions (env vars needed, how to seed
   data, how to start backend/frontend, and a scripted 3-minute demo walk-
   through I can rehearse from).

Ask me before making any assumption that meaningfully changes scope (e.g.
swapping Neo4j for another DB, skipping human-in-the-loop review, etc.).
```

---

## 3. THE 2-DAY TIMELINE

Treat this as a checklist you tick off, not a rigid clock. The point of vertical slicing is that at the end of **every half-day** you have something demoable, even if the next half-day never happens.

### Day 1 — Morning: Ingestion pipeline (Module A, part 1)
- [ ] FastAPI endpoint accepting PDF/image upload
- [ ] OCR extraction working on at least 1 real or realistic scanned/handwritten sample
- [ ] LLM call returns strict JSON (Person/Object/Location/Event) for that sample
- [ ] BNS tagging returns at least 1 correct section for a test narrative
- **Checkpoint:** you can upload a file and see clean JSON printed/logged.

### Day 1 — Afternoon: Graph upsert + basic visualization (Module A, part 2 + Module C, part 1)
- [ ] Python → Cypher MERGE script pushing JSON into Neo4j without duplicating nodes
- [ ] 3-4 mock FIRs seeded so the graph has 15-20+ nodes
- [ ] React frontend renders the graph from Neo4j (basic force-directed layout, click-to-inspect node)
- **Checkpoint:** you can seed the DB and see a real, populated 3D/2D graph on screen.

### Day 1 — Evening: Human-in-the-loop review screen
- [ ] Pre-commit screen showing OCR/extracted JSON next to original doc for manual correction
- [ ] Confirms/edits before Neo4j write
- **Checkpoint:** this is a small but high-value "we thought about failure modes" feature — don't skip it even if rushed.

### Day 2 — Morning: Centrality analysis (Module C, part 2)
- [ ] Neo4j GDS Betweenness Centrality (and PageRank if time allows) running on the seeded graph
- [ ] Frontend highlights top bridge node with distinct styling
- **Checkpoint:** click "Analyze Network," see a real node get highlighted, and be able to explain *why* mathematically (bring the centrality score up on click).

### Day 2 — Afternoon: Kingpin simulation (Module C, part 3)
- [ ] "Simulate Arrest" toggle + click node → real graph recomputation removing that node's edges
- [ ] Visual re-render showing fragmentation into clusters (if the topology supports it — make sure at least one seeded scenario actually fragments)
- **Checkpoint:** rehearse this exact click sequence 2-3 times so it's smooth live.

### Day 2 — Evening: Demo hardening + roadmap slide
- [ ] Seed/reset script tested — you can recover instantly if the live DB gets messy
- [ ] Record a backup screen-capture video of the full flow in case live demo has technical issues
- [ ] Prepare Module B + D as a clearly-labeled "Phase 2 Roadmap" slide (algorithm names, why they're deterministic/court-admissible, one mock screenshot if time permits)
- [ ] Rehearse the full 3-minute walkthrough at least twice, out loud

---

## 4. DEMO-DAY SAFETY NET (don't skip this)

- Keep a **pre-seeded Neo4j snapshot** you can restore in under 30 seconds if a judge's question or your own click breaks the live state.
- Have a **recorded video fallback** of the full flow — Wi-Fi/API failures during judging are common and this alone can save your slot.
- Know your **one clear sentence** for why B and D aren't built: *"We prioritized building Modules A and C to full depth rather than all four modules shallowly, so everything you're seeing right now is real computation, not a mockup."* Judges respond well to this framing — it turns a scope cut into a credibility signal.
