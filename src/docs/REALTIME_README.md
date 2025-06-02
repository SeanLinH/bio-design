# 實時醫療需求反思系統

這個系統現在支持實時監控 agent 之間的討論過程，讓您可以看到醫療專家和工程師如何協作分析醫療需求。

## 新功能

### 1. 實時狀態監控
- 📊 即時看到各個 agent 的思考過程
- 💭 監控醫療專家和工程師的對話
- 🔄 實時顯示討論進度

### 2. 改進的 Web 界面
- ⚡ **實時分析按鈕**: 啟動帶實時更新的分析
- 📱 **實時狀態面板**: 顯示當前正在思考的 agent
- 📝 **實時日誌標籤**: 完整的事件日誌記錄

### 3. Server-Sent Events (SSE)
- 🌊 流式數據傳輸
- ⚡ 低延遲實時更新
- 🔄 自動重連機制

## 使用方法

### 1. 啟動服務器
```bash
cd /Volumes/Developer/Dev/playground/bio-design
uvicorn run_api:app --host 0.0.0.0 --port 8000 --reload
```

### 2. 使用 Web 界面
1. 打開瀏覽器訪問 `http://localhost:8000`
2. 輸入醫療相關的問題
3. 選擇 **⚡ Start Real-time Analysis** 按鈕
4. 在實時狀態面板中觀察討論過程

### 3. 程式化使用
```python
from src.agents.need_finder_fixed import MedicalReflectionSystemWithRealtime

def status_callback(event_type, agent, data):
    print(f"{agent}: {data.get('message', '')}")

system = MedicalReflectionSystemWithRealtime(
    max_discussion_rounds=3,
    status_callback=status_callback
)

result = system.run_reflection_sync_stream("您的醫療問題")
```

### 4. 測試腳本
```bash
python test_realtime.py
```

## 實時事件類型

### Agent 思考事件
- `thinking_started`: Agent 開始思考
- `thinking_completed`: Agent 完成思考

### 收集器事件
- `collecting_started`: 開始收集討論結果
- `collecting_completed`: 完成需求收集

### 系統事件
- `reflection_started`: 反思分析開始
- `reflection_completed`: 反思分析完成
- `session_completed`: 整個會話完成

## API 端點

### 實時分析
- `POST /api/reflection-realtime`: 提交實時分析請求
- `GET /api/reflection-stream/{session_id}`: 接收實時事件流

### 傳統分析
- `POST /api/reflection`: 提交分析請求（無實時更新）
- `GET /api/reflection/{session_id}`: 獲取分析結果

## 界面功能

### 實時狀態面板
- 🏥 **醫療專家** (紅色): 醫療流程和臨床經驗
- ⚙️ **系統工程師** (綠色): 技術解決方案和系統優化
- 📝 **需求收集器** (橙色): 統整和分析討論結果
- 🤖 **系統** (紫色): 系統狀態和控制信息

### 標籤頁
1. **Reflection Results**: 分析結果和識別的需求
2. **Evaluation**: 需求評估和分數
3. **Prioritization**: 需求優先級排序
4. **Real-time Log**: 完整的實時事件日誌
5. **Raw JSON**: 原始數據

## 技術特點

- 🚀 **非阻塞處理**: 使用背景任務處理長時間運行的分析
- 🌊 **實時流傳輸**: Server-Sent Events 提供即時更新
- 🔄 **狀態持久化**: 會話狀態和事件日誌存儲
- 📱 **響應式界面**: 現代化的 Web 界面設計
- 🛡️ **錯誤處理**: 完善的錯誤處理和重試機制

## 範例查詢

試試這些醫療相關的問題：

1. "醫院急診科經常人滿為患，病患等待時間過長，醫護人員工作壓力大，如何改善這個問題？"

2. "老年病患在家庭照護和門診追蹤中，面臨用藥依從性差、缺乏即時監測和個人化支援的問題"

3. "如何改善醫院的床位管理和病患流程，減少住院等待時間？"

觀察醫療專家和工程師如何從不同角度分析同一個問題，並最終形成綜合的解決方案！
