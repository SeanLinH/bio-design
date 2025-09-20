import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  FileText, 
  Share2, 
  Download,
  Brain,
  Lightbulb,
  Cog,
  Target,
  Users,
  Plus
} from 'lucide-react'
import { ReflectionResult } from '@/services/biodesignService'

interface ConceptInventionToolsProps {
  sessionId: string | undefined
  reflectionResult: ReflectionResult | null
}

const ConceptInventionTools: React.FC<ConceptInventionToolsProps> = ({
  sessionId: _sessionId,
  reflectionResult: _reflectionResult
}) => {
  const [activeTab, setActiveTab] = useState('ideation')
  const [concepts, setConcepts] = useState<string[]>([])

  const ideationMethods = [
    {
      title: "Brainstorming Matrix",
      description: "Generate ideas by combining different problem aspects",
      icon: <Brain className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "SCAMPER Technique",
      description: "Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse",
      icon: <Lightbulb className="w-5 h-5 text-yellow-600" />,
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      title: "Design Thinking Canvas",
      description: "Structured approach to problem-solving and solution design",
      icon: <Palette className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Technical Feasibility Analysis",
      description: "Evaluate technical requirements and implementation challenges",
      icon: <Cog className="w-5 h-5 text-green-600" />,
      color: "bg-green-50 border-green-200"
    }
  ]

  const conceptFrameworks = [
    {
      title: "Problem-Solution Fit",
      questions: [
        "What specific problem does this solve?",
        "Who experiences this problem most acutely?",
        "How does our solution uniquely address this need?",
        "What alternatives currently exist?"
      ]
    },
    {
      title: "Technical Implementation",
      questions: [
        "What technologies are required?",
        "What are the key technical challenges?",
        "How complex is the implementation?",
        "What resources are needed for development?"
      ]
    },
    {
      title: "User Experience",
      questions: [
        "How will users interact with this solution?",
        "What is the user journey from problem to solution?",
        "What training or support is needed?",
        "How do we measure user satisfaction?"
      ]
    },
    {
      title: "Business Viability",
      questions: [
        "What is the potential market size?",
        "How can this be monetized sustainably?",
        "What are the key cost drivers?",
        "Who are potential competitors or partners?"
      ]
    }
  ]

  const addConcept = () => {
    const newConcept = `Concept ${concepts.length + 1}: New medical device solution`
    setConcepts([...concepts, newConcept])
  }

  return (
    <div className="space-y-6">
      {/* Tool Selection */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ideation">Ideation</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="prototyping">Prototyping</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        {/* Ideation Methods */}
        <TabsContent value="ideation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideationMethods.map((method, index) => (
              <Card key={index} className={method.color}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {method.icon}
                    {method.title}
                  </CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Start {method.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Idea Capture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Quick Idea Capture
              </CardTitle>
              <CardDescription>
                Rapidly capture and organize solution concepts as they emerge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Button onClick={addConcept} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Concept
                </Button>
                <Badge variant="secondary">{concepts.length} concepts captured</Badge>
              </div>
              
              {concepts.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {concepts.map((concept, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <p className="text-sm">{concept}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Concept Frameworks */}
        <TabsContent value="frameworks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {conceptFrameworks.map((framework, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{framework.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {framework.questions.map((question, qIndex) => (
                    <div key={qIndex} className="p-3 bg-gray-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-gray-700">{question}</p>
                      <textarea
                        className="w-full mt-2 p-2 text-sm border rounded resize-none"
                        rows={2}
                        placeholder="Your answer..."
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Prototyping Tools */}
        <TabsContent value="prototyping" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Paper Prototypes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Create low-fidelity sketches and wireframes
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Start Sketching
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cog className="w-5 h-5 text-green-600" />
                  Digital Mockups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Build interactive digital prototypes
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Create Mockup
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Physical Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Plan physical prototype development
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Plan Build
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Prototype Documentation</CardTitle>
              <CardDescription>
                Document your prototyping process and learnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Prototype Version</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded text-sm"
                    placeholder="v1.0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Development Stage</label>
                  <select className="w-full p-2 border rounded text-sm">
                    <option>Concept</option>
                    <option>Low-fidelity</option>
                    <option>High-fidelity</option>
                    <option>Working prototype</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Key Features</label>
                <textarea 
                  className="w-full p-2 border rounded text-sm"
                  rows={3}
                  placeholder="Describe the main features and functionality..."
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Test Results & Feedback</label>
                <textarea 
                  className="w-full p-2 border rounded text-sm"
                  rows={3}
                  placeholder="Document testing outcomes and user feedback..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tools */}
        <TabsContent value="validation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Testing Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Target User Group</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Healthcare professionals, patients, etc."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Testing Method</label>
                  <select className="w-full p-2 border rounded text-sm">
                    <option>User interviews</option>
                    <option>Usability testing</option>
                    <option>A/B testing</option>
                    <option>Focus groups</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Success Metrics</label>
                  <textarea 
                    className="w-full p-2 border rounded text-sm"
                    rows={3}
                    placeholder="How will you measure success?"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Technical Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Technical Requirements</label>
                  <textarea 
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                    placeholder="List key technical specifications..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Validation Tests</label>
                  <textarea 
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                    placeholder="What tests will prove technical feasibility?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Risk Assessment</label>
                  <textarea 
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                    placeholder="Identify potential technical risks..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Validation Results Summary</CardTitle>
              <CardDescription>
                Track validation outcomes and next steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-green-700">Tests Passed</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded">
                  <div className="text-2xl font-bold text-yellow-600">0</div>
                  <div className="text-sm text-yellow-700">Needs Improvement</div>
                </div>
                <div className="p-4 bg-red-50 rounded">
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <div className="text-sm text-red-700">Failed Tests</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ConceptInventionTools
