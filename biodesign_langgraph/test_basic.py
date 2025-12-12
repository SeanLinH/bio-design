#!/usr/bin/env python3
"""
基本功能測試文件
測試核心組件是否正常工作
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """測試所有模組是否能正常導入"""
    try:
        from src.types import NeedItem, Concept, ScoreItem, ConceptScore, DebateOutput
        from src.prompts import AGENT_ROLES, POSITION_TMPL
        from src.agents import get_llm, call_position
        from src.scoring import weighted_total, sensitivity_note
        from src.graph import BiodesignDebate, DebateState
        print("✅ 所有模組導入成功")
        return True
    except Exception as e:
        print(f"❌ 模組導入失敗: {e}")
        return False

def test_types():
    """測試型別定義"""
    try:
        from src.types import NeedItem, Concept, CRITERIA_WEIGHTS
        
        # 測試 NeedItem
        need = NeedItem(
            need="測試需求",
            summary="測試摘要",
            medical_insights="醫學見解",
            tech_insights="技術見解",
            strategy="策略"
        )
        assert need.need == "測試需求"
        
        # 測試 Concept
        concept = Concept(
            title="測試概念",
            description="測試描述",
            source_agent="test_agent"
        )
        assert concept.title == "測試概念"
        
        # 測試權重總和
        total_weight = sum(CRITERIA_WEIGHTS.values())
        assert abs(total_weight - 1.0) < 0.001
        
        print("✅ 型別定義測試通過")
        return True
    except Exception as e:
        print(f"❌ 型別定義測試失敗: {e}")
        return False

def test_scoring():
    """測試評分邏輯"""
    try:
        from src.types import ScoreItem, CriteriaCode
        from src.scoring import weighted_total
        
        # 創建測試評分項目
        scores = [
            ScoreItem(criterion="CLINICAL_VALUE", score=4.0, rationale="高臨床價值"),
            ScoreItem(criterion="TECH_FEAS", score=3.5, rationale="中等技術可行性"),
            ScoreItem(criterion="UX", score=4.5, rationale="優秀使用者體驗")
        ]
        
        # 測試加權總分計算
        total = weighted_total(scores)
        assert isinstance(total, float)
        assert total > 0
        
        print("✅ 評分邏輯測試通過")
        return True
    except Exception as e:
        print(f"❌ 評分邏輯測試失敗: {e}")
        return False

def test_prompts():
    """測試提示詞模板"""
    try:
        from src.prompts import AGENT_ROLES, POSITION_TMPL, CRITIQUE_TMPL
        
        # 測試專家角色數量
        assert len(AGENT_ROLES) == 7
        
        # 測試提示詞模板
        assert "Need" in POSITION_TMPL
        assert "Need" in CRITIQUE_TMPL
        
        # 測試角色名稱
        role_names = [role[0] for role in AGENT_ROLES]
        expected_roles = ["clinical", "engineering", "human_factors", "regulatory", "market_finance", "ip", "patient_payer"]
        assert set(role_names) == set(expected_roles)
        
        print("✅ 提示詞測試通過")
        return True
    except Exception as e:
        print(f"❌ 提示詞測試失敗: {e}")
        return False

def main():
    """執行所有測試"""
    print("🧪 開始執行基本功能測試...\n")
    
    tests = [
        test_imports,
        test_types,
        test_scoring,
        test_prompts
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print(f"📊 測試結果: {passed}/{total} 通過")
    
    if passed == total:
        print("🎉 所有基本測試通過！系統準備就緒。")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查相關組件。")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 