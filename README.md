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

* **Frontend**: React + Vite, `react-force-graph-2d`, `ethers`, `axios`, `lucide-react`
* **Backend**: Python FastAPI, `pytesseract`, `pdfplumber`, `google-generativeai`, `neo4j`, `networkx`
* **Database**: Neo4j (Docker Community Edition with GDS plugin)
* **Blockchain**: Solidity, Hardhat, Ganache, Ethers.js

---

## 🚀 Step-by-Step Setup & Run Instructions

### 1. Prerequisites (For All OS)

- **Docker Desktop** installed and running.
* **Node.js (v18+)** and **npm** installed.
* **Python (3.10+)** installed.
* **Ganache** (CLI or UI) running on `http://127.0.0.1:7545`.
* **MetaMask** browser extension installed.

### 2. Start the Neo4j Database

1. Open a terminal in the root directory:
   * **Mac/Linux/Windows:** `docker compose up -d`
2. The database will be available at `bolt://localhost:7687` (User: `neo4j`, Password: `operation_rakt`).

### 3. Deploy the Blockchain (Hardhat)

1. Open a terminal and navigate to the `blockchain` directory.
2. Install dependencies (explicitly pinned to Hardhat v2 for compatibility):
   * **Mac/Linux/Windows:** `npm install --save-dev hardhat@^2.22.0 @nomicfoundation/hardhat-toolbox@^5.0.0 dotenv`
3. Create `.env` from `.env.example`:
   * **Mac/Linux:** `cp .env.example .env`
   * **Windows:** `copy .env.example .env`
   * *(Insert your Ganache Private Key into `.env`)*
4. Deploy the smart contract:
   * **Mac/Linux/Windows:** `npx hardhat ignition deploy ./ignition/modules/EvidenceLedger.js --network ganache --reset`
5. **Copy the deployed contract address** outputted in the terminal.

### 4. Start the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a virtual environment:
   * **Mac/Linux:** `python3 -m venv venv && source venv/bin/activate`
   * **Windows:** `python -m venv venv` and `venv\Scripts\activate`
3. Install Python dependencies:
   * **Mac/Linux/Windows:** `pip install -r requirements.txt`
4. Create `.env` from `.env.example` (add LLM API keys if using cloud extraction).
5. Start the server:
   * **Mac/Linux/Windows:** `uvicorn app.main:app --reload`
6. API is live at `http://localhost:8000`.

### 5. Start the Frontend (React / Vite)

1. Open a terminal and navigate to the `frontend` directory.
2. Install dependencies:
   * **Mac/Linux/Windows:** `npm install` *(installs `react-force-graph-2d`, `ethers`, `lucide-react`, `axios`, etc.)*
3. Create `.env` from `.env.example`:
   * **Mac/Linux:** `cp .env.example .env`
   * **Windows:** `copy .env.example .env`
4. **Paste the Hardhat contract address** (from Step 3) into the `VITE_CONTRACT_ADDRESS` variable in `frontend/.env`.
5. Start the Vite server:
   * **Mac/Linux/Windows:** `npm run dev`
6. Open `http://localhost:5173` in your browser. Ensure MetaMask is connected to Localhost 8545.

---

## 🎯 SIH 3-Minute Live Demo Walkthrough

*(Before demo: Use the `Wipe Database` button so you start with 0 nodes. Ensure MetaMask is unlocked and connected to Localhost 8545)*

**0:00 - 0:30 | Introduction & The Entity Roster**
> "Welcome to the demo of Operation Rakt. Today, law enforcement agencies struggle with massive 'intelligence silos'—critical connections are buried deep within thousands of unstructured Hindi and English FIRs. We built Operation Rakt to solve this by transforming raw text into an active, intelligent knowledge graph. Let's see this in action. Watch the Entity Roster panel on the left as I ingest our first case."

**0:30 - 1:15 | Automated Ingestion & Human-in-the-Loop**
*(Click Ingest FIR -> Case #1. Then click Ingest FIR -> Case #2)*
> "Our pipeline uses LLMs to parse text into the POLE model—Persons, Objects, Locations, and Events—and maps them to BNS 2023 statutes. Notice the split-screen Human-in-the-Loop review panel. If an OCR confidence score falls below our threshold, the Investigating Officer must verify the entities before committing them to Neo4j. This guarantees court admissibility."
*(Click Commit to Knowledge Graph).*

**1:15 - 1:45 | Tactical Geospatial Intelligence**
*(Toggle 'GEO INTEL' view)*
> "Crimes don't happen in a void. Clicking 'Geo Intel' plots our extracted locations onto a tactical dark-matter map. The curved corridors you see aren't just lines—they mathematically represent the physical movement of suspects and illicit funds across Mumbai and Delhi. We can instantly visualize the syndicate's operational territory."

**1:45 - 2:30 | Mathematical Network Analysis & Arrest Simulation**
*(Switch back to 'NETWORK'. Click Analyze Network)*
> "Traditional databases are passive; ours is tactical. Clicking 'Analyze Network' executes Neo4j's Betweenness Centrality algorithm. It instantly pinpoints the critical bottleneck: Ramesh Gupta, a hawala conduit. He isn't pulling triggers—he's the bridge.
> But what if we arrest him? *(Toggle Simulate Arrest, click Ramesh's node)* Notice how the FIR paperwork nodes fade to gray. By mathematically stripping away the metadata, we reveal the true physical network. Watch the graph shatter as the syndicate fragments into isolated, blind clusters, leaving our target completely severed from his empire."

**2:30 - 3:00 | Web3 Evidence Chain of Custody**
*(Click a Case/Object Node to open the side panel, scroll down to On-Chain Ledger, log a view via MetaMask)*
> "Finally, preserving evidence integrity. Every time digital or physical evidence is interacted with, it requires cryptographic authorization. Watch as I sign this 'Viewed' event in MetaMask. It logs directly to our local Ethereum node. An immutable, tamper-proof, zero-trust chain of custody. Everything you saw today is real, deterministic code."
