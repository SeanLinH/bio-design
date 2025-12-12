import os
from dotenv import load_dotenv
from src.types import NeedItem
from src.graph import BiodesignDebate

load_dotenv()
model_name = os.getenv("MODEL_NAME", "gpt-4.1-mini")

if __name__ == "__main__":
    need = NeedItem(
        need="在血液透析過程中預防透析中低血壓：提供床邊早期預警與處置建議，降低併發症與護理負擔。",
        summary="針對 HD 病人常見的低血壓事件，期望及早偵測與介入。",
        medical_insights="需平衡偵測準確度與臨床可用性；避免警報疲勞。",
        tech_insights="可考慮多模態監測（血壓趨勢、超濾率、導電度、體液評估）。",
        strategy="先行模擬與回溯性驗證，再前瞻觀察試驗。"
    )

    app = BiodesignDebate(model_name=model_name, temperature=0.3, rounds=3, use_delphi=True)
    out = app.run(need, top_n=3)

    print("\n=== 概念排名 ===")
    for i, t in enumerate(out.ranking, 1):
        print(f"{i}. {t}")

    print("\n=== 敏感度備註 ===")
    print(out.sensitivity_note)

    print("\n=== 決策摘要（下一步原型/驗證） ===")
    print(out.decision_summary) 