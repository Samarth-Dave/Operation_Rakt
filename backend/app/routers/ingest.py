"""Ingest Router — handles FIR upload, OCR, LLM extraction, and commit to graph."""
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import ocr_service, llm_service
from app.services.neo4j_service import upsert_extraction, reset_database

router = APIRouter()
logger = logging.getLogger(__name__)

# OCR confidence threshold — below this, flag for manual review
CONFIDENCE_THRESHOLD = 60.0


@router.post("/upload")
async def upload_fir(file: UploadFile = File(...)):
    """Upload a FIR document (PDF, image, or text file).
    Returns extracted POLE entities + BNS tags for review before committing to graph."""
    try:
        # Read file bytes
        file_bytes = await file.read()
        filename = file.filename or "unknown.txt"
        logger.info(f"Processing upload: {filename} ({len(file_bytes)} bytes)")

        # Step 1: OCR extraction
        try:
            raw_text, ocr_confidence = ocr_service.extract_text(file_bytes, filename)
        except RuntimeError as e:
            raise HTTPException(status_code=422, detail=f"OCR failed: {e}")

        if not raw_text.strip():
            raise HTTPException(status_code=422, detail="No text could be extracted from the document.")

        logger.info(f"OCR complete: {len(raw_text)} chars, confidence: {ocr_confidence:.1f}%")

        # Step 2: LLM entity extraction + BNS tagging
        try:
            extraction = llm_service.extract_entities(raw_text)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=f"LLM extraction failed: {e}")

        # Attach metadata
        extraction["raw_text"] = raw_text
        extraction["ocr_confidence"] = round(ocr_confidence / 100.0, 2)  # Normalize to 0-1
        needs_review = ocr_confidence < CONFIDENCE_THRESHOLD

        return {
            "success": True,
            "needs_review": needs_review,
            "extraction": extraction,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload processing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/confirm")
async def confirm_extraction(extraction: dict):
    """After human review/edit, commit the extraction to Neo4j graph.
    Accepts the (possibly edited) extraction JSON and upserts it."""
    try:
        fir_number = extraction.get("fir_number", "UNKNOWN")
        logger.info(f"Committing extraction for FIR: {fir_number}")

        result = upsert_extraction(fir_number, extraction)

        return {
            "success": True,
            "fir_number": fir_number,
            "nodes_created": result.get("nodes_created", 0),
            "relationships_created": result.get("relationships_created", 0),
            "message": f"FIR {fir_number} committed to graph successfully.",
        }

    except Exception as e:
        logger.error(f"Graph commit failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Graph commit failed: {str(e)}")


@router.post("/wipe")
async def wipe_database():
    """Wipe all nodes and relationships from the graph."""
    try:
        logger.info("Wiping Neo4j database...")
        reset_database()
        return {"success": True, "message": "Database wiped successfully."}
    except Exception as e:
        logger.error(f"Failed to wipe database: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Wipe failed: {str(e)}")
