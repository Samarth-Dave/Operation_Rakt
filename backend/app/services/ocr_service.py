"""OCR Service — extracts text from uploaded FIR documents (PDF or image).
Uses pdfplumber for digital PDFs, Tesseract for scanned/handwritten docs."""
import io
import os
import logging
from pathlib import Path
from PIL import Image
import pytesseract
import pdfplumber
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Configure Tesseract path for Windows
tesseract_cmd = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
if Path(tesseract_cmd).exists():
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

# OCR confidence threshold — below this, flag for manual review
CONFIDENCE_THRESHOLD = 60.0


def extract_text_from_image(image_bytes: bytes) -> tuple[str, float]:
    """Extract text from an image using Tesseract OCR.
    Returns (extracted_text, confidence_score 0-100)."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to grayscale for better OCR accuracy
        image = image.convert("L")

        # Get detailed OCR data including confidence scores
        ocr_data = pytesseract.image_to_data(image, lang="eng+hin", output_type=pytesseract.Output.DICT)

        # Calculate average confidence (exclude -1 which means no text detected)
        confidences = [int(c) for c in ocr_data["conf"] if int(c) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        # Get the full text
        text = pytesseract.image_to_string(image, lang="eng+hin")
        return text.strip(), avg_confidence

    except Exception as e:
        logger.error(f"Tesseract OCR failed: {e}")
        raise RuntimeError(f"OCR extraction failed: {e}")


def extract_text_from_pdf(pdf_bytes: bytes) -> tuple[str, float]:
    """Extract text from PDF. Tries pdfplumber (digital) first, falls back to Tesseract (scanned).
    Returns (extracted_text, confidence_score 0-100)."""
    text = ""
    try:
        # First try pdfplumber for digitally-generated PDFs
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        if text.strip():
            # pdfplumber got text → it's a digital PDF, confidence is high
            logger.info("Extracted text via pdfplumber (digital PDF)")
            return text.strip(), 95.0

    except Exception as e:
        logger.warning(f"pdfplumber failed, falling back to Tesseract: {e}")

    # Fallback: convert PDF pages to images and OCR them
    try:
        # Use pdfplumber to get page images
        all_text = []
        all_conf = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                # Convert page to image
                img = page.to_image(resolution=300)
                img_bytes = io.BytesIO()
                img.original.save(img_bytes, format="PNG")
                img_bytes.seek(0)

                page_text, page_conf = extract_text_from_image(img_bytes.read())
                if page_text:
                    all_text.append(page_text)
                    all_conf.append(page_conf)

        if all_text:
            avg_conf = sum(all_conf) / len(all_conf)
            return "\n".join(all_text), avg_conf

    except Exception as e:
        logger.error(f"PDF OCR fallback also failed: {e}")
        raise RuntimeError(f"Could not extract text from PDF: {e}")

    return "", 0.0


def extract_text(file_bytes: bytes, filename: str) -> tuple[str, float]:
    """Main entry point — detect file type and extract text.
    Returns (text, confidence_score 0-100)."""
    ext = Path(filename).suffix.lower()

    if ext in (".pdf",):
        text, confidence = extract_text_from_pdf(file_bytes)
    elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"):
        text, confidence = extract_text_from_image(file_bytes)
    elif ext in (".txt",):
        # Plain text files — no OCR needed
        text = file_bytes.decode("utf-8", errors="replace")
        confidence = 100.0
    else:
        raise ValueError(f"Unsupported file type: {ext}. Accepted: .pdf, .png, .jpg, .jpeg, .tiff, .bmp, .txt")

    needs_review = confidence < CONFIDENCE_THRESHOLD
    if needs_review:
        logger.warning(f"Low OCR confidence ({confidence:.1f}%) for {filename} — flagging for review")

    return text, confidence
