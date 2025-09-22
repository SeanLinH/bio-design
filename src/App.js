import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DebateProvider } from './context/DebateContext.tsx';

// Pages
import Dashboard from './pages/Dashboard/Dashboard.tsx';
import AgentManagement from './pages/AgentManagement/AgentManagement.tsx';
import DebateSetup from './pages/DebateSetup/DebateSetup.tsx';
import DebateMonitor from './pages/DebateMonitor/DebateMonitor.tsx';
import SessionHistory from './pages/SessionHistory/SessionHistory.tsx';
import MarkdownTest from './pages/MarkdownTest/MarkdownTest.tsx';

// Components
import Layout from './components/common/Layout.tsx';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#ff9800',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DebateProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/agents" element={<AgentManagement />} />
                <Route path="/setup" element={<DebateSetup />} />
                <Route path="/monitor" element={<DebateMonitor />} />
                <Route path="/sessions" element={<SessionHistory />} />
                <Route path="/markdown-test" element={<MarkdownTest />} />
              </Routes>
            </Layout>
          </Router>
        </DebateProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}