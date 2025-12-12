import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Divider,
  Avatar,
  Paper,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import ApiService from '../../services/ApiService.ts';
import MarkdownRenderer from '../common/MarkdownRenderer.tsx';

interface SessionDetailData {
  id: string;
  userId: string;
  createdAt: string;
  question?: string;
  status: 'active' | 'completed' | 'failed';
  participantCount?: number;
  messages?: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agentId?: string;
    timestamp: string;
    agentName?: string;
  }>;
}

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [debugMode, setDebugMode] = useState(false);

  // Try to get userId from session history first, fallback to 'user1'
  const getUserIdForSession = (sessionId: string): string => {
    try {
      // First try to get from localStorage (session history)
      const savedSessions = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
      const foundSession = savedSessions.find((s: any) => s.id === sessionId);
      if (foundSession?.userId) {
        console.log('🔍 [SessionDetail] Found userId in localStorage:', foundSession.userId);
        return foundSession.userId;
      }

      // If not found in localStorage, default to 'user1' as per CLAUDE.md examples
      console.log('🔍 [SessionDetail] Using default userId: user1');
      return 'user1';
    } catch (error) {
      console.log('🔍 [SessionDetail] Error getting userId, using default:', error);
      return 'user1';
    }
  };

  const userId = sessionId ? getUserIdForSession(sessionId) : 'user1';
  console.log('🔍 [SessionDetail] Final userId for session:', { sessionId, userId });

  const { data: sessionData, isLoading, error } = useQuery(
    ['sessionDetail', sessionId, userId],
    () => {
      console.log('🔍 [SessionDetail] Querying session details for:', { sessionId, userId });
      return sessionId ? ApiService.getSessionDetails(userId, sessionId) : null;
    },
    {
      enabled: !!sessionId,
      retry: false,
      onError: (error) => {
        console.error('🔍 [SessionDetail] Query error:', error);
      },
      onSuccess: (data) => {
        console.log('🔍 [SessionDetail] Query success:', data);
      }
    }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getAgentDisplayName = (agentId?: string) => {
    if (!agentId) return 'System';
    return ApiService.getAgentDisplayName(agentId);
  };

  const getAgentColor = (agentId?: string) => {
    if (!agentId) return '#666';
    // Generate consistent colors based on agent ID
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f', '#0288d1', '#689f38'];
    const hash = agentId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleBackToHistory = () => {
    navigate('/sessions');
  };

  if (isLoading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading session details...
        </Typography>
      </Box>
    );
  }

  if (error || !sessionData) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to load session details. Please check if the session ID is correct.
        </Alert>

        {/* Debug information */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Debug Information:
          </Typography>
          <Typography variant="caption" component="div">
            Session ID: {sessionId}
          </Typography>
          <Typography variant="caption" component="div">
            User ID: {userId}
          </Typography>
          <Typography variant="caption" component="div">
            API Endpoint: /spaces/13/apps/12/users/{userId}/sessions/{sessionId}
          </Typography>
          <Typography variant="caption" component="div">
            Error: {(error as any)?.message || 'Unknown error'}
          </Typography>
          <Typography variant="caption" component="div">
            Please open browser developer tools Console to view detailed logs
          </Typography>
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToHistory}
        >
          Back to Session History
        </Button>
      </Box>
    );
  }

  const session: SessionDetailData = sessionData;

  // Calculate actual number of participating experts from messages
  const getActualExpertCount = (): number => {
    if (!session.messages || session.messages.length === 0) {
      return 0;
    }

    // Get unique agent IDs from assistant messages (exclude user messages)
    const uniqueAgents = new Set(
      session.messages
        .filter(msg => msg.role === 'assistant' && msg.agentId)
        .map(msg => msg.agentId)
    );

    return uniqueAgents.size;
  };

  const actualExpertCount = getActualExpertCount();

  // Helper function to format timestamp (handles both Unix timestamps and ISO strings)
  const formatTimestamp = (timestamp: string | number): string => {
    try {
      let date: Date;

      if (typeof timestamp === 'number') {
        // Handle Unix timestamp (in seconds or milliseconds)
        const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
        date = new Date(timestampMs);
      } else {
        // Handle ISO string
        date = new Date(timestamp);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid timestamp';
      }

      return date.toLocaleString('en-US', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Invalid timestamp';
    }
  };

  return (
    <Box>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={handleBackToHistory} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Session Details
        </Typography>
      </Box>

      {/* Session metadata */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Basic Information</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Session ID
              </Typography>
              <Typography variant="body1" fontFamily="monospace" sx={{ mb: 2 }}>
                {session.id}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                User ID
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {session.userId}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={getStatusText(session.status)}
                color={getStatusColor(session.status) as any}
                size="small"
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccessTimeIcon color="primary" />
                <Typography variant="h6">Session Information</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Participating Experts
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {actualExpertCount} {actualExpertCount === 1 ? 'expert' : 'experts'}
              </Typography>
            </Grid>

            {session.question && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Initial Question
                </Typography>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="body1">
                    {session.question}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Messages/Conversation Flow */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <PsychologyIcon color="primary" />
            <Typography variant="h6">Expert Discussion Content</Typography>
          </Box>

          {session.messages && session.messages.length > 0 ? (
            <Box>
              {session.messages.map((message, index) => (
                <Box key={message.id || index} sx={{ mb: 3 }}>
                  {/* Message header */}
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar
                      sx={{
                        bgcolor: getAgentColor(message.agentId),
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                      }}
                    >
                      {message.role === 'user' ? 'U' : getAgentDisplayName(message.agentId).charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {message.role === 'user' ? 'User' : getAgentDisplayName(message.agentId)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Message content */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      ml: 5,
                      backgroundColor: message.role === 'user' ? 'primary.50' : 'grey.50',
                      border: `1px solid ${message.role === 'user' ? '#e3f2fd' : '#f5f5f5'}`,
                    }}
                  >
                    <MarkdownRenderer content={message.content} />
                  </Paper>

                  {index < session.messages.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              This session has no conversation content recorded
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Debug Panel */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Debug Information</Typography>
            <Button
              size="small"
              onClick={() => setDebugMode(!debugMode)}
              variant={debugMode ? 'contained' : 'outlined'}
            >
              {debugMode ? 'Hide' : 'Show'} Raw Data
            </Button>
          </Box>

          {debugMode && (
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
              <Typography variant="body2" gutterBottom>
                Raw Session Data:
              </Typography>
              <Box
                component="pre"
                sx={{
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: 400,
                  backgroundColor: 'white',
                  p: 1,
                  border: '1px solid #ddd',
                }}
              >
                {JSON.stringify(sessionData, null, 2)}
              </Box>
            </Paper>
          )}

          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
            Please open browser developer tools to view detailed API call logs
          </Typography>
        </CardContent>
      </Card>

      {/* Footer actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToHistory}
        >
          Back to Session History
        </Button>

        <Typography variant="caption" color="textSecondary">
          Session ID: {session.id}
        </Typography>
      </Box>
    </Box>
  );
}