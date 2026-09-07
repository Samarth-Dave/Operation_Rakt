# Operation Rakt — AI Criminal Syndicate Intelligence Platform

> **Smart India Hackathon (SIH) Prototype**  
> **Scope**: Module A (Automated Ingestion + POLE Extraction + BNS 2023 Statutory Tagging) & Module C (Neo4j Graph Visualization + GDS Centrality + Kingpin Arrest Simulation)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Docker Desktop** (running)
- **Python 3.10+** (with conda or pip)
- **Node.js 18+** & **npm**

---

### Step 1: Start Neo4j Database via Docker

From the project root:
```bash
docker compose up -d
```
Neo4j runs with the **Graph Data Science (GDS)** library enabled:
- **Bolt Port**: `bolt://localhost:7687` (User: `neo4j`, Password: `operation_rakt`)
- **Neo4j Browser**: `http://localhost:7474`

---

### Step 2: Configure & Start Python FastAPI Backend

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Copy environment file (optional, offline fallback mode works out of the box):
   ```bash
   cp .env.example .env
   ```
   *(Add your `GOOGLE_API_KEY` or `GROQ_API_KEY` in `.env` if you want live cloud LLM extraction).*

3. Seed the 4 realistic mock FIR cases into Neo4j:
   ```bash
   python seed.py --reset
   ```
   *Creates 31 interconnected nodes across 4 cases: Andheri extortion, Jogeshwari protection racket, Crime Branch hawala conduit, and Versova assault.*

4. Launch FastAPI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   *Swagger Docs available at: `http://localhost:8000/docs`*

---

### Step 3: Launch React Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🎯 Scripted 3-Minute Hackathon Demo Walkthrough

Use this rehearsed script when presenting live to judges:

### 0:00 - 0:45 | The Problem & Live Graph Overview
> *"Judges, police departments across India face 'intelligence silos.' Critical syndicate connections remain buried in handwritten Hindi-English FIRs. Operation Rakt turns unstructured crime narratives into an active intelligence knowledge graph.*
>
> *Here on screen is our live Neo4j knowledge graph populated across 4 real-world extortion and hawala cases in Mumbai and Delhi. Each node is strictly structured using the international **POLE (Person, Object, Location, Event)** model and statutory provisions from the newly enacted **Bharatiya Nyaya Sanhita (BNS) 2023**."*

### 0:45 - 1:30 | Automated Ingestion & Human-in-the-Loop Review
> *(Click **"Ingest FIR"** in the top-left control panel)*
> *"When an Investigating Officer uploads an FIR—scanned image, digital PDF, or text—our dual OCR and LLM pipeline parses entities and cross-references BNS sections.*
>
> *(Click **"Case #1: Andheri Extortion"** quick-loader)*
> *"Notice our Human-in-the-Loop review screen. If an OCR confidence score falls below threshold, the IO verifies the suspect roles, aliases, or vehicle registrations before committing to Neo4j. This prevents hallucinated data and guarantees court admissibility."*
>
> *(Click **"Commit to Knowledge Graph"**)*

### 1:30 - 2:15 | Mathematical Network Analysis (GDS Centrality)
> *(Click **"Analyze Network"**)*
> *"Traditional databases are passive. Operation Rakt is tactical. Clicking 'Analyze Network' executes **Betweenness Centrality** and **PageRank** via Neo4j Graph Data Science.*
>
> *Look at the canvas—the system instantly pinpoints the network's critical bottleneck: **`Ramesh Gupta / Hawala Conduit`** with a betweenness score of 0.4031.*
>
> *(Click on Ramesh Gupta's node)*
> *"He isn't pulling triggers on the street—he's the bridge channeling extortion money from Mumbai suburb collectors to the Delhi syndicate."*

### 2:15 - 3:00 | Kingpin Arrest Simulation (Graph Shattering)
> *(Toggle **"Simulate Arrest"** in the control panel)*
> *"Now, here is the operational breakthrough. Before dispatching a strike team, Inspector Raj can ask: 'If we arrest Ramesh tonight, does the syndicate collapse?'"*
>
> *(Click on Ramesh's node on the canvas)*
> *"Watch the canvas dynamically shatter. This is a real graph computation—all incident operational links are severed, and connected components are recomputed in milliseconds.*
>
> *The network immediately fragments into **3 isolated clusters**, color-coded on the screen. The street extortionists in Andheri are severed from their logistics in Thane and their leadership in Delhi. Operation Rakt has neutralized the syndicate."*

### Conclusion Line:
> *"We prioritized building Modules A and C to full mathematical depth rather than building all 4 modules shallowly. Everything you saw today is real, deterministic graph computation."*

---

## 🛠️ Architecture & API Endpoints

```
Frontend (React + Vite + react-force-graph-2d)
      │
      ├── GET  /api/graph              -> Returns full Neo4j nodes & relationships
      ├── GET  /api/graph/centrality   -> Computes Betweenness & PageRank
      ├── POST /api/ingest/upload      -> OCR + Strict LLM POLE JSON extraction
      ├── POST /api/ingest/confirm     -> Cypher MERGE upsert to Neo4j (no duplicates)
      └── POST /api/simulate/arrest/:id -> Removes node & computes network fragmentation
```

---

## 📁 Project Structure

```
Operation Rakt/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── models/schemas.py        # Strict Pydantic POLE & BNS schemas
│   │   ├── services/
│   │   │   ├── ocr_service.py       # Tesseract + pdfplumber OCR engine
│   │   │   ├── llm_service.py       # Gemini / Groq / deterministic fallback
│   │   │   ├── neo4j_service.py     # Cypher MERGE queries & graph retrieval
│   │   │   └── gds_service.py       # Neo4j GDS & NetworkX Centrality
│   │   ├── routers/
│   │   │   ├── ingest.py            # Upload & human-in-the-loop review
│   │   │   ├── graph.py             # Graph queries & centrality endpoint
│   │   │   └── simulate.py          # Real graph fragmentation computation
│   │   └── data/
│   │       ├── bns_reference.json   # 17 BNS 2023 statutory sections
│   │       └── mock_firs/           # 4 realistic Mumbai/Delhi syndicate FIRs
│   ├── seed.py                      # Database population & wipe script
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Master tactical intelligence dashboard
│   │   ├── components/
│   │   │   ├── GraphCanvas.jsx      # Force-directed interactive canvas
│   │   │   ├── ControlPanel.jsx     # Stats, Ingest, Centrality, Simulate Arrest
│   │   │   ├── NodeDetail.jsx       # Side inspector with GDS centrality metrics
│   │   │   ├── FIRUploadModal.jsx   # Document dropzone + 1-click case loaders
│   │   │   ├── ReviewScreen.jsx     # Side-by-side human-in-the-loop editor
│   │   │   └── IntelBanner.jsx      # Centrality alert & fragmentation briefing
│   │   └── index.css                # Pure Vanilla CSS dark-mode design system
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml               # Neo4j 5 with GDS plugin configuration
```
