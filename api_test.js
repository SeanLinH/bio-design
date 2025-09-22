// React Native 前端 API 測試
// 用於驗證前端能否正確調用後端服務

// 模擬 fetch API (Node.js 環境)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// 直接使用配置常數而不是導入 TypeScript 模塊
const BASE_URL = 'https://entirely-ideal-sunfish.ngrok-free.app/api/v1';
const FIXED_SPACE_ID = 11;
const FIXED_APP_ID = 10;

async function getAgents() {
  const response = await fetch(`${BASE_URL}/spaces/${FIXED_SPACE_ID}/apps/${FIXED_APP_ID}`, {
    headers: {
      'accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const appData = await response.json();
  return appData.apps?.agents || [];
}

async function testReactNativeAPI() {
  console.log('🚀 測試 React Native API 服務...');
  console.log('======================================');
  
  try {
    // 測試獲取代理
    console.log('📋 測試獲取代理列表...');
    const agents = await getAgents();
    console.log(`✅ 成功獲取 ${agents.length} 個代理`);
    
    // 顯示前5個代理
    console.log('\n🤖 代理預覽:');
    agents.slice(0, 5).forEach(agent => {
      console.log(`  - ID: ${agent.id}, 名稱: ${agent.name}, 類型: ${agent.type || 'llm'}`);
    });
    
    // 測試創建會話數據結構
    console.log('\n🎯 測試會話數據結構...');
    const sessionData = {
      session_id: 'test-session-' + Date.now(),
      user_id: 'test-user',
      question: '醫療供應鏈中斷時的應急策略',
      max_iterations: 2,
      status: 'preparing',
      current_iteration: 0,
      current_agent: '',
      agents_progress: [],
      messages: [],
      agents: agents.filter(a => [84, 85, 86, 87, 88].includes(a.id)),
      started_at: new Date().toISOString()
    };
    
    console.log(`✅ 創建測試會話: ${sessionData.session_id}`);
    console.log(`✅ 選擇專家代理: ${sessionData.agents.length} 個`);
    
    console.log('\n🎉 React Native API 測試完成');
    console.log('前端已準備好與後端進行完整集成！');
    
  } catch (error) {
    console.error('❌ API 測試失敗:', error.message);
    process.exit(1);
  }
}

// 運行測試
testReactNativeAPI().catch(console.error);