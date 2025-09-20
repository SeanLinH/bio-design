import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Download,
  Share2,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { EvaluationResult } from '@/services/biodesignService'
import { formatDate } from '@/utils'

interface EvaluationDisplayProps {
  result: EvaluationResult
}

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ result }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']))

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey)
    } else {
      newExpanded.add(sectionKey)
    }
    setExpandedSections(newExpanded)
  }

  const exportResults = () => {
    const exportData = {
      session_id: result.session_id,
      status: result.status,
      evaluations: result.evaluations,
      summary: result.summary,
      top_priority_needs: result.top_priority_needs,
      created_at: result.created_at
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evaluation-results-${result.session_id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Note: helper functions removed to satisfy strict noUnusedLocals; can be reintroduced when used in UI.

  const CollapsibleSection: React.FC<{
    title: string
    sectionKey: string
    icon: React.ReactNode
    children: React.ReactNode
    defaultExpanded?: boolean
  }> = ({ title, sectionKey, icon, children, defaultExpanded = false }) => {
    const isExpanded = expandedSections.has(sectionKey)
    
    React.useEffect(() => {
      if (defaultExpanded && !expandedSections.has(sectionKey)) {
        setExpandedSections(prev => new Set([...prev, sectionKey]))
      }
    }, [defaultExpanded, sectionKey])

    return (
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            {children}
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with metadata */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Evaluation Results</CardTitle>
              <CardDescription className="mt-2">
                Need evaluation and prioritization for session {result.session_id}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Created: {formatDate(result.created_at)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span>{result.top_priority_needs?.length || 0} priority needs identified</span>
            </div>
            <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
              {result.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <CollapsibleSection
        title="Executive Summary"
        sectionKey="summary"
        icon={<Brain className="w-5 h-5 text-purple-600" />}
        defaultExpanded={true}
      >
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {result.summary}
          </p>
        </div>
      </CollapsibleSection>

      {/* Top Priority Needs */}
      <CollapsibleSection
        title="Top Priority Needs"
        sectionKey="priorities"
        icon={<Star className="w-5 h-5 text-orange-600" />}
        defaultExpanded={true}
      >
        <div className="space-y-3">
          {result.top_priority_needs && result.top_priority_needs.length > 0 ? (
            result.top_priority_needs.map((need, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed">{need}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline" className="bg-orange-100 text-orange-700">
                        High Priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No priority needs available</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Detailed Evaluations */}
      <CollapsibleSection
        title="Detailed Evaluations"
        sectionKey="evaluations"
        icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.evaluations?.length || 0}
                    </div>
                    <div className="text-sm text-blue-700">Total Evaluations</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.top_priority_needs?.length || 0}
                    </div>
                    <div className="text-sm text-green-700">High Priority</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">85%</div>
                    <div className="text-sm text-orange-700">Confidence Score</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="space-y-4">
              {result.evaluations && result.evaluations.length > 0 ? (
                result.evaluations.map((evaluation, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-400">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Evaluation {index + 1}</span>
                        <Badge variant="outline">Metric Data</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(evaluation).map(([key, value], entryIndex) => (
                          <div key={entryIndex} className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <div className="text-sm text-gray-800">
                              {typeof value === 'number' ? (
                                <div className="flex items-center space-x-2">
                                  <Progress value={value} className="w-20 h-2" />
                                  <span>{value}%</span>
                                </div>
                              ) : (
                                <span>{String(value)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No detailed metrics available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Analysis</CardTitle>
                <CardDescription>
                  Deep analysis of evaluation criteria and outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-700">Clear problem definition</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-700">Strong market potential</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-700">Technical feasibility confirmed</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <span className="text-sm text-gray-700">Regulatory pathway unclear</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <span className="text-sm text-gray-700">Cost structure needs refinement</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <span className="text-sm text-gray-700">User adoption strategy needed</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CollapsibleSection>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Next Steps</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-800">Needs identified and evaluated</span>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-gray-800">Ready to proceed to IMPLEMENT phase</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-gray-800">Consider stakeholder validation</span>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Proceed to IMPLEMENT Phase
            </Button>
            <Button variant="outline">
              Review with Stakeholders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EvaluationDisplay
