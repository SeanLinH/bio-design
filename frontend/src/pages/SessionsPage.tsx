import { useState, useEffect } from 'react'
import { biodesignService } from '@/services/biodesignService'
import { innovationService } from '@/services/innovationService'
import { InnovationSession } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Clock } from 'lucide-react'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<InnovationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
  const data = await biodesignService.listSessions()
  setSessions(data as unknown as InnovationSession[])
    } catch (err) {
      console.error('Failed to load sessions:', err)
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const createNewSession = async () => {
    try {
      const newSession = await innovationService.createSession({
        title: `New Session ${new Date().toLocaleString()}`,
        description: 'A new biodesign innovation session'
      })
      setSessions(prev => [newSession, ...prev])
    } catch (err) {
      console.error('Failed to create session:', err)
      setError('Failed to create new session')
    }
  }

  const handleSessionClick = (sessionId: string) => {
    window.location.href = `/session/${sessionId}`
  }

  const handlePhaseClick = (sessionId: string, phase: string) => {
    window.location.href = `/session/${sessionId}/${phase}`
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Innovation Sessions</h1>
          <p className="text-gray-600">Manage your biodesign innovation sessions</p>
        </div>
        <Button onClick={createNewSession} className="btn-primary">
          <Plus size={20} className="mr-2" />
          New Session
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <Button 
            onClick={loadSessions} 
            className="btn-ghost mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sessions.length === 0 ? (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sessions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first biodesign innovation session to get started
              </p>
              <Button onClick={createNewSession} className="btn-primary">
                <Plus size={20} className="mr-2" />
                Create Session
              </Button>
            </Card>
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.session_id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {session.title}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(session.current_phase)}`}>
                      {session.current_phase}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </div>
                
                {session.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {session.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {new Date(session.updated_at).toLocaleDateString()}
                  </div>
                </div>
                
                                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleSessionClick(session.session_id)}
                    className="btn-primary flex-1"
                  >
                    Open Session
                  </Button>
                  <Button 
                    onClick={() => handlePhaseClick(session.session_id, session.current_phase)}
                    className="btn-secondary"
                  >
                    Continue {session.current_phase}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
