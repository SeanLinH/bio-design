import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Bot, Brain, Activity } from 'lucide-react'
import { biodesignService } from '@/services/biodesignService'

interface Agent {
  id: string
  name: string
  type: 'medical_expert' | 'engineer' | 'business_analyst' | 'researcher'
  status: 'active' | 'idle' | 'busy'
  specialty: string
  description: string
  experience_level: 'junior' | 'senior' | 'expert'
  current_task?: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent_001',
      name: 'Dr. Sarah Chen',
      type: 'medical_expert',
      status: 'active',
      specialty: 'Cardiology & Medical Devices',
      description: 'Expert in cardiovascular medicine with 15+ years of clinical experience',
      experience_level: 'expert',
      current_task: 'Analyzing cardiac device requirements'
    },
    {
      id: 'agent_002',
      name: 'Alex Rodriguez',
      type: 'engineer',
      status: 'idle',
      specialty: 'Biomedical Engineering',
      description: 'Specializes in medical device design and prototyping',
      experience_level: 'senior'
    },
    {
      id: 'agent_003',
      name: 'Maria Johnson',
      type: 'business_analyst',
      status: 'busy',
      specialty: 'Healthcare Market Analysis',
      description: 'Expert in healthcare economics and market validation',
      experience_level: 'senior',
      current_task: 'Conducting market feasibility study'
    },
    {
      id: 'agent_004',
      name: 'Dr. James Liu',
      type: 'researcher',
      status: 'active',
      specialty: 'Clinical Research & Validation',
      description: 'Focuses on clinical trials and regulatory compliance',
      experience_level: 'expert',
      current_task: 'Reviewing FDA guidelines'
    }
  ])

  // 從後端獲取真正的代理數據
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const backendAgents = await biodesignService.getAgents()
        
        // 將後端代理數據轉換為前端格式
        const formattedAgents: Agent[] = backendAgents.map((agent: any, index: number) => ({
          id: agent.id,
          name: agent.name,
          type: agent.id.includes('medical') ? 'medical_expert' : 
                agent.id.includes('tech') ? 'engineer' :
                agent.id.includes('business') ? 'business_analyst' : 'researcher',
          status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'idle' : 'busy',
          specialty: agent.description,
          description: agent.capabilities.join(', '),
          experience_level: 'expert' as const,
          current_task: index % 2 === 0 ? `分析 ${agent.name} 相關任務` : undefined
        }))
        
        setAgents(formattedAgents)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
        // 保持默認的演示數據
      }
    }
    
    fetchAgents()
  }, [])

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'medical_expert': return Brain
      case 'engineer': return Bot
      case 'business_analyst': return Activity
      case 'researcher': return Users
      default: return Bot
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'idle': return 'bg-gray-100 text-gray-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800'
      case 'senior': return 'bg-blue-100 text-blue-800'
      case 'junior': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-gray-600">Manage your team of specialized AI agents</p>
        </div>
        <Button className="btn-primary">
          <Bot size={20} className="mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Agent Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {agents.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bot size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Busy Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {agents.filter(a => a.status === 'busy').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users size={24} className="text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Idle Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {agents.filter(a => a.status === 'idle').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const AgentIcon = getAgentIcon(agent.type)
          return (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <AgentIcon size={24} className="text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.specialty}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                    <Badge className={getExperienceColor(agent.experience_level)}>
                      {agent.experience_level}
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {agent.description}
                </p>

                {agent.current_task && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-blue-700 mb-1">Current Task</p>
                    <p className="text-sm text-blue-600">{agent.current_task}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="btn-primary flex-1">
                    View Details
                  </Button>
                  <Button className="btn-secondary">
                    Configure
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
