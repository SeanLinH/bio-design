# Phase 1: IDENTIFY Interface

## Need Discovery & Problem Definition UI

This document details the frontend interface design for Phase 1 of the Bio-Design Innovation Platform, focusing on the IDENTIFY phase where teams discover and define unmet medical needs through systematic analysis and multi-agent collaboration.

## 🎯 Phase Overview

### Design Thinking: Divergent Discovery
The IDENTIFY phase interface supports **divergent thinking** by providing multiple pathways for exploration:
- Open-ended research material upload
- Multi-perspective agent analysis 
- Evidence-based need validation
- Collaborative prioritization

### Key Objectives
1. **Comprehensive Need Discovery**: Surface unmet medical needs from multiple sources
2. **Evidence-Based Validation**: Ensure needs are backed by clinical and market evidence
3. **Stakeholder Perspective Integration**: Consider medical, business, regulatory, and patient viewpoints
4. **Strategic Prioritization**: Select most promising needs for development

## 🖼️ Interface Layout

### Main Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: IDENTIFY - Need Discovery & Problem Definition         │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │
│ │   Main Content      │ │        Agent Panel                  │ │
│ │                     │ │                                     │ │
│ │ • Upload Zone       │ │ • Active Debate                     │ │
│ │ • Need Discovery    │ │ • Agent Status                      │ │
│ │ • Analysis Results  │ │ • Evidence Sources                  │ │
│ │ • Prioritization    │ │ • Consensus Tracking                │ │
│ │                     │ │                                     │ │
│ └─────────────────────┘ └─────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Progress: Discovery (40%) | Analysis (30%) | Prioritization (30%)│
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Core Components

### 1. Document Upload Interface

#### `IdentifyUploadZone.tsx`
```typescript
interface IdentifyUploadZoneProps {
  onUpload: (files: File[], categories: string[]) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

const IdentifyUploadZone: React.FC<IdentifyUploadZoneProps> = ({
  onUpload,
  isUploading,
  uploadProgress
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const contentCategories = [
    { id: 'clinical_research', label: 'Clinical Research', icon: '🔬' },
    { id: 'market_analysis', label: 'Market Analysis', icon: '📊' },
    { id: 'user_interviews', label: 'User Interviews', icon: '🎤' },
    { id: 'regulatory_docs', label: 'Regulatory Documents', icon: '📋' },
    { id: 'competitor_analysis', label: 'Competitor Analysis', icon: '🏢' },
    { id: 'medical_images', label: 'Medical Images', icon: '🩻' },
    { id: 'patient_journeys', label: 'Patient Journeys', icon: '🗺️' }
  ];

  return (
    <div className="identify-upload-zone">
      <div className="identify-upload-zone__header">
        <h2>Research Material Upload</h2>
        <p>Upload documents, images, and data to discover unmet medical needs</p>
      </div>

      <ContentCategorySelector 
        categories={contentCategories}
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />

      <MultimodalDropZone 
        onDrop={(files) => onUpload(files, selectedCategories)}
        isUploading={isUploading}
        progress={uploadProgress}
        acceptedTypes={[
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/tiff',
          'application/dicom',
          'text/csv',
          'application/vnd.ms-excel'
        ]}
        maxSize={100 * 1024 * 1024} // 100MB
      />

      <UploadedContentLibrary 
        documents={uploadedDocuments}
        onPreview={(doc) => setPreviewDocument(doc)}
        onDelete={(docId) => handleDeleteDocument(docId)}
      />
    </div>
  );
};
```

#### Upload Categories Interface
```typescript
const ContentCategorySelector: React.FC<{
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
}> = ({ categories, selected, onChange }) => {
  return (
    <div className="content-category-selector">
      <h3>Content Type (helps AI agents focus analysis)</h3>
      <div className="category-grid">
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={selected.includes(category.id)}
            onToggle={(id) => {
              const newSelected = selected.includes(id)
                ? selected.filter(s => s !== id)
                : [...selected, id];
              onChange(newSelected);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const CategoryCard: React.FC<{
  category: Category;
  isSelected: boolean;
  onToggle: (id: string) => void;
}> = ({ category, isSelected, onToggle }) => {
  return (
    <div 
      className={`category-card ${isSelected ? 'category-card--selected' : ''}`}
      onClick={() => onToggle(category.id)}
    >
      <div className="category-card__icon">{category.icon}</div>
      <div className="category-card__label">{category.label}</div>
    </div>
  );
};
```

### 2. Need Discovery Interface

#### `NeedDiscoveryDashboard.tsx`
```typescript
interface NeedDiscoveryDashboardProps {
  sessionId: string;
  discoveredNeeds: Need[];
  isAnalyzing: boolean;
  onStartAnalysis: () => void;
  onNeedSelect: (need: Need) => void;
}

const NeedDiscoveryDashboard: React.FC<NeedDiscoveryDashboardProps> = ({
  sessionId,
  discoveredNeeds,
  isAnalyzing,
  onStartAnalysis,
  onNeedSelect
}) => {
  const [filterCriteria, setFilterCriteria] = useState<NeedFilter>({});
  const [sortBy, setSortBy] = useState<'importance' | 'feasibility' | 'market_size'>('importance');

  return (
    <div className="need-discovery-dashboard">
      <div className="need-discovery-dashboard__header">
        <h2>Discovered Medical Needs</h2>
        <div className="need-discovery-dashboard__actions">
          <StartAnalysisButton 
            onClick={onStartAnalysis}
            isAnalyzing={isAnalyzing}
            hasDocuments={discoveredNeeds.length > 0}
          />
          <ExportNeedsButton 
            needs={discoveredNeeds}
            formats={['pdf', 'excel', 'json']}
          />
        </div>
      </div>

      <NeedFilterPanel 
        criteria={filterCriteria}
        onChange={setFilterCriteria}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {isAnalyzing ? (
        <AnalysisProgress sessionId={sessionId} />
      ) : (
        <NeedGrid 
          needs={discoveredNeeds}
          onNeedSelect={onNeedSelect}
          sortBy={sortBy}
          filters={filterCriteria}
        />
      )}
    </div>
  );
};
```

#### Need Card Component
```typescript
const NeedCard: React.FC<{
  need: Need;
  onSelect: (need: Need) => void;
  onStartDebate: (need: Need) => void;
}> = ({ need, onSelect, onStartDebate }) => {
  return (
    <div className="need-card" onClick={() => onSelect(need)}>
      <div className="need-card__header">
        <h3 className="need-card__title">{need.title}</h3>
        <NeedCategoryBadge category={need.category} />
      </div>

      <div className="need-card__description">
        {need.description}
      </div>

      <div className="need-card__metrics">
        <MetricBadge 
          label="Market Size" 
          value={need.metrics.marketSize} 
          format="currency"
        />
        <MetricBadge 
          label="Affected Population" 
          value={need.metrics.affectedPopulation} 
          format="number"
        />
        <MetricBadge 
          label="Urgency Score" 
          value={need.metrics.urgencyScore} 
          format="score"
          max={10}
        />
      </div>

      <div className="need-card__evidence">
        <EvidenceStrength 
          level={need.evidenceLevel}
          sources={need.sources.length}
        />
        <SourcePreview sources={need.sources.slice(0, 3)} />
      </div>

      <div className="need-card__actions">
        <button 
          className="btn btn--outline btn--small"
          onClick={(e) => {
            e.stopPropagation();
            onStartDebate(need);
          }}
        >
          🤖 Start Agent Debate
        </button>
        <button className="btn btn--primary btn--small">
          View Details
        </button>
      </div>

      <div className="need-card__footer">
        <div className="need-card__timestamp">
          Discovered: {formatDate(need.discoveredAt)}
        </div>
        <div className="need-card__confidence">
          Confidence: {(need.confidence * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
};
```

### 3. Agent Debate Interface for Need Analysis

#### `IdentifyDebatePanel.tsx`
```typescript
interface IdentifyDebatePanelProps {
  sessionId: string;
  selectedNeed: Need | null;
  onNeedValidated: (need: Need, validation: NeedValidation) => void;
}

const IdentifyDebatePanel: React.FC<IdentifyDebatePanelProps> = ({
  sessionId,
  selectedNeed,
  onNeedValidated
}) => {
  const [activeDebate, setActiveDebate] = useState<Debate | null>(null);
  const { agents, messages, consensus } = useRealtimeDebate(sessionId, activeDebate?.id);

  const identifyAgentRoles = [
    { id: 'medical_expert', name: 'Medical Expert', focus: 'Clinical validation and safety' },
    { id: 'business_analyst', name: 'Business Analyst', focus: 'Market opportunity and viability' },
    { id: 'patient_advocate', name: 'Patient Advocate', focus: 'Patient needs and accessibility' },
    { id: 'regulatory_expert', name: 'Regulatory Expert', focus: 'Compliance and approval pathways' },
    { id: 'devils_advocate', name: "Devil's Advocate", focus: 'Challenge assumptions and risks' }
  ];

  const startNeedAnalysisDebate = async (need: Need) => {
    const debateConfig = {
      topic: `Analysis of medical need: ${need.title}`,
      agents: identifyAgentRoles.map(role => role.id),
      focus_areas: [
        'clinical_evidence',
        'market_validation',
        'patient_impact',
        'regulatory_feasibility',
        'risk_assessment'
      ],
      max_rounds: 5
    };

    try {
      const debate = await debateService.startDebate(sessionId, debateConfig);
      setActiveDebate(debate);
    } catch (error) {
      console.error('Failed to start debate:', error);
    }
  };

  return (
    <div className="identify-debate-panel">
      <div className="identify-debate-panel__header">
        {selectedNeed ? (
          <>
            <h3>Need Analysis: {selectedNeed.title}</h3>
            <button 
              className="btn btn--primary"
              onClick={() => startNeedAnalysisDebate(selectedNeed)}
              disabled={!!activeDebate}
            >
              🎯 Analyze This Need
            </button>
          </>
        ) : (
          <div className="identify-debate-panel__placeholder">
            <p>Select a need to start multi-agent analysis</p>
          </div>
        )}
      </div>

      {activeDebate && (
        <>
          <AgentStatusBar 
            agents={agents}
            showExpertise={true}
            focusAreas={identifyAgentRoles}
          />

          <DebateMessagesPanel 
            messages={messages}
            agents={agents}
            highlightTopics={['evidence', 'market', 'patient', 'regulatory', 'risk']}
          />

          <ConsensusTracker 
            consensus={consensus}
            topics={[
              'Clinical Significance',
              'Market Opportunity', 
              'Patient Impact',
              'Regulatory Feasibility',
              'Overall Priority'
            ]}
          />

          <UserInteractionPanel 
            onAskQuestion={(question) => {/* Send to agents */}}
            onRequestEvidence={(topic) => {/* Request specific evidence */}}
            onChallenge={(argument) => {/* Challenge specific argument */}}
          />
        </>
      )}
    </div>
  );
};
```

### 4. Need Prioritization Matrix

#### `NeedPrioritizationMatrix.tsx`
```typescript
interface NeedPrioritizationMatrixProps {
  needs: Need[];
  onPrioritize: (rankings: NeedRanking[]) => void;
  criteria: PrioritizationCriteria[];
}

const NeedPrioritizationMatrix: React.FC<NeedPrioritizationMatrixProps> = ({
  needs,
  onPrioritize,
  criteria
}) => {
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});

  const defaultCriteria = [
    { id: 'market_size', name: 'Market Size', weight: 0.25 },
    { id: 'patient_impact', name: 'Patient Impact', weight: 0.3 },
    { id: 'technical_feasibility', name: 'Technical Feasibility', weight: 0.2 },
    { id: 'regulatory_path', name: 'Regulatory Clarity', weight: 0.15 },
    { id: 'competitive_advantage', name: 'Competitive Advantage', weight: 0.1 }
  ];

  const calculateCompositeScore = (needId: string): number => {
    return defaultCriteria.reduce((total, criterion) => {
      const score = scores[needId]?.[criterion.id] || 0;
      const weight = weights[criterion.id] || criterion.weight;
      return total + (score * weight);
    }, 0);
  };

  return (
    <div className="need-prioritization-matrix">
      <div className="need-prioritization-matrix__header">
        <h2>Need Prioritization Matrix</h2>
        <p>Score each need across multiple criteria to identify top priorities</p>
      </div>

      <CriteriaWeightAdjuster 
        criteria={defaultCriteria}
        weights={weights}
        onChange={setWeights}
      />

      <div className="prioritization-table">
        <table>
          <thead>
            <tr>
              <th>Medical Need</th>
              {defaultCriteria.map(criterion => (
                <th key={criterion.id}>
                  {criterion.name}
                  <span className="weight-indicator">
                    ({((weights[criterion.id] || criterion.weight) * 100).toFixed(0)}%)
                  </span>
                </th>
              ))}
              <th>Composite Score</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {needs.map(need => (
              <NeedScoreRow 
                key={need.id}
                need={need}
                criteria={defaultCriteria}
                scores={scores[need.id] || {}}
                onScoreChange={(criterionId, score) => {
                  setScores(prev => ({
                    ...prev,
                    [need.id]: {
                      ...prev[need.id],
                      [criterionId]: score
                    }
                  }));
                }}
                compositeScore={calculateCompositeScore(need.id)}
                rank={calculateRank(need.id, needs, scores, weights)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <PrioritizationActions 
        needs={needs}
        scores={scores}
        onExport={() => exportPrioritizationResults(needs, scores, weights)}
        onSubmit={() => {
          const rankings = generateRankings(needs, scores, weights);
          onPrioritize(rankings);
        }}
      />
    </div>
  );
};
```

#### Need Score Row Component
```typescript
const NeedScoreRow: React.FC<{
  need: Need;
  criteria: PrioritizationCriteria[];
  scores: Record<string, number>;
  onScoreChange: (criterionId: string, score: number) => void;
  compositeScore: number;
  rank: number;
}> = ({ need, criteria, scores, onScoreChange, compositeScore, rank }) => {
  return (
    <tr className="need-score-row">
      <td className="need-score-row__need">
        <div className="need-summary">
          <h4>{need.title}</h4>
          <p>{need.description.substring(0, 100)}...</p>
        </div>
      </td>
      
      {criteria.map(criterion => (
        <td key={criterion.id} className="need-score-row__score">
          <ScoreSlider 
            value={scores[criterion.id] || 0}
            onChange={(score) => onScoreChange(criterion.id, score)}
            min={0}
            max={10}
            step={0.5}
            showValue={true}
          />
        </td>
      ))}
      
      <td className="need-score-row__composite">
        <div className="composite-score">
          <div className="score-value">{compositeScore.toFixed(1)}</div>
          <div className="score-bar">
            <div 
              className="score-fill"
              style={{ width: `${(compositeScore / 10) * 100}%` }}
            />
          </div>
        </div>
      </td>
      
      <td className="need-score-row__rank">
        <div className={`rank-badge rank-badge--${rank <= 3 ? 'top' : rank <= 6 ? 'mid' : 'low'}`}>
          #{rank}
        </div>
      </td>
    </tr>
  );
};
```

### 5. Phase Completion Interface

#### `IdentifyPhaseCompletion.tsx`
```typescript
interface IdentifyPhaseCompletionProps {
  sessionId: string;
  prioritizedNeeds: NeedRanking[];
  onProceedToInvent: (selectedNeeds: string[]) => void;
}

const IdentifyPhaseCompletion: React.FC<IdentifyPhaseCompletionProps> = ({
  sessionId,
  prioritizedNeeds,
  onProceedToInvent
}) => {
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [completionChecklist, setCompletionChecklist] = useState<ChecklistItem[]>([]);

  const phaseCompletionCriteria = [
    { id: 'needs_discovered', label: 'At least 5 needs discovered', required: true },
    { id: 'evidence_validated', label: 'Evidence validated by Medical Expert', required: true },
    { id: 'market_analyzed', label: 'Market opportunity assessed', required: true },
    { id: 'prioritization_complete', label: 'Prioritization matrix completed', required: true },
    { id: 'top_needs_selected', label: 'Top 1-3 needs selected for development', required: true }
  ];

  return (
    <div className="identify-phase-completion">
      <div className="identify-phase-completion__header">
        <h2>Phase 1 Completion Review</h2>
        <p>Review discovered needs and select the most promising opportunities for solution development</p>
      </div>

      <CompletionChecklist 
        criteria={phaseCompletionCriteria}
        sessionData={{
          needsCount: prioritizedNeeds.length,
          evidenceValidated: true, // From agent consensus
          marketAnalyzed: true,    // From business agent analysis
          prioritizationComplete: prioritizedNeeds.length > 0,
          selectedNeeds: selectedNeeds.length > 0
        }}
      />

      <NeedSelectionPanel 
        prioritizedNeeds={prioritizedNeeds}
        selectedNeeds={selectedNeeds}
        onSelectionChange={setSelectedNeeds}
        maxSelection={3}
      />

      <PhaseTransitionSummary 
        phase="identify"
        nextPhase="invent"
        selectedItems={selectedNeeds}
        onProceed={() => onProceedToInvent(selectedNeeds)}
        canProceed={selectedNeeds.length > 0 && selectedNeeds.length <= 3}
      />
    </div>
  );
};
```

## 🎨 Visual Design Specifications

### Color Scheme (IDENTIFY Phase)
```css
/* Primary IDENTIFY colors */
--identify-primary: #2563EB;    /* Blue 600 */
--identify-light: #DBEAFE;      /* Blue 100 */
--identify-dark: #1D4ED8;       /* Blue 700 */
--identify-accent: #3B82F6;     /* Blue 500 */

/* Need category colors */
--need-clinical: #DC2626;       /* Red 600 */
--need-technical: #059669;      /* Emerald 600 */
--need-market: #D97706;         /* Amber 600 */
--need-regulatory: #7C3AED;     /* Violet 600 */
--need-patient: #0891B2;        /* Cyan 600 */
```

### Component Styling
```css
.identify-phase {
  background: linear-gradient(135deg, var(--identify-light) 0%, #F9FAFB 100%);
  min-height: 100vh;
  padding: 2rem;
}

.need-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--identify-primary);
  transition: all 0.2s ease;
}

.need-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.prioritization-table {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.composite-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.score-bar {
  width: 60px;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--identify-primary), var(--identify-dark));
  transition: width 0.3s ease;
}
```

## 📱 Responsive Behavior

### Mobile Adaptations
- **Stacked Layout**: Sidebar content moves below main content
- **Touch-Optimized Scoring**: Larger touch targets for prioritization sliders
- **Simplified Need Cards**: Condensed information display
- **Swipe Navigation**: Swipe between needs and analysis screens

### Tablet Optimizations
- **Split View**: Main content and agent panel side-by-side
- **Touch-Friendly Debates**: Larger agent avatars and message bubbles
- **Drag-and-Drop Prioritization**: Touch-based need ranking interface

## 🔄 State Management

### Phase State Structure
```typescript
interface IdentifyPhaseState {
  // Upload state
  uploadedDocuments: Document[];
  isUploading: boolean;
  uploadProgress: number;

  // Discovery state
  discoveredNeeds: Need[];
  isAnalyzing: boolean;
  analysisProgress: number;

  // Debate state
  activeDebates: Debate[];
  selectedNeed: Need | null;
  debateHistory: DebateMessage[];

  // Prioritization state
  prioritizationScores: Record<string, Record<string, number>>;
  criteriaWeights: Record<string, number>;
  prioritizedNeeds: NeedRanking[];

  // Phase completion
  completionChecklist: ChecklistItem[];
  selectedNeedsForInvent: string[];
  canProceedToInvent: boolean;
}
```

---

*This IDENTIFY phase interface design provides comprehensive tools for medical need discovery, validation, and prioritization, setting the foundation for successful solution development in subsequent phases.*
