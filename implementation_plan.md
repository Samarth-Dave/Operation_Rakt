# Implement Chain of Custody for Evidence

This plan outlines the steps to implement an immutable cryptographic ledger in Neo4j to track interactions with evidence items.

## User Review Required
> [!IMPORTANT]
> - Are there specific **officer ID** formats or auth mechanisms we should use, or is it okay to accept strings for the officer ID for now?
> - Should we link `Evidence` directly to existing `Object` nodes from FIRs, or keep them as standalone items first?

## Proposed Changes

---

### Schemas (`backend/app/models/schemas.py`)
Add models to represent `Evidence` and `LedgerEntry`, and requests for creating evidence/logging actions.

#### [MODIFY] [schemas.py](file:///Users/mayankchauhan/Documents/Operation_Rakt/backend/app/models/schemas.py)
- **New Enums**: `EvidenceActionType` (UPLOADED, VIEWED, ANALYZED, LINKED, EXPORTED)
- **New Models**:
  - `EvidenceCreate`
  - `LedgerEntrySchema` (includes `hash`, `previous_hash`, `timestamp`, `officer_id`, `action_type`, `details`)
  - `EvidenceResponse` (wraps Evidence details + chain of custody)

---

### Neo4j Service (`backend/app/services/neo4j_service.py`)
Implement the graph operations to create a linked list of ledger entries.
Because we use Neo4j, the ledger will look like:
`(Evidence) -[:HAS_LEDGER]-> (LedgerEntry:Genesis) -[:NEXT]-> (LedgerEntry) -[:NEXT]-> (LedgerEntry:Latest)`

#### [MODIFY] [neo4j_service.py](file:///Users/mayankchauhan/Documents/Operation_Rakt/backend/app/services/neo4j_service.py)
- **New Functions**:
  - `register_evidence(name, description, officer_id)`: Creates `Evidence` node + genesis `LedgerEntry` with `previous_hash="genesis"`. Computes SHA-256 hash.
  - `log_evidence_action(evidence_id, action_type, officer_id, details)`: Fetches the latest `LedgerEntry`, takes its hash as `previous_hash`, generates a new hash for the current action, creates new `LedgerEntry`, and links it `[:NEXT]` from the old entry.
  - `get_evidence_chain(evidence_id)`: Retrieves the evidence and the full ordered chain of custody.
  - `verify_evidence_chain(evidence_id)`: Traverses the chain and recalculates hashes to ensure cryptographic immutability. Returns a boolean.

---

### Routers (`backend/app/routers/evidence.py`)
Expose the chain of custody capabilities via API endpoints.

#### [NEW] [evidence.py](file:///Users/mayankchauhan/Documents/Operation_Rakt/backend/app/routers/evidence.py)
- `POST /evidence`: Register new evidence.
- `POST /evidence/{evidence_id}/action`: Log an interaction (viewed, analyzed, etc.).
- `GET /evidence/{evidence_id}`: Retrieve evidence and its full ledger.
- `GET /evidence/{evidence_id}/verify`: Verify the cryptographic chain of custody.

#### [MODIFY] [main.py](file:///Users/mayankchauhan/Documents/Operation_Rakt/backend/app/main.py)
- Include the new `evidence` router in the FastAPI app.

## Verification Plan

### Automated Tests
- Since there are no formal `tests/` mentioned, I will create a temporary Python script (`scratch/verify_coc.py`) to simulate registering evidence, logging multiple actions, and verifying the chain's integrity successfully.

### Manual Verification
- View the graph in Neo4j Browser to visually inspect the `(Evidence)-[:HAS_LEDGER]->...` structure.
- Try intentionally modifying a `LedgerEntry` property directly in Neo4j and show that the `/verify` endpoint correctly flags the chain as tampered with.
