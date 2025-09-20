import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Brain, MessageSquare, CheckCircle, Clock } from 'lucide-react'
import { biodesignService } from '@/services/biodesignService'

interface RealtimeProgressProps {
  sessionId: string
}

interface ProgressMessage {
  type: 'progress' | 'status' | 'agent_message' | 'completion' | 'error'
  progress?: number
  message?: string
  agent?: string
  content?: string
  timestamp?: string
}

const RealtimeProgress: React.FC<RealtimeProgressProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<ProgressMessage[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  useEffect(() => {
    if (!sessionId) return

    // Create SSE connection
    const source = biodesignService.createReflectionStream(sessionId)
    setEventSource(source)

    source.onopen = () => {
      setMessages(prev => [...prev, {
        type: 'status',
        message: 'Connected to real-time stream',
        timestamp: new Date().toISOString()
      }])
    }

    source.onmessage = (event) => {
      try {
        const data: ProgressMessage = JSON.parse(event.data)
        data.timestamp = new Date().toISOString()
        
        setMessages(prev => [...prev, data])

        switch (data.type) {
          case 'progress':
            if (data.progress !== undefined) {
              setCurrentProgress(data.progress)
            }
            break
          case 'status':
            if (data.message?.includes('agent:')) {
              const agentName = data.message.split('agent:')[1]?.trim()
              setCurrentAgent(agentName)
            }
            break
          case 'completion':
            setIsCompleted(true)
            setCurrentProgress(100)
            setCurrentAgent(null)
            break
          case 'error':
            console.error('Stream error:', data.message)
            break
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    source.onerror = (error) => {
      console.error('SSE error:', error)
      setMessages(prev => [...prev, {
        type: 'error',
        message: 'Connection error occurred',
        timestamp: new Date().toISOString()
      }])
    }

    // Cleanup on unmount
    return () => {
      source.close()
    }
  }, [sessionId])

  const getAgentIcon = (agent: string) => {
    const agentLower = agent.toLowerCase()
    if (agentLower.includes('medical')) return '🩺'
    if (agentLower.includes('engineer')) return '⚙️'
    if (agentLower.includes('collector')) return '📋'
    return '🤖'
  }

  const getAgentColor = (agent: string) => {
    const agentLower = agent.toLowerCase()
    if (agentLower.includes('medical')) return 'text-red-600 bg-red-50 border-red-200'
    if (agentLower.includes('engineer')) return 'text-green-600 bg-green-50 border-green-200'
    if (agentLower.includes('collector')) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-purple-600 bg-purple-50 border-purple-200'
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              )}
              <span>Analysis Progress</span>
            </CardTitle>
            <Badge variant={isCompleted ? 'default' : 'secondary'}>
              {isCompleted ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-500">{Math.round(currentProgress)}%</span>
          </div>
          <Progress value={currentProgress} className="w-full" />
          
          {currentAgent && !isCompleted && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {getAgentIcon(currentAgent)} {currentAgent} is thinking...
                </p>
                <p className="text-xs text-blue-600">
                  Processing and analyzing your scenario
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span>Live Updates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for updates...</p>
              </div>
            ) : (
              messages.slice(-20).map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    message.type === 'error'
                      ? 'bg-red-50 border-red-200'
                      : message.type === 'completion'
                      ? 'bg-green-50 border-green-200'
                      : message.agent
                      ? getAgentColor(message.agent)
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {message.agent && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {getAgentIcon(message.agent)} {message.agent}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Agent Message
                          </Badge>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-800">
                        {message.content || message.message || 'Update received'}
                      </p>
                      
                      {message.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs text-gray-600">{message.progress}%</span>
                          </div>
                          <Progress value={message.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    {message.timestamp && (
                      <span className="text-xs text-gray-400 ml-3">
                        {formatTime(message.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <div className="text-center">
        <Badge 
          variant={eventSource?.readyState === EventSource.OPEN ? 'default' : 'secondary'}
          className="text-xs"
        >
          {eventSource?.readyState === EventSource.OPEN 
            ? '🟢 Connected' 
            : '🔴 Disconnected'
          }
        </Badge>
      </div>
    </div>
  )
}

export default RealtimeProgress
