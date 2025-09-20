import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign,
  BarChart,
  PieChart,
  Globe,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { ReflectionResult, EvaluationResult } from '@/services/biodesignService'

interface MarketAnalysisProps {
  sessionId: string | undefined
  reflectionResult: ReflectionResult | null
  evaluationResult: EvaluationResult | null
}

interface MarketData {
  segment: string
  size: number
  growth: number
  share: number
  potential: 'high' | 'medium' | 'low'
}

interface CompetitorData {
  name: string
  marketShare: number
  strengths: string[]
  weaknesses: string[]
  threat: 'high' | 'medium' | 'low'
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ 
  reflectionResult 
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  
  const marketData: MarketData[] = [
    { segment: 'Hospital Systems', size: 2500000000, growth: 8.5, share: 35, potential: 'high' },
    { segment: 'Outpatient Clinics', size: 1200000000, growth: 12.3, share: 20, potential: 'high' },
    { segment: 'Home Healthcare', size: 850000000, growth: 15.7, share: 15, potential: 'high' },
    { segment: 'Specialty Care', size: 600000000, growth: 6.2, share: 18, potential: 'medium' },
    { segment: 'Emergency Services', size: 400000000, growth: 4.1, share: 12, potential: 'medium' }
  ]

  const competitors: CompetitorData[] = [
    {
      name: 'MedTech Leader A',
      marketShare: 28,
      strengths: ['Strong brand recognition', 'Extensive distribution', 'R&D capabilities'],
      weaknesses: ['High pricing', 'Legacy technology', 'Slow innovation'],
      threat: 'high'
    },
    {
      name: 'Innovation Corp B',
      marketShare: 15,
      strengths: ['Cutting-edge technology', 'Agile development', 'User-focused design'],
      weaknesses: ['Limited market presence', 'Funding constraints', 'Regulatory inexperience'],
      threat: 'medium'
    },
    {
      name: 'Established Player C',
      marketShare: 22,
      strengths: ['Regulatory expertise', 'Healthcare partnerships', 'Clinical validation'],
      weaknesses: ['Conservative approach', 'Limited digital integration', 'High overhead'],
      threat: 'medium'
    }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getPotentialColor = (potential: 'high' | 'medium' | 'low') => {
    switch (potential) {
      case 'high': return 'bg-green-50 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-red-50 text-red-700 border-red-200'
    }
  }

  const getThreatColor = (threat: 'high' | 'medium' | 'low') => {
    switch (threat) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-50 text-green-700 border-green-200'
    }
  }

  const totalMarketSize = marketData.reduce((sum, market) => sum + market.size, 0)
  const avgGrowthRate = marketData.reduce((sum, market) => sum + market.growth, 0) / marketData.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Market Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive market assessment for your medical device solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="segments">Segments</TabsTrigger>
              <TabsTrigger value="competition">Competition</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Market Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 text-center">
                    <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(totalMarketSize)}
                    </div>
                    <div className="text-sm text-blue-700">Total Market Size</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 text-center">
                    <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-600">
                      {avgGrowthRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-700">Avg Growth Rate</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-4 text-center">
                    <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-orange-600">
                      {marketData.length}
                    </div>
                    <div className="text-sm text-orange-700">Target Segments</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4 text-center">
                    <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-purple-600">
                      {competitors.length}
                    </div>
                    <div className="text-sm text-purple-700">Key Competitors</div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Context from Needs Analysis */}
              {reflectionResult && (
                <Card className="border-l-4 border-l-blue-400">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Market Context from Needs Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Identified Need:</strong> {reflectionResult.original_query.slice(0, 300)}...
                      </p>
                    </div>
                    {reflectionResult.medical_insights && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Market Opportunities:</strong> {reflectionResult.medical_insights.length} key insights identified that suggest strong market demand and unmet clinical needs.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Key Market Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Market Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Growing Market</p>
                          <p className="text-xs text-green-700">Healthcare technology adoption is accelerating post-pandemic</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Digital Transformation</p>
                          <p className="text-xs text-blue-700">Hospitals investing heavily in digital health solutions</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Regulatory Complexity</p>
                          <p className="text-xs text-yellow-700">FDA approval process requires significant time and resources</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                        <Globe className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">Global Opportunity</p>
                          <p className="text-xs text-purple-700">International markets offer expansion potential</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Market Segments Tab */}
            <TabsContent value="segments" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Market Segments Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketData.map((segment, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-400">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{segment.segment}</h3>
                            <Badge variant="outline" className={getPotentialColor(segment.potential)}>
                              {segment.potential} potential
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Market Size</p>
                              <p className="font-medium">{formatCurrency(segment.size)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Growth Rate</p>
                              <div className="flex items-center gap-1">
                                {segment.growth > 10 ? (
                                  <ArrowUp className="w-4 h-4 text-green-600" />
                                ) : (
                                  <ArrowDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className="font-medium">{segment.growth}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">Market Share</p>
                              <p className="font-medium">{segment.share}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Progress</p>
                              <Progress value={segment.share} className="w-full mt-1" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competition Tab */}
            <TabsContent value="competition" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-red-600" />
                    Competitive Landscape
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {competitors.map((competitor, index) => (
                      <Card key={index} className="border-l-4 border-l-red-400">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{competitor.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getThreatColor(competitor.threat)}>
                                {competitor.threat} threat
                              </Badge>
                              <Badge variant="outline">
                                {competitor.marketShare}% market share
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Strengths
                              </h4>
                              <ul className="space-y-1">
                                {competitor.strengths.map((strength, idx) => (
                                  <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                    <span className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                Weaknesses
                              </h4>
                              <ul className="space-y-1">
                                {competitor.weaknesses.map((weakness, idx) => (
                                  <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                    <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                                    {weakness}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Strategy Tab */}
            <TabsContent value="strategy" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Market Entry Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Go-to-Market Timeline */}
                    <Card className="bg-purple-50 border-purple-200">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Go-to-Market Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">Q1</div>
                            <div>
                              <p className="text-sm font-medium">Market Validation</p>
                              <p className="text-xs text-gray-500">Customer interviews, pilot programs</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">Q2</div>
                            <div>
                              <p className="text-sm font-medium">Product Launch</p>
                              <p className="text-xs text-gray-500">Limited market entry, early adopters</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">Q3</div>
                            <div>
                              <p className="text-sm font-medium">Scale & Expand</p>
                              <p className="text-xs text-gray-500">Broader market penetration</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold">Q4</div>
                            <div>
                              <p className="text-sm font-medium">Optimize & Iterate</p>
                              <p className="text-xs text-gray-500">Performance analysis, product improvements</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Strategic Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-l-4 border-l-green-400">
                        <CardHeader>
                          <CardTitle className="text-sm text-green-900">Recommended Approach</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm space-y-1">
                            <p>• <strong>Target Segment:</strong> Hospital Systems (highest potential)</p>
                            <p>• <strong>Positioning:</strong> Differentiate on innovation and user experience</p>
                            <p>• <strong>Pricing:</strong> Value-based pricing model</p>
                            <p>• <strong>Distribution:</strong> Direct sales + strategic partnerships</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-yellow-400">
                        <CardHeader>
                          <CardTitle className="text-sm text-yellow-900">Key Risks & Mitigation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm space-y-1">
                            <p>• <strong>Regulatory delays:</strong> Early FDA engagement</p>
                            <p>• <strong>Competition:</strong> Patent protection + speed to market</p>
                            <p>• <strong>Adoption:</strong> Strong clinical evidence + KOL endorsements</p>
                            <p>• <strong>Funding:</strong> Staged investment approach</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default MarketAnalysis
