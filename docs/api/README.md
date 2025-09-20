# API Documentation

## Bio-Design Multi-Agent Innovation System API

This document describes the RESTful API for the Bio-Design Multi-Agent Innovation System, featuring Stanford Biodesign methodology with three-phase innovation process (Identify-Invent-Implement) enhanced by multi-agent debates and RAG-powered document analysis.

### Base URL
```
Development: http://localhost:8000
Production: https://api.yourdomain.com
```

### Authentication
Currently, the API is open for development. In production, JWT-based authentication will be required.

### Core Features
- **Three-Phase Innovation Process**: Structured IDENTIFY → INVENT → IMPLEMENT workflow
- **Multi-Agent Debates**: 7 specialized AI agents providing diverse perspectives  
- **RAG Document Integration**: Upload documents to enhance agent knowledge
- **Real-time Updates**: WebSocket support for live progress tracking

## Endpoints

### Health Check
```http
GET /health
```
Returns the health status of the API.

### Innovation Workflow (Three-Phase Process)

#### Create Innovation Session
```http
POST /api/v1/innovation/sessions
Content-Type: application/json

{
  "title": "AI-powered Diabetes Detection Device",
  "description": "Developing a non-invasive AI diagnostic device for early diabetes detection in primary care",
  "user_id": "user_123"
}
```

Response:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "AI-powered Diabetes Detection Device",
  "description": "Developing a non-invasive AI diagnostic device...",
  "current_phase": "identify",
  "status": "active",
  "created_at": "2025-09-12T10:00:00Z",
  "phase_results": {
    "identify": {"status": "not_started"},
    "invent": {"status": "not_started"},
    "implement": {"status": "not_started"}
  }
}
```

#### Get Innovation Session
```http
GET /api/v1/innovation/sessions/{session_id}
```

#### List Innovation Sessions
```http
GET /api/v1/innovation/sessions?user_id=user_123&limit=50
```

### Document Upload & RAG Integration

#### Upload Documents for Phase Analysis
```http
POST /api/v1/innovation/sessions/{session_id}/{phase}/upload-documents
Content-Type: multipart/form-data

Form Data:
- files: [document1.pdf, document2.docx, research_paper.pdf]
```

**Supported File Types:**
- PDF (.pdf)
- Word Documents (.docx)
- Text Files (.txt, .md)
- Images (.jpg, .png, .tiff) - for visual analysis
- Medical Images (.dicom) - for medical imaging analysis
- Images (.jpg, .png, .tiff) - for visual analysis
- Medical Images (.dicom) - for medical imaging analysis

#### Upload Multimodal Content
```http
POST /api/v1/innovation/sessions/{session_id}/multimodal/upload
Content-Type: multipart/form-data

Form Data:
- files: [medical_scan.dicom, design_sketch.jpg, patent_diagram.png]
- analysis_type: "medical_imaging" | "design_analysis" | "patent_research"
- context: "Description of the visual content context"
```

**Supported Analysis Types:**
- **medical_imaging**: X-ray, MRI, CT scan analysis
- **design_analysis**: Technical drawings, CAD files, sketches
- **patent_research**: Patent diagrams and technical illustrations
- **concept_mapping**: Hand-drawn concept maps and flowcharts

Response:
```json
{
  "message": "Uploaded 3 documents",
  "documents": [
    {
      "document_id": "doc_123",
      "filename": "research_paper.pdf",
      "file_type": "application/pdf",
      "chunk_count": 24,
      "upload_time": "2025-09-12T10:05:00Z"
    }
  ],
  "multimodal_content": [
    {
      "content_id": "img_456",
      "filename": "medical_scan.jpg",
      "analysis_type": "medical_imaging",
      "extracted_concepts": ["diabetes indicators", "retinal changes"],
      "confidence_score": 0.89,
      "processing_status": "completed"
    }
  ],
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Analyze Visual Content
```http
POST /api/v1/innovation/sessions/{session_id}/multimodal/analyze
Content-Type: application/json

{
  "content_ids": ["img_456", "img_789"],
  "analysis_request": "Compare these medical images for diabetes-related indicators",
  "include_agent_perspectives": true
}
```

Response:
```json
{
  "analysis_id": "analysis_001",
  "visual_analysis": {
    "key_findings": ["Retinal microaneurysms detected", "Early diabetic retinopathy signs"],
    "technical_assessment": "High-resolution imaging shows early-stage pathology",
    "clinical_significance": "Supports need for early detection systems",
    "agent_interpretations": {
      "medical_expert": "Clinical signs consistent with diabetes progression",
      "tech_engineer": "Image quality sufficient for AI-based detection algorithms"
    }
  },
  "extracted_requirements": [
    "High-resolution imaging capability",
    "Real-time image processing",
    "Clinical-grade accuracy"
  ]
}
```

#### Get Multimodal Content Library
```http
GET /api/v1/innovation/sessions/{session_id}/multimodal/content?type=medical_imaging&status=completed
```

Response:
```json
{
  "multimodal_content": [
    {
      "content_id": "img_456",
      "filename": "retinal_scan.jpg",
      "file_type": "image/jpeg",
      "analysis_type": "medical_imaging",
      "processing_status": "completed",
      "upload_time": "2025-09-12T10:05:00Z",
      "file_size": 2048576,
      "dimensions": {"width": 1920, "height": 1080},
      "extracted_concepts": ["retinal pathology", "diabetes indicators"],
      "confidence_score": 0.89,
      "thumbnail_url": "/api/v1/multimodal/img_456/thumbnail"
    }
  ],
  "total_count": 15,
  "filters_applied": {
    "type": "medical_imaging",
    "status": "completed"
  }
}
```

#### Get Multimodal Content Details
```http
GET /api/v1/innovation/sessions/{session_id}/multimodal/content/{content_id}
```

Response:
```json
{
  "content_id": "img_456",
  "filename": "retinal_scan.jpg",
  "file_type": "image/jpeg",
  "analysis_type": "medical_imaging",
  "processing_status": "completed",
  "upload_time": "2025-09-12T10:05:00Z",
  "full_analysis": {
    "visual_analysis": {
      "key_findings": ["Retinal microaneurysms detected", "Early diabetic retinopathy signs"],
      "technical_assessment": "High-resolution imaging shows early-stage pathology",
      "clinical_significance": "Supports need for early detection systems",
      "confidence_score": 0.89,
      "regions_of_interest": [
        {
          "region_id": "roi_001",
          "coordinates": {"x": 450, "y": 320, "width": 120, "height": 80},
          "finding": "Microaneurysm cluster",
          "confidence": 0.92
        }
      ]
    },
    "agent_interpretations": {
      "medical_expert": "Clinical signs consistent with diabetes progression",
      "tech_engineer": "Image quality sufficient for AI-based detection algorithms",
      "business_analyst": "Market opportunity for early detection devices"
    },
    "extracted_requirements": [
      "High-resolution imaging capability",
      "Real-time image processing",
      "Clinical-grade accuracy"
    ]
  },
  "annotations": [
    {
      "annotation_id": "ann_001",
      "user_id": "user_123",
      "coordinates": {"x": 450, "y": 320, "width": 120, "height": 80},
      "note": "Potential diabetes indicator",
      "created_at": "2025-09-12T10:15:00Z"
    }
  ],
  "related_documents": ["doc_123", "doc_124"]
}
```

#### Add Visual Content Annotations
```http
POST /api/v1/innovation/sessions/{session_id}/multimodal/content/{content_id}/annotations
Content-Type: application/json

{
  "coordinates": {"x": 450, "y": 320, "width": 120, "height": 80},
  "annotation_type": "user_highlight" | "ai_finding" | "region_of_interest",
  "note": "Potential diabetes indicator requiring further analysis",
  "tags": ["diabetes", "retinal_pathology", "critical"]
}
```

#### Update Visual Content Analysis
```http
PUT /api/v1/innovation/sessions/{session_id}/multimodal/content/{content_id}/analysis
Content-Type: application/json

{
  "analysis_request": "Focus analysis on retinal blood vessel patterns for diabetes indicators",
  "include_regions": ["roi_001", "roi_002"],
  "analysis_depth": "detailed" | "standard" | "quick",
  "agent_focus": ["medical_expert", "tech_engineer"]
}
```

#### Delete Multimodal Content
```http
DELETE /api/v1/innovation/sessions/{session_id}/multimodal/content/{content_id}
```

#### Export Visual Analysis Report
```http
GET /api/v1/innovation/sessions/{session_id}/multimodal/content/{content_id}/export?format=pdf&include_annotations=true
```

Response: PDF file download with comprehensive visual analysis report.

#### Query Document Knowledge
```http
POST /api/v1/innovation/sessions/{session_id}/documents/query
Content-Type: application/json

{
  "query": "What are the current challenges in diabetes detection?",
  "phase": "identify",
  "top_k": 5
}
```

Response:
```json
{
  "query": "What are the current challenges in diabetes detection?",
  "results": [
    {
      "content": "Current diabetes detection methods face several challenges...",
      "source": "research_paper.pdf",
      "relevance_score": 0.89,
      "chunk_id": "chunk_15"
    }
  ],
  "total_results": 5
}
```

### Phase 1: IDENTIFY (Problem Definition & Need Discovery)

#### Start IDENTIFY Phase
```http
POST /api/v1/innovation/sessions/{session_id}/identify/start
Content-Type: application/json

{
  "context_data": {
    "target_population": "Primary care patients",
    "clinical_setting": "Family medicine clinics",
    "focus_areas": ["early detection", "non-invasive", "cost-effective"]
  },
  "uploaded_documents": ["doc_123", "doc_124"]
}
```

Response:
```json
{
  "message": "IDENTIFY phase started",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "phase": "identify",
  "status": "processing",
  "estimated_duration": "15-20 minutes"
}
```

#### Get IDENTIFY Phase Progress
```http
GET /api/v1/innovation/sessions/{session_id}/identify/progress
```

Response:
```json
{
  "phase": "identify",
  "status": "in_progress",
  "progress_percentage": 60,
  "current_step": "Agent debate on need prioritization",
  "estimated_completion": "2025-09-12T10:20:00Z",
  "steps_completed": [
    "Document analysis",
    "Need identification",
    "Stakeholder mapping"
  ],
  "steps_remaining": [
    "Need prioritization",
    "Feasibility assessment"
  ]
}
```

#### Get IDENTIFY Phase Results
```http
GET /api/v1/innovation/sessions/{session_id}/identify/results
```

Response:
```json
[
  {
    "need_id": "need_001",
    "title": "Non-invasive glucose monitoring",
    "description": "Need for accurate glucose measurement without finger pricks",
    "priority": "critical",
    "evidence": ["Patient surveys show 78% prefer non-invasive methods"],
    "stakeholders": ["patients", "healthcare_providers"],
    "market_size": "estimated_10_billion_annually",
    "technical_feasibility": 0.75,
    "agent_consensus": 0.89,
    "supporting_documents": ["doc_123"]
  }
]
```

### Phase 2: INVENT (Solution Ideation & Development)

#### Start INVENT Phase  
```http
POST /api/v1/innovation/sessions/{session_id}/invent/start
Content-Type: application/json

{
  "context_data": {
    "selected_needs": ["need_001", "need_002"],
    "technology_preferences": ["AI/ML", "optical sensors"],
    "constraints": ["FDA regulatory path", "cost under $500"]
  },
  "uploaded_documents": ["tech_spec_doc.pdf", "patent_research.pdf"]
}
```

#### Get INVENT Phase Progress
```http
GET /api/v1/innovation/sessions/{session_id}/invent/progress
```

#### Get INVENT Phase Results
```http
GET /api/v1/innovation/sessions/{session_id}/invent/results
```

Response:
```json
[
  {
    "solution_id": "sol_001",
    "title": "AI-Powered Optical Glucose Sensor",
    "description": "Non-invasive device using NIR spectroscopy and ML algorithms",
    "solution_type": "product",
    "technical_approach": "Near-infrared spectroscopy with neural networks",
    "key_features": ["Real-time monitoring", "Smartphone integration", "Clinical accuracy"],
    "development_timeline": "18-24 months",
    "estimated_cost": "$450",
    "regulatory_pathway": "FDA 510(k)",
    "risk_assessment": {
      "technical_risk": "medium",
      "regulatory_risk": "low", 
      "market_risk": "low"
    },
    "agent_scores": {
      "technical_feasibility": 0.82,
      "market_potential": 0.91,
      "regulatory_compliance": 0.88
    }
  }
]
```

### Phase 3: IMPLEMENT (Business Strategy & Go-to-Market)

#### Start IMPLEMENT Phase
```http
POST /api/v1/innovation/sessions/{session_id}/implement/start
Content-Type: application/json

{
  "context_data": {
    "selected_solutions": ["sol_001"],
    "business_model_preferences": ["subscription", "product"],
    "target_markets": ["US", "EU", "Asia-Pacific"]
  },
  "uploaded_documents": ["market_analysis.pdf", "competitor_research.docx"]
}
```

#### Get IMPLEMENT Phase Results
```http
GET /api/v1/innovation/sessions/{session_id}/implement/results
```

Response:
```json
[
  {
    "implementation_id": "impl_001",
    "business_model": "hybrid",
    "revenue_streams": [
      {
        "type": "product_sales",
        "description": "Device sales to healthcare providers",
        "projected_revenue": "$50M_year_3"
      },
      {
        "type": "subscription",
        "description": "Monthly data analytics service",
        "projected_revenue": "$20M_year_3"
      }
    ],
    "go_to_market_strategy": {
      "phase_1": "Pilot with 10 family medicine clinics",
      "phase_2": "Regional expansion via partnerships",
      "phase_3": "National rollout through distributors"
    },
    "competitive_analysis": {
      "key_competitors": ["Abbott FreeStyle", "Dexcom CGM"],
      "competitive_advantage": "Non-invasive technology with AI accuracy"
    },
    "financial_projections": {
      "year_1": {"revenue": "$2M", "costs": "$8M"},
      "year_3": {"revenue": "$70M", "costs": "$45M"},
      "break_even": "month_18"
    },
    "risk_mitigation": [
      "Regulatory approval backup plans",
      "Multiple technology pathways"
    ]
  }
]
```

### Phase Transitions

#### Transition Between Phases
```http
POST /api/v1/innovation/sessions/{session_id}/transition/{target_phase}?force=false
```

Parameters:
- `target_phase`: "identify" | "invent" | "implement"  
- `force`: Skip validation checks (default: false)

### Multi-Agent Debate Integration

### Multi-Agent Debate Integration

#### Start Agent Debate within Innovation Phase
```http
POST /api/v1/innovation/sessions/{session_id}/debate/start
Content-Type: application/json

{
  "phase": "identify",
  "topic": "Prioritization of identified diabetes detection needs",
  "context": {
    "needs_to_debate": ["need_001", "need_002", "need_003"],
    "decision_criteria": ["market_size", "technical_feasibility", "regulatory_complexity"]
  },
  "agents": [
    "medical_expert",
    "tech_engineer", 
    "business_analyst",
    "regulatory_agent",
    "ethicist",
    "patient_advocate",
    "devils_advocate"
  ],
  "config": {
    "max_rounds": 6,
    "consensus_threshold": 0.8,
    "timeout_seconds": 1200,
    "enable_document_context": true
  }
}
```

Response:
```json
{
  "debate_id": "debate_550e8400",
  "session_id": "550e8400-e29b-41d4-a716-446655440000", 
  "phase": "identify",
  "status": "starting",
  "message": "Agent debate started for IDENTIFY phase",
  "created_at": "2025-09-12T10:15:00Z"
}
```

#### Get Agent Debate Results
```http
GET /api/v1/innovation/sessions/{session_id}/debate/{debate_id}/results
```

Response:
```json
{
  "debate_id": "debate_550e8400",
  "phase": "identify",
  "topic": "Prioritization of identified diabetes detection needs",
  "status": "completed",
  "consensus_reached": true,
  "consensus_score": 0.85,
  "rounds_completed": 4,
  "duration_minutes": 12,
  "final_recommendations": [
    {
      "recommendation": "Prioritize non-invasive glucose monitoring as primary need",
      "supporting_agents": ["medical_expert", "patient_advocate", "business_analyst"],
      "confidence_score": 0.92,
      "rationale": "Highest patient impact and market potential with clear regulatory pathway"
    }
  ],
  "agent_positions": {
    "medical_expert": {
      "final_position": "strongly_support",
      "key_arguments": ["Clinical evidence shows patient preference", "Reduces compliance barriers"]
    },
    "devils_advocate": {
      "final_position": "conditional_support", 
      "key_arguments": ["Technology readiness questions remain", "Cost-effectiveness needs validation"]
    }
  },
  "debate_transcript_url": "/api/v1/debates/debate_550e8400/transcript"
}
```

### Standalone Debate System

#### Start a New Debate (Independent)
```http
POST /api/v1/debate/start
Content-Type: application/json

{
  "topic": "Development of AI-powered diagnostic device for early diabetes detection",
  "description": "Exploring the feasibility of creating a non-invasive, AI-driven device for early diabetes screening in primary care settings.",
  "agents": [
    "medical_expert",
    "tech_engineer", 
    "business_analyst",
    "regulatory_agent",
    "ethicist",
    "patient_advocate",
    "devils_advocate"
  ],
  "config": {
    "max_rounds": 8,
    "consensus_threshold": 0.8,
    "timeout_seconds": 1800,
    "enable_devils_advocate": true,
    "allow_position_changes": true,
    "real_time_updates": true
  }
}
```

Response:
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "starting",
  "message": "Debate session started successfully",
  "created_at": "2025-09-12T10:00:00Z"
}
```

#### Get Debate Status
```http
GET /api/v1/debate/{session_id}/status
```

#### Get Debate Arguments
```http
GET /api/v1/debate/{session_id}/arguments?round_number=3&agent_id=medical_expert
```

#### Get Consensus Level
```http
GET /api/v1/debate/{session_id}/consensus
```

#### Stop Debate
```http
POST /api/v1/debate/{session_id}/stop
```

#### Export Debate Results
```http
GET /api/v1/debate/{session_id}/export?format=json
```

### Agent Management

#### List Available Agents
```http
GET /api/v1/agents/
```

#### Get Agent Details
```http
GET /api/v1/agents/{agent_id}
```

#### Get Agent Status in Debate
```http
GET /api/v1/agents/{agent_id}/status?session_id={session_id}
```

### Evaluation

#### Get Evaluation Results
```http
GET /api/v1/evaluation/{session_id}
```

#### Get Consensus Metrics
```http
GET /api/v1/evaluation/{session_id}/consensus
```

#### Get Risk Analysis
```http
GET /api/v1/evaluation/{session_id}/risks
```

### WebSocket - Real-time Updates

#### Innovation Session Progress Updates
```javascript
const socket = new WebSocket('ws://localhost:8000/api/v1/ws/innovation/{session_id}');

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Innovation update:', data);
    // Example data:
    // {
    //   "type": "phase_progress",
    //   "phase": "identify", 
    //   "progress": 45,
    //   "current_step": "Agent debate in progress",
    //   "timestamp": "2025-09-12T10:15:30Z"
    // }
};
```

#### Real-time Debate Updates
```javascript
const socket = new WebSocket('ws://localhost:8000/api/v1/ws/debate/{session_id}');

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Debate update:', data);
    // Example data:
    // {
    //   "type": "new_argument",
    //   "agent_id": "medical_expert",
    //   "round": 3,
    //   "position": "for",
    //   "content": "Clinical evidence strongly supports...",
    //   "confidence": 0.87
    // }
};
```

### Concept Map & Visualization System

#### Generate Intelligent Concept Maps
```http
POST /api/v1/innovation/sessions/{session_id}/concept-maps/generate
Content-Type: application/json

{
  "map_type": "need_landscape" | "solution_architecture" | "stakeholder_analysis" | "business_model_canvas" | "regulatory_pathway" | "risk_assessment_tree",
  "phase": "identify" | "invent" | "implement",
  "data_sources": {
    "include_debates": true,
    "include_documents": true,
    "include_multimodal": true,
    "specific_content_ids": ["doc_123", "img_456"]
  },
  "options": {
    "complexity_level": "simple" | "medium" | "complex",
    "layout_style": "hierarchical" | "network" | "circular",
    "include_agent_perspectives": true,
    "auto_optimize_layout": true
  }
}
```

Response:
```json
{
  "task_id": "conceptmap_001",
  "status": "processing",
  "estimated_completion": "2-5 minutes",
  "progress_webhook": "/api/v1/ws/concept-maps/conceptmap_001/progress"
}
```

#### Get Generated Concept Map
```http
GET /api/v1/innovation/sessions/{session_id}/concept-maps/{map_id}
```

Response:
```json
{
  "map_id": "conceptmap_001",
  "map_type": "need_landscape",
  "phase": "identify",
  "status": "completed",
  "creation_timestamp": "2025-09-12T10:30:00Z",
  "formats": {
    "mermaid_code": "graph TD\n  A[Primary Care Needs] --> B[Diabetes Detection]\n  B --> C[Non-invasive Methods]",
    "svg_url": "/api/v1/concept-maps/conceptmap_001/download?format=svg",
    "png_url": "/api/v1/concept-maps/conceptmap_001/download?format=png",
    "pdf_url": "/api/v1/concept-maps/conceptmap_001/download?format=pdf",
    "interactive_url": "/api/v1/concept-maps/conceptmap_001/interactive",
    "d3_json": {
      "nodes": [
        {"id": "need_001", "label": "Non-invasive glucose monitoring", "type": "need", "priority": "critical"},
        {"id": "stakeholder_001", "label": "Primary care physicians", "type": "stakeholder"}
      ],
      "edges": [
        {"source": "need_001", "target": "stakeholder_001", "relationship": "affects"}
      ]
    }
  },
  "metadata": {
    "elements_count": 15,
    "complexity_score": 0.7,
    "agent_contributions": {
      "medical_expert": ["clinical_validation", "safety_requirements"],
      "business_analyst": ["market_opportunity", "revenue_model"]
    },
    "data_sources_used": ["debate_session_001", "doc_123", "img_456"],
    "auto_improvements_applied": ["layout_optimization", "label_clarity"]
  },
  "editing_capabilities": {
    "collaborative_editing_url": "/api/v1/concept-maps/conceptmap_001/edit",
    "version_history_url": "/api/v1/concept-maps/conceptmap_001/versions",
    "comment_system_enabled": true
  }
}
```

#### Start Collaborative Editing Session
```http
POST /api/v1/concept-maps/{map_id}/edit/start
Content-Type: application/json

{
  "user_id": "user_123",
  "edit_permissions": "full" | "comment_only" | "view_only"
}
```

#### Real-time Collaborative Editing (WebSocket)
```javascript
const socket = new WebSocket('ws://localhost:8000/api/v1/ws/concept-maps/{map_id}/collaborate');

// Send editing commands
socket.send(JSON.stringify({
  "action": "add_node",
  "data": {
    "id": "new_node_001",
    "label": "AI-powered analysis",
    "position": {"x": 200, "y": 150},
    "type": "technology"
  },
  "user_id": "user_123"
}));

// Receive real-time updates
socket.onmessage = function(event) {
  const update = JSON.parse(event.data);
  console.log('Collaboration update:', update);
  // Example:
  // {
  //   "type": "node_added",
  //   "user": "user_456", 
  //   "changes": {...},
  //   "timestamp": "2025-09-12T10:35:00Z"
  // }
};
```

#### Get Concept Map Optimization Suggestions
```http
GET /api/v1/concept-maps/{map_id}/suggestions
```

Response:
```json
{
  "map_id": "conceptmap_001",
  "suggestions": [
    {
      "type": "simplify",
      "priority": "high",
      "description": "Consider grouping related nodes to reduce visual complexity",
      "affected_elements": ["node_005", "node_006", "node_007"],
      "auto_apply_available": true
    },
    {
      "type": "add_relationship",
      "priority": "medium", 
      "description": "Missing connection between regulatory requirements and technical feasibility",
      "suggested_connection": {
        "source": "regulatory_node_001",
        "target": "tech_feasibility_001",
        "relationship_type": "constrains"
      }
    },
    {
      "type": "layout_improvement",
      "priority": "low",
      "description": "Reorganize layout for better visual hierarchy",
      "preview_url": "/api/v1/concept-maps/conceptmap_001/preview-suggestion/layout_001"
    }
  ],
  "overall_score": {
    "clarity": 0.78,
    "completeness": 0.85,
    "visual_appeal": 0.72
  }
}
```

#### Apply Optimization Suggestions
```http
POST /api/v1/concept-maps/{map_id}/apply-suggestions
Content-Type: application/json

{
  "suggestion_ids": ["suggestion_001", "suggestion_003"],
  "create_backup": true
}
```

#### Export Concept Map in Multiple Formats
```http
GET /api/v1/concept-maps/{map_id}/export?format=presentation&include_notes=true
```

**Available Export Formats:**
- `svg` - Scalable vector graphics
- `png` - High-resolution raster image
- `pdf` - Print-ready document
- `presentation` - PowerPoint-ready slides
- `interactive_html` - Standalone interactive viewer
- `mermaid` - Raw Mermaid code
- `json` - Structured data format
- `cytoscape` - Cytoscape.js format

### Analytics & Reporting

#### Session Analytics
```http
GET /api/v1/innovation/sessions/{session_id}/analytics
```

Response:
```json
{
  "session_summary": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "AI-powered Diabetes Detection Device",
    "total_duration": "PT2H30M",
    "completion_rate": 85,
    "phase_breakdown": {
      "identify": {
        "status": "completed",
        "duration": "PT45M",
        "needs_identified": 12,
        "priority_needs": 3
      },
      "invent": {
        "status": "completed", 
        "duration": "PT60M",
        "solutions_generated": 8,
        "selected_solutions": 2
      },
      "implement": {
        "status": "in_progress",
        "duration": "PT25M",
        "business_models_analyzed": 4
      }
    }
  },
  "agent_performance": {
    "medical_expert": {
      "participation_rate": 92,
      "argument_quality_score": 4.6,
      "evidence_citations": 15
    },
    "tech_engineer": {
      "participation_rate": 88,
      "argument_quality_score": 4.4,
      "evidence_citations": 12
    },
    "business_analyst": {
      "participation_rate": 90,
      "argument_quality_score": 4.5,
      "evidence_citations": 18
    }
  },
  "decision_quality_metrics": {
    "consensus_level": 0.78,
    "evidence_strength": 0.82,
    "stakeholder_alignment": 0.74
  },
  "resource_utilization": {
    "documents_analyzed": 23,
    "web_searches_performed": 45,
    "multimodal_content_processed": 8
  }
}
```

#### Export Session Report
```http
GET /api/v1/innovation/sessions/{session_id}/export?format=pdf&include_debates=true
```

Response: PDF file download with comprehensive session report.

### Business Strategy Analysis

#### Generate Business Strategy Analysis
```http
POST /api/v1/innovation/sessions/{session_id}/business-strategy/analyze
Content-Type: application/json

{
  "analysis_type": "comprehensive" | "porter_five_forces" | "business_model_canvas" | "pricing_strategy" | "go_to_market",
  "market_context": {
    "target_market": "Diabetes monitoring devices",
    "market_size": "$15.2B",
    "growth_rate": "8.5%",
    "key_competitors": ["Dexcom", "Abbott", "Medtronic"]
  },
  "solution_context": {
    "solution_id": "sol_001",
    "technology_readiness": 6,
    "regulatory_pathway": "FDA 510(k)"
  }
}
```

Response:
```json
{
  "analysis_id": "biz_analysis_001",
  "analysis_type": "comprehensive",
  "generated_at": "2025-09-13T10:15:00Z",
  "business_strategy": {
    "executive_summary": "AI-powered diabetes monitoring device presents significant market opportunity...",
    "porter_five_forces": {
      "competitive_rivalry": {
        "intensity": "high",
        "score": 4.2,
        "factors": ["Established players with strong R&D", "Price competition"]
      },
      "supplier_power": {
        "intensity": "medium",
        "score": 3.1,
        "factors": ["Specialized sensor manufacturers", "AI/ML platform dependencies"]
      },
      "buyer_power": {
        "intensity": "high", 
        "score": 4.0,
        "factors": ["Price-sensitive patients", "Insurance reimbursement requirements"]
      },
      "threat_of_substitutes": {
        "intensity": "medium",
        "score": 2.8,
        "factors": ["Traditional glucose meters", "Emerging technologies"]
      },
      "barriers_to_entry": {
        "intensity": "high",
        "score": 4.5,
        "factors": ["Regulatory requirements", "Capital requirements", "Clinical validation"]
      }
    },
    "business_models": [
      {
        "model_type": "B2B2C",
        "description": "Partner with healthcare providers and insurers",
        "revenue_streams": [
          {
            "type": "subscription",
            "description": "Monthly monitoring service",
            "projected_revenue": "$50-80/month per patient"
          },
          {
            "type": "device_sales",
            "description": "One-time device purchase",
            "projected_revenue": "$200-300 per device"
          }
        ],
        "target_customers": ["Healthcare systems", "Insurance companies"],
        "value_proposition": "Improved patient outcomes, reduced healthcare costs"
      }
    ],
    "pricing_strategy": {
      "pricing_model": "value_based",
      "device_price_range": "$250-350",
      "subscription_price_range": "$60-90/month",
      "competitive_positioning": "Premium positioning with superior accuracy and AI insights"
    },
    "go_to_market": {
      "primary_channels": ["Healthcare partnerships", "Digital health platforms"],
      "customer_acquisition_strategy": "Clinical evidence generation + KOL engagement",
      "market_entry_sequence": ["Pilot studies", "Limited launch", "Scaled commercialization"]
    },
    "risk_assessment": {
      "high_risks": ["Regulatory approval delays", "Reimbursement challenges"],
      "medium_risks": ["Technology adoption barriers", "Competitive response"],
      "mitigation_strategies": ["Early FDA engagement", "Payer evidence generation"]
    }
  },
  "financial_projections": {
    "revenue_forecast": {
      "year_1": "$2.5M",
      "year_3": "$25M", 
      "year_5": "$75M"
    },
    "market_penetration": {
      "year_1": "0.1%",
      "year_3": "1.2%",
      "year_5": "3.5%"
    }
  }
}
```

#### Get Business Strategy Analysis
```http
GET /api/v1/innovation/sessions/{session_id}/business-strategy/analysis/{analysis_id}
```

#### Update Business Strategy Parameters
```http
PUT /api/v1/innovation/sessions/{session_id}/business-strategy/analysis/{analysis_id}
Content-Type: application/json

{
  "market_assumptions": {
    "market_growth_rate": "9.2%",
    "price_elasticity": -1.2
  },
  "business_model_preferences": ["B2B2C", "SaaS"],
  "risk_tolerance": "medium"
}
```

### Advanced Reports System

#### Generate Comprehensive Innovation Report
```http
POST /api/v1/innovation/sessions/{session_id}/reports/generate
Content-Type: application/json

{
  "report_type": "innovation_summary" | "business_strategy" | "technical_analysis" | "market_research" | "financial_projection" | "regulatory_roadmap",
  "target_audience": "investors" | "technical_team" | "regulatory_authorities" | "executive_summary",
  "include_sections": [
    "executive_summary",
    "needs_analysis", 
    "solution_overview",
    "market_analysis",
    "technical_feasibility",
    "business_model",
    "financial_projections",
    "risk_assessment",
    "implementation_roadmap",
    "appendices"
  ],
  "format_preferences": {
    "include_charts": true,
    "include_concept_maps": true,
    "include_agent_debates": false,
    "detail_level": "comprehensive" | "summary" | "executive"
  }
}
```

Response:
```json
{
  "report_id": "report_001",
  "status": "generating",
  "estimated_completion": "PT5M",
  "progress_webhook": "/api/v1/ws/reports/report_001/progress"
}
```

#### Get Generated Report
```http
GET /api/v1/innovation/sessions/{session_id}/reports/{report_id}
```

Response:
```json
{
  "report_id": "report_001",
  "title": "AI-Powered Diabetes Detection Device - Innovation Analysis Report",
  "report_type": "innovation_summary",
  "status": "completed",
  "generated_at": "2025-09-13T10:30:00Z",
  "metadata": {
    "page_count": 45,
    "word_count": 12500,
    "charts_included": 8,
    "concept_maps_included": 4
  },
  "sections": [
    {
      "section_id": "exec_summary",
      "title": "Executive Summary",
      "page_range": "1-3",
      "key_insights": [
        "Market opportunity of $2.1B in addressable market",
        "Technical feasibility score: 8.2/10",
        "Regulatory pathway: FDA 510(k) with 12-18 month timeline"
      ]
    },
    {
      "section_id": "needs_analysis", 
      "title": "Clinical Needs Analysis",
      "page_range": "4-12",
      "key_insights": [
        "75% of diabetes patients struggle with current monitoring frequency",
        "Healthcare providers need better predictive analytics"
      ]
    }
  ],
  "download_urls": {
    "pdf": "/api/v1/reports/report_001/download?format=pdf",
    "docx": "/api/v1/reports/report_001/download?format=docx",
    "html": "/api/v1/reports/report_001/download?format=html"
  },
  "sharing_url": "/api/v1/reports/report_001/share?token=abc123"
}
```

#### List Generated Reports
```http
GET /api/v1/innovation/sessions/{session_id}/reports?status=completed&type=innovation_summary&limit=20
```

#### Update Report Content
```http
PUT /api/v1/innovation/sessions/{session_id}/reports/{report_id}
Content-Type: application/json

{
  "sections_to_update": ["financial_projections"],
  "updated_data": {
    "market_assumptions": {
      "growth_rate": "9.5%",
      "market_penetration": "4.2%"
    }
  },
  "regenerate_charts": true
}
```

#### Add Report Annotations
```http
POST /api/v1/innovation/sessions/{session_id}/reports/{report_id}/annotations
Content-Type: application/json

{
  "section_id": "market_analysis",
  "annotation": {
    "type": "comment" | "highlight" | "note",
    "content": "Consider updating market size based on latest industry report",
    "author": "user_123",
    "position": {"page": 8, "paragraph": 3}
  }
}
```

#### Export Report for Collaboration
```http
GET /api/v1/innovation/sessions/{session_id}/reports/{report_id}/export?format=collaborative&platform=sharepoint
```

**Supported Collaboration Platforms:**
- `sharepoint` - Microsoft SharePoint format
- `google_docs` - Google Docs compatible format  
- `notion` - Notion workspace format
- `confluence` - Atlassian Confluence format

### Dashboard & Analytics APIs

#### Get Dashboard Overview
```http
GET /api/v1/dashboard/overview?user_id=user_123&time_range=30d
```

Response:
```json
{
  "user_summary": {
    "active_sessions": 3,
    "completed_sessions": 12,
    "total_innovations": 15
  },
  "recent_activity": [
    {
      "session_id": "session_001",
      "activity_type": "phase_completed",
      "phase": "identify",
      "timestamp": "2025-09-13T09:30:00Z"
    }
  ],
  "performance_metrics": {
    "average_session_duration": "PT2H15M",
    "consensus_achievement_rate": 0.82,
    "innovation_success_rate": 0.67
  },
  "upcoming_milestones": [
    {
      "session_id": "session_002",
      "milestone": "invent_phase_completion",
      "estimated_date": "2025-09-15T14:00:00Z"
    }
  ]
}
```

#### Get Advanced Analytics
```http
GET /api/v1/analytics/innovation-performance?timeframe=6m&metrics=success_rate,efficiency,quality
```

Response:
```json
{
  "timeframe": "6m",
  "data_points": 180,
  "metrics": {
    "innovation_success_rate": {
      "current_value": 0.68,
      "trend": "increasing",
      "historical_data": [
        {"date": "2025-03-01", "value": 0.61},
        {"date": "2025-06-01", "value": 0.65},
        {"date": "2025-09-01", "value": 0.68}
      ]
    },
    "session_efficiency": {
      "average_duration": "PT2H22M",
      "trend": "improving",
      "benchmark_comparison": "+15% vs industry standard"
    },
    "decision_quality": {
      "consensus_strength": 0.78,
      "evidence_base_score": 0.84,
      "stakeholder_alignment": 0.72
    }
  },
  "insights": [
    {
      "type": "trend",
      "description": "Innovation success rate improving by 3.2% per quarter",
      "confidence": 0.89
    },
    {
      "type": "recommendation", 
      "description": "Consider extending IDENTIFY phase duration for higher success rates",
      "evidence": "Sessions with 20% longer IDENTIFY phase show 25% higher success"
    }
  ]
}
```

#### Get Team Collaboration Analytics
```http
GET /api/v1/analytics/team-collaboration/{session_id}
```

#### Get Agent Performance Analytics  
```http
GET /api/v1/analytics/agent-performance?agent_id=medical_expert&timeframe=3m
```

### Knowledge Management APIs

#### Create Knowledge Base Entry
```http
POST /api/v1/knowledge/entries
Content-Type: application/json

{
  "title": "Best Practices for Diabetes Device Validation",
  "content": "Detailed content...",
  "tags": ["diabetes", "medical_devices", "validation", "FDA"],
  "source_session": "session_001",
  "knowledge_type": "best_practice" | "lesson_learned" | "methodology" | "regulation"
}
```

#### Query Knowledge Base
```http
POST /api/v1/knowledge/search
Content-Type: application/json

{
  "query": "FDA approval process for continuous glucose monitors",
  "filters": {
    "tags": ["FDA", "medical_devices"],
    "knowledge_type": ["regulation", "best_practice"],
    "date_range": {
      "start": "2024-01-01",
      "end": "2025-09-13"
    }
  },
  "limit": 10
}
```

#### Get Intelligent Recommendations
```http
GET /api/v1/knowledge/recommendations?session_id=session_001&phase=implement
```

Response:
```json
{
  "recommendations": [
    {
      "type": "similar_project",
      "title": "Successful diabetes monitoring device launch case study",
      "relevance_score": 0.87,
      "key_learnings": ["Early payer engagement critical", "Clinical evidence requirements"]
    },
    {
      "type": "expert_contact",
      "expert": "Dr. Sarah Chen - Regulatory Affairs Specialist",
      "expertise": "FDA medical device approvals",
      "availability": "available"
    }
  ]
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created (for new sessions/documents)
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (session/resource not found)
- `409` - Conflict (phase transition not allowed)
- `422` - Validation Error (invalid data format)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

Error responses include detailed messages:
```json
{
  "detail": "Cannot start INVENT phase: IDENTIFY phase must be completed first",
  "error_code": "PHASE_TRANSITION_BLOCKED",
  "current_phase": "identify",
  "phase_status": "in_progress"
}
```

## Rate Limiting

- Development: No limits
- Production: 
  - Standard API calls: 100 requests per minute per IP
  - Document uploads: 10 uploads per minute per session
  - WebSocket connections: 5 concurrent connections per user

## Data Models

### Innovation Session
```json
{
  "session_id": "string (UUID)",
  "title": "string (required, 10-200 chars)",
  "description": "string (optional, max 1000 chars)", 
  "user_id": "string (optional)",
  "current_phase": "identify|invent|implement",
  "status": "active|paused|completed|failed|cancelled",
  "created_at": "datetime",
  "updated_at": "datetime",
  "phase_results": {
    "identify": {
      "status": "not_started|in_progress|completed|requires_revision",
      "results": [...],
      "duration_minutes": "integer",
      "documents_used": ["string"]
    }
  }
}
```

### Document Upload Response
```json
{
  "document_id": "string",
  "filename": "string", 
  "file_type": "string (MIME type)",
  "file_size_bytes": "integer",
  "chunk_count": "integer",
  "upload_time": "datetime",
  "processing_status": "processing|completed|failed"
}
```

### Need Item (IDENTIFY Phase)
```json
{
  "need_id": "string",
  "title": "string (required)",
  "description": "string (required)",
  "priority": "critical|high|medium|low", 
  "evidence": ["string"],
  "stakeholders": ["string"],
  "market_size": "string",
  "technical_feasibility": "float (0.0-1.0)",
  "agent_consensus": "float (0.0-1.0)",
  "supporting_documents": ["string"]
}
```

### Solution Concept (INVENT Phase)
```json
{
  "solution_id": "string",
  "title": "string (required)",
  "description": "string (required)",
  "solution_type": "product|service|subscription|rental|hybrid",
  "technical_approach": "string",
  "key_features": ["string"],
  "development_timeline": "string",
  "estimated_cost": "string",
  "regulatory_pathway": "string",
  "risk_assessment": {
    "technical_risk": "low|medium|high",
    "regulatory_risk": "low|medium|high",
    "market_risk": "low|medium|high"
  },
  "agent_scores": {
    "technical_feasibility": "float (0.0-1.0)",
    "market_potential": "float (0.0-1.0)",
    "regulatory_compliance": "float (0.0-1.0)"
  }
}
```

### Implementation Plan (IMPLEMENT Phase)
```json
{
  "implementation_id": "string",
  "business_model": "product|service|subscription|rental|hybrid",
  "revenue_streams": [
    {
      "type": "string",
      "description": "string",
      "projected_revenue": "string"
    }
  ],
  "go_to_market_strategy": {
    "phase_1": "string",
    "phase_2": "string", 
    "phase_3": "string"
  },
  "competitive_analysis": {
    "key_competitors": ["string"],
    "competitive_advantage": "string"
  },
  "financial_projections": {
    "year_1": {"revenue": "string", "costs": "string"},
    "year_3": {"revenue": "string", "costs": "string"},
    "break_even": "string"
  },
  "risk_mitigation": ["string"]
}
```

### Multimodal Content
```json
{
  "content_id": "string",
  "filename": "string",
  "file_type": "string (MIME type)",
  "analysis_type": "medical_imaging|design_analysis|patent_research|concept_mapping",
  "processing_status": "processing|completed|failed",
  "upload_time": "datetime",
  "file_size": "integer (bytes)",
  "dimensions": {
    "width": "integer",
    "height": "integer"
  },
  "extracted_concepts": ["string"],
  "visual_analysis": {
    "key_findings": ["string"],
    "technical_assessment": "string",
    "clinical_significance": "string",
    "confidence_score": "float (0.0-1.0)",
    "regions_of_interest": [
      {
        "region_id": "string",
        "coordinates": {
          "x": "integer",
          "y": "integer", 
          "width": "integer",
          "height": "integer"
        },
        "finding": "string",
        "confidence": "float (0.0-1.0)"
      }
    ]
  },
  "agent_interpretations": {
    "medical_expert": "string",
    "tech_engineer": "string",
    "business_analyst": "string",
    "regulatory_agent": "string",
    "ethicist": "string",
    "patient_advocate": "string"
  },
  "extracted_requirements": ["string"],
  "annotations": [
    {
      "annotation_id": "string",
      "user_id": "string",
      "coordinates": {
        "x": "integer",
        "y": "integer",
        "width": "integer", 
        "height": "integer"
      },
      "annotation_type": "user_highlight|ai_finding|region_of_interest",
      "note": "string",
      "tags": ["string"],
      "created_at": "datetime"
    }
  ],
  "related_documents": ["string"],
  "thumbnail_url": "string",
  "full_resolution_url": "string"
}
```

### Concept Map
```json
{
  "map_id": "string",
  "map_type": "need_landscape|solution_architecture|stakeholder_analysis|business_model_canvas|regulatory_pathway|risk_assessment_tree",
  "phase": "identify|invent|implement",
  "status": "processing|completed|failed",
  "creation_timestamp": "datetime",
  "formats": {
    "mermaid_code": "string",
    "svg_url": "string",
    "png_url": "string", 
    "pdf_url": "string",
    "interactive_url": "string",
    "d3_json": {
      "nodes": [
        {
          "id": "string",
          "label": "string",
          "type": "need|solution|stakeholder|technology|constraint",
          "priority": "critical|high|medium|low",
          "attributes": "object"
        }
      ],
      "edges": [
        {
          "source": "string",
          "target": "string", 
          "relationship": "affects|depends_on|enables|constrains|supports",
          "strength": "float (0.0-1.0)"
        }
      ]
    }
  },
  "metadata": {
    "elements_count": "integer",
    "complexity_score": "float (0.0-1.0)",
    "agent_contributions": "object",
    "data_sources_used": ["string"],
    "auto_improvements_applied": ["string"]
  },
  "editing_capabilities": {
    "collaborative_editing_url": "string",
    "version_history_url": "string",
    "comment_system_enabled": "boolean"
  },
  "optimization_suggestions": [
    {
      "type": "simplify|add_relationship|layout_improvement|color_coding",
      "priority": "high|medium|low",
      "description": "string",
      "auto_apply_available": "boolean"
    }
  ]
}
```

### Collaborative Edit Session
```json
{
  "session_id": "string",
  "map_id": "string",
  "participants": [
    {
      "user_id": "string",
      "display_name": "string",
      "permissions": "full|comment_only|view_only",
      "last_active": "datetime"
    }
  ],
  "version_info": {
    "current_version": "integer",
    "last_saved": "datetime",
    "auto_save_enabled": "boolean"
  },
  "change_history": [
    {
      "change_id": "string",
      "user_id": "string",
      "action": "add_node|delete_node|modify_node|add_edge|delete_edge",
      "timestamp": "datetime",
      "data": "object"
    }
  ]
}
```

### Agent Configuration
```json
{
  "agent_id": "string",
  "name": "string",
  "role": "string",
  "expertise": ["string"],
  "perspective": "string",
  "multimodal_capabilities": {
    "image_analysis": "boolean",
    "medical_imaging": "boolean", 
    "design_interpretation": "boolean",
    "patent_analysis": "boolean"
  },
  "decision_weights": {
    "technical_feasibility": "float",
    "market_potential": "float", 
    "regulatory_compliance": "float",
    "ethical_considerations": "float"
  }
}
```

**Available Agents:**
- `medical_expert`: Clinical expertise and healthcare workflow knowledge
- `tech_engineer`: Technical feasibility and engineering perspectives  
- `business_analyst`: Market analysis and business model evaluation
- `regulatory_agent`: FDA/regulatory compliance and approval pathways
- `ethicist`: Ethical implications and patient safety considerations
- `patient_advocate`: Patient experience and accessibility concerns
- `devils_advocate`: Critical thinking and risk identification

### Debate Configuration
```json
{
  "max_rounds": "integer (1-20, default: 10)",
  "consensus_threshold": "float (0.5-1.0, default: 0.8)",
  "timeout_seconds": "integer (300-7200, default: 1800)",
  "enable_devils_advocate": "boolean (default: true)",
  "allow_position_changes": "boolean (default: true)",
  "real_time_updates": "boolean (default: true)",
  "enable_document_context": "boolean (default: false)"
}
```

## Usage Examples

### Complete Three-Phase Workflow Example

```javascript
// 1. Create Innovation Session
const sessionResponse = await fetch('/api/v1/innovation/sessions', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    title: "Smart Contact Lens for Diabetes Monitoring",
    description: "Developing a continuous glucose monitoring contact lens",
    user_id: "researcher_001"
  })
});
const session = await sessionResponse.json();

// 2. Upload Research Documents
const formData = new FormData();
formData.append('files', pdfFile1);
formData.append('files', pdfFile2);

await fetch(`/api/v1/innovation/sessions/${session.session_id}/identify/upload-documents`, {
  method: 'POST',
  body: formData
});

// 3. Start IDENTIFY Phase with Document Context
await fetch(`/api/v1/innovation/sessions/${session.session_id}/identify/start`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    context_data: {
      target_population: "Type 1 & 2 diabetes patients",
      clinical_setting: "Outpatient care",
      focus_areas: ["continuous monitoring", "patient comfort", "data accuracy"]
    }
  })
});

// 4. Monitor Progress via WebSocket
const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/innovation/${session.session_id}`);
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  if (update.type === 'phase_completed' && update.phase === 'identify') {
    // Automatically proceed to INVENT phase
    proceedToInventPhase(session.session_id);
  }
};

// 5. Get IDENTIFY Results and Transition
const identifyResults = await fetch(`/api/v1/innovation/sessions/${session.session_id}/identify/results`);
const needs = await identifyResults.json();

// Select top priority needs for INVENT phase
const topNeeds = needs.filter(need => need.priority === 'critical').slice(0, 3);

await fetch(`/api/v1/innovation/sessions/${session.session_id}/invent/start`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    context_data: {
      selected_needs: topNeeds.map(need => need.need_id),
      technology_preferences: ["biocompatible materials", "wireless sensors", "mobile app"],
      constraints: ["FDA Class II pathway", "manufacturing cost under $100"]
    }
  })
});
```

### Document-Enhanced Agent Debate Example

```javascript
// Start a debate with document context for specific decision
const debateResponse = await fetch(`/api/v1/innovation/sessions/${sessionId}/debate/start`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    phase: "invent",
    topic: "Selection of optimal glucose sensing technology",
    context: {
      solutions_to_evaluate: ["electrochemical_sensor", "optical_sensor", "enzymatic_sensor"],
      decision_criteria: ["accuracy", "stability", "manufacturing_cost", "regulatory_risk"]
    },
    agents: ["medical_expert", "tech_engineer", "regulatory_agent", "business_analyst"],
    config: {
      max_rounds: 5,
      consensus_threshold: 0.85,
      enable_document_context: true // Enable RAG-enhanced arguments
    }
  })
});

// Monitor debate progress
const debateWs = new WebSocket(`ws://localhost:8000/api/v1/ws/debate/${debateResponse.debate_id}`);
debateWs.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`${update.agent_id}: ${update.content}`);
  
  if (update.type === 'consensus_reached') {
    console.log('Debate concluded with consensus:', update.final_decision);
  }
};
```

### Multimodal Content Integration Example

```javascript
// Complete workflow with visual content analysis
const sessionResponse = await fetch('/api/v1/innovation/sessions', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    title: "AI-powered Diabetic Retinopathy Detection System",
    description: "Early detection system using retinal imaging analysis",
    user_id: "user_123"
  })
});
const session = await sessionResponse.json();

// 1. Upload multimodal content for IDENTIFY phase
const imageFiles = [
  new File([retinalScanBlob], 'diabetic_retina_sample.jpg', {type: 'image/jpeg'}),
  new File([normalRetinaBlob], 'normal_retina_sample.jpg', {type: 'image/jpeg'}),
  new File([patentDiagramBlob], 'existing_device_patent.png', {type: 'image/png'})
];

const uploadResponse = await fetch(`/api/v1/innovation/sessions/${session.session_id}/multimodal/upload`, {
  method: 'POST',
  body: (() => {
    const formData = new FormData();
    imageFiles.forEach(file => formData.append('files', file));
    formData.append('analysis_type', 'medical_imaging');
    formData.append('context', 'Diabetic retinopathy detection research materials');
    return formData;
  })()
});

const uploadedContent = await uploadResponse.json();
console.log('Uploaded multimodal content:', uploadedContent.multimodal_content);

// 2. Analyze visual content with AI agents
const analysisResponse = await fetch(`/api/v1/innovation/sessions/${session.session_id}/multimodal/analyze`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    content_ids: uploadedContent.multimodal_content.map(content => content.content_id),
    analysis_request: "Compare diabetic vs normal retinal images to identify key diagnostic features for device development",
    include_agent_perspectives: true
  })
});

const analysis = await analysisResponse.json();
console.log('Medical Expert Analysis:', analysis.visual_analysis.agent_interpretations.medical_expert);
console.log('Technical Requirements:', analysis.extracted_requirements);

// 3. Add user annotations to key findings
const annotationResponse = await fetch(`/api/v1/innovation/sessions/${session.session_id}/multimodal/content/${uploadedContent.multimodal_content[0].content_id}/annotations`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    coordinates: {x: 450, y: 320, width: 120, height: 80},
    annotation_type: "region_of_interest",
    note: "Critical diagnostic region - microaneurysm cluster",
    tags: ["diabetes_indicator", "high_priority", "device_target"]
  })
});

// 4. Start IDENTIFY phase with multimodal context
await fetch(`/api/v1/innovation/sessions/${session.session_id}/identify/start`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    context_data: {
      target_population: "Diabetic patients requiring regular screening",
      focus_areas: ["early detection", "automated analysis", "point-of-care"],
      visual_context_enabled: true
    },
    uploaded_documents: uploadedContent.documents.map(doc => doc.document_id),
    multimodal_content: uploadedContent.multimodal_content.map(content => content.content_id)
  })
});

// 5. Monitor phase with multimodal integration
const progressWs = new WebSocket(`ws://localhost:8000/api/v1/ws/innovation/${session.session_id}`);
progressWs.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  if (update.type === 'multimodal_analysis_complete') {
    console.log('Visual analysis integrated into agent discussions');
    console.log('Key visual insights:', update.visual_insights);
  }
  
  if (update.type === 'agent_debate_visual_reference') {
    console.log(`${update.agent_id} referenced visual content:`, update.referenced_content);
  }
};

// 6. Export comprehensive analysis report
const reportResponse = await fetch(`/api/v1/innovation/sessions/${session.session_id}/multimodal/content/${uploadedContent.multimodal_content[0].content_id}/export?format=pdf&include_annotations=true`);
const reportBlob = await reportResponse.blob();
// Download PDF report with visual analysis and agent insights
```

## Best Practices

### Document Upload Guidelines

1. **File Preparation**
   - Use descriptive filenames that indicate content type
   - Ensure documents are text-readable (OCR processed if scanned)
   - Maximum file size: 10MB per document
   - Optimal chunk size: Documents should be 1000-10000 words

2. **Document Types by Phase**
   - **IDENTIFY**: Clinical studies, patient surveys, market research, regulatory guidelines
   - **INVENT**: Technical specifications, patent databases, engineering reports
   - **IMPLEMENT**: Business cases, market analyses, financial models, competitor research

3. **Timing**
   - Upload documents before starting each phase for maximum benefit
   - Additional documents can be uploaded during phase execution
   - Documents are automatically indexed and made available to all agents

### Concept Map Generation Guidelines

1. **Map Type Selection**
   - **need_landscape**: Use for IDENTIFY phase to visualize problem spaces
   - **solution_architecture**: Use for INVENT phase to show technical relationships
   - **stakeholder_analysis**: Use across all phases for impact assessment
   - **business_model_canvas**: Use for IMPLEMENT phase business planning
   - **regulatory_pathway**: Use for compliance and approval planning
   - **risk_assessment_tree**: Use for comprehensive risk analysis

2. **Multimodal Content Integration**
   - Upload visual content before starting phases for enhanced analysis
   - Use medical imaging for clinical validation in IDENTIFY phase
   - Include design sketches for technical feasibility in INVENT phase
   - Leverage patent diagrams for prior art analysis

3. **Collaborative Editing Best Practices**
   - Establish clear editing permissions for team members
   - Use commenting system for discussion without direct edits
   - Regularly save versions during collaborative sessions
   - Apply optimization suggestions incrementally

### Multimodal Content Management Guidelines

1. **Content Type Optimization**
   - **Medical Imaging** (`.jpg`, `.png`, `.tiff`, `.dicom`):
     - Ensure HIPAA compliance for patient data
     - Use high-resolution images (minimum 1920x1080) for accurate analysis
     - Include relevant medical context in upload descriptions
     - Tag with specific medical conditions or anatomy regions
   
   - **Design & Technical Content** (`.jpg`, `.png`, `.svg`, `.pdf`):
     - Upload CAD files, technical drawings, and design sketches
     - Include dimensional information and scale references
     - Provide context about design intent and constraints
     - Use clear, high-contrast images for better AI analysis

   - **Patent & Research Content** (`.jpg`, `.png`, `.pdf`):
     - Include patent numbers and filing dates in metadata
     - Upload both original diagrams and annotated versions
     - Provide competitive landscape context
     - Tag with relevant technology categories

2. **Analysis Type Selection**
   - **medical_imaging**: For clinical validation and diagnostic features
   - **design_analysis**: For technical feasibility and engineering requirements  
   - **patent_research**: For intellectual property landscape analysis
   - **concept_mapping**: For hand-drawn ideas and workflow diagrams

3. **Quality and Processing Guidelines**
   - **Image Quality**: Minimum 1MB file size for detailed analysis
   - **Supported Formats**: JPEG, PNG, TIFF for standard images; DICOM for medical
   - **File Naming**: Use descriptive names indicating content and source
   - **Batch Upload**: Group related images by analysis type for efficiency

4. **Annotation Best Practices**
   - **User Annotations**: Highlight critical regions before agent analysis
   - **Collaborative Tagging**: Use consistent tag vocabulary across team members
   - **Context Notes**: Provide detailed descriptions for complex visual content
   - **Region Selection**: Be precise with coordinate selection for ROI analysis

### Multi-Agent Debate Optimization

1. **Agent Selection**
   - Always include `devils_advocate` for critical analysis
   - Match agents to decision type (technical decisions → include `tech_engineer`)
   - For regulatory decisions → always include `regulatory_agent`
   - Include `medical_expert` for clinical validation of visual content

2. **Configuration Tuning**
   - Start with 5-8 rounds for most decisions
   - Set consensus_threshold to 0.8 for balanced thoroughness/efficiency
   - Enable `allow_position_changes` for complex decisions
   - Use `enable_document_context` and `enable_multimodal_context` when relevant content available

3. **Monitoring and Intervention**
   - Watch for deadlock situations (agents not reaching consensus)
   - Consider manual intervention if debates exceed expected timeframes
   - Review argument quality through confidence scores
   - Monitor multimodal content utilization in agent arguments

### Phase Transition Guidelines

1. **IDENTIFY → INVENT**
   - Ensure at least 3-5 high-priority needs identified
   - Verify agent consensus scores above 0.75
   - Review evidence quality for top needs
   - Validate multimodal content analysis completeness

2. **INVENT → IMPLEMENT**
   - Select 1-3 solution concepts for implementation analysis
   - Ensure technical feasibility scores above 0.7
   - Confirm regulatory pathway clarity
   - Complete concept map generation for chosen solutions

3. **Quality Checkpoints**
   - Review document and multimodal content utilization metrics
   - Check agent participation balance
   - Validate evidence-based decision making
   - Assess concept map clarity and completeness

### API Integration Patterns

1. **Polling vs WebSocket**
   - Use WebSocket for real-time UI updates and collaborative editing
   - Use polling for background processing status checks
   - Implement exponential backoff for polling
   - Use WebSocket for concept map collaboration features

2. **Error Handling**
   - Always check phase prerequisites before transitions
   - Implement retry logic for document and image uploads
   - Handle consensus timeout scenarios gracefully
   - Validate multimodal content formats before processing

3. **Performance Optimization**
   - Cache session data and generated concept maps for frequent access
   - Batch document uploads when possible
   - Optimize image processing for large medical files
   - Use CDN for serving generated diagrams and visualizations
   - Use pagination for large result sets

## Security Considerations

### Authentication (Production)
- JWT-based authentication required for all endpoints
- API key authentication for service-to-service calls
- Role-based access control for session management

### Data Privacy
- Document encryption at rest and in transit
- Session data isolation per user
- Configurable data retention policies
- GDPR/HIPAA compliance ready

### Rate Limiting Strategy
- Separate limits for different operation types
- User-based quotas for document storage
- Graceful degradation under high load

---

## Support and Documentation

- **API Swagger Documentation**: `/docs` (development only)
- **ReDoc Documentation**: `/redoc` (development only)
- **GitHub Repository**: https://github.com/SeanLinH/bio-design
- **Issue Tracking**: Use GitHub Issues for bug reports and feature requests

For additional support or questions about integrating with the Bio-Design Innovation API, please refer to the documentation or contact the development team.
