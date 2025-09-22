import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  SmartToy as SmartToyIcon,
  Timeline as TimelineIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import ApiService from '../../services/ApiService.ts';
import DebateProcessStatus from '../../components/debate/DebateProcessStatus.tsx';

interface DashboardStats {
  totalAgents: number;
  coreExperts: number;
  customAgents: number;
  recentSessions: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    coreExperts: 0,
    customAgents: 0,
    recentSessions: 0,
  });

  // Fetch agents data
  const { data: agents, isLoading, error: agentsError } = useQuery('agents', ApiService.getAgents, {
    onSuccess: (agentsData) => {
      const coreExpertNames = [
        'supply_chain',
        'materials_manager',
        'logistics_expert',
        'risk_management',
        'regulatory_authority'
      ];

      const coreExperts = agentsData.filter((agent: any) =>
        coreExpertNames.includes(agent.name)
      );

      const customAgents = agentsData.filter((agent: any) => {
        const fixedAgentIds = [136, 137, 138, 139, 140, 141]; // unmet_need_source, reporter, debate_process, convergencer, problem_solver, entire_process
        return !coreExpertNames.includes(agent.name) && !fixedAgentIds.includes(agent.id);
      });


      setStats({
        totalAgents: agentsData.length,
        coreExperts: coreExperts.length,
        customAgents: customAgents.length,
        recentSessions: 0, // TODO: Implement session tracking
      });
    },
  });

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        系統總覽
      </Typography>

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}


      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="總計Agent"
            value={stats.totalAgents}
            icon={<SmartToyIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="核心專家"
            value={stats.coreExperts}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="自定義Agent"
            value={stats.customAgents}
            icon={<SmartToyIcon sx={{ fontSize: 40 }} />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="會話記錄"
            value={stats.recentSessions}
            icon={<TimelineIcon sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                快速操作
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => navigate('/setup')}
                  size="large"
                >
                  開始新的辯論
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/agents')}
                  size="large"
                >
                  管理Agent
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  onClick={() => navigate('/monitor')}
                  size="large"
                >
                  監控辯論
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <DebateProcessStatus />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                系統狀態
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>API連接狀態</Typography>
                  <Chip label="正常" color="success" size="small" />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>核心專家Agent</Typography>
                  <Chip
                    label={`${stats.coreExperts}/5 可用`}
                    color={stats.coreExperts === 5 ? "success" : "warning"}
                    size="small"
                  />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>辯論處理器</Typography>
                  <Chip label="就緒" color="success" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}