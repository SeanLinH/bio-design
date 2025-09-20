import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/hooks/useApp'
import Layout from '@/components/layout/Layout'
import IdentifyPage from '@/pages/IdentifyPage'
import InventPage from '@/pages/InventPage'
import ImplementPage from '@/pages/ImplementPage'
import DashboardPage from '@/pages/DashboardPage'
import SessionPage from '@/pages/SessionPage'
import SessionsPage from '@/pages/SessionsPage'
import AgentsPage from '@/pages/AgentsPage'
import DebatesPage from '@/pages/DebatesPage'
import QuestionPage from '@/pages/QuestionPage'
import AuthPage from '@/pages/AuthPage'
import InnovationWorkflowPage from '@/pages/InnovationWorkflowPage'
import BusinessStrategyPage from '@/pages/BusinessStrategyPage'
import ReportsPage from '@/pages/ReportsPage'
import { TestPage } from '@/pages/TestPage'
import ConnectionTestPage from '@/pages/ConnectionTestPage'

function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          {/* Default route - redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Authentication */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Dashboard - Session Overview */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Question-based Multi-Agent System */}
          <Route path="/question" element={<QuestionPage />} />
          
          {/* Three-Phase Innovation Workflow */}
          <Route path="/innovation-workflow" element={<InnovationWorkflowPage />} />
          
          {/* Business Strategy Generation */}
          <Route path="/business-strategy" element={<BusinessStrategyPage />} />
          
          {/* Reports System */}
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Test Page for Backend Connection */}
          <Route path="/test" element={<TestPage />} />
          
          {/* Connection Test Page */}
          <Route path="/connection-test" element={<ConnectionTestPage />} />
          
          {/* Management Pages */}
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/debates" element={<DebatesPage />} />
          
          {/* Session Routes */}
          <Route path="/session/:sessionId" element={<SessionPage />} />
          
          {/* Phase-specific Routes */}
          <Route path="/session/:sessionId/identify" element={<IdentifyPage />} />
          <Route path="/session/:sessionId/invent" element={<InventPage />} />
          <Route path="/session/:sessionId/implement" element={<ImplementPage />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}

export default App
