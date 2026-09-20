# Operation Rakt — AI Criminal Syndicate Intelligence Platform

> **Smart India Hackathon (SIH) Prototype**  
> **Scope**: Module A (Automated Ingestion + POLE Extraction + BNS Tagging), Module C (Neo4j Graph Visualization + Centrality + Arrest Simulation), and Chain of Custody (Web3 Evidence Ledger).

Operation Rakt is not just software; it is an **AI-Driven Intelligence Tool** that acts as the "brain" for law enforcement, uncovering non-obvious criminal connections hidden across thousands of unstructured police documents.

---

## 🧠 Deep Dive & Terminology Guide

### The Flow: How It Works
1. **OCR (Text Parsing):** An Investigating Officer (IO) uploads a scanned FIR or image. The system extracts raw text via Tesseract/pdfplumber.
2. **LLM Extraction (POLE):** The raw text is passed to an LLM (e.g., Gemini) with a strict JSON schema. It extracts the "Who, What, Where, and What Happened" mapping to the international **POLE (Person, Object, Location, Event)** model.
3. **Human-in-the-Loop:** AI doesn't write directly to the database. An officer reviews and corrects the AI-extracted data in a side-by-side UI to ensure court admissibility.
4. **Neo4j Graph Upsert:** Verified data is upserted into Neo4j using Cypher `MERGE` queries, preventing duplication and automatically linking new nodes to existing criminal networks.
5. **GDS Analysis (Tactical Arrest):** Neo4j Graph Data Science (GDS) algorithms mathematically identify the "Kingpins" or bridges in the network. Simulating an arrest recalculates the graph to show how the syndicate fragments.
6. **Chain of Custody (Web3):** Every time physical or digital evidence (Object nodes) is viewed, analyzed, or transferred, the action is securely signed via MetaMask and logged on a local Ethereum blockchain (Hardhat/Ganache) for immutable tracking.

### Key Buzzwords to Know
* **Betweenness Centrality (The Bridge Score):** An algorithm that finds nodes acting as a bridge from one part of a graph to another. The true "Kingpin" often isn't the most active street thug, but the single hawala agent connecting two isolated gangs.
* **Connected Components:** Identifies isolated sub-graphs. When we "Simulate Arrest" on a kingpin, this algorithm proves how the syndicate shatters into blind, disconnected pieces.
* **Deterministic Fallback:** Hardcoded logic ensuring the demo never breaks if the Cloud LLM API hits rate limits.
* **Cypher:** The query language of Neo4j. Instead of SQL's `SELECT`, it uses drawing-like syntax: `MATCH (a:Person)-[r:COMMITTED]->(b:Event)`.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React + Vite, `react-force-graph-2d`, `ethers`, `axios`, `lucide-react`
- **Backend**: Python FastAPI, `pytesseract`, `pdfplumber`, `google-generativeai`, `neo4j`, `networkx`
- **Database**: Neo4j (Docker Community Edition with GDS plugin)
- **Blockchain**: Solidity, Hardhat, Ganache, Ethers.js

---

## 🚀 Step-by-Step Setup & Run Instructions

### 1. Prerequisites (For All OS)
- **Docker Desktop** installed and running.
- **Node.js (v18+)** and **npm** installed.
- **Python (3.10+)** installed.
- **Ganache** (CLI or UI) running on `http://127.0.0.1:7545`.
- **MetaMask** browser extension installed.

### 2. Start the Neo4j Database
1. Open a terminal in the root directory:
   - **Mac/Linux/Windows:** `docker compose up -d`
2. The database will be available at `bolt://localhost:7687` (User: `neo4j`, Password: `operation_rakt`).

### 3. Deploy the Blockchain (Hardhat)
1. Open a terminal and navigate to the `blockchain` directory.
2. Install dependencies:
   - **Mac/Linux/Windows:** `npm install` *(installs `hardhat`, `ethers`, `dotenv`, etc.)*
3. Create `.env` from `.env.example`:
   - **Mac/Linux:** `cp .env.example .env`
   - **Windows:** `copy .env.example .env`
   - *(Insert your Ganache Private Key into `.env`)*
4. Deploy the smart contract:
   - **Mac/Linux/Windows:** `npx hardhat ignition deploy ./ignition/modules/EvidenceLedger.js --network ganache`
5. **Copy the deployed contract address** outputted in the terminal.

### 4. Start the Backend (FastAPI)
1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a virtual environment:
   - **Mac/Linux:** `python3 -m venv venv && source venv/bin/activate`
   - **Windows:** `python -m venv venv` and `venv\Scripts\activate`
3. Install Python dependencies:
   - **Mac/Linux/Windows:** `pip install -r requirements.txt`
4. Create `.env` from `.env.example` (add LLM API keys if using cloud extraction).
5. Start the server:
   - **Mac/Linux/Windows:** `uvicorn app.main:app --reload`
6. API is live at `http://localhost:8000`.

### 5. Start the Frontend (React / Vite)
1. Open a terminal and navigate to the `frontend` directory.
2. Install dependencies:
   - **Mac/Linux/Windows:** `npm install` *(installs `react-force-graph-2d`, `ethers`, `lucide-react`, `axios`, etc.)*
3. Create `.env` from `.env.example`:
   - **Mac/Linux:** `cp .env.example .env`
   - **Windows:** `copy .env.example .env`
4. **Paste the Hardhat contract address** (from Step 3) into the `VITE_CONTRACT_ADDRESS` variable in `frontend/.env`.
5. Start the Vite server:
   - **Mac/Linux/Windows:** `npm run dev`
6. Open `http://localhost:5173` in your browser. Ensure MetaMask is connected to Localhost 8545.

---

## 🎯 SIH 3-Minute Live Demo Walkthrough

*(Before demo: Use the `Wipe Database` button so you start with 0 nodes.)*

**0:00 - 0:45 | The Problem & Empty Graph**
> "Judges, police departments face 'intelligence silos.' Critical connections are buried in handwritten Hindi-English FIRs. Operation Rakt turns unstructured crime narratives into an active intelligence knowledge graph. Watch what happens when I upload the first FIR."

**0:45 - 1:30 | Automated Ingestion & Human-in-the-Loop**
*(Click Ingest FIR -> Case #1: Andheri Extortion)*
> "Our pipeline parses entities and cross-references BNS sections. Notice the Human-in-the-Loop review screen. If an OCR confidence score falls below threshold, the IO verifies the suspects before committing to Neo4j. This prevents hallucinated data and guarantees court admissibility."
*(Click Commit to Knowledge Graph. Repeat for Case #2 and #3 to build the network).*

**1:30 - 2:15 | Mathematical Network Analysis**
*(Click Analyze Network)*
> "Traditional databases are passive. Operation Rakt is tactical. Clicking 'Analyze Network' executes Betweenness Centrality. The system instantly pinpoints the critical bottleneck: Ramesh Gupta (Hawala Conduit). He isn't pulling triggers—he's the bridge channeling extortion money from Mumbai to Delhi."

**2:15 - 3:00 | Kingpin Arrest Simulation**
*(Toggle Simulate Arrest, click Ramesh's node)*
> "Before dispatching a strike team, Inspector Raj asks: 'If we arrest Ramesh, does the syndicate collapse?' Watch the canvas dynamically shatter. The network immediately fragments into 3 isolated clusters. We prioritized building modules to full mathematical depth rather than building them shallowly. Everything you saw today is real, deterministic graph computation."

---

## 🛡️ SIH Judge Q&A & Edge Cases Defense

### 1. Data Poisoning (Fake FIRs)
**Judge:** *What if a rival gang files fake FIRs to manipulate the graph?*
**Answer:** The GDS analysis relies on network topology (structure), not just FIR counts. Fake FIRs will appear as "Isolate" or "Orphan" nodes because they won't share authentic, deep logistical overlaps (hawala accounts, real locations, common criminals) with the actual syndicate. Anomalies are easily spotted.

### 2. Why React & Vite over standard HTML/JS?
**Judge:** *Why did you choose React/Vite for the frontend?*
**Answer:** Rendering 2D/3D physics graphs (ForceGraph) is GPU and memory intensive. React’s virtual DOM combined with Vite’s blazing fast HMR ensures that UI state management remains lag-free, especially when simulating arrests or dynamically recoloring thousands of nodes.

### 3. Why Not Fine-Tune an NER Model?
**Judge:** *Why use a Generative LLM with JSON schemas instead of fine-tuning a custom Named Entity Recognition (NER) model?*
**Answer:** Fine-tuning NER requires thousands of annotated police datasets (which are classified). By utilizing a generalized LLM and constraining it strictly with a JSON schema (Zero-Shot extraction), we achieve near-perfect POLE extraction without needing sensitive training data or massive compute overhead.

---

## 🗺️ Roadmap (Phase 2 & 3)
- **Module B (Burner Phone Resolution):** Using DBSCAN spatial clustering on Cell Tower CDRs to mathematically prove a burner SIM moves alongside a known suspect's phone.
- **Module D (Text-to-Cypher):** Allowing frontline officers to type English queries ("Show all vehicles linked to Ramesh") which the system translates into Cypher, preventing LLM evidence hallucination by querying the deterministic Neo4j graph directly.
