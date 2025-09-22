import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApiService from '../services/ApiService';

const ApiTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('/spaces/13/agents/138');

  const addTestResult = (test) => {
    setTestResults(prev => [test, ...prev]);
  };

  const testConnection = async () => {
    setLoading(true);
    const testStart = Date.now();

    try {
      console.log('🧪 Starting connection test...');

      // Test 1: Simple API call
      const response = await ApiService.getAgentDetails(138);
      const duration = Date.now() - testStart;

      addTestResult({
        id: Date.now(),
        type: 'success',
        title: 'API 连接测试成功',
        details: {
          duration: `${duration}ms`,
          data: response,
          url: 'GET /spaces/13/agents/138'
        }
      });

    } catch (error) {
      const duration = Date.now() - testStart;
      addTestResult({
        id: Date.now(),
        type: 'error',
        title: 'API 连接测试失败',
        details: {
          duration: `${duration}ms`,
          error: error.message,
          status: error.response?.status,
          url: 'GET /spaces/13/agents/138',
          fullError: error
        }
      });
    }

    setLoading(false);
  };

  const testCorsDirectly = async () => {
    setLoading(true);
    const testStart = Date.now();

    try {
      console.log('🧪 Testing CORS directly with fetch...');

      const response = await fetch('http://localhost:8080/api/v1/spaces/13/agents/138', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const data = await response.json();
      const duration = Date.now() - testStart;

      addTestResult({
        id: Date.now(),
        type: 'success',
        title: 'Direct Fetch CORS 测试成功',
        details: {
          duration: `${duration}ms`,
          status: response.status,
          data: data,
          url: 'Direct fetch to localhost:8080'
        }
      });

    } catch (error) {
      const duration = Date.now() - testStart;
      addTestResult({
        id: Date.now(),
        type: 'error',
        title: 'Direct Fetch CORS 测试失败',
        details: {
          duration: `${duration}ms`,
          error: error.message,
          url: 'Direct fetch to localhost:8080',
          fullError: error
        }
      });
    }

    setLoading(false);
  };

  const testCustomEndpoint = async () => {
    setLoading(true);
    const testStart = Date.now();

    try {
      console.log(`🧪 Testing custom endpoint: ${customUrl}`);

      const response = await fetch(`http://localhost:8080/api/v1${customUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const data = await response.json();
      const duration = Date.now() - testStart;

      addTestResult({
        id: Date.now(),
        type: 'success',
        title: '自定义端点测试成功',
        details: {
          duration: `${duration}ms`,
          status: response.status,
          data: data,
          url: customUrl
        }
      });

    } catch (error) {
      const duration = Date.now() - testStart;
      addTestResult({
        id: Date.now(),
        type: 'error',
        title: '自定义端点测试失败',
        details: {
          duration: `${duration}ms`,
          error: error.message,
          url: customUrl,
          fullError: error
        }
      });
    }

    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getCurrentConfig = () => {
    return {
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1',
      environment: process.env.REACT_APP_ENVIRONMENT || 'local',
      currentOrigin: window.location.origin,
      userAgent: navigator.userAgent
    };
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 API 连接测试工具
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>当前配置</Typography>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(getCurrentConfig(), null, 2)}
        </pre>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={testConnection}
          disabled={loading}
          color="primary"
        >
          {loading ? <CircularProgress size={20} /> : '测试 API Service'}
        </Button>

        <Button
          variant="outlined"
          onClick={testCorsDirectly}
          disabled={loading}
          color="secondary"
        >
          测试 Direct Fetch
        </Button>

        <Button
          variant="text"
          onClick={clearResults}
          disabled={loading}
        >
          清除结果
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="自定义端点"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="/spaces/13/agents"
          sx={{ flexGrow: 1 }}
          size="small"
        />
        <Button
          variant="outlined"
          onClick={testCustomEndpoint}
          disabled={loading}
        >
          测试自定义端点
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        测试结果 ({testResults.length})
      </Typography>

      {testResults.map((result) => (
        <Accordion key={result.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {result.type === 'success' ? '✅' : '❌'}
              <Typography>{result.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {result.details.duration}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity={result.type === 'success' ? 'success' : 'error'} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">URL: {result.details.url}</Typography>
              {result.details.status && (
                <Typography variant="caption">状态码: {result.details.status}</Typography>
              )}
            </Alert>

            {result.details.data && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>响应数据:</Typography>
                <pre style={{
                  background: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {JSON.stringify(result.details.data, null, 2)}
                </pre>
              </Box>
            )}

            {result.details.error && (
              <Box>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  错误信息:
                </Typography>
                <Typography variant="body2" color="error">
                  {result.details.error}
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {testResults.length === 0 && (
        <Alert severity="info">
          点击上方按钮开始测试 API 连接
        </Alert>
      )}
    </Box>
  );
};

export default ApiTestPage;