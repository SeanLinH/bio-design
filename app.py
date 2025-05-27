from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime
import json
import os

# Import your existing modules
from src.agent import *
from src.tools import *

app = FastAPI(
    title="Bio-Design API",
    description="API for biological design and analysis using AI agents",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class DesignRequest(BaseModel):
    sequence: str = Field(..., description="DNA/RNA/Protein sequence")
    design_type: str = Field(..., description="Type of design (protein, dna, rna)")
    parameters: Optional[Dict[str, Any]] = Field(default={}, description="Design parameters")
    
class AnalysisRequest(BaseModel):
    sequence: str = Field(..., description="Sequence to analyze")
    analysis_type: str = Field(..., description="Type of analysis")
    
class SequenceOptimizeRequest(BaseModel):
    sequence: str = Field(..., description="Sequence to optimize")
    target_properties: Dict[str, Any] = Field(..., description="Target properties for optimization")
    
class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    context: Optional[str] = Field(default="", description="Additional context")
    
class DesignResponse(BaseModel):
    design_id: str
    sequence: str
    properties: Dict[str, Any]
    confidence_score: float
    timestamp: datetime
    
class AnalysisResponse(BaseModel):
    analysis_id: str
    results: Dict[str, Any]
    timestamp: datetime

# Global storage (in production, use a proper database)
designs_db = {}
analyses_db = {}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Bio-Design API",
        "version": "1.0.0",
        "description": "API for biological design and analysis using AI agents",
        "endpoints": {
            "health": "/health",
            "design": "/design",
            "analyze": "/analyze",
            "optimize": "/optimize",
            "chat": "/chat",
            "sequences": "/sequences",
            "designs": "/designs",
            "analyses": "/analyses"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0"
    }

@app.post("/design", response_model=DesignResponse)
async def create_design(request: DesignRequest):
    """Create a new biological design"""
    try:
        # Generate unique design ID
        design_id = f"design_{len(designs_db) + 1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Simulate design process (replace with actual agent logic)
        design_result = {
            "original_sequence": request.sequence,
            "designed_sequence": request.sequence.upper(),  # Placeholder
            "design_type": request.design_type,
            "parameters": request.parameters,
            "properties": {
                "length": len(request.sequence),
                "gc_content": calculate_gc_content(request.sequence) if request.design_type == "dna" else None,
                "molecular_weight": estimate_molecular_weight(request.sequence, request.design_type),
                "stability_score": 0.85,  # Placeholder
                "functionality_score": 0.92  # Placeholder
            }
        }
        
        # Store design
        designs_db[design_id] = design_result
        
        response = DesignResponse(
            design_id=design_id,
            sequence=design_result["designed_sequence"],
            properties=design_result["properties"],
            confidence_score=0.88,
            timestamp=datetime.now()
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Design creation failed: {str(e)}")

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_sequence(request: AnalysisRequest):
    """Analyze a biological sequence"""
    try:
        # Generate unique analysis ID
        analysis_id = f"analysis_{len(analyses_db) + 1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Perform analysis (replace with actual analysis logic)
        analysis_results = {
            "sequence": request.sequence,
            "analysis_type": request.analysis_type,
            "basic_properties": {
                "length": len(request.sequence),
                "composition": get_sequence_composition(request.sequence),
            },
            "predictions": {
                "secondary_structure": "alpha-helix dominant",  # Placeholder
                "function": "enzyme activity predicted",  # Placeholder
                "localization": "cytoplasm",  # Placeholder
            },
            "scores": {
                "conservation": 0.75,
                "stability": 0.82,
                "expression": 0.68
            }
        }
        
        # Store analysis
        analyses_db[analysis_id] = analysis_results
        
        response = AnalysisResponse(
            analysis_id=analysis_id,
            results=analysis_results,
            timestamp=datetime.now()
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/optimize")
async def optimize_sequence(request: SequenceOptimizeRequest):
    """Optimize a sequence for target properties"""
    try:
        # Simulate optimization process
        optimized_sequence = request.sequence.upper()  # Placeholder optimization
        
        optimization_result = {
            "original_sequence": request.sequence,
            "optimized_sequence": optimized_sequence,
            "target_properties": request.target_properties,
            "achieved_properties": {
                "stability": 0.95,
                "expression": 0.87,
                "activity": 0.91
            },
            "optimization_steps": [
                "Codon optimization",
                "Secondary structure prediction",
                "Activity enhancement"
            ]
        }
        
        return {
            "optimization_id": f"opt_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "result": optimization_result,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """Chat with the bio-design AI agent"""
    try:
        # Simulate agent response (replace with actual agent logic)
        agent_response = {
            "message": f"I understand you're asking about: {request.message}",
            "suggestions": [
                "Consider using protein design tools",
                "Check sequence optimization parameters",
                "Review biological constraints"
            ],
            "context_used": bool(request.context),
            "confidence": 0.85
        }
        
        return {
            "response": agent_response,
            "timestamp": datetime.now(),
            "conversation_id": f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.post("/upload-sequence")
async def upload_sequence_file(file: UploadFile = File(...)):
    """Upload a sequence file for processing"""
    try:
        if not file.filename.endswith(('.fasta', '.fa', '.seq', '.txt')):
            raise HTTPException(status_code=400, detail="Invalid file format. Use FASTA, SEQ, or TXT files.")
        
        content = await file.read()
        sequence_data = content.decode('utf-8')
        
        # Parse sequences (basic FASTA parsing)
        sequences = parse_fasta_content(sequence_data)
        
        return {
            "filename": file.filename,
            "sequences_found": len(sequences),
            "sequences": sequences[:5],  # Return first 5 sequences
            "upload_id": f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.get("/sequences/{sequence_id}")
async def get_sequence_info(sequence_id: str):
    """Get information about a specific sequence"""
    # This would typically query a database
    return {
        "sequence_id": sequence_id,
        "info": "Sequence information would be retrieved from database",
        "timestamp": datetime.now()
    }

@app.get("/designs")
async def list_designs():
    """List all designs"""
    return {
        "designs": list(designs_db.keys()),
        "total": len(designs_db),
        "timestamp": datetime.now()
    }

@app.get("/designs/{design_id}")
async def get_design(design_id: str):
    """Get a specific design"""
    if design_id not in designs_db:
        raise HTTPException(status_code=404, detail="Design not found")
    
    return {
        "design_id": design_id,
        "design": designs_db[design_id],
        "timestamp": datetime.now()
    }

@app.get("/analyses")
async def list_analyses():
    """List all analyses"""
    return {
        "analyses": list(analyses_db.keys()),
        "total": len(analyses_db),
        "timestamp": datetime.now()
    }

@app.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get a specific analysis"""
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {
        "analysis_id": analysis_id,
        "analysis": analyses_db[analysis_id],
        "timestamp": datetime.now()
    }

# Helper functions
def calculate_gc_content(sequence: str) -> float:
    """Calculate GC content of DNA sequence"""
    sequence = sequence.upper()
    gc_count = sequence.count('G') + sequence.count('C')
    return gc_count / len(sequence) if len(sequence) > 0 else 0.0

def estimate_molecular_weight(sequence: str, seq_type: str) -> float:
    """Estimate molecular weight based on sequence type"""
    # Simplified molecular weight estimation
    if seq_type == "protein":
        return len(sequence) * 110  # Average amino acid weight
    elif seq_type == "dna":
        return len(sequence) * 650  # Average nucleotide weight for dsDNA
    elif seq_type == "rna":
        return len(sequence) * 340  # Average nucleotide weight for ssRNA
    return 0.0

def get_sequence_composition(sequence: str) -> Dict[str, int]:
    """Get composition of sequence"""
    composition = {}
    for char in set(sequence.upper()):
        composition[char] = sequence.upper().count(char)
    return composition

def parse_fasta_content(content: str) -> List[Dict[str, str]]:
    """Parse FASTA file content"""
    sequences = []
    current_header = ""
    current_sequence = ""
    
    for line in content.split('\n'):
        line = line.strip()
        if line.startswith('>'):
            if current_header and current_sequence:
                sequences.append({
                    "header": current_header,
                    "sequence": current_sequence
                })
            current_header = line[1:]
            current_sequence = ""
        else:
            current_sequence += line
    
    # Add the last sequence
    if current_header and current_sequence:
        sequences.append({
            "header": current_header,
            "sequence": current_sequence
        })
    
    return sequences

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )