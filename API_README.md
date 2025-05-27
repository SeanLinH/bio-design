# Bio-Design API Documentation

A comprehensive API for biological design and analysis using AI agents, built with FastAPI.

## Features

🧬 **Biological Design**: Create optimized DNA, RNA, and protein sequences  
🔬 **Sequence Analysis**: Analyze biological sequences for properties and functions  
⚡ **Optimization**: Optimize sequences for target properties  
💬 **AI Chat Agent**: Interactive chat with bio-design AI assistant  
📁 **File Upload**: Support for FASTA and sequence file uploads  
📊 **Interactive Docs**: Auto-generated API documentation

## Quick Start

### 1. Install Dependencies
```bash
uv sync
```

### 2. Start the API Server
```bash
python start_api.py
```

### 3. Access the API
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **API Root**: http://localhost:8000/

### 4. Test the API
```bash
python test_api.py
```

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and available endpoints |
| `/health` | GET | Health check |
| `/design` | POST | Create biological designs |
| `/analyze` | POST | Analyze sequences |
| `/optimize` | POST | Optimize sequences |
| `/chat` | POST | Chat with AI agent |

### Data Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload-sequence` | POST | Upload sequence files |
| `/designs` | GET | List all designs |
| `/designs/{id}` | GET | Get specific design |
| `/analyses` | GET | List all analyses |
| `/analyses/{id}` | GET | Get specific analysis |
| `/sequences/{id}` | GET | Get sequence information |

## Usage Examples

### Create a Design
```python
import requests

design_data = {
    "sequence": "ATGCGTACGTAGCTAG",
    "design_type": "dna",
    "parameters": {
        "gc_content_target": 0.5,
        "temperature": 37
    }
}

response = requests.post("http://localhost:8000/design", json=design_data)
result = response.json()
print(f"Design ID: {result['design_id']}")
```

### Analyze a Sequence
```python
analysis_data = {
    "sequence": "MKTVRQERLKSIVRILERSKEPVSGAQLAEELSVSRQVIVQDIAYLRSLGYNIVATPRGYVLAGG",
    "analysis_type": "protein_function"
}

response = requests.post("http://localhost:8000/analyze", json=analysis_data)
result = response.json()
print(f"Analysis results: {result['results']}")
```

### Chat with AI Agent
```python
chat_data = {
    "message": "How can I optimize a protein for thermostability?",
    "context": "Working with enzyme design"
}

response = requests.post("http://localhost:8000/chat", json=chat_data)
result = response.json()
print(f"Agent response: {result['response']['message']}")
```

### Upload Sequence File
```python
with open("sequences.fasta", "rb") as f:
    files = {"file": ("sequences.fasta", f, "text/plain")}
    response = requests.post("http://localhost:8000/upload-sequence", files=files)
    
result = response.json()
print(f"Found {result['sequences_found']} sequences")
```

## Data Models

### Design Request
```json
{
    "sequence": "ATGCGTACGTAGCTAG",
    "design_type": "dna|rna|protein",
    "parameters": {
        "gc_content_target": 0.5,
        "temperature": 37
    }
}
```

### Analysis Request
```json
{
    "sequence": "MKTVRQERLKSIVRILERSKEPVSGAQLAEELSVSRQVIVQDIAYLRSLGYNIVATPRGYVLAGG",
    "analysis_type": "protein_function|secondary_structure|conservation"
}
```

### Optimization Request
```json
{
    "sequence": "ATGAAACGTCGTGCT",
    "target_properties": {
        "stability": 0.9,
        "expression": 0.8,
        "gc_content": 0.6
    }
}
```

## Project Structure

```
bio-design/
├── app.py                 # Main FastAPI application
├── start_api.py          # Server startup script
├── test_api.py           # API testing client
├── API_README.md         # API documentation (this file)
├── pyproject.toml        # Project configuration
├── README.md             # Project README
├── src/
│   ├── agent/            # AI agent modules
│   ├── tools/            # Analysis tools
│   └── images/           # Image assets
└── data/                 # Data files
```

## Technologies Used

- **FastAPI**: Modern, fast web framework
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server implementation
- **LangChain**: AI agent framework
- **LangGraph**: Graph-based AI workflows

## Development

### Adding New Endpoints
1. Define your endpoint function in `app.py`
2. Add appropriate Pydantic models for request/response
3. Update this documentation with the new endpoint details

### Extending Functionality
- Add new analysis tools in `src/tools/`
- Extend the AI agent capabilities in `src/agent/`
- Add new biological design algorithms

### Testing
Run the test suite with:
```bash
python test_api.py
```
