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
                Debate Configuration
              </Typography>

              <TextField
                fullWidth
                label="Debate Question"
                placeholder="Please enter the question you want to discuss..."
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
                    label="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Max Iterations</InputLabel>
                    <Select
                      value={maxIterations}
                      label="Max Iterations"
                      onChange={(e) => setMaxIterations(e.target.value as number)}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} iterations
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
                  {isStarting ? 'Starting...' : 'Start Debate'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  Reload
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
                Debate Summary
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Default Experts"
                    secondary={`${coreExperts.length} experts`}
                  />
                  <Chip
                    label={coreExperts.length === 5 ? "Complete" : "Insufficient"}
                    color={coreExperts.length === 5 ? "success" : "warning"}
                    size="small"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <SmartToyIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Custom Experts"
                    secondary={`${customAgents.length} experts`}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Debate Processor Participants"
                    secondary={`${actualParticipants} (actual)`}
                  />
                  <Chip
                    label={actualParticipants > 0 ? "Configured" : "Not Configured"}
                    color={actualParticipants > 0 ? "success" : "error"}
                    size="small"
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Max Iterations"
                    secondary={`${maxIterations} iterations`}
                  />
                </ListItem>
              </List>

              {coreExperts.length < 5 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Insufficient core experts, need 5 to start debate
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Failed to load Agents, please check API connection
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Agent List */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Participating Agents
              </Typography>

              <Typography variant="subtitle2" color="primary" gutterBottom>
                Core Experts ({coreExperts.length}/5)
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
                    Custom Experts ({customAgents.length})
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