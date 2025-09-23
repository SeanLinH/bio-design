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
        return '進行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失敗';
      default:
        return '未知';
    }
  };

  const getAgentDisplayName = (agentId?: string) => {
    if (!agentId) return '系統';
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
          載入會話詳情中...
        </Typography>
      </Box>
    );
  }

  if (error || !sessionData) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          無法載入會話詳情，請檢查會話ID是否正確
        </Alert>

        {/* Debug information */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            調試資訊:
          </Typography>
          <Typography variant="caption" component="div">
            Session ID: {sessionId}
          </Typography>
          <Typography variant="caption" component="div">
            User ID: {userId}
          </Typography>
          <Typography variant="caption" component="div">
            API 端點: /spaces/13/apps/12/users/{userId}/sessions/{sessionId}
          </Typography>
          <Typography variant="caption" component="div">
            Error: {(error as any)?.message || 'Unknown error'}
          </Typography>
          <Typography variant="caption" component="div">
            請打開瀏覽器開發者工具的Console查看詳細日誌
          </Typography>
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToHistory}
        >
          返回會話歷史
        </Button>
      </Box>
    );
  }

  const session: SessionDetailData = sessionData;

  return (
    <Box>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={handleBackToHistory} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          會話詳情
        </Typography>
      </Box>

      {/* Session metadata */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6">基本資訊</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                會話ID
              </Typography>
              <Typography variant="body1" fontFamily="monospace" sx={{ mb: 2 }}>
                {session.id}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                用戶ID
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {session.userId}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                狀態
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
                <Typography variant="h6">時間資訊</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                創建時間
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(session.createdAt).toLocaleString('zh-TW')}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                參與專家數量
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {session.participantCount || 0} 位專家
              </Typography>
            </Grid>

            {session.question && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  初始問題
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
            <Typography variant="h6">專家討論內容</Typography>
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
                        {message.role === 'user' ? '用戶' : getAgentDisplayName(message.agentId)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(message.timestamp).toLocaleString('zh-TW')}
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
              此會話暫無對話內容記錄
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Debug Panel */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">調試資訊</Typography>
            <Button
              size="small"
              onClick={() => setDebugMode(!debugMode)}
              variant={debugMode ? 'contained' : 'outlined'}
            >
              {debugMode ? '隱藏' : '顯示'} 原始數據
            </Button>
          </Box>

          {debugMode && (
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
              <Typography variant="body2" gutterBottom>
                原始會話數據:
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
            請打開瀏覽器開發者工具查看詳細的API調用日誌
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
          返回會話歷史
        </Button>

        <Typography variant="caption" color="textSecondary">
          會話ID: {session.id}
        </Typography>
      </Box>
    </Box>
  );
}