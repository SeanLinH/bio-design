import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAppStore, useCurrentSession } from '@/stores/appStore'
import { innovationService } from '@/services/innovationService'
import { agentService } from '@/services/agentService'
import { wsManager } from '@/services/api'
import toast from 'react-hot-toast'
import { InnovationSession, Phase, Agent } from '@/types'

// App Context interface
interface AppContextType {
  // Session management
  createSession: (data: { title: string; description?: string }) => Promise<InnovationSession>
  loadSession: (sessionId: string) => Promise<void>
  refreshSession: () => Promise<void>
  
  // Phase management
  startPhase: (phase: Phase, contextData?: any) => Promise<void>
  transitionPhase: (targetPhase: Phase) => Promise<void>
  
  // Agent management
  loadAgents: () => Promise<void>
  
  // WebSocket management
  connectToSession: (sessionId: string) => void
  disconnectFromSession: () => void
  
  // Utility functions
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void
}

// Create context
const AppContext = createContext<AppContextType | null>(null)

// Provider component
interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const queryClient = useQueryClient()
  const {
    currentSession,
    setCurrentSession,
    setLoadingSession,
    setAgents,
    setLoadingAgents,
    addNotification,
    setError,
    setCurrentPhase,
    updatePhaseProgress,
    addDebateMessage,
  } = useAppStore()

  // Load agents on mount
  const { data: _agents, isLoading: agentsLoading } = useQuery<Agent[]>(
    'agents',
    agentService.getAgents,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: (data) => {
        setAgents(data)
      },
      onError: (error: any) => {
        setError(error.message || 'Failed to load agents')
        toast.error('Failed to load agents')
      },
    }
  )

  // Update loading state
  useEffect(() => {
    setLoadingAgents(agentsLoading)
  }, [agentsLoading, setLoadingAgents])

  // Create session mutation
  const createSessionMutation = useMutation(
    innovationService.createSession,
    {
      onSuccess: (session) => {
        setCurrentSession(session)
        queryClient.invalidateQueries('sessions')
        toast.success('Session created successfully')
      },
      onError: (error: any) => {
        setError(error.message || 'Failed to create session')
        toast.error('Failed to create session')
      },
    }
  )

  // Load session mutation
  const loadSessionMutation = useMutation(
    innovationService.getSession,
    {
      onMutate: () => {
        setLoadingSession(true)
      },
      onSuccess: (session) => {
        setCurrentSession(session)
        setCurrentPhase(session.current_phase)
        setLoadingSession(false)
      },
      onError: (error: any) => {
        setError(error.message || 'Failed to load session')
        setLoadingSession(false)
        toast.error('Failed to load session')
      },
    }
  )

  // Start phase mutation
  const startPhaseMutation = useMutation(
    ({ phase, contextData }: { phase: Phase; contextData?: any }) =>
      innovationService.startPhase(currentSession!.session_id, phase, contextData),
    {
      onSuccess: (_, { phase }) => {
        toast.success(`${phase.toUpperCase()} phase started successfully`)
        if (currentSession) {
          loadSessionMutation.mutate(currentSession.session_id)
        }
      },
      onError: (error: any) => {
        setError(error.message || 'Failed to start phase')
        toast.error('Failed to start phase')
      },
    }
  )

  // Transition phase mutation
  const transitionPhaseMutation = useMutation(
    (targetPhase: Phase) =>
      innovationService.transitionPhase(currentSession!.session_id, targetPhase),
    {
      onSuccess: (_, targetPhase) => {
        setCurrentPhase(targetPhase)
        toast.success(`Transitioned to ${targetPhase.toUpperCase()} phase`)
        if (currentSession) {
          loadSessionMutation.mutate(currentSession.session_id)
        }
      },
      onError: (error: any) => {
        setError(error.message || 'Failed to transition phase')
        toast.error('Failed to transition phase')
      },
    }
  )

  // WebSocket connection management
  const connectToSession = (sessionId: string) => {
    // Connect to innovation progress updates
    wsManager.connect(
      `innovation-${sessionId}`,
      `/api/v1/ws/innovation/${sessionId}`,
      {
        onMessage: (data) => {
          switch (data.type) {
            case 'phase_progress':
              updatePhaseProgress(data.data.phase, {
                phase: data.data.phase,
                status: 'in_progress',
                progress_percentage: data.data.progress,
                current_step: data.data.current_step,
                estimated_completion: data.data.estimated_completion,
                steps_completed: [],
                steps_remaining: [],
              })
              break
            case 'phase_completed':
              updatePhaseProgress(data.data.phase, {
                phase: data.data.phase,
                status: 'completed',
                progress_percentage: 100,
                current_step: 'Completed',
                steps_completed: [],
                steps_remaining: [],
              })
              addNotification({
                type: 'success',
                title: 'Phase Completed',
                message: `${data.data.phase.toUpperCase()} phase has been completed`,
                read: false,
              })
              break
            case 'debate_update':
              addDebateMessage(sessionId, data.data)
              break
            default:
              console.log('Unhandled WebSocket message:', data)
          }
        },
        onOpen: () => {
          console.log('Connected to innovation session updates')
        },
        onError: (error) => {
          console.error('Innovation WebSocket error:', error)
          toast.error('Connection error - some features may not work properly')
        },
        autoReconnect: true,
      }
    )
  }

  const disconnectFromSession = () => {
    if (currentSession) {
      wsManager.disconnect(`innovation-${currentSession.session_id}`)
    }
  }

  // Auto-connect to current session
  useEffect(() => {
    if (currentSession) {
      connectToSession(currentSession.session_id)
    }
    
    return () => {
      disconnectFromSession()
    }
  }, [currentSession?.session_id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsManager.disconnectAll()
    }
  }, [])

  // Context value
  const contextValue: AppContextType = {
    // Session management
    createSession: async (data) => {
      return createSessionMutation.mutateAsync(data)
    },

    loadSession: async (sessionId: string) => {
      await loadSessionMutation.mutateAsync(sessionId)
    },

    refreshSession: async () => {
      if (currentSession) {
        await loadSessionMutation.mutateAsync(currentSession.session_id)
      }
    },

    // Phase management
    startPhase: async (phase: Phase, contextData?: any) => {
      await startPhaseMutation.mutateAsync({ phase, contextData })
    },

    transitionPhase: async (targetPhase: Phase) => {
      await transitionPhaseMutation.mutateAsync(targetPhase)
    },

    // Agent management
    loadAgents: async () => {
      await queryClient.invalidateQueries('agents')
    },

    // WebSocket management
    connectToSession,
    disconnectFromSession,

    // Utility functions
    showNotification: (type, message) => {
      addNotification({
        type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        read: false,
      })
      
      // Also show toast
      switch (type) {
        case 'success':
          toast.success(message)
          break
        case 'error':
          toast.error(message)
          break
        case 'warning':
          toast(message, { icon: '⚠️' })
          break
        case 'info':
          toast(message, { icon: 'ℹ️' })
          break
      }
    },
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the app context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Export additional hooks for convenience
export { useCurrentSession }

export default AppProvider
