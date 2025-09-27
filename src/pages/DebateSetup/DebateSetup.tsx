import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  People as PeopleIcon,
  SmartToy as SmartToyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService.ts';
import { DebateAgent } from '../../context/DebateContext';
import DebateProcessStatus from '../../components/debate/DebateProcessStatus.tsx';

export default function DebateSetup() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [maxIterations, setMaxIterations] = useState(1);
  const [userId, setUserId] = useState('user1');
  const [isStarting, setIsStarting] = useState(false);

  // Fetch agents
  const { data: agents = [], isLoading, error, refetch } = useQuery('agents', ApiService.getAgents);

  // Fetch debate process configuration
  const { data: debateProcess } = useQuery('debateProcess', ApiService.getDebateProcessConfig);

  // Filter agents
  const coreExpertNames = [
    'supply_chain',
    'materials_manager',
    'logistics_expert',
    'risk_management',
    'regulatory_authority'
  ];

  const coreExperts = agents.filter((agent: DebateAgent) =>
    coreExpertNames.includes(agent.name)
  );

  const customAgents = agents.filter((agent: DebateAgent) => {
    const fixedAgentIds = [136, 137, 138, 139, 140, 141]; // unmet_need_source, reporter, debate_process, convergencer, problem_solver, entire_process
    return !coreExpertNames.includes(agent.name) && !fixedAgentIds.includes(agent.id!);
  });

  const totalParticipants = coreExperts.length + customAgents.length;

  // Get actual debate process participants
  const debateProcessAgents = debateProcess?.agents?.sub_agent || [];
  const actualParticipants = debateProcessAgents.length;

  const handleStartDebate = async () => {
    if (!question.trim()) {
      alert('Please enter debate question.');
      return;
    }

    if (actualParticipants === 0) {
      alert('Debate processor has no configured Agents. Please set up debate participants first.');
      return;
    }

    if (coreExperts.length < 5) {
      alert('Insufficient core expert Agents. Need 5 core experts to start debate.');
      return;
    }

    setIsStarting(true);
    try {
      // Create session and start debate
      const sessionId = await ApiService.createSession(userId);

      // Save session to history
      await ApiService.saveSessionToHistory({
        sessionId,
        userId,
        question,
        maxIterations,
        participantCount: actualParticipants,
      });

      // Navigate to monitor with session info
      navigate('/monitor', {
        state: {
          sessionId,
          question,
          maxIterations,
          userId,
        },
      });
    } catch (error) {
      console.error('Failed to start debate:', error);
      alert('Failed to start debate. Please check network connection and API status.');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Debate Setup
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                辯論配置
              </Typography>

              <TextField
                fullWidth
                label="辯論問題"
                placeholder="請輸入您想要討論的問題..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                multiline
                rows={4}
                margin="normal"
              />

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="使用者ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>最大迭代次數</InputLabel>
                    <Select
                      value={maxIterations}
                      label="最大迭代次數"
                      onChange={(e) => setMaxIterations(e.target.value as number)}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} 次
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartDebate}
                  disabled={isStarting || !question.trim()}
                  sx={{ flex: 1 }}
                >
                  {isStarting ? '啟動中...' : '開始辯論'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  重新載入
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                辯論摘要
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="預設專家"
                    secondary={`${coreExperts.length} 個`}
                  />
                  <Chip
                    label={coreExperts.length === 5 ? "完整" : "不足"}
                    color={coreExperts.length === 5 ? "success" : "warning"}
                    size="small"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <SmartToyIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="自定義專家"
                    secondary={`${customAgents.length} 個`}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="辯論處理器參與者"
                    secondary={`${actualParticipants} 個 (實際)`}
                  />
                  <Chip
                    label={actualParticipants > 0 ? "已配置" : "未配置"}
                    color={actualParticipants > 0 ? "success" : "error"}
                    size="small"
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="最大迭代次數"
                    secondary={`${maxIterations} 次`}
                  />
                </ListItem>
              </List>

              {coreExperts.length < 5 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  核心專家不足，需要5個才能啟動辯論
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  載入Agent失敗，請檢查API連線
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Agent List */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                參與Agent
              </Typography>

              <Typography variant="subtitle2" color="primary" gutterBottom>
                核心專家 ({coreExperts.length}/5)
              </Typography>
              <Box sx={{ mb: 2 }}>
                {coreExperts.map((agent: DebateAgent) => (
                  <Chip
                    key={agent.id}
                    label={agent.name}
                    size="small"
                    color="primary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              {customAgents.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="secondary" gutterBottom>
                    自定義專家 ({customAgents.length})
                  </Typography>
                  <Box>
                    {customAgents.map((agent: DebateAgent) => (
                      <Chip
                        key={agent.id}
                        label={agent.name}
                        size="small"
                        color="secondary"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Debate Process Status */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <DebateProcessStatus showActions={true} />
        </Grid>
      </Grid>
    </Box>
  );
}