# PRD 與實作框架對齊分析與建議

## 總體評估

專案的整體架構與 PRD (產品需求文檔) 的願景高度一致。前端採用 React/TypeScript/Vite 技術棧，後端採用 FastAPI，這與 PRD 中定義的 C4 模型和技術棧完全吻合。前端的文檔 (`frontend/docs`) 也相當完善，詳細描述了從 UI 設計系統到 API 整合的各個方面。

主要的技術缺漏和不一致之處在於 **後端 API 的結構化、路由統一性** 以及 **前後端對 API 的認知同步**。當前的 API 端點存在重疊和路由定義不一致的問題，這可能導致未來開發和維護的複雜性增加。

---

## 核心發現與建議

### 1. 後端 API 端點結構不統一

**觀察:**

後端 API 存在多個看似功能重疊的路由模組，例如 `debate.py`, `innovation.py`, 和 `multi_agent.py` 都有啟動工作流程或辯論的功能。

- `app/api/router.py` 中定義了多個前綴：
  - `/api/v1/debate`
  - `/api/v1/innovation`
  - `/api/v1/multi-agent`
- 這導致了功能相似的端點散落在不同的路徑下，例如：
  - `POST /api/v1/debate/start`
  - `POST /api/v1/multi-agent/debate/start`
  - `POST /api/v1/innovation/sessions/{session_id}/identify/start`

這種結構使得前端在調用 API 時需要與多個不同的服務層對接 (`innovationService.ts`, `biodesignService.ts`)，增加了前端的複雜性並降低了 API 的可預測性。

**建議:**

**統一 API 端點，進行重構。** 建議以 `innovation.py` 中定義的 **三階段工作流** 為核心，將其他相關功能整合進來。一個更清晰的結構應該是：

- **核心工作流**: `POST /api/v1/sessions` 用於創建一個完整的創新會話。
- **階段性操作**: 所有與特定階段相關的操作都應位於會話的子路徑下，例如：
  - `POST /api/v1/sessions/{session_id}/identify` (開始識別階段)
  - `POST /api/v1/sessions/{session_id}/invent` (開始發明階段)
  - `POST /api/v1/sessions/{session_id}/implement` (開始實施階段)
- **辯論功能**: 將辯論視為一個在特定階段內啟動的功能。
  - `POST /api/v1/sessions/{session_id}/debate`
- **多模態內容**: 將多模態內容的上傳和分析也歸屬於特定會話。
  - `POST /api/v1/sessions/{session_id}/multimodal/upload`

這樣的結構使 API 更加符合 RESTful 風格，並與產品的核心流程（Session-based）保持一致。

### 2. Multimodal API 路由定義不直觀

**觀察:**

在 `app/api/router.py` 中，`multimodal.router` 被掛載在 `/v1/innovation` 前綴下：
```python
api_router.include_router(multimodal.router, prefix="/v1/innovation", tags=["multimodal"])
```
而在 `app/api/v1/endpoints/multimodal.py` 中，路由定義為：
```python
@router.post("/sessions/{session_id}/multimodal/upload", ...)
```
這導致最終的 API 路徑變為 `/api/v1/innovation/sessions/{session_id}/multimodal/upload`，這條路徑顯得冗長且不直觀。

**建議:**

**調整 Multimodal 路由掛載點。** 建議將其掛載在根 API 路由器下，使其路徑變為 `/api/v1/sessions/{session_id}/multimodal/upload`。這需要修改 `app/api/router.py`：

```python
# 移除 multimodal 在 /v1/innovation 的掛載
# 將其獨立出來或與 session 管理整合
api_router.include_router(multimodal.router, prefix="/v1", tags=["multimodal"])
```
同時，`multimodal.py` 中的路由定義也需要相應調整，以確保路徑的簡潔和一致性。

### 3. 前後端文檔與實作不一致

**觀察:**

前端的 API 整合文檔 (`frontend/docs/api-integration.md`) 中描述了一個 `debateService.ts`，其中調用了 `/api/v1/innovation/sessions/{sessionId}/debate/start` 端點。然而，根據後端的路由文件，這個端點並不存在。

這表明前端的文檔可能基於一個理想的或過時的 API 設計，而沒有與後端的實際情況同步。

**建議:**

**保持前後端文檔與實作的同步。**
1.  在完成後端 API 重構後，應立即更新所有相關的前端服務 (`services/*.ts`)。
2.  同步更新 `frontend/docs/api-integration.md`，確保其反映最新的 API 結構。
3.  建立一個 API 規格標準（如 OpenAPI/Swagger），作為前後端開發的共同依據，以避免未來出現類似的脫節問題。

### 4. 數據庫配置與 PRD 不符

**觀察:**

- **PRD**: 在技術棧中提到了 `PostgreSQL` (結構化數據) 和 `MongoDB` (辯論記錄)。
- **後端代碼**: `app/config.py` 中只定義了 `DATABASE_URL` (通常指向 SQL 資料庫，如 PostgreSQL) 和 `REDIS_URL`。沒有看到 MongoDB 的配置。

**建議:**

**明確數據庫技術棧。** 開發團隊需要確認是否仍計劃使用 MongoDB。
- **如果使用**: 應在 `config.py` 中添加 MongoDB 的連接配置，並在相關的數據庫服務中實現連接邏輯。
- **如果不使用**: 應更新 PRD，移除對 MongoDB 的描述，以確保文檔的準確性。

---

## 總結

前端框架和結構非常出色，與 PRD 的契合度很高。當前的核心問題在於後端 API 的一致性和清晰度。通過對 API 進行重構和統一，可以顯著提升開發效率、降低維護成本，並使前後端協作更加順暢。
