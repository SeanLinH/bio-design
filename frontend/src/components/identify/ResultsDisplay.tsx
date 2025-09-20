import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Users, 
  Clock, 
  Target, 
  Lightbulb, 
  FileText,
  Download,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { ReflectionResult } from '@/services/biodesignService'
import { formatDate } from '@/utils'

interface ResultsDisplayProps {
  result: ReflectionResult
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
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
      original_query: result.original_query,
      analysis_date: result.created_at,
      completion_date: result.completed_at,
      summary: result.final_summary,
      medical_insights: result.medical_insights,
      engineering_insights: result.engineering_insights,
      parsed_needs: result.parsed_needs,
      full_conversation: result.full_conversation
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `needs-analysis-${result.session_id}.json`
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
              <CardTitle className="text-xl">Analysis Results</CardTitle>
              <CardDescription className="mt-2">
                Medical needs analysis completed for session {result.session_id}
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
            {result.completed_at && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Completed: {formatDate(result.completed_at)}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{result.discussion_rounds} discussion rounds</span>
            </div>
            <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
              {result.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Original Query */}
      <CollapsibleSection
        title="Original Query"
        sectionKey="query"
        icon={<FileText className="w-5 h-5 text-blue-600" />}
      >
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-800 leading-relaxed">{result.original_query}</p>
        </div>
      </CollapsibleSection>

      {/* Executive Summary */}
      <CollapsibleSection
        title="Executive Summary"
        sectionKey="summary"
        icon={<Target className="w-5 h-5 text-green-600" />}
        defaultExpanded={true}
      >
        <div className="prose max-w-none">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {result.final_summary}
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Detailed Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="medical" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="medical">Medical Insights</TabsTrigger>
              <TabsTrigger value="engineering">Engineering Insights</TabsTrigger>
              <TabsTrigger value="needs">Parsed Needs</TabsTrigger>
            </TabsList>

            <TabsContent value="medical" className="space-y-4">
              <div className="space-y-3">
                {result.medical_insights && result.medical_insights.length > 0 ? (
                  result.medical_insights.map((insight, index) => (
                    <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 leading-relaxed flex-1">{insight}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No medical insights available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="engineering" className="space-y-4">
              <div className="space-y-3">
                {result.engineering_insights && result.engineering_insights.length > 0 ? (
                  result.engineering_insights.map((insight, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 leading-relaxed flex-1">{insight}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No engineering insights available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="needs" className="space-y-4">
              <div className="space-y-4">
                {result.parsed_needs && Object.keys(result.parsed_needs).length > 0 ? (
                  Object.entries(result.parsed_needs).map(([key, value], index) => (
                    <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Lightbulb className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{key}</h4>
                          <div className="text-gray-700">
                            {typeof value === 'string' ? (
                              <p>{value}</p>
                            ) : (
                              <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No parsed needs available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Full Conversation */}
      <CollapsibleSection
        title="Full Agent Conversation"
        sectionKey="conversation"
        icon={<Users className="w-5 h-5 text-gray-600" />}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {result.full_conversation && result.full_conversation.length > 0 ? (
            result.full_conversation.map((message, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Message {index + 1}</div>
                <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No conversation log available</p>
          )}
        </div>
      </CollapsibleSection>
    </div>
  )
}

export default ResultsDisplay
