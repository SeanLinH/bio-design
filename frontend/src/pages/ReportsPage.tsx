import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Share, 
  Printer, 
  Eye,
  BarChart3,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Users,
  Clock,
  Brain,
  Calendar,
  Filter,
  Search
} from 'lucide-react'

interface Report {
  id: string
  title: string
  type: 'innovation-summary' | 'business-strategy' | 'technical-analysis' | 'market-research' | 'financial-projection'
  status: 'draft' | 'completed' | 'published'
  createdAt: string
  updatedAt: string
  author: string
  tags: string[]
  sections: ReportSection[]
  downloadCount: number
  shareCount: number
}

interface ReportSection {
  id: string
  title: string
  content: string
  type: 'text' | 'chart' | 'table' | 'image'
  data?: any
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    generateSampleReports()
  }, [])

  const generateSampleReports = () => {
    const sampleReports: Report[] = [
      {
        id: 'innovation-summary-001',
        title: 'AI驅動糖尿病監測設備創新報告',
        type: 'innovation-summary',
        status: 'completed',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        author: 'Multi-Agent System',
        tags: ['糖尿病', 'AI', '監測設備', 'Biodesign'],
        downloadCount: 15,
        shareCount: 8,
        sections: [
          {
            id: 'exec-summary',
            title: '執行摘要',
            type: 'text',
            content: '本報告詳述了一個基於AI的糖尿病監測設備創新項目，從需求識別到商業化策略的完整分析。該項目採用Stanford Biodesign方法論，通過多智能體協作完成了三階段創新流程。'
          },
          {
            id: 'needs-analysis',
            title: '需求分析',
            type: 'text',
            content: '研究團隊識別出現有糖尿病監測設備的三個主要問題：1) 用戶體驗不佳，2) 數據準確性有限，3) 成本過高。通過深度用戶研究和臨床觀察，我們發現了顯著的市場機會。'
          },
          {
            id: 'solution-overview',
            title: '解決方案概述',
            type: 'text',
            content: '我們設計了一個集成AI預測分析、無創監測技術和個性化健康管理的創新平台。該解決方案能夠提供連續血糖監測、智能預警和個性化治療建議。'
          },
          {
            id: 'market-analysis',
            title: '市場分析',
            type: 'chart',
            content: '全球糖尿病監測設備市場預計將在2024-2029年間以8.5%的複合年增長率增長。',
            data: {
              marketSize: '$15.2B',
              growthRate: '8.5%',
              targetSegment: '$2.1B',
              competitorAnalysis: ['Dexcom', 'Abbott', 'Medtronic']
            }
          },
          {
            id: 'financial-projections',
            title: '財務預測',
            type: 'table',
            content: '五年財務預測顯示強勁的增長潛力和盈利能力。',
            data: {
              projections: [
                { year: 2024, revenue: 500000, profit: -300000 },
                { year: 2025, revenue: 1500000, profit: 300000 },
                { year: 2026, revenue: 3500000, profit: 1400000 },
                { year: 2027, revenue: 7200000, profit: 3600000 },
                { year: 2028, revenue: 12500000, profit: 7500000 }
              ]
            }
          }
        ]
      },
      {
        id: 'business-strategy-001',
        title: '遠程醫療平台商業策略報告',
        type: 'business-strategy',
        status: 'completed',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-22',
        author: 'Business Strategy Agent',
        tags: ['遠程醫療', '商業模式', 'SaaS', '訂閱制'],
        downloadCount: 12,
        shareCount: 5,
        sections: [
          {
            id: 'business-model',
            title: '商業模式分析',
            type: 'text',
            content: '採用B2B2C模式，通過醫療機構向患者提供服務。主要收入來源包括訂閱費、交易手續費和增值服務費。'
          },
          {
            id: 'pricing-strategy',
            title: '定價策略',
            type: 'text',
            content: '三層訂閱模式：基礎版($99/月)、專業版($299/月)、企業版($999/月)，滿足不同規模醫療機構需求。'
          },
          {
            id: 'revenue-projections',
            title: '收入預測',
            type: 'chart',
            content: '預計2025年達到盈利，2028年收入達到$12.5M。',
            data: {
              arr: '$2.5M',
              churnRate: '5%',
              ltv: '$15,000',
              cac: '$1,000'
            }
          }
        ]
      },
      {
        id: 'technical-analysis-001',
        title: 'AI醫療診斷系統技術分析報告',
        type: 'technical-analysis',
        status: 'draft',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-23',
        author: 'Technology Specialist Agent',
        tags: ['AI', '機器學習', '醫療診斷', '技術架構'],
        downloadCount: 3,
        shareCount: 1,
        sections: [
          {
            id: 'tech-overview',
            title: '技術概述',
            type: 'text',
            content: '基於深度學習的醫療影像診斷系統，採用卷積神經網路和遷移學習技術，實現高精度疾病檢測。'
          },
          {
            id: 'architecture',
            title: '系統架構',
            type: 'text',
            content: '微服務架構設計，包含影像處理模組、AI推理引擎、數據管理層和用戶界面層。'
          },
          {
            id: 'performance-metrics',
            title: '性能指標',
            type: 'table',
            content: '系統性能測試結果顯示優秀的準確率和響應時間。',
            data: {
              accuracy: '96.8%',
              precision: '94.2%',
              recall: '97.1%',
              responseTime: '< 2s'
            }
          }
        ]
      }
    ]
    setReports(sampleReports)
  }

  const getSelectedReport = () => {
    return reports.find(report => report.id === selectedReport)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'innovation-summary': return <Lightbulb size={16} className="text-yellow-500" />
      case 'business-strategy': return <DollarSign size={16} className="text-green-500" />
      case 'technical-analysis': return <Brain size={16} className="text-blue-500" />
      case 'market-research': return <TrendingUp size={16} className="text-purple-500" />
      case 'financial-projection': return <BarChart3 size={16} className="text-orange-500" />
      default: return <FileText size={16} className="text-gray-500" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'innovation-summary': return '創新總結報告'
      case 'business-strategy': return '商業策略報告'
      case 'technical-analysis': return '技術分析報告'
      case 'market-research': return '市場研究報告'
      case 'financial-projection': return '財務預測報告'
      default: return '通用報告'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.type === filter
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const generateNewReport = async () => {
    setIsGenerating(true)
    // 模擬報告生成
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const newReport: Report = {
      id: `report-${Date.now()}`,
      title: '新生成的綜合創新報告',
      type: 'innovation-summary',
      status: 'completed',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      author: 'Multi-Agent System',
      tags: ['AI', '創新', '最新'],
      downloadCount: 0,
      shareCount: 0,
      sections: [
        {
          id: 'new-summary',
          title: '報告摘要',
          type: 'text',
          content: '這是一份由AI智能體系統自動生成的綜合創新報告，包含完整的創新流程分析和商業策略建議。'
        }
      ]
    }
    
    setReports(prev => [newReport, ...prev])
    setSelectedReport(newReport.id)
    setIsGenerating(false)
  }

  const downloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (report) {
      // 模擬下載
      console.log(`Downloading report: ${report.title}`)
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, downloadCount: r.downloadCount + 1 } : r
      ))
    }
  }

  const shareReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (report) {
      // 模擬分享
      navigator.clipboard.writeText(`${window.location.origin}/reports/${reportId}`)
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, shareCount: r.shareCount + 1 } : r
      ))
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            報告管理系統
          </h1>
          <p className="text-gray-600">
            AI智能體生成的完整報告書，包含創新分析、商業策略和技術評估
          </p>
        </div>
        <Button 
          onClick={generateNewReport}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              生成中...
            </>
          ) : (
            <>
              <FileText size={16} className="mr-2" />
              生成新報告
            </>
          )}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索報告標題或標籤..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有類型</option>
              <option value="innovation-summary">創新總結</option>
              <option value="business-strategy">商業策略</option>
              <option value="technical-analysis">技術分析</option>
              <option value="market-research">市場研究</option>
              <option value="financial-projection">財務預測</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">報告列表</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedReport === report.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {getTypeIcon(report.type)}
                      <span className="ml-2 text-sm font-medium text-gray-900 line-clamp-2">
                        {report.title}
                      </span>
                    </div>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    {getTypeName(report.type)} • {report.author}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{report.updatedAt}</span>
                    <div className="flex items-center gap-2">
                      <span>{report.downloadCount} 下載</span>
                      <span>{report.shareCount} 分享</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {report.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2">
          {selectedReport && getSelectedReport() ? (
            <div className="space-y-6">
              {/* Report Header */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(getSelectedReport()!.type)}
                      <h2 className="text-xl font-semibold text-gray-900">
                        {getSelectedReport()!.title}
                      </h2>
                      <Badge className={getStatusColor(getSelectedReport()!.status)}>
                        {getSelectedReport()!.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {getTypeName(getSelectedReport()!.type)} • 由 {getSelectedReport()!.author} 創建
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedReport()!.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Report Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button 
                    onClick={() => downloadReport(getSelectedReport()!.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Download size={14} className="mr-2" />
                    下載 PDF
                  </Button>
                  <Button 
                    onClick={() => shareReport(getSelectedReport()!.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Share size={14} className="mr-2" />
                    分享
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer size={14} className="mr-2" />
                    列印
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye size={14} className="mr-2" />
                    預覽
                  </Button>
                </div>
              </Card>

              {/* Report Content */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">報告內容</h3>
                <div className="space-y-6">
                  {getSelectedReport()!.sections.map((section) => (
                    <div key={section.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900 mb-2">{section.title}</h4>
                      
                      {section.type === 'text' && (
                        <p className="text-gray-700 leading-relaxed">{section.content}</p>
                      )}
                      
                      {section.type === 'chart' && section.data && (
                        <div>
                          <p className="text-gray-700 mb-3">{section.content}</p>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">市場規模</p>
                                <p className="text-lg font-semibold text-blue-600">{section.data.marketSize}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">增長率</p>
                                <p className="text-lg font-semibold text-green-600">{section.data.growthRate}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {section.type === 'table' && section.data && (
                        <div>
                          <p className="text-gray-700 mb-3">{section.content}</p>
                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 rounded-lg">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">年份</th>
                                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">收入</th>
                                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">利潤</th>
                                </tr>
                              </thead>
                              <tbody>
                                {section.data.projections?.map((proj: any, index: number) => (
                                  <tr key={index} className="border-t border-gray-200">
                                    <td className="px-4 py-2 text-sm text-gray-900">{proj.year}</td>
                                    <td className="px-4 py-2 text-sm text-right text-green-600">
                                      ${(proj.revenue / 1000000).toFixed(1)}M
                                    </td>
                                    <td className={`px-4 py-2 text-sm text-right ${
                                      proj.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      ${(proj.profit / 1000000).toFixed(1)}M
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Report Metadata */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">報告信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">創建日期：{getSelectedReport()!.createdAt}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">更新日期：{getSelectedReport()!.updatedAt}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">作者：{getSelectedReport()!.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Download size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">下載次數：{getSelectedReport()!.downloadCount}</span>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">選擇一個報告</h3>
              <p className="text-gray-600">從左側列表中選擇一個報告來查看詳細內容</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
