import React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Zap, Settings, Play } from 'lucide-react'

interface NeedsDiscoveryFormProps {
  query: string
  maxRounds: number
  isRealtimeMode: boolean
  onQueryChange: (query: string) => void
  onMaxRoundsChange: (rounds: number) => void
  onRealtimeModeChange: (isRealtime: boolean) => void
  onSubmit: () => void
  isSubmitting: boolean
}

const NeedsDiscoveryForm: React.FC<NeedsDiscoveryFormProps> = ({
  query,
  maxRounds,
  isRealtimeMode,
  onQueryChange,
  onMaxRoundsChange,
  onRealtimeModeChange,
  onSubmit,
  isSubmitting
}) => {
  const exampleQueries = [
    "An older patient with multiple chronic diseases faces problems with poor medication adherence, lack of real-time monitoring, and personalized support during home care and outpatient follow-ups.",
    "Healthcare workers in busy emergency departments struggle with inefficient patient triage systems that lead to delays in critical care and poor resource allocation.",
    "Patients with diabetes find it difficult to manage their blood glucose levels effectively due to painful testing procedures and lack of continuous monitoring solutions."
  ]

  const handleExampleClick = (example: string) => {
    onQueryChange(example)
  }

  return (
    <div className="space-y-6">
      {/* Query Input Section */}
      <div className="space-y-3">
        <Label htmlFor="needs-query" className="text-base font-medium">
          Medical Scenario Description
        </Label>
        <Textarea
          id="needs-query"
          placeholder="Describe a medical scenario, unmet need, or problem area you'd like to analyze..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          rows={6}
          className="min-h-[150px] text-base"
        />
        <p className="text-sm text-gray-500">
          Provide as much detail as possible about the medical scenario, including patient demographics, 
          clinical context, and specific pain points.
        </p>
      </div>

      {/* Example Queries */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Example Scenarios (click to use)
        </Label>
        <div className="space-y-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              disabled={isSubmitting}
            >
              <span className="text-blue-600 font-medium">Example {index + 1}:</span>
              <br />
              <span className="text-gray-700">{example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
        {/* Discussion Rounds */}
        <div className="space-y-2">
          <Label htmlFor="max-rounds" className="text-sm font-medium">
            Discussion Rounds
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="max-rounds"
              type="number"
              min="2"
              max="5"
              value={maxRounds}
              onChange={(e) => onMaxRoundsChange(parseInt(e.target.value) || 3)}
              className="w-20"
              disabled={isSubmitting}
            />
            <span className="text-sm text-gray-500">
              rounds (2-5 recommended)
            </span>
          </div>
          <p className="text-xs text-gray-500">
            More rounds provide deeper analysis but take longer to complete
          </p>
        </div>

        {/* Analysis Mode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Analysis Mode
          </Label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onRealtimeModeChange(false)}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                !isRealtimeMode
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Standard</span>
            </button>
            <button
              onClick={() => onRealtimeModeChange(true)}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isRealtimeMode
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Real-time</span>
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {isRealtimeMode 
              ? 'See live agent discussions and progress updates'
              : 'Get results when analysis is complete'
            }
          </p>
        </div>
      </div>

      {/* Analysis Status */}
      {isRealtimeMode && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2 text-orange-700">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Real-time Analysis Mode</span>
          </div>
          <p className="text-sm text-orange-600 mt-1">
            You'll see live updates as our AI agents discuss and analyze your scenario. 
            This provides transparency into the analysis process.
          </p>
        </div>
      )}

      {/* Agent Overview */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Multi-Agent Analysis Team</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs bg-white">🩺 Medical Expert</Badge>
          <Badge variant="outline" className="text-xs bg-white">⚙️ Systems Engineer</Badge>
          <Badge variant="outline" className="text-xs bg-white">📋 Needs Collector</Badge>
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Our specialized AI agents will analyze your scenario from multiple perspectives to identify 
          the most important medical needs and opportunities.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={!query.trim() || isSubmitting}
          size="lg"
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              {isRealtimeMode ? 'Start Real-time Analysis' : 'Start Analysis'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default NeedsDiscoveryForm
