"""Seed/Reset Script — populates Neo4j with mock FIR data for demo.
Usage:
    python seed.py          # Seed mock FIRs (additive)
    python seed.py --reset  # Wipe DB first, then seed
"""
import sys
import os
import logging
from pathlib import Path

# Add parent to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from app.services import llm_service, neo4j_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MOCK_FIRS_DIR = Path(__file__).parent / "app" / "data" / "mock_firs"


def seed_database(reset: bool = False):
    """Read all mock FIR text files, extract entities via LLM, and upsert into Neo4j."""

    if reset:
        logger.info("🗑️  Resetting database...")
        neo4j_service.reset_database()
        logger.info("✅ Database cleared.")

    # Find all mock FIR files
    fir_files = sorted(MOCK_FIRS_DIR.glob("*.txt"))
    if not fir_files:
        logger.error(f"No mock FIR files found in {MOCK_FIRS_DIR}")
        return

    logger.info(f"📄 Found {len(fir_files)} mock FIR files to process")

    for i, fir_file in enumerate(fir_files, 1):
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing FIR {i}/{len(fir_files)}: {fir_file.name}")
        logger.info(f"{'='*60}")

        # Read the text
        text = fir_file.read_text(encoding="utf-8")

        # Extract FIR number from filename or text
        fir_number = fir_file.stem.replace("_", "/").upper()

        # Run LLM extraction
        try:
            extraction = llm_service.extract_entities(text, fir_number)
            extraction["raw_text"] = text
            extraction["ocr_confidence"] = 1.0  # Mock data, full confidence

            # Upsert into Neo4j
            result = neo4j_service.upsert_extraction(
                extraction.get("fir_number", fir_number),
                extraction
            )
            logger.info(
                f"✅ FIR {fir_number}: {result['nodes_created']} nodes, "
                f"{result['relationships_created']} relationships"
            )
        except Exception as e:
            logger.error(f"❌ Failed to process {fir_file.name}: {e}")
            continue

    # Print summary
    total_nodes = neo4j_service.get_node_count()
    logger.info(f"\n{'='*60}")
    logger.info(f"🎉 Seeding complete! Total nodes in graph: {total_nodes}")
    logger.info(f"{'='*60}")


if __name__ == "__main__":
    reset = "--reset" in sys.argv
    seed_database(reset=reset)
