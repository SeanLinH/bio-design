import React, { useState } from 'react';
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

  // 獲取session歷史記錄 - 使用實際API端點 (CLAUDE.md #9)
  const { data: sessions = [], isLoading, error, refetch } = useQuery(
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

  // 創建新session的mutation
  const createSessionMutation = useMutation(
    (userId: string) => ApiService.createSession(userId),
    {
      onSuccess: (sessionId) => {
        queryClient.invalidateQueries('sessionHistory');
        setOpenDialog(false);
        alert(`新會話已創建，Session ID: ${sessionId}`);
      },
      onError: (error) => {
        console.error('Failed to create session:', error);
        alert('創建會話失敗');
      },
    }
  );

  // 刪除session的mutation
  const deleteSessionMutation = useMutation(
    (sessionId: string) => ApiService.deleteSession(sessionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sessionHistory');
        alert('會話已刪除');
      },
      onError: (error) => {
        console.error('Failed to delete session:', error);
        alert('刪除會話失敗');
      },
    }
  );

  const handleCreateSession = () => {
    if (!newSessionUserId.trim()) {
      alert('請輸入用戶ID');
      return;
    }
    createSessionMutation.mutate(newSessionUserId);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('確定要刪除這個會話嗎？')) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  const handleViewSession = (session: SessionRecord) => {
    setSelectedSession(session);
    // 導航到會話詳情頁面，使用實際的 session ID
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
        return '進行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失敗';
      default:
        return '未知';
    }
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          會話歷史記錄
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            sx={{ mr: 2 }}
          >
            重新載入
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            創建新會話
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          無法連接到會話歷史API，正在顯示備用數據。請檢查網路連接或伺服器狀態。
          <br />
          <small>API端點: /spaces/13/apps/12/users/user1/sessions</small>
        </Alert>
      )}

      {/* 統計卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                總會話數
              </Typography>
              <Typography variant="h4" component="h2" color="primary">
                {sessions.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                進行中
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
                已完成
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
                失敗
              </Typography>
              <Typography variant="h4" component="h2" color="error.main">
                {sessions.filter((s: SessionRecord) => s.status === 'failed').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 會話列表 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            會話列表
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Session ID</TableCell>
                  <TableCell>用戶ID</TableCell>
                  <TableCell>創建時間</TableCell>
                  <TableCell>問題</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>參與者數量</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">
                        暫無會話記錄
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
                        {new Date(session.createdAt).toLocaleString('zh-TW')}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {session.question || '未設定'}
                        </Typography>
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
                          onClick={() => handleDeleteSession(session.id)}
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

          {/* 分頁 */}
          {sessions.length > 0 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={Math.ceil(sessions.length / pageSize)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 創建新會話對話框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>創建新會話</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="用戶ID"
            value={newSessionUserId}
            onChange={(e) => setNewSessionUserId(e.target.value)}
            margin="normal"
            placeholder="輸入用戶ID，例如：user1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={createSessionMutation.isLoading}
          >
            {createSessionMutation.isLoading ? '創建中...' : '創建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}