#!/usr/bin/env python3
"""
Biodesign LangGraph 專案安裝腳本
"""

import os
import sys
import subprocess
import shutil

def check_python_version():
    """檢查Python版本"""
    if sys.version_info < (3, 10):
        print("❌ 需要 Python 3.10 或更高版本")
        print(f"當前版本: {sys.version}")
        return False
    print(f"✅ Python 版本檢查通過: {sys.version}")
    return True

def install_dependencies():
    """安裝依賴套件"""
    try:
        print("📦 安裝依賴套件...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ 依賴套件安裝完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 依賴套件安裝失敗: {e}")
        return False

def setup_environment():
    """設置環境變量"""
    env_file = ".env"
    env_example = "env.example"
    
    if not os.path.exists(env_file):
        if os.path.exists(env_example):
            shutil.copy(env_example, env_file)
            print("✅ 環境變量文件已創建 (.env)")
            print("⚠️  請編輯 .env 文件，添加您的 OpenAI API 密鑰")
        else:
            print("⚠️  未找到 env.example 文件")
    else:
        print("✅ 環境變量文件已存在")

def run_tests():
    """運行基本測試"""
    try:
        print("🧪 運行基本測試...")
        subprocess.check_call([sys.executable, "test_basic.py"])
        print("✅ 基本測試通過")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 基本測試失敗: {e}")
        return False

def main():
    """主安裝流程"""
    print("🚀 Biodesign LangGraph 專案安裝程序")
    print("=" * 50)
    
    # 檢查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 安裝依賴
    if not install_dependencies():
        sys.exit(1)
    
    # 設置環境
    setup_environment()
    
    # 運行測試
    if not run_tests():
        print("⚠️  測試失敗，但安裝可能仍然可用")
    
    print("\n" + "=" * 50)
    print("🎉 安裝完成！")
    print("\n📋 下一步：")
    print("1. 編輯 .env 文件，添加您的 OpenAI API 密鑰")
    print("2. 運行 python run_demo.py 開始使用")
    print("3. 查看 README.md 了解詳細使用方法")
    print("\n📚 文檔：")
    print("- README.md: 快速開始指南")
    print("- DEVELOPMENT_PLAN.md: 詳細開發計畫")

if __name__ == "__main__":
    main() 