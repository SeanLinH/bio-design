import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Lightbulb, Cog, Target, Brain, Users, Sparkles } from 'lucide-react'
import { biodesignService, EvaluationResult, ReflectionResult } from '@/services/biodesignService'
import { useToast } from '@/hooks/use-toast'
import SolutionGenerationForm from '@/components/invent/SolutionGenerationForm'
import ConceptInventionTools from '@/components/invent/ConceptInventionTools'
import EvaluationDisplay from '@/components/invent/EvaluationDisplay'

interface InventPageProps {}

const InventPage: React.FC<InventPageProps> = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { toast } = useToast()
  
  // State management
  const [activeTab, setActiveTab] = useState('generation')
  const [isEvaluating, setIsEvaluating] = useState(false)
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
      // Load reflection result first
      const reflection = await biodesignService.getReflectionResult(sessionId)
      setReflectionResult(reflection)

      // Try to load evaluation result
      try {
        const evaluation = await biodesignService.getEvaluationResult(sessionId)
        setEvaluationResult(evaluation)
        setActiveTab('evaluation')
      } catch (error) {
        console.log('No evaluation result found, which is expected for a new session')
      }
    } catch (error) {
      console.error('Failed to load existing results:', error)
      toast({
        title: 'Error',
        description: 'Failed to load session data. Please ensure the session exists.',
        variant: 'destructive'
      })
    }
  }

  const handleStartEvaluation = async () => {
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'No session ID available. Please complete the IDENTIFY phase first.',
        variant: 'destructive'
      })
      return
    }

    setIsEvaluating(true)
    setProgress(0)

    try {
      // Start evaluation process
      toast({
        title: 'Evaluation Started',
        description: 'Analyzing and evaluating identified needs...',
      })

      // Poll for evaluation completion
      const maxAttempts = 30 // 2.5 minutes with 5-second intervals
      let attempts = 0

      const poll = async () => {
        try {
          const result = await biodesignService.getEvaluationResult(sessionId)
          
          if (result.status === 'completed') {
            setEvaluationResult(result)
            setActiveTab('evaluation')
            setIsEvaluating(false)
            setProgress(100)
            toast({
              title: 'Evaluation Complete',
              description: 'Need evaluation and prioritization finished successfully.'
            })
            return
          }

          attempts++
          setProgress((attempts / maxAttempts) * 100)

          if (attempts < maxAttempts) {
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else {
            setIsEvaluating(false)
            toast({
              title: 'Timeout',
              description: 'Evaluation is taking longer than expected. Please check back later.',
              variant: 'destructive'
            })
          }
        } catch (error) {
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000)
          } else {
            setIsEvaluating(false)
            console.error('Evaluation polling error:', error)
          }
        }
      }

      // Start polling after a short delay
      setTimeout(poll, 2000)

    } catch (error) {
      console.error('Failed to start evaluation:', error)
      setIsEvaluating(false)
      toast({
        title: 'Error',
        description: 'Failed to start evaluation process. Please try again.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVENT Phase</h1>
            <p className="text-gray-600">Generate and evaluate innovative solutions</p>
          </div>
        </div>
        
        {sessionId && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Session: {sessionId}
            </Badge>
            {reflectionResult && (
              <Badge variant="secondary" className="text-sm">
                Needs Identified: {reflectionResult.status === 'completed' ? '✓' : '⧗'}
              </Badge>
            )}
            {evaluationResult && (
              <Badge variant="default" className="text-sm">
                Evaluation: {evaluationResult.status}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Prerequisites Check */}
      {!reflectionResult && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Complete IDENTIFY Phase First</h3>
                <p className="text-yellow-800 mb-4">
                  To proceed with solution generation and evaluation, you need to complete the needs 
                  identification process first. This provides the foundation for generating targeted solutions.
                </p>
                <Button 
                  onClick={() => window.location.href = `/session/${sessionId}/identify`}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Go to IDENTIFY Phase
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress indicator for active evaluation */}
      {isEvaluating && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Evaluating identified needs...</span>
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
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generation
          </TabsTrigger>
          <TabsTrigger value="concepts" className="flex items-center gap-2">
            <Cog className="w-4 h-4" />
            Concepts
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-2" disabled={!evaluationResult && !isEvaluating}>
            <Brain className="w-4 h-4" />
            Evaluation
          </TabsTrigger>
          <TabsTrigger value="solutions" className="flex items-center gap-2" disabled={!evaluationResult}>
            <Users className="w-4 h-4" />
            Solutions
          </TabsTrigger>
        </TabsList>

        {/* Solution Generation Tab */}
        <TabsContent value="generation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Solution Generation</CardTitle>
              <CardDescription>
                Generate innovative solutions based on identified medical needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SolutionGenerationForm
                reflectionResult={reflectionResult}
                onEvaluationStart={handleStartEvaluation}
                isEvaluating={isEvaluating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Concept Invention Tab */}
        <TabsContent value="concepts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Concept Invention Tools</CardTitle>
              <CardDescription>
                Interactive tools for developing and refining solution concepts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConceptInventionTools
                sessionId={sessionId}
                reflectionResult={reflectionResult}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          {evaluationResult ? (
            <EvaluationDisplay result={evaluationResult} />
          ) : isEvaluating ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluating Solutions</h3>
                <p className="text-gray-500 mb-6">
                  Our AI agents are analyzing and evaluating the identified needs...
                </p>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Evaluation Yet</h3>
                <p className="text-gray-500 mb-6">
                  Start the evaluation process to analyze and prioritize identified needs.
                </p>
                <Button 
                  onClick={handleStartEvaluation}
                  disabled={!reflectionResult || isEvaluating}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Start Evaluation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Solutions Tab */}
        <TabsContent value="solutions" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Solution Development</h3>
              <p className="text-gray-500 mb-6">
                Advanced solution development tools will be available after evaluation completion.
              </p>
              {!evaluationResult && (
                <Button variant="outline" disabled>
                  Complete Evaluation First
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InventPage
