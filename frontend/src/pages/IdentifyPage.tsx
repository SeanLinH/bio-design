import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Search, Brain, Users, Target } from 'lucide-react'
import { biodesignService, ReflectionRequest, ReflectionResult } from '@/services/biodesignService'
import { useToast } from '@/hooks/use-toast'
import DocumentUploadZone from '@/components/common/DocumentUploadZone'
import NeedsDiscoveryForm from '@/components/identify/NeedsDiscoveryForm'
import ResultsDisplay from '@/components/identify/ResultsDisplay'
import RealtimeProgress from '@/components/common/RealtimeProgress'

interface IdentifyPageProps {}

const IdentifyPage: React.FC<IdentifyPageProps> = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { toast } = useToast()
  
  // State management
  const [activeTab, setActiveTab] = useState('discovery')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reflectionResult, setReflectionResult] = useState<ReflectionResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)
  
  // Form state
  const [needsQuery, setNeedsQuery] = useState('')
  const [maxRounds, setMaxRounds] = useState(3)
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([])
  const [isRealtimeMode, setIsRealtimeMode] = useState(false)

  // Load existing results if sessionId is provided
  useEffect(() => {
    if (currentSessionId) {
      loadReflectionResult(currentSessionId)
    }
  }, [currentSessionId])

  const loadReflectionResult = async (sessionId: string) => {
    try {
      const result = await biodesignService.getReflectionResult(sessionId)
      setReflectionResult(result)
      setActiveTab('results')
    } catch (error) {
      console.error('Failed to load reflection result:', error)
    }
  }

  const handleSubmitNeedsAnalysis = async () => {
    if (!needsQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a medical scenario or need description.',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    setProgress(0)

    try {
      const request: ReflectionRequest = {
        query: needsQuery,
        max_rounds: maxRounds
      }

      let response
      if (isRealtimeMode) {
        response = await biodesignService.submitReflectionQueryRealtime(request)
        // Start real-time progress monitoring
        startRealtimeProgress(response.session_id)
      } else {
        response = await biodesignService.submitReflectionQuery(request)
        // Poll for completion
        pollForCompletion(response.session_id)
      }

      setCurrentSessionId(response.session_id)
      
      toast({
        title: 'Analysis Started',
        description: `Session ID: ${response.session_id}`,
      })

    } catch (error) {
      console.error('Failed to submit needs analysis:', error)
      toast({
        title: 'Error',
        description: 'Failed to start needs analysis. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startRealtimeProgress = (sessionId: string) => {
    const eventSource = biodesignService.createReflectionStream(sessionId)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'progress') {
          setProgress(data.progress || 0)
        } else if (data.type === 'status') {
          console.log('Status update:', data.message)
        } else if (data.type === 'completion') {
          eventSource.close()
          loadReflectionResult(sessionId)
          setIsAnalyzing(false)
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      eventSource.close()
      setIsAnalyzing(false)
    }
  }

  const pollForCompletion = async (sessionId: string) => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const result = await biodesignService.getReflectionResult(sessionId)
        
        if (result.status === 'completed') {
          setReflectionResult(result)
          setActiveTab('results')
          setIsAnalyzing(false)
          setProgress(100)
          return
        }

        attempts++
        setProgress((attempts / maxAttempts) * 100)

        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          setIsAnalyzing(false)
          toast({
            title: 'Timeout',
            description: 'Analysis is taking longer than expected. Please check back later.',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Polling error:', error)
        setTimeout(poll, 5000)
      }
    }

    poll()
  }

  const handleDocumentUpload = (files: File[]) => {
    setUploadedDocuments(prev => [...prev, ...files])
    toast({
      title: 'Documents Uploaded',
      description: `${files.length} document(s) uploaded successfully.`
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IDENTIFY Phase</h1>
            <p className="text-gray-600">Discover and analyze unmet medical needs</p>
          </div>
        </div>
        
        {currentSessionId && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Session: {currentSessionId}
            </Badge>
            {reflectionResult && (
              <Badge variant="secondary" className="text-sm">
                Status: {reflectionResult.status}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Progress indicator for active analysis */}
      {isAnalyzing && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Analyzing medical needs...</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discovery" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Discovery
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!reflectionResult}>
            <Users className="w-4 h-4" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Needs Discovery Tab */}
        <TabsContent value="discovery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Needs Discovery</CardTitle>
              <CardDescription>
                Describe a medical scenario, unmet need, or problem area you'd like to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NeedsDiscoveryForm
                query={needsQuery}
                maxRounds={maxRounds}
                isRealtimeMode={isRealtimeMode}
                onQueryChange={setNeedsQuery}
                onMaxRoundsChange={setMaxRounds}
                onRealtimeModeChange={setIsRealtimeMode}
                onSubmit={handleSubmitNeedsAnalysis}
                isSubmitting={isAnalyzing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Upload Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>
                Upload research papers, clinical data, market reports, or other relevant documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploadZone
                onFilesUploaded={handleDocumentUpload}
                uploadedFiles={uploadedDocuments}
                maxFiles={10}
                acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Analysis</CardTitle>
              <CardDescription>
                Monitor the multi-agent discussion and analysis progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing && currentSessionId ? (
                <RealtimeProgress sessionId={currentSessionId} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active analysis. Start a needs discovery to see real-time progress.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {reflectionResult ? (
            <ResultsDisplay result={reflectionResult} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-500 mb-6">
                  Complete a needs analysis to see detailed results and insights.
                </p>
                <Button onClick={() => setActiveTab('discovery')}>
                  Start Needs Discovery
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IdentifyPage
