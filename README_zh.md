# 🏥 基於LLM代理的Biodesign方法論

> 斯坦福大學系統性醫療器械創新方法論，通過多代理LLM實現增強智能醫療需求分析

## 🎯 項目目標

本項目使用複雜的多代理LLM系統實現斯坦福Biodesign方法論，系統化和增強醫療器械創新流程。該系統具有專業的AI代理（醫療專家、系統工程師和需求收集者），通過結構化討論協作識別和分析醫療保健需求。

## 📚 什麼是Biodesign？

Biodesign是斯坦福大學開發的醫療器械創新系統方法。該方法論包含三個核心階段：

### 1. 識別 🔍
此階段專注於通過以下方式發現重要的未滿足醫療保健需求：
- 臨床環境沉浸
- 觀察完整護理週期（診斷→治療→康復→計費）
- 問題和機會識別
- 基於潛在影響的需求收集和優先級排序

### 2. 發明 💡
在此階段，團隊：
- 頭腦風暴多樣化解決方案概念
- 創建和測試快速原型
- 實施"思考-構建-重新思考"迭代週期
- 評估概念：
  - 技術可行性
  - 知識產權潛力
  - 商業模式可行性
  - 監管路徑考慮

### 3. 實施 🚀
最終階段涉及：
- 技術改進
- 監管批准策略開發
- 報銷規劃
- 市場潛力評估
- 資金來源探索
- 與行業導師合作

## 🤖 多代理系統

此實現通過三個專業AI代理增強Biodesign方法論：

- **🩺 醫療專家代理**：從臨床和醫學角度分析醫療保健需求
- **⚙️ 系統工程師代理**：提供技術解決方案和系統優化見解
- **📋 需求收集者代理**：綜合討論並提取可操作的醫療器械要求

## 🛠️ 項目結構

```
bio-design/
├── src/
│   ├── agents/           # 多代理LLM實現
│   │   ├── need_finder.py          # 核心反思系統
│   │   ├── need_finder_realtime.py # 實時分析系統
│   │   ├── evaluator.py            # 需求評估系統
│   │   └── ...
│   └── docs/            # API和設置文檔
├── static/
│   ├── index.html                    # 基礎 Web UI界面
│   └── need_statement_debate.html   # 🆕 Need Statement 辯論系統前端介面
├── experiments/         # Jupyter筆記本和實驗
├── tests/              # 測試文件
├── run.py          # FastAPI服務器
├── pyproject.toml      # UV項目配置
└── README.md           # 此文件
```

## 🎨 前端介面展示

### 🆕 Need Statement 辯論系統

我們提供了一個專門的前端介面，讓用戶可以輕鬆輸入醫療需求並即時觀看多代理辯論過程：

#### ✨ 主要功能特色

- **📝 直觀輸入**: 大型文字輸入框，支援多行 Need Statement 輸入
- **🎯 智能辯論**: 多代理協作辯論，包括醫療專家、系統工程師和需求收集者
- **📊 即時展示**: 三種視圖模式：辯論過程、辯論結果、需求總結
- **⚡ 進度追蹤**: 即時進度條和狀態指示器
- **📱 響應式設計**: 支援桌面和移動設備

#### 🖼️ 介面截圖

```
┌─────────────────────────────────────────────────────────────────┐
│                    🦷 Need Statement 辯論系統                    │
│              基於LLM代理的Biodesign方法論                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────────────────────────────┐
│   📝 輸入面板    │  │           🤖 辯論展示面板                │
│                 │  │                                         │
│ Need Statement: │  │  🩺 醫療專家代理                         │
│ [輸入您的醫療    │  │  從醫療角度分析，這個需求涉及...          │
│  需求描述...]    │  │                                         │
│                 │  │  ⚙️ 系統工程師代理                       │
│ 辯論輪數: [3輪] │  │  從技術角度來看，這個需求需要...          │
│                 │  │                                         │
│ 🚀 開始辯論分析  │  │  📋 需求收集者代理                       │
│                 │  │  基於兩位專家的分析，我識別出...          │
│ 💡 示例需求:     │  │                                         │
│ • 糖尿病管理     │  │  📊 進度: ████████████████████ 100%     │
│ • 牙科手術      │  │                                         │
│ • 老年照護      │  │  [辯論過程] [辯論結果] [需求總結]        │
└─────────────────┘  └─────────────────────────────────────────┘
```

#### 🚀 快速體驗

1. 啟動服務器後，訪問：`http://localhost:8000/static/need_statement_debate.html`
2. 在左側輸入您的醫療需求描述
3. 選擇辯論輪數（2-5輪）
4. 點擊「開始辯論分析」按鈕
5. 即時觀看多代理辯論過程
6. 切換不同視圖查看分析結果

#### 🎭 辯論代理角色

- **🩺 醫療專家代理**: 從臨床醫學角度分析需求
- **⚙️ 系統工程師代理**: 從技術工程角度評估可行性
- **📋 需求收集者代理**: 整合討論結果，形成可執行建議

---

## 🚀 使用UV快速設置

### 前置要求
- Python 3.10或更高版本
- [UV包管理器](https://docs.astral.sh/uv/)（推薦）或pip
- OpenAI API密鑰

### 1. 安裝UV（如果尚未安裝）
```bash
# 在macOS/Linux上
curl -LsSf https://astral.sh/uv/install.sh | sh

# 在Windows上
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2. 克隆和設置
```bash
# 克隆倉庫
git clone https://github.com/SeanLinH/bio-design.git
cd bio-design

# 複製.env.example到.env並設置API_KEY
cp .env.example .env

# 創建虛擬環境並安裝依賴
uv sync

# 激活虛擬環境
source .venv/bin/activate  # Linux/macOS
# 或
.venv\Scripts\activate     # Windows
```

### 3. 配置OpenAI API
```bash
# 創建環境文件
cp .env.example .env

# 編輯.env文件並添加您的OpenAI API密鑰
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

### 4. 啟動服務
```bash
# 啟動FastAPI服務器
uv run python run.py

# 或者替代方案
python run.py
```

服務將在 `http://localhost:8000` 可用

## 🖥️ Web用戶界面

### 訪問UI
在瀏覽器中打開並導航到 `http://localhost:8000` 以訪問交互式Web界面。

### UI功能

#### 主界面
- **查詢輸入**：用於輸入醫療場景或問題的大型文本區域
- **討論輪次**：可配置的代理討論輪次數（2-5）
- **分析模式**：
  - 標準分析：傳統批處理
  - ⚡ 實時分析：具有狀態更新的實時代理討論

#### 實時分析面板
使用實時分析時，您將看到：
- **實時代理狀態**：顯示當前正在思考的代理的實時更新
- **討論進度**：醫療專家和系統工程師之間的逐輪對話
- **代理消息**：來自不同代理的顏色編碼消息：
  - 🔴 醫療專家（紅色邊框）
  - 🟢 系統工程師（綠色邊框）
  - 🟠 需求收集者（橙色邊框）
  - 🟣 系統消息（紫色邊框）

#### 結果標籤
- **📋 分析結果**：具有醫療見解的結構化需求分析
- **⭐ 評估**：已識別需求的自動評分和優先級排序
- **📊 優先級排序**：排名和實施建議
- **🔧 原始數據**：完整對話日誌和技術細節

### 示例查詢
嘗試此示例查詢以查看系統運行：
```
一位患有多種慢性疾病的老年患者在藥物依從性差、缺乏實時監控以及在家護理和門診隨訪期間缺乏個性化支持方面面臨問題。
```

## 📡 API端點

### 核心端點
- `GET /` - Web UI界面
- `POST /api/reflection` - 提交標準分析請求
- `POST /api/reflection-realtime` - 提交實時分析請求
- `GET /api/reflection/{session_id}` - 獲取分析結果
- `GET /api/evaluation/{session_id}` - 獲取需求評估
- `GET /api/prioritization/{session_id}` - 獲取優先級排序結果

### 實時流式傳輸
- `GET /api/reflection-stream/{session_id}` - 實時更新的服務器發送事件

### 監控
- `GET /health` - 服務健康檢查
- `GET /api/sessions` - 列出活動分析會話

## 🔧 使用示例

### Web界面使用
1. **打開**瀏覽器中的 `http://localhost:8000`
2. **輸入**查詢文本區域中的醫療場景
3. **選擇**討論輪次數（推薦3）
4. **選擇**分析模式：
   - "開始分析"用於標準處理
   - "⚡ 開始實時分析"用於實時更新
5. **監控**實時進度（如果選擇）
6. **審查**標籤界面中的結果

### API使用
```python
import requests

# 提交分析請求
response = requests.post("http://localhost:8000/api/reflection", json={
    "query": "您的醫療場景在這裡...",
    "max_rounds": 3
})

session_id = response.json()["session_id"]

# 獲取結果
results = requests.get(f"http://localhost:8000/api/reflection/{session_id}")
print(results.json())
```

### 實時分析
```python
import requests
import sseclient  # pip install sseclient-py

# 開始實時分析
response = requests.post("http://localhost:8000/api/reflection-realtime", json={
    "query": "您的醫療場景在這裡...",
    "max_rounds": 3
})

session_id = response.json()["session_id"]

# 流式傳輸實時更新
stream = sseclient.SSEClient(f"http://localhost:8000/api/reflection-stream/{session_id}")
for event in stream:
    if event.data:
        print(f"更新: {event.data}")
```

## 🧪 開發和測試

### 運行測試
```bash
# 運行所有測試
uv run pytest tests/

# 運行特定測試
uv run python tests/test_api.py
```

### 開發模式
```bash
# 啟動自動重載以進行開發
uv run uvicorn run:app --host 0.0.0.0 --port 8000 --reload
```

### Jupyter筆記本
探索 `experiments/` 目錄以獲取演示各種功能的交互式筆記本：
- `multi_agent.ipynb` - 多代理系統探索
- `agent_supervisor.ipynb` - 代理協調模式
- `reflection.ipynb` - 反思方法論實現

## 🔒 配置

### 環境變量
- `OPENAI_API_KEY`：您的OpenAI API密鑰（必需）
- `OPENAI_BASE_URL`：自定義OpenAI兼容端點（可選）
- `LOG_LEVEL`：日誌級別（默認：INFO）

### 模型配置
系統默認使用 `gpt-4.1-mini`。您可以在代理配置文件中修改模型。

## 📊 系統輸出

系統生成結構化分析，包括：
- **醫療需求**：已識別的醫療保健要求
- **技術解決方案**：工程和系統建議
- **實施策略**：優先級行動計劃
- **評估指標**：需求的評分和排名
- **完整對話日誌**：完整的代理討論

## 🐛 故障排除

### 常見問題

#### OpenAI API密鑰問題
```bash
# 驗證您的API密鑰已設置
echo $OPENAI_API_KEY

# 測試OpenAI連接
uv run python test_openai.py
```

#### 端口已被使用
```bash
# 使用不同的端口
uv run python run.py --port 8001
```

#### 依賴問題
```bash
# 重新安裝依賴
uv sync --reinstall
```

## 📄 許可證

[待添加許可證信息]

## 🤝 貢獻

[待添加貢獻指南]

## 📬 聯繫

[待添加聯繫信息] 