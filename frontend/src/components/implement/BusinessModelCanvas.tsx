import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Building, Users, DollarSign, Target, Truck, Heart } from 'lucide-react'
import { ReflectionResult, EvaluationResult } from '@/services/biodesignService'

interface BusinessModelCanvasProps {
  sessionId: string | undefined
  reflectionResult: ReflectionResult | null
  evaluationResult: EvaluationResult | null
}

const BusinessModelCanvas: React.FC<BusinessModelCanvasProps> = ({
  sessionId,
  reflectionResult
}) => {
  const [canvasData, setCanvasData] = useState({
    keyPartners: '',
    keyActivities: '',
    keyResources: '',
    valuePropositions: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setCanvasData(prev => ({ ...prev, [field]: value }))
  }

  const exportCanvas = () => {
    const exportData = {
      sessionId,
      businessModel: canvasData,
      createdAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `business-model-canvas-${sessionId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Business Model Canvas
          </CardTitle>
          <CardDescription>
            Design your business model using the proven Business Model Canvas framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button onClick={exportCanvas} variant="outline" size="sm">
              Export Canvas
            </Button>
          </div>
          
          {/* Canvas Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
            {/* Key Partners */}
            <Card className="lg:row-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Key Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="Who are your key partners and suppliers? What key activities do partners perform?"
                  value={canvasData.keyPartners}
                  onChange={(e) => handleInputChange('keyPartners', e.target.value)}
                  rows={8}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>

            {/* Key Activities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Key Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="What key activities does your value proposition require?"
                  value={canvasData.keyActivities}
                  onChange={(e) => handleInputChange('keyActivities', e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>

            {/* Value Propositions */}
            <Card className="lg:row-span-2 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-green-600" />
                  Value Propositions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="What value do you deliver to customers? Which problems are you solving?"
                  value={canvasData.valuePropositions}
                  onChange={(e) => handleInputChange('valuePropositions', e.target.value)}
                  rows={8}
                  className="resize-none text-sm bg-white/80"
                />
                {reflectionResult && (
                  <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-xs">
                    <strong>From Needs Analysis:</strong> {reflectionResult.final_summary.slice(0, 100)}...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Relationships */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  Customer Relationships
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="What type of relationship does each customer segment expect?"
                  value={canvasData.customerRelationships}
                  onChange={(e) => handleInputChange('customerRelationships', e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card className="lg:row-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-600" />
                  Customer Segments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="For whom are you creating value? Who are your most important customers?"
                  value={canvasData.customerSegments}
                  onChange={(e) => handleInputChange('customerSegments', e.target.value)}
                  rows={8}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>

            {/* Key Resources */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-600" />
                  Key Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="What key resources does your value proposition require?"
                  value={canvasData.keyResources}
                  onChange={(e) => handleInputChange('keyResources', e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>

            {/* Channels */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-yellow-600" />
                  Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="Through which channels do you want to reach your customers?"
                  value={canvasData.channels}
                  onChange={(e) => handleInputChange('channels', e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>

            {/* Cost Structure */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  Cost Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="What are the most important costs? Which key resources and activities are most expensive?"
                  value={canvasData.costStructure}
                  onChange={(e) => handleInputChange('costStructure', e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>

            {/* Revenue Streams */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Revenue Streams
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="For what value are customers willing to pay? How would they prefer to pay?"
                  value={canvasData.revenueStreams}
                  onChange={(e) => handleInputChange('revenueStreams', e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Business Model Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Business Model Analysis</CardTitle>
          <CardDescription>
            Insights and recommendations based on your business model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">Market Strategy</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Focus on healthcare institutions first, then expand to individual patients
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">Revenue Model</div>
                  <div className="text-sm text-green-700 mt-1">
                    Subscription-based with tiered pricing for different user segments
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">Risk Mitigation</div>
                  <div className="text-sm text-orange-700 mt-1">
                    Diversify customer base and maintain strong partnerships
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Key Recommendations</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Validate your value proposition with target customers early and often</li>
              <li>• Consider regulatory requirements when defining your key activities</li>
              <li>• Build strong partnerships with healthcare institutions for market entry</li>
              <li>• Plan for multiple revenue streams to reduce dependency risk</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BusinessModelCanvas
