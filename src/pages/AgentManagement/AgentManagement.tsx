import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Menu,
  MenuItem,
  Fab,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ApiService from '../../services/ApiService.ts';
import { DebateAgent } from '../../context/DebateContext';
import DebateProcessStatus from '../../components/debate/DebateProcessStatus.tsx';

interface AgentFormData {
  name: string;
  instruction: string;
  description: string;
  temperature: number;
  max_tokens: number;
}

export default function AgentManagement() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState<DebateAgent | null>(null);
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    instruction: '',
    description: '',
    temperature: 0.7,
    max_tokens: 131072,
  });

  // Helper function to check if an agent is editable
  const isAgentEditable = (agent: DebateAgent) => {
    // Core experts (always editable)
    const coreExpertIds = [131, 132, 133, 134, 135];
    // Reporter (always editable, but with restrictions)
    const reporterId = 137;
    // Fixed agents that should never be editable
    const fixedAgentIds = [136, 138, 139, 140, 141];

    if (coreExpertIds.includes(agent.id!) || agent.id === reporterId) {
      return true;
    }

    // Custom agents are editable if they're not in the fixed agents list
    if (!fixedAgentIds.includes(agent.id!)) {
      return true;
    }

    return false;
  };

  // Fetch agents
  const { data: agents = [], isLoading, error } = useQuery('agents', ApiService.getAgents);

  // Create agent mutation
  const createAgentMutation = useMutation(ApiService.createAgent, {
    onSuccess: () => {
      queryClient.invalidateQueries('agents');
      queryClient.invalidateQueries('debateProcess');
      setOpenDialog(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to create agent:', error);
      alert('Failed to create Agent. Please check network connection and input.');
    },
  });

  // Update agent mutation
  const updateAgentMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => ApiService.updateAgent(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        setOpenDialog(false);
        setEditingAgent(null);
        resetForm();
      },
    }
  );

  // Update reporter mutation
  const updateReporterMutation = useMutation(ApiService.updateReporter, {
    onSuccess: () => {
      queryClient.invalidateQueries('agents');
      setOpenDialog(false);
      setEditingAgent(null);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to update reporter:', error);
      alert('Failed to update reporter. Please check network connection.');
    },
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation(ApiService.deleteAgent, {
    onSuccess: () => {
      queryClient.invalidateQueries('agents');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      instruction: '',
      description: '',
      temperature: 0.7,
      max_tokens: 131072,
    });
  };

  const handleOpenDialog = async (agent?: DebateAgent) => {
    if (agent) {
      try {
        // 獲取 agent 的完整詳細信息
        const agentDetails = await ApiService.getAgentDetails(agent.id!);
        setEditingAgent(agentDetails);
        setFormData({
          name: agentDetails.name,
          instruction: agentDetails.instruction || '',
          description: agentDetails.description || '',
          temperature: agentDetails.temperature || 0.7,
          max_tokens: agentDetails.max_tokens || 131072,
        });
      } catch (error) {
        console.error('Failed to load agent details:', error);
        alert('Failed to load Agent detailed information.');
        return;
      }
    } else {
      setEditingAgent(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAgent(null);
    resetForm();
  };

  const handleSave = () => {
    if (editingAgent) {
      // Special handling for reporter - only update instruction
      if (editingAgent.name === 'reporter') {
        updateReporterMutation.mutate(formData.instruction);
      } else {
        updateAgentMutation.mutate({
          id: editingAgent.id!,
          data: formData,
        });
      }
    } else {
      createAgentMutation.mutate({
        ...formData,
        name: `${formData.name}_${Date.now()}`, // Ensure unique name
      });
    }
  };

  const handleDelete = (agentId: number) => {
    if (window.confirm('Are you sure you want to delete this Agent?')) {
      deleteAgentMutation.mutate(agentId);
    }
  };

  const handleTemplateSelect = async (template: any) => {
    // 如果是從已有agent選擇模板，獲取完整詳細信息
    if (template.id) {
      try {
        const agentDetails = await ApiService.getAgentDetails(template.id);
        setFormData({
          name: agentDetails.name,
          instruction: agentDetails.instruction || '',
          description: agentDetails.description || '',
          temperature: agentDetails.temperature || 0.7,
          max_tokens: agentDetails.max_tokens || 131072,
        });
      } catch (error) {
        console.error('Failed to load template details:', error);
        // 降級到基本信息
        setFormData({
          name: template.name,
          instruction: template.instruction || '',
          description: template.description || '',
          temperature: 0.7,
          max_tokens: 131072,
        });
      }
    } else {
      // 預定義模板
      setFormData({
        name: template.name,
        instruction: template.instruction || '',
        description: template.description || '',
        temperature: 0.7,
        max_tokens: 131072,
      });
    }
    setTemplateMenuAnchor(null);
    setOpenDialog(true);
  };

  const getAgentType = (agent: DebateAgent) => {
    const coreExpertNames = [
      'supply_chain',
      'materials_manager',
      'logistics_expert',
      'risk_management',
      'regulatory_authority'
    ];

    if (coreExpertNames.includes(agent.name)) {
      return { label: 'Core Expert', color: 'primary' as const };
    } else if (agent.name === 'reporter') {
      return { label: 'Reporter', color: 'secondary' as const };
    } else if (agent.name === 'debate_process') {
      return { label: 'Debate Processor', color: 'info' as const };
    } else {
      return { label: 'Custom', color: 'default' as const };
    }
  };

  const templates = ApiService.getDefaultAgentTemplates();

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load Agents</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Agent Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
            sx={{ mr: 2 }}
          >
            Use Template
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Agent
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {agents.filter((agent: DebateAgent) => {
          // Hide fixed agents that should not be displayed in UI
          const fixedAgentIds = [136, 138, 139, 140, 141]; // unmet_need_source, debate_process, convergencer, problem_solver, entire_process
          return !fixedAgentIds.includes(agent.id!);
        }).map((agent: DebateAgent) => {
          const agentType = getAgentType(agent);
          const isEditable = isAgentEditable(agent);
          const isDeletable = !['reporter', 'debate_process'].includes(agent.name) &&
                             !['supply_chain', 'materials_manager', 'logistics_expert', 'risk_management', 'regulatory_authority'].includes(agent.name);

          return (
            <Grid item xs={12} md={6} lg={4} key={agent.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {agent.name}
                    </Typography>
                    <Chip label={agentType.label} color={agentType.color} size="small" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {agent.description}
                  </Typography>

                  <Box display="flex" gap={1} mb={2}>
                    <Chip label={`Temperature: ${agent.temperature}`} size="small" variant="outlined" />
                    <Chip label={`Max Tokens: ${agent.max_tokens}`} size="small" variant="outlined" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {agent.instruction}
                  </Typography>
                </CardContent>

                <Box display="flex" justifyContent="space-between" p={2} pt={0}>
                  <Box>
                    {isEditable && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(agent)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleTemplateSelect(agent)}
                      color="secondary"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Box>
                  {isDeletable && (
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(agent.id!)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Debate Process Management */}
      <Box sx={{ mt: 4 }}>
        <DebateProcessStatus showActions={true} enhanced={true} />
      </Box>

      {/* Template Menu */}
      <Menu
        anchorEl={templateMenuAnchor}
        open={Boolean(templateMenuAnchor)}
        onClose={() => setTemplateMenuAnchor(null)}
      >
        {templates.map((template, index) => (
          <MenuItem
            key={index}
            onClick={() => handleTemplateSelect(template)}
          >
            {template.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Agent Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAgent ? 'Edit Agent' : 'Add Agent'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              disabled={!!editingAgent}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              disabled={editingAgent && editingAgent.name === 'reporter'}
            />
            <TextField
              fullWidth
              label="Instruction"
              value={formData.instruction}
              onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
              margin="normal"
              multiline
              rows={8}
            />
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>Temperature: {formData.temperature}</Typography>
              <Slider
                value={formData.temperature}
                onChange={(_, value) => setFormData({ ...formData, temperature: value as number })}
                min={0}
                max={2}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                disabled={editingAgent && editingAgent.name === 'reporter'}
              />
            </Box>
            <TextField
              fullWidth
              label="Max Tokens"
              type="number"
              value={formData.max_tokens}
              onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
              margin="normal"
              disabled={editingAgent && editingAgent.name === 'reporter'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={createAgentMutation.isLoading || updateAgentMutation.isLoading || updateReporterMutation.isLoading}
          >
            {editingAgent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}