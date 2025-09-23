import React, { useState } from 'react';
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
  Grid,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  ListItemSecondaryAction,
  Snackbar,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  SmartToy as SmartToyIcon,
  Sync as SyncIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ApiService from '../../services/ApiService.ts';

interface DebateProcessStatusProps {
  showActions?: boolean;
  compact?: boolean;
  enhanced?: boolean; // New prop for enhanced agent management
}

export default function DebateProcessStatus({ showActions = true, compact = false, enhanced = false }: DebateProcessStatusProps) {
  const queryClient = useQueryClient();
  const [loadingAgentId, setLoadingAgentId] = useState<number | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    agentName?: string;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
      queryClient.invalidateQueries('agents');
    },
  });

  // Helper function to show notifications
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Add agent to debate process mutation
  const addAgentMutation = useMutation((agentId: number) => ApiService.addAgentToDebateProcess(agentId), {
    onMutate: (agentId: number) => {
      setLoadingAgentId(agentId);
      const agent = allAgents.find((a: any) => a.id === agentId);
      console.log(`🔄 [UI] Starting to add agent ${agentId} (${agent?.name}) to debate process`);
    },
    onSuccess: (data, agentId) => {
      queryClient.invalidateQueries('debateProcess');
      queryClient.invalidateQueries('agents');
      setLoadingAgentId(null);

      const agent = allAgents.find((a: any) => a.id === agentId);
      const agentName = agent?.name || `Agent ${agentId}`;
      console.log(`✅ [UI] Successfully added agent ${agentId} (${agentName}) to debate process`);
      showNotification(`已成功將 ${agentName} 加入辯論`, 'success');
    },
    onError: (error: any, agentId) => {
      setLoadingAgentId(null);
      const agent = allAgents.find((a: any) => a.id === agentId);
      const agentName = agent?.name || `Agent ${agentId}`;

      console.error(`❌ [UI] Failed to add agent ${agentId} (${agentName}) to debate process:`, error);

      let errorMessage = `添加 ${agentName} 到辯論失敗`;
      if (error?.message?.includes('not currently in the debate process')) {
        errorMessage = `${agentName} 已經在辯論中`;
      } else if (error?.message?.includes('network') || error?.code === 'ERR_NETWORK') {
        errorMessage = `網路連線錯誤，請檢查後端伺服器狀態`;
      } else if (error?.response?.status === 404) {
        errorMessage = `找不到 Agent ${agentName}`;
      } else if (error?.response?.status >= 500) {
        errorMessage = `伺服器錯誤，請稍後再試`;
      }

      showNotification(errorMessage, 'error');
    },
  });

  // Remove agent from debate process mutation
  const removeAgentMutation = useMutation((agentId: number) => ApiService.removeAgentFromDebateProcess(agentId), {
    onMutate: (agentId: number) => {
      console.log('🚀 [UI-DEBUG] removeAgentMutation.onMutate called with agentId:', agentId);
      setLoadingAgentId(agentId);
      const agent = allAgents.find((a: any) => a.id === agentId);
      console.log(`🔄 [UI] Starting to remove agent ${agentId} (${agent?.name}) from debate process`);
    },
    onSuccess: (data, agentId) => {
      queryClient.invalidateQueries('debateProcess');
      queryClient.invalidateQueries('agents');
      setLoadingAgentId(null);

      const agent = allAgents.find((a: any) => a.id === agentId);
      const agentName = agent?.name || `Agent ${agentId}`;
      console.log(`✅ [UI] Successfully removed agent ${agentId} (${agentName}) from debate process`);
      showNotification(`已成功將 ${agentName} 從辯論中移除`, 'success');
    },
    onError: (error: any, agentId) => {
      setLoadingAgentId(null);
      const agent = allAgents.find((a: any) => a.id === agentId);
      const agentName = agent?.name || `Agent ${agentId}`;

      console.error(`❌ [UI] Failed to remove agent ${agentId} (${agentName}) from debate process:`, error);

      let errorMessage = `移除 ${agentName} 失敗`;
      if (error?.message?.includes('Cannot remove all agents')) {
        errorMessage = `無法移除所有Agent，至少需要保留一個`;
      } else if (error?.message?.includes('not currently in the debate process')) {
        errorMessage = `${agentName} 不在辯論中`;
      } else if (error?.message?.includes('network') || error?.code === 'ERR_NETWORK') {
        errorMessage = `網路連線錯誤，請檢查後端伺服器狀態`;
      } else if (error?.response?.status === 404) {
        errorMessage = `找不到 Agent ${agentName}`;
      } else if (error?.response?.status >= 500) {
        errorMessage = `伺服器錯誤，請稍後再試`;
      }

      showNotification(errorMessage, 'error');
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

  const handleAddAgent = (agentId: number) => {
    // Prevent double-clicks during loading
    if (loadingAgentId !== null || addAgentMutation.isLoading) {
      console.log('🚫 [UI] Add operation already in progress, ignoring click');
      return;
    }

    addAgentMutation.mutate(agentId);
  };

  const handleRemoveAgent = (agentId: number) => {
    console.log('🎯 [UI-DEBUG] handleRemoveAgent called with agentId:', agentId);

    // Prevent double-clicks during loading
    if (loadingAgentId !== null || removeAgentMutation.isLoading) {
      console.log('🚫 [UI-DEBUG] Remove operation already in progress, ignoring click. loadingAgentId:', loadingAgentId, 'removeAgentMutation.isLoading:', removeAgentMutation.isLoading);
      return;
    }

    const agent = allAgents.find((a: any) => a.id === agentId);
    const agentName = agent?.name || `Agent ${agentId}`;
    const isCoreExpert = expectedCoreAgents.includes(agentId);

    console.log('🎯 [UI-DEBUG] Agent details - name:', agentName, 'isCoreExpert:', isCoreExpert);
    console.log('🎯 [UI-DEBUG] Current processAgentIds:', processAgentIds);

    // Check if this would remove all agents
    const currentAgentCount = processAgentIds.length;
    console.log('🎯 [UI-DEBUG] Current agent count:', currentAgentCount);

    if (currentAgentCount <= 1) {
      console.log('🚫 [UI-DEBUG] Cannot remove - would leave no agents');
      showNotification('無法移除所有Agent，至少需要保留一個', 'warning');
      return;
    }

    // Show confirmation for core experts
    if (isCoreExpert) {
      console.log('🎯 [UI-DEBUG] Core expert detected - showing confirmation dialog');
      setConfirmDialog({
        open: true,
        title: '確認移除核心專家',
        message: `您確定要將核心專家 "${agentName}" 從辯論中移除嗎？這可能會影響辯論的完整性。`,
        agentName,
        onConfirm: () => {
          console.log('🎯 [UI-DEBUG] Core expert removal confirmed - calling mutation');
          setConfirmDialog(prev => ({ ...prev, open: false }));
          removeAgentMutation.mutate(agentId);
        }
      });
    } else {
      // Direct removal for custom agents
      console.log('🎯 [UI-DEBUG] Custom agent detected - calling mutation directly');
      removeAgentMutation.mutate(agentId);
    }
  };

  // Get available agents (not in debate process)
  const getAvailableAgents = () => {
    const fixedAgentIds = [136, 137, 138, 139, 140, 141]; // Fixed agents that should not be shown
    return allAgents.filter((agent: any) =>
      !fixedAgentIds.includes(agent.id) &&
      !processAgentIds.includes(agent.id)
    );
  };

  // Helper function to get agent type info
  const getAgentTypeInfo = (agent: any) => {
    if (expectedCoreAgents.includes(agent.id)) {
      return { label: '核心專家', color: 'primary' as const };
    } else {
      return { label: '自定義', color: 'secondary' as const };
    }
  };

  // Render shared dialogs and notifications
  const renderDialogs = () => (
    <>
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            color="primary"
          >
            取消
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            確認移除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  if (compact) {
    return (
      <>
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
        {renderDialogs()}
      </>
    );
  }

  // Enhanced view with granular agent management
  if (enhanced) {
    const availableAgents = getAvailableAgents();

    return (
      <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <SmartToyIcon />
              辯論處理器管理
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

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Current Debate Agents */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" display="flex" alignItems="center" gap={1} mb={2}>
                  <PersonRemoveIcon color="primary" />
                  辯論參與者 ({processAgentIds.length})
                </Typography>
                <List dense>
                  {processAgents.map((agent: any) => {
                    const typeInfo = getAgentTypeInfo(agent);
                    const isLoading = loadingAgentId === agent.id;

                    return (
                      <ListItem key={agent.id}>
                        <ListItemIcon>
                          <CheckCircleIcon
                            color={expectedCoreAgents.includes(agent.id) ? "success" : "info"}
                            fontSize="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              {agent.name}
                              <Chip
                                label={typeInfo.label}
                                color={typeInfo.color}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={`ID: ${agent.id}`}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="從辯論中移除">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveAgent(agent.id)}
                              disabled={isLoading || removeAgentMutation.isLoading}
                              color="error"
                            >
                              {isLoading ? (
                                <CircularProgress size={16} />
                              ) : (
                                <RemoveIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                  {processAgents.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="尚無參與的Agent"
                        secondary="請從右側可用Agent中選擇"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Available Agents */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" display="flex" alignItems="center" gap={1} mb={2}>
                  <PersonAddIcon color="secondary" />
                  可用Agent ({availableAgents.length})
                </Typography>
                <List dense>
                  {availableAgents.map((agent: any) => {
                    const typeInfo = getAgentTypeInfo(agent);
                    const isLoading = loadingAgentId === agent.id;

                    return (
                      <ListItem key={agent.id}>
                        <ListItemIcon>
                          <SmartToyIcon
                            color={expectedCoreAgents.includes(agent.id) ? "primary" : "secondary"}
                            fontSize="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              {agent.name}
                              <Chip
                                label={typeInfo.label}
                                color={typeInfo.color}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={`ID: ${agent.id}`}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="加入辯論">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleAddAgent(agent.id)}
                              disabled={isLoading || addAgentMutation.isLoading}
                              color="primary"
                            >
                              {isLoading ? (
                                <CircularProgress size={16} />
                              ) : (
                                <AddIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                  {availableAgents.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="所有Agent已參與辯論"
                        secondary="可建立新的自定義Agent"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>

          {showActions && (
            <Box mt={3}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<SyncIcon />}
                    onClick={handleSyncProcess}
                    disabled={updateProcessMutation.isLoading}
                    fullWidth
                  >
                    {updateProcessMutation.isLoading ? '更新中...' : '同步所有可用Agent'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<RemoveIcon />}
                    onClick={() => updateProcessMutation.mutate(expectedCoreAgents)}
                    disabled={updateProcessMutation.isLoading}
                    fullWidth
                  >
                    重置為核心專家
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      {renderDialogs()}
      </>
    );
  }

  // Original compact/standard view
  return (
    <>
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
    {renderDialogs()}
    </>
  );
}