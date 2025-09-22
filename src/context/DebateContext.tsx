import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface DebateAgent {
  id?: number;
  name: string;
  instruction: string;
  description: string;
  model_id: number;
  temperature: number;
  max_tokens: number;
}

export interface DebateMessage {
  id: string;
  agent_name: string;
  content: string;
  timestamp: string;
  iteration?: number;
  type: 'analysis' | 'synthesis' | 'report' | 'system';
  partial: boolean;
}

export interface AgentStatus {
  name: string;
  status: 'waiting' | 'running' | 'completed' | 'error';
  output?: string;
}

export interface DebateSession {
  session_id: string;
  user_id: string;
  question: string;
  max_iterations: number;
  status: 'preparing' | 'running' | 'completed' | 'error';
  current_iteration: number;
  current_agent: string;
  agents_progress: AgentStatus[];
  messages: DebateMessage[];
  agents: DebateAgent[];
  started_at: string;
  progress?: number;
}

interface DebateState {
  session: DebateSession | null;
  agents: DebateAgent[];
  models: any[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: DebateState = {
  session: null,
  agents: [],
  models: [],
  isLoading: false,
  error: null,
};

// Actions
type DebateAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AGENTS'; payload: DebateAgent[] }
  | { type: 'ADD_AGENT'; payload: DebateAgent }
  | { type: 'UPDATE_AGENT'; payload: { index: number; agent: DebateAgent } }
  | { type: 'REMOVE_AGENT'; payload: number }
  | { type: 'SET_MODELS'; payload: any[] }
  | { type: 'CREATE_SESSION'; payload: DebateSession }
  | { type: 'UPDATE_SESSION_STATUS'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: DebateMessage }
  | { type: 'UPDATE_AGENT_STATUS'; payload: AgentStatus }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'SET_CURRENT_ITERATION'; payload: number };

// Reducer
function debateReducer(state: DebateState, action: DebateAction): DebateState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AGENTS':
      return { ...state, agents: action.payload };
    case 'ADD_AGENT':
      return { ...state, agents: [...state.agents, action.payload] };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map((agent, index) =>
          index === action.payload.index ? action.payload.agent : agent
        ),
      };
    case 'REMOVE_AGENT':
      return {
        ...state,
        agents: state.agents.filter((_, index) => index !== action.payload),
      };
    case 'SET_MODELS':
      return { ...state, models: action.payload };
    case 'CREATE_SESSION':
      return { ...state, session: action.payload };
    case 'UPDATE_SESSION_STATUS':
      return {
        ...state,
        session: state.session
          ? { ...state.session, status: action.payload as any }
          : null,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        session: state.session
          ? {
              ...state.session,
              messages: [...state.session.messages, action.payload],
            }
          : null,
      };
    case 'UPDATE_AGENT_STATUS':
      return {
        ...state,
        session: state.session
          ? {
              ...state.session,
              agents_progress: state.session.agents_progress.some(
                (agent) => agent.name === action.payload.name
              )
                ? state.session.agents_progress.map((agent) =>
                    agent.name === action.payload.name ? action.payload : agent
                  )
                : [...state.session.agents_progress, action.payload],
            }
          : null,
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        session: state.session
          ? { ...state.session, progress: action.payload }
          : null,
      };
    case 'SET_CURRENT_ITERATION':
      return {
        ...state,
        session: state.session
          ? { ...state.session, current_iteration: action.payload }
          : null,
      };
    default:
      return state;
  }
}

// Context
const DebateContext = createContext<{
  state: DebateState;
  dispatch: React.Dispatch<DebateAction>;
} | null>(null);

// Provider
export const DebateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(debateReducer, initialState);

  return (
    <DebateContext.Provider value={{ state, dispatch }}>
      {children}
    </DebateContext.Provider>
  );
};

// Hook
export const useDebate = () => {
  const context = useContext(DebateContext);
  if (!context) {
    throw new Error('useDebate must be used within a DebateProvider');
  }
  return context;
};