# Operation Rakt — Project Context (Resume File)
> This file tracks all progress, decisions, and context. If the conversation resets, read this file first.

## Project Summary
- **What**: SIH internal round demo prototype — Module A (FIR Ingestion + POLE + BNS) + Module C (Graph Viz + Centrality + Arrest Simulation)
- **Deadline**: 2 days from 2026-09-07
- **NOT building**: Module B (burner phone/alias), Module D (text-to-Cypher) — documented as roadmap slide in final pitch.

## Environment & Status
- **OS**: Windows
- **Python**: 3.10+ (conda base)
- **Node.js**: Installed, Vite 8.2.2 React frontend built and running
- **Docker**: Docker Desktop running with `neo4j:5-community` container (`operation-rakt-neo4j`)
- **Neo4j**: Live on `bolt://localhost:7687` (user: `neo4j`, pass: `operation_rakt`)
- **Backend**: FastAPI live on `http://localhost:8000`
- **Frontend**: Vite live on `http://localhost:5173`

## Phase Completion Status
| Phase | Description | Status | Verification |
|---|---|---|---|
| 1 | Infrastructure + Ingestion Pipeline | ✅ COMPLETE | Tested Neo4j container, Pydantic schemas, BNS tagging |
| 2 | Graph Upsert + Basic Visualization | ✅ COMPLETE | Seeded 31 nodes & 65 relationships via Cypher MERGE |
| 3 | Human-in-the-Loop Review Screen | ✅ COMPLETE | Side-by-side raw text & editable POLE entities modal |
| 4 | Centrality Analysis (GDS) | ✅ COMPLETE | Betweenness Centrality & PageRank highlighting bridge node |
| 5 | Kingpin Arrest Simulation | ✅ COMPLETE | Real graph fragmentation (1 -> 3 components) & cluster recoloring |
| 6 | Polish + Demo Hardening | ✅ COMPLETE | README.md with 3-minute rehearsed script, browser recorded demo |

## Key Endpoints
- `GET  /api/graph` — Full graph nodes & links for force graph
- `GET  /api/graph/centrality` — Betweenness Centrality + PageRank
- `GET  /api/graph/node/:id` — Single node detail with properties
- `POST /api/ingest/upload` — OCR + strict POLE JSON extraction
- `POST /api/ingest/confirm` — Cypher MERGE upsert without duplicates
- `POST /api/simulate/arrest/:id` — Removes node, computes connected components, clusters

## Demo Walkthrough Script
See `README.md` for the exact 3-minute pitch script for judges.
