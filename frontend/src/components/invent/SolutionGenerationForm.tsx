import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  Target, 
  Users, 
  Cog, 
  Play, 
  RefreshCw,
  Zap,
  CheckCircle
} from 'lucide-react'
import { ReflectionResult } from '@/services/biodesignService'

interface SolutionGenerationFormProps {
  reflectionResult: ReflectionResult | null
  onEvaluationStart: () => void
  isEvaluating: boolean
}

const SolutionGenerationForm: React.FC<SolutionGenerationFormProps> = ({
  reflectionResult,
  onEvaluationStart,
  isEvaluating
}) => {
  const [solutionFocus, setSolutionFocus] = useState('')
  const [constraints, setConstraints] = useState('')
  const [targetUsers, setTargetUsers] = useState('')
  const [generatedSolutions, setGeneratedSolutions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const solutionPrompts = [
    "Focus on digital health solutions that can be implemented with existing technology",
    "Prioritize low-cost solutions suitable for resource-limited healthcare settings",
    "Emphasize solutions that improve patient autonomy and self-management",
    "Develop solutions that enhance healthcare provider efficiency and workflow"
  ]

  const constraintExamples = [
    "Budget under $10,000 for prototype development",
    "Must work without internet connectivity",
    "Compatible with existing hospital information systems",
    "Requires FDA approval pathway consideration"
  ]

  const userGroupExamples = [
    "Elderly patients (65+) with limited technology experience",
    "Healthcare providers in busy emergency departments",
    "Patients with chronic conditions requiring daily monitoring",
    "Healthcare administrators focused on cost reduction"
  ]

  const handleGenerateSolutions = async () => {
    if (!reflectionResult) return

    setIsGenerating(true)
    
    // Simulate solution generation process
    try {
      // In a real implementation, this would call an API
      const mockSolutions = [
        "Smart medication adherence system with voice reminders and family notifications",
        "AI-powered triage assistant that pre-processes patient symptoms and prioritizes cases",
        "Wearable glucose monitoring device with predictive analytics for diabetic patients",
        "Mobile health coaching app with personalized care plans and telemedicine integration"
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      setGeneratedSolutions(mockSolutions)
    } catch (error) {
      console.error('Failed to generate solutions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Session Context */}
      {reflectionResult && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="w-5 h-5" />
              Identified Medical Needs Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded border border-blue-200">
              <p className="text-sm text-gray-700 line-clamp-3">
                {reflectionResult.final_summary}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <CheckCircle className="w-4 h-4" />
              <span>{reflectionResult.medical_insights?.length || 0} medical insights identified</span>
              <span>•</span>
              <span>{reflectionResult.engineering_insights?.length || 0} technical insights gathered</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solution Generation Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solution Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-orange-500" />
              Solution Focus
            </CardTitle>
            <CardDescription className="text-sm">
              What type of solutions should we prioritize?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Describe the focus area for solution generation..."
              value={solutionFocus}
              onChange={(e) => setSolutionFocus(e.target.value)}
              rows={4}
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Quick Options:</p>
              <div className="space-y-1">
                {solutionPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setSolutionFocus(prompt)}
                    className="w-full text-left p-2 text-xs rounded border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    disabled={isGenerating}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Constraints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cog className="w-4 h-4 text-blue-500" />
              Constraints
            </CardTitle>
            <CardDescription className="text-sm">
              What limitations or requirements must be considered?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="List any budget, technical, or regulatory constraints..."
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={4}
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Examples:</p>
              <div className="space-y-1">
                {constraintExamples.map((example, index) => (
                  <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              Target Users
            </CardTitle>
            <CardDescription className="text-sm">
              Who are the primary users of these solutions?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Describe the target user groups..."
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
              rows={4}
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">User Groups:</p>
              <div className="space-y-1">
                {userGroupExamples.map((group, index) => (
                  <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    {group}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Solution Generation</h3>
              <p className="text-sm text-gray-600">
                Generate innovative solutions based on identified needs and your specifications
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateSolutions}
                disabled={isGenerating || !reflectionResult}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Solutions
                  </>
                )}
              </Button>
              
              {generatedSolutions.length > 0 && (
                <Button
                  onClick={onEvaluationStart}
                  disabled={isEvaluating}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Evaluation
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Solutions */}
      {generatedSolutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-600" />
              Generated Solution Concepts
            </CardTitle>
            <CardDescription>
              AI-generated solutions based on your specifications and identified needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedSolutions.map((solution, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-orange-100 text-orange-700">
                    Concept {index + 1}
                  </Badge>
                  <p className="text-gray-800 leading-relaxed flex-1">{solution}</p>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {generatedSolutions.length} solution concepts generated
              </p>
              <Button
                onClick={onEvaluationStart}
                disabled={isEvaluating}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Evaluate Solutions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Get Started Prompt */}
      {generatedSolutions.length === 0 && !isGenerating && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate Solutions?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Fill in the solution parameters above and click "Generate Solutions" to create 
              innovative concepts based on your identified medical needs.
            </p>
            <Button
              onClick={handleGenerateSolutions}
              disabled={!reflectionResult}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Solution Generation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SolutionGenerationForm
