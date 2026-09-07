"""Neo4j Service — handles connection, MERGE upserts, and graph queries.
Uses Cypher MERGE to avoid duplicate nodes across FIRs."""
import os
import logging
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Neo4j connection config
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "operation_rakt")

_driver = None


def get_driver():
    """Lazy-initialize Neo4j driver (singleton)."""
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        # Verify connectivity
        _driver.verify_connectivity()
        logger.info(f"Connected to Neo4j at {NEO4J_URI}")
    return _driver


def close_driver():
    """Cleanly close driver on shutdown."""
    global _driver
    if _driver:
        _driver.close()
        _driver = None


def upsert_extraction(fir_number: str, extraction: dict) -> dict:
    """Upsert extracted POLE entities and relationships into Neo4j.
    Uses MERGE to avoid duplicates — same person across multiple FIRs becomes ONE node."""
    driver = get_driver()
    nodes_created = 0
    rels_created = 0

    with driver.session() as session:
        # 1. Create/merge the FIR node
        session.run(
            "MERGE (f:FIR {number: $number}) "
            "SET f.raw_text = $raw_text, f.ocr_confidence = $ocr_confidence",
            number=fir_number,
            raw_text=extraction.get("raw_text", ""),
            ocr_confidence=extraction.get("ocr_confidence", 1.0),
        )
        nodes_created += 1

        # 2. Upsert Person nodes
        for person in extraction.get("persons", []):
            result = session.run(
                "MERGE (p:Person {name: $name}) "
                "SET p.role = $role, p.description = $description, "
                "    p.phone = $phone, p.confidence = $confidence "
                "MERGE (f:FIR {number: $fir}) "
                "MERGE (p)-[:MENTIONED_IN]->(f) "
                "RETURN p",
                name=person["name"],
                role=person.get("role", "unknown"),
                description=person.get("description"),
                phone=person.get("phone"),
                confidence=person.get("confidence", 1.0),
                fir=fir_number,
            )
            nodes_created += 1

        # 3. Upsert Object nodes
        for obj in extraction.get("objects", []):
            result = session.run(
                "MERGE (o:Object {name: $name}) "
                "SET o.type = $type, o.identifier = $identifier, "
                "    o.description = $description, o.confidence = $confidence "
                "MERGE (f:FIR {number: $fir}) "
                "MERGE (o)-[:MENTIONED_IN]->(f) "
                "RETURN o",
                name=obj["name"],
                type=obj.get("type", "other"),
                identifier=obj.get("identifier"),
                description=obj.get("description"),
                confidence=obj.get("confidence", 1.0),
                fir=fir_number,
            )
            nodes_created += 1

        # 4. Upsert Location nodes
        for loc in extraction.get("locations", []):
            result = session.run(
                "MERGE (l:Location {name: $name}) "
                "SET l.type = $type, l.description = $description, "
                "    l.confidence = $confidence "
                "MERGE (f:FIR {number: $fir}) "
                "MERGE (l)-[:MENTIONED_IN]->(f) "
                "RETURN l",
                name=loc["name"],
                type=loc.get("type", "other"),
                description=loc.get("description"),
                confidence=loc.get("confidence", 1.0),
                fir=fir_number,
            )
            nodes_created += 1

        # 5. Upsert Event nodes
        for event in extraction.get("events", []):
            result = session.run(
                "MERGE (e:Event {description: $description}) "
                "SET e.event_type = $event_type, e.date = $date, "
                "    e.time = $time, e.confidence = $confidence "
                "MERGE (f:FIR {number: $fir}) "
                "MERGE (e)-[:MENTIONED_IN]->(f) "
                "RETURN e",
                description=event["description"],
                event_type=event.get("event_type", "other"),
                date=event.get("date"),
                time=event.get("time"),
                confidence=event.get("confidence", 1.0),
                fir=fir_number,
            )
            nodes_created += 1

        # 6. Upsert BNS tag nodes
        for tag in extraction.get("bns_tags", []):
            result = session.run(
                "MERGE (b:BNSSection {section: $section}) "
                "SET b.title = $title "
                "MERGE (f:FIR {number: $fir}) "
                "MERGE (f)-[:TAGGED_WITH {reasoning: $reasoning}]->(b) "
                "RETURN b",
                section=tag["section"],
                title=tag.get("title", ""),
                reasoning=tag.get("reasoning", ""),
                fir=fir_number,
            )
            nodes_created += 1

        # 7. Create relationships between entities
        # Map entity types to Neo4j labels
        type_to_label = {
            "person": "Person",
            "object": "Object",
            "location": "Location",
            "event": "Event",
        }

        for rel in extraction.get("relationships", []):
            src_label = type_to_label.get(rel.get("source_type", "").lower(), "Person")
            tgt_label = type_to_label.get(rel.get("target_type", "").lower(), "Person")
            rel_type = rel.get("relationship", "CONNECTED_TO").upper().replace(" ", "_")

            # Sanitize relationship type (only allow alphanumeric + underscore)
            rel_type = "".join(c if c.isalnum() or c == "_" else "_" for c in rel_type)

            try:
                # Use dynamic relationship type via APOC or string concatenation
                # Since we can't parameterize relationship types in Cypher, we use
                # a safe whitelist approach
                query = (
                    f"MATCH (a:{src_label} {{name: $src_name}}) "
                    f"MATCH (b:{tgt_label} {{name: $tgt_name}}) "
                    f"MERGE (a)-[r:{rel_type}]->(b) "
                    f"RETURN r"
                )
                session.run(
                    query,
                    src_name=rel["source_name"],
                    tgt_name=rel["target_name"],
                )
                rels_created += 1
            except Exception as e:
                logger.warning(f"Failed to create relationship {rel}: {e}")

    logger.info(f"Upserted FIR {fir_number}: {nodes_created} nodes, {rels_created} relationships")
    return {"nodes_created": nodes_created, "relationships_created": rels_created}


def get_full_graph() -> dict:
    """Fetch the entire graph as nodes + links for frontend visualization."""
    driver = get_driver()

    with driver.session() as session:
        # Get all nodes with their labels and properties
        nodes_result = session.run(
            "MATCH (n) "
            "RETURN id(n) AS id, labels(n) AS labels, properties(n) AS props"
        )
        nodes = []
        for record in nodes_result:
            node_labels = record["labels"]
            # Pick primary label (skip internal labels)
            primary_label = node_labels[0] if node_labels else "Unknown"
            props = dict(record["props"])
            props["id"] = record["id"]
            props["label"] = primary_label
            props["display_name"] = props.get("name") or props.get("description") or props.get("number") or f"{primary_label}_{record['id']}"
            nodes.append(props)

        # Get all relationships
        rels_result = session.run(
            "MATCH (a)-[r]->(b) "
            "RETURN id(a) AS source, id(b) AS target, type(r) AS type, properties(r) AS props"
        )
        links = []
        for record in rels_result:
            link = {
                "source": record["source"],
                "target": record["target"],
                "type": record["type"],
                **dict(record["props"]),
            }
            links.append(link)

    return {"nodes": nodes, "links": links}


def get_node_details(node_id: int) -> dict:
    """Get detailed properties of a specific node."""
    driver = get_driver()

    with driver.session() as session:
        result = session.run(
            "MATCH (n) WHERE id(n) = $id "
            "OPTIONAL MATCH (n)-[r]-(connected) "
            "RETURN n, labels(n) AS labels, "
            "collect({rel_type: type(r), connected_id: id(connected), "
            "connected_name: connected.name, connected_labels: labels(connected)}) AS connections",
            id=node_id,
        )
        record = result.single()
        if not record:
            return None

        props = dict(record["n"])
        props["id"] = node_id
        props["labels"] = record["labels"]
        props["connections"] = [c for c in record["connections"] if c["rel_type"] is not None]

        return props


def reset_database():
    """Wipe all nodes and relationships — for seed/reset script."""
    driver = get_driver()
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
    logger.info("Database reset — all nodes and relationships deleted")


def get_node_count() -> int:
    """Quick count of total nodes."""
    driver = get_driver()
    with driver.session() as session:
        result = session.run("MATCH (n) RETURN count(n) AS count")
        return result.single()["count"]
