"""
Multimodal content API endpoints for visual content upload and analysis
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, Form
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from typing import Optional, List, Dict, Any
import io
import os
from uuid import uuid4

from app.models.multimodal import (
    MultimodalContent, AnalysisType, ProcessingStatus,
    MultimodalAnalysisRequest, AnnotationRequest, MultimodalUpdateRequest,
    MultimodalLibraryResponse, MultimodalAnalysisResponse, Annotation,
    DocumentUploadResponse
)
from app.services.multimodal_service import MultimodalService
from app.dependencies import get_multimodal_service
from app.utils.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


# ================== Multimodal Content Upload ==================

@router.post("/sessions/{session_id}/multimodal/upload", response_model=DocumentUploadResponse)
async def upload_multimodal_content(
    session_id: str,
    files: List[UploadFile] = File(...),
    analysis_type: AnalysisType = Form(...),
    context: Optional[str] = Form(None),
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Upload multimodal content for visual analysis"""
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        multimodal_content = await multimodal_service.upload_multimodal_content(
            session_id=session_id,
            files=files,
            analysis_type=analysis_type,
            context=context
        )
        
        return DocumentUploadResponse(
            message=f"Uploaded {len(multimodal_content)} multimodal files",
            documents=[],  # No regular documents in this endpoint
            multimodal_content=multimodal_content,
            session_id=session_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading multimodal content for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload content: {str(e)}")


@router.post("/sessions/{session_id}/multimodal/analyze", response_model=MultimodalAnalysisResponse)
async def analyze_visual_content(
    session_id: str,
    request: MultimodalAnalysisRequest,
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Analyze visual content with AI agents"""
    try:
        analysis_result = await multimodal_service.analyze_visual_content(
            session_id=session_id,
            request=request
        )
        
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing visual content for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ================== Multimodal Content Management ==================

@router.get("/sessions/{session_id}/multimodal/content", response_model=MultimodalLibraryResponse)
async def get_multimodal_content_library(
    session_id: str,
    type: Optional[AnalysisType] = Query(None, description="Filter by analysis type"),
    status: Optional[ProcessingStatus] = Query(None, description="Filter by processing status"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Get multimodal content library for a session"""
    try:
        library = await multimodal_service.get_multimodal_library(
            session_id=session_id,
            analysis_type=type,
            status=status,
            limit=limit,
            offset=offset
        )
        
        return library
        
    except Exception as e:
        logger.error(f"Error retrieving multimodal library for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve library: {str(e)}")


@router.get("/sessions/{session_id}/multimodal/content/{content_id}", response_model=MultimodalContent)
async def get_multimodal_content_details(
    session_id: str,
    content_id: str,
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Get detailed information about specific multimodal content"""
    try:
        content_details = await multimodal_service.get_content_details(
            session_id=session_id,
            content_id=content_id
        )
        
        return content_details
        
    except Exception as e:
        logger.error(f"Error retrieving content details {content_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve content: {str(e)}")


# ================== Content Annotations ==================

@router.post("/sessions/{session_id}/multimodal/content/{content_id}/annotations", response_model=Annotation)
async def add_visual_content_annotation(
    session_id: str,
    content_id: str,
    request: AnnotationRequest,
    user_id: str = Query(..., description="User ID creating the annotation"),
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Add annotation to visual content"""
    try:
        annotation = await multimodal_service.add_annotation(
            session_id=session_id,
            content_id=content_id,
            user_id=user_id,
            request=request
        )
        
        return annotation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding annotation to content {content_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add annotation: {str(e)}")


# ================== Content Analysis Updates ==================

@router.put("/sessions/{session_id}/multimodal/content/{content_id}/analysis", response_model=MultimodalContent)
async def update_visual_content_analysis(
    session_id: str,
    content_id: str,
    request: MultimodalUpdateRequest,
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Update visual content analysis"""
    try:
        updated_content = await multimodal_service.update_analysis(
            session_id=session_id,
            content_id=content_id,
            request=request
        )
        
        return updated_content
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating analysis for content {content_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update analysis: {str(e)}")


# ================== Content Management Operations ==================

@router.delete("/sessions/{session_id}/multimodal/content/{content_id}")
async def delete_multimodal_content(
    session_id: str,
    content_id: str,
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Delete multimodal content"""
    try:
        result = await multimodal_service.delete_content(
            session_id=session_id,
            content_id=content_id
        )
        
        return JSONResponse(result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting content {content_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete content: {str(e)}")


@router.get("/sessions/{session_id}/multimodal/content/{content_id}/export")
async def export_visual_analysis_report(
    session_id: str,
    content_id: str,
    format: str = Query("pdf", description="Export format (pdf, json, html)"),
    include_annotations: bool = Query(True, description="Include annotations in export"),
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Export visual analysis report in multiple formats"""
    try:
        report_data = await multimodal_service.export_analysis_report(
            session_id=session_id,
            content_id=content_id,
            format_type=format,
            include_annotations=include_annotations
        )
        
        # Determine content type based on format
        content_type_map = {
            "pdf": "application/pdf",
            "json": "application/json",
            "html": "text/html"
        }
        
        content_type = content_type_map.get(format, "application/octet-stream")
        
        return StreamingResponse(
            io.BytesIO(report_data),
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename=visual_analysis_{content_id}.{format}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting report for content {content_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export report: {str(e)}")


# ================== Content Serving ==================

@router.get("/sessions/{session_id}/multimodal/content/{content_id}/thumbnail")
async def get_content_thumbnail(
    session_id: str,
    content_id: str,
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Get thumbnail for multimodal content"""
    try:
        # Get content details to find thumbnail path
        content_details = await multimodal_service.get_content_details(session_id, content_id)
        
        # Construct thumbnail file path
        thumbnail_path = f"{multimodal_service.storage_path}/thumbnails/{session_id}/{content_id}_thumb.jpg"
        
        # Check if thumbnail exists
        if os.path.exists(thumbnail_path):
            return FileResponse(
                thumbnail_path,
                media_type="image/jpeg",
                headers={"Cache-Control": "max-age=3600"}
            )
        else:
            # Return placeholder or error
            raise HTTPException(status_code=404, detail="Thumbnail not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving thumbnail for content {content_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to serve thumbnail: {str(e)}")


@router.get("/sessions/{session_id}/multimodal/content/{content_id}/full")
async def get_content_full_resolution(
    session_id: str,
    content_id: str,
    multimodal_service: MultimodalService = Depends(get_multimodal_service)
):
    """Get full resolution multimodal content"""
    try:
        # Get content details to find original file path
        content_details = await multimodal_service.get_content_details(session_id, content_id)
        
        # Construct original file path - need to determine file extension
        file_extension = os.path.splitext(content_details.filename)[1]
        full_path = f"{multimodal_service.storage_path}/{session_id}/{content_id}{file_extension}"
        
        # Check if file exists
        if os.path.exists(full_path):
            return FileResponse(
                full_path,
                media_type=content_details.file_type,
                filename=content_details.filename,
                headers={"Cache-Control": "max-age=3600"}
            )
        else:
            raise HTTPException(status_code=404, detail="Full resolution file not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving full resolution for content {content_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to serve full resolution: {str(e)}")
