# Phase 2: INVENT Interface

## Solution Ideation & Development UI

This document details the frontend interface design for Phase 2 of the Bio-Design Innovation Platform, focusing on the INVENT phase where teams generate, evaluate, and refine innovative solutions for identified medical needs.

## 🎯 Phase Overview

### Design Thinking: Divergent-Convergent Innovation
The INVENT phase interface supports both **divergent ideation** and **convergent refinement**:
- Open creative solution brainstorming
- Technical feasibility assessment
- Business model development  
- Multi-perspective solution validation
- Convergent selection of optimal solutions

### Key Objectives
1. **Creative Solution Generation**: Generate diverse innovative approaches to selected needs
2. **Technical Validation**: Assess engineering feasibility and implementation requirements
3. **Business Model Development**: Create viable commercial strategies
4. **Risk Assessment**: Identify and mitigate potential technical and market risks
5. **Solution Refinement**: Iteratively improve concepts based on multi-agent feedback

## 🖼️ Interface Layout

### Main Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 2: INVENT - Solution Ideation & Development              │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │
│ │   Solution Studio   │ │     Development Panel              │ │
│ │                     │ │                                     │ │
│ │ • Ideation Canvas   │ │ • Technical Analysis                │ │
│ │ • Concept Gallery   │ │ • Business Modeling                 │ │
│ │ • Solution Builder  │ │ • Agent Debates                     │ │
│ │ • Prototype Planner │ │ • Risk Assessment                   │ │
│ │                     │ │                                     │ │
│ └─────────────────────┘ └─────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Progress: Ideation (30%) | Development (40%) | Validation (30%) │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Core Components

### 1. Solution Ideation Interface

#### `SolutionIdeationCanvas.tsx`
```typescript
interface SolutionIdeationCanvasProps {
  selectedNeed: Need;
  onSolutionCreate: (solution: SolutionConcept) => Promise<void>;
  existingSolutions: SolutionConcept[];
}

const SolutionIdeationCanvas: React.FC<SolutionIdeationCanvasProps> = ({
  selectedNeed,
  onSolutionCreate,
  existingSolutions
}) => {
  const [ideationMode, setIdeationMode] = useState<'freeform' | 'structured' | 'ai_assisted'>('freeform');
  const [currentConcept, setCurrentConcept] = useState<Partial<SolutionConcept>>({});

  const ideationTechniques = [
    { id: 'brainstorming', name: 'Free Brainstorming', icon: '🧠' },
    { id: 'scamper', name: 'SCAMPER Method', icon: '🔄' },
    { id: 'biomimicry', name: 'Biomimicry', icon: '🌿' },
    { id: 'analogies', name: 'Cross-Industry Analogies', icon: '🔗' },
    { id: 'constraints', name: 'Constraint-Based', icon: '📐' },
    { id: 'ai_prompts', name: 'AI-Assisted Generation', icon: '🤖' }
  ];

  return (
    <div className="solution-ideation-canvas">
      <div className="solution-ideation-canvas__header">
        <h2>Solution Ideation</h2>
        <NeedContextPanel need={selectedNeed} />
      </div>

      <IdeationTechniqueSelector 
        techniques={ideationTechniques}
        selected={ideationMode}
        onChange={setIdeationMode}
      />

      {ideationMode === 'freeform' && (
        <FreeformIdeationPanel 
          concept={currentConcept}
          onChange={setCurrentConcept}
          onSave={() => onSolutionCreate(currentConcept as SolutionConcept)}
        />
      )}

      {ideationMode === 'structured' && (
        <StructuredIdeationPanel 
          need={selectedNeed}
          concept={currentConcept}
          onChange={setCurrentConcept}
          onSave={() => onSolutionCreate(currentConcept as SolutionConcept)}
        />
      )}

      {ideationMode === 'ai_assisted' && (
        <AIAssistedIdeationPanel 
          need={selectedNeed}
          existingSolutions={existingSolutions}
          onConceptGenerated={setCurrentConcept}
          onSave={() => onSolutionCreate(currentConcept as SolutionConcept)}
        />
      )}

      <SolutionGallery 
        solutions={existingSolutions}
        onSelect={(solution) => setCurrentConcept(solution)}
        onEdit={(solution) => {/* Open editor */}}
        onDelete={(solutionId) => {/* Delete solution */}}
      />
    </div>
  );
};
```

#### Freeform Ideation Panel
```typescript
const FreeformIdeationPanel: React.FC<{
  concept: Partial<SolutionConcept>;
  onChange: (concept: Partial<SolutionConcept>) => void;
  onSave: () => void;
}> = ({ concept, onChange, onSave }) => {
  const [isSketchMode, setIsSketchMode] = useState(false);
  
  return (
    <div className="freeform-ideation-panel">
      <div className="concept-builder">
        <div className="concept-builder__main">
          <ConceptTitleInput 
            value={concept.title || ''}
            onChange={(title) => onChange({ ...concept, title })}
            placeholder="Solution concept name..."
          />

          <ConceptDescriptionEditor 
            value={concept.description || ''}
            onChange={(description) => onChange({ ...concept, description })}
            placeholder="Describe your solution concept..."
            supportMarkdown={true}
          />

          {isSketchMode ? (
            <SketchCanvas 
              onSketchSave={(sketch) => onChange({ 
                ...concept, 
                sketches: [...(concept.sketches || []), sketch] 
              })}
            />
          ) : (
            <ConceptVisualizationUpload 
              onImageUpload={(images) => onChange({
                ...concept,
                images: [...(concept.images || []), ...images]
              })}
            />
          )}
        </div>

        <div className="concept-builder__sidebar">
          <ConceptCategorySelector 
            categories={['device', 'software', 'service', 'system', 'drug', 'diagnostic']}
            selected={concept.category}
            onChange={(category) => onChange({ ...concept, category })}
          />

          <TechnicalSpecsInput 
            specs={concept.technicalSpecs || {}}
            onChange={(technicalSpecs) => onChange({ ...concept, technicalSpecs })}
          />

          <ConceptTagInput 
            tags={concept.tags || []}
            onChange={(tags) => onChange({ ...concept, tags })}
            suggestions={['AI/ML', 'IoT', 'Mobile', 'Cloud', 'Hardware', 'SaaS']}
          />
        </div>
      </div>

      <div className="concept-builder__actions">
        <button 
          className="btn btn--outline"
          onClick={() => setIsSketchMode(!isSketchMode)}
        >
          {isSketchMode ? '📝 Text Mode' : '🎨 Sketch Mode'}
        </button>
        <button className="btn btn--outline">💡 Get AI Suggestions</button>
        <button className="btn btn--primary" onClick={onSave}>
          💾 Save Concept
        </button>
      </div>
    </div>
  );
};
```

### 2. Solution Development Panel

#### `SolutionDevelopmentPanel.tsx`
```typescript
interface SolutionDevelopmentPanelProps {
  solution: SolutionConcept;
  onUpdate: (updates: Partial<SolutionConcept>) => void;
  onStartAnalysis: (analysisType: string) => void;
}

const SolutionDevelopmentPanel: React.FC<SolutionDevelopmentPanelProps> = ({
  solution,
  onUpdate,
  onStartAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'technical' | 'business' | 'debate' | 'risks'>('technical');

  const developmentTabs = [
    { id: 'technical', label: 'Technical Analysis', icon: '⚙️' },
    { id: 'business', label: 'Business Model', icon: '💼' },
    { id: 'debate', label: 'Agent Debate', icon: '🤖' },
    { id: 'risks', label: 'Risk Assessment', icon: '⚠️' }
  ];

  return (
    <div className="solution-development-panel">
      <div className="solution-development-panel__header">
        <h3>Developing: {solution.title}</h3>
        <SolutionStatusIndicator status={solution.developmentStatus} />
      </div>

      <TabNavigation 
        tabs={developmentTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="tab-content">
        {activeTab === 'technical' && (
          <TechnicalAnalysisTab 
            solution={solution}
            onUpdate={onUpdate}
            onStartAnalysis={() => onStartAnalysis('technical')}
          />
        )}

        {activeTab === 'business' && (
          <BusinessModelTab 
            solution={solution}
            onUpdate={onUpdate}
            onStartAnalysis={() => onStartAnalysis('business')}
          />
        )}

        {activeTab === 'debate' && (
          <SolutionDebateTab 
            solution={solution}
            onStartDebate={() => onStartAnalysis('debate')}
          />
        )}

        {activeTab === 'risks' && (
          <RiskAssessmentTab 
            solution={solution}
            onUpdate={onUpdate}
            onStartAnalysis={() => onStartAnalysis('risk')}
          />
        )}
      </div>
    </div>
  );
};
```

#### Technical Analysis Tab
```typescript
const TechnicalAnalysisTab: React.FC<{
  solution: SolutionConcept;
  onUpdate: (updates: Partial<SolutionConcept>) => void;
  onStartAnalysis: () => void;
}> = ({ solution, onUpdate, onStartAnalysis }) => {
  const [analysisResults, setAnalysisResults] = useState<TechnicalAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="technical-analysis-tab">
      <div className="technical-analysis-tab__header">
        <h4>Technical Feasibility Assessment</h4>
        <button 
          className="btn btn--primary"
          onClick={onStartAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '🔄 Analyzing...' : '🔬 Start Tech Analysis'}
        </button>
      </div>

      <TechnicalRequirementsForm 
        requirements={solution.technicalRequirements || {}}
        onChange={(requirements) => onUpdate({ technicalRequirements: requirements })}
      />

      <FeasibilityMatrix 
        dimensions={[
          'Technical Complexity',
          'Manufacturing Feasibility', 
          'Scalability',
          'Innovation Level',
          'Resource Requirements'
        ]}
        scores={solution.feasibilityScores || {}}
        onScoreChange={(scores) => onUpdate({ feasibilityScores: scores })}
      />

      {analysisResults && (
        <TechnicalAnalysisResults 
          analysis={analysisResults}
          onAcceptRecommendation={(rec) => {/* Apply recommendation */}}
        />
      )}

      <PrototypingPlan 
        plan={solution.prototypePlan || {}}
        onChange={(plan) => onUpdate({ prototypePlan: plan })}
      />
    </div>
  );
};
```

#### Business Model Tab
```typescript
const BusinessModelTab: React.FC<{
  solution: SolutionConcept;
  onUpdate: (updates: Partial<SolutionConcept>) => void;
  onStartAnalysis: () => void;
}> = ({ solution, onUpdate, onStartAnalysis }) => {
  const [businessModel, setBusinessModel] = useState<BusinessModel>(
    solution.businessModel || createDefaultBusinessModel()
  );

  const businessModelTypes = [
    { id: 'product', name: 'Product Sales', description: 'One-time device/product sales' },
    { id: 'service', name: 'Service-Based', description: 'Ongoing service provision' },
    { id: 'subscription', name: 'Subscription/SaaS', description: 'Recurring subscription model' },
    { id: 'rental', name: 'Rental/Leasing', description: 'Equipment rental or leasing' },
    { id: 'platform', name: 'Platform/Marketplace', description: 'Multi-sided platform model' },
    { id: 'hybrid', name: 'Hybrid Model', description: 'Combination of multiple models' }
  ];

  return (
    <div className="business-model-tab">
      <div className="business-model-tab__header">
        <h4>Business Model Development</h4>
        <button 
          className="btn btn--primary"
          onClick={onStartAnalysis}
        >
          📊 Analyze Business Model
        </button>
      </div>

      <BusinessModelTypeSelector 
        types={businessModelTypes}
        selected={businessModel.type}
        onChange={(type) => setBusinessModel({ ...businessModel, type })}
      />

      <BusinessModelCanvas 
        model={businessModel}
        onChange={setBusinessModel}
        template="biomedical"
      />

      <RevenueProjectionTool 
        projections={businessModel.revenueProjections || {}}
        onChange={(projections) => 
          setBusinessModel({ ...businessModel, revenueProjections: projections })
        }
      />

      <MarketAnalysisPanel 
        analysis={businessModel.marketAnalysis || {}}
        onChange={(analysis) => 
          setBusinessModel({ ...businessModel, marketAnalysis: analysis })
        }
      />

      <CompetitorLandscape 
        competitors={businessModel.competitors || []}
        onChange={(competitors) => 
          setBusinessModel({ ...businessModel, competitors })
        }
      />
    </div>
  );
};
```

### 3. Business Model Canvas Component

#### `BusinessModelCanvas.tsx`
```typescript
interface BusinessModelCanvasProps {
  model: BusinessModel;
  onChange: (model: BusinessModel) => void;
  template: 'general' | 'biomedical' | 'saas';
}

const BusinessModelCanvas: React.FC<BusinessModelCanvasProps> = ({
  model,
  onChange,
  template
}) => {
  const canvasBlocks = [
    { id: 'key_partners', title: 'Key Partners', position: 'top-left' },
    { id: 'key_activities', title: 'Key Activities', position: 'top-center-left' },
    { id: 'key_resources', title: 'Key Resources', position: 'top-center-right' },
    { id: 'value_propositions', title: 'Value Propositions', position: 'center' },
    { id: 'customer_relationships', title: 'Customer Relationships', position: 'top-right-left' },
    { id: 'channels', title: 'Channels', position: 'top-right-right' },
    { id: 'customer_segments', title: 'Customer Segments', position: 'top-right' },
    { id: 'cost_structure', title: 'Cost Structure', position: 'bottom-left' },
    { id: 'revenue_streams', title: 'Revenue Streams', position: 'bottom-right' }
  ];

  const biomedicalPrompts = {
    key_partners: 'Hospitals, clinics, distributors, technology partners, regulatory consultants',
    key_activities: 'R&D, clinical trials, regulatory approval, manufacturing, sales & marketing',
    key_resources: 'IP portfolio, clinical data, regulatory approvals, manufacturing capabilities',
    value_propositions: 'Improved patient outcomes, cost reduction, efficiency gains, compliance',
    customer_relationships: 'Personal assistance, training programs, technical support',
    channels: 'Direct sales, distributors, online platform, medical conferences',
    customer_segments: 'Hospitals, clinics, patients, healthcare professionals, payers',
    cost_structure: 'R&D, regulatory, manufacturing, sales & marketing, clinical trials',
    revenue_streams: 'Product sales, licensing, subscriptions, services, maintenance'
  };

  return (
    <div className="business-model-canvas">
      <div className="business-model-canvas__grid">
        {canvasBlocks.map(block => (
          <BusinessModelBlock 
            key={block.id}
            id={block.id}
            title={block.title}
            content={model[block.id] || []}
            position={block.position}
            prompt={biomedicalPrompts[block.id]}
            onChange={(content) => onChange({ ...model, [block.id]: content })}
          />
        ))}
      </div>

      <div className="business-model-canvas__actions">
        <button className="btn btn--outline">
          📤 Export Canvas
        </button>
        <button className="btn btn--outline">
          📋 Use Template
        </button>
        <button className="btn btn--primary">
          🤖 AI Suggestions
        </button>
      </div>
    </div>
  );
};

const BusinessModelBlock: React.FC<{
  id: string;
  title: string;
  content: string[];
  position: string;
  prompt: string;
  onChange: (content: string[]) => void;
}> = ({ id, title, content, position, prompt, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    if (inputValue.trim()) {
      onChange([...content, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    onChange(content.filter((_, i) => i !== index));
  };

  return (
    <div className={`business-model-block business-model-block--${position}`}>
      <div className="business-model-block__header">
        <h5>{title}</h5>
        <button 
          className="btn btn--small btn--outline"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? '✅' : '✏️'}
        </button>
      </div>

      <div className="business-model-block__content">
        {content.map((item, index) => (
          <div key={index} className="business-model-item">
            <span>{item}</span>
            {isEditing && (
              <button 
                className="btn btn--small btn--danger"
                onClick={() => removeItem(index)}
              >
                ❌
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="business-model-block__input">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={prompt}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <button 
              className="btn btn--small btn--primary"
              onClick={addItem}
            >
              ➕
            </button>
          </div>
        )}

        {content.length === 0 && !isEditing && (
          <div className="business-model-block__placeholder">
            <p>{prompt}</p>
            <button 
              className="btn btn--small btn--outline"
              onClick={() => setIsEditing(true)}
            >
              Add Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 4. Solution Evaluation Matrix

#### `SolutionEvaluationMatrix.tsx`
```typescript
interface SolutionEvaluationMatrixProps {
  solutions: SolutionConcept[];
  evaluationCriteria: EvaluationCriterion[];
  onSolutionSelect: (solution: SolutionConcept) => void;
}

const SolutionEvaluationMatrix: React.FC<SolutionEvaluationMatrixProps> = ({
  solutions,
  evaluationCriteria,
  onSolutionSelect
}) => {
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});

  const defaultCriteria = [
    { id: 'technical_feasibility', name: 'Technical Feasibility', weight: 0.25, category: 'technical' },
    { id: 'market_potential', name: 'Market Potential', weight: 0.2, category: 'business' },
    { id: 'innovation_level', name: 'Innovation Level', weight: 0.15, category: 'technical' },
    { id: 'implementation_time', name: 'Time to Market', weight: 0.15, category: 'business' },
    { id: 'resource_requirements', name: 'Resource Requirements', weight: 0.1, category: 'business' },
    { id: 'regulatory_complexity', name: 'Regulatory Complexity', weight: 0.1, category: 'regulatory' },
    { id: 'scalability', name: 'Scalability Potential', weight: 0.05, category: 'business' }
  ];

  return (
    <div className="solution-evaluation-matrix">
      <div className="solution-evaluation-matrix__header">
        <h2>Solution Evaluation Matrix</h2>
        <p>Compare and evaluate solution concepts across multiple criteria</p>
      </div>

      <CriteriaConfiguration 
        criteria={defaultCriteria}
        weights={weights}
        onWeightChange={setWeights}
      />

      <div className="evaluation-table-container">
        <table className="evaluation-table">
          <thead>
            <tr>
              <th className="solution-column">Solution Concept</th>
              {defaultCriteria.map(criterion => (
                <th key={criterion.id} className="criterion-column">
                  <div className="criterion-header">
                    <span>{criterion.name}</span>
                    <span className="weight-badge">
                      {((weights[criterion.id] || criterion.weight) * 100).toFixed(0)}%
                    </span>
                  </div>
                </th>
              ))}
              <th className="score-column">Total Score</th>
              <th className="action-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {solutions.map(solution => (
              <SolutionEvaluationRow 
                key={solution.id}
                solution={solution}
                criteria={defaultCriteria}
                scores={scores[solution.id] || {}}
                weights={weights}
                onScoreChange={(criterionId, score) => {
                  setScores(prev => ({
                    ...prev,
                    [solution.id]: {
                      ...prev[solution.id],
                      [criterionId]: score
                    }
                  }));
                }}
                onSelect={() => onSolutionSelect(solution)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <SolutionRankingChart 
        solutions={solutions}
        scores={scores}
        weights={weights}
        criteria={defaultCriteria}
      />
    </div>
  );
};
```

### 5. Agent Debate for Solution Analysis

#### `SolutionDebateInterface.tsx`
```typescript
interface SolutionDebateInterfaceProps {
  solution: SolutionConcept;
  sessionId: string;
  onDebateComplete: (consensus: SolutionConsensus) => void;
}

const SolutionDebateInterface: React.FC<SolutionDebateInterfaceProps> = ({
  solution,
  sessionId,
  onDebateComplete
}) => {
  const [activeDebate, setActiveDebate] = useState<Debate | null>(null);
  const { agents, messages, consensus } = useRealtimeDebate(sessionId, activeDebate?.id);

  const inventPhaseAgents = [
    { 
      id: 'tech_engineer', 
      name: 'Tech Engineer', 
      focus: 'Technical feasibility and implementation',
      questions: [
        'Is this technically feasible with current technology?',
        'What are the main engineering challenges?',
        'How scalable is this solution?'
      ]
    },
    { 
      id: 'business_analyst', 
      name: 'Business Analyst', 
      focus: 'Market viability and business model',
      questions: [
        'What is the market opportunity size?',
        'Who are the target customers?',
        'What is the revenue potential?'
      ]
    },
    { 
      id: 'medical_expert', 
      name: 'Medical Expert', 
      focus: 'Clinical effectiveness and safety',
      questions: [
        'Does this address the clinical need effectively?',
        'What are the safety considerations?',
        'How will this integrate with clinical workflows?'
      ]
    },
    { 
      id: 'regulatory_expert', 
      name: 'Regulatory Expert', 
      focus: 'Compliance and approval pathway',
      questions: [
        'What regulatory pathway is required?',
        'What are the compliance requirements?',
        'How long will approval take?'
      ]
    }
  ];

  const startSolutionDebate = async () => {
    const debateConfig = {
      topic: `Solution Analysis: ${solution.title}`,
      agents: inventPhaseAgents.map(agent => agent.id),
      context: {
        solution_description: solution.description,
        technical_specs: solution.technicalSpecs,
        business_model: solution.businessModel,
        target_need: solution.targetNeed
      },
      focus_areas: [
        'technical_feasibility',
        'market_viability', 
        'clinical_effectiveness',
        'regulatory_requirements'
      ],
      max_rounds: 6
    };

    try {
      const debate = await debateService.startDebate(sessionId, debateConfig);
      setActiveDebate(debate);
    } catch (error) {
      console.error('Failed to start solution debate:', error);
    }
  };

  return (
    <div className="solution-debate-interface">
      <div className="solution-debate-interface__header">
        <h3>Multi-Agent Solution Analysis</h3>
        <SolutionSummaryCard solution={solution} />
      </div>

      {!activeDebate ? (
        <DebateStarter 
          agents={inventPhaseAgents}
          onStart={startSolutionDebate}
          expectedOutcomes={[
            'Technical feasibility assessment',
            'Market opportunity validation',
            'Clinical effectiveness evaluation',
            'Regulatory pathway clarity'
          ]}
        />
      ) : (
        <>
          <AgentPerspectivePanel 
            agents={agents}
            currentSpeaker={messages[messages.length - 1]?.agentId}
            focusAreas={inventPhaseAgents.map(a => ({ id: a.id, focus: a.focus }))}
          />

          <SolutionDebateMessages 
            messages={messages}
            agents={agents}
            solution={solution}
            highlightTerms={['feasible', 'market', 'clinical', 'regulatory', 'risk']}
          />

          <SolutionConsensusTracker 
            consensus={consensus}
            aspects={[
              'Technical Feasibility',
              'Market Viability',
              'Clinical Value',
              'Regulatory Clarity',
              'Overall Recommendation'
            ]}
            onConsensusReached={onDebateComplete}
          />

          <UserSolutionInput 
            onAskQuestion={(question) => {/* Send to agents */}}
            onProvideContext={(context) => {/* Add context */}}
            onRequestAnalysis={(aspect) => {/* Request specific analysis */}}
          />
        </>
      )}
    </div>
  );
};
```

## 🎨 Visual Design Specifications

### Color Scheme (INVENT Phase)
```css
/* Primary INVENT colors */
--invent-primary: #059669;      /* Emerald 600 */
--invent-light: #D1FAE5;        /* Emerald 100 */
--invent-dark: #047857;         /* Emerald 700 */
--invent-accent: #10B981;       /* Emerald 500 */

/* Solution category colors */
--solution-device: #DC2626;     /* Red 600 */
--solution-software: #2563EB;   /* Blue 600 */
--solution-service: #7C3AED;    /* Violet 600 */
--solution-system: #D97706;     /* Amber 600 */
--solution-hybrid: #059669;     /* Emerald 600 */
```

### Component Styling
```css
.invent-phase {
  background: linear-gradient(135deg, var(--invent-light) 0%, #F0FDF4 100%);
  min-height: 100vh;
  padding: 2rem;
}

.solution-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--invent-primary);
  transition: all 0.2s ease;
  overflow: hidden;
}

.solution-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.business-model-canvas {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.business-model-block {
  background: var(--gray-50);
  border: 2px dashed var(--gray-300);
  border-radius: 0.5rem;
  padding: 1rem;
  min-height: 200px;
  transition: all 0.2s ease;
}

.business-model-block:hover {
  border-color: var(--invent-primary);
  background: var(--invent-light);
}

.evaluation-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.evaluation-table th,
.evaluation-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.evaluation-table th {
  background: var(--invent-light);
  font-weight: 600;
  color: var(--invent-dark);
}
```

## 📱 Responsive Behavior

### Mobile Adaptations
- **Collapsible Panels**: Solution studio and development panel stack vertically
- **Touch-Optimized Canvas**: Larger touch targets for business model canvas
- **Simplified Evaluation**: Condensed evaluation matrix with expandable rows
- **Gesture Support**: Swipe between solution concepts

### Tablet Optimizations
- **Split View**: Ideation canvas and development panel side-by-side
- **Touch-Friendly Editing**: Optimized input fields and drawing tools
- **Expanded Agent Panel**: Larger agent debate interface

## 🔄 State Management

### Phase State Structure
```typescript
interface InventPhaseState {
  // Solution ideation
  solutionConcepts: SolutionConcept[];
  activeIdeationMode: 'freeform' | 'structured' | 'ai_assisted';
  currentConcept: Partial<SolutionConcept>;

  // Solution development
  selectedSolution: SolutionConcept | null;
  technicalAnalysis: TechnicalAnalysis[];
  businessModels: BusinessModel[];

  // Evaluation
  evaluationScores: Record<string, Record<string, number>>;
  evaluationWeights: Record<string, number>;
  solutionRankings: SolutionRanking[];

  // Debate state
  activeSolutionDebates: Debate[];
  debateConsensus: Record<string, SolutionConsensus>;

  // Phase completion
  selectedSolutionForImplement: string | null;
  canProceedToImplement: boolean;
  completionChecklist: ChecklistItem[];
}
```

---

*This INVENT phase interface design provides comprehensive tools for solution ideation, development, and evaluation, enabling teams to systematically create and refine innovative medical solutions.*
