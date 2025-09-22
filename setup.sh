#!/bin/bash

echo "正在安裝 AI Agent 前端應用..."

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "錯誤: Node.js 未安裝。請先安裝 Node.js 16+ 版本。"
    exit 1
fi

# 檢查 npm 是否安裝
if ! command -v npm &> /dev/null; then
    echo "錯誤: npm 未安裝。請先安裝 npm。"
    exit 1
fi

# 進入前端目錄
cd "$(dirname "$0")"

echo "當前目錄: $(pwd)"

# 安裝依賴
echo "正在安裝項目依賴..."
npm install

# 檢查 Expo CLI 是否安裝
if ! command -v expo &> /dev/null; then
    echo "Expo CLI 未安裝，正在全局安裝..."
    npm install -g @expo/cli
fi

echo ""
echo "=========================================="
echo "安裝完成！"
echo "=========================================="
echo ""
echo "啟動選項："
echo "1. 開發服務器:     npm start"
echo "2. Android 模擬器: npm run android"
echo "3. iOS 模擬器:     npm run ios"
echo "4. Web 瀏覽器:     npm run web"
echo ""
echo "注意事項："
echo "- 確保後端 API 服務運行在 http://localhost:8080"
echo "- 使用固定配置: Space ID=11, App ID=10, Model ID=12"
echo "- 預設專家代理: 供應鏈(84), 材料管理(85), 物流(86), 風險管理(87), 法規(88)"
echo "- 如需修改 API 地址，請編輯 src/services/ApiService.ts"
echo "- 首次運行可能需要下載和安裝額外的依賴"
echo ""
echo "現在啟動開發服務器嗎？ (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "正在啟動開發服務器..."
    npm start
else
    echo "您可以稍後運行 'npm start' 來啟動開發服務器。"
fi