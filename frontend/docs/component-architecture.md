# Component Architecture

## Bio-Design Platform Frontend Component Architecture

This document outlines the React component architecture for the Bio-Design Multi-Agent Innovation Platform, designed to support the three-phase innovation workflow with multimodal content handling and real-time agent collaboration.

## 🏗️ Architecture Overview

### Component Hierarchy
```
App
├── Layout/
│   ├── Header
│   ├── Sidebar
│   ├── MainContent
│   └── Footer
├── Pages/
│   ├── Dashboard
│   ├── ProjectSetup
│   ├── PhaseIdentify
│   ├── PhaseInvent
│   └── PhaseImplement
├── Features/
│   ├── AgentDebate/
│   ├── DocumentManagement/
│   ├── MultimodalContent/
│   ├── Visualization/
│   └── ProjectManagement/
└── Shared/
    ├── UI/
    ├── Hooks/
    ├── Utils/
    └── Types/
```

### Design Patterns Used
- **Container/Presenter Pattern**: Separation of logic and presentation
- **Compound Components**: Related components working together
- **Render Props**: Flexible component composition
- **Custom Hooks**: Reusable business logic
- **Context API**: Global state management for specific domains

## 📦 Core Component Library

### Layout Components

#### `Layout/Header.tsx`
```typescript
interface HeaderProps {
  currentPhase: Phase;
  project: Project;
  user: User;
  onPhaseChange: (phase: Phase) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPhase,
  project,
  user,
  onPhaseChange
}) => {
  return (
    <header className="header">
      <div className="header__brand">
        <Logo />
        <ProjectTitle title={project.title} />
      </div>
      
      <PhaseNavigation 
        currentPhase={currentPhase}
        onPhaseChange={onPhaseChange}
        completedPhases={project.completedPhases}
      />
      
      <div className="header__actions">
        <NotificationCenter />
        <UserMenu user={user} />
      </div>
    </header>
  );
};
```

#### `Layout/Sidebar.tsx`
```typescript
interface SidebarProps {
  currentPhase: Phase;
  project: Project;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPhase,
  project,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <ProjectNavigation 
        project={project}
        currentPhase={currentPhase}
      />
      
      <AgentStatusPanel />
      
      <QuickActions 
        phase={currentPhase}
        onUploadDocument={() => {/* ... */}}
        onStartDebate={() => {/* ... */}}
      />
      
      <ProgressSummary project={project} />
    </aside>
  );
};
```

### Phase-Specific Components

#### `Pages/PhaseIdentify.tsx`
```typescript
interface PhaseIdentifyProps {
  sessionId: string;
  project: Project;
}

const PhaseIdentify: React.FC<PhaseIdentifyProps> = ({
  sessionId,
  project
}) => {
  const { needs, isLoading, error } = useIdentifyPhase(sessionId);
  const { agents, startDebate } = useAgentDebate();
  const { uploadDocument } = useDocumentUpload();

  return (
    <div className="phase-identify">
      <PhaseHeader 
        phase="identify"
        title="Need Discovery & Problem Definition"
        description="Explore and identify unmet medical needs through systematic analysis"
      />
      
      <div className="phase-identify__content">
        <div className="phase-identify__main">
          <DocumentUploadZone 
            onUpload={uploadDocument}
            acceptedTypes={['pdf', 'docx', 'txt', 'jpg', 'png']}
            maxSize={50 * 1024 * 1024} // 50MB
          />
          
          <NeedDiscoveryInterface 
            needs={needs}
            onStartAnalysis={(need) => startDebate('analyze_need', { need })}
          />
          
          <NeedPrioritizationMatrix 
            needs={needs}
            onPrioritize={(rankings) => {/* ... */}}
          />
        </div>
        
        <div className="phase-identify__sidebar">
          <AgentDebatePanel 
            agents={agents}
            onJoinDebate={() => {/* ... */}}
          />
          
          <DocumentLibrary 
            documents={project.documents}
            currentPhase="identify"
          />
        </div>
      </div>
    </div>
  );
};
```

### Agent Collaboration Components

#### `Features/AgentDebate/AgentDebatePanel.tsx`
```typescript
interface AgentDebatePanelProps {
  debateId?: string;
  topic: string;
  agents: Agent[];
  messages: DebateMessage[];
  isActive: boolean;
  onStartDebate: (topic: string, agents: string[]) => void;
  onJoinDebate: () => void;
  onPauseDebate: () => void;
}

const AgentDebatePanel: React.FC<AgentDebatePanelProps> = ({
  debateId,
  topic,
  agents,
  messages,
  isActive,
  onStartDebate,
  onJoinDebate,
  onPauseDebate
}) => {
  const { scrollToBottom, messagesEndRef } = useAutoScroll(messages);
  
  return (
    <div className="agent-debate-panel">
      <div className="agent-debate-panel__header">
        <h3>Agent Debate: {topic}</h3>
        <DebateControls 
          isActive={isActive}
          onStart={() => onStartDebate(topic, agents.map(a => a.id))}
          onJoin={onJoinDebate}
          onPause={onPauseDebate}
        />
      </div>
      
      <AgentStatusBar agents={agents} />
      
      <div className="agent-debate-panel__messages">
        {messages.map((message) => (
          <DebateMessage 
            key={message.id}
            message={message}
            agent={agents.find(a => a.id === message.agentId)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <UserInputArea 
        onSendMessage={(content) => {/* ... */}}
        onAskQuestion={(question) => {/* ... */}}
        placeholder="Ask agents a question or provide context..."
      />
    </div>
  );
};
```

#### `Features/AgentDebate/DebateMessage.tsx`
```typescript
interface DebateMessageProps {
  message: DebateMessage;
  agent: Agent;
  onCiteSource?: (sourceId: string) => void;
  onChallengeArgument?: (messageId: string) => void;
}

const DebateMessage: React.FC<DebateMessageProps> = ({
  message,
  agent,
  onCiteSource,
  onChallengeArgument
}) => {
  return (
    <div className={`debate-message debate-message--${agent.role}`}>
      <div className="debate-message__avatar">
        <AgentAvatar 
          agent={agent}
          isActive={message.isStreaming}
          confidenceLevel={message.confidence}
        />
      </div>
      
      <div className="debate-message__content">
        <div className="debate-message__header">
          <span className="debate-message__agent">{agent.name}</span>
          <span className="debate-message__timestamp">{message.timestamp}</span>
          <ConfidenceIndicator level={message.confidence} />
        </div>
        
        <div className="debate-message__body">
          <MessageContent content={message.content} />
          
          {message.sources.length > 0 && (
            <SourceCitations 
              sources={message.sources}
              onCiteSource={onCiteSource}
            />
          )}
        </div>
        
        <div className="debate-message__actions">
          <button 
            onClick={() => onChallengeArgument?.(message.id)}
            className="btn btn--small btn--outline"
          >
            Challenge
          </button>
          <button className="btn btn--small btn--outline">
            Expand
          </button>
          <button className="btn btn--small btn--outline">
            Export
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Document Management Components

#### `Features/DocumentManagement/DocumentUploadZone.tsx`
```typescript
interface DocumentUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  acceptedTypes: string[];
  maxSize: number;
  multiple?: boolean;
  className?: string;
}

const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onUpload,
  acceptedTypes,
  maxSize,
  multiple = true,
  className
}) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    rejectedFiles
  } = useDropzone({
    accept: acceptedTypes.reduce((acc, type) => ({
      ...acc,
      [`application/${type}`]: [`.${type}`],
      [`image/${type}`]: [`.${type}`]
    }), {}),
    maxSize,
    multiple,
    onDrop: onUpload
  });

  const { isUploading, progress, error } = useUploadProgress();

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        'document-upload-zone',
        {
          'document-upload-zone--drag-active': isDragActive,
          'document-upload-zone--uploading': isUploading,
          'document-upload-zone--error': error
        },
        className
      )}
    >
      <input {...getInputProps()} />
      
      {isUploading ? (
        <UploadProgress 
          progress={progress}
          fileName={acceptedFiles[0]?.name}
        />
      ) : (
        <UploadPrompt 
          isDragActive={isDragActive}
          acceptedTypes={acceptedTypes}
          maxSize={maxSize}
        />
      )}
      
      {error && (
        <ErrorMessage 
          message={error}
          onRetry={() => onUpload(acceptedFiles)}
        />
      )}
      
      {rejectedFiles.length > 0 && (
        <RejectedFilesWarning files={rejectedFiles} />
      )}
    </div>
  );
};
```

### Multimodal Content Components

#### `Features/MultimodalContent/VisualContentAnalyzer.tsx`
```typescript
interface VisualContentAnalyzerProps {
  contentId: string;
  content: MultimodalContent;
  onAnalysisComplete: (analysis: ContentAnalysis) => void;
}

const VisualContentAnalyzer: React.FC<VisualContentAnalyzerProps> = ({
  contentId,
  content,
  onAnalysisComplete
}) => {
  const { analysis, isAnalyzing, error } = useContentAnalysis(contentId);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  return (
    <div className="visual-content-analyzer">
      <div className="visual-content-analyzer__header">
        <h3>Visual Content Analysis</h3>
        <AnalysisControls 
          onStartAnalysis={() => {/* ... */}}
          onExportResults={() => {/* ... */}}
          isAnalyzing={isAnalyzing}
        />
      </div>
      
      <div className="visual-content-analyzer__main">
        <div className="visual-content-analyzer__viewer">
          <ImageViewer 
            src={content.url}
            annotations={annotations}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            onAnnotationAdd={(annotation) => 
              setAnnotations([...annotations, annotation])
            }
          />
        </div>
        
        <div className="visual-content-analyzer__analysis">
          {isAnalyzing ? (
            <AnalysisProgress />
          ) : analysis ? (
            <AnalysisResults 
              analysis={analysis}
              onAcceptFinding={(finding) => {/* ... */}}
              onRejectFinding={(finding) => {/* ... */}}
            />
          ) : (
            <AnalysisPrompt 
              contentType={content.type}
              onStartAnalysis={() => {/* ... */}}
            />
          )}
        </div>
      </div>
      
      <div className="visual-content-analyzer__footer">
        <AgentInsights 
          contentId={contentId}
          insights={analysis?.agentInsights || []}
        />
      </div>
    </div>
  );
};
```

### Visualization Components

#### `Features/Visualization/MermaidDiagramEditor.tsx`
```typescript
interface MermaidDiagramEditorProps {
  initialDiagram?: string;
  diagramType: 'flowchart' | 'sequence' | 'class' | 'state';
  onSave: (diagram: string) => void;
  onExport: (format: 'svg' | 'png' | 'pdf') => void;
  collaborative?: boolean;
}

const MermaidDiagramEditor: React.FC<MermaidDiagramEditorProps> = ({
  initialDiagram = '',
  diagramType,
  onSave,
  onExport,
  collaborative = false
}) => {
  const [diagram, setDiagram] = useState(initialDiagram);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { collaborators, cursor } = useCollaboration(collaborative);

  const { 
    renderDiagram, 
    error: renderError,
    isValid 
  } = useMermaidRenderer(diagram);

  return (
    <div className="mermaid-diagram-editor">
      <div className="mermaid-diagram-editor__toolbar">
        <DiagramTypeSelector 
          type={diagramType}
          onChange={(type) => {/* ... */}}
        />
        
        <ViewModeToggle 
          isPreviewMode={isPreviewMode}
          onToggle={setIsPreviewMode}
        />
        
        <EditorActions 
          onSave={() => onSave(diagram)}
          onExport={onExport}
          onUndo={() => {/* ... */}}
          onRedo={() => {/* ... */}}
          canSave={isValid}
        />
        
        {collaborative && (
          <CollaborationIndicator 
            collaborators={collaborators}
            cursor={cursor}
          />
        )}
      </div>
      
      <div className="mermaid-diagram-editor__content">
        {isPreviewMode ? (
          <DiagramPreview 
            diagram={renderDiagram}
            error={renderError}
            onEdit={() => setIsPreviewMode(false)}
          />
        ) : (
          <SplitView>
            <CodeEditor 
              value={diagram}
              onChange={setDiagram}
              language="mermaid"
              collaborators={collaborators}
            />
            <DiagramPreview 
              diagram={renderDiagram}
              error={renderError}
            />
          </SplitView>
        )}
      </div>
      
      <div className="mermaid-diagram-editor__footer">
        <ValidationStatus 
          isValid={isValid}
          error={renderError}
        />
        
        <AutoSaveIndicator 
          lastSaved={Date.now()}
          isDirty={diagram !== initialDiagram}
        />
      </div>
    </div>
  );
};
```

## 🎣 Custom Hooks

### Data Fetching Hooks

#### `hooks/useIdentifyPhase.ts`
```typescript
interface UseIdentifyPhaseReturn {
  needs: Need[];
  isLoading: boolean;
  error: string | null;
  startAnalysis: (documents: Document[]) => Promise<void>;
  prioritizeNeeds: (priorities: NeedPriority[]) => Promise<void>;
  proceedToInventPhase: () => Promise<void>;
}

export const useIdentifyPhase = (sessionId: string): UseIdentifyPhaseReturn => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async (documents: Document[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(
        `/api/v1/innovation/sessions/${sessionId}/identify/start`,
        { documents: documents.map(d => d.id) }
      );
      
      setNeeds(response.data.needs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const prioritizeNeeds = useCallback(async (priorities: NeedPriority[]) => {
    try {
      const response = await apiClient.post(
        `/api/v1/innovation/sessions/${sessionId}/identify/prioritize`,
        { priorities }
      );
      
      setNeeds(response.data.needs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prioritization failed');
    }
  }, [sessionId]);

  const proceedToInventPhase = useCallback(async () => {
    try {
      await apiClient.post(
        `/api/v1/innovation/sessions/${sessionId}/identify/complete`
      );
      
      // Navigate to invent phase
      window.location.href = `/projects/${sessionId}/invent`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Phase transition failed');
    }
  }, [sessionId]);

  return {
    needs,
    isLoading,
    error,
    startAnalysis,
    prioritizeNeeds,
    proceedToInventPhase
  };
};
```

#### `hooks/useAgentDebate.ts`
```typescript
interface UseAgentDebateReturn {
  debate: Debate | null;
  agents: Agent[];
  messages: DebateMessage[];
  isActive: boolean;
  startDebate: (topic: string, config?: DebateConfig) => Promise<void>;
  pauseDebate: () => void;
  resumeDebate: () => void;
  sendMessage: (content: string) => void;
  askQuestion: (question: string) => void;
}

export const useAgentDebate = (sessionId: string): UseAgentDebateReturn => {
  const [debate, setDebate] = useState<Debate | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [isActive, setIsActive] = useState(false);

  // WebSocket connection for real-time updates
  const { socket, isConnected } = useWebSocket(
    `ws://localhost:8000/api/v1/innovation/sessions/${sessionId}/debate/stream`
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('debate_message', (message: DebateMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('agent_status_changed', (update: AgentStatusUpdate) => {
      setAgents(prev => prev.map(agent => 
        agent.id === update.agentId 
          ? { ...agent, status: update.status }
          : agent
      ));
    });

    socket.on('debate_ended', () => {
      setIsActive(false);
    });

    return () => {
      socket.off('debate_message');
      socket.off('agent_status_changed');
      socket.off('debate_ended');
    };
  }, [socket]);

  const startDebate = useCallback(async (topic: string, config?: DebateConfig) => {
    try {
      const response = await apiClient.post(
        `/api/v1/innovation/sessions/${sessionId}/debate/start`,
        { topic, config }
      );
      
      setDebate(response.data.debate);
      setIsActive(true);
    } catch (err) {
      console.error('Failed to start debate:', err);
    }
  }, [sessionId]);

  const sendMessage = useCallback((content: string) => {
    if (socket && isConnected) {
      socket.emit('user_message', { content });
    }
  }, [socket, isConnected]);

  return {
    debate,
    agents,
    messages,
    isActive,
    startDebate,
    pauseDebate: () => setIsActive(false),
    resumeDebate: () => setIsActive(true),
    sendMessage,
    askQuestion: sendMessage
  };
};
```

### UI State Hooks

#### `hooks/useMultimodalUpload.ts`
```typescript
interface UseMultimodalUploadReturn {
  uploadFiles: (files: File[], analysisType?: string) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedContent: MultimodalContent[];
}

export const useMultimodalUpload = (sessionId: string): UseMultimodalUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedContent, setUploadedContent] = useState<MultimodalContent[]>([]);

  const uploadFiles = useCallback(async (files: File[], analysisType?: string) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (analysisType) {
      formData.append('analysis_type', analysisType);
    }

    try {
      const response = await apiClient.post(
        `/api/v1/innovation/sessions/${sessionId}/multimodal/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );

      const results = response.data.results;
      setUploadedContent(prev => [...prev, ...results]);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [sessionId]);

  return {
    uploadFiles,
    isUploading,
    progress,
    error,
    uploadedContent
  };
};
```

## 🎯 State Management Strategy

### Context Providers

#### `context/ProjectContext.tsx`
```typescript
interface ProjectContextType {
  project: Project | null;
  currentPhase: Phase;
  setCurrentPhase: (phase: Phase) => void;
  updateProject: (updates: Partial<Project>) => void;
  isLoading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>('identify');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProject = useCallback((updates: Partial<Project>) => {
    setProject(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const value = useMemo(() => ({
    project,
    currentPhase,
    setCurrentPhase,
    updateProject,
    isLoading,
    error
  }), [project, currentPhase, updateProject, isLoading, error]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};
```

### Global State with Zustand

#### `store/useAppStore.ts`
```typescript
interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark';
  
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Session State
  activeSessions: Session[];
  currentSessionId: string | null;
  
  // Agent State
  availableAgents: Agent[];
  activeDebates: Debate[];
  
  // Actions
  toggleSidebar: () => void;
  setActiveModal: (modal: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUser: (user: User | null) => void;
  addSession: (session: Session) => void;
  setCurrentSession: (sessionId: string) => void;
  startDebate: (debate: Debate) => void;
  endDebate: (debateId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  sidebarCollapsed: false,
  activeModal: null,
  theme: 'light',
  user: null,
  isAuthenticated: false,
  activeSessions: [],
  currentSessionId: null,
  availableAgents: [],
  activeDebates: [],

  // Actions
  toggleSidebar: () => set(state => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  setActiveModal: (modal) => set({ activeModal: modal }),
  
  setTheme: (theme) => set({ theme }),
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  addSession: (session) => set(state => ({
    activeSessions: [...state.activeSessions, session]
  })),
  
  setCurrentSession: (sessionId) => set({ 
    currentSessionId: sessionId 
  }),
  
  startDebate: (debate) => set(state => ({
    activeDebates: [...state.activeDebates, debate]
  })),
  
  endDebate: (debateId) => set(state => ({
    activeDebates: state.activeDebates.filter(d => d.id !== debateId)
  }))
}));
```

## 📱 Responsive Design Components

### Adaptive Layout Hook

#### `hooks/useResponsive.ts`
```typescript
interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
}

export const useResponsive = (): UseResponsiveReturn => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isDesktop = screenSize.width >= 1024;

  const breakpoint = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    screenSize
  };
};
```

## 🧪 Testing Strategy

### Component Testing with React Testing Library

#### Example Test: `__tests__/AgentDebatePanel.test.tsx`
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentDebatePanel } from '../Features/AgentDebate/AgentDebatePanel';
import { mockAgents, mockDebateMessages } from '../__mocks__/agentData';

describe('AgentDebatePanel', () => {
  const defaultProps = {
    topic: 'Test Debate Topic',
    agents: mockAgents,
    messages: mockDebateMessages,
    isActive: false,
    onStartDebate: jest.fn(),
    onJoinDebate: jest.fn(),
    onPauseDebate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders debate topic and agents', () => {
    render(<AgentDebatePanel {...defaultProps} />);
    
    expect(screen.getByText('Agent Debate: Test Debate Topic')).toBeInTheDocument();
    expect(screen.getByText('Medical Expert')).toBeInTheDocument();
    expect(screen.getByText('Tech Engineer')).toBeInTheDocument();
  });

  it('starts debate when start button is clicked', async () => {
    render(<AgentDebatePanel {...defaultProps} />);
    
    const startButton = screen.getByRole('button', { name: /start debate/i });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(defaultProps.onStartDebate).toHaveBeenCalledWith(
        'Test Debate Topic',
        mockAgents.map(a => a.id)
      );
    });
  });

  it('displays messages in chronological order', () => {
    render(<AgentDebatePanel {...defaultProps} />);
    
    const messageElements = screen.getAllByTestId('debate-message');
    expect(messageElements).toHaveLength(mockDebateMessages.length);
  });

  it('allows user to send messages when debate is active', () => {
    render(<AgentDebatePanel {...defaultProps} isActive={true} />);
    
    const messageInput = screen.getByPlaceholderText(/ask agents a question/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(messageInput, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);
    
    // Verify message input was cleared
    expect(messageInput).toHaveValue('');
  });
});
```

---

*This component architecture provides a solid foundation for building the Bio-Design Innovation Platform frontend with scalable, maintainable, and testable React components.*
