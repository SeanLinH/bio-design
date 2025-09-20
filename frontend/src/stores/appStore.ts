import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  InnovationSession, 
  Phase, 
  Agent, 
  Notification,
  DebateSession,
  PhaseProgress,
  ConceptMap 
} from '@/types'

// Main application state interface
interface AppState {
  // Session state
  currentSession: InnovationSession | null
  sessions: InnovationSession[]
  isLoadingSession: boolean
  
  // Phase state
  currentPhase: Phase
  phaseProgress: Record<Phase, PhaseProgress | null>
  
  // Agents state
  agents: Agent[]
  isLoadingAgents: boolean
  
  // Debate state
  activeDebates: DebateSession[]
  debateMessages: Record<string, any[]>
  
  // Concept maps
  conceptMaps: ConceptMap[]
  activeConceptMap: ConceptMap | null
  
  // UI state
  sidebarOpen: boolean
  notifications: Notification[]
  isLoading: boolean
  error: string | null
  
  // Theme and preferences
  theme: 'light' | 'dark' | 'system'
  phase_theme: Phase
  
  // Actions
  // Session actions
  setCurrentSession: (session: InnovationSession | null) => void
  updateSession: (sessionId: string, updates: Partial<InnovationSession>) => void
  addSession: (session: InnovationSession) => void
  removeSession: (sessionId: string) => void
  setLoadingSession: (loading: boolean) => void
  
  // Phase actions
  setCurrentPhase: (phase: Phase) => void
  updatePhaseProgress: (phase: Phase, progress: PhaseProgress) => void
  
  // Agent actions
  setAgents: (agents: Agent[]) => void
  setLoadingAgents: (loading: boolean) => void
  
  // Debate actions
  addDebateSession: (debate: DebateSession) => void
  removeDebateSession: (sessionId: string) => void
  addDebateMessage: (sessionId: string, message: any) => void
  
  // Concept map actions
  setConceptMaps: (maps: ConceptMap[]) => void
  addConceptMap: (map: ConceptMap) => void
  setActiveConceptMap: (map: ConceptMap | null) => void
  
  // UI actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setPhaseTheme: (phase: Phase) => void
  
  // Utility actions
  reset: () => void
}

// Generate unique ID for notifications
const generateId = () => Math.random().toString(36).substr(2, 9)

// Create the store
export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, _get) => ({
    // Initial state
    currentSession: null,
    sessions: [],
    isLoadingSession: false,
    
    currentPhase: 'identify',
    phaseProgress: {
      identify: null,
      invent: null,
      implement: null,
    },
    
    agents: [],
    isLoadingAgents: false,
    
    activeDebates: [],
    debateMessages: {},
    
    conceptMaps: [],
    activeConceptMap: null,
    
    sidebarOpen: true,
    notifications: [],
    isLoading: false,
    error: null,
    
    theme: 'system',
    phase_theme: 'identify',
    
    // Session actions
    setCurrentSession: (session) => set({ currentSession: session }),
    
    updateSession: (sessionId, updates) => set((state) => ({
      sessions: state.sessions.map(session => 
        session.session_id === sessionId 
          ? { ...session, ...updates }
          : session
      ),
      currentSession: state.currentSession?.session_id === sessionId
        ? { ...state.currentSession, ...updates }
        : state.currentSession
    })),
    
    addSession: (session) => set((state) => ({
      sessions: [session, ...state.sessions]
    })),
    
    removeSession: (sessionId) => set((state) => ({
      sessions: state.sessions.filter(s => s.session_id !== sessionId),
      currentSession: state.currentSession?.session_id === sessionId 
        ? null 
        : state.currentSession
    })),
    
    setLoadingSession: (loading) => set({ isLoadingSession: loading }),
    
    // Phase actions
    setCurrentPhase: (phase) => set({ 
      currentPhase: phase,
      phase_theme: phase 
    }),
    
    updatePhaseProgress: (phase, progress) => set((state) => ({
      phaseProgress: {
        ...state.phaseProgress,
        [phase]: progress
      }
    })),
    
    // Agent actions
    setAgents: (agents) => set({ agents }),
    setLoadingAgents: (loading) => set({ isLoadingAgents: loading }),
    
    // Debate actions
    addDebateSession: (debate) => set((state) => ({
      activeDebates: [...state.activeDebates, debate]
    })),
    
    removeDebateSession: (sessionId) => set((state) => ({
      activeDebates: state.activeDebates.filter(d => d.session_id !== sessionId),
      debateMessages: {
        ...state.debateMessages,
        [sessionId]: []
      }
    })),
    
    addDebateMessage: (sessionId, message) => set((state) => ({
      debateMessages: {
        ...state.debateMessages,
        [sessionId]: [...(state.debateMessages[sessionId] || []), message]
      }
    })),
    
    // Concept map actions
    setConceptMaps: (maps) => set({ conceptMaps: maps }),
    
    addConceptMap: (map) => set((state) => ({
      conceptMaps: [...state.conceptMaps, map]
    })),
    
    setActiveConceptMap: (map) => set({ activeConceptMap: map }),
    
    // UI actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    
    toggleSidebar: () => set((state) => ({ 
      sidebarOpen: !state.sidebarOpen 
    })),
    
    addNotification: (notification) => set((state) => ({
      notifications: [{
        id: generateId(),
        timestamp: new Date().toISOString(),
        read: false,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        action: notification.action,
      }, ...state.notifications]
    })),
    
    removeNotification: (id) => set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
    
    markNotificationRead: (id) => set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    })),
    
    clearNotifications: () => set({ notifications: [] }),
    
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    
    // Theme actions
    setTheme: (theme) => set({ theme }),
    setPhaseTheme: (phase) => set({ phase_theme: phase }),
    
    // Utility actions
    reset: () => set({
      currentSession: null,
      sessions: [],
      isLoadingSession: false,
      currentPhase: 'identify',
      phaseProgress: {
        identify: null,
        invent: null,
        implement: null,
      },
      activeDebates: [],
      debateMessages: {},
      conceptMaps: [],
      activeConceptMap: null,
      notifications: [],
      isLoading: false,
      error: null,
    }),
  }))
)

// Selectors for common state combinations
export const useCurrentSession = () => useAppStore(state => state.currentSession)
export const useCurrentPhase = () => useAppStore(state => state.currentPhase)
export const usePhaseProgress = () => useAppStore(state => state.phaseProgress)
export const useAgents = () => useAppStore(state => state.agents)
export const useNotifications = () => useAppStore(state => state.notifications)
export const useDebateMessages = (sessionId: string) => 
  useAppStore(state => state.debateMessages[sessionId] || [])

// Subscribe to phase changes to update document theme
useAppStore.subscribe(
  (state) => state.phase_theme,
  (phase) => {
    document.documentElement.setAttribute('data-phase', phase)
  },
  { fireImmediately: true }
)

// Subscribe to theme changes
useAppStore.subscribe(
  (state) => state.theme,
  (theme) => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  },
  { fireImmediately: true }
)

export default useAppStore
