# API Integration Guide

## Frontend-Backend Communication Patterns

This document details how the Bio-Design Platform frontend integrates with the backend API, including HTTP requests, WebSocket connections, file uploads, and real-time updates.

## 🔗 API Client Configuration

### Base API Client Setup

#### `services/apiClient.ts`
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.client = axios.create(config);
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle authentication errors
          this.handleAuthError();
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private handleAuthError(): void {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  private transformError(error: any): ApiError {
    return {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details || null
    };
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload with progress tracking
  async uploadFiles(
    url: string, 
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.post<UploadResponse>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
  }
}

export const apiClient = new ApiClient({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true
});
```

## 🎯 Service Layer Architecture

### Innovation Session Services

#### `services/innovationService.ts`
```typescript
interface CreateSessionRequest {
  title: string;
  description: string;
  user_id: string;
  domain?: string;
}

interface SessionResponse {
  session_id: string;
  title: string;
  description: string;
  current_phase: Phase;
  status: string;
  created_at: string;
  phase_results: PhaseResults;
}

class InnovationService {
  // Session Management
  async createSession(data: CreateSessionRequest): Promise<SessionResponse> {
    return apiClient.post<SessionResponse>('/api/v1/innovation/sessions', data);
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    return apiClient.get<SessionResponse>(`/api/v1/innovation/sessions/${sessionId}`);
  }

  async listSessions(userId: string, limit = 50): Promise<SessionResponse[]> {
    return apiClient.get<SessionResponse[]>(`/api/v1/innovation/sessions`, {
      params: { user_id: userId, limit }
    });
  }

  async updateSession(sessionId: string, updates: Partial<CreateSessionRequest>): Promise<SessionResponse> {
    return apiClient.put<SessionResponse>(`/api/v1/innovation/sessions/${sessionId}`, updates);
  }

  async deleteSession(sessionId: string): Promise<void> {
    return apiClient.delete(`/api/v1/innovation/sessions/${sessionId}`);
  }

  // Phase Management
  async startIdentifyPhase(sessionId: string, config?: any): Promise<PhaseResponse> {
    return apiClient.post<PhaseResponse>(`/api/v1/innovation/sessions/${sessionId}/identify/start`, config);
  }

  async completeIdentifyPhase(sessionId: string, selectedNeeds: string[]): Promise<PhaseResponse> {
    return apiClient.post<PhaseResponse>(`/api/v1/innovation/sessions/${sessionId}/identify/complete`, {
      selected_needs: selectedNeeds
    });
  }

  async startInventPhase(sessionId: string, needId: string): Promise<PhaseResponse> {
    return apiClient.post<PhaseResponse>(`/api/v1/innovation/sessions/${sessionId}/invent/start`, {
      need_id: needId
    });
  }

  async completeInventPhase(sessionId: string, selectedSolution: string): Promise<PhaseResponse> {
    return apiClient.post<PhaseResponse>(`/api/v1/innovation/sessions/${sessionId}/invent/complete`, {
      selected_solution: selectedSolution
    });
  }

  async startImplementPhase(sessionId: string, solutionId: string): Promise<PhaseResponse> {
    return apiClient.post<PhaseResponse>(`/api/v1/innovation/sessions/${sessionId}/implement/start`, {
      solution_id: solutionId
    });
  }

  async completeImplementPhase(sessionId: string, implementationPlan: any): Promise<PhaseResponse> {
    return apiClient.post<PhaseResponse>(`/api/v1/innovation/sessions/${sessionId}/implement/complete`, 
      implementationPlan
    );
  }
}

export const innovationService = new InnovationService();
```

### Document Management Services

#### `services/documentService.ts`
```typescript
interface DocumentUploadResponse {
  message: string;
  documents: UploadedDocument[];
  multimodal_content?: MultimodalContent[];
  session_id: string;
}

interface DocumentQueryRequest {
  query: string;
  phase: Phase;
  top_k?: number;
  filters?: Record<string, any>;
}

interface DocumentQueryResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
  processing_time: number;
}

class DocumentService {
  // File Upload
  async uploadDocuments(
    sessionId: string, 
    phase: Phase, 
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResponse> {
    const url = `/api/v1/innovation/sessions/${sessionId}/${phase}/upload-documents`;
    return apiClient.uploadFiles(url, files, onProgress);
  }

  async uploadMultimodalContent(
    sessionId: string,
    files: File[],
    analysisType: string,
    context?: string,
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('analysis_type', analysisType);
    if (context) formData.append('context', context);

    return apiClient.post<DocumentUploadResponse>(
      `/api/v1/innovation/sessions/${sessionId}/multimodal/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      }
    );
  }

  // Document Querying
  async queryDocuments(
    sessionId: string, 
    queryRequest: DocumentQueryRequest
  ): Promise<DocumentQueryResponse> {
    return apiClient.post<DocumentQueryResponse>(
      `/api/v1/innovation/sessions/${sessionId}/documents/query`,
      queryRequest
    );
  }

  // Document Management
  async listDocuments(sessionId: string, phase?: Phase): Promise<UploadedDocument[]> {
    const params = phase ? { phase } : {};
    return apiClient.get<UploadedDocument[]>(
      `/api/v1/innovation/sessions/${sessionId}/documents`,
      { params }
    );
  }

  async deleteDocument(sessionId: string, documentId: string): Promise<void> {
    return apiClient.delete(`/api/v1/innovation/sessions/${sessionId}/documents/${documentId}`);
  }

  async getDocumentContent(sessionId: string, documentId: string): Promise<string> {
    return apiClient.get<string>(`/api/v1/innovation/sessions/${sessionId}/documents/${documentId}/content`);
  }

  // Multimodal Analysis
  async analyzeVisualContent(
    sessionId: string,
    contentIds: string[],
    analysisRequest: string,
    includeAgentPerspectives = true
  ): Promise<VisualAnalysisResponse> {
    return apiClient.post<VisualAnalysisResponse>(
      `/api/v1/innovation/sessions/${sessionId}/multimodal/analyze`,
      {
        content_ids: contentIds,
        analysis_request: analysisRequest,
        include_agent_perspectives: includeAgentPerspectives
      }
    );
  }
}

export const documentService = new DocumentService();
```

### Agent Debate Services

#### `services/debateService.ts`
```typescript
interface StartDebateRequest {
  topic: string;
  agents: string[];
  max_rounds?: number;
  debate_config?: DebateConfig;
}

interface DebateResponse {
  debate_id: string;
  topic: string;
  status: 'starting' | 'active' | 'paused' | 'completed';
  participants: Agent[];
  created_at: string;
}

interface DebateMessage {
  id: string;
  debate_id: string;
  agent_id: string;
  content: string;
  sources: Source[];
  confidence: number;
  timestamp: string;
  is_streaming: boolean;
}

class DebateService {
  // Debate Management
  async startDebate(sessionId: string, request: StartDebateRequest): Promise<DebateResponse> {
    return apiClient.post<DebateResponse>(
      `/api/v1/innovation/sessions/${sessionId}/debate/start`,
      request
    );
  }

  async pauseDebate(sessionId: string, debateId: string): Promise<void> {
    return apiClient.post(`/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/pause`);
  }

  async resumeDebate(sessionId: string, debateId: string): Promise<void> {
    return apiClient.post(`/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/resume`);
  }

  async endDebate(sessionId: string, debateId: string): Promise<DebateSummary> {
    return apiClient.post<DebateSummary>(
      `/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/end`
    );
  }

  // Debate Interaction
  async sendUserMessage(sessionId: string, debateId: string, content: string): Promise<void> {
    return apiClient.post(`/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/message`, {
      content,
      sender: 'user'
    });
  }

  async askQuestion(sessionId: string, debateId: string, question: string): Promise<void> {
    return apiClient.post(`/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/question`, {
      question
    });
  }

  // Debate Data
  async getDebateMessages(sessionId: string, debateId: string): Promise<DebateMessage[]> {
    return apiClient.get<DebateMessage[]>(
      `/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/messages`
    );
  }

  async getDebateStatus(sessionId: string, debateId: string): Promise<DebateStatus> {
    return apiClient.get<DebateStatus>(
      `/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/status`
    );
  }

  async getConsensusMetrics(sessionId: string, debateId: string): Promise<ConsensusMetrics> {
    return apiClient.get<ConsensusMetrics>(
      `/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/consensus`
    );
  }

  async exportDebateSummary(sessionId: string, debateId: string, format: 'pdf' | 'docx' | 'json'): Promise<Blob> {
    const response = await apiClient.client.get(
      `/api/v1/innovation/sessions/${sessionId}/debate/${debateId}/export`,
      {
        params: { format },
        responseType: 'blob'
      }
    );
    return response.data;
  }
}

export const debateService = new DebateService();
```

## 🔌 WebSocket Integration

### Real-time Debate Connection

#### `hooks/useWebSocket.ts`
```typescript
interface WebSocketHook {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler?: (data: any) => void) => void;
}

export const useWebSocket = (url: string, options?: any): WebSocketHook => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io(url, {
      ...options,
      auth: {
        token: localStorage.getItem('auth_token')
      }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  const connect = useCallback(() => {
    socket?.connect();
  }, [socket]);

  const disconnect = useCallback(() => {
    socket?.disconnect();
  }, [socket]);

  const emit = useCallback((event: string, data: any) => {
    socket?.emit(event, data);
  }, [socket]);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    socket?.on(event, handler);
  }, [socket]);

  const off = useCallback((event: string, handler?: (data: any) => void) => {
    if (handler) {
      socket?.off(event, handler);
    } else {
      socket?.off(event);
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off
  };
};
```

### Real-time Debate Hook

#### `hooks/useRealtimeDebate.ts`
```typescript
interface RealtimeDebateHook {
  messages: DebateMessage[];
  agents: Agent[];
  debateStatus: DebateStatus;
  consensus: ConsensusMetrics;
  isConnected: boolean;
  sendMessage: (content: string) => void;
  joinDebate: () => void;
  leaveDebate: () => void;
}

export const useRealtimeDebate = (
  sessionId: string, 
  debateId?: string
): RealtimeDebateHook => {
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [debateStatus, setDebateStatus] = useState<DebateStatus>('inactive');
  const [consensus, setConsensus] = useState<ConsensusMetrics>({});

  const wsUrl = `${process.env.REACT_APP_WS_BASE_URL}/api/v1/innovation/sessions/${sessionId}/debate/stream`;
  const { socket, isConnected, emit, on, off } = useWebSocket(wsUrl);

  useEffect(() => {
    if (!socket || !debateId) return;

    // Join specific debate room
    emit('join_debate', { debate_id: debateId });

    // Listen for debate events
    const handleNewMessage = (message: DebateMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleAgentUpdate = (update: AgentStatusUpdate) => {
      setAgents(prev => prev.map(agent => 
        agent.id === update.agent_id 
          ? { ...agent, ...update }
          : agent
      ));
    };

    const handleDebateStatusChange = (status: DebateStatus) => {
      setDebateStatus(status);
    };

    const handleConsensusUpdate = (metrics: ConsensusMetrics) => {
      setConsensus(metrics);
    };

    const handleMessageUpdate = (update: MessageUpdate) => {
      setMessages(prev => prev.map(msg => 
        msg.id === update.message_id
          ? { ...msg, ...update }
          : msg
      ));
    };

    on('debate_message', handleNewMessage);
    on('agent_status_update', handleAgentUpdate);
    on('debate_status_change', handleDebateStatusChange);
    on('consensus_update', handleConsensusUpdate);
    on('message_update', handleMessageUpdate);

    return () => {
      off('debate_message', handleNewMessage);
      off('agent_status_update', handleAgentUpdate);
      off('debate_status_change', handleDebateStatusChange);
      off('consensus_update', handleConsensusUpdate);
      off('message_update', handleMessageUpdate);
      
      // Leave debate room
      emit('leave_debate', { debate_id: debateId });
    };
  }, [socket, debateId]);

  const sendMessage = useCallback((content: string) => {
    if (socket && debateId) {
      emit('user_message', {
        debate_id: debateId,
        content,
        timestamp: new Date().toISOString()
      });
    }
  }, [socket, debateId, emit]);

  const joinDebate = useCallback(() => {
    if (socket && debateId) {
      emit('join_debate', { debate_id: debateId });
    }
  }, [socket, debateId, emit]);

  const leaveDebate = useCallback(() => {
    if (socket && debateId) {
      emit('leave_debate', { debate_id: debateId });
    }
  }, [socket, debateId, emit]);

  return {
    messages,
    agents,
    debateStatus,
    consensus,
    isConnected,
    sendMessage,
    joinDebate,
    leaveDebate
  };
};
```

## 📊 Data Fetching Patterns

### React Query Integration

#### `hooks/useInnovationQueries.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys for cache management
export const innovationKeys = {
  all: ['innovation'] as const,
  sessions: () => [...innovationKeys.all, 'sessions'] as const,
  session: (id: string) => [...innovationKeys.sessions(), id] as const,
  phase: (sessionId: string, phase: Phase) => [...innovationKeys.session(sessionId), phase] as const,
  debates: (sessionId: string) => [...innovationKeys.session(sessionId), 'debates'] as const,
  documents: (sessionId: string) => [...innovationKeys.session(sessionId), 'documents'] as const,
};

// Session queries
export const useInnovationSession = (sessionId: string) => {
  return useQuery({
    queryKey: innovationKeys.session(sessionId),
    queryFn: () => innovationService.getSession(sessionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!sessionId
  });
};

export const useInnovationSessions = (userId: string) => {
  return useQuery({
    queryKey: innovationKeys.sessions(),
    queryFn: () => innovationService.listSessions(userId),
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

// Session mutations
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: innovationService.createSession,
    onSuccess: (newSession) => {
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: innovationKeys.sessions() });
      
      // Add to cache
      queryClient.setQueryData(
        innovationKeys.session(newSession.session_id),
        newSession
      );
    }
  });
};

export const useUpdateSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<CreateSessionRequest>) => 
      innovationService.updateSession(sessionId, updates),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(
        innovationKeys.session(sessionId),
        updatedSession
      );
    }
  });
};

// Document queries
export const useDocuments = (sessionId: string, phase?: Phase) => {
  return useQuery({
    queryKey: innovationKeys.documents(sessionId),
    queryFn: () => documentService.listDocuments(sessionId, phase),
    enabled: !!sessionId
  });
};

export const useDocumentQuery = () => {
  return useMutation({
    mutationFn: ({ sessionId, query }: { sessionId: string; query: DocumentQueryRequest }) =>
      documentService.queryDocuments(sessionId, query)
  });
};

// Document mutations
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      sessionId, 
      phase, 
      files, 
      onProgress 
    }: { 
      sessionId: string; 
      phase: Phase; 
      files: File[]; 
      onProgress?: (progress: number) => void 
    }) => documentService.uploadDocuments(sessionId, phase, files, onProgress),
    onSuccess: (_, { sessionId }) => {
      // Invalidate documents cache
      queryClient.invalidateQueries({ 
        queryKey: innovationKeys.documents(sessionId) 
      });
    }
  });
};

// Phase queries
export const usePhaseData = (sessionId: string, phase: Phase) => {
  return useQuery({
    queryKey: innovationKeys.phase(sessionId, phase),
    queryFn: async () => {
      switch (phase) {
        case 'identify':
          return innovationService.getIdentifyPhaseData(sessionId);
        case 'invent':
          return innovationService.getInventPhaseData(sessionId);
        case 'implement':
          return innovationService.getImplementPhaseData(sessionId);
        default:
          throw new Error(`Unknown phase: ${phase}`);
      }
    },
    enabled: !!sessionId && !!phase
  });
};
```

## 🚀 Optimistic Updates

### Example: Document Upload with Optimistic UI

#### `hooks/useOptimisticUpload.ts`
```typescript
interface OptimisticDocument {
  id: string;
  filename: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export const useOptimisticUpload = (sessionId: string) => {
  const queryClient = useQueryClient();
  const [optimisticDocs, setOptimisticDocs] = useState<OptimisticDocument[]>([]);

  const uploadMutation = useMutation({
    mutationFn: ({ phase, files }: { phase: Phase; files: File[] }) => {
      // Create optimistic entries
      const optimisticEntries: OptimisticDocument[] = files.map(file => ({
        id: `temp-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        status: 'uploading',
        progress: 0
      }));

      setOptimisticDocs(prev => [...prev, ...optimisticEntries]);

      // Actual upload with progress tracking
      return documentService.uploadDocuments(
        sessionId,
        phase,
        files,
        (progress) => {
          setOptimisticDocs(prev => prev.map(doc => 
            optimisticEntries.some(opt => opt.id === doc.id)
              ? { ...doc, progress, status: progress === 100 ? 'processing' : 'uploading' }
              : doc
          ));
        }
      );
    },
    onSuccess: (response) => {
      // Replace optimistic entries with real data
      setOptimisticDocs(prev => 
        prev.filter(doc => !response.documents.some(real => real.filename === doc.filename))
      );

      // Update cache with real documents
      queryClient.setQueryData(
        innovationKeys.documents(sessionId),
        (old: UploadedDocument[] = []) => [...old, ...response.documents]
      );
    },
    onError: (error, { files }) => {
      // Mark optimistic entries as errored
      setOptimisticDocs(prev => prev.map(doc => 
        files.some(file => file.name === doc.filename)
          ? { ...doc, status: 'error', error: error.message }
          : doc
      ));
    }
  });

  const removeOptimisticDoc = (id: string) => {
    setOptimisticDocs(prev => prev.filter(doc => doc.id !== id));
  };

  return {
    optimisticDocs,
    uploadDocuments: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    removeOptimisticDoc
  };
};
```

## 🔒 Error Handling

### Global Error Boundary

#### `components/ErrorBoundary.tsx`
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<any> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to monitoring service
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Could send to error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}> = ({ error, resetError }) => {
  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <details>
        <summary>Error details</summary>
        <pre>{error?.message}</pre>
      </details>
      <button onClick={resetError}>Try again</button>
    </div>
  );
};
```

### API Error Handling Hook

#### `hooks/useErrorHandler.ts`
```typescript
interface ErrorHandlerReturn {
  handleError: (error: ApiError, context?: string) => void;
  clearErrors: () => void;
  errors: ErrorState[];
}

interface ErrorState {
  id: string;
  message: string;
  context?: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
}

export const useErrorHandler = (): ErrorHandlerReturn => {
  const [errors, setErrors] = useState<ErrorState[]>([]);

  const handleError = useCallback((error: ApiError, context?: string) => {
    const errorState: ErrorState = {
      id: Math.random().toString(36).substr(2, 9),
      message: error.message,
      context,
      timestamp: new Date(),
      type: error.status >= 500 ? 'error' : 'warning'
    };

    setErrors(prev => [...prev, errorState]);

    // Auto-remove after 5 seconds for warnings
    if (errorState.type === 'warning') {
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e.id !== errorState.id));
      }, 5000);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return { handleError, clearErrors, errors };
};
```

---

*This API integration guide provides comprehensive patterns for connecting the Bio-Design Platform frontend with the backend services, ensuring robust, real-time, and user-friendly data communication.*
