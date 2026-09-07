"""FastAPI application entry point for Operation Rakt backend."""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ingest, graph, simulate

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title="Operation Rakt API",
    description="AI Criminal Network Intelligence Platform — Module A & C",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ingest.router, prefix="/api/ingest", tags=["Ingestion"])
app.include_router(graph.router, prefix="/api/graph", tags=["Graph"])
app.include_router(simulate.router, prefix="/api/simulate", tags=["Simulation"])


@app.get("/")
async def root():
    return {
        "name": "Operation Rakt API",
        "status": "running",
        "modules": ["A: Ingestion + POLE + BNS", "C: Graph + Centrality + Simulation"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
