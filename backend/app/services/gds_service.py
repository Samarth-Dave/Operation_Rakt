"""Graph Data Science (GDS) and Network Analysis Service.
Runs Betweenness Centrality and PageRank.
Tries Neo4j GDS first, and falls back to NetworkX seamlessly for 100% demo reliability."""
import logging
import networkx as nx
from app.services.neo4j_service import get_driver, get_full_graph

logger = logging.getLogger(__name__)


def compute_centrality_networkx(graph_data: dict) -> dict:
    """Compute Betweenness Centrality and PageRank using NetworkX."""
    G = nx.Graph()

    for node in graph_data.get("nodes", []):
        G.add_node(node["id"], **node)

    for link in graph_data.get("links", []):
        G.add_edge(link["source"], link["target"], type=link.get("type", "RELATED"))

    if len(G) == 0:
        return {"scores": {}, "top_bridge": None, "algorithm": "networkx"}

    # Compute Betweenness Centrality
    betweenness = nx.betweenness_centrality(G, normalized=True)

    # Compute PageRank
    try:
        pagerank = nx.pagerank(G, alpha=0.85)
    except Exception:
        pagerank = {n: 1.0 / len(G) for n in G.nodes()}

    # Combine scores
    scores = {}
    for node_id in G.nodes():
        scores[node_id] = {
            "betweenness": round(betweenness.get(node_id, 0.0), 4),
            "pagerank": round(pagerank.get(node_id, 0.0), 4),
        }

    # Identify top bridge node (highest betweenness)
    top_node_id = max(betweenness, key=betweenness.get) if betweenness else None
    top_bridge = None
    if top_node_id is not None:
        node_props = G.nodes[top_node_id]
        top_bridge = {
            "id": top_node_id,
            "name": node_props.get("display_name") or node_props.get("name", "Unknown"),
            "label": node_props.get("label", "Node"),
            "betweenness": round(betweenness[top_node_id], 4),
            "pagerank": round(pagerank.get(top_node_id, 0.0), 4),
            "reason": f"Acts as the primary bottleneck / bridge connecting disparate clusters in the criminal network.",
        }

    return {
        "scores": scores,
        "top_bridge": top_bridge,
        "algorithm": "networkx_fallback",
    }


def run_centrality_analysis() -> dict:
    """Run centrality analysis. Tries Neo4j GDS first; if unavailable, uses NetworkX."""
    driver = get_driver()
    graph_data = get_full_graph()

    if not graph_data["nodes"]:
        return {"scores": {}, "top_bridge": None, "algorithm": "none"}

    # Attempt Neo4j GDS
    try:
        with driver.session() as session:
            # Check if GDS is available
            check_gds = session.run("SHOW PROCEDURES YIELD name WHERE name STARTS WITH 'gds' RETURN count(*) AS count")
            gds_count = check_gds.single()["count"]

            if gds_count > 0:
                logger.info("Neo4j GDS detected. Running GDS centrality...")
                # Try graph projection and betweenness
                proj_name = "criminalNetworkGraph"
                session.run("CALL gds.graph.drop($name, false) YIELD graphName", name=proj_name)
                session.run(
                    "CALL gds.graph.project($name, '*', '*')",
                    name=proj_name
                )
                
                bw_result = session.run(
                    "CALL gds.betweenness.stream($name) "
                    "YIELD nodeId, score "
                    "RETURN gds.util.asNode(nodeId).id AS id, score "
                    "ORDER BY score DESC",
                    name=proj_name
                )
                gds_scores = {}
                for rec in bw_result:
                    nid = rec["id"]
                    if nid is not None:
                        gds_scores[nid] = {"betweenness": round(rec["score"], 4), "pagerank": 0.0}

                # PageRank
                pr_result = session.run(
                    "CALL gds.pageRank.stream($name) "
                    "YIELD nodeId, score "
                    "RETURN gds.util.asNode(nodeId).id AS id, score",
                    name=proj_name
                )
                for rec in pr_result:
                    nid = rec["id"]
                    if nid is not None and nid in gds_scores:
                        gds_scores[nid]["pagerank"] = round(rec["score"], 4)

                # Clean up projection
                session.run("CALL gds.graph.drop($name, false)", name=proj_name)

                if gds_scores:
                    top_id = max(gds_scores, key=lambda k: gds_scores[k]["betweenness"])
                    # Find node info
                    top_node = next((n for n in graph_data["nodes"] if n["id"] == top_id), None)
                    return {
                        "scores": gds_scores,
                        "top_bridge": {
                            "id": top_id,
                            "name": top_node.get("display_name", "Unknown") if top_node else str(top_id),
                            "betweenness": gds_scores[top_id]["betweenness"],
                            "pagerank": gds_scores[top_id]["pagerank"],
                            "reason": "Top bridge identified via Neo4j Graph Data Science Betweenness Centrality.",
                        },
                        "algorithm": "neo4j_gds",
                    }
    except Exception as e:
        logger.warning(f"Neo4j GDS failed or not configured ({e}). Using NetworkX fallback.")

    # Fallback: compute via NetworkX
    return compute_centrality_networkx(graph_data)
