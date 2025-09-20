# Multi-Agent Debate Interface

## Real-time AI Agent Collaboration UI

This document details the frontend interface design for the multi-agent debate system, which provides real-time visualization and interaction capabilities for observing and participating in AI agent discussions across all phases of the Bio-Design Innovation Platform.

## 🎯 Interface Overview

### Multi-Agent Ecosystem
The debate interface supports collaboration between 7 specialized AI agents:
- **Medical Expert**: Clinical evidence and safety analysis
- **Tech Engineer**: Technical feasibility and implementation
- **Business Analyst**: Market opportunity and business modeling
- **Regulatory Affairs**: Compliance and approval pathways
- **Ethicist**: Ethical considerations and responsible innovation
- **Patient Advocate**: Patient needs and accessibility
- **Devil's Advocate**: Challenge assumptions and identify risks

### Key Objectives
1. **Real-time Debate Visualization**: Live observation of agent discussions
2. **Evidence Tracking**: Source citation and argument validation
3. **Consensus Building**: Track agreement levels and synthesis
4. **User Participation**: Enable human input and guidance
5. **Knowledge Capture**: Record and export debate insights

## 🖼️ Interface Layout

### Main Debate Interface Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ Debate Topic: "Diabetes Detection Device Market Validation"     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │
│ │   Agent Panel       │ │        Message Stream               │ │
│ │                     │ │                                     │ │
│ │ • Agent Status      │ │ • Real-time Messages                │ │
│ │ • Expertise Areas   │ │ • Evidence Citations                │ │
│ │ • Activity Tracking │ │ • Argument Threading                │ │
│ │ • Speaking Queue    │ │ • User Interactions                 │ │
│ │                     │ │                                     │ │
│ └─────────────────────┘ └─────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │
│ │  Consensus Tracker  │ │       User Input Panel              │ │
│ │                     │ │                                     │ │
│ │ • Agreement Levels  │ │ • Ask Questions                     │ │
│ │ • Topic Progress    │ │ • Provide Context                   │ │
│ │ • Synthesis Summary │ │ • Challenge Arguments               │ │
│ │                     │ │ • Guide Discussion                  │ │
│ └─────────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Core Components

### 1. Agent Status Panel

#### `AgentStatusPanel.tsx`
```typescript
interface AgentStatusPanelProps {
  agents: Agent[];
  currentSpeaker?: string;
  speakingQueue: string[];
  onAgentSelect: (agentId: string) => void;
  showExpertise?: boolean;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  agents,
  currentSpeaker,
  speakingQueue,
  onAgentSelect,
  showExpertise = true
}) => {
  return (
    <div className="agent-status-panel">
      <div className="agent-status-panel__header">
        <h3>AI Agents ({agents.filter(a => a.status === 'online').length} active)</h3>
        <DebateControlButtons />
      </div>

      <div className="agent-grid">
        {agents.map(agent => (
          <AgentCard 
            key={agent.id}
            agent={agent}
            isCurrentSpeaker={currentSpeaker === agent.id}
            isInQueue={speakingQueue.includes(agent.id)}
            queuePosition={speakingQueue.indexOf(agent.id) + 1}
            onClick={() => onAgentSelect(agent.id)}
            showExpertise={showExpertise}
          />
        ))}
      </div>

      {speakingQueue.length > 0 && (
        <SpeakingQueue 
          queue={speakingQueue}
          agents={agents}
          currentSpeaker={currentSpeaker}
        />
      )}
    </div>
  );
};
```

#### Agent Card Component
```typescript
const AgentCard: React.FC<{
  agent: Agent;
  isCurrentSpeaker: boolean;
  isInQueue: boolean;
  queuePosition?: number;
  onClick: () => void;
  showExpertise: boolean;
}> = ({ 
  agent, 
  isCurrentSpeaker, 
  isInQueue, 
  queuePosition, 
  onClick, 
  showExpertise 
}) => {
  const getAgentColor = (role: string) => {
    const colors = {
      medical_expert: '#DC2626',
      tech_engineer: '#2563EB', 
      business_analyst: '#059669',
      regulatory_expert: '#7C3AED',
      ethicist: '#BE185D',
      patient_advocate: '#0891B2',
      devils_advocate: '#374151'
    };
    return colors[role] || '#6B7280';
  };

  return (
    <div 
      className={cn('agent-card', {
        'agent-card--active': isCurrentSpeaker,
        'agent-card--queued': isInQueue,
        'agent-card--online': agent.status === 'online',
        'agent-card--thinking': agent.activity === 'thinking',
        'agent-card--researching': agent.activity === 'researching'
      })}
      onClick={onClick}
      style={{ '--agent-color': getAgentColor(agent.role) } as CSSProperties}
    >
      <div className="agent-card__avatar">
        <AgentAvatar 
          role={agent.role}
          status={agent.status}
          activity={agent.activity}
        />
        {isCurrentSpeaker && (
          <div className="speaking-indicator">
            <SpeakingAnimation />
          </div>
        )}
        {isInQueue && queuePosition && (
          <div className="queue-badge">{queuePosition}</div>
        )}
      </div>

      <div className="agent-card__info">
        <h4 className="agent-card__name">{agent.name}</h4>
        <p className="agent-card__role">{agent.role.replace('_', ' ')}</p>
        
        {showExpertise && (
          <div className="agent-card__expertise">
            {agent.expertise.slice(0, 2).map(skill => (
              <span key={skill} className="expertise-tag">
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="agent-card__metrics">
          <ConfidenceIndicator level={agent.currentConfidence} />
          <MessageCount count={agent.messageCount} />
        </div>
      </div>

      <div className="agent-card__status">
        <StatusIndicator 
          status={agent.status}
          activity={agent.activity}
          lastActive={agent.lastActive}
        />
      </div>
    </div>
  );
};
```

### 2. Real-time Message Stream

#### `DebateMessageStream.tsx`
```typescript
interface DebateMessageStreamProps {
  messages: DebateMessage[];
  agents: Agent[];
  highlightTopics?: string[];
  onCiteSource: (sourceId: string) => void;
  onChallengeArgument: (messageId: string) => void;
  onRequestElaboration: (messageId: string) => void;
}

const DebateMessageStream: React.FC<DebateMessageStreamProps> = ({
  messages,
  agents,
  highlightTopics = [],
  onCiteSource,
  onChallengeArgument,
  onRequestElaboration
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleScroll = (e: React.UIEvent) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="debate-message-stream">
      <div className="debate-message-stream__header">
        <h3>Debate Discussion</h3>
        <div className="stream-controls">
          <button 
            className={cn('btn btn--small', { 'btn--primary': autoScroll })}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            {autoScroll ? '📍 Auto-scroll On' : '📍 Auto-scroll Off'}
          </button>
          <ExportDebateButton messages={messages} />
        </div>
      </div>

      <div 
        className="message-container"
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <DebateMessage 
            key={message.id}
            message={message}
            agent={agents.find(a => a.id === message.agentId)!}
            previousMessage={messages[index - 1]}
            highlightTopics={highlightTopics}
            onCiteSource={onCiteSource}
            onChallenge={() => onChallengeArgument(message.id)}
            onRequestElaboration={() => onRequestElaboration(message.id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && (
        <div className="message-container__empty">
          <p>Debate will begin once agents are ready...</p>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};
```

#### Individual Debate Message Component
```typescript
const DebateMessage: React.FC<{
  message: DebateMessage;
  agent: Agent;
  previousMessage?: DebateMessage;
  highlightTopics: string[];
  onCiteSource: (sourceId: string) => void;
  onChallenge: () => void;
  onRequestElaboration: () => void;
}> = ({ 
  message, 
  agent, 
  previousMessage, 
  highlightTopics,
  onCiteSource,
  onChallenge,
  onRequestElaboration 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const isNewSpeaker = !previousMessage || previousMessage.agentId !== message.agentId;
  const messageTime = new Date(message.timestamp);

  return (
    <div className={cn('debate-message', {
      'debate-message--new-speaker': isNewSpeaker,
      'debate-message--streaming': message.isStreaming,
      'debate-message--user': message.sender === 'user'
    })}>
      {isNewSpeaker && (
        <div className="debate-message__agent-header">
          <AgentAvatar role={agent.role} size="small" />
          <div className="agent-info">
            <span className="agent-name">{agent.name}</span>
            <span className="agent-role">{agent.role.replace('_', ' ')}</span>
          </div>
          <div className="message-timestamp">
            {messageTime.toLocaleTimeString()}
          </div>
        </div>
      )}

      <div className="debate-message__content">
        <MessageContent 
          content={message.content}
          highlightTopics={highlightTopics}
          isStreaming={message.isStreaming}
        />

        {message.sources.length > 0 && (
          <SourceCitations 
            sources={message.sources}
            expanded={showSources}
            onToggle={() => setShowSources(!showSources)}
            onCiteSource={onCiteSource}
          />
        )}

        {message.relatedTopics.length > 0 && (
          <TopicTags 
            topics={message.relatedTopics}
            highlightTopics={highlightTopics}
          />
        )}
      </div>

      <div className="debate-message__metadata">
        <ConfidenceIndicator 
          level={message.confidence}
          tooltip="Agent confidence in this statement"
        />
        
        <ArgumentStrength 
          strength={message.argumentStrength}
          evidence={message.sources.length}
        />

        {message.contradictions.length > 0 && (
          <ContradictionIndicator 
            contradictions={message.contradictions}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        )}
      </div>

      <div className="debate-message__actions">
        <button 
          className="btn btn--small btn--outline"
          onClick={onChallenge}
          title="Challenge this argument"
        >
          ⚡ Challenge
        </button>
        
        <button 
          className="btn btn--small btn--outline"
          onClick={onRequestElaboration}
          title="Request more details"
        >
          🔍 Elaborate
        </button>
        
        <button 
          className="btn btn--small btn--outline"
          onClick={() => setIsExpanded(!isExpanded)}
          title="View argument details"
        >
          {isExpanded ? '📄 Collapse' : '📄 Expand'}
        </button>
      </div>

      {isExpanded && (
        <MessageDetails 
          message={message}
          agent={agent}
          onCiteSource={onCiteSource}
        />
      )}
    </div>
  );
};
```

### 3. Consensus Tracking Dashboard

#### `ConsensusTracker.tsx`
```typescript
interface ConsensusTrackerProps {
  consensus: ConsensusMetrics;
  topics: string[];
  agents: Agent[];
  onTopicSelect: (topic: string) => void;
}

const ConsensusTracker: React.FC<ConsensusTrackerProps> = ({
  consensus,
  topics,
  agents,
  onTopicSelect
}) => {
  return (
    <div className="consensus-tracker">
      <div className="consensus-tracker__header">
        <h3>Consensus Building</h3>
        <OverallConsensusScore score={consensus.overallScore} />
      </div>

      <div className="consensus-topics">
        {topics.map(topic => {
          const topicConsensus = consensus.byTopic[topic] || { 
            agreement: 0, 
            participants: [], 
            confidence: 0 
          };
          
          return (
            <ConsensusTopicCard 
              key={topic}
              topic={topic}
              consensus={topicConsensus}
              agents={agents}
              onClick={() => onTopicSelect(topic)}
            />
          );
        })}
      </div>

      <ConsensusEvolution 
        history={consensus.history}
        topics={topics}
      />

      <AgentAgreementMatrix 
        agents={agents}
        agreements={consensus.agentAgreements}
      />
    </div>
  );
};

const ConsensusTopicCard: React.FC<{
  topic: string;
  consensus: TopicConsensus;
  agents: Agent[];
  onClick: () => void;
}> = ({ topic, consensus, agents, onClick }) => {
  const getConsensusLevel = (score: number) => {
    if (score >= 0.8) return { level: 'high', color: '#10B981', label: 'Strong Agreement' };
    if (score >= 0.6) return { level: 'medium', color: '#F59E0B', label: 'Partial Agreement' };
    if (score >= 0.4) return { level: 'low', color: '#EF4444', label: 'Some Disagreement' };
    return { level: 'none', color: '#6B7280', label: 'No Consensus' };
  };

  const consensusLevel = getConsensusLevel(consensus.agreement);

  return (
    <div 
      className="consensus-topic-card"
      onClick={onClick}
      style={{ '--consensus-color': consensusLevel.color } as CSSProperties}
    >
      <div className="consensus-topic-card__header">
        <h4>{topic}</h4>
        <div className="consensus-score">
          {(consensus.agreement * 100).toFixed(0)}%
        </div>
      </div>

      <div className="consensus-progress">
        <div 
          className="consensus-fill"
          style={{ width: `${consensus.agreement * 100}%` }}
        />
      </div>

      <div className="consensus-topic-card__details">
        <span className="consensus-level">{consensusLevel.label}</span>
        <span className="participant-count">
          {consensus.participants.length}/{agents.length} agents
        </span>
      </div>

      <div className="agent-positions">
        {agents.map(agent => {
          const position = consensus.agentPositions?.[agent.id];
          return (
            <AgentPositionIndicator 
              key={agent.id}
              agent={agent}
              position={position}
            />
          );
        })}
      </div>
    </div>
  );
};
```

### 4. User Interaction Panel

#### `UserInteractionPanel.tsx`
```typescript
interface UserInteractionPanelProps {
  onAskQuestion: (question: string, targetAgent?: string) => void;
  onProvideContext: (context: string, contextType: string) => void;
  onChallengeArgument: (messageId: string, challenge: string) => void;
  onGuideDiscussion: (direction: string, focus: string) => void;
  agents: Agent[];
  availableContextTypes: string[];
}

const UserInteractionPanel: React.FC<UserInteractionPanelProps> = ({
  onAskQuestion,
  onProvideContext,
  onChallengeArgument,
  onGuideDiscussion,
  agents,
  availableContextTypes
}) => {
  const [activeTab, setActiveTab] = useState<'question' | 'context' | 'guide'>('question');
  const [inputValue, setInputValue] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [contextType, setContextType] = useState<string>('general');

  const interactionTabs = [
    { id: 'question', label: 'Ask Question', icon: '❓' },
    { id: 'context', label: 'Add Context', icon: '📋' },
    { id: 'guide', label: 'Guide Discussion', icon: '🎯' }
  ];

  const submitInteraction = () => {
    if (!inputValue.trim()) return;

    switch (activeTab) {
      case 'question':
        onAskQuestion(inputValue, selectedAgent === 'all' ? undefined : selectedAgent);
        break;
      case 'context':
        onProvideContext(inputValue, contextType);
        break;
      case 'guide':
        onGuideDiscussion(inputValue, contextType);
        break;
    }

    setInputValue('');
  };

  return (
    <div className="user-interaction-panel">
      <div className="user-interaction-panel__header">
        <h3>Participate in Debate</h3>
        <TabNavigation 
          tabs={interactionTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="interaction-content">
        {activeTab === 'question' && (
          <QuestionInterface 
            value={inputValue}
            onChange={setInputValue}
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentSelect={setSelectedAgent}
            onSubmit={submitInteraction}
            placeholder="Ask agents about evidence, assumptions, or request clarification..."
          />
        )}

        {activeTab === 'context' && (
          <ContextInterface 
            value={inputValue}
            onChange={setInputValue}
            contextTypes={availableContextTypes}
            selectedType={contextType}
            onTypeSelect={setContextType}
            onSubmit={submitInteraction}
            placeholder="Provide additional context, data, or constraints..."
          />
        )}

        {activeTab === 'guide' && (
          <GuideInterface 
            value={inputValue}
            onChange={setInputValue}
            focusAreas={['technical', 'business', 'clinical', 'regulatory', 'ethical']}
            selectedFocus={contextType}
            onFocusSelect={setContextType}
            onSubmit={submitInteraction}
            placeholder="Guide the discussion focus or suggest new topics..."
          />
        )}
      </div>

      <div className="interaction-suggestions">
        <InteractionSuggestions 
          type={activeTab}
          currentTopic={/* current debate topic */}
          onSuggestionSelect={(suggestion) => setInputValue(suggestion)}
        />
      </div>
    </div>
  );
};
```

#### Question Interface Component
```typescript
const QuestionInterface: React.FC<{
  value: string;
  onChange: (value: string) => void;
  agents: Agent[];
  selectedAgent: string;
  onAgentSelect: (agentId: string) => void;
  onSubmit: () => void;
  placeholder: string;
}> = ({ 
  value, 
  onChange, 
  agents, 
  selectedAgent, 
  onAgentSelect, 
  onSubmit, 
  placeholder 
}) => {
  return (
    <div className="question-interface">
      <div className="question-interface__target">
        <label>Ask question to:</label>
        <select 
          value={selectedAgent}
          onChange={(e) => onAgentSelect(e.target.value)}
          className="agent-selector"
        >
          <option value="all">All Agents</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name} ({agent.role.replace('_', ' ')})
            </option>
          ))}
        </select>
      </div>

      <div className="question-interface__input">
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="question-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              onSubmit();
            }
          }}
        />
      </div>

      <div className="question-interface__actions">
        <button 
          className="btn btn--primary"
          onClick={onSubmit}
          disabled={!value.trim()}
        >
          Ask Question
        </button>
        <span className="keyboard-hint">
          Cmd/Ctrl + Enter to send
        </span>
      </div>

      <QuestionSuggestions 
        agentRole={selectedAgent !== 'all' ? agents.find(a => a.id === selectedAgent)?.role : undefined}
        onSuggestionSelect={onChange}
      />
    </div>
  );
};

const QuestionSuggestions: React.FC<{
  agentRole?: string;
  onSuggestionSelect: (suggestion: string) => void;
}> = ({ agentRole, onSuggestionSelect }) => {
  const getSuggestions = (role?: string) => {
    const generalSuggestions = [
      "What evidence supports this position?",
      "What are the main risks or limitations?",
      "How confident are you in this assessment?",
      "What additional information would help?"
    ];

    const roleSuggestions = {
      medical_expert: [
        "What clinical evidence supports this approach?",
        "Are there any safety concerns we should consider?",
        "How would this integrate with current clinical practices?"
      ],
      tech_engineer: [
        "What are the main technical challenges?",
        "Is this feasible with current technology?",
        "What would be the development timeline?"
      ],
      business_analyst: [
        "What is the market opportunity size?",
        "Who are the target customers?",
        "What's the competitive landscape like?"
      ]
    };

    return role ? roleSuggestions[role] || generalSuggestions : generalSuggestions;
  };

  const suggestions = getSuggestions(agentRole);

  return (
    <div className="question-suggestions">
      <h5>Suggested Questions:</h5>
      <div className="suggestion-buttons">
        {suggestions.map((suggestion, index) => (
          <button 
            key={index}
            className="btn btn--small btn--outline suggestion-btn"
            onClick={() => onSuggestionSelect(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 5. Evidence and Source Management

#### `EvidencePanel.tsx`
```typescript
interface EvidencePanelProps {
  sources: Source[];
  citations: Citation[];
  onSourceExpand: (sourceId: string) => void;
  onFactCheck: (claim: string) => void;
}

const EvidencePanel: React.FC<EvidencePanelProps> = ({
  sources,
  citations,
  onSourceExpand,
  onFactCheck
}) => {
  const [filterBy, setFilterBy] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'reliability' | 'recent'>('relevance');

  const filteredSources = sources.filter(source => {
    if (filterBy === 'all') return true;
    return source.reliabilityLevel === filterBy;
  });

  return (
    <div className="evidence-panel">
      <div className="evidence-panel__header">
        <h3>Evidence & Sources</h3>
        <div className="evidence-controls">
          <EvidenceFilters 
            filterBy={filterBy}
            onFilterChange={setFilterBy}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </div>

      <div className="evidence-summary">
        <EvidenceMetrics 
          totalSources={sources.length}
          highReliability={sources.filter(s => s.reliabilityLevel === 'high').length}
          mediumReliability={sources.filter(s => s.reliabilityLevel === 'medium').length}
          lowReliability={sources.filter(s => s.reliabilityLevel === 'low').length}
        />
      </div>

      <div className="source-list">
        {filteredSources.map(source => (
          <SourceCard 
            key={source.id}
            source={source}
            citations={citations.filter(c => c.sourceId === source.id)}
            onExpand={() => onSourceExpand(source.id)}
            onFactCheck={onFactCheck}
          />
        ))}
      </div>
    </div>
  );
};

const SourceCard: React.FC<{
  source: Source;
  citations: Citation[];
  onExpand: () => void;
  onFactCheck: (claim: string) => void;
}> = ({ source, citations, onExpand, onFactCheck }) => {
  const reliabilityColors = {
    high: '#10B981',
    medium: '#F59E0B', 
    low: '#EF4444'
  };

  return (
    <div className="source-card">
      <div className="source-card__header">
        <div className="source-info">
          <h4 className="source-title">{source.title}</h4>
          <p className="source-author">{source.author}</p>
          <p className="source-publication">{source.publication} • {source.year}</p>
        </div>
        
        <div className="source-metrics">
          <ReliabilityBadge 
            level={source.reliabilityLevel}
            color={reliabilityColors[source.reliabilityLevel]}
          />
          <CitationCount count={citations.length} />
        </div>
      </div>

      <div className="source-card__content">
        <p className="source-summary">{source.summary}</p>
        
        {source.keyFindings.length > 0 && (
          <div className="key-findings">
            <h5>Key Findings:</h5>
            <ul>
              {source.keyFindings.map((finding, index) => (
                <li key={index}>
                  {finding}
                  <button 
                    className="btn btn--small btn--outline fact-check-btn"
                    onClick={() => onFactCheck(finding)}
                  >
                    🔍 Verify
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="source-card__actions">
        <button 
          className="btn btn--small btn--outline"
          onClick={onExpand}
        >
          View Full Source
        </button>
        <button className="btn btn--small btn--outline">
          Export Citation
        </button>
      </div>

      {citations.length > 0 && (
        <div className="source-citations">
          <h5>Referenced by:</h5>
          <div className="citation-list">
            {citations.map(citation => (
              <CitationPreview key={citation.id} citation={citation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🎨 Visual Design Specifications

### Multi-Agent Color System
```css
/* Agent role colors */
--medical-expert: #DC2626;      /* Red 600 */
--tech-engineer: #2563EB;       /* Blue 600 */
--business-analyst: #059669;     /* Emerald 600 */
--regulatory-expert: #7C3AED;    /* Violet 600 */
--ethicist: #BE185D;            /* Pink 700 */
--patient-advocate: #0891B2;     /* Cyan 600 */
--devils-advocate: #374151;      /* Gray 700 */

/* Consensus level colors */
--consensus-high: #10B981;       /* Emerald 500 */
--consensus-medium: #F59E0B;     /* Amber 500 */
--consensus-low: #EF4444;        /* Red 500 */
--consensus-none: #6B7280;       /* Gray 500 */
```

### Component Styling
```css
.agent-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  border-left: 4px solid var(--agent-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.agent-card--active {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(var(--agent-color-rgb), 0.2);
}

.debate-message {
  background: white;
  border-radius: 0.5rem;
  margin: 1rem 0;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 3px solid var(--agent-color);
}

.debate-message--streaming {
  border-left-color: var(--blue-500);
  animation: pulse 1.5s ease-in-out infinite;
}

.consensus-topic-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid var(--consensus-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.consensus-topic-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes speaking {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

## 📱 Responsive Behavior

### Mobile Adaptations
- **Collapsible Panels**: Agent panel becomes a bottom sheet
- **Simplified Message View**: Compact message bubbles
- **Touch Interactions**: Tap to expand agents and messages
- **Swipe Navigation**: Swipe between consensus topics

### Tablet Optimizations
- **Side-by-side Layout**: Messages and consensus tracking visible simultaneously
- **Touch-Friendly Controls**: Larger interaction buttons
- **Gesture Support**: Pinch to zoom on consensus charts

## 🔄 Real-time Updates

### WebSocket Event Handling
```typescript
// Real-time event types
interface DebateEvents {
  'agent_message': DebateMessage;
  'agent_status_change': AgentStatusUpdate;
  'consensus_update': ConsensusUpdate;
  'debate_state_change': DebateStateChange;
  'user_joined': UserJoinedEvent;
  'user_left': UserLeftEvent;
}

// Event handlers
const handleRealtimeEvents = (socket: Socket) => {
  socket.on('agent_message', (message: DebateMessage) => {
    setMessages(prev => [...prev, message]);
    updateAgentActivity(message.agentId, 'idle');
  });

  socket.on('agent_status_change', (update: AgentStatusUpdate) => {
    setAgents(prev => prev.map(agent => 
      agent.id === update.agentId 
        ? { ...agent, ...update }
        : agent
    ));
  });

  socket.on('consensus_update', (update: ConsensusUpdate) => {
    setConsensus(prev => ({ ...prev, ...update }));
  });
};
```

---

*This multi-agent debate interface design provides comprehensive tools for observing, participating in, and extracting insights from AI agent discussions across all phases of the Bio-Design Innovation Platform.*
