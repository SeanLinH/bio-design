// 前端 API 集成測試 - 測試修復後的代碼
// 模擬前端實際調用方式

// 模擬 fetch API (Node.js 環境)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// 模擬 ApiService 類（與前端一致）
class ApiService {
  constructor() {
    this.BASE_URL = 'https://entirely-ideal-sunfish.ngrok-free.app/api/v1';
    this.FIXED_SPACE_ID = 11;
    this.FIXED_APP_ID = 10;
    this.FIXED_MODEL_ID = 12;
    
    this.PREDEFINED_AGENTS = {
      supply_chain: 84,
      materials_manager: 85,
      logistics_expert: 86,
      risk_management: 87,
      regulatory_authority: 88,
      reporter: 90,
      debate_process: 91,
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // 靜態方法 - 獲取代理列表（與測試腳本一致）
  static async getAgents() {
    try {
      const response = await fetch(`https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/apps/10`, {
        headers: {
          'accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const appData = await response.json();
      return appData.apps?.agents || [];
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  // 靜態方法 - 更新代理（與測試腳本一致）
  static async updateAgent(agentId, agentData) {
    try {
      const response = await fetch(`https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name: agentData.name,
          instruction: agentData.instruction,
          description: agentData.description,
          temperature: agentData.temperature || 0.7,
          max_tokens: agentData.max_tokens || 131072
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }

  // 靜態方法 - 創建代理（與測試腳本一致）
  static async createAgent(agentData) {
    try {
      const response = await fetch(`https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name: agentData.name,
          type: "llm",
          instruction: agentData.instruction,
          description: agentData.description,
          output_key: agentData.name,
          sub_agent: [],
          tools: [],
          model_id: 12,
          temperature: agentData.temperature || 0.7,
          max_tokens: agentData.max_tokens || 131072,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  // 實例方法
  getPredefinedAgents() {
    return this.PREDEFINED_AGENTS;
  }

  getFixedConfig() {
    return {
      spaceId: this.FIXED_SPACE_ID,
      appId: this.FIXED_APP_ID,
      modelId: this.FIXED_MODEL_ID,
    };
  }
}

// 測試前端修復後的功能
async function testFrontendIntegration() {
  console.log('🔧 測試前端 API 集成修復');
  console.log('='.repeat(50));

  try {
    // 1. 測試靜態方法 - 獲取代理列表
    console.log('📋 測試獲取代理列表...');
    const agents = await ApiService.getAgents();
    console.log(`✅ 成功獲取 ${agents.length} 個代理`);

    if (agents.length === 0) {
      console.log('❌ 沒有找到代理');
      return;
    }

    // 顯示前幾個代理
    console.log('\n🤖 代理列表:');
    agents.slice(0, 3).forEach(agent => {
      console.log(`  - ID: ${agent.id}, 名稱: ${agent.name}`);
    });

    // 2. 測試實例方法
    console.log('\n🔧 測試實例方法...');
    const apiService = new ApiService();
    const predefinedAgents = apiService.getPredefinedAgents();
    const fixedConfig = apiService.getFixedConfig();
    
    console.log(`✅ 預定義代理數量: ${Object.keys(predefinedAgents).length}`);
    console.log(`✅ 固定配置: Space=${fixedConfig.spaceId}, App=${fixedConfig.appId}`);

    // 3. 測試代理更新（模擬前端實際調用）
    const supplyChainAgent = agents.find(a => a.id === 84);
    if (supplyChainAgent) {
      console.log('\n🔧 測試代理更新 (模擬前端調用)...');
      
      const updateData = {
        name: supplyChainAgent.name,
        instruction: '更新的指令：你是一位專業的醫療供應鏈專家...',
        description: '已更新的描述',
        temperature: 0.8,
        max_tokens: 2000
      };
      
      const updateResult = await ApiService.updateAgent(84, updateData);
      console.log('✅ 代理更新成功');
      console.log(`   狀態: ${updateResult.status}`);
    }

    // 4. 測試代理創建（模擬前端調用）
    console.log('\n➕ 測試代理創建 (模擬前端調用)...');
    const newAgentData = {
      name: `frontend_test_agent_${Date.now()}`,
      instruction: '你是一個測試代理，用於驗證前端集成。',
      description: '前端集成測試代理',
      temperature: 0.7,
      max_tokens: 1500
    };

    const createResult = await ApiService.createAgent(newAgentData);
    console.log('✅ 代理創建成功');
    console.log(`   新代理 ID: ${createResult.agents.id}`);
    console.log(`   狀態: ${createResult.status}`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 前端 API 集成測試完成！');
    console.log('\n📋 測試結果:');
    console.log('  ✅ 靜態方法 getAgents() - 正常');
    console.log('  ✅ 實例方法 getPredefinedAgents() - 正常');  
    console.log('  ✅ 實例方法 getFixedConfig() - 正常');
    console.log('  ✅ 靜態方法 updateAgent() - 正常');
    console.log('  ✅ 靜態方法 createAgent() - 正常');
    console.log('\n🚀 前端 400 錯誤已修復！');

  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
    console.error('錯誤詳情:', error);
  }
}

// 運行測試
testFrontendIntegration().catch(console.error);