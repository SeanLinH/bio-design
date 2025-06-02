# Medical Reflection System API

A FastAPI-based web service for medical needs analysis and evaluation using the MedicalReflectionSystem.

## Features

This API provides a complete workflow for medical needs analysis:

1. **Reflection Analysis** - Multi-agent discussion between medical experts and engineers
2. **Needs Evaluation** - Scoring needs on feasibility, impact, innovation, and resource efficiency  
3. **Prioritization** - Ranking needs by overall score with recommendations

## API Endpoints

### 1. Submit Reflection Query
```http
POST /api/reflection
Content-Type: application/json

{
  "query": "An older patient with multiple chronic diseases faces problems with poor medication adherence",
  "max_rounds": 3
}
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "status": "queued", 
  "message": "Reflection analysis has been queued for processing"
}
```

### 2. Get Reflection Results
```http
GET /api/reflection/{session_id}
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "status": "completed",
  "original_query": "...",
  "discussion_rounds": 3,
  "medical_insights": ["..."],
  "engineering_insights": ["..."],
  "parsed_needs": {
    "needs": [
      {
        "need": "Smart Medication Management System",
        "summary": "...",
        "medical_insights": "...",
        "tech_insights": "...",
        "strategy": "..."
      }
    ]
  },
  "final_summary": "...",
  "full_conversation": ["..."],
  "created_at": "2024-01-01T12:00:00",
  "completed_at": "2024-01-01T12:05:00"
}
```

### 3. Get Evaluation Results
```http
GET /api/evaluation/{session_id}
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "status": "completed",
  "evaluations": [
    {
      "need_title": "Smart Medication Management System",
      "feasibility_score": 8.0,
      "impact_score": 8.0,
      "innovation_score": 7.0,
      "resource_score": 7.0,
      "overall_score": 7.5,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendations": ["..."]
    }
  ],
  "summary": "Overall evaluation summary...",
  "top_priority_needs": ["Smart Medication Management System"],
  "created_at": "2024-01-01T12:05:00"
}
```

### 4. Get Prioritization Results
```http
GET /api/prioritization/{session_id}
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "status": "completed",
  "prioritized_needs": [
    {
      "rank": 1,
      "need_title": "Smart Medication Management System",
      "overall_score": 7.5,
      "feasibility_score": 8.0,
      "impact_score": 8.0,
      "innovation_score": 7.0,
      "resource_score": 7.0,
      "priority_level": "High"
    }
  ],
  "ranking_criteria": {
    "primary": "Overall Score (weighted combination of all factors)",
    "feasibility": "Technical implementation possibility (0-10)",
    "impact": "Potential impact on medical system (0-10)",
    "innovation": "Innovation level and differentiation (0-10)",
    "resource": "Resource efficiency (10 = low resource requirement)"
  },
  "recommendations": ["..."],
  "created_at": "2024-01-01T12:05:00"
}
```

### 5. Health Check
```http
GET /health
```

### 6. List Sessions (Debug)
```http
GET /api/sessions
```

## Quick Start

### 1. Install Dependencies
```bash
# The project uses UV for dependency management
# FastAPI and other dependencies are already in pyproject.toml
```

### 2. Start the API Server
```bash
python run_api.py
```

The server will start on `http://localhost:8000`

### 3. Use the Web Interface
Open your browser and go to `http://localhost:8000` to use the interactive web interface.

### 4. Or Test with the CLI
```bash
python test_api.py
```

### 5. Or Use cURL
```bash
# Submit a query
curl -X POST "http://localhost:8000/api/reflection" \
     -H "Content-Type: application/json" \
     -d '{"query": "Medical resource congestion problems", "max_rounds": 3}'

# Get results (replace SESSION_ID with actual ID)
curl "http://localhost:8000/api/reflection/SESSION_ID"
curl "http://localhost:8000/api/evaluation/SESSION_ID"  
curl "http://localhost:8000/api/prioritization/SESSION_ID"
```

## Workflow

1. **Submit Query** → POST to `/api/reflection` with your medical question
2. **Wait for Processing** → The system runs multi-agent discussions in the background
3. **Get Results** → Retrieve reflection results from `/api/reflection/{session_id}`
4. **Get Evaluation** → Retrieve scoring and analysis from `/api/evaluation/{session_id}`
5. **Get Prioritization** → Retrieve ranked priorities from `/api/prioritization/{session_id}`

## Architecture

- **FastAPI** - Modern Python web framework with automatic API documentation
- **Background Tasks** - Async processing for long-running reflection analysis
- **Session Management** - Track multiple concurrent analysis sessions
- **Multi-Agent System** - Medical experts and engineers collaborate on solutions
- **Evaluation Engine** - Score needs on multiple dimensions
- **Prioritization Logic** - Rank needs by overall score and provide recommendations

## Example Medical Queries

- "Why do medical resources get congested? What are some solutions?"
- "An older patient with multiple chronic diseases faces problems with poor medication adherence, lack of real-time monitoring, and personalized support during home care and outpatient follow-ups"
- "Emergency department overcrowding and long wait times for patients"
- "Remote healthcare access for rural communities"
- "Integration challenges between different hospital information systems"

## Configuration

The API uses the existing configuration from your MedicalReflectionSystem:
- LLM model settings
- Maximum discussion rounds (1-10)
- Evaluation criteria and scoring
- Session timeout and cleanup

## Development

### API Documentation
When the server is running, visit:
- Interactive docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Adding Features
- Extend the `MedicalReflectionSystem` class for new analysis capabilities
- Add new evaluation criteria in the `NeedEvaluator` 
- Implement custom prioritization algorithms
- Add authentication and user management
- Integrate with databases for persistent storage

### Production Deployment
- Use a proper database instead of in-memory session storage
- Add authentication and authorization
- Implement rate limiting and request validation
- Set up proper logging and monitoring
- Use a production ASGI server like Gunicorn with Uvicorn workers

## Status Codes

- `200` - Success
- `202` - Accepted (processing in background)
- `404` - Session not found
- `500` - Internal server error during analysis

Processing typically takes 30-120 seconds depending on the complexity of the query and number of discussion rounds.
