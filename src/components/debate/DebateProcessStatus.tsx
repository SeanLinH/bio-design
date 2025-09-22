import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  SmartToy as SmartToyIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ApiService from '../../services/ApiService.ts';

interface DebateProcessStatusProps {
  showActions?: boolean;
  compact?: boolean;
}

export default function DebateProcessStatus({ showActions = true, compact = false }: DebateProcessStatusProps) {
  const queryClient = useQueryClient();

  // Fetch current debate process configuration
  const {
    data: debateProcess,
    isLoading: isLoadingProcess,
    error: processError
  } = useQuery('debateProcess', ApiService.getDebateProcessConfig);

  // Fetch all agents to map IDs to names
  const {
    data: allAgents = [],
    isLoading: isLoadingAgents
  } = useQuery('agents', ApiService.getAgents);

  // Update debate process mutation
  const updateProcessMutation = useMutation(ApiService.updateDebateProcess, {
    onSuccess: () => {
      queryClient.invalidateQueries('debateProcess');
    },
  });

  const isLoading = isLoadingProcess || isLoadingAgents;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (processError) {
    return (
      <Alert severity="error">
        無法載入辯論處理器配置
      </Alert>
    );
  }

  const processAgentIds = debateProcess?.agents?.sub_agent || [];
  const expectedCoreAgents = [131, 132, 133, 134, 135];

  // Map agent IDs to agent objects
  const processAgents = processAgentIds
    .map((id: number) => allAgents.find((agent: any) => agent.id === id))
    .filter(Boolean);

  // Check if all core experts are in the process
  const missingCoreAgents = expectedCoreAgents.filter(id => !processAgentIds.includes(id));
  const extraAgents = processAgentIds.filter((id: number) => !expectedCoreAgents.includes(id));

  const isOptimal = missingCoreAgents.length === 0;
  const hasIssues = missingCoreAgents.length > 0;

  const handleSyncProcess = () => {
    // Get all available agent IDs (core + custom), excluding fixed agents
    const fixedAgentIds = [136, 137, 138, 139, 140, 141]; // unmet_need_source, reporter, debate_process, convergencer, problem_solver, entire_process
    const allAvailableIds = allAgents.map((agent: any) => agent.id)
      .filter((id: number) => !fixedAgentIds.includes(id));

    updateProcessMutation.mutate(allAvailableIds);
  };

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <SmartToyIcon color={isOptimal ? 'success' : 'warning'} />
        <Typography variant="body2">
          辯論參與者: {processAgentIds.length} 個
        </Typography>
        <Chip
          label={isOptimal ? "就緒" : "需要更新"}
          color={isOptimal ? "success" : "warning"}
          size="small"
        />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <SmartToyIcon />
            辯論處理器狀態
          </Typography>
          {isOptimal ? (
            <Chip label="就緒" color="success" icon={<CheckCircleIcon />} />
          ) : (
            <Chip label="需要更新" color="warning" icon={<WarningIcon />} />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          當前參與辯論的Agent: {processAgentIds.length} 個
        </Typography>

        {hasIssues && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {missingCoreAgents.length > 0 && (
              <Typography variant="body2">
                缺少 {missingCoreAgents.length} 個核心專家Agent
              </Typography>
            )}
          </Alert>
        )}

        <List dense>
          {processAgents.map((agent: any) => (
            <ListItem key={agent.id}>
              <ListItemIcon>
                <CheckCircleIcon
                  color={expectedCoreAgents.includes(agent.id) ? "success" : "info"}
                  fontSize="small"
                />
              </ListItemIcon>
              <ListItemText
                primary={agent.name}
                secondary={`ID: ${agent.id} ${expectedCoreAgents.includes(agent.id) ? '(核心專家)' : '(自定義)'}`}
              />
            </ListItem>
          ))}
        </List>

        {showActions && (
          <Box mt={2}>
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={handleSyncProcess}
              disabled={updateProcessMutation.isLoading}
              fullWidth
            >
              {updateProcessMutation.isLoading ? '更新中...' : '同步所有可用Agent'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}