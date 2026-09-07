"""Simulate Router — arrest simulation and network fragmentation analysis.
Simulates arresting a suspect/bridge node and calculates the mathematical
fragmentation of the criminal network into isolated components."""
import logging
import networkx as nx
from fastapi import APIRouter, HTTPException
from app.services.neo4j_service import get_full_graph

router = APIRouter()
logger = logging.getLogger(__name__)

CLUSTER_COLORS = [
    "#ef4444",  # Red
    "#3b82f6",  # Blue
    "#10b981",  # Green
    "#f59e0b",  # Amber
    "#8b5cf6",  # Purple
    "#06b6d4",  # Cyan
    "#ec4899",  # Pink
    "#84cc16",  # Lime
]


@router.post("/arrest/{node_id}")
async def simulate_arrest(node_id: int):
    """Simulate the arrest of a specific node.
    Removes the node and its incident edges, recomputes connected components,
    and returns the fragmented graph with cluster color assignments."""
    try:
        raw_graph = get_full_graph()
        nodes = raw_graph.get("nodes", [])
        links = raw_graph.get("links", [])

        # Find target node
        target_node = next((n for n in nodes if n["id"] == node_id), None)
        if not target_node:
            raise HTTPException(status_code=404, detail="Target node not found in graph")

        # Build NetworkX graph before removal
        G_before = nx.Graph()
        for n in nodes:
            G_before.add_node(n["id"])
        for l in links:
            G_before.add_edge(l["source"], l["target"])

        components_before = nx.number_connected_components(G_before)

        # Build NetworkX graph after removal
        G_after = G_before.copy()
        G_after.remove_node(node_id)

        # Find new connected components
        components = list(nx.connected_components(G_after))
        components_count = len(components)

        # Sort components by size (largest first)
        components.sort(key=len, reverse=True)

        # Filter remaining nodes and assign cluster IDs
        remaining_nodes = []
        node_cluster_map = {}
        for cluster_idx, comp in enumerate(components):
            color = CLUSTER_COLORS[cluster_idx % len(CLUSTER_COLORS)]
            for nid in comp:
                node_cluster_map[nid] = {
                    "cluster_id": cluster_idx,
                    "cluster_color": color,
                }

        for n in nodes:
            if n["id"] == node_id:
                continue
            n_copy = dict(n)
            cluster_info = node_cluster_map.get(n["id"], {"cluster_id": 0, "cluster_color": "#94a3b8"})
            n_copy["cluster_id"] = cluster_info["cluster_id"]
            n_copy["cluster_color"] = cluster_info["cluster_color"]
            remaining_nodes.append(n_copy)

        # Filter remaining links (exclude links connected to arrested node)
        remaining_links = [
            l for l in links
            if l["source"] != node_id and l["target"] != node_id
        ]

        target_name = target_node.get("display_name") or target_node.get("name", "Unknown Node")
        shattered = components_count > components_before

        tactical_summary = (
            f"Arresting '{target_name}' caused the syndicate network to fragment from "
            f"{components_before} to {components_count} isolated clusters. "
            f"All operational links passing through this node have been severed, "
            f"blinding cross-cell communication and cutting off financial transit."
            if shattered else
            f"Arresting '{target_name}' removed {len(links) - len(remaining_links)} connections. "
            f"The network remains in {components_count} component(s)."
        )

        return {
            "success": True,
            "arrested_node": target_node,
            "shattered": shattered,
            "components_before": components_before,
            "components_after": components_count,
            "tactical_summary": tactical_summary,
            "graph": {
                "nodes": remaining_nodes,
                "links": remaining_links,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Arrest simulation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
