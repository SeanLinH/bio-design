# 🏥 Biodesign Methodology with LLM Agent

> A Stanford University methodology for systematic medical device innovation, enhanced with multi-agent LLM implementation for intelligent medical needs analysis

## 🎯 Project Goal

This project implements the Stanford Biodesign Methodology using a sophisticated multi-agent LLM system to systematize and enhance the medical device innovation process. The system features specialized AI agents (Medical Expert, Systems Engineer, and Needs Collector) that collaborate to identify and analyze healthcare needs through structured discussions.

## 📚 What is Biodesign?

Biodesign is a systematic approach to medical device innovation developed by Stanford University. The methodology consists of three core phases:

### 1. Identify 🔍
This phase focuses on discovering significant unmet healthcare needs through:
- Clinical environment immersion
- Observation of complete care cycles (diagnosis → treatment → recovery → billing)
- Problem and opportunity identification
- Need gathering and prioritization based on potential impact

### 2. Invent 💡
During this phase, teams:
- Brainstorm diverse solution concepts
- Create and test rapid prototypes
- Implement "think-build-rethink" iteration cycles
- Evaluate concepts for:
  - Technical feasibility
  - Intellectual property potential
  - Business model viability
  - Regulatory pathway considerations

### 3. Implement 🚀
The final phase involves:
- Technology refinement
- Development of regulatory approval strategies
- Reimbursement planning
- Market potential assessment
- Funding source exploration
- Collaboration with industry mentors

## 🤖 Multi-Agent System

This implementation enhances the Biodesign methodology with three specialized AI agents:

- **🩺 Medical Expert Agent**: Analyzes healthcare needs from clinical and medical perspectives
- **⚙️ Systems Engineer Agent**: Provides technical solutions and system optimization insights  
- **📋 Needs Collector Agent**: Synthesizes discussions and extracts actionable medical device requirements

## 🛠️ Project Structure

```
bio-design/
├── src/
│   ├── agents/           # Multi-agent LLM implementation
│   │   ├── need_finder.py          # Core reflection system
│   │   ├── need_finder_realtime.py # Real-time analysis system
│   │   ├── evaluator.py            # Needs evaluation system
│   │   └── ...
│   └── docs/            # API and setup documentation
├── static/
│   └── index.html       # Web UI interface
├── experiments/         # Jupyter notebooks and experiments
├── tests/              # Test files
├── run.py          # FastAPI server
├── pyproject.toml      # UV project configuration
└── README.md           # This file
```

## 🚀 Quick Setup with UV

### Prerequisites
- Python 3.10 or higher
- [UV package manager](https://docs.astral.sh/uv/) (recommended) or pip
- OpenAI API key

### 1. Install UV (if not already installed)
```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/SeanLinH/bio-design.git
cd bio-design

# copy .env.example to .env and setup API_KEY
cp .env.example .env

# Create virtual environment and install dependencies
uv sync

# Activate the virtual environment
source .venv/bin/activate  # Linux/macOS
# or
.venv\Scripts\activate     # Windows
```

### 3. Configure OpenAI API
```bash
# Create environment file
cp .env.example .env

# Edit .env file and add your OpenAI API key
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

### 4. Start the Service
```bash
# Start the FastAPI server
uv run python run.py

# Or alternatively
python run.py
```

The service will be available at `http://localhost:8000`

## 🖥️ Web User Interface

### Accessing the UI
Open your browser and navigate to `http://localhost:8000` to access the interactive web interface.

### UI Features

#### Main Interface
- **Query Input**: Large text area for entering medical scenarios or questions
- **Discussion Rounds**: Configurable number of agent discussion rounds (2-5)
- **Analysis Modes**: 
  - Standard Analysis: Traditional batch processing
  - ⚡ Real-time Analysis: Live agent discussions with status updates

#### Real-time Analysis Panel
When using real-time analysis, you'll see:
- **Live Agent Status**: Real-time updates showing which agent is currently thinking
- **Discussion Progress**: Round-by-round conversation between Medical Expert and Systems Engineer
- **Agent Messages**: Color-coded messages from different agents:
  - 🔴 Medical Expert (Red border)
  - 🟢 Systems Engineer (Green border) 
  - 🟠 Needs Collector (Orange border)
  - 🟣 System Messages (Purple border)

#### Results Tabs
- **📋 Analysis Results**: Structured needs analysis with medical insights
- **⭐ Evaluation**: Automated scoring and prioritization of identified needs
- **📊 Prioritization**: Ranking and implementation recommendations
- **🔧 Raw Data**: Complete conversation logs and technical details

### Sample Query
Try this example query to see the system in action:
```
An older patient with multiple chronic diseases faces problems with poor medication adherence, lack of real-time monitoring, and personalized support during home care and outpatient follow-ups.
```

## 📡 API Endpoints

### Core Endpoints
- `GET /` - Web UI interface
- `POST /api/reflection` - Submit standard analysis request
- `POST /api/reflection-realtime` - Submit real-time analysis request
- `GET /api/reflection/{session_id}` - Get analysis results
- `GET /api/evaluation/{session_id}` - Get needs evaluation
- `GET /api/prioritization/{session_id}` - Get prioritization results

### Real-time Streaming
- `GET /api/reflection-stream/{session_id}` - Server-Sent Events for real-time updates

### Monitoring
- `GET /health` - Service health check
- `GET /api/sessions` - List active analysis sessions

## 🔧 Usage Examples

### Web Interface Usage
1. **Open** `http://localhost:8000` in your browser
2. **Enter** a medical scenario in the query text area
3. **Select** the number of discussion rounds (3 recommended)
4. **Choose** analysis mode:
   - "Start Analysis" for standard processing
   - "⚡ Start Real-time Analysis" for live updates
5. **Monitor** progress in real-time (if selected)
6. **Review** results in the tabbed interface

### API Usage
```python
import requests

# Submit analysis request
response = requests.post("http://localhost:8000/api/reflection", json={
    "query": "Your medical scenario here...",
    "max_rounds": 3
})

session_id = response.json()["session_id"]

# Get results
results = requests.get(f"http://localhost:8000/api/reflection/{session_id}")
print(results.json())
```

### Real-time Analysis
```python
import requests
import sseclient  # pip install sseclient-py

# Start real-time analysis
response = requests.post("http://localhost:8000/api/reflection-realtime", json={
    "query": "Your medical scenario here...",
    "max_rounds": 3
})

session_id = response.json()["session_id"]

# Stream real-time updates
stream = sseclient.SSEClient(f"http://localhost:8000/api/reflection-stream/{session_id}")
for event in stream:
    if event.data:
        print(f"Update: {event.data}")
```

## 🧪 Development and Testing

### Run Tests
```bash
# Run all tests
uv run pytest tests/

# Run specific test
uv run python tests/test_api.py
```

### Development Mode
```bash
# Start with auto-reload for development
uv run uvicorn run:app --host 0.0.0.0 --port 8000 --reload
```

### Jupyter Notebooks
Explore the `experiments/` directory for interactive notebooks demonstrating various features:
- `multi_agent.ipynb` - Multi-agent system exploration
- `agent_supervisor.ipynb` - Agent coordination patterns
- `reflection.ipynb` - Reflection methodology implementation

## 🔒 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_BASE_URL`: Custom OpenAI compatible endpoint (optional)
- `LOG_LEVEL`: Logging level (default: INFO)

### Model Configuration
The system uses `gpt-4.1-mini` by default. You can modify the model in the agent configuration files.

## 📊 System Output

The system generates structured analysis including:
- **Medical Needs**: Identified healthcare requirements
- **Technical Solutions**: Engineering and system recommendations  
- **Implementation Strategies**: Prioritized action plans
- **Evaluation Metrics**: Scoring and ranking of needs
- **Full Conversation Logs**: Complete agent discussions

## 🐛 Troubleshooting

### Common Issues

#### OpenAI API Key Issues
```bash
# Verify your API key is set
echo $OPENAI_API_KEY

# Test OpenAI connection
uv run python test_openai.py
```

#### Port Already in Use
```bash
# Use a different port
uv run python run.py --port 8001
```

#### Dependencies Issues
```bash
# Reinstall dependencies
uv sync --reinstall
```

## 📄 License

[License information to be added]

## 🤝 Contributing

[Contribution guidelines to be added]

## 📬 Contact

[Contact information to be added] 
