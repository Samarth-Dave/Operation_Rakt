The Scenario: "Operation Rakt"
The User: Inspector Raj, Mumbai Anti-Extortion Cell.
The Crime: A local businessman receives a death threat and an extortion demand for ₹50 Lakhs. The caller used a hidden number and mentioned an associate named "Chhotu." An FIR is filed.
Step 1: The Upload (Feature 1 - Automated Ingestion)
The User Interaction:
Inspector Raj logs into the AI Criminal Network Dashboard. He drags and drops the scanned PDF of the handwritten FIR into the "New Case" window and clicks “Process FIR.”
Under the Hood (System Flow):
Frontend: React.js sends the PDF via an API call to the Python FastAPI backend.


OCR Engine: The backend routes the PDF to Tesseract OCR, which cleans up the messy scan and extracts the raw text.


AI Extraction: The text is sent to the LLM (Gemini/Llama-3) with a strict JSON Schema prompt. The LLM identifies:


Person: "Chhotu" (Role: Suspect)


Object: "Bajaj Pulsar, MH-02-AB-1234" (Role: Fleeing Vehicle)


Event: "Extortion Threat"


BNS Tag: The LLM automatically maps the threat to BNS Section 308 (Extortion).


Database Upsert: A Python script converts this JSON into a Cypher query and injects it into the Neo4j Graph Database, instantly creating nodes and relationships.
The Output: Within 10 seconds, Inspector Raj sees a clean 3D graph on his screen showing the victim, the extortion event, the bike, and a floating red node for the unknown suspect "Chhotu."
Step 2: The Breakthrough (Feature 2 - Cross-Jurisdiction & Burner Phones)
The User Interaction:
Raj’s team recovers a discarded SIM card near the businessman's office. Raj gets the Call Detail Records (CDR) for this SIM from the telecom provider. He uploads the CDR CSV file into the system to find out who was using it.
Under the Hood (System Flow):
Burner Engine (DBSCAN): The backend Python script (scikit-learn) analyzes the cell tower pings of the discarded SIM. It searches the database and notices that whenever this discarded SIM pinged a tower, another known phone number (belonging to a Delhi gangster named Vikram) pinged the exact same towers within a 15-minute window.


Graph Update: The system mathematically confirms they are moving in the same pocket and creates a [:SUSPECTED_BURNER_OF] edge in Neo4j connecting the SIM to Vikram.


Alias Resolution: The system’s Double Metaphone algorithm runs in the background. It notices the name "Chhotu" in Raj’s FIR. It mathematically calculates that "Chhotu" sounds identical to "Chotu Gujjar," an alias used by Vikram’s hitman in a 3-year-old Delhi database.
The Output: Raj’s screen flashes an alert: "Inter-State Match Found." The graph automatically redraws. The isolated "Chhotu" node merges with a massive existing criminal network from Delhi, revealing that this isn't a local gang—it's an inter-state syndicate.
Step 3: Tactical Planning (Feature 3 - Interactive Canvas & Simulation)
The User Interaction:
Raj now sees a massive web of 50+ nodes (bank accounts, safehouses, associates) connected to Vikram. He needs to figure out who is controlling the money. He clicks the “Analyze Network” button.
Under the Hood (System Flow):
Graph Math: Neo4j’s Graph Data Science (GDS) library runs a Betweenness Centrality algorithm in milliseconds. It calculates which node acts as the biggest "bridge" for communications and money.


UI Highlight: The React frontend receives the scores and highlights a previously unnoticed node—a local hawala operator named "Ramesh"—with a glowing red border, indicating he is the network's critical bottleneck.
The User Interaction (The What-If):
Raj wonders, "If we arrest Ramesh tonight, does the gang lose its ability to coordinate?" He toggles the "Simulate Arrest" switch and clicks on Ramesh’s node.

The Output: The graph dynamically shatters. Without Ramesh connecting them, the visualization splits into three isolated clusters. Raj now knows that arresting Ramesh will completely blind the syndicate.

Step 4: The Final Search (Feature 4 - Text-to-Cypher Assistant)
The User Interaction:
Raj's strike team is gearing up for the raid on Ramesh's location. Raj needs to know what vehicles to look out for. Instead of writing complex SQL code, he types in the search bar: "Show me all vehicles registered in Maharashtra connected to Ramesh or Vikram within 2 steps."
Under the Hood (System Flow):
NLP Translation: The LLM receives the English text and the database schema. It translates Raj's question into precise database code:
MATCH (p:Person)-[*1..2]-(v:Vehicle) WHERE p.name IN ['Ramesh', 'Vikram'] AND v.reg CONTAINS 'MH' RETURN v


Execution: The backend runs this query against Neo4j.


Result Display: The UI zooms in on the graph, dimming everything else except for two specific vehicles: a white Scorpio and the black Pulsar from the original FIR.


The Conclusion (Immutable Evidence)
Raj clicks "Generate Intelligence Dossier."
The system complies the graph image, the BNS sections, the burner phone link, and the vehicle list into a PDF.
Before downloading, the backend runs the PDF through a SHA-256 cryptographic hash (Blockchain layer). It generates a unique digital fingerprint for this report. When Raj presents this dossier in court 6 months later, the judge can mathematically verify that not a single word of this digital evidence was tampered with by the police.
Operation Rakt is a success.

1. Detailed Explanation of the Proposed Solution
The proposed system is an enterprise-grade intelligence platform that transforms unstructured, multi-modal police data into a highly interactive, queryable Knowledge Graph. It merges four powerful investigative modules into a single workflow.

Core Modules Integrated into the Platform
Module A: Automated POLE Extraction & BNS Tagging: When an Investigating Officer (IO) uploads a First Information Report (FIR) or follow-up evidence (PDF, scanned image, or raw text), the system's NLP pipeline instantly reads the narrative. It structures the data using the globally recognized POLE (Person, Object, Location, Event) law enforcement data model. Concurrently, it cross-references the crime narrative against the newly enacted Bharatiya Nyaya Sanhita (BNS), 2023, automatically tagging relevant statutory provisions (e.g., Section 111 for Organised Crime).


Module B: Cross-Jurisdiction Alias & Burner Phone Resolution: Criminals exploit inter-state borders and disposable technology. This module applies the Double Metaphone phonetic algorithm to resolve alias variations across different languages (e.g., matching "Chhotu" in Delhi to "Chotu" in Maharashtra). Simultaneously, it ingests Call Detail Records (CDRs) and applies spatio-temporal clustering (DBSCAN) to link anonymous "burner" SIM cards to known suspects based on co-travel frequencies, completely independent of call logs.


Module C: Interactive Case Canvas & Kingpin Simulation: The system renders the extracted POLE nodes and relational edges into a 2D/3D force-directed graph. Investigators can visually filter evidence types, calculate network centrality (Betweenness and PageRank) to identify syndicate leaders, and utilize a "What-If" simulation to virtually remove a kingpin node and observe how the criminal network fragments.


Module D: Text-to-Cypher Natural Language Assistant: Recognizing that frontline officers are not database engineers, the platform features a natural language search bar. An officer can type, "Show all vehicles linked to suspects in FIR-402," and the system uses a restricted LLM to translate this English query into exact Cypher database code, retrieving the visual graph instantly.


How It Addresses the Core Problem
The National Crime Records Bureau (NCRB) and state police forces struggle with "intelligence silos." Crucial investigative links remain hidden because data is locked in unstructured paragraphs, handwritten FIRs, and isolated state databases. Manual correlation takes weeks, causing officers to lose the critical "Golden Hour" of an investigation. This system automates the synthesis of fragmented intelligence, converting unstructured text into mapped visual relationships in under 15 seconds.

Innovation and Uniqueness
Zero-Shot Statutory Mapping: It goes beyond simple entity extraction by directly mapping the contextual facts of a crime to the specific subsections of BNS 2023, effectively acting as an automated paralegal for the IO.


Deterministic, Explainable AI: Instead of relying on opaque deep learning models (which defense attorneys can challenge as "black-box guesswork"), the burner phone and alias resolution engines use mathematically provable spatial tracking and deterministic phonetic rules, ensuring the intelligence is court-admissible.


Active Tactical Utility: Traditional databases are passive storage systems. By incorporating dynamic Kingpin Simulation and network splintering analysis, this system acts as an active tactical planning tool for raid execution and resource allocation.


2. Technologies to be Used & Implementation Methodology
Technology Stack
Data Ingestion & OCR: pdfplumber (for native digital PDFs) and pytesseract / Tesseract 5.0 (for scanned documents with Indian English character support).


AI & Natural Language Processing: Generative LLM API (e.g., Gemini 1.5 Flash, GPT-4o-mini, or locally hosted Llama-3-8B) forced to generate Strict JSON Schema output.


Entity Resolution Engine: Python libraries jellyfish (Double Metaphone, Jaro-Winkler) for phonetic name matching, and scikit-learn (DBSCAN, Haversine metric) for spatial coordinate clustering.


Database Engine: Neo4j, specifically leveraging the Graph Data Science (GDS) library for multi-hop relationship queries and centrality mathematics.


Frontend UI & Visualization: React.js paired with react-force-graph or Cytoscape.js for high-performance visual network mapping.


Backend API: FastAPI (Python) for asynchronous, non-blocking file processing and query execution.


Hardware Requirements
Hackathon Prototype Phase: A standard laptop/workstation (16GB RAM, Quad-Core CPU) utilizing cloud-based LLM APIs and Neo4j AuraDB.


Production Phase (Air-Gapped Police LAN): On-premise server architecture (32GB+ RAM, 16-core CPU) featuring local GPU acceleration (e.g., NVIDIA RTX A5000) to run offline LLMs, ensuring highly sensitive police data never leaves the internal secure network.

Working Prototype Implementation Steps
Document Upload: The backend endpoint receives the FIR file, runs grayscale thresholding on images, and extracts raw text via OCR.


Schema Enforcement: The raw text is passed to the LLM with a strictly defined JSON Schema prompt. The LLM extracts entities and maps the narrative to a provided JSON dictionary of BNS legal codes.


Graph Upsert: A Python script parses the JSON output and generates Cypher MERGE queries, updating the Neo4j database without duplicating existing entities.


Spatial Linkage: A background cron job analyzes imported CDR CSVs. It groups unknown SIM card coordinates by 15-minute time windows against known suspect coordinates. If co-location occurs $>3$ times, it generates a [:SUSPECTED_BURNER_OF] edge.


Visualization: The React frontend fetches the updated graph data, dynamically coloring nodes based on PageRank centrality scores, and allows the investigator to ask natural language queries via the chat interface.


3. Analysis of the Feasibility of the Idea
Technical and Operational Feasibility
This project is highly feasible within a hackathon timeframe and for scalable government deployment. By enforcing a JSON Schema over pre-trained LLM models instead of attempting to fine-tune custom Named Entity Recognition (NER) models from scratch, the system bypasses massive computational bottlenecks. Furthermore, because it adopts the universally accepted POLE data model, the schema aligns perfectly with existing global intelligence standards, ensuring smooth future integration with legacy systems like CCTNS.

Potential Challenges and Risks
Degraded OCR on Handwritten Documents: Scanned police documents in India frequently feature poor handwriting or degraded ink, leading to OCR hallucination.


Phonetic Name Collisions: Common Indian surnames (e.g., Sharma, Kumar, Singh) will trigger hundreds of false-positive phonetic alias matches across state databases.


AI Hallucinations in Querying: Generative models could potentially hallucinate false evidence or fabricate suspect connections when answering natural language queries.


Strategies for Overcoming Challenges
Human-in-the-Loop Validation: To mitigate OCR failures, the UI features a pre-commit review screen. If the OCR confidence score falls below a set threshold, the system displays the extracted JSON side-by-side with the original document, allowing the IO to manually verify and correct ambiguous fields before graph ingestion.


Multi-Factor Gating for Aliases: The phonetic alias matching engine is strictly gated. A phonetic match alone is insufficient; the system requires at least one secondary corroborating edge (e.g., a shared home district, a matching vehicle model, or a common known associate) before establishing a confirmed alias link.


Text-to-Cypher Constraint: To prevent evidence hallucination, the LLM is completely isolated from the raw data. It is only permitted to translate English intent into Cypher syntax. The actual data retrieval is executed directly by the deterministic Neo4j database, guaranteeing that every node shown to the investigator is 100% grounded in uploaded evidence.


4. Potential Impact on the Target Audience
Target Audience
Primary: Station House Officers (SHOs) and frontline Investigating Officers (IOs).


Specialized Units: State Cyber Cells, Anti-Terror Squads (ATS), Special Task Forces (STF), and Narcotics Control Bureau (NCB) operatives.


Strategic: Intelligence analysts at the National Crime Records Bureau (NCRB) and Ministry of Home Affairs.


Benefits of the Solution
Social & Judicial Impact: By providing objective, mathematically derived visual evidence of organized syndicates, the system directly supports the prosecution of complex crimes. The automated tagging of BNS sections ensures accurate charge sheeting, expediting the justice delivery system and potentially increasing conviction rates for organized crime.


Economic & Operational Impact: The platform saves thousands of cumulative manual hours currently spent cross-referencing multi-thousand-row Excel sheets and reading paper case files. It optimizes resource allocation by identifying exact network "kingpins," ensuring raid teams target the most critical assets of a syndicate rather than low-level operatives.


Environmental Impact: Facilitates a massive reduction in physical paperwork, supporting the government's transition to fully digitized, paperless investigative workflows across thousands of local police precincts.


5. Details and Links of Reference and Research Work
The architecture and legal logic of this system are deeply grounded in active statutory laws and established intelligence frameworks:

The Bharatiya Nyaya Sanhita (BNS), 2023: Specifically targeting the newly codified Section 111, which explicitly defines and punishes Organised Crime (including syndicates, cyber-frauds, and trafficking), providing the legal foundation for the automated tagging module.


POLE (Person, Object, Location, Event) Data Model: Originally developed for law enforcement and intelligence analysis in the UK (College of Policing), this schema is the global gold standard for structuring criminal records into Neo4j graph environments.


Phonetic Name Matching Algorithms: Based on the Double Metaphone search algorithm (Philips, L., 2000), which allows the system to deterministically map cross-lingual and vernacular phonetic variations of Indian names without requiring deep learning.


Spatio-Temporal Tracking: Grounded in trajectory pattern mining research (e.g., Giannotti, F., et al., 2007), providing the mathematical basis for the DBSCAN-based burner phone clustering engine.


Graph Data Science in Policing: Utilizing established community patterns for Neo4j GraphAware Intelligence Analysis, designed specifically for defense, national security, and financial authorities to turn fragmented data into connected intelligence.

