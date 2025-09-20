# Product Requirements Document (PRD)
# Advanced Multi-Agent Debate System for Biodesign Innovation

## 1. Executive Summary

### Product Vision
基於史丹佛大學Biodesign方法論和設計思維雙鑽石流程，開發一個先進的多智能體辯論系統，通過三階段結構化創新流程（識別-發明-實施），系統化分析和開發醫療設備創新解決方案。系統採用多元化專業角色的深度辯論與協作，確保從需求識別到商業化實施的全程決策支援。

### Core Innovation Framework - Double Diamond Process
基於設計思維雙鑽石模型，系統提供三個關鍵階段：

#### 🔍 **Identify Phase (第一個鑽石### 3.5 User Experience Requirements

#### 3.5.1 Phase Navigation Interface問題探索與收斂)**
- **發散探索**：多角度識別未滿足的醫療需求
- **辯論評估**：專業代理深度辯論各需求的重要性和可行性
- **優先排序**：基於多維度評估選擇最有價值的需求進行開發

#### 💡 **Invent Phase (第二個鑽石 - 解決方案探索與收斂)**
- **解決方案發散**：針對選定需求生成多種創新解決方案
- **專家辯論**：多領域專家深度討論技術路徑和產品策略
- **方案收斂**：形成具體可執行的產品解決方案

#### 🚀 **Implement Phase (商業化實施)**
- **商業模式設計**：Porter五力分析評估競爭環境
- **市場策略制定**：多元化銷售模式探索（服務、產品、訂閱、租賃等）
- **實施路徑規劃**：具體的商業化執行計劃

### Key Features
- **雙鑽石結構化流程**：遵循設計思維方法論，確保創新過程的系統性和有效性
- **多智能體辯論生態**：7個專業化AI代理涵蓋醫療、技術、商業、監管、倫理等多維度視角
- **RAG知識增強**：支援用戶上傳文檔，提供基於文檔的智能問答和分析
- **多模態內容理解**：整合視覺AI模型，支援醫學影像、設計圖、手繪概念圖的智能分析
- **實時網路搜索**：整合Perplexity API，獲取最新行業資訊和市場數據
- **智能視覺化系統**：多層次概念圖生成，包含互動式編輯、協作功能和多格式輸出
- **階段性成果追蹤**：完整記錄從需求識別到商業化的全過程決策軌跡
- **證據驗證機制**：基於可信來源的事實檢查和論據強度評估

---

## 2. C4 Model Architecture

### 2.1 Context Diagram (Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Healthcare Innovation Ecosystem             │
│                                                                │
│  ┌─────────────┐          ┌─────────────────────────┐          │
│  │   醫療從業者  │          │    Biodesign Multi-Agent │          │
│  │             │◄────────►│        LLM System       │          │
│  │ • 醫生       │          │                         │          │
│  │ • 護理師     │          │  Stanford Biodesign     │          │
│  │ • 醫療管理者  │          │  Methodology Enhanced   │          │
│  └─────────────┘          │  with AI Agents         │          │
│                          └─────────────────────────┘          │
│                                      ▲                        │
│                                      │                        │
│  ┌─────────────┐                     │                        │
│  │   醫療設備   │                     │                        │
│  │   開發團隊   │◄────────────────────┘                        │
│  │             │                                              │
│  │ • R&D Engineers                                            │
│  │ • Product Managers                                         │
│  │ • Regulatory Affairs                                       │
│  └─────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

**External Entities:**
- **醫療從業者**: 提供臨床需求和問題描述
- **醫療設備開發團隊**: 接收分析結果並開發解決方案
- **OpenAI API**: 提供LLM服務支援

### 2.2 Container Diagram (Level 2)

```
┌─────────────────────────────────────────────────────────────────┐
│           Biodesign Innovation Platform - Triple Phase System    │
│                                                                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   React Web     │    │   FastAPI       │    │ AI Debate   │  │
│  │   Frontend      │    │   Server        │    │ Container   │  │
│  │                 │◄──►│                 │◄──►│             │  │
│  │ • Phase UI      │    │ • RESTful API   │    │ • Medical   │  │
│  │ • Mermaid       │    │ • WebSocket     │    │   Expert    │  │
│  │   Diagrams      │    │ • Session Mgmt  │    │ • Tech      │  │
│  │ • Progress      │    │ • File Upload   │    │   Engineer  │  │
│  │   Tracking      │    │ • CORS Support  │    │ • Business  │  │
│  └─────────────────┘    └─────────────────┘    │   Analyst   │  │
│                                   ▲           │ • Regulator │  │
│                                   │           │ • Ethicist  │  │
│                                   ▼           │ • Patient   │  │
│  ┌─────────────────┐    ┌─────────────────┐   │   Advocate  │  │
│  │  PostgreSQL     │    │  Knowledge &    │   │ • Devil's   │  │
│  │  Database       │    │  Search Layer   │   │   Advocate  │  │
│  │                 │    │                 │   └─────────────┘  │
│  │ • User Sessions │    │ • RAG System    │           ▲       │
│  │ • Phase Results │    │ • Vector Store  │           │       │
│  │ • Debate Logs   │    │ • Perplexity    │           │       │
│  │ • Documents     │    │   API           │           │       │
│  │ • Analytics     │    │ • Document      │           │       │
│  └─────────────────┘    │   Processing    │           │       │
│                         └─────────────────┘           │       │
│                                   ▲                   │       │
│                                   │                   │       │
│                         ┌─────────────────┐           │       │
│                         │  External APIs  │◄──────────┘       │
│                         │                 │                   │
│                         │ • OpenAI GPT-4  │                   │
│                         │ • LangChain     │                   │
│                         │ • LangGraph     │                   │
│                         │ • Anthropic     │                   │
│                         │   Claude        │                   │
│                         │ • Perplexity    │                   │
│                         │ • OpenAI Vision │                   │
│                         │ • Claude Vision │                   │
│                         │ • Multimodal    │                   │
│                         │   Processing    │                   │
│                         └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

**Containers:**
- **React Web Frontend**: 三階段用戶界面，支援多模態內容上傳和智能視覺化系統
- **FastAPI Server**: API服務層，處理文件上傳、多模態處理、會話管理和WebSocket通信
- **AI Debate Container**: 多智能體辯論系統，支援基於視覺內容的三階段專業化討論
- **PostgreSQL Database**: 用戶會話、階段成果、辯論記錄、文檔和多媒體內容的結構化存儲
- **Knowledge & Search Layer**: RAG系統、多模態內容分析和Perplexity搜索整合，提供知識增強
- **External APIs**: 多LLM提供商、視覺AI模型和外部搜索服務整合，包含多模態處理能力

### 2.3 Component Diagram (Level 3) - Triple Phase Innovation System

```
┌─────────────────────────────────────────────────────────────────┐
│                Triple Phase Innovation Container                 │
│                                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                   IDENTIFY PHASE                            │ │
│ │                                                             │ │
│ │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│ │  │   Needs     │  │  Medical    │  │    Evaluator &      │ │ │
│ │  │ Discovery   │◄►│  Expert     │◄►│   Prioritizer       │ │ │
│ │  │   Agent     │  │   Agent     │  │                     │ │ │
│ │  │             │  │             │  │ • Multi-criteria    │ │ │
│ │  │ • Market    │  │ • Clinical  │  │   Decision Analysis │ │ │
│ │  │   Research  │  │   Evidence  │  │ • Need Scoring      │ │ │
│ │  │ • User      │  │ • Safety    │  │ • Market Potential  │ │ │
│ │  │   Feedback  │  │   Standards │  │ • Feasibility       │ │ │
│ │  │ • Trend     │  │ • Efficacy  │  │   Assessment        │ │ │
│ │  │   Analysis  │  │   Analysis  │  │                     │ │ │
│ │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│ ┌─────────────────────────────────▼─────────────────────────────┐ │
│ │                   INVENT PHASE                              │ │
│ │                                                             │ │
│ │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│ │  │    Tech     │  │  Business   │  │   Solution Designer │ │ │
│ │  │  Engineer   │◄►│  Analyst    │◄►│    & Synthesizer    │ │ │
│ │  │   Agent     │  │   Agent     │  │                     │ │ │
│ │  │             │  │             │  │ • Concept           │ │ │
│ │  │ • Technical │  │ • Market    │  │   Generation        │ │ │
│ │  │   Feasib.   │  │   Analysis  │  │ • Tech Integration  │ │ │
│ │  │ • Innovation│  │ • ROI Model │  │ • Solution          │ │ │
│ │  │   Assessment│  │ • Business  │  │   Validation        │ │ │
│ │  │ • Prototype │  │   Model     │  │ • Prototype Plan    │ │ │
│ │  │   Strategy  │  │ • Strategy  │  │                     │ │ │
│ │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│ ┌─────────────────────────────────▼─────────────────────────────┐ │
│ │                 IMPLEMENT PHASE                             │ │
│ │                                                             │ │
│ │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│ │  │ Regulatory  │  │   Patient   │  │   Commercial        │ │ │
│ │  │ Affairs     │◄►│  Advocate   │◄►│   Strategist        │ │ │
│ │  │   Agent     │  │   Agent     │  │                     │ │ │
│ │  │             │  │             │  │ • Porter Five       │ │ │
│ │  │ • Compliance│  │ • User      │  │   Forces Analysis   │ │ │
│ │  │   Standards │  │   Needs     │  │ • Sales Strategy    │ │ │
│ │  │ • Approval  │  │ • Access.   │  │ • Business Model    │ │ │
│ │  │   Pathways  │  │ • Cost      │  │   (Service/Product/ │ │ │
│ │  │ • Risk      │  │   Impact    │  │    Subscription/    │ │ │
│ │  │   Assessment│  │ • Quality   │  │    Rental)          │ │ │
│ │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Knowledge Enhancement Layer                   │ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │ RAG System  │  │ Perplexity  │  │   Mermaid Diagram   │ │ │
│  │  │             │  │ Web Search  │  │     Generator       │ │ │
│  │  │ • Document  │  │             │  │                     │ │ │
│  │  │   Upload    │  │ • Real-time │  │ • Flowcharts        │ │ │
│  │  │ • Vector    │  │   Market    │  │ • Concept Maps      │ │ │
│  │  │   Search    │  │   Data      │  │ • System            │ │ │
│  │  │ • Context   │  │ • Industry  │  │   Architecture      │ │ │
│  │  │   Retrieval │  │   Research  │  │ • Process Flows     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                LangGraph Orchestration                     │ │
│  │                                                           │ │
│  │ • Phase Transition Management                             │ │
│  │ • Agent Coordination & Workflow                           │ │
│  │ • State Management Across Phases                          │ │
│  │ • Decision Gate Controls                                  │ │
│  │ • Progress Tracking & Milestone Management                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Code Diagram (Level 4) - Core Components

```python
# Core Debate System Classes
┌─────────────────────────────────────────────────────────┐
│ AdvancedDebateSystem                                    │
│ ├── __init__(max_rounds, agents_config)                │
│ ├── _build_debate_graph() -> StateGraph                │
│ ├── medical_expert_node(state) -> DebateState          │
│ ├── tech_engineer_node(state) -> DebateState           │
│ ├── business_analyst_node(state) -> DebateState        │
│ ├── regulatory_agent_node(state) -> DebateState        │
│ ├── ethicist_node(state) -> DebateState                │
│ ├── patient_advocate_node(state) -> DebateState        │
│ ├── devils_advocate_node(state) -> DebateState         │
│ ├── orchestrator_node(state) -> DebateState            │
│ └── _determine_next_speaker(state) -> str              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DebateOrchestrator                                      │
│ ├── __init__(debate_rules, consensus_threshold)        │
│ ├── assign_positions(topic, agents) -> Dict            │
│ ├── manage_cross_examination(state) -> DebateState     │
│ ├── evaluate_consensus_level(arguments) -> float       │
│ ├── synthesize_perspectives(state) -> Summary          │
│ └── _coordinate_debate_flow(state) -> str              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MultiPerspectiveEvaluator                               │
│ ├── __init__(evaluation_criteria, weight_config)       │
│ ├── evaluate_from_all_angles(needs) -> EvaluationOut   │
│ ├── calculate_stakeholder_impact(need) -> ImpactScore  │
│ ├── assess_implementation_risk(need) -> RiskProfile    │
│ ├── generate_consensus_score(debates) -> ConsensusMetr │
│ └── _create_evaluation_matrix() -> EvalMatrix          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FastAPI Debate Application                              │
│ ├── /api/debate/start [POST]                           │
│ ├── /api/debate/{session_id}/status [GET]              │
│ ├── /api/debate/{session_id}/arguments [GET]           │
│ ├── /api/debate/{session_id}/consensus [GET]           │
│ ├── /api/debate/{session_id}/evaluation [GET]          │
│ ├── /api/debate/{session_id}/stream [GET] (WebSocket)  │
│ └── /api/debate/{session_id}/export [POST]             │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Functional Requirements

### 3.1 Core Workflow Requirements (Design Thinking Integration)

#### 3.1.1 Phase 1: IDENTIFY - Problem Definition & Need Discovery
**Primary Goal:** Divergent exploration to understand and define unmet medical needs

**Functional Requirements:**
- **FR-1.1 Need Discovery Interface:** Interactive dashboard for uploading market research, clinical data, user interviews, and regulatory documents via RAG system
- **FR-1.2 Multi-Source Analysis:** Automated analysis of uploaded documents using AI agents specialized in medical expertise and needs assessment
- **FR-1.3 Real-time Market Intelligence:** Integration with Perplexity API for live market research, competitor analysis, and emerging healthcare trends
- **FR-1.4 Stakeholder Perspective Mapping:** Multi-agent debate system examining needs from clinical, patient, regulatory, and business perspectives
- **FR-1.5 Need Prioritization Matrix:** Automated scoring system evaluating needs based on market size, technical feasibility, regulatory complexity, and patient impact
- **FR-1.6 Visual Need Mapping:** Mermaid-generated diagrams showing problem landscapes, stakeholder relationships, and opportunity areas
- **FR-1.7 Evidence-Based Validation:** Medical expert agent validates clinical needs using peer-reviewed evidence and safety standards
- **FR-1.8 Decision Gate Control:** Clear criteria and evaluation metrics for advancing from Identify to Invent phase

#### 3.1.2 Phase 2: INVENT - Solution Ideation & Development
**Primary Goal:** Divergent then convergent exploration to generate and refine innovative solutions

**Functional Requirements:**
- **FR-2.1 Solution Brainstorming Engine:** AI-powered ideation system generating multiple solution concepts based on identified needs
- **FR-2.2 Technical Feasibility Assessment:** Tech engineer agent evaluates engineering constraints, manufacturing requirements, and innovation potential
- **FR-2.3 Business Model Canvas:** Business analyst agent creates comprehensive business models including service, product, subscription, and rental approaches
- **FR-2.4 Multi-Agent Solution Debate:** Adversarial debate between technical, business, regulatory, and ethical perspectives to refine solutions
- **FR-2.5 Prototype Planning:** Detailed prototyping strategies with timeline, resource requirements, and testing protocols
- **FR-2.6 Innovation Risk Analysis:** Comprehensive assessment of technical, market, and regulatory risks associated with each solution
- **FR-2.7 Solution Visualization:** Mermaid diagrams showing solution architecture, user journey maps, and system interactions
- **FR-2.8 Porter's Five Forces Integration:** Business strategy analysis considering competitive landscape and market dynamics
- **FR-2.9 Solution Ranking Matrix:** Multi-criteria decision analysis weighing innovation potential, feasibility, and market opportunity

#### 3.1.3 Phase 3: IMPLEMENT - Business Strategy & Go-to-Market
**Primary Goal:** Convergent focus on commercialization strategy and implementation planning

**Functional Requirements:**
- **FR-3.1 Regulatory Pathway Mapping:** Detailed analysis of FDA/CE/other regulatory requirements and approval timelines
- **FR-3.2 Commercial Strategy Development:** Comprehensive go-to-market strategy including pricing, distribution, and sales channels
- **FR-3.3 Stakeholder Impact Analysis:** Patient advocate agent ensures accessibility, affordability, and user-centered design principles
- **FR-3.4 Risk Mitigation Planning:** Devil's advocate agent identifies potential failure modes and mitigation strategies
- **FR-3.5 Business Model Validation:** Financial modeling including revenue projections, cost structure, and investment requirements
- **FR-3.6 Implementation Timeline:** Detailed project roadmap with milestones, dependencies, and resource allocation
- **FR-3.7 Success Metrics Definition:** KPIs for technical performance, market adoption, and patient outcomes
- **FR-3.8 Final Decision Support:** Comprehensive business case with recommendation for proceed/pivot/stop decisions

### 3.2 Agent Collaboration Requirements

#### 3.2.1 Multi-Agent Debate System
- **FR-4.1 Adversarial Position Assignment:** System automatically assigns agents to different positions (pro/con/neutral) for balanced debate
- **FR-4.2 Cross-Examination Protocols:** Structured questioning rounds where agents challenge each other's assumptions and evidence
- **FR-4.3 Evidence Citation Requirements:** All agent arguments must include verifiable sources, confidence levels, and uncertainty acknowledgments
- **FR-4.4 Real-time Argument Tracking:** Live dashboard showing argument threads, supporting evidence, and counterarguments
- **FR-4.5 Consensus Building Algorithms:** Automated detection of areas of agreement and remaining points of contention
- **FR-4.6 Debate Moderation:** LangGraph orchestration ensuring fair speaking time, preventing circular arguments, and maintaining focus

#### 3.2.2 Knowledge Enhancement System
- **FR-5.1 RAG Document Processing:** Upload and vectorization of technical papers, market reports, regulatory guidelines, and user research
- **FR-5.2 Real-time Web Search:** Perplexity API integration for live access to current market data, competitor intelligence, and emerging research
- **FR-5.3 Intelligent Query Generation:** Agents automatically generate relevant search queries based on debate context and knowledge gaps
- **FR-5.4 Source Verification:** Automatic fact-checking and source reliability assessment for all external information
- **FR-5.5 Context-Aware Retrieval:** Smart document search considering current phase, active debate topics, and agent specializations

#### 3.2.3 Multimodal Content Processing
- **FR-5.6 Medical Image Analysis:** Integration with vision models for analyzing medical images (X-ray, MRI, CT scans) relevant to identified needs
- **FR-5.7 Design Document Understanding:** AI-powered analysis of technical drawings, CAD files, and design sketches
- **FR-5.8 Visual Concept Extraction:** Automatic extraction of concepts from infographics, flowcharts, and presentation slides
- **FR-5.9 Handwritten Input Processing:** Recognition and interpretation of hand-drawn concept maps and sketches
- **FR-5.10 Patent Image Analysis:** Automated analysis of patent diagrams and technical illustrations for prior art research
- **FR-5.11 Multimodal Evidence Integration:** Combination of textual and visual evidence in agent arguments and decision-making

### 3.3 Visualization and Documentation

#### 3.3.1 Advanced Concept Map Generation
- **FR-6.1 Dynamic Flowcharts:** Automatic generation of process flows showing each phase progression and decision points
- **FR-6.2 Intelligent Concept Mapping:** AI-powered visual representation of problem spaces, solution landscapes, and stakeholder relationships
- **FR-6.3 System Architecture Diagrams:** Technical architecture visualization showing component interactions and data flows
- **FR-6.4 Interactive Business Model Canvas:** Dynamic business model representation with value propositions, customer segments, and revenue streams
- **FR-6.5 Regulatory Timeline Charts:** Visual mapping of approval pathways and regulatory milestones
- **FR-6.6 Multi-format Export:** Export diagrams in SVG, PNG, PDF, and interactive HTML formats
- **FR-6.7 Collaborative Editing:** Real-time collaborative editing of concept maps with version control
- **FR-6.8 Auto-layout Optimization:** AI-powered diagram layout optimization for clarity and visual appeal
- **FR-6.9 Template Library:** Pre-built templates for common biomedical innovation scenarios

### 3.4 Advanced Analytics & Business Intelligence

#### 3.4.1 智能商業策略分析引擎
- **FR-7.1 Porter五力分析:** 自動進行競爭環境分析，評估市場吸引力和競爭強度
- **FR-7.2 商業模式設計:** 支援多種商業模式（B2B、B2C、SaaS、訂閱制、租賃制）的分析和比較
- **FR-7.3 定價策略分析:** 基於成本結構、競爭對手和市場定位的智能定價建議
- **FR-7.4 收益流建模:** 多元化收益流分析，包含一次性收費、訂閱、使用量計費、佣金等模式
- **FR-7.5 風險評估矩陣:** 全面的商業風險識別和評估，包含市場、技術、監管、財務風險
- **FR-7.6 Go-to-Market策略:** 詳細的市場進入策略，包含客戶獲取、銷售渠道、行銷策略
- **FR-7.7 財務建模引擎:** 詳細的財務預測，包含收入預測、成本結構、投資回報率分析
- **FR-7.8 競爭對手分析:** 自動化競爭對手監控和比較分析，包含產品特性、定價、市場佔有率

#### 3.4.2 智能報告生成系統
- **FR-8.1 階段性報告自動生成:** 每個創新階段完成後自動生成詳細報告，包含決策軌跡和關鍵洞察
- **FR-8.2 綜合創新報告:** 跨三個階段的完整創新項目報告，包含執行摘要、技術分析、市場策略等
- **FR-8.3 定制化報告模板:** 支援不同利害關係人的報告需求（投資者、技術團隊、監管機構等）
- **FR-8.4 互動式報告儀表板:** 包含圖表、數據視覺化和可鑽取分析的動態報告界面
- **FR-8.5 報告協作功能:** 支援報告審閱、註釋、版本管理和團隊協作
- **FR-8.6 智能洞察提取:** AI驅動的關鍵洞察識別和趨勢分析
- **FR-8.7 報告版本管理:** 完整的報告版本控制和變更追蹤
- **FR-8.8 多格式輸出:** 支援PDF、Word、PowerPoint、HTML等多種格式輸出

#### 3.4.3 Dashboard與績效分析平台
- **FR-9.1 即時進度監控:** 創新流程的實時進度追蹤和里程碑管理儀表板
- **FR-9.2 多維度績效分析:** 包含時間效率、決策品質、共識程度等多項績效指標
- **FR-9.3 代理活動分析:** 各AI代理的參與度、貢獻品質和專業領域表現分析
- **FR-9.4 用戶行為分析:** 用戶與系統互動模式分析，用於改善用戶體驗
- **FR-9.5 歷史項目對比:** 多個創新項目的比較分析，識別成功模式和改進空間
- **FR-9.6 預測性分析:** 基於歷史數據預測項目成功機率和潛在風險
- **FR-9.7 KPI追蹤:** 關鍵績效指標的定義、追蹤和可視化
- **FR-9.8 團隊協作分析:** 團隊成員參與度和協作效果分析

#### 3.4.4 知識管理與學習系統
- **FR-10.1 組織知識庫:** 建立和維護組織內部的生醫創新知識庫
- **FR-10.2 最佳實踐萃取:** 從成功項目中自動萃取最佳實踐和經驗教訓
- **FR-10.3 智能推薦引擎:** 基於歷史項目和當前脈絡的智能建議系統
- **FR-10.4 學習路徑規劃:** 為用戶提供個性化的生醫創新學習路徑
- **FR-10.5 專家網絡連接:** 連接內部外部專家，支援項目諮詢和指導

### 3.5 User Experience Requirements

#### 3.4.1 Phase Navigation Interface
- **FR-7.1 Progress Tracking:** Clear visual indicators showing current phase, completed milestones, and next steps
- **FR-7.2 Phase Transition Gates:** Defined criteria and approval mechanisms for advancing between phases
- **FR-7.3 Backtracking Capability:** Users can return to previous phases to refine inputs or explore alternative paths
- **FR-7.4 Save and Resume:** Session persistence allowing users to save progress and continue work later
- **FR-7.5 Collaborative Access:** Multiple team members can contribute to the same innovation project

#### 3.5.2 Real-time Interaction
- **FR-11.1 WebSocket Integration:** Live updates during agent debates and analysis processes
- **FR-11.2 Interactive Debate Viewing:** Users can observe agent debates in real-time with ability to ask clarifying questions
- **FR-11.3 Manual Intervention:** Users can guide agent discussions, provide additional context, or request specific analyses
- **FR-11.4 Export and Sharing:** Comprehensive reports generated for each phase with ability to share with stakeholders

## 4. User Stories

### 4.1 Primary User Personas

#### 4.1.1 Biomedical Innovation Teams
**As a biomedical innovation team,** we want to systematically identify, develop, and commercialize healthcare solutions using a structured design thinking approach so that we can increase our success rate and reduce time-to-market.

**Epic 1: Phase 1 - IDENTIFY (Problem Definition)**
- **US-1.1:** As an innovation team, I want to upload multiple data sources (market research, clinical studies, user interviews) so that AI agents can comprehensively analyze unmet medical needs
- **US-1.2:** As a team leader, I want to see real-time market intelligence from Perplexity API so that we base our decisions on current healthcare trends and competitive landscapes
- **US-1.3:** As a clinical researcher, I want the Medical Expert Agent to validate our identified needs using evidence-based analysis so that we focus on clinically significant problems
- **US-1.4:** As a project manager, I want visual need mapping with Mermaid diagrams so that stakeholders can easily understand problem landscapes and opportunities
- **US-1.5:** As a decision maker, I want a prioritized list of validated needs with scoring rationale so that we can select the most promising opportunities to pursue

**Epic 2: Phase 2 - INVENT (Solution Development)**
- **US-2.1:** As an innovation team, I want AI-powered solution brainstorming that generates multiple concepts for each identified need so that we explore diverse approaches
- **US-2.2:** As a technical lead, I want detailed feasibility assessments from the Tech Engineer Agent so that we understand engineering challenges and innovation potential
- **US-2.3:** As a business strategist, I want comprehensive business model options (service/product/subscription/rental) so that we can optimize our commercialization approach
- **US-2.4:** As a team member, I want to observe multi-agent debates about solution trade-offs so that we consider all perspectives before making decisions
- **US-2.5:** As a project manager, I want detailed prototype planning with timelines and resources so that we can execute development efficiently

**Epic 3: Phase 3 - IMPLEMENT (Commercialization)**
- **US-3.1:** As a regulatory affairs specialist, I want detailed regulatory pathway mapping so that we can plan approval strategies and timelines accurately
- **US-3.2:** As a business development manager, I want comprehensive go-to-market strategies including pricing and distribution so that we can launch successfully
- **US-3.3:** As a patient advocate, I want accessibility and affordability analysis so that our solutions truly serve those who need them most
- **US-3.4:** As an executive, I want detailed business cases with financial projections so that we can make informed investment decisions
- **US-3.5:** As a team lead, I want clear success metrics and implementation roadmaps so that we can track progress and adjust strategies

#### 4.1.2 Healthcare Entrepreneurs
**As a healthcare entrepreneur,** I want an AI-powered innovation advisor that guides me through Stanford Biodesign methodology so that I can systematically develop viable medical solutions.

- **US-4.1:** As a solo entrepreneur, I want the system to act as my virtual innovation team so that I have access to multi-disciplinary expertise
- **US-4.2:** As a first-time founder, I want educational guidance on each phase so that I understand biomedical innovation best practices
- **US-4.3:** As a resource-constrained startup, I want cost-effective market research and competitive analysis so that I can make informed decisions without expensive consulting
- **US-4.4:** As an entrepreneur, I want to export professional reports and presentations so that I can communicate effectively with investors and partners

#### 4.1.3 Academic Researchers
**As an academic researcher,** I want to explore the commercial potential of my research findings using structured innovation methodology so that I can effectively translate research into real-world impact.

- **US-5.1:** As a researcher, I want to upload my technical papers and have them analyzed for commercial applications so that I can identify market opportunities
- **US-5.2:** As a PI, I want to understand regulatory requirements early in my research so that I can design studies that support commercialization
- **US-5.3:** As an academic, I want to explore multiple business models so that I can find the best path to market for my research
- **US-5.4:** As a researcher, I want collaboration tools so that I can work with industry partners and business development teams

### 4.2 System Administrator Stories

- **US-6.1:** As a system administrator, I want comprehensive logging and monitoring so that I can ensure system reliability and performance
- **US-6.2:** As an admin, I want user management and access controls so that I can maintain security and manage organizational accounts
- **US-6.3:** As an admin, I want usage analytics and reporting so that I can understand system utilization and optimize resources
- **US-6.4:** As an admin, I want integration management for RAG and Perplexity APIs so that I can maintain external service connections

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **NFR-001**: API響應時間 < 2秒（非LLM調用）
- **NFR-002**: LLM代理響應時間 < 30秒/輪
- **NFR-003**: 並發用戶支援 ≥ 50人
- **NFR-004**: 系統可用性 ≥ 99.5%

### 4.2 Scalability Requirements
- **NFR-005**: 支援水平擴展至多個實例
- **NFR-006**: 會話數據存儲支援 ≥ 10,000個活躍會話
- **NFR-007**: LLM API調用支援負載均衡
- **NFR-008**: 多模態內容處理支援並行處理

### 4.3 Security Requirements
- **NFR-009**: API金鑰安全存儲（環境變數）
- **NFR-010**: CORS配置防護XSS攻擊
- **NFR-011**: 輸入驗證防護注入攻擊
- **NFR-012**: HTTPS加密傳輸（生產環境）
- **NFR-013**: 上傳文件安全掃描和格式驗證
- **NFR-014**: 多模態內容的隱私保護和數據加密

### 4.4 Usability Requirements
- **NFR-015**: 用戶界面響應時間 < 200ms
- **NFR-016**: 支援主流瀏覽器（Chrome, Firefox, Safari, Edge）
- **NFR-017**: 移動設備友好的響應式設計
- **NFR-018**: 直觀的錯誤訊息和操作指導
- **NFR-019**: 多模態內容的預覽和註解功能
- **NFR-020**: 概念圖協作編輯的即時同步

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### Backend
- **Framework**: FastAPI (Python 3.10+)
- **AI/ML**: 
  - LangChain 0.3.25+ (多代理框架)
  - LangGraph 0.4.7+ (工作流程編排)
  - OpenAI GPT-4 + Vision (文本和圖像理解)
  - Anthropic Claude 3 + Vision (多模態分析)
  - Ollama (本地模型備援)
- **Computer Vision & Multimodal**:
  - OpenCV (圖像預處理)
  - Pillow (圖像格式處理)
  - pydicom (醫學影像DICOM格式)
  - pdf2image (PDF中圖像提取)
  - pytesseract (OCR文字識別)
- **Data Processing**: 
  - Pydantic 2.5.0+ (數據驗證)
  - Pandas (數據分析)
  - NetworkX (關係圖分析)
  - Sentence Transformers (文本向量化)
  - ChromaDB (向量數據庫)
- **Async & Concurrency**: 
  - uvicorn, asyncio
  - Celery (背景任務處理)
  - Redis (任務佇列和快取)

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS + Custom Components
- **Real-time**: 
  - WebSocket (雙向通信)
  - Socket.IO (連接管理)
- **Visualization**: 
  - D3.js (辯論流程圖)
  - Cytoscape.js (概念圖編輯器)
  - Mermaid (流程圖渲染)
  - React Flow (代理互動圖)
  - Recharts (評分圖表)
- **File Handling**:
  - react-dropzone (文件上傳)
  - react-image-crop (圖像裁剪)
  - react-pdf (PDF預覽)

#### Infrastructure
- **Dependency Management**: UV package manager
- **Database**: 
  - PostgreSQL (結構化數據)
  - MongoDB (辯論記錄)
- **Logging & Monitoring**: 
  - Loguru (結構化日誌)
  - Prometheus + Grafana (監控)
- **Security**: 
  - JWT (身份驗證)
  - Rate Limiting (API保護)
- **Deployment**: 
  - Docker + Kubernetes
  - CI/CD with GitHub Actions

### 5.2 Data Models

#### Core Data Structures
```python
class DebateArgument(BaseModel):
    agent_id: str
    position: Literal["for", "against", "neutral"]
    content: str
    evidence: List[str]
    confidence_score: float  # 0.0-1.0
    timestamp: datetime
    references: List[str]

class DebateState(TypedDict):
    topic: str
    current_round: int
    max_rounds: int
    active_agents: List[str]
    arguments: List[DebateArgument]
    consensus_level: float  # 0.0-1.0
    debate_phase: Literal["opening", "adversarial", "cross_exam", "consensus"]
    agent_positions: Dict[str, str]
    final_synthesis: Optional[str]

class StakeholderPerspective(BaseModel):
    stakeholder_type: str
    concerns: List[str]
    priorities: List[str]
    impact_assessment: Dict[str, float]
    risk_tolerance: float

class NeedEvaluation(BaseModel):
    need_title: str
    feasibility_score: float  # 0-10
    impact_score: float       # 0-10
    innovation_score: float   # 0-10
    resource_score: float     # 0-10
    overall_score: float      # 0-10
    stakeholder_consensus: float  # 0-10
    risk_profile: Dict[str, float]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    debate_summary: str
```

### 5.4 Recommended Project Structure

```
bio-design/
├── README.md
├── PRD.md
├── LICENSE
├── .env.example
├── .gitignore
├── pyproject.toml
├── uv.lock
├── docker-compose.yml
├── Dockerfile
│
├── app/                           # Main application package
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── config.py                  # Configuration management
│   ├── dependencies.py            # Dependency injection
│   │
│   ├── api/                       # API layer
│   │   ├── __init__.py
│   │   ├── router.py              # Main API router
│   │   └── v1/                    # API version 1
│   │       ├── __init__.py
│   │       ├── endpoints/         # API endpoints
│   │       │   ├── __init__.py
│   │       │   ├── debate.py      # Debate management endpoints
│   │       │   ├── agents.py      # Agent management endpoints
│   │       │   ├── evaluation.py  # Evaluation endpoints
│   │       │   ├── health.py      # Health check endpoints
│   │       │   └── websocket.py   # WebSocket endpoints
│   │       └── dependencies.py    # API-specific dependencies
│   │
│   ├── core/                      # Core business logic
│   │   ├── __init__.py
│   │   ├── agents/                # Multi-agent system
│   │   │   ├── __init__.py
│   │   │   ├── base.py            # Base agent class
│   │   │   ├── medical_expert.py  # Medical expert agent
│   │   │   ├── tech_engineer.py   # Technical engineer agent
│   │   │   ├── business_analyst.py # Business analyst agent
│   │   │   ├── regulatory_agent.py # Regulatory affairs agent
│   │   │   ├── ethicist.py        # Ethics specialist agent
│   │   │   ├── patient_advocate.py # Patient advocate agent
│   │   │   └── devils_advocate.py # Devil's advocate agent
│   │   │
│   │   ├── debate/                # Debate orchestration
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py    # Debate orchestration engine
│   │   │   ├── consensus.py       # Consensus building algorithms
│   │   │   ├── state_manager.py   # Debate state management
│   │   │   └── strategies.py      # Debate strategies
│   │   │
│   │   ├── evaluation/            # Evaluation system
│   │   │   ├── __init__.py
│   │   │   ├── evaluator.py       # Multi-perspective evaluator
│   │   │   ├── metrics.py         # Evaluation metrics
│   │   │   ├── risk_analysis.py   # Risk assessment
│   │   │   └── consensus_metrics.py # Consensus measurement
│   │   │
│   │   └── biodesign/             # Biodesign methodology
│   │       ├── __init__.py
│   │       ├── needs_finder.py    # Needs identification
│   │       ├── solution_dev.py    # Solution development
│   │       └── implementation.py  # Implementation strategies
│   │
│   ├── models/                    # Data models
│   │   ├── __init__.py
│   │   ├── debate.py              # Debate-related models
│   │   ├── agent.py               # Agent models
│   │   ├── evaluation.py          # Evaluation models
│   │   ├── session.py             # Session models
│   │   └── common.py              # Common/shared models
│   │
│   ├── services/                  # Business services
│   │   ├── __init__.py
│   │   ├── debate_service.py      # Debate management service
│   │   ├── agent_service.py       # Agent coordination service
│   │   ├── evaluation_service.py  # Evaluation service
│   │   ├── session_service.py     # Session management service
│   │   └── llm_service.py         # LLM provider service
│   │
│   ├── db/                        # Database layer
│   │   ├── __init__.py
│   │   ├── connection.py          # Database connection
│   │   ├── repositories/          # Data repositories
│   │   │   ├── __init__.py
│   │   │   ├── debate_repository.py
│   │   │   ├── session_repository.py
│   │   │   └── evaluation_repository.py
│   │   └── migrations/            # Database migrations
│   │       └── versions/
│   │
│   ├── utils/                     # Utility functions
│   │   ├── __init__.py
│   │   ├── logging.py             # Logging configuration
│   │   ├── validators.py          # Data validation
│   │   ├── exceptions.py          # Custom exceptions
│   │   └── helpers.py             # Helper functions
│   │
│   └── middleware/                # Custom middleware
│       ├── __init__.py
│       ├── auth.py                # Authentication middleware
│       ├── cors.py                # CORS middleware
│       ├── rate_limiting.py       # Rate limiting middleware
│       └── logging.py             # Request logging middleware
│
├── frontend/                      # Frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── debate/
│   │   │   ├── agents/
│   │   │   ├── visualization/
│   │   │   └── common/
│   │   ├── pages/                 # Page components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API service layer
│   │   ├── utils/                 # Frontend utilities
│   │   ├── types/                 # TypeScript types
│   │   └── styles/                # CSS/styling
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── tests/                         # Test suite
│   ├── __init__.py
│   ├── conftest.py                # Test configuration
│   ├── unit/                      # Unit tests
│   │   ├── test_agents/
│   │   ├── test_debate/
│   │   ├── test_evaluation/
│   │   └── test_services/
│   ├── integration/               # Integration tests
│   │   ├── test_api/
│   │   └── test_workflows/
│   └── fixtures/                  # Test fixtures
│       ├── sample_debates.json
│       └── mock_responses.json
│
├── scripts/                       # Utility scripts
│   ├── setup.py                   # Environment setup
│   ├── migrate.py                 # Database migration
│   ├── seed_data.py               # Sample data seeding
│   └── deploy.sh                  # Deployment script
│
├── docs/                          # Documentation
│   ├── api/                       # API documentation
│   │   ├── openapi.json
│   │   └── postman_collection.json
│   ├── architecture/              # Architecture documentation
│   │   ├── system_design.md
│   │   └── database_schema.md
│   ├── deployment/                # Deployment guides
│   │   ├── docker.md
│   │   └── kubernetes.md
│   └── user_guides/               # User documentation
│       ├── api_usage.md
│       └── web_interface.md
│
├── config/                        # Configuration files
│   ├── development.yml
│   ├── production.yml
│   ├── staging.yml
│   └── logging.yml
│
└── deployment/                    # Deployment configurations
    ├── docker/
    │   ├── Dockerfile.backend
    │   ├── Dockerfile.frontend
    │   └── docker-compose.prod.yml
    ├── kubernetes/
    │   ├── backend-deployment.yml
    │   ├── frontend-deployment.yml
    │   └── ingress.yml
    └── terraform/                 # Infrastructure as code
        ├── main.tf
        └── variables.tf
```

### 5.5 Key Design Principles

1. **Separation of Concerns**: Clear separation between API, business logic, data access, and presentation layers

2. **Modularity**: Each agent and service is self-contained and can be developed/tested independently

3. **Scalability**: Structure supports horizontal scaling and microservices architecture migration

4. **Testability**: Comprehensive test organization with unit, integration, and fixture support

5. **Configuration Management**: Environment-specific configurations separated from code

6. **Documentation**: Structured documentation for API, architecture, and deployment

7. **DevOps Ready**: Container and orchestration configurations included

---

## 6. Implementation Roadmap

### Phase 1: Triple Phase Innovation Foundation (6 weeks)
**Focus: Establish core three-phase design thinking workflow**

#### Week 1-2: IDENTIFY Phase Implementation
- [ ] Implement need discovery interface with RAG document upload
- [ ] Develop medical expert agent for clinical validation
- [ ] Create multi-source analysis engine for market research
- [ ] Build Perplexity API integration for real-time market intelligence
- [ ] Implement need prioritization matrix with scoring algorithms

#### Week 3-4: INVENT Phase Implementation
- [ ] Develop solution brainstorming engine with AI-powered ideation
- [ ] Implement tech engineer agent for feasibility assessment
- [ ] Create business analyst agent for business model development
- [ ] Build multi-agent solution debate coordination
- [ ] Implement Porter's Five Forces analysis integration

#### Week 5-6: IMPLEMENT Phase Implementation
- [ ] Develop regulatory pathway mapping system
- [ ] Implement patient advocate agent for accessibility analysis
- [ ] Create commercial strategist functionality
- [ ] Build comprehensive business case generation
- [ ] Implement decision gate controls between phases

### Phase 2: Advanced Multi-Agent Debate Integration (4 weeks)
**Focus: Enhance agent collaboration and debate quality**

#### Week 7-8: Agent Specialization & Debate Orchestration
- [ ] Implement seven specialized AI agents with domain expertise
- [ ] Develop adversarial position assignment algorithms
- [ ] Create cross-examination coordination system
- [ ] Build real-time argument tracking dashboard
- [ ] Implement consensus building algorithms

#### Week 9-10: Knowledge Enhancement & Advanced Visualization
- [ ] Integrate multimodal AI models (OpenAI Vision, Claude Vision) for image analysis
- [ ] Implement intelligent concept map generation with auto-layout optimization
- [ ] Enhance RAG system with context-aware retrieval and multimodal content processing
- [ ] Implement source verification and fact-checking for textual and visual content
- [ ] Create collaborative concept map editing with real-time synchronization
- [ ] Build comprehensive export capabilities (SVG, PNG, PDF, interactive HTML)
- [ ] Develop medical imaging analysis for IDENTIFY phase clinical validation
- [ ] Implement design document understanding for INVENT phase technical assessment

### Phase 3: User Experience & System Integration (4 weeks)
**Focus: Polish user interface, multimodal integration and complete system integration**

#### Week 11-12: Frontend Development & Real-time Features
- [ ] Develop React frontend with three-phase navigation and multimodal upload interfaces
- [ ] Implement WebSocket integration for live debate viewing and collaborative editing
- [ ] Create interactive phase transition interfaces with visual progress indicators
- [ ] Build collaborative access and session management with role-based permissions
- [ ] Implement progress tracking and milestone visualization with concept map integration
- [ ] Develop image annotation and analysis interfaces for medical and technical content

#### Week 13-14: Advanced Visualization & Multimodal Processing
- [ ] Complete intelligent concept map system with optimization suggestions
- [ ] Implement multimodal content analysis pipeline (medical imaging, design sketches, patents)
- [ ] Create visual evidence integration in agent arguments and decision-making
- [ ] Build template library for common biomedical innovation scenarios
- [ ] Implement version control and change tracking for collaborative concept maps
- [ ] Develop export functionality for presentations and stakeholder communication

### Phase 4: Testing, Integration & Deployment (2 weeks)
**Focus: Comprehensive testing and production readiness**

#### Week 15-16: Testing, Documentation & Deployment
- [ ] Comprehensive system testing across all three phases with multimodal content
- [ ] Complete API documentation including multimodal endpoints and concept map APIs
- [ ] Performance optimization for image processing and real-time collaboration
- [ ] Security testing for file uploads and collaborative editing features
- [ ] Production deployment with CDN for diagram serving and monitoring
- [ ] User acceptance testing with biomedical innovation teams using real medical images and design documents

### Phase 5: Advanced Features & Optimization (Optional - 2 weeks)
**Focus: Advanced AI capabilities and user experience enhancements**

#### Week 17-18: Advanced AI Integration & User Experience Polish
- [ ] 開發共識測量指標
- [ ] 實現優先順序推薦與理由說明

### Phase 4: Advanced Web Interface & Visualization (4 weeks)
- [ ] 建立實時辯論可視化界面
- [ ] 開發論點流程追蹤系統
- [ ] 實作WebSocket雙向通信
- [ ] 建立辯論歷史回放功能
- [ ] 開發共識演進可視化

### Phase 5: Integration & Optimization (2 weeks)
- [ ] 系統整合測試和性能優化
- [ ] 用戶體驗優化和界面調整
- [ ] 文檔完善和API測試
- [ ] 部署配置和監控設置

---

## 7. Success Metrics

### 7.1 Technical Metrics
- API可用性 > 99.5%
- 平均辯論輪次響應時間 < 30秒
- 並發辯論會話支援 ≥ 25個
- WebSocket連接穩定性 > 99%
- 辯論品質評分 ≥ 8.0/10

### 7.2 Business Metrics
- 多角度需求識別準確率 ≥ 90%
- 利益相關者滿意度 ≥ 4.2/5.0
- 辯論共識達成率 ≥ 80%
- 專業觀點覆蓋完整性 ≥ 95%
- 決策支援有效性 ≥ 85%

### 7.3 User Experience Metrics
- 辯論可視化加載時間 < 5秒
- 完整辯論流程時間 < 25分鐘
- 用戶界面交互錯誤率 < 3%
- 辯論結果理解度 ≥ 90%

---

## 8. Risk Assessment

### 8.1 Technical Risks
- **High**: 多個LLM API服務同時中斷或限流
  - *Mitigation*: 多供應商備援機制和本地模型備用方案
- **High**: 七個代理協調的複雜性導致系統不穩定
  - *Mitigation*: 模組化架構設計和漸進式代理啟用
- **Medium**: 辯論無法達成共識導致結果不確定
  - *Mitigation*: 共識閾值調整和強制終止機制
- **Medium**: 實時辯論可視化性能瓶頸
  - *Mitigation*: 前端優化和數據流控制

### 8.2 Business Risks
- **Medium**: 辯論複雜度過高影響用戶接受度
  - *Mitigation*: 簡化模式選項和導引式使用流程
- **Medium**: 多角度分析結果可能產生決策困擾
  - *Mitigation*: 結果摘要和明確推薦建議
- **Low**: 競爭產品出現類似功能
  - *Mitigation*: 持續創新和特色功能深化

---

## 9. Assumptions and Dependencies

### 9.1 Assumptions
- 多個LLM API服務供應商穩定可用
- 用戶具備基本醫療和辯論理解能力
- 網路連接穩定支援實時雙向通信
- 利益相關者願意接受AI代理代表其觀點

### 9.2 Dependencies
- OpenAI、Anthropic等多個LLM API訪問權限
- LangChain/LangGraph框架持續更新支援
- Python 3.10+運行環境
- 現代瀏覽器支援WebSocket和ES6+特性
- 足夠的計算資源支持多代理並行處理

---

## 10. Appendices

### 10.1 Glossary
- **Biodesign**: 史丹佛大學開發的醫療設備創新方法論
- **Multi-Agent Debate System**: 多個AI代理進行結構化辯論的系統架構
- **Adversarial Discussion**: 採用對立觀點進行建設性辯論的討論模式
- **Devil's Advocate**: 專門提出批判性質疑和反駁觀點的代理角色
- **Consensus Building**: 通過協商和妥協達成共識的過程
- **Stakeholder Perspective**: 從不同利益相關者角度分析問題的方法
- **Cross-Examination**: 交叉質詢，代理間相互詢問和挑戰的辯論階段

### 10.2 References
- Stanford Biodesign Methodology Documentation
- LangChain Multi-Agent Framework Documentation
- LangGraph Workflow Orchestration Documentation
- FastAPI WebSocket Documentation
- Multi-Agent Systems in AI Research Papers
- Debate and Argumentation Theory Literature

---

**Document Version**: 2.0 - Advanced Multi-Agent Debate System
**Last Updated**: September 11, 2025
**Next Review**: October 11, 2025
**Major Changes**: 
- Expanded from 3 to 7 specialized AI agents
- Introduced adversarial debate mechanisms
- Added multi-stakeholder perspective analysis
- Enhanced real-time visualization capabilities
- Implemented consensus building algorithms