import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Rocket, 
  Target, 
  TrendingUp, 
  Users, 
  Download,
  Share2,
  Calendar,
  DollarSign,
  FileText,
  Building,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { PrioritizationResult } from '@/services/biodesignService'
import { formatDate } from '@/utils'

interface ImplementationPlanDisplayProps {
  result: PrioritizationResult
}

const ImplementationPlanDisplay: React.FC<ImplementationPlanDisplayProps> = ({ result }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))

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
      prioritized_needs: result.prioritized_needs,
      ranking_criteria: result.ranking_criteria,
      recommendations: result.recommendations,
      created_at: result.created_at
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `implementation-plan-${result.session_id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
              <CardTitle className="text-xl">Implementation Plan</CardTitle>
              <CardDescription className="mt-2">
                Comprehensive implementation strategy for session {result.session_id}
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
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Created: {formatDate(result.created_at)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span>{result.prioritized_needs?.length || 0} prioritized needs</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span>{result.recommendations?.length || 0} recommendations</span>
            </div>
            <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
              {result.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Implementation Overview */}
      <CollapsibleSection
        title="Implementation Overview"
        sectionKey="overview"
        icon={<Rocket className="w-5 h-5 text-green-600" />}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-blue-600">6-12</div>
              <div className="text-sm text-blue-700">Months to MVP</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-green-600">$500K</div>
              <div className="text-sm text-green-700">Estimated Funding</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-orange-600">85%</div>
              <div className="text-sm text-orange-700">Success Probability</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-purple-600">5-8</div>
              <div className="text-sm text-purple-700">Team Size</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Strategic Summary</h4>
            <p className="text-gray-700 leading-relaxed">
              Based on the identified medical needs and evaluated solutions, this implementation plan 
              focuses on developing a minimum viable product (MVP) that addresses the highest priority 
              healthcare challenges. The strategy emphasizes rapid prototyping, user validation, and 
              iterative development to ensure market fit.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Prioritized Needs */}
      <CollapsibleSection
        title="Prioritized Implementation Targets"
        sectionKey="priorities"
        icon={<Target className="w-5 h-5 text-blue-600" />}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          {result.prioritized_needs && result.prioritized_needs.length > 0 ? (
            result.prioritized_needs.map((need, index) => (
              <Card key={index} className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {typeof need === 'string' ? need : need.title || `Priority ${index + 1}`}
                        </CardTitle>
                        {typeof need === 'object' && need.description && (
                          <CardDescription className="mt-1">
                            {need.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Priority {index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Timeline: 3-6 months</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>Investment: $100-200K</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>Team: 2-4 people</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No prioritized needs available</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Implementation Strategy */}
      <CollapsibleSection
        title="Implementation Strategy"
        sectionKey="strategy"
        icon={<Building className="w-5 h-5 text-purple-600" />}
      >
        <Tabs defaultValue="roadmap" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
                  <h4 className="font-medium text-blue-900">Phase 1: Foundation (Months 1-3)</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-1 ml-9">
                  <li>• Team recruitment and onboarding</li>
                  <li>• Market research and validation</li>
                  <li>• Initial prototype development</li>
                  <li>• Regulatory pathway assessment</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">2</div>
                  <h4 className="font-medium text-green-900">Phase 2: Development (Months 4-8)</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-1 ml-9">
                  <li>• MVP development and testing</li>
                  <li>• User feedback collection</li>
                  <li>• Regulatory submissions</li>
                  <li>• Partnership negotiations</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">3</div>
                  <h4 className="font-medium text-orange-900">Phase 3: Launch (Months 9-12)</h4>
                </div>
                <ul className="text-sm text-orange-800 space-y-1 ml-9">
                  <li>• Product launch preparation</li>
                  <li>• Marketing and sales strategy</li>
                  <li>• Customer acquisition</li>
                  <li>• Scale-up planning</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <div className="space-y-3">
              {[
                { milestone: "Prototype Completion", target: "Month 3", status: "pending" },
                { milestone: "User Testing Complete", target: "Month 5", status: "pending" },
                { milestone: "Regulatory Approval", target: "Month 8", status: "pending" },
                { milestone: "Product Launch", target: "Month 12", status: "pending" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{item.milestone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{item.target}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Required Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Development Team</span>
                    <span className="text-sm font-medium">$300K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Equipment & Tools</span>
                    <span className="text-sm font-medium">$100K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Regulatory & Legal</span>
                    <span className="text-sm font-medium">$50K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Marketing & Sales</span>
                    <span className="text-sm font-medium">$50K</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center font-medium">
                    <span>Total Budget</span>
                    <span>$500K</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Product Manager</span>
                    <Badge variant="outline" className="text-xs">Critical</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lead Engineer</span>
                    <Badge variant="outline" className="text-xs">Critical</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">UX Designer</span>
                    <Badge variant="outline" className="text-xs">Important</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Regulatory Specialist</span>
                    <Badge variant="outline" className="text-xs">Important</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <div className="space-y-3">
              {[
                { risk: "Regulatory delays", impact: "High", probability: "Medium", mitigation: "Early FDA engagement" },
                { risk: "Technical challenges", impact: "Medium", probability: "Medium", mitigation: "Iterative prototyping" },
                { risk: "Market competition", impact: "Medium", probability: "High", mitigation: "Unique value proposition" },
                { risk: "Funding shortfall", impact: "High", probability: "Low", mitigation: "Multiple funding sources" }
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{item.risk}</h4>
                        <p className="text-sm text-gray-600">{item.mitigation}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Impact: {item.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Risk: {item.probability}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CollapsibleSection>

      {/* Recommendations */}
      <CollapsibleSection
        title="Strategic Recommendations"
        sectionKey="recommendations"
        icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
      >
        <div className="space-y-4">
          {result.recommendations && result.recommendations.length > 0 ? (
            result.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 leading-relaxed flex-1">{recommendation}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recommendations available</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-green-600" />
            <span>Ready to Launch</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-800">Implementation plan completed</span>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-gray-800">Priorities identified and ranked</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-gray-800">Resource requirements defined</span>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button className="bg-green-600 hover:bg-green-700">
              Begin Implementation
            </Button>
            <Button variant="outline">
              Schedule Review Meeting
            </Button>
            <Button variant="outline">
              Contact Advisors
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ImplementationPlanDisplay
