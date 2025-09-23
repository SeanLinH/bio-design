import axios from 'axios';
import { DebateAgent } from '../context/DebateContext';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  // Ensure credentials are sent for CORS
  withCredentials: false, // Set to false for cross-origin requests to localhost
});

// Add request interceptor for ngrok compatibility and debugging
apiClient.interceptors.request.use((config) => {
  console.log('🚀 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    headers: config.headers,
    data: config.data
  });

  // Add ngrok headers if using ngrok environment
  if (BASE_URL.includes('ngrok')) {
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }

  // Always add ngrok header for cross-origin requests
  config.headers['ngrok-skip-browser-warning'] = 'true';

  return config;
}, (error) => {
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
apiClient.interceptors.response.use((response) => {
  console.log('✅ API Response:', {
    status: response.status,
    statusText: response.statusText,
    url: response.config.url,
    data: response.data,
    headers: response.headers
  });
  return response;
}, (error) => {
  console.error('❌ Response Error:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    url: error.config?.url,
    responseData: error.response?.data,
    requestHeaders: error.config?.headers
  });

  // Log more details for CORS errors
  if (error.response?.status === 0 || error.code === 'ERR_NETWORK') {
    console.error('🌐 Network/CORS Error Details:', {
      message: 'This might be a CORS or network connectivity issue',
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      method: error.config?.method
    });
  }

  return Promise.reject(error);
});

// Fixed configuration for your backend
const FIXED_SPACE_ID = 13;
const FIXED_APP_ID = 12;
const FIXED_MODEL_ID = 16;

// Predefined agent IDs from your backend (根据CLAUDE.md更新)
const PREDEFINED_AGENTS = {
  supply_chain: 131,
  materials_manager: 132,
  logistics_expert: 133,
  risk_management: 134,
  regulatory_authority: 135,
  reporter: 137,
  debate_process: 138, // The loop agent that needs to be updated
};

// Fixed agents that cannot be removed or edited by users (no UI display)
const FIXED_AGENTS = {
    unmet_need_source: 136,
    convergencer: 139,
    problem_solver: 140,
    entire_process: 141,
}

export interface ApiResponse<T> {
  data?: T;
  status: string;
  detail?: string;
}

class ApiService {
  // 獲取所有 agents
  async getAgents(): Promise<DebateAgent[]> {
    try {
      console.log('📋 Fetching agents from:', `/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}`);
      const response = await apiClient.get(`/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}`);
      console.log('📋 Agents response:', response.data);
      const agents = response.data.apps?.agents || [];
      console.log('📋 Processed agents:', agents);
      return agents;
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  }

  // 獲取單個 agent 的詳細信息
  async getAgentDetails(agentId: number): Promise<DebateAgent> {
    try {
      console.log('🔍 Fetching agent details for ID:', agentId);
      const response = await apiClient.get(`/spaces/${FIXED_SPACE_ID}/agents/${agentId}`);
      console.log('🔍 Agent details response:', response.data);
      return response.data.agents;
    } catch (error) {
      console.error('❌ Error fetching agent details:', error);
      console.error('❌ Error details:', {
        agentId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  }

  // Create new agent
  async createAgent(agentData: any): Promise<any> {
    try {
      const response = await apiClient.post(`/spaces/${FIXED_SPACE_ID}/agents`, {
        name: agentData.name,
        type: "llm",
        instruction: agentData.instruction,
        description: agentData.description,
        output_key: agentData.name,
        sub_agent: [],
        tools: [],
        model_id: FIXED_MODEL_ID,
        temperature: agentData.temperature || 0.7,
        max_tokens: agentData.max_tokens || 131072
      });

      // After creating agent, add it to debate process
      const newAgentId = response.data.agents?.id;
      if (newAgentId) {
        try {
          // Get current debate process config
          const debateProcessResponse = await this.getDebateProcessConfig();
          const currentAgentIds = debateProcessResponse?.agents?.sub_agent || [];

          // Add new agent to the list
          const updatedAgentIds = [...currentAgentIds, newAgentId];

          // Update debate process
          await this.updateDebateProcess(updatedAgentIds);
        } catch (error) {
          console.warn('Failed to add new agent to debate process:', error);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  // Update existing agent
  async updateAgent(agentId: number, agentData: any): Promise<any> {
    try {
      const response = await apiClient.put(`/spaces/${FIXED_SPACE_ID}/agents/${agentId}`, {
        type: "llm",
        name: agentData.name,
        instruction: agentData.instruction,
        description: agentData.description,
        temperature: agentData.temperature || 0.7,
        max_tokens: agentData.max_tokens || 131072
      });
      return response.data;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }

  // Update reporter (only instruction can be modified)
  async updateReporter(instruction: string): Promise<any> {
    try {
      const response = await apiClient.put(`/spaces/${FIXED_SPACE_ID}/agents/${PREDEFINED_AGENTS.reporter}`, {
        instruction: instruction
      });
      return response.data;
    } catch (error) {
      console.error('Error updating reporter:', error);
      throw error;
    }
  }

  // Delete agent
  async deleteAgent(agentId: number): Promise<any> {
    try {
      const response = await apiClient.delete(`/spaces/${FIXED_SPACE_ID}/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }

  // Get current debate process configuration
  async getDebateProcessConfig(): Promise<any> {
    try {
      const response = await apiClient.get(`/spaces/${FIXED_SPACE_ID}/agents/${PREDEFINED_AGENTS.debate_process}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching debate process config:', error);
      throw error;
    }
  }

  // Update debate process with new agent list
  async updateDebateProcess(agentIds: number[]) {
    try {
      const response = await apiClient.put(`/spaces/${FIXED_SPACE_ID}/agents/${PREDEFINED_AGENTS.debate_process}`, {
        sub_agent: agentIds,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating debate process:', error);
      throw error;
    }
  }

  // Create session
  async createSession(userId: string): Promise<string> {
    try {
      const response = await apiClient.post(
        `/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}/users/${userId}/sessions`,
        {
          additionalProp1: {}
        }
      );

      return response.data.session_id || response.data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Execution - Use fetch for SSE
  async runSSE(question: string, userId: string = 'user1') {
    // 首先創建新的 session
    const sessionId = await this.createSession(userId);
    console.log(`Created session: ${sessionId}`);

    const requestUrl = `${BASE_URL}/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}/run_sse`;
    const requestBody = {
      user_id: userId,
      session_id: sessionId,
      new_message: {
        parts: [
          {
            text: question
          }
        ],
        role: "user"
      },
      streaming: true  // Enable streaming for SSE
    };

    console.log('发送SSE请求:', requestUrl);
    console.log('请求体:', JSON.stringify(requestBody, null, 2));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };

    // Add ngrok headers if using ngrok
    if (BASE_URL.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      }
    );

    console.log('SSE响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SSE请求失败:', response.status, errorText);
      throw new Error(`SSE request failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    return response;
  }

  // Get predefined agent configurations
  getPredefinedAgents() {
    return PREDEFINED_AGENTS;
  }

  // Agent ID to name mapping utility
  getAgentNameFromId(agentIdStr: string): string {
    // Extract numeric ID from agent_XXX format
    const numericId = parseInt(agentIdStr.replace(/^agent_/, ''));

    // Create reverse mapping from IDs to names
    const idToName: { [key: number]: string } = {};
    Object.entries(PREDEFINED_AGENTS).forEach(([name, id]) => {
      idToName[id] = name;
    });

    // Add fixed agents mapping
    const fixedAgentsMapping: { [key: number]: string } = {
      136: 'unmet_need_source',
      139: 'convergencer',
      140: 'problem_solver',
      141: 'entire_process'
    };

    Object.assign(idToName, fixedAgentsMapping);

    // Return friendly name or agent ID if not found
    return idToName[numericId] || agentIdStr;
  }

  // Get display name for agent (more user-friendly)
  getAgentDisplayName(agentIdStr: string): string {
    const agentName = this.getAgentNameFromId(agentIdStr);

    const displayNames: { [key: string]: string } = {
      'supply_chain': '供應鏈專家',
      'materials_manager': '物料管理師',
      'logistics_expert': '物流專家',
      'risk_management': '風險管理師',
      'regulatory_authority': '法規機關',
      'reporter': '報告員',
      'debate_process': '辯論處理器',
      'unmet_need_source': '需求分析器',
      'convergencer': '收斂分析器',
      'problem_solver': '問題解決器',
      'entire_process': '全流程管理器'
    };

    return displayNames[agentName] || agentName;
  }

  // Get fixed configuration
  getFixedConfig() {
    return {
      spaceId: FIXED_SPACE_ID,
      appId: FIXED_APP_ID,
      modelId: FIXED_MODEL_ID,
    };
  }


  // Delete session
  async deleteSession(sessionId: string): Promise<any> {
    try {
      // 實際API調用
      const response = await apiClient.delete(`/spaces/${FIXED_SPACE_ID}/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Get session details using correct API endpoint (CLAUDE.md #9)
  async getSessionDetails(userId: string, sessionId: string): Promise<any> {
    console.log('🔍 [DEBUG] getSessionDetails called with:', { userId, sessionId });

    try {
      // Use correct API endpoint from CLAUDE.md: GET /spaces/13/apps/12/users/{userId}/sessions/{sessionId}
      const apiUrl = `/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}/users/${userId}/sessions/${sessionId}`;
      console.log('🔍 [DEBUG] API URL:', apiUrl);

      const response = await apiClient.get(apiUrl);

      console.log('🔍 [DEBUG] Raw API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // Process the response to match our component expectations
      const sessionData = response.data;
      console.log('🔍 [DEBUG] Session data structure:', {
        keys: Object.keys(sessionData || {}),
        hasMessages: !!(sessionData?.messages),
        hasConversation: !!(sessionData?.conversation),
        hasHistory: !!(sessionData?.history),
        hasChat: !!(sessionData?.chat),
        sessionData: sessionData
      });

      // Check for different possible message field names
      const possibleMessageFields = ['messages', 'conversation', 'history', 'chat', 'content', 'dialogue'];
      let messagesArray = [];
      let foundMessageField = null;

      for (const field of possibleMessageFields) {
        if (sessionData && sessionData[field]) {
          messagesArray = sessionData[field];
          foundMessageField = field;
          console.log(`🔍 [DEBUG] Found messages in field: ${field}`, messagesArray);
          break;
        }
      }

      if (!foundMessageField) {
        console.log('🔍 [DEBUG] No message field found, available fields:', Object.keys(sessionData || {}));
      }

      // Transform the data to match SessionDetailData interface
      const transformedData = {
        id: sessionId,
        userId: userId,
        createdAt: sessionData?.created_at || sessionData?.createdAt || sessionData?.timestamp || new Date().toISOString(),
        question: sessionData?.initial_message || sessionData?.question || sessionData?.prompt || sessionData?.input,
        status: sessionData?.status || 'completed',
        participantCount: sessionData?.participant_count || sessionData?.participantCount || 0,
        messages: this.processSessionMessages(messagesArray)
      };

      console.log('🔍 [DEBUG] Transformed data:', transformedData);
      return transformedData;

    } catch (error: any) {
      console.error('❌ [ERROR] Error fetching session details:', error);
      console.error('❌ [ERROR] Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        requestConfig: error?.config
      });

      // If API fails, try to get from localStorage as fallback
      try {
        const savedSessions = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
        const foundSession = savedSessions.find((s: any) => s.id === sessionId);

        if (foundSession) {
          console.log('🔍 [DEBUG] Using localStorage fallback for session:', foundSession);

          return {
            ...foundSession,
            messages: [
              {
                id: '1',
                role: 'user',
                content: foundSession.question || '會話內容暫無記錄',
                timestamp: foundSession.createdAt,
              },
              {
                id: '2',
                role: 'assistant',
                content: `此會話的詳細對話記錄暫時無法從伺服器獲取，顯示的是儲存在本地的基本資訊。\n\n**調試資訊:**\n- API 端點: /spaces/13/apps/12/users/${userId}/sessions/${sessionId}\n- 錯誤: 無法連接到後端伺服器\n- 建議: 檢查網路連接和伺服器狀態`,
                agentId: 'agent_137',
                timestamp: foundSession.createdAt,
              },
              {
                id: '3',
                role: 'assistant',
                content: '為了測試介面，這裡是一個模擬的專家回應範例:\n\n## 供應鏈風險分析\n\n根據當前市場狀況，我們識別出以下關鍵風險點:\n\n1. **供應商集中度風險**: 高度依賴單一供應商\n2. **運輸延遲風險**: 國際物流瓶頸\n3. **庫存管理風險**: 安全庫存水位偏低\n\n### 建議措施\n- 建立多元化供應商網絡\n- 增加戰略性庫存\n- 實施風險監控系統',
                agentId: 'agent_131',
                timestamp: new Date(Date.now() + 5000).toISOString(),
              }
            ]
          };
        }

        // If no session found in localStorage, create a mock session
        console.log('🔍 [DEBUG] Creating mock session for testing');
        return {
          id: sessionId,
          userId: userId,
          createdAt: new Date().toISOString(),
          question: '這是一個測試會話，用於調試會話詳情功能',
          status: 'completed',
          participantCount: 5,
          messages: [
            {
              id: 'mock_1',
              role: 'user',
              content: '這是一個測試會話，用於調試會話詳情功能。請分析醫療供應鏈的短缺風險。',
              timestamp: new Date().toISOString(),
            },
            {
              id: 'mock_2',
              role: 'assistant',
              content: `**調試模式 - 模擬專家回應**\n\n由於無法連接到實際的API端點，這裡顯示的是模擬數據。\n\n實際API調用失敗的原因可能包括:\n- 網路連接問題\n- 伺服器尚未啟動\n- API端點不正確: /spaces/13/apps/12/users/${userId}/sessions/${sessionId}\n- 認證問題`,
              agentId: 'agent_137',
              timestamp: new Date(Date.now() + 1000).toISOString(),
            }
          ]
        };
      } catch (localError) {
        console.error('❌ [ERROR] Error accessing localStorage:', localError);
      }

      throw error;
    }
  }

  // Helper method to process session messages
  private processSessionMessages(messages: any[]): any[] {
    console.log('🔍 [DEBUG] processSessionMessages input:', {
      messagesType: typeof messages,
      isArray: Array.isArray(messages),
      length: messages?.length,
      messages: messages
    });

    if (!Array.isArray(messages)) {
      console.log('🔍 [DEBUG] Messages is not an array, returning empty array');
      return [];
    }

    if (messages.length === 0) {
      console.log('🔍 [DEBUG] Messages array is empty');
      return [];
    }

    const processedMessages = messages.map((msg, index) => {
      console.log(`🔍 [DEBUG] Processing message ${index}:`, {
        messageKeys: Object.keys(msg || {}),
        msg: msg
      });

      // Try different possible field names for content
      const content = msg.content || msg.text || msg.message || msg.body || msg.response || '';

      // Try different possible field names for agent ID
      const agentId = msg.agent_id || msg.agentId || msg.agent || msg.sender_id || msg.senderId;

      // Try different possible field names for timestamp
      const timestamp = msg.timestamp || msg.created_at || msg.createdAt || msg.time || new Date().toISOString();

      const processedMsg = {
        id: msg.id || msg._id || `msg_${index}`,
        role: msg.role || msg.type || (agentId ? 'assistant' : 'user'),
        content: content,
        agentId: agentId,
        timestamp: timestamp,
        agentName: msg.agent_name || msg.agentName || msg.sender_name || msg.senderName
      };

      console.log(`🔍 [DEBUG] Processed message ${index}:`, processedMsg);
      return processedMsg;
    });

    console.log('🔍 [DEBUG] Final processed messages:', processedMessages);
    return processedMessages;
  }

  // Save session to history (local storage for now)
  async saveSessionToHistory(sessionData: {
    sessionId: string;
    userId: string;
    question: string;
    maxIterations: number;
    participantCount: number;
  }): Promise<void> {
    try {
      // 暫時使用localStorage保存，實際應該調用後端API
      const existingHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
      const newSession = {
        id: sessionData.sessionId,
        userId: sessionData.userId,
        createdAt: new Date().toISOString(),
        question: sessionData.question,
        status: 'active',
        participantCount: sessionData.participantCount,
        maxIterations: sessionData.maxIterations,
      };

      existingHistory.unshift(newSession); // 最新的在前面

      // 只保留最近100條記錄
      if (existingHistory.length > 100) {
        existingHistory.splice(100);
      }

      localStorage.setItem('sessionHistory', JSON.stringify(existingHistory));

      // 實際API調用應該是：
      // const response = await apiClient.post(`/spaces/${FIXED_SPACE_ID}/sessions/history`, newSession);
    } catch (error) {
      console.error('Error saving session to history:', error);
      // 不拋出錯誤，因為這不應該阻止主流程
    }
  }

  // Get session history from real API endpoint (CLAUDE.md #9)
  async getSessionHistory(page: number = 1, pageSize: number = 10, userId: string = 'user1'): Promise<any[]> {
    console.log('🔍 [DEBUG] getSessionHistory called with:', { page, pageSize, userId });

    try {
      // Use correct API endpoint from CLAUDE.md: GET /spaces/13/apps/12/users/user1/sessions
      const apiUrl = `/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}/users/${userId}/sessions`;
      console.log('🔍 [DEBUG] Fetching sessions from API URL:', apiUrl);

      const response = await apiClient.get(apiUrl);

      console.log('🔍 [DEBUG] Raw session history response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // Handle different possible response structures
      let sessions = response.data;
      if (response.data && response.data.sessions) {
        sessions = response.data.sessions;
      } else if (response.data && Array.isArray(response.data)) {
        sessions = response.data;
      } else if (response.data && response.data.data) {
        sessions = response.data.data;
      }

      console.log('🔍 [DEBUG] Processed sessions:', {
        sessionsType: typeof sessions,
        isArray: Array.isArray(sessions),
        length: sessions?.length,
        firstSession: sessions?.[0]
      });

      if (!Array.isArray(sessions)) {
        console.log('🔍 [DEBUG] Sessions is not an array, falling back to mock data');
        return this.getMockSessionHistory();
      }

      // Sort sessions by creation date DESC (newest first)
      const sortedSessions = sessions.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.createdAt || a.timestamp || 0);
        const dateB = new Date(b.created_at || b.createdAt || b.timestamp || 0);
        return dateB.getTime() - dateA.getTime();
      });

      // Apply pagination (10 sessions per page as specified)
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedSessions = sortedSessions.slice(startIndex, endIndex);

      // Transform sessions to match our interface
      const transformedSessions = paginatedSessions.map((session: any) => ({
        id: session.id || session.session_id || session._id,
        userId: session.user_id || session.userId || userId,
        createdAt: session.created_at || session.createdAt || session.timestamp || new Date().toISOString(),
        question: session.initial_message || session.question || session.prompt || session.input || '未知問題',
        status: session.status || 'completed',
        participantCount: session.participant_count || session.participantCount || 0,
      }));

      console.log('🔍 [DEBUG] Final transformed sessions:', transformedSessions);
      return transformedSessions;

    } catch (error: any) {
      console.error('❌ [ERROR] Error fetching session history from API:', error);
      console.error('❌ [ERROR] API Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data
      });

      // Fallback to localStorage first
      try {
        console.log('🔍 [DEBUG] Trying localStorage fallback');
        const savedSessions = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
        if (savedSessions.length > 0) {
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          return savedSessions.slice(startIndex, endIndex);
        }
      } catch (localError) {
        console.error('❌ [ERROR] localStorage fallback failed:', localError);
      }

      // Final fallback to mock data
      console.log('🔍 [DEBUG] Using mock data as final fallback');
      return this.getMockSessionHistory();
    }
  }

  // Helper method for mock session history
  private getMockSessionHistory(): any[] {
    return [
      {
        id: 'mock_session_001',
        userId: 'user1',
        createdAt: new Date().toISOString(),
        question: '分析醫療供應鏈風險 (測試數據)',
        status: 'completed',
        participantCount: 5,
      },
      {
        id: 'mock_session_002',
        userId: 'user1',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        question: '預測藥品短缺風險 (測試數據)',
        status: 'active',
        participantCount: 5,
      },
      {
        id: 'mock_session_003',
        userId: 'user1',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        question: '庫存管理優化建議 (測試數據)',
        status: 'completed',
        participantCount: 5,
      }
    ];
  }

  // Get the 5 core expert agents dynamically by name
  async getCoreExpertAgents(): Promise<DebateAgent[]> {
    try {
      const allAgents = await this.getAgents();

      // Names of the 5 core expert agents (updated with actual names)
      const coreExpertNames = [
        'supply_chain',  // Use actual name from backend
        'materials_manager',
        'logistics_expert',
        'risk_management',
        'regulatory_authority'
      ];

      const coreExperts = allAgents.filter(agent =>
        coreExpertNames.includes(agent.name)
      );

      return coreExperts;
    } catch (error) {
      console.error('Error fetching core expert agents:', error);
      return [];
    }
  }

  // Default agent templates
  getDefaultAgentTemplates() {
    return [
      {
        name: 'supply_chain',
        instruction: `作為供應鏈資料科學家，您負責：

TECHNICAL_FOCUS:
- 開發Graph-Time Series混合模型，捕捉供應鏈網絡拓撲與時間依賴性
- 實施GCN-LSTM/GCN-Transformer架構進行多元時序預測
- 設計供應鏈圖表示學習：節點(供應商/製造商/物流中心)、邊(供應關係/運輸路徑)
- 建構異質圖神經網絡處理不同類型節點(原料商、中間商、終端醫院)

DATA_MODELING:
- 時序特徵：需求量、庫存水位、交期、價格波動
- 圖特徵：供應商評級、地理分布、產能利用率、依賴關係強度
- 外部特徵：疫情指數、政策變化、匯率、地緣政治風險指標

ALGORITHM_REQUIREMENTS:
- 實現多步預測(1-12週短缺風險)
- 提供不確定性量化(置信區間、風險分布)
- 支援what-if情境分析與敏感度分析
- 整合異常檢測識別供應鏈突發事件

OUTPUT_FORMAT:
- 風險評分(0-100)與預警等級(綠/黃/橙/紅)
- 關鍵路徑分析與瓶頸節點識別
- 預測準確度指標與模型可解釋性報告`,
        description: '供應鏈資料科學家，建立先進模型預測供應鏈中斷並優化物流網絡。',
      },
      {
        name: 'materials_manager',
        instruction: `作為醫院藥事/醫材管理者，您負責：

INVENTORY_STRATEGY:
- 根據預警訊號調整安全庫存水準與再訂購點
- 設計ABC分類法結合短缺風險評估的動態庫存策略
- 制定緊急採購程序與供應商多元化方案
- 建立跨院區庫存調配機制

SUBSTITUTION_PLANNING:
- 維護藥品/醫材替代清單與臨床等效性資料庫
- 評估替代品的成本效益與臨床安全性
- 制定替代品切換的標準作業程序(SOP)
- 協調醫師處方調整與護理人員操作訓練

CLINICAL_COORDINATION:
- 與臨床科室溝通短缺影響與替代方案
- 評估短缺對醫療服務品質與病人安全的影響
- 建立優先順序機制：急重症>一般門診>選擇性手術
- 制定短缺通報與追蹤管控流程`,
        description: '醫院物料管理者，實施庫存策略、協調臨床需求並管理替代方案。',
      },
      {
        name: 'logistics_expert',
        instruction: `作為製造與通關物流專家，您負責：

PRODUCTION_OPTIMIZATION:
- 分析製造產能約束與生產排程彈性
- 評估原物料供應穩定性與替代來源
- 制定產能擴充與產線切換策略
- 監控製造品質與法規符合性(GMP/GDP)

LOGISTICS_MANAGEMENT:
- 設計多模式運輸網絡：海運/空運/陸運組合優化
- 建立冷鏈物流監控系統(溫濕度、時效性追蹤)
- 規劃戰略倉儲布局與區域配送中心
- 實施RFID/IoT技術進行全程供應鏈可視化`,
        description: '物流專家，優化生產和運輸，確保海關合規並制定應急計劃。',
      },
      {
        name: 'risk_management',
        instruction: `作為風險管理/巨量經濟分析師，您負責：

MACROECONOMIC_ANALYSIS:
- 監控全球經濟指標：GDP成長率、通膨率、利率變化
- 分析貿易政策與關稅調整對藥品/醫材成本的影響
- 評估主要生產國經濟穩定性與政治風險
- 追蹤原物料價格波動與能源成本變化

CURRENCY_RISK_MANAGEMENT:
- 建立多貨幣匯率預測模型(USD/EUR/JPY/CNY)
- 評估匯率波動對進口成本與採購預算的衝擊
- 設計外匯避險策略：遠期合約、選擇權、掉期交易
- 制定匯率敏感度分析與情境壓力測試`,
        description: '風險管理分析師，監控宏觀經濟趨勢、管理貨幣風險並評估地緣政治因素。',
      },
      {
        name: 'regulatory_authority',
        instruction: `作為主管機關/健保端代表，您負責：

REGULATORY_FRAMEWORK:
- 制定藥品/醫材短缺通報標準與處理程序
- 建立緊急進口許可與快速審查機制
- 協調跨部會應對措施：經濟部、財政部、交通部
- 制定短缺期間的臨時性法規豁免條款

SUBSTITUTION_STANDARDS:
- 建立替代品認定標準與臨床等效性評估
- 制定緊急替代品使用的安全性指引
- 協調學會/專家制定臨床使用建議
- 建立替代品健保給付標準與差額負擔機制`,
        description: '法規機關代表，建立法規框架、設定替代標準並協調緊急應對措施。',
      },
    ];
  }
}

export default new ApiService();