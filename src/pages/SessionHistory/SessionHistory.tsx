import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService.ts';

interface SessionRecord {
  id: string;
  userId: string;
  createdAt: string;
  lastUpdateTime?: string;
  question?: string;
  status: 'active' | 'completed' | 'failed';
  participantCount?: number;
}

export default function SessionHistory() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [newSessionUserId, setNewSessionUserId] = useState('user1');

  // Get session history records - using actual API endpoint (CLAUDE.md #9)
  const { data: sessionData, isLoading, error, refetch } = useQuery(
    ['sessionHistory', page, pageSize],
    () => ApiService.getSessionHistory(page, pageSize, 'user1'),
    {
      retry: false,
      onError: (error) => {
        console.log('🔍 [SessionHistory] API error:', error);
      },
      onSuccess: (data) => {
        console.log('🔍 [SessionHistory] Sessions loaded:', data);
      }
    }
  );

  // Extract sessions array and total count from paginated response
  const sessions = sessionData?.sessions || [];
  const totalSessions = sessionData?.total || 0;
  const totalPages = Math.ceil(totalSessions / pageSize);

  // Mutation for creating new session
  const createSessionMutation = useMutation(
    (userId: string) => ApiService.createSession(userId),
    {
      onSuccess: (sessionId) => {
        queryClient.invalidateQueries('sessionHistory');
        setOpenDialog(false);
        alert(`New session created, Session ID: ${sessionId}`);
      },
      onError: (error) => {
        console.error('Failed to create session:', error);
        alert('Failed to create session.');
      },
    }
  );

  // Mutation for deleting session
  const deleteSessionMutation = useMutation(
    ({ sessionId, userId }: { sessionId: string; userId: string }) =>
      ApiService.deleteSession(sessionId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sessionHistory');
        alert('Session deleted successfully.');
      },
      onError: (error) => {
        console.error('Failed to delete session:', error);
        alert('Failed to delete session.');
      },
    }
  );

  const handleCreateSession = () => {
    if (!newSessionUserId.trim()) {
      alert('Please enter User ID.');
      return;
    }
    createSessionMutation.mutate(newSessionUserId);
  };

  const handleDeleteSession = (session: SessionRecord) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      deleteSessionMutation.mutate({
        sessionId: session.id,
        userId: session.userId || 'user1'
      });
    }
  };

  const handleViewSession = (session: SessionRecord) => {
    setSelectedSession(session);
    // Navigate to session detail page using actual session ID
    console.log('🔍 [SessionHistory] Navigating to session detail:', session.id);
    navigate(`/sessions/${session.id}`);
  };

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

  if (isLoading) return <LinearProgress />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Session History
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            sx={{ mr: 2 }}
          >
            Reload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create New Session
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Unable to connect to session history API, showing backup data. Please check network connection or server status.
          <br />
          <small>API Endpoint: /spaces/13/apps/12/users/user1/sessions</small>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Total Sessions
              </Typography>
              <Typography variant="h4" component="h2" color="primary">
                {totalSessions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Active
              </Typography>
              <Typography variant="h4" component="h2" color="primary">
                {sessions.filter((s: SessionRecord) => s.status === 'active').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Completed
              </Typography>
              <Typography variant="h4" component="h2" color="success.main">
                {sessions.filter((s: SessionRecord) => s.status === 'completed').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Failed
              </Typography>
              <Typography variant="h4" component="h2" color="error.main">
                {sessions.filter((s: SessionRecord) => s.status === 'failed').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Session List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Session List
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Session ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Last Update Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">
                        No session records
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session: SessionRecord) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {session.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{session.userId}</TableCell>
                      <TableCell>
                        {session.lastUpdateTime ?
                          new Date(session.lastUpdateTime).toLocaleString('en-US', {
                            timeZone: 'Asia/Taipei',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          }) :
                          new Date(session.createdAt).toLocaleString('en-US', {
                            timeZone: 'Asia/Taipei',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        }
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(session.status)}
                          color={getStatusColor(session.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{session.participantCount || 0}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewSession(session)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSession(session)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {sessions.length > 0 && totalPages > 1 && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
              <Typography variant="body2" color="textSecondary">
                Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalSessions)} of {totalSessions} sessions
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create New Session Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User ID"
            value={newSessionUserId}
            onChange={(e) => setNewSessionUserId(e.target.value)}
            margin="normal"
            placeholder="Enter User ID, e.g.: user1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={createSessionMutation.isLoading}
          >
            {createSessionMutation.isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}