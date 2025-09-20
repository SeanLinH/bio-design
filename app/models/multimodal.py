"""
Multimodal content models for visual analysis and processing
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID


class AnalysisType(str, Enum):
    """Types of multimodal content analysis"""
    MEDICAL_IMAGING = "medical_imaging"
    DESIGN_ANALYSIS = "design_analysis"
    PATENT_RESEARCH = "patent_research"
    CONCEPT_MAPPING = "concept_mapping"


class ProcessingStatus(str, Enum):
    """Processing status of multimodal content"""
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnnotationType(str, Enum):
    """Types of annotations on visual content"""
    USER_HIGHLIGHT = "user_highlight"
    AI_FINDING = "ai_finding"
    REGION_OF_INTEREST = "region_of_interest"


class Coordinates(BaseModel):
    """Coordinate system for regions and annotations"""
    x: int = Field(..., description="X coordinate in pixels")
    y: int = Field(..., description="Y coordinate in pixels") 
    width: int = Field(..., description="Width in pixels")
    height: int = Field(..., description="Height in pixels")


class Dimensions(BaseModel):
    """Image dimensions"""
    width: int = Field(..., description="Image width in pixels")
    height: int = Field(..., description="Image height in pixels")


class RegionOfInterest(BaseModel):
    """Region of interest detected in visual content"""
    region_id: str = Field(..., description="Unique identifier for the region")
    coordinates: Coordinates = Field(..., description="Region coordinates")
    finding: str = Field(..., description="Description of what was found")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")


class VisualAnalysis(BaseModel):
    """AI analysis results for visual content"""
    key_findings: List[str] = Field(default=[], description="Key findings from analysis")
    technical_assessment: Optional[str] = Field(None, description="Technical assessment")
    clinical_significance: Optional[str] = Field(None, description="Clinical significance")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Overall confidence")
    regions_of_interest: List[RegionOfInterest] = Field(default=[], description="Detected regions")


class AgentInterpretations(BaseModel):
    """Interpretations from different AI agents"""
    medical_expert: Optional[str] = Field(None, description="Medical expert interpretation")
    tech_engineer: Optional[str] = Field(None, description="Technical engineer interpretation")
    business_analyst: Optional[str] = Field(None, description="Business analyst interpretation")
    regulatory_agent: Optional[str] = Field(None, description="Regulatory agent interpretation")
    ethicist: Optional[str] = Field(None, description="Ethicist interpretation")
    patient_advocate: Optional[str] = Field(None, description="Patient advocate interpretation")


class Annotation(BaseModel):
    """User or AI annotation on visual content"""
    annotation_id: str = Field(..., description="Unique identifier for annotation")
    user_id: Optional[str] = Field(None, description="User who created annotation")
    coordinates: Coordinates = Field(..., description="Annotation coordinates")
    annotation_type: AnnotationType = Field(..., description="Type of annotation")
    note: str = Field(..., description="Annotation text/note")
    tags: List[str] = Field(default=[], description="Associated tags")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")


class MultimodalContent(BaseModel):
    """Complete multimodal content with analysis"""
    content_id: str = Field(..., description="Unique identifier for content")
    filename: str = Field(..., description="Original filename")
    file_type: str = Field(..., description="MIME type of the file")
    analysis_type: AnalysisType = Field(..., description="Type of analysis performed")
    processing_status: ProcessingStatus = Field(..., description="Current processing status")
    upload_time: datetime = Field(default_factory=datetime.utcnow, description="Upload timestamp")
    file_size: int = Field(..., description="File size in bytes")
    dimensions: Optional[Dimensions] = Field(None, description="Image dimensions if applicable")
    extracted_concepts: List[str] = Field(default=[], description="Extracted concepts")
    visual_analysis: Optional[VisualAnalysis] = Field(None, description="AI visual analysis results")
    agent_interpretations: Optional[AgentInterpretations] = Field(None, description="Agent interpretations")
    extracted_requirements: List[str] = Field(default=[], description="Extracted requirements")
    annotations: List[Annotation] = Field(default=[], description="User and AI annotations")
    related_documents: List[str] = Field(default=[], description="Related document IDs")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail URL")
    full_resolution_url: Optional[str] = Field(None, description="Full resolution URL")


class MultimodalUploadRequest(BaseModel):
    """Request model for multimodal content upload"""
    analysis_type: AnalysisType = Field(..., description="Type of analysis to perform")
    context: Optional[str] = Field(None, description="Context description for analysis")


class MultimodalAnalysisRequest(BaseModel):
    """Request model for visual content analysis"""
    content_ids: List[str] = Field(..., description="List of content IDs to analyze")
    analysis_request: str = Field(..., description="Specific analysis request")
    include_agent_perspectives: bool = Field(default=True, description="Include agent interpretations")


class AnnotationRequest(BaseModel):
    """Request model for adding annotations"""
    coordinates: Coordinates = Field(..., description="Annotation coordinates")
    annotation_type: AnnotationType = Field(..., description="Type of annotation")
    note: str = Field(..., description="Annotation text/note")
    tags: List[str] = Field(default=[], description="Associated tags")


class MultimodalUpdateRequest(BaseModel):
    """Request model for updating visual content analysis"""
    analysis_request: str = Field(..., description="Updated analysis request")
    include_regions: List[str] = Field(default=[], description="Specific regions to focus on")
    analysis_depth: str = Field(default="standard", description="Analysis depth level")
    agent_focus: List[str] = Field(default=[], description="Specific agents to focus on")


class MultimodalLibraryResponse(BaseModel):
    """Response model for multimodal content library"""
    multimodal_content: List[MultimodalContent] = Field(..., description="List of multimodal content")
    total_count: int = Field(..., description="Total count of content items")
    filters_applied: Dict[str, Any] = Field(default={}, description="Applied filters")


class MultimodalAnalysisResponse(BaseModel):
    """Response model for visual content analysis"""
    analysis_id: str = Field(..., description="Unique analysis identifier")
    visual_analysis: VisualAnalysis = Field(..., description="Analysis results")
    extracted_requirements: List[str] = Field(default=[], description="Extracted requirements")


class DocumentUploadResponse(BaseModel):
    """Enhanced document upload response with multimodal support"""
    message: str = Field(..., description="Upload status message")
    documents: List[Dict[str, Any]] = Field(default=[], description="Uploaded documents")
    multimodal_content: List[MultimodalContent] = Field(default=[], description="Uploaded multimodal content")
    session_id: str = Field(..., description="Session identifier")
