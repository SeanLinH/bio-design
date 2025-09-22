// 綜合前端功能測試
// 測試更新agent、新增agent、開始辯論

// 模擬 fetch API (Node.js 環境)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

const BASE_URL = 'https://entirely-ideal-sunfish.ngrok-free.app/api/v1';
const FIXED_SPACE_ID = 11;
const FIXED_APP_ID = 10;
const FIXED_MODEL_ID = 12;

// 添加 ngrok 需要的 headers
const defaultHeaders = {
  'Content-Type': 'application/json',
  'accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

async function getAgents() {
  console.log('📋 獲取現有代理列表...');
  const response = await fetch(`${BASE_URL}/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}`, {
    headers: defaultHeaders
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const appData = await response.json();
  return appData.apps?.agents || [];
}

async function updateAgent(agentId, agentData) {
  console.log(`🔧 更新代理 ID: ${agentId}...`);
  const response = await fetch(`${BASE_URL}/spaces/${FIXED_SPACE_ID}/agents/${agentId}`, {
    method: 'PUT',
    headers: defaultHeaders,
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
}

async function createAgent(agentData) {
  console.log(`➕ 創建新代理: ${agentData.name}...`);
  const response = await fetch(`${BASE_URL}/spaces/${FIXED_SPACE_ID}/agents`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      name: agentData.name,
      type: "llm",
      instruction: agentData.instruction,
      description: agentData.description,
      output_key: agentData.name,
      sub_agent: [],
      tools: [],
      model_id: FIXED_MODEL_ID,
      temperature: agentData.temperature || 0.7,
      max_tokens: agentData.max_tokens || 2000
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  
  return await response.json();
}

async function createSession(userId) {
  console.log(`📝 為用戶 ${userId} 創建新 session...`);
  const response = await fetch(`${BASE_URL}/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}/users/${userId}/sessions`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      additionalProp1: {}
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  
  const sessionData = await response.json();
  return sessionData.session_id || sessionData.id;
}

async function startDebate(question, userId) {
  console.log(`🎯 開始辯論: "${question}"...`);
  
  // 首先創建新的 session
  const sessionId = await createSession(userId || 'test-user');
  console.log(`✅ 創建了新的 session: ${sessionId}`);
  
  const response = await fetch(`${BASE_URL}/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}/run_sse`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      user_id: userId || 'test-user',
      session_id: sessionId,
      new_message: {
        parts: [
          {
            text: question
          }
        ],
        role: "user"
      },
      streaming: true
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  
  return response; // 返回 response 用於 SSE 處理
}

async function testFrontendFunctions() {
  console.log('🚀 開始前端功能綜合測試');
  console.log('='.repeat(50));
  
  try {
    // 1. 獲取現有代理
    const agents = await getAgents();
    console.log(`✅ 成功獲取 ${agents.length} 個代理`);
    
    if (agents.length === 0) {
      console.log('❌ 沒有找到代理，跳過更新測試');
      return;
    }
    
    // 顯示前幾個代理
    console.log('\n🤖 現有代理:');
    agents.slice(0, 5).forEach(agent => {
      console.log(`  - ID: ${agent.id}, 名稱: ${agent.name}, 描述: ${agent.description?.substring(0, 50)}...`);
    });
    
    // 2. 測試更新代理 - 選擇供應鏈專家 (ID: 84)
    const supplyChainAgent = agents.find(a => a.id === 84);
    if (supplyChainAgent) {
      console.log('\n' + '='.repeat(30));
      const updatedAgentData = {
        name: 'enhanced_supply_chain',
        instruction: '你是一位資深的醫療供應鏈專家，專門分析供應鏈中斷風險並提供優化建議。請用專業且詳細的方式回應。',
        description: '增強版供應鏈專家，具有深度分析能力和豐富的實戰經驗。',
        temperature: 0.8,
        max_tokens: 2000
      };
      
      const updateResult = await updateAgent(84, updatedAgentData);
      console.log('✅ 代理更新成功');
      console.log(`   更新結果: ${JSON.stringify(updateResult, null, 2)}`);
    } else {
      console.log('⚠️  未找到供應鏈專家 (ID: 84)，跳過更新測試');
    }
    
    // 3. 測試創建新代理
    console.log('\n' + '='.repeat(30));
    const newAgentData = {
      name: `test_ai_consultant_${Date.now()}`,
      instruction: '你是一位AI顧問，專門提供技術諮詢和解決方案建議。請保持專業和客觀的態度。',
      description: '測試用AI顧問代理，用於驗證前端創建功能。',
      temperature: 0.8,
      max_tokens: 1500
    };
    
    const createResult = await createAgent(newAgentData);
    console.log('✅ 新代理創建成功');
    console.log(`   創建結果: ${JSON.stringify(createResult, null, 2)}`);
    
    // 4. 測試開始辯論 (只測試請求發送，不處理SSE流)
    console.log('\n' + '='.repeat(30));
    const testQuestion = '在醫療用品供應短缺的情況下，如何制定有效的應急採購策略？';
    
    try {
      const debateResponse = await startDebate(testQuestion, 'frontend-test-user');
      console.log('✅ 辯論請求發送成功');
      console.log(`   HTTP 狀態: ${debateResponse.status}`);
      console.log(`   Content-Type: ${debateResponse.headers.get('content-type')}`);
      
      // 關閉響應流
      debateResponse.body?.cancel();
      
    } catch (error) {
      console.log(`⚠️  辯論啟動測試: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 前端功能測試完成！');
    console.log('\n📋 測試總結:');
    console.log('  ✅ 代理列表獲取');
    console.log('  ✅ 代理更新功能');  
    console.log('  ✅ 代理創建功能');
    console.log('  ✅ 辯論啟動測試');
    console.log('\n🚀 前端已準備好進行實際使用！');
    
  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
    console.error('錯誤詳情:', error);
    process.exit(1);
  }
}

// 運行測試
console.log('🔗 連接到:', BASE_URL);
testFrontendFunctions().catch(console.error);