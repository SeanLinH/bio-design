import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Rocket, 
  TrendingUp, 
  Users, 
  Target, 
  Building, 
  DollarSign,
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { 
  biodesignService, 
  PrioritizationResult, 
  EvaluationResult,
  ReflectionResult 
} from '@/services/biodesignService'
import { useToast } from '@/hooks/use-toast'
import ImplementationPlanDisplay from '@/components/implement/ImplementationPlanDisplay'
import BusinessModelCanvas from '@/components/implement/BusinessModelCanvas'
import PrototypeDevelopment from '@/components/implement/PrototypeDevelopment'
import MarketAnalysis from '@/components/implement/MarketAnalysis'

interface ImplementPageProps {}

const ImplementPage: React.FC<ImplementPageProps> = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { toast } = useToast()
  
  // State management
  const [activeTab, setActiveTab] = useState('planning')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [prioritizationResult, setPrioritizationResult] = useState<PrioritizationResult | null>(null)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null)
  const [reflectionResult, setReflectionResult] = useState<ReflectionResult | null>(null)
  const [progress, setProgress] = useState(0)

  // Load existing results if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      loadExistingResults(sessionId)
    }
  }, [sessionId])

  const loadExistingResults = async (sessionId: string) => {
    try {
      // Load all previous phase results
      const [reflection, evaluation] = await Promise.all([
        biodesignService.getReflectionResult(sessionId),
        biodesignService.getEvaluationResult(sessionId)
      ])
      
      setReflectionResult(reflection)
      setEvaluationResult(evaluation)

      // Try to load prioritization result
      try {
        const prioritization = await biodesignService.getPrioritizationResult(sessionId)
        setPrioritizationResult(prioritization)
        setActiveTab('results')
      } catch (error) {
        console.log('No prioritization result found, which is expected for a new session')
      }
    } catch (error) {
      console.error('Failed to load existing results:', error)
      toast({
        title: 'Error',
        description: 'Failed to load session data. Please ensure previous phases are completed.',
        variant: 'destructive'
      })
    }
  }

  const handleStartPrioritization = async () => {
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'No session ID available. Please complete previous phases first.',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    setProgress(0)

    try {
      toast({
        title: 'Prioritization Started',
        description: 'Analyzing implementation priorities and business strategy...',
      })

      // Poll for prioritization completion
      const maxAttempts = 30 // 2.5 minutes with 5-second intervals
      let attempts = 0

      const poll = async () => {
        try {
          const result = await biodesignService.getPrioritizationResult(sessionId)
          
          if (result.status === 'completed') {
            setPrioritizationResult(result)
            setActiveTab('results')
            setIsAnalyzing(false)
            setProgress(100)
            toast({
              title: 'Prioritization Complete',
              description: 'Implementation analysis and prioritization finished successfully.'
            })
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
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000)
          } else {
            setIsAnalyzing(false)
            console.error('Prioritization polling error:', error)
          }
        }
      }

      // Start polling after a short delay
      setTimeout(poll, 2000)

    } catch (error) {
      console.error('Failed to start prioritization:', error)
      setIsAnalyzing(false)
      toast({
        title: 'Error',
        description: 'Failed to start prioritization process. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getPhaseCompletionStatus = () => {
    return {
      identify: !!reflectionResult && reflectionResult.status === 'completed',
      invent: !!evaluationResult && evaluationResult.status === 'completed',
      implement: !!prioritizationResult && prioritizationResult.status === 'completed'
    }
  }

  const phaseStatus = getPhaseCompletionStatus()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Rocket className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IMPLEMENT Phase</h1>
            <p className="text-gray-600">Develop implementation strategy and business plan</p>
          </div>
        </div>
        
        {sessionId && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-sm">
              Session: {sessionId}
            </Badge>
            <Badge variant={phaseStatus.identify ? 'default' : 'secondary'} className="text-sm">
              IDENTIFY: {phaseStatus.identify ? '✓ Complete' : '⧗ Pending'}
            </Badge>
            <Badge variant={phaseStatus.invent ? 'default' : 'secondary'} className="text-sm">
              INVENT: {phaseStatus.invent ? '✓ Complete' : '⧗ Pending'}
            </Badge>
            <Badge variant={phaseStatus.implement ? 'default' : 'secondary'} className="text-sm">
              IMPLEMENT: {phaseStatus.implement ? '✓ Complete' : '⧗ Pending'}
            </Badge>
          </div>
        )}
      </div>

      {/* Prerequisites Check */}
      {(!phaseStatus.identify || !phaseStatus.invent) && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Complete Previous Phases First</h3>
                <p className="text-yellow-800 mb-4">
                  To proceed with implementation planning, you need to complete both the IDENTIFY 
                  and INVENT phases. This provides the foundation for developing a comprehensive 
                  implementation strategy.
                </p>
                <div className="flex gap-3">
                  {!phaseStatus.identify && (
                    <Button 
                      onClick={() => window.location.href = `/session/${sessionId}/identify`}
                      variant="outline"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      Complete IDENTIFY Phase
                    </Button>
                  )}
                  {!phaseStatus.invent && (
                    <Button 
                      onClick={() => window.location.href = `/session/${sessionId}/invent`}
                      variant="outline"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      Complete INVENT Phase
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress indicator for active analysis */}
      {isAnalyzing && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Analyzing implementation strategy...</span>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Business Model
          </TabsTrigger>
          <TabsTrigger value="prototype" className="flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Prototype
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market Analysis
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!prioritizationResult && !isAnalyzing}>
            <CheckCircle className="w-4 h-4" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Implementation Planning Tab */}
        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Planning</CardTitle>
              <CardDescription>
                Strategic planning for bringing your solution to market
              </CardDescription>
            </CardHeader>
            <CardContent>
              {phaseStatus.identify && phaseStatus.invent ? (
                <div className="space-y-6">
                  {/* Implementation Strategy Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4 text-center">
                        <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-medium text-blue-900">Regulatory Strategy</h3>
                        <p className="text-sm text-blue-700">FDA pathways & compliance</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4 text-center">
                        <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-medium text-green-900">Funding Strategy</h3>
                        <p className="text-sm text-green-700">Investment & grants</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="pt-4 text-center">
                        <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <h3 className="font-medium text-orange-900">Team Building</h3>
                        <p className="text-sm text-orange-700">Key hires & partnerships</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="pt-4 text-center">
                        <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-medium text-purple-900">Go-to-Market</h3>
                        <p className="text-sm text-purple-700">Launch & distribution</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Start Analysis Button */}
                  <div className="text-center py-8 bg-gray-50 rounded-lg border">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Implementation Analysis?</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Generate a comprehensive implementation strategy based on your identified needs and evaluated solutions.
                    </p>
                    <Button 
                      onClick={handleStartPrioritization}
                      disabled={isAnalyzing}
                      className="bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Start Implementation Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Complete previous phases to access implementation planning tools.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Model Tab */}
        <TabsContent value="business" className="space-y-6">
          <BusinessModelCanvas 
            sessionId={sessionId}
            reflectionResult={reflectionResult}
            evaluationResult={evaluationResult}
          />
        </TabsContent>

        {/* Prototype Development Tab */}
        <TabsContent value="prototype" className="space-y-6">
          <PrototypeDevelopment 
            sessionId={sessionId}
            reflectionResult={reflectionResult}
            evaluationResult={evaluationResult}
          />
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-6">
          <MarketAnalysis 
            sessionId={sessionId}
            reflectionResult={reflectionResult}
            evaluationResult={evaluationResult}
          />
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {prioritizationResult ? (
            <ImplementationPlanDisplay result={prioritizationResult} />
          ) : isAnalyzing ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Implementation Plan</h3>
                <p className="text-gray-500 mb-6">
                  Our AI agents are creating a comprehensive implementation strategy...
                </p>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Implementation Plan Yet</h3>
                <p className="text-gray-500 mb-6">
                  Start the implementation analysis to generate a comprehensive business strategy and implementation roadmap.
                </p>
                <Button 
                  onClick={handleStartPrioritization}
                  disabled={!phaseStatus.identify || !phaseStatus.invent || isAnalyzing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Generate Implementation Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ImplementPage
