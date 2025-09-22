# AI Agent 多Agent辯論系統 - React Native前端

這是一個基於React Native的移動端應用，用於配置和監控多Agent辯論系統。用戶可以通過這個應用創建Agent、設置辯論參數、實時監控辯論過程並查看最終結果。

## 功能特點

### 1. 辯論配置 (DebateSetupScreen)
- **問題輸入**: 用戶可以輸入要討論的問題
- **迭代次數設置**: 可選擇1-3次的最大迭代次數
- **Agent管理**:
  - 添加/編輯/刪除參與辯論的Agent
  - 提供預設Agent模板(供應鏈、物料管理、物流、風險管理、法規機關)
  - 自定義Agent配置(名稱、指令、描述、參數設置)
- **一鍵創建**: 自動創建完整的辯論流程並導航到監控頁面

### 2. 實時監控 (DebateMonitorScreen)
- **進度顯示**: 顯示當前辯論進度和完成百分比
- **Agent狀態**: 實時顯示各Agent的執行狀態(等待/運行/完成/錯誤)
- **消息流**: 
  - 實時顯示Agent輸出的消息
  - 按類型分類顯示(分析/綜合/報告/系統)
  - 支持部分消息的流式更新
- **自動滾動**: 新消息自動滾動到底部

### 3. 結果展示 (DebateResultScreen)
- **辯論摘要**: 顯示問題、狀態、參與Agent數等關鍵信息
- **最終報告**: 展示由reporter Agent生成的完整報告
- **Agent參與摘要**: 統計各Agent的消息數量和最後活動時間
- **討論時間軸**: 
  - 按時間順序顯示所有消息
  - 支持按類型過濾消息
  - 點擊查看詳細內容
- **分享和導出**: 支持分享報告和導出討論記錄

## 技術架構

### 狀態管理
- 使用React Context API + useReducer進行全局狀態管理
- 類型安全的TypeScript接口定義
- 集中化的狀態更新邏輯

### API服務
- 封裝的ApiService類處理所有後端交互
- 支持SSE(Server-Sent Events)實時數據流
- 錯誤處理和重試機制

### UI組件
- 基於React Native Paper的Material Design組件
- 響應式布局適配不同屏幕尺寸
- 豐富的交互效果和動畫

### 導航
- React Navigation Stack Navigator
- 流暢的頁面轉換
- 參數傳遞和狀態保持

## 後端配置

本應用程序配置為與在 `localhost:8080` 運行的後端服務配合使用，使用以下固定配置：
- **Space ID**: 11
- **App ID**: 10  
- **Model ID**: 12

### 預設專家代理
系統包含以下預配置的專家代理，您可以編輯這些代理或創建新的自定義代理：
- **供應鏈專家** (ID: 84): 供應鏈管理和優化策略
- **材料管理專家** (ID: 85): 醫療材料採購和庫存管理  
- **物流專家** (ID: 86): 運輸和配送優化
- **風險管理專家** (ID: 87): 風險評估和緩解策略
- **法規專家** (ID: 88): 醫療行業法規合規

## 安裝和運行

### 前置條件
- Node.js 16+
- npm或yarn
- React Native開發環境
- Expo CLI (推薦)

### 安裝依賴
```bash
cd frontend
npm install
```

### 運行應用
```bash
# 使用Expo開發服務器
npm start

# 運行在Android
npm run android

# 運行在iOS
npm run ios

# 運行在Web
npm run web
```

## 配置說明

### API基礎URL
在 `src/services/ApiService.ts` 中修改 `BASE_URL`:
```typescript
const BASE_URL = 'http://localhost:8080/api/v1';
```

### 預設Agent模板
在 `ApiService.getDefaultAgentTemplates()` 中可以修改預設的Agent模板。

## 文件結構

```
frontend/
├── App.js                          # 主應用組件
├── package.json                    # 依賴配置
├── app.json                        # Expo配置
├── babel.config.js                 # Babel配置
└── src/
    ├── context/
    │   └── DebateContext.tsx        # 全局狀態管理
    ├── services/
    │   └── ApiService.ts            # API服務層
    └── screens/
        ├── DebateSetupScreen.js     # 辯論配置頁面
        ├── DebateMonitorScreen.js   # 實時監控頁面
        └── DebateResultScreen.js    # 結果展示頁面
```

## 主要依賴

- **react-navigation**: 導航管理
- **react-native-paper**: UI組件庫
- **expo**: 開發和構建框架
- **@react-native-async-storage**: 本地存儲
- **react-native-progress**: 進度指示器

## 使用流程

1. **配置辯論**: 在首頁輸入問題，設置迭代次數，添加參與的Agent
2. **開始辯論**: 點擊"開始辯論"按鈕，系統自動創建後端資源
3. **監控過程**: 實時查看Agent討論過程和執行狀態
4. **查看結果**: 辯論完成後查看最終報告和完整討論記錄
5. **分享導出**: 分享報告或導出討論記錄

## API對接

### 創建辯論流程
1. 創建Space和Provider
2. 創建Model配置
3. 創建individual Agents
4. 創建unmet_need_source Agent
5. 創建debate_process (loop agent)
6. 創建convergencer Agent
7. 創建reporter Agent
8. 創建entire_process (sequential agent)
9. 創建App並附加Agent
10. 創建Session並開始執行

### SSE數據處理
- 解析 `data:` 開頭的SSE消息
- 提取 `content.parts[0].text` 獲取Agent輸出
- 處理 `actions.stateDelta` 獲取狀態變化
- 實時更新UI狀態

## 擴展功能

### 可能的改進方向
1. **離線支持**: 添加本地緩存和離線模式
2. **推送通知**: 辯論完成時發送通知
3. **歷史記錄**: 保存和管理歷史辯論記錄
4. **用戶認證**: 添加用戶登錄和權限管理
5. **高級配置**: 更多Agent參數和模型選擇
6. **可視化**: 添加圖表和數據可視化
7. **協作功能**: 多用戶協作和共享
8. **模板管理**: 用戶自定義Agent模板庫

## 故障排除

### 常見問題
1. **網絡連接**: 確保可以訪問後端API服務
2. **CORS問題**: 後端需要正確配置CORS策略
3. **SSE連接**: 檢查SSE數據流是否正常
4. **內存管理**: 長時間運行可能需要內存優化

### 調試技巧
- 使用React Native Debugger查看狀態變化
- 檢查網絡請求和響應
- 使用console.log追蹤數據流
- 檢查SSE消息格式和解析邏輯

這個React Native前端提供了完整的多Agent辯論系統用戶界面，支持從配置到結果展示的完整工作流程。