"""Graph Router — serves graph data to frontend and runs centrality analysis."""
import logging
from fastapi import APIRouter, HTTPException

from app.services.neo4j_service import get_full_graph, get_node_details, get_node_count
from app.services.gds_service import run_centrality_analysis

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("")
async def fetch_graph():
    """Return the full graph as {nodes: [...], links: [...]} for react-force-graph."""
    try:
        graph = get_full_graph()
        return {
            "success": True,
            "graph": graph,
            "total_nodes": len(graph["nodes"]),
            "total_links": len(graph["links"]),
        }
    except Exception as e:
        logger.error(f"Failed to fetch graph: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/centrality")
async def analyze_centrality():
    """Run Betweenness Centrality and PageRank.
    Identifies top bridge nodes and critical conduits."""
    try:
        result = run_centrality_analysis()
        return {
            "success": True,
            **result,
        }
    except Exception as e:
        logger.error(f"Centrality analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/node/{node_id}")
async def fetch_node(node_id: int):
    """Get detailed properties of a specific node."""
    try:
        details = get_node_details(node_id)
        if not details:
            raise HTTPException(status_code=404, detail="Node not found")
        return {"success": True, "node": details}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch node {node_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def graph_stats():
    """Quick stats about the graph."""
    try:
        count = get_node_count()
        return {"success": True, "total_nodes": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
