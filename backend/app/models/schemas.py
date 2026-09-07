"""Pydantic schemas for POLE (Person, Object, Location, Event) extraction from FIRs."""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class PersonRole(str, Enum):
    VICTIM = "victim"
    SUSPECT = "suspect"
    WITNESS = "witness"
    ASSOCIATE = "associate"
    UNKNOWN = "unknown"


class Person(BaseModel):
    name: str = Field(..., description="Full name or alias of the person")
    role: PersonRole = Field(..., description="Role in the FIR narrative")
    description: Optional[str] = Field(None, description="Physical description, alias, or other identifying info")
    phone: Optional[str] = Field(None, description="Phone number if mentioned")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Extraction confidence score")


class ObjectEntity(BaseModel):
    """An object/vehicle/weapon mentioned in the FIR."""
    name: str = Field(..., description="Object name or description")
    type: str = Field(..., description="Category: vehicle, weapon, document, money, phone, other")
    identifier: Optional[str] = Field(None, description="Registration number, serial number, etc.")
    description: Optional[str] = Field(None, description="Additional details")
    confidence: float = Field(1.0, ge=0.0, le=1.0)


class Location(BaseModel):
    name: str = Field(..., description="Location name or address")
    type: str = Field(..., description="Category: crime_scene, residence, hideout, office, other")
    description: Optional[str] = Field(None, description="Additional location details")
    confidence: float = Field(1.0, ge=0.0, le=1.0)


class Event(BaseModel):
    description: str = Field(..., description="Brief description of the event")
    event_type: str = Field(..., description="Category: crime, threat, transaction, meeting, arrest, other")
    date: Optional[str] = Field(None, description="Date of event if mentioned (any format)")
    time: Optional[str] = Field(None, description="Time of event if mentioned")
    confidence: float = Field(1.0, ge=0.0, le=1.0)


class BNSTag(BaseModel):
    section: str = Field(..., description="BNS 2023 section number")
    title: str = Field(..., description="Section title")
    reasoning: str = Field(..., description="Why this section applies to the narrative")


class Relationship(BaseModel):
    """A directed relationship between two entities."""
    source_name: str = Field(..., description="Name of the source entity")
    source_type: str = Field(..., description="Type: person, object, location, event")
    target_name: str = Field(..., description="Name of the target entity")
    target_type: str = Field(..., description="Type: person, object, location, event")
    relationship: str = Field(..., description="Relationship label, e.g. COMMITTED, OWNS, LOCATED_AT, INVOLVED_IN, THREATENED, CONNECTED_TO")


class FIRExtraction(BaseModel):
    """Complete structured extraction from a single FIR document."""
    fir_number: str = Field(..., description="FIR number or identifier")
    raw_text: str = Field(..., description="Original OCR text")
    persons: list[Person] = Field(default_factory=list)
    objects: list[ObjectEntity] = Field(default_factory=list)
    locations: list[Location] = Field(default_factory=list)
    events: list[Event] = Field(default_factory=list)
    bns_tags: list[BNSTag] = Field(default_factory=list)
    relationships: list[Relationship] = Field(default_factory=list)
    ocr_confidence: float = Field(1.0, ge=0.0, le=1.0, description="Overall OCR confidence")


class ExtractionResponse(BaseModel):
    """API response wrapping extraction result + metadata."""
    success: bool
    extraction: Optional[FIRExtraction] = None
    needs_review: bool = Field(False, description="True if OCR confidence is below threshold")
    error: Optional[str] = None
