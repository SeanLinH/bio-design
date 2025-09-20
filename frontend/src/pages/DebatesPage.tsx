import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Users, Clock, CheckCircle } from 'lucide-react'

interface Debate {
  id: string
  topic: string
  phase: 'identify' | 'invent' | 'implement'
  status: 'active' | 'completed' | 'paused'
  participants: string[]
  rounds_completed: number
  max_rounds: number
  started_at: string
  completed_at?: string
  consensus_level?: number
}

export default function DebatesPage() {
  const [debates] = useState<Debate[]>([
    {
      id: 'debate_001',
      topic: 'Remote patient monitoring for cardiac arrhythmias',
      phase: 'identify',
      status: 'active',
      participants: ['Dr. Sarah Chen', 'Alex Rodriguez', 'Maria Johnson'],
      rounds_completed: 2,
      max_rounds: 5,
      started_at: '2025-09-12T15:30:00Z',
      consensus_level: 0.65
    },
    {
      id: 'debate_002',
      topic: 'Wearable glucose monitoring device design',
      phase: 'invent',
      status: 'completed',
      participants: ['Dr. James Liu', 'Alex Rodriguez', 'Dr. Sarah Chen'],
      rounds_completed: 4,
      max_rounds: 4,
      started_at: '2025-09-12T10:00:00Z',
      completed_at: '2025-09-12T14:30:00Z',
      consensus_level: 0.89
    },
    {
      id: 'debate_003',
      topic: 'Market strategy for AI-powered diagnostic tool',
      phase: 'implement',
      status: 'paused',
      participants: ['Maria Johnson', 'Dr. James Liu'],
      rounds_completed: 1,
      max_rounds: 3,
      started_at: '2025-09-12T12:00:00Z',
      consensus_level: 0.42
    }
  ])

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'identify': return 'bg-identify-100 text-identify-800'
      case 'invent': return 'bg-invent-100 text-invent-800'
      case 'implement': return 'bg-implement-100 text-implement-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConsensusLevel = (level?: number) => {
    if (!level) return 'Unknown'
    const percentage = Math.round(level * 100)
    return `${percentage}%`
  }

  const getConsensusColor = (level?: number) => {
    if (!level) return 'bg-gray-100 text-gray-800'
    if (level >= 0.8) return 'bg-green-100 text-green-800'
    if (level >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Agent Debates</h1>
          <p className="text-gray-600">Monitor ongoing and completed agent debates</p>
        </div>
        <Button className="btn-primary">
          <MessageSquare size={20} className="mr-2" />
          Start New Debate
        </Button>
      </div>

      {/* Debate Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Debates</p>
              <p className="text-2xl font-bold text-gray-900">
                {debates.filter(d => d.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {debates.filter(d => d.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paused</p>
              <p className="text-2xl font-bold text-gray-900">
                {debates.filter(d => d.status === 'paused').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Debates</p>
              <p className="text-2xl font-bold text-gray-900">{debates.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Debates List */}
      <div className="space-y-4">
        {debates.map((debate) => (
          <Card key={debate.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{debate.topic}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MessageSquare size={16} className="mr-1" />
                      {debate.rounds_completed}/{debate.max_rounds} rounds
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      {debate.participants.length} participants
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {new Date(debate.started_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    <Badge className={getPhaseColor(debate.phase)}>
                      {debate.phase}
                    </Badge>
                    <Badge className={getStatusColor(debate.status)}>
                      {debate.status}
                    </Badge>
                  </div>
                  <Badge className={getConsensusColor(debate.consensus_level)}>
                    Consensus: {getConsensusLevel(debate.consensus_level)}
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{debate.rounds_completed}/{debate.max_rounds}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      debate.status === 'completed' ? 'bg-green-500' :
                      debate.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${(debate.rounds_completed / debate.max_rounds) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Participants:</p>
                <div className="flex flex-wrap gap-2">
                  {debate.participants.map((participant, index) => (
                    <Badge key={index} className="bg-gray-100 text-gray-700">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>

              {debate.completed_at && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Completed: {new Date(debate.completed_at).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="btn-primary">
                  View Debate
                </Button>
                {debate.status === 'active' && (
                  <Button className="btn-secondary">
                    Join Discussion
                  </Button>
                )}
                {debate.status === 'paused' && (
                  <Button className="btn-secondary">
                    Resume
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
