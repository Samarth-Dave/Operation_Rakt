# Development Context

This file is maintained to provide context to the coding agent whenever a session is restarted or context is reset.

## Current Branch
`feature/chain-of-custody`

## Features Planned
1. **Chain of Custody for Evidence (Current Focus)**
   - Record every time evidence is touched (uploaded, viewed, analyzed, linked, exported) as an immutable ledger entry.
   - Store hash + timestamp + officer ID + action type.
   - Form an unbroken chain (cryptographic hash linking).
   - Ability to verify the chain's integrity.
2. **Cross-Jurisdiction / Cross-State Evidence Sharing (Phase 2)**
   - Enable independent verification of evidence authenticity across states.
3. **Multi-Agency Verification (Phase 3)**
   - Shared tamper-proof record for handoffs (Police -> Forensics -> Court).

## What Work is Done
- Explored repository structure (`schemas.py`, `neo4j_service.py`).
- Created a new git branch: `feature/chain-of-custody`.
- Created implementation plan for Feature 1 (awaiting user approval).

## What Work To Do Now
- Await user approval on the implementation plan for Feature 1.
- Once approved, execute the plan (add schemas, implement Neo4j queries for graph-based ledger, expose API routes).

## Files to Reference
- `backend/app/models/schemas.py`: Add Pydantic models for `Evidence` and `LedgerEntry`.
- `backend/app/services/neo4j_service.py`: Add functions to handle graph nodes for the ledger (`create_evidence`, `log_action`, `verify_chain`).
- `backend/app/routers/`: Create a new router (e.g., `evidence.py`) for the new API endpoints.
