import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import MarkdownRenderer from '../../components/common/MarkdownRenderer.tsx';

const sampleMarkdown = `# 醫療供應鏈風險分析報告

## 執行摘要

這是一個測試markdown渲染功能的示例文件。以下是我們的分析結果：

### 主要風險因素

1. **供應商集中度風險**
   - 過度依賴單一供應商
   - 地理位置集中度過高
   - 缺乏替代供應源

2. **庫存管理風險**
   - 安全庫存水平不足
   - 預測準確度低
   - 供需不平衡

3. **物流運輸風險**
   - 運輸路線單一
   - 冷鏈管理不完善
   - 海關延誤風險

### 建議措施

#### 短期措施（1-3個月）

- [ ] 建立供應商風險評估機制
- [ ] 增加安全庫存水平至90天
- [ ] 實施每週供需評估會議
- [x] 建立緊急採購流程

#### 中期措施（3-6個月）

- [ ] 開發至少3個替代供應商
- [ ] 實施預測系統優化
- [ ] 建立區域配送中心

> **重要提醒**: 所有風險緩解措施都需要持續監控和定期評估效果。

### 技術分析

使用以下公式計算風險評分：

\`\`\`python
def calculate_risk_score(probability, impact, vulnerability):
    """
    計算供應鏈風險評分
    """
    base_score = probability * impact * vulnerability
    adjusted_score = min(base_score * 1.2, 100)
    return round(adjusted_score, 2)
\`\`\`

#### 風險評分矩陣

| 風險因素 | 機率 | 影響 | 脆弱性 | 總分 |
|---------|------|------|--------|------|
| 供應商中斷 | 0.3 | 8.5 | 0.7 | **78.9** |
| 物流延誤 | 0.5 | 6.0 | 0.8 | **72.0** |
| 庫存短缺 | 0.4 | 7.5 | 0.9 | **81.0** |

### 結論

基於上述分析，我們建議立即實施**高優先級**措施以降低供應鏈風險。

---

*本報告由AI Agent辯論系統生成，僅供參考。*

[詳細分析請參考附件](https://example.com/detailed-analysis)`;

export default function MarkdownTest() {
  const [customMarkdown, setCustomMarkdown] = useState('# 輸入您的Markdown內容');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleStreamingTest = () => {
    setIsStreaming(true);
    setCustomMarkdown('');

    const streamText = `# 實時串流測試

正在模擬Agent回應...

## 分析結果

### 第一階段發現`;

    let currentText = '';
    let index = 0;

    const streamInterval = setInterval(() => {
      if (index < streamText.length) {
        currentText += streamText[index];
        setCustomMarkdown(currentText);
        index++;
      } else {
        setIsStreaming(false);
        clearInterval(streamInterval);
      }
    }, 50);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Markdown 渲染測試
      </Typography>

      <Grid container spacing={3}>
        {/* 左側：示例內容 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                完整功能示例
              </Typography>
              <Box sx={{
                maxHeight: '70vh',
                overflow: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2,
              }}>
                <MarkdownRenderer content={sampleMarkdown} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 右側：自定義測試 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                自定義Markdown測試
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={customMarkdown}
                onChange={(e) => setCustomMarkdown(e.target.value)}
                placeholder="輸入您的Markdown內容..."
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleStreamingTest}
                disabled={isStreaming}
                sx={{ mb: 2 }}
              >
                {isStreaming ? '串流中...' : '測試串流效果'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                渲染結果
                {isStreaming && (
                  <Typography component="span" color="primary" sx={{ ml: 1 }}>
                    (串流中)
                  </Typography>
                )}
              </Typography>
              <Box sx={{
                maxHeight: '50vh',
                overflow: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2,
                backgroundColor: '#fafafa',
              }}>
                <MarkdownRenderer
                  content={customMarkdown}
                  isStreaming={isStreaming}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}