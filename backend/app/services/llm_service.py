"""LLM Service — extracts structured POLE entities from FIR text and tags BNS 2023 sections.
Supports Google Gemini, Groq (Llama 3), and an offline deterministic fallback for maximum demo reliability."""
import os
import json
import logging
import urllib.request
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Load BNS reference data
BNS_REF_PATH = Path(__file__).parent.parent / "data" / "bns_reference.json"
with open(BNS_REF_PATH, "r", encoding="utf-8") as f:
    BNS_REFERENCE = json.load(f)

# System prompt for strict POLE + BNS extraction
SYSTEM_PROMPT = """You are a legal intelligence extraction system for Indian law enforcement.
You analyze First Information Report (FIR) text and extract structured entities using the
POLE (Person, Object, Location, Event) data model.

You MUST return ONLY valid JSON matching this exact schema. No explanations, no markdown, no extra text.

{
  "fir_number": "string — the FIR number from the document",
  "persons": [
    {
      "name": "string — full name or alias",
      "role": "string — one of: victim, suspect, witness, associate, unknown",
      "description": "string or null — physical description, alias info",
      "phone": "string or null — phone number if mentioned",
      "confidence": number 0.0-1.0
    }
  ],
  "objects": [
    {
      "name": "string — object name",
      "type": "string — one of: vehicle, weapon, document, money, phone, other",
      "identifier": "string or null — registration/serial number",
      "description": "string or null",
      "confidence": number 0.0-1.0
    }
  ],
  "locations": [
    {
      "name": "string — location name or address",
      "type": "string — one of: crime_scene, residence, hideout, office, other",
      "description": "string or null",
      "confidence": number 0.0-1.0
    }
  ],
  "events": [
    {
      "description": "string — brief event description",
      "event_type": "string — one of: crime, threat, transaction, meeting, arrest, other",
      "date": "string or null",
      "time": "string or null",
      "confidence": number 0.0-1.0
    }
  ],
  "relationships": [
    {
      "source_name": "string — name of source entity",
      "source_type": "string — person, object, location, event",
      "target_name": "string — name of target entity",
      "target_type": "string — person, object, location, event",
      "relationship": "string — e.g. COMMITTED, OWNS, LOCATED_AT, INVOLVED_IN, THREATENED, CONNECTED_TO, WORKS_FOR, COLLECTED_BY, RIDES, WITNESSED"
    }
  ],
  "bns_tags": [
    {
      "section": "string — BNS section number",
      "title": "string — section title",
      "reasoning": "string — why this section applies"
    }
  ]
}

RULES:
1. Extract ALL persons, objects, locations, and events mentioned in the text.
2. Create relationships that connect entities to each other based on the narrative.
3. For persons, determine their role in the crime (victim, suspect, witness, etc.)
4. For BNS tagging, match the crime narrative to the provided BNS sections below.
5. Preserve original names as-is (Hindi names, aliases). Do NOT translate names.
6. Set confidence to 0.7-0.9 for explicitly stated facts, 0.5-0.6 for indirect mentions.
7. Return ONLY the JSON object. No markdown code fences, no extra text.

AVAILABLE BNS 2023 SECTIONS FOR TAGGING:
"""


def build_prompt(fir_text: str) -> str:
    """Build the full prompt with BNS reference data appended."""
    bns_section_text = "\n".join(
        f"- Section {s['section']}: {s['title']} — {s['description']}"
        for s in BNS_REFERENCE["sections"]
    )
    return SYSTEM_PROMPT + bns_section_text + "\n\nFIR TEXT TO ANALYZE:\n\n" + fir_text


def _clean_json_text(text: str) -> str:
    """Strip markdown fences if present."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def extract_with_gemini(fir_text: str, fir_number: str) -> dict:
    """Extract entities using Google Gemini 1.5 Flash."""
    import google.generativeai as genai
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    genai.configure(api_key=api_key)
    prompt = build_prompt(fir_text)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )
    cleaned = _clean_json_text(response.text)
    data = json.loads(cleaned)
    if not data.get("fir_number") or data["fir_number"] == "UNKNOWN":
        data["fir_number"] = fir_number
    return data


def extract_with_groq(fir_text: str, fir_number: str) -> dict:
    """Extract entities using Groq API (e.g. Llama 3)."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set.")
    prompt = build_prompt(fir_text)
    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a legal intelligence extraction system. Always reply with valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        content = body["choices"][0]["message"]["content"]
        data = json.loads(_clean_json_text(content))
        if not data.get("fir_number") or data["fir_number"] == "UNKNOWN":
            data["fir_number"] = fir_number
        return data


def extract_deterministic_fallback(fir_text: str, fir_number: str) -> dict:
    """Deterministic POLE extractor for offline testing / demo fallback."""
    logger.info(f"Using deterministic fallback extraction for FIR {fir_number}")
    lower = fir_text.lower()
    
    persons = []
    objects = []
    locations = []
    events = []
    relationships = []
    bns_tags = []

    # Detect known mock FIR personas
    if "chhotu" in lower:
        persons.append({"name": "Chhotu", "role": "suspect", "description": "Height 5'8, snake tattoo on left hand, collection agent", "phone": None, "confidence": 0.95})
    if "rajesh kumar agarwal" in lower or "agarwal" in lower:
        persons.append({"name": "Rajesh Kumar Agarwal", "role": "victim", "description": "Owner of Agarwal Textile Mills", "phone": None, "confidence": 0.95})
    if "vikram" in lower:
        persons.append({"name": "Vikram Singh Tomar", "role": "suspect", "description": "Kingpin based in Delhi/Ghaziabad, oversees syndicate", "phone": None, "confidence": 0.95})
    if "shankar" in lower:
        persons.append({"name": "Shankar Yadav", "role": "associate", "description": "Owner of Shankar Tea Stall, front man for collections", "phone": None, "confidence": 0.85})
    if "farhan shaikh" in lower:
        persons.append({"name": "Farhan Shaikh", "role": "victim", "description": "Owner of Shaikh Electronics, Jogeshwari", "phone": None, "confidence": 0.95})
    if "deepak" in lower:
        persons.append({"name": "Deepak Jadhav", "role": "suspect", "description": "Aggressive syndicate enforcer, operates Maruti Swift", "phone": None, "confidence": 0.95})
    if "ramesh" in lower:
        persons.append({"name": "Ramesh Gupta", "role": "suspect", "description": "Royal Hotel Goregaon manager & hawala conduit to Delhi", "phone": None, "confidence": 0.98})
    if "suresh" in lower:
        persons.append({"name": "Suresh Pandey", "role": "associate", "description": "Logistics coordinator based in Thane", "phone": None, "confidence": 0.90})
    if "amit verma" in lower:
        persons.append({"name": "Amit Verma", "role": "victim", "description": "Shopkeeper, Verma General Store, Versova", "phone": None, "confidence": 0.95})
    if "bunty" in lower:
        persons.append({"name": "Bunty", "role": "suspect", "description": "Syndicate muscle, scar on right arm", "phone": None, "confidence": 0.90})
    if "priya deshmukh" in lower:
        persons.append({"name": "SI Priya Deshmukh", "role": "witness", "description": "Sub-Inspector Crime Branch, investigating officer", "phone": None, "confidence": 0.95})

    # Objects
    if "mh-02-ab-1234" in lower or "pulsar" in lower:
        objects.append({"name": "Black Bajaj Pulsar", "type": "vehicle", "identifier": "MH-02-AB-1234", "description": "Fleeing motorcycle used in extortion drops", "confidence": 0.95})
        if any(p["name"] == "Chhotu" for p in persons):
            relationships.append({"source_name": "Chhotu", "source_type": "person", "target_name": "Black Bajaj Pulsar", "target_type": "object", "relationship": "RIDES"})
    if "mh-04-cd-5678" in lower or "swift" in lower:
        objects.append({"name": "White Maruti Swift", "type": "vehicle", "identifier": "MH-04-CD-5678", "description": "Vehicle registered to Deepak Jadhav", "confidence": 0.95})
        if any(p["name"] == "Deepak Jadhav" for p in persons):
            relationships.append({"source_name": "Deepak Jadhav", "source_type": "person", "target_name": "White Maruti Swift", "target_type": "object", "relationship": "OWNS"})
    if "mh-01-ef-9012" in lower or "fortuner" in lower:
        objects.append({"name": "Toyota Fortuner", "type": "vehicle", "identifier": "MH-01-EF-9012", "description": "Registered to Ramesh Gupta", "confidence": 0.95})
        if any(p["name"] == "Ramesh Gupta" for p in persons):
            relationships.append({"source_name": "Ramesh Gupta", "source_type": "person", "target_name": "Toyota Fortuner", "target_type": "object", "relationship": "OWNS"})
    if "katta" in lower or "pistol" in lower:
        objects.append({"name": "Desi Katta Pistol", "type": "weapon", "identifier": "Unlicensed Firearm", "description": "Used to threaten victims", "confidence": 0.90})

    # Locations
    if "andheri" in lower or "agarwal textile" in lower:
        locations.append({"name": "Agarwal Textile Mills, Andheri", "type": "crime_scene", "description": "Extortion site on Link Road", "confidence": 0.95})
    if "shankar tea stall" in lower or "lokhandwala" in lower:
        locations.append({"name": "Shankar Tea Stall, Lokhandwala", "type": "hideout", "description": "Drop point for extortion cash", "confidence": 0.90})
    if "royal hotel" in lower or "goregaon" in lower:
        locations.append({"name": "Royal Hotel, Goregaon West", "type": "office", "description": "Headquarters of hawala cash consolidation", "confidence": 0.95})
    if "jogeshwari" in lower or "shaikh electronics" in lower:
        locations.append({"name": "Shaikh Electronics, Jogeshwari", "type": "crime_scene", "description": "Target of extortion demand", "confidence": 0.95})
    if "delhi" in lower or "ghaziabad" in lower:
        locations.append({"name": "Delhi Syndicate HQ", "type": "hideout", "description": "Base of operation for Vikram Singh Tomar", "confidence": 0.90})

    # Events
    if "extortion" in lower or "2 lakh" in lower or "1.5 lakh" in lower:
        events.append({"description": "Extortion Demand & Intimidation", "event_type": "crime", "date": "June 2024", "time": "Evening", "confidence": 0.95})
        bns_tags.append({"section": "308", "title": "Extortion", "reasoning": "Coercive demand for money under threat of property burning and violence."})
        bns_tags.append({"section": "111", "title": "Organised Crime", "reasoning": "Continuing criminal activity by syndicate members acting under Vikram Singh Tomar."})
    if "assault" in lower or "counter toda" in lower or "mukke" in lower:
        events.append({"description": "Physical Assault and Shop Vandalism", "event_type": "crime", "date": "July 2024", "time": "21:00", "confidence": 0.95})
        bns_tags.append({"section": "115", "title": "Voluntarily Causing Hurt", "reasoning": "Physical violence resulting in bleeding and facial injury."})
        bns_tags.append({"section": "309", "title": "Robbery", "reasoning": "Extortion coupled with violent looting of 50,000 cash from counter."})
    if "hawala" in lower or "bank account" in lower:
        events.append({"description": "Hawala Money Routing to Delhi", "event_type": "transaction", "date": "July 2024", "time": None, "confidence": 0.95})
        bns_tags.append({"section": "111", "title": "Organised Crime", "reasoning": "Financial laundering and syndication of extortion proceeds."})

    # Inter-person relationships
    names = [p["name"] for p in persons]
    if "Chhotu" in names and "Vikram Singh Tomar" in names:
        relationships.append({"source_name": "Chhotu", "source_type": "person", "target_name": "Vikram Singh Tomar", "target_type": "person", "relationship": "WORKS_FOR"})
    if "Deepak Jadhav" in names and "Vikram Singh Tomar" in names:
        relationships.append({"source_name": "Deepak Jadhav", "source_type": "person", "target_name": "Vikram Singh Tomar", "target_type": "person", "relationship": "WORKS_FOR"})
    if "Shankar Yadav" in names and "Ramesh Gupta" in names:
        relationships.append({"source_name": "Shankar Yadav", "source_type": "person", "target_name": "Ramesh Gupta", "target_type": "person", "relationship": "ROUTES_CASH_TO"})
    if "Ramesh Gupta" in names and "Vikram Singh Tomar" in names:
        relationships.append({"source_name": "Ramesh Gupta", "source_type": "person", "target_name": "Vikram Singh Tomar", "target_type": "person", "relationship": "TRANSFERS_FUNDS_TO"})
    if "Deepak Jadhav" in names and "Ramesh Gupta" in names:
        relationships.append({"source_name": "Deepak Jadhav", "source_type": "person", "target_name": "Ramesh Gupta", "target_type": "person", "relationship": "DEPOSITS_COLLECTION"})
    if "Suresh Pandey" in names and "Deepak Jadhav" in names:
        relationships.append({"source_name": "Suresh Pandey", "source_type": "person", "target_name": "Deepak Jadhav", "target_type": "person", "relationship": "DISPATCHES"})
    if "Bunty" in names and "Deepak Jadhav" in names:
        relationships.append({"source_name": "Bunty", "source_type": "person", "target_name": "Deepak Jadhav", "target_type": "person", "relationship": "ACCOMPLICE_OF"})
    if "Chhotu" in names and "Rajesh Kumar Agarwal" in names:
        relationships.append({"source_name": "Chhotu", "source_type": "person", "target_name": "Rajesh Kumar Agarwal", "target_type": "person", "relationship": "THREATENED"})

    return {
        "fir_number": fir_number,
        "persons": persons,
        "objects": objects,
        "locations": locations,
        "events": events,
        "relationships": relationships,
        "bns_tags": bns_tags,
    }


def extract_entities(fir_text: str, fir_number: str = "UNKNOWN") -> dict:
    """Main extraction router — tries Gemini, then Groq, then deterministic fallback."""
    # 1. Try Gemini
    if os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"):
        try:
            logger.info("Extracting entities via Gemini 1.5 Flash...")
            return extract_with_gemini(fir_text, fir_number)
        except Exception as e:
            logger.warning(f"Gemini extraction failed: {e}. Checking alternatives...")

    # 2. Try Groq
    if os.getenv("GROQ_API_KEY"):
        try:
            logger.info("Extracting entities via Groq (Llama 3)...")
            return extract_with_groq(fir_text, fir_number)
        except Exception as e:
            logger.warning(f"Groq extraction failed: {e}. Falling back...")

    # 3. Deterministic fallback for mock data
    return extract_deterministic_fallback(fir_text, fir_number)
