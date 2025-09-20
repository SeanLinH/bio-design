"""
Multimodal content processing service for visual analysis
"""

import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any, BinaryIO
from fastapi import UploadFile, HTTPException
from PIL import Image
import io

from app.models.multimodal import (
    MultimodalContent, AnalysisType, ProcessingStatus, VisualAnalysis,
    AgentInterpretations, RegionOfInterest, Coordinates, Dimensions,
    Annotation, AnnotationType, MultimodalAnalysisRequest, AnnotationRequest,
    MultimodalUpdateRequest, MultimodalLibraryResponse, MultimodalAnalysisResponse
)
from app.utils.logging import get_logger

logger = get_logger(__name__)


class MultimodalService:
    """Service for handling multimodal content processing and analysis"""
    
    def __init__(self):
        self.storage_path = "data/multimodal"
        self.allowed_image_types = {
            "image/jpeg", "image/jpg", "image/png", "image/tiff", 
            "image/bmp", "image/webp"
        }
        self.allowed_medical_types = {
            "application/dicom", "image/dicom"
        }
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        
        # In-memory storage for demonstration (would be replaced with database)
        self.content_store: Dict[str, MultimodalContent] = {}
        self.session_content: Dict[str, List[str]] = {}  # session_id -> [content_ids]
        
        # Ensure storage directory exists
        os.makedirs(self.storage_path, exist_ok=True)
        os.makedirs(f"{self.storage_path}/thumbnails", exist_ok=True)
    
    async def upload_multimodal_content(
        self,
        session_id: str,
        files: List[UploadFile],
        analysis_type: AnalysisType,
        context: Optional[str] = None
    ) -> List[MultimodalContent]:
        """Upload and process multimodal content files"""
        try:
            processed_content = []
            
            for file in files:
                # Validate file type and size
                await self._validate_file(file)
                
                # Generate unique content ID
                content_id = str(uuid.uuid4())
                
                # Save file to storage
                file_path, thumbnail_path = await self._save_file(
                    file, content_id, session_id
                )
                
                # Get file dimensions if it's an image
                dimensions = await self._get_image_dimensions(file)
                
                # Create multimodal content record
                content = MultimodalContent(
                    content_id=content_id,
                    filename=file.filename,
                    file_type=file.content_type,
                    analysis_type=analysis_type,
                    processing_status=ProcessingStatus.PROCESSING,
                    file_size=await self._get_file_size(file),
                    dimensions=dimensions,
                    thumbnail_url=f"/api/v1/multimodal/content/{content_id}/thumbnail",
                    full_resolution_url=f"/api/v1/multimodal/content/{content_id}/full"
                )
                
                # Start analysis process (would integrate with AI services)
                await self._start_analysis(content, context)
                
                # Store content in memory store
                self.content_store[content_id] = content
                
                # Add to session content list
                if session_id not in self.session_content:
                    self.session_content[session_id] = []
                self.session_content[session_id].append(content_id)
                
                processed_content.append(content)
                
                logger.info(f"Uploaded multimodal content {content_id} for session {session_id}")
            
            return processed_content
            
        except Exception as e:
            logger.error(f"Error uploading multimodal content: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    async def get_multimodal_library(
        self,
        session_id: str,
        analysis_type: Optional[AnalysisType] = None,
        status: Optional[ProcessingStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> MultimodalLibraryResponse:
        """Get multimodal content library for a session"""
        try:
            logger.info(f"Getting multimodal library for session {session_id}")
            logger.info(f"Current session_content keys: {list(self.session_content.keys())}")
            logger.info(f"Current content_store keys: {list(self.content_store.keys())}")
            
            # Get content IDs for this session
            session_content_ids = self.session_content.get(session_id, [])
            logger.info(f"Content IDs for session {session_id}: {session_content_ids}")
            
            # Filter content based on criteria
            filtered_content = []
            for content_id in session_content_ids:
                if content_id in self.content_store:
                    content = self.content_store[content_id]
                    
                    # Apply filters
                    if analysis_type and content.analysis_type != analysis_type:
                        continue
                    if status and content.processing_status != status:
                        continue
                    
                    filtered_content.append(content)
            
            # Apply pagination
            total_count = len(filtered_content)
            paginated_content = filtered_content[offset:offset + limit]
            
            logger.info(f"Returning {len(paginated_content)} items out of {total_count} total")
            
            filters_applied = {}
            if analysis_type:
                filters_applied["type"] = analysis_type.value
            if status:
                filters_applied["status"] = status.value
            
            return MultimodalLibraryResponse(
                multimodal_content=paginated_content,
                total_count=total_count,
                filters_applied=filters_applied
            )
            
        except Exception as e:
            logger.error(f"Error retrieving multimodal library: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to retrieve library: {str(e)}")
    
    async def get_content_details(
        self,
        session_id: str,
        content_id: str
    ) -> MultimodalContent:
        """Get detailed information about specific multimodal content"""
        try:
            # Check if content exists in our store
            if content_id not in self.content_store:
                raise HTTPException(status_code=404, detail="Content not found")
            
            content = self.content_store[content_id]
            
            # Verify content belongs to this session
            session_content_ids = self.session_content.get(session_id, [])
            if content_id not in session_content_ids:
                raise HTTPException(status_code=404, detail="Content not found in this session")
            
            return content
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error retrieving content details: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to retrieve content: {str(e)}")
    
    async def analyze_visual_content(
        self,
        session_id: str,
        request: MultimodalAnalysisRequest
    ) -> MultimodalAnalysisResponse:
        """Analyze visual content with AI agents"""
        try:
            # This would integrate with actual AI vision models
            # For now, return mock analysis results
            
            analysis_id = str(uuid.uuid4())
            
            visual_analysis = VisualAnalysis(
                key_findings=["Analysis finding 1", "Analysis finding 2"],
                technical_assessment="Detailed technical assessment",
                clinical_significance="Clinical significance analysis",
                confidence_score=0.87,
                regions_of_interest=[]
            )
            
            return MultimodalAnalysisResponse(
                analysis_id=analysis_id,
                visual_analysis=visual_analysis,
                extracted_requirements=["New requirement 1", "New requirement 2"]
            )
            
        except Exception as e:
            logger.error(f"Error analyzing visual content: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    async def add_annotation(
        self,
        session_id: str,
        content_id: str,
        user_id: str,
        request: AnnotationRequest
    ) -> Annotation:
        """Add annotation to visual content"""
        try:
            # Check if content exists
            if content_id not in self.content_store:
                raise HTTPException(status_code=404, detail="Content not found")
            
            annotation = Annotation(
                annotation_id=str(uuid.uuid4()),
                user_id=user_id,
                coordinates=request.coordinates,
                annotation_type=request.annotation_type,
                note=request.note,
                tags=request.tags
            )
            
            # Add annotation to the content object
            content = self.content_store[content_id]
            content.annotations.append(annotation)
            
            logger.info(f"Added annotation {annotation.annotation_id} to content {content_id}")
            
            return annotation
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error adding annotation: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to add annotation: {str(e)}")
    
    async def update_analysis(
        self,
        session_id: str,
        content_id: str,
        request: MultimodalUpdateRequest
    ) -> MultimodalContent:
        """Update visual content analysis"""
        try:
            # This would update the analysis in the database
            # For now, return updated mock content
            
            updated_content = await self.get_content_details(session_id, content_id)
            logger.info(f"Updated analysis for content {content_id}")
            
            return updated_content
            
        except Exception as e:
            logger.error(f"Error updating analysis: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to update analysis: {str(e)}")
    
    async def delete_content(
        self,
        session_id: str,
        content_id: str
    ) -> Dict[str, str]:
        """Delete multimodal content"""
        try:
            # This would delete from database and storage
            # For now, return success message
            
            logger.info(f"Deleted content {content_id} from session {session_id}")
            
            return {"message": f"Content {content_id} deleted successfully"}
            
        except Exception as e:
            logger.error(f"Error deleting content: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to delete content: {str(e)}")
    
    async def export_analysis_report(
        self,
        session_id: str,
        content_id: str,
        format_type: str = "pdf",
        include_annotations: bool = True
    ) -> bytes:
        """Export visual analysis report"""
        try:
            # This would generate actual report in real implementation
            # For now, return mock PDF data
            
            logger.info(f"Exported analysis report for content {content_id}")
            
            return b"Mock PDF content"
            
        except Exception as e:
            logger.error(f"Error exporting report: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to export report: {str(e)}")
    
    # Private helper methods
    
    async def _validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file"""
        # Check file size
        if file.size and file.size > self.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {self.max_file_size // (1024*1024)}MB"
            )
        
        # Check file type
        if file.content_type not in (self.allowed_image_types | self.allowed_medical_types):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.content_type}. Supported types: {', '.join(self.allowed_image_types | self.allowed_medical_types)}"
            )
        
        # Check filename
        if not file.filename or len(file.filename.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Filename is required"
            )
        
        # Check for potentially dangerous file extensions
        dangerous_extensions = {'.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.jar'}
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension in dangerous_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Potentially dangerous file type: {file_extension}"
            )
    
    async def _save_file(
        self,
        file: UploadFile,
        content_id: str,
        session_id: str
    ) -> tuple[str, str]:
        """Save file to storage and create thumbnail"""
        # Create session directory
        session_dir = f"{self.storage_path}/{session_id}"
        os.makedirs(session_dir, exist_ok=True)
        
        # Save original file
        file_extension = os.path.splitext(file.filename)[1]
        file_path = f"{session_dir}/{content_id}{file_extension}"
        
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Create thumbnail if it's an image
        thumbnail_path = None
        if file.content_type in self.allowed_image_types:
            thumbnail_path = await self._create_thumbnail(
                content, content_id, session_id, file_extension
            )
        
        # Reset file position for further processing
        await file.seek(0)
        
        return file_path, thumbnail_path
    
    async def _create_thumbnail(
        self,
        content: bytes,
        content_id: str,
        session_id: str,
        file_extension: str
    ) -> str:
        """Create thumbnail for image content"""
        try:
            image = Image.open(io.BytesIO(content))
            image.thumbnail((300, 300), Image.Resampling.LANCZOS)
            
            thumbnail_dir = f"{self.storage_path}/thumbnails/{session_id}"
            os.makedirs(thumbnail_dir, exist_ok=True)
            
            thumbnail_path = f"{thumbnail_dir}/{content_id}_thumb{file_extension}"
            image.save(thumbnail_path)
            
            return thumbnail_path
        except Exception as e:
            logger.warning(f"Failed to create thumbnail: {str(e)}")
            return None
    
    async def _get_image_dimensions(self, file: UploadFile) -> Optional[Dimensions]:
        """Get image dimensions if file is an image"""
        try:
            if file.content_type in self.allowed_image_types:
                content = await file.read()
                image = Image.open(io.BytesIO(content))
                await file.seek(0)  # Reset file position
                
                return Dimensions(width=image.width, height=image.height)
        except Exception as e:
            logger.warning(f"Failed to get image dimensions: {str(e)}")
        
        return None
    
    async def _get_file_size(self, file: UploadFile) -> int:
        """Get file size"""
        try:
            return file.size or 0
        except Exception:
            return 0
    
    async def _start_analysis(
        self,
        content: MultimodalContent,
        context: Optional[str] = None
    ) -> None:
        """Start AI analysis process for the content"""
        # This would integrate with actual AI vision services
        # For now, just update status to completed
        content.processing_status = ProcessingStatus.COMPLETED
        logger.info(f"Started analysis for content {content.content_id}")
