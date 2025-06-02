# OpenAI Setup Guide

## 設置 OpenAI API

### 1. 獲取 OpenAI API 密鑰

1. 訪問 [OpenAI Platform](https://platform.openai.com/)
2. 登入您的帳戶
3. 點擊右上角的 "API"
4. 在左側選單中選擇 "API Keys"
5. 點擊 "Create new secret key"
6. 複製您的 API 密鑰（請妥善保管，不要分享）

### 2. 設置環境變量

#### 在 Linux/macOS 中：
```bash
export OPENAI_API_KEY='your-api-key-here'
```

#### 永久設置（添加到 ~/.bashrc 或 ~/.zshrc）：
```bash
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

#### 在當前項目中創建 .env 文件：
```bash
echo 'OPENAI_API_KEY=your-api-key-here' > .env
```

### 3. 驗證設置

運行測試腳本來驗證 OpenAI 連接：

```bash
python test_openai.py
```

### 4. 使用的模型

系統配置使用 `gpt-4.1-mini` 模型：

```python
llm = ChatOpenAI(
    model="gpt-4.1-mini", 
    temperature=0.7
)
```

### 5. 費用估算

- **gpt-4.1-mini**: 相對便宜的模型
- 輸入：約 $0.15 / 1M tokens
- 輸出：約 $0.60 / 1M tokens

### 6. 如果遇到問題

#### API 密鑰錯誤：
```
❌ OpenAI 連接失敗: invalid_api_key
```
- 檢查 API 密鑰是否正確
- 確認環境變量已正確設置

#### 配額用完：
```
❌ OpenAI 連接失敗: quota exceeded
```
- 檢查您的 OpenAI 帳戶餘額
- 升級您的使用計劃

#### 網絡連接問題：
```
❌ OpenAI 連接失敗: connection error
```
- 檢查網絡連接
- 確認沒有防火牆阻擋

### 7. 安全提醒

- 🔒 不要將 API 密鑰提交到版本控制系統
- 🔒 不要在公共場所分享 API 密鑰
- 🔒 定期更換 API 密鑰
- 🔒 設置使用限額以控制費用

### 8. 啟動服務

設置完成後，啟動 API 服務器：

```bash
python run_api.py
```

然後訪問 http://localhost:8000 使用 Web 界面。
