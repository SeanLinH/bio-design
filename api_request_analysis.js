// 前端 API 請求格式總結

console.log('🔍 前端 API 請求格式分析');
console.log('='.repeat(60));

// 1. 獲取代理列表
console.log('\n1️⃣ 獲取代理列表:');
console.log('方法: GET');
console.log('URL: https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/apps/10');
console.log('Headers:');
console.log('  - accept: application/json');
console.log('  - ngrok-skip-browser-warning: true');
console.log('Body: 無');

// 2. 創建代理
console.log('\n2️⃣ 創建代理:');
console.log('方法: POST');
console.log('URL: https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/agents');
console.log('Headers:');
console.log('  - Content-Type: application/json');
console.log('  - accept: application/json');
console.log('  - ngrok-skip-browser-warning: true');
console.log('Body:');
console.log(`{
  "name": "agent_name",
  "type": "llm",
  "instruction": "agent instruction",
  "description": "agent description",
  "output_key": "agent_name",
  "sub_agent": [],
  "tools": [],
  "model_id": 12,
  "temperature": 0.7,
  "max_tokens": 2000
}`);

// 3. 更新代理
console.log('\n3️⃣ 更新代理:');
console.log('方法: PUT');
console.log('URL: https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/agents/{agentId}');
console.log('Headers:');
console.log('  - Content-Type: application/json');
console.log('  - accept: application/json');
console.log('  - ngrok-skip-browser-warning: true');
console.log('Body:');
console.log(`{
  "name": "agent_name",
  "instruction": "agent instruction",
  "description": "agent description",
  "temperature": 0.7,
  "max_tokens": 131072
}`);

// 4. 創建 Session
console.log('\n4️⃣ 創建 Session:');
console.log('方法: POST');
console.log('URL: https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/apps/10/users/{userId}/sessions');
console.log('Headers:');
console.log('  - Content-Type: application/json');
console.log('  - accept: application/json');
console.log('  - ngrok-skip-browser-warning: true');
console.log('Body:');
console.log(`{
  "additionalProp1": {}
}`);

// 5. 開始辯論 SSE
console.log('\n5️⃣ 開始辯論 (SSE):');
console.log('方法: POST');
console.log('URL: https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/apps/10/run_sse');
console.log('Headers:');
console.log('  - Content-Type: application/json');
console.log('  - Accept: application/json');
console.log('  - ngrok-skip-browser-warning: true');
console.log('Body:');
console.log(`{
  "user_id": "user1",
  "session_id": "session_id",
  "new_message": {
    "parts": [
      {
        "text": "question text"
      }
    ],
    "role": "user"
  },
  "streaming": true
}`);

console.log('\n' + '='.repeat(60));
console.log('📋 配置信息:');
console.log('  - Base URL: https://entirely-ideal-sunfish.ngrok-free.app/api/v1');
console.log('  - Space ID: 11');
console.log('  - App ID: 10');
console.log('  - Model ID: 12');

console.log('\n❓ 可能的問題:');
console.log('1. 缺少必需字段');
console.log('2. 字段類型不匹配');
console.log('3. URL 路徑錯誤');
console.log('4. 請求體格式不正確');
console.log('5. Headers 設置問題');