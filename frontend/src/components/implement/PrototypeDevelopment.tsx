import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Rocket, 
  Cog, 
  TestTube, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Plus,
  Edit,
  FileText
} from 'lucide-react'
import { ReflectionResult, EvaluationResult } from '@/services/biodesignService'

interface PrototypeDevelopmentProps {
  sessionId: string | undefined
  reflectionResult: ReflectionResult | null
  evaluationResult: EvaluationResult | null
}

interface Prototype {
  id: string
  name: string
  version: string
  status: 'planning' | 'development' | 'testing' | 'completed'
  description: string
  features: string[]
  progress: number
}

const PrototypeDevelopment: React.FC<PrototypeDevelopmentProps> = ({
  reflectionResult
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [prototypes, setPrototypes] = useState<Prototype[]>([
    {
      id: '1',
      name: 'MVP - Core Functionality',
      version: 'v1.0',
      status: 'planning',
      description: 'Basic version with essential features for initial user testing',
      features: ['User authentication', 'Core medical monitoring', 'Basic reporting'],
      progress: 15
    }
  ])

  const addPrototype = () => {
    const newPrototype: Prototype = {
      id: Date.now().toString(),
      name: `Prototype ${prototypes.length + 1}`,
      version: 'v1.0',
      status: 'planning',
      description: 'New prototype concept',
      features: [],
      progress: 0
    }
    setPrototypes([...prototypes, newPrototype])
  }

  const getStatusColor = (status: Prototype['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'development': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'testing': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'completed': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: Prototype['status']) => {
    switch (status) {
      case 'planning': return <FileText className="w-4 h-4" />
      case 'development': return <Cog className="w-4 h-4" />
      case 'testing': return <TestTube className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-600" />
            Prototype Development
          </CardTitle>
          <CardDescription>
            Plan, develop, and test prototypes of your medical device solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{prototypes.length}</div>
                    <div className="text-sm text-blue-700">Total Prototypes</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {prototypes.filter(p => p.status === 'development').length}
                    </div>
                    <div className="text-sm text-orange-700">In Development</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {prototypes.filter(p => p.status === 'testing').length}
                    </div>
                    <div className="text-sm text-purple-700">In Testing</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {prototypes.filter(p => p.status === 'completed').length}
                    </div>
                    <div className="text-sm text-green-700">Completed</div>
                  </CardContent>
                </Card>
              </div>

              {/* Prototype List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Current Prototypes</h3>
                  <Button onClick={addPrototype} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prototype
                  </Button>
                </div>

                {prototypes.map((prototype) => (
                  <Card key={prototype.id} className="border-l-4 border-l-purple-400">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {getStatusIcon(prototype.status)}
                            {prototype.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {prototype.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(prototype.status)}>
                            {prototype.status}
                          </Badge>
                          <Badge variant="outline">{prototype.version}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-500">{prototype.progress}%</span>
                        </div>
                        <Progress value={prototype.progress} className="w-full" />
                      </div>

                      {prototype.features.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {prototype.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Documentation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Planning Tab */}
            <TabsContent value="planning" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Prototype Planning Framework</CardTitle>
                  <CardDescription>
                    Strategic approach to prototype development based on identified needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Requirements from Previous Phases */}
                  {reflectionResult && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Requirements from Needs Analysis</h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p><strong>Core Problem:</strong> {reflectionResult.original_query.slice(0, 200)}...</p>
                        <p><strong>Key Insights:</strong> {reflectionResult.medical_insights?.length || 0} medical insights identified</p>
                      </div>
                    </div>
                  )}

                  {/* Planning Framework */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Feature Prioritization</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span className="text-sm">Core Safety Features</span>
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-700">Critical</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                            <span className="text-sm">Primary Functionality</span>
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">High</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                            <span className="text-sm">User Interface</span>
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">Medium</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span className="text-sm">Advanced Features</span>
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Low</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Development Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">1</div>
                            <div>
                              <p className="text-sm font-medium">Concept Validation</p>
                              <p className="text-xs text-gray-500">2-4 weeks</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">2</div>
                            <div>
                              <p className="text-sm font-medium">MVP Development</p>
                              <p className="text-xs text-gray-500">8-12 weeks</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold">3</div>
                            <div>
                              <p className="text-sm font-medium">User Testing</p>
                              <p className="text-xs text-gray-500">4-6 weeks</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">4</div>
                            <div>
                              <p className="text-sm font-medium">Iteration & Refinement</p>
                              <p className="text-xs text-gray-500">6-8 weeks</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Development Tab */}
            <TabsContent value="development" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Development Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <Cog className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <h3 className="font-medium text-blue-900">Technical Stack</h3>
                          <p className="text-sm text-blue-700">Choose development tools and frameworks</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <h3 className="font-medium text-green-900">Team Resources</h3>
                          <p className="text-sm text-green-700">Assign roles and responsibilities</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <h3 className="font-medium text-orange-900">Milestones</h3>
                          <p className="text-sm text-orange-700">Track development progress</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Testing Tab */}
            <TabsContent value="testing" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Testing Strategy</CardTitle>
                  <CardDescription>
                    Comprehensive testing approach for medical device validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Card className="border-l-4 border-l-red-400">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Safety Testing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Electrical safety compliance testing</li>
                          <li>• Biocompatibility assessment</li>
                          <li>• Risk analysis and management</li>
                          <li>• Failure mode analysis</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-400">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Usability Testing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• User interface evaluation</li>
                          <li>• Healthcare workflow integration</li>
                          <li>• Training requirements assessment</li>
                          <li>• Accessibility compliance</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-400">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Performance Testing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Accuracy and precision validation</li>
                          <li>• Environmental condition testing</li>
                          <li>• Durability and reliability testing</li>
                          <li>• Interoperability verification</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default PrototypeDevelopment
