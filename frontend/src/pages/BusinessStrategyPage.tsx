import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  BarChart3,
  Calendar,
  Download,
  Share,
  Edit,
  CheckCircle,
  Building,
  Repeat,
  Shield,
  Award,
  Settings,
  FileText
} from 'lucide-react'

interface BusinessModel {
  id: string
  name: string
  description: string
  type: 'B2B' | 'B2C' | 'B2B2C' | 'SaaS' | 'Marketplace'
  revenue: RevenueStream[]
  marketSize: string
  targetCustomers: string[]
  competitiveAdvantage: string[]
  riskFactors: string[]
}

interface RevenueStream {
  id: string
  name: string
  type: 'subscription' | 'one-time' | 'usage-based' | 'commission' | 'licensing'
  description: string
  pricing: PricingTier[]
  projectedRevenue: string
}

interface PricingTier {
  name: string
  price: string
  features: string[]
  targetSegment: string
}

interface FinancialProjection {
  year: number
  revenue: number
  costs: number
  profit: number
  customers: number
  marketShare: number
}

export default function BusinessStrategyPage() {
  const [selectedModel, setSelectedModel] = useState<string>('saas')
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([])
  const [financialProjections, setFinancialProjections] = useState<FinancialProjection[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // 模擬生成商業模式
    generateBusinessModels()
    generateFinancialProjections()
  }, [])

  const generateBusinessModels = () => {
    const models: BusinessModel[] = [
      {
        id: 'saas',
        name: 'SaaS 訂閱模式',
        description: '基於雲端的軟體即服務模式，提供持續的價值和支持',
        type: 'SaaS',
        revenue: [
          {
            id: 'subscription',
            name: '月度/年度訂閱',
            type: 'subscription',
            description: '基於功能層級的訂閱定價',
            projectedRevenue: '$2.5M ARR',
            pricing: [
              {
                name: 'Basic',
                price: '$99/月',
                features: ['基礎監測功能', '標準報告', '5個用戶授權'],
                targetSegment: '小型診所'
              },
              {
                name: 'Professional',
                price: '$299/月',
                features: ['高級分析', '自定義報告', '50個用戶授權', 'API集成'],
                targetSegment: '中型醫療機構'
              },
              {
                name: 'Enterprise',
                price: '$999/月',
                features: ['完整功能套件', '白標方案', '無限用戶', '專屬支持'],
                targetSegment: '大型醫院系統'
              }
            ]
          }
        ],
        marketSize: '$4.2B TAM, $850M SAM',
        targetCustomers: ['醫療機構', '診所', '遠程醫療公司', '健康科技公司'],
        competitiveAdvantage: ['AI驅動的預測分析', '符合HIPAA的安全標準', '無縫EHR集成', '實時數據處理'],
        riskFactors: ['監管變化', '數據隱私法規', '競爭加劇', '技術過時']
      },
      {
        id: 'b2b2c',
        name: 'B2B2C 合作模式',
        description: '通過醫療機構向最終患者提供服務',
        type: 'B2B2C',
        revenue: [
          {
            id: 'licensing',
            name: '授權費用',
            type: 'licensing',
            description: '向合作夥伴收取技術授權費',
            projectedRevenue: '$1.8M annually',
            pricing: [
              {
                name: 'Regional License',
                price: '$50,000/年',
                features: ['區域獨家使用權', '技術支持', '培訓服務'],
                targetSegment: '區域醫療網絡'
              },
              {
                name: 'National License',
                price: '$150,000/年',
                features: ['全國使用權', '完整技術轉移', '聯合品牌機會'],
                targetSegment: '國家級醫療系統'
              }
            ]
          },
          {
            id: 'revenue-share',
            name: '收入分成',
            type: 'commission',
            description: '基於合作夥伴產生的收入進行分成',
            projectedRevenue: '$3.2M annually',
            pricing: [
              {
                name: 'Standard Split',
                price: '30%收入分成',
                features: ['技術提供', '維護支持', '更新服務'],
                targetSegment: '醫療服務提供商'
              }
            ]
          }
        ],
        marketSize: '$6.8B TAM, $1.2B SAM',
        targetCustomers: ['大型醫療系統', '保險公司', '政府醫療部門', '醫療設備公司'],
        competitiveAdvantage: ['已建立的合作夥伴網絡', '規模化部署能力', '本地化支持', '合規專業知識'],
        riskFactors: ['合作夥伴依賴風險', '收入波動', '合同續約風險', '技術標準化挑戰']
      },
      {
        id: 'marketplace',
        name: '健康科技市場平台',
        description: '連接醫療專業人士、患者和技術解決方案的平台',
        type: 'Marketplace',
        revenue: [
          {
            id: 'transaction-fee',
            name: '交易手續費',
            type: 'commission',
            description: '從平台上的交易中收取手續費',
            projectedRevenue: '$4.5M annually',
            pricing: [
              {
                name: 'Standard Fee',
                price: '3-5%交易費',
                features: ['交易處理', '爭議解決', '支付安全'],
                targetSegment: '所有平台用戶'
              }
            ]
          },
          {
            id: 'premium-listing',
            name: '高級列表服務',
            type: 'subscription',
            description: '為服務提供商提供優先展示和推廣',
            projectedRevenue: '$800K annually',
            pricing: [
              {
                name: 'Premium Listing',
                price: '$200/月',
                features: ['優先展示', '增強分析', '營銷工具'],
                targetSegment: '醫療服務提供商'
              }
            ]
          }
        ],
        marketSize: '$12.3B TAM, $2.1B SAM',
        targetCustomers: ['醫療專業人士', '患者', '醫療機構', '健康科技公司'],
        competitiveAdvantage: ['網絡效應', '數據洞察', '品牌信任', '技術基礎設施'],
        riskFactors: ['平台競爭', '監管複雜性', '用戶獲取成本', '雙邊市場挑戰']
      }
    ]
    setBusinessModels(models)
  }

  const generateFinancialProjections = () => {
    const projections: FinancialProjection[] = [
      { year: 2024, revenue: 500000, costs: 800000, profit: -300000, customers: 50, marketShare: 0.1 },
      { year: 2025, revenue: 1500000, costs: 1200000, profit: 300000, customers: 150, marketShare: 0.3 },
      { year: 2026, revenue: 3500000, costs: 2100000, profit: 1400000, customers: 400, marketShare: 0.8 },
      { year: 2027, revenue: 7200000, costs: 3600000, profit: 3600000, customers: 850, marketShare: 1.5 },
      { year: 2028, revenue: 12500000, costs: 5000000, profit: 7500000, customers: 1500, marketShare: 2.5 }
    ]
    setFinancialProjections(projections)
  }

  const getSelectedModel = () => {
    return businessModels.find(model => model.id === selectedModel)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const generateFullReport = async () => {
    setIsGenerating(true)
    // 模擬報告生成
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsGenerating(false)
    // 跳轉到報告頁面
    window.location.href = '/reports'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            商業策略與收入模式
          </h1>
          <p className="text-gray-600">
            AI 智能體分析生成的商業模式、定價策略和財務預測
          </p>
        </div>
        <Button 
          onClick={generateFullReport}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              生成完整報告...
            </>
          ) : (
            <>
              <FileText size={16} className="mr-2" />
              生成完整報告
            </>
          )}
        </Button>
      </div>

      {/* Business Model Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {businessModels.map((model) => (
          <Card 
            key={model.id}
            className={`p-6 cursor-pointer transition-all ${
              selectedModel === model.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedModel(model.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-purple-100 text-purple-800">{model.type}</Badge>
              {selectedModel === model.id && (
                <CheckCircle size={20} className="text-blue-500" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{model.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{model.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">市場規模</span>
              <span className="font-medium text-green-600">{model.marketSize.split(',')[0]}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Business Model Analysis */}
      {getSelectedModel() && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Streams */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <DollarSign size={24} className="mr-2 text-green-500" />
                收入來源分析
              </h3>
              
              {getSelectedModel()?.revenue.map((stream) => (
                <div key={stream.id} className="mb-8 last:mb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{stream.name}</h4>
                      <p className="text-sm text-gray-600">{stream.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{stream.projectedRevenue}</p>
                      <Badge className="bg-blue-100 text-blue-800">{stream.type}</Badge>
                    </div>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stream.pricing.map((tier, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="text-center mb-4">
                          <h5 className="font-semibold text-gray-900">{tier.name}</h5>
                          <p className="text-2xl font-bold text-blue-600 mt-2">{tier.price}</p>
                          <p className="text-sm text-gray-500">{tier.targetSegment}</p>
                        </div>
                        <ul className="space-y-2">
                          {tier.features.map((feature, fidx) => (
                            <li key={fidx} className="flex items-center text-sm">
                              <CheckCircle size={14} className="mr-2 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>

            {/* Financial Projections */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp size={24} className="mr-2 text-blue-500" />
                五年財務預測
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">年份</th>
                      <th className="text-right py-3 px-4">收入</th>
                      <th className="text-right py-3 px-4">成本</th>
                      <th className="text-right py-3 px-4">利潤</th>
                      <th className="text-right py-3 px-4">客戶數</th>
                      <th className="text-right py-3 px-4">市場份額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialProjections.map((projection) => (
                      <tr key={projection.year} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{projection.year}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          {formatCurrency(projection.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right text-red-600">
                          {formatCurrency(projection.costs)}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          projection.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(projection.profit)}
                        </td>
                        <td className="py-3 px-4 text-right">{projection.customers.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{projection.marketShare}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">$12.5M</p>
                  <p className="text-sm text-gray-600">2028年收入預測</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">60%</p>
                  <p className="text-sm text-gray-600">毛利率</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">2.5%</p>
                  <p className="text-sm text-gray-600">預期市場份額</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">$85</p>
                  <p className="text-sm text-gray-600">客戶獲取成本</p>
                </div>
              </div>
            </Card>

            {/* Market Analysis */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Target size={24} className="mr-2 text-orange-500" />
                市場分析與競爭優勢
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">目標客戶</h4>
                  <div className="space-y-2">
                    {getSelectedModel()?.targetCustomers.map((customer, index) => (
                      <div key={index} className="flex items-center">
                        <Building size={16} className="mr-2 text-blue-500" />
                        <span className="text-sm text-gray-700">{customer}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">競爭優勢</h4>
                  <div className="space-y-2">
                    {getSelectedModel()?.competitiveAdvantage.map((advantage, index) => (
                      <div key={index} className="flex items-center">
                        <Award size={16} className="mr-2 text-green-500" />
                        <span className="text-sm text-gray-700">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">風險因素</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSelectedModel()?.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
                      <Shield size={16} className="mr-2 text-red-500" />
                      <span className="text-sm text-red-800">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Performance Indicators */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 size={20} className="mr-2" />
                關鍵績效指標
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ARR</span>
                  <span className="text-sm font-medium text-green-600">$2.5M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">客戶流失率</span>
                  <span className="text-sm font-medium text-blue-600">5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">LTV/CAC</span>
                  <span className="text-sm font-medium text-purple-600">15:1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">月增長率</span>
                  <span className="text-sm font-medium text-orange-600">12%</span>
                </div>
              </div>
            </Card>

            {/* Subscription Plans */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Repeat size={20} className="mr-2" />
                訂閱方案設計
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">基礎版</span>
                    <span className="text-blue-600 font-bold">$99/月</span>
                  </div>
                  <p className="text-sm text-blue-800">適合小型診所，基礎功能套件</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900">專業版</span>
                    <span className="text-green-600 font-bold">$299/月</span>
                  </div>
                  <p className="text-sm text-green-800">中型機構首選，高級分析功能</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-900">企業版</span>
                    <span className="text-purple-600 font-bold">$999/月</span>
                  </div>
                  <p className="text-sm text-purple-800">大型醫院系統，完整解決方案</p>
                </div>
              </div>
            </Card>

            {/* Implementation Timeline */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar size={20} className="mr-2" />
                實施時間表
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Q1 2024</p>
                    <p className="text-xs text-gray-600">產品MVP發布</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Q2 2024</p>
                    <p className="text-xs text-gray-600">首批客戶獲取</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Q3 2024</p>
                    <p className="text-xs text-gray-600">功能完善與擴展</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Q4 2024</p>
                    <p className="text-xs text-gray-600">規模化部署</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">快速操作</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download size={16} className="mr-2" />
                  下載商業計劃書
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share size={16} className="mr-2" />
                  分享財務模型
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit size={16} className="mr-2" />
                  自定義參數
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings size={16} className="mr-2" />
                  模型設置
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
