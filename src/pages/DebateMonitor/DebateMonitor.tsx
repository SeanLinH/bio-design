import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';

// Add CSS for blinking animation
const styles = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
import {
  Pause as PauseIcon,
  Stop as StopIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService.ts';
import MarkdownRenderer from '../../components/common/MarkdownRenderer.tsx';

interface DebateMessage {
  id: string;
  agent_name: string;
  content: string;
  timestamp: string;
  type: 'analysis' | 'synthesis' | 'report' | 'system';
  partial: boolean;
}

interface SSEEventData {
  content: {
    parts: Array<{ text: string }>;
    role: string;
  };
  partial: boolean;
  invocationId: string;
  author: string;
  actions: any;
  id: string;
  timestamp: number;
}

export default function DebateMonitor() {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('');
  const [progress, setProgress] = useState(0);
  const [iteration, setIteration] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [partialMessages, setPartialMessages] = useState<Map<string, DebateMessage>>(new Map());

  // Get session data from navigation state
  const sessionData = location.state as {
    sessionId: string;
    question: string;
    maxIterations: number;
    userId: string;
  } | null;

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start debate when component mounts
  useEffect(() => {
    if (sessionData) {
      startDebate();
    } else {
      setError('沒有會話資料，請重新開始辯論');
    }
  }, []);

  const startDebate = async () => {
    if (!sessionData) return;

    setIsRunning(true);
    setError(null);

    try {
      const response = await ApiService.runSSE(sessionData.question, sessionData.userId, sessionData.sessionId);

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      readerRef.current = reader; // Store reader reference for cancellation
      const decoder = new TextDecoder();

      let buffer = '';
      let messageId = 0;
      let currentAgentId = '';
      const partialBuffer = new Map<string, string>();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsRunning(false);
          setIsStopping(false);
          setCurrentAgent('');
          readerRef.current = null;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          // Handle SSE event format
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim();
            continue;
          }

          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const data: SSEEventData = JSON.parse(jsonStr);

              console.log('Received SSE data:', data);

              // Extract agent info
              const agentId = data.author;
              const agentDisplayName = ApiService.getAgentDisplayName(agentId);
              const contentText = data.content?.parts?.map(part => part.text).join('') || '';

              // Update current agent if changed
              if (agentId !== currentAgentId) {
                currentAgentId = agentId;
                setCurrentAgent(agentDisplayName);

                // Add system message for new agent
                const systemMessage: DebateMessage = {
                  id: `system_${messageId++}`,
                  agent_name: 'System',
                  content: `🤖 ${agentDisplayName} 開始發言...`,
                  timestamp: new Date().toISOString(),
                  type: 'system',
                  partial: false,
                };
                setMessages(prev => [...prev, systemMessage]);
              }

              if (data.partial) {
                // Handle partial message - accumulate content
                const currentContent = partialBuffer.get(agentId) || '';
                partialBuffer.set(agentId, currentContent + contentText);

                // Update or create partial message
                setPartialMessages(prev => {
                  const newMap = new Map(prev);
                  const partialMessage: DebateMessage = {
                    id: `partial_${agentId}`,
                    agent_name: agentDisplayName,
                    content: partialBuffer.get(agentId) || '',
                    timestamp: new Date(data.timestamp * 1000).toISOString(),
                    type: 'analysis',
                    partial: true,
                  };
                  newMap.set(agentId, partialMessage);
                  return newMap;
                });
              } else {
                // Final message - move from partial to complete
                const finalContent = (partialBuffer.get(agentId) || '') + contentText;
                partialBuffer.delete(agentId);

                const finalMessage: DebateMessage = {
                  id: `msg_${messageId++}`,
                  agent_name: agentDisplayName,
                  content: finalContent,
                  timestamp: new Date(data.timestamp * 1000).toISOString(),
                  type: 'analysis',
                  partial: false,
                };

                setMessages(prev => [...prev, finalMessage]);
                setPartialMessages(prev => {
                  const newMap = new Map(prev);
                  newMap.delete(agentId);
                  return newMap;
                });
              }

            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Raw line:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during debate:', error);
      if (error.name !== 'AbortError') {
        setError(`辯論過程中發生錯誤: ${error.message}`);
      }
      setIsRunning(false);
      setIsStopping(false);
      readerRef.current = null;
    }
  };

  const handleStop = async () => {
    if (!sessionData || isStopping) {
      console.log('🛑 Stop operation blocked:', {
        hasSessionData: !!sessionData,
        isStopping,
        sessionId: sessionData?.sessionId
      });
      return;
    }

    console.log('🛑 Starting stop operation:', {
      userId: sessionData.userId,
      sessionId: sessionData.sessionId,
      isRunning,
      hasReader: !!readerRef.current
    });

    setIsStopping(true);
    setError(null);

    try {
      // Step 1: Cancel the stream reader first
      console.log('🛑 Step 1: Canceling stream reader...');
      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
          console.log('✅ Stream reader canceled successfully');
        } catch (readerError) {
          console.warn('⚠️ Error canceling stream reader:', readerError);
        }
        readerRef.current = null;
      } else {
        console.log('ℹ️ No active stream reader to cancel');
      }

      // Step 2: Call the interrupt API to stop the backend session
      console.log('🛑 Step 2: Calling interrupt API...');
      try {
        const result = await ApiService.interruptSession(sessionData.userId, sessionData.sessionId);
        console.log('✅ Backend session interrupted successfully:', result);
      } catch (apiError) {
        console.error('❌ API interrupt failed:', {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data
        });

        // Set specific error message based on error type
        if (apiError.response?.status === 404) {
          setError('會話已經結束或不存在');
        } else if (apiError.response?.status >= 500) {
          setError('伺服器錯誤，但前端已停止辯論');
        } else {
          setError(`停止後端會話時發生錯誤: ${apiError.message}`);
        }

        // Continue with frontend cleanup even if API fails
        console.log('⚠️ Continuing with frontend cleanup despite API failure');
      }

      // Step 3: Update UI state
      console.log('🛑 Step 3: Updating UI state...');
      setIsRunning(false);
      setCurrentAgent('');
      setPartialMessages(new Map()); // Clear partial messages

      // Step 4: Add system message to indicate stop
      const stopMessage: DebateMessage = {
        id: `system_stop_${Date.now()}`,
        agent_name: 'System',
        content: '🛑 辯論已被用戶中止',
        timestamp: new Date().toISOString(),
        type: 'system',
        partial: false,
      };
      setMessages(prev => [...prev, stopMessage]);

      console.log('✅ Stop operation completed successfully');

    } catch (error) {
      console.error('❌ Unexpected error during stop operation:', error);
      setError(`停止辯論時發生未預期的錯誤: ${error.message}`);

      // Emergency cleanup: ensure frontend stops regardless of any errors
      console.log('🆘 Emergency cleanup: forcing frontend stop...');
      setIsRunning(false);
      setCurrentAgent('');
      setPartialMessages(new Map());

      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
        } catch (cancelError) {
          console.error('❌ Emergency reader cancel failed:', cancelError);
        }
        readerRef.current = null;
      }
    } finally {
      setIsStopping(false);
      console.log('🛑 Stop operation finished, isStopping set to false');
    }
  };

  const handleExport = () => {
    const transcript = messages
      .filter(msg => msg.type !== 'system')
      .map(msg => `[${msg.timestamp}] ${msg.agent_name}: ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate_transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAgentColor = (agentName: string) => {
    const colors = ['primary', 'secondary', 'success', 'info', 'warning'];
    const hash = agentName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length] as any;
  };

  if (!sessionData) {
    return (
      <Box>
        <Alert severity="error">
          沒有會話資料，請回到設定頁面重新開始辯論
        </Alert>
        <Button onClick={() => navigate('/setup')} sx={{ mt: 2 }}>
          回到設定頁面
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          實時監控
        </Typography>
        <Box>
          <IconButton onClick={handleExport} disabled={messages.length === 0}>
            <DownloadIcon />
          </IconButton>
          {isRunning ? (
            <Button
              variant="outlined"
              startIcon={isStopping ? <CircularProgress size={16} /> : <StopIcon />}
              onClick={handleStop}
              color="error"
              disabled={isStopping}
              sx={{
                minWidth: '120px'
              }}
            >
              {isStopping ? '正在停止...' : '停止辯論'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => navigate('/setup')}
            >
              重新開始
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Status Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                辯論狀態
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  當前狀態
                </Typography>
                <Chip
                  label={
                    isStopping
                      ? '正在停止...'
                      : isRunning
                      ? '進行中'
                      : '已停止'
                  }
                  color={
                    isStopping
                      ? 'warning'
                      : isRunning
                      ? 'success'
                      : 'default'
                  }
                  icon={isStopping ? <CircularProgress size={16} /> : undefined}
                />
              </Box>

              {currentAgent && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    當前發言者
                  </Typography>
                  <Chip label={currentAgent} color="primary" />
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  進度: {iteration} / {sessionData.maxIterations} 輪
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                辯論問題
              </Typography>
              <Typography variant="body1">
                {sessionData.question}
              </Typography>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>

        {/* Messages Panel */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6">
                辯論記錄 ({messages.length + partialMessages.size})
                {partialMessages.size > 0 && (
                  <Chip
                    label={`${partialMessages.size} 位Agent正在輸入`}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </CardContent>
            <Divider />
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                backgroundColor: '#f8f9fa',
              }}
            >
              {messages.length === 0 && partialMessages.size === 0 ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    等待辯論開始...
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Render completed messages */}
                  {messages.map((message) => (
                    <Paper
                      key={message.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: message.type === 'system' ? '#e3f2fd' : 'white',
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar
                          sx={{
                            bgcolor: message.type === 'system' ? 'grey.500' : `${getAgentColor(message.agent_name)}.main`,
                            width: 32,
                            height: 32,
                            mr: 2,
                            fontSize: '0.875rem',
                          }}
                        >
                          {message.agent_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {message.agent_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                      <MarkdownRenderer content={message.content} />
                    </Paper>
                  ))}

                  {/* Render partial messages with typing indicator */}
                  {Array.from(partialMessages.values()).map((message) => (
                    <Paper
                      key={message.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: 'white',
                        border: '2px solid #2196F3',
                        borderRadius: 2,
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar
                          sx={{
                            bgcolor: `${getAgentColor(message.agent_name)}.main`,
                            width: 32,
                            height: 32,
                            mr: 2,
                            fontSize: '0.875rem',
                          }}
                        >
                          {message.agent_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {message.agent_name}
                            <Chip label="正在輸入..." size="small" color="primary" sx={{ ml: 1 }} />
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                      <MarkdownRenderer content={message.content} isStreaming={true} />
                    </Paper>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}