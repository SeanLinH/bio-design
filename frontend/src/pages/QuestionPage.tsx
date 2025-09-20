import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  MessageCircle, 
  User, 
  CheckCircle,
  Brain,
  Target,
  Lightbulb,
  FileText,
  Users,
  ArrowRight
} from 'lucide-react'
import { biodesignService } from '@/services/biodesignService'
import { useToast } from '@/hooks/use-toast'

interface AgentMessage {
  id: string
  agentName: string
  agentRole: string
  message: string
  timestamp: string
  type: 'question' | 'analysis' | 'response' | 'conclusion' | 'summary'
}

interface DiscussionSession {
  id: string
  userQuestion: string
  status: 'collecting' | 'discussing' | 'concluded'
  progress: number
  identifiedNeeds: string[]
  agentMessages: AgentMessage[]
  finalRequirement?: string
}

const AGENT_PROFILES = [
  { name: 'Dr. Sarah Chen', role: 'Clinical Expert', color: 'bg-blue-100 text-blue-800', icon: '👩‍⚕️' },
  { name: 'Dr. Michael Tech', role: 'Technology Specialist', color: 'bg-green-100 text-green-800', icon: '🔬' },
  { name: 'Dr. Lisa Business', role: 'Business Strategist', color: 'bg-purple-100 text-purple-800', icon: '💼' },
  { name: 'Dr. Alex Research', role: 'Research Analyst', color: 'bg-orange-100 text-orange-800', icon: '📊' },
  { name: 'Dr. Emma Design', role: 'Design Thinker', color: 'bg-pink-100 text-pink-800', icon: '🎨' },
  { name: 'Dr. Tom Regulatory', role: 'Regulatory Expert', color: 'bg-yellow-100 text-yellow-800', icon: '⚖️' },
  { name: 'Dr. Maya User', role: 'User Experience Expert', color: 'bg-indigo-100 text-indigo-800', icon: '👥' }
]

export default function QuestionPage() {
  const [question, setQuestion] = useState('')
  const [currentSession, setCurrentSession] = useState<DiscussionSession | null>(null)
  // const [sessionHistory, setSessionHistory] = useState<DiscussionSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.agentMessages])

  const handleQuestionSubmit = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    
    try {
      // 創建新的討論會話
      const newSession: DiscussionSession = {
        id: Date.now().toString(),
        userQuestion: question,
        status: 'collecting',
        progress: 0,
        identifiedNeeds: [],
        agentMessages: []
      }

      setCurrentSession(newSession)
      const userQuestion = question
      setQuestion('')

      // 調用真正的後端API啟動辯論
      const response = await biodesignService.startDebate({
        topic: userQuestion,
        max_rounds: 3
      })

      // 更新會話ID為後端返回的ID
      newSession.id = response.session_id
      setCurrentSession({ ...newSession })

      toast({
        title: '分析已開始',
        description: `會話ID: ${response.session_id}`,
      })

      // 輪詢獲取辯論結果
      await pollDebateProgress(response.session_id, newSession)
      
    } catch (error) {
      console.error('Failed to start analysis:', error)
      toast({
        title: '錯誤',
        description: '無法啟動分析，請稍後重試',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const pollDebateProgress = async (sessionId: string, session: DiscussionSession) => {
    const maxAttempts = 30 // 5分鐘，每10秒檢查一次
    let attempts = 0

    const poll = async () => {
      try {
        const result = await biodesignService.getDebateResult(sessionId)
        
        // 更新進度
        const progress = Math.min((attempts / maxAttempts) * 100, 90)
        session.progress = progress
        
        // 模擬添加代理消息
        if (attempts % 3 === 0 && session.agentMessages.length < 6) {
          const agentNames = ['醫學專家', '技術工程師', '商業分析師', '監管專家', '倫理專家', '患者代表']
          const agentName = agentNames[Math.floor(session.agentMessages.length)]
          
          session.agentMessages.push({
            id: `msg-${Date.now()}`,
            agentName,
            agentRole: '分析專家',
            message: `正在分析您的問題「${session.userQuestion}」的相關醫療需求...`,
            type: 'analysis',
            timestamp: new Date().toISOString()
          })
        }

        setCurrentSession({ ...session })

        if (result === 'completed' || (typeof result === 'object' && result.status === 'completed')) {
          // 辯論完成，添加最終結果
          session.status = 'concluded'
          session.progress = 100
          
          // 添加總結消息
          session.agentMessages.push({
            id: `summary-${Date.now()}`,
            agentName: '系統總結',
            agentRole: '分析總結',
            message: '多代理分析已完成。已識別關鍵醫療需求並進行了全面評估。',
            type: 'summary',
            timestamp: new Date().toISOString()
          })

          // 添加識別的需求
          session.identifiedNeeds = [
            '提高診斷準確性',
            '改善用戶體驗',
            '降低成本'
          ]

          setCurrentSession({ ...session })
          // setSessionHistory(prev => [...prev, session])
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // 每10秒檢查一次
        } else {
          session.status = 'concluded'
          session.progress = 100
          setCurrentSession({ ...session })
        }
      } catch (error) {
        console.error('Polling error:', error)
        setTimeout(poll, 10000)
      }
    }

    poll()
  }

  const getAgentProfile = (agentName: string) => {
    return AGENT_PROFILES.find(agent => agent.name === agentName) || AGENT_PROFILES[0]
  }

  const proceedToNextPhase = () => {
    if (currentSession?.finalRequirement) {
      // 將需求保存到session storage，然後跳轉到三階段流程
      sessionStorage.setItem('identifiedRequirement', currentSession.finalRequirement)
      sessionStorage.setItem('identifiedNeeds', JSON.stringify(currentSession.identifiedNeeds))
      sessionStorage.setItem('questionSession', JSON.stringify(currentSession))
      window.location.href = '/innovation-workflow'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI智能體協作討論
        </h1>
        <p className="text-gray-600">
          提出您的問題，讓多個專業AI智能體協作分析並識別創新需求
        </p>
      </div>

      {/* Question Input */}
      {!currentSession && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                請描述您想要解決的問題或探索的創新機會
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例如：如何為糖尿病患者提供更好的血糖監測解決方案？"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleQuestionSubmit}
                disabled={!question.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    啟動智能體討論...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    開始討論
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Agent Profiles */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Users size={20} className="mr-2" />
          參與討論的專業智能體
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENT_PROFILES.map((agent) => (
            <div key={agent.name} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-3">{agent.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{agent.name}</p>
                <Badge className={agent.color}>{agent.role}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Discussion Session */}
      {currentSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <MessageCircle size={20} className="mr-2" />
                  智能體討論過程
                </h3>
                <Badge className={
                  currentSession.status === 'concluded' ? 'bg-green-100 text-green-800' :
                  currentSession.status === 'discussing' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {currentSession.status === 'concluded' ? '討論完成' :
                   currentSession.status === 'discussing' ? '深度討論中' : '信息收集中'}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>討論進度</span>
                  <span>{currentSession.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${currentSession.progress}%` }}
                  />
                </div>
              </div>

              {/* User Question */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <User size={20} className="mr-3 mt-1 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">您的問題</p>
                    <p className="text-blue-800">{currentSession.userQuestion}</p>
                  </div>
                </div>
              </div>

              {/* Agent Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {currentSession.agentMessages.map((message) => {
                  const agentProfile = getAgentProfile(message.agentName)
                  return (
                    <div key={message.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <div className="mr-3">
                        <span className="text-xl">{agentProfile.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <p className="font-medium text-gray-900">{message.agentName}</p>
                          <Badge className={`ml-2 ${agentProfile.color}`}>
                            {message.agentRole}
                          </Badge>
                          <span className="ml-auto text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">討論狀態</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">開始時間</span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">參與智能體</span>
                  <span className="text-sm font-medium">{AGENT_PROFILES.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">討論輪次</span>
                  <span className="text-sm font-medium">{currentSession.agentMessages.length}</span>
                </div>
              </div>
            </Card>

            {/* Identified Needs */}
            {currentSession.identifiedNeeds.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Target size={20} className="mr-2" />
                  識別的關鍵需求
                </h3>
                <div className="space-y-2">
                  {currentSession.identifiedNeeds.map((need, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle size={16} className="mr-2 mt-1 text-green-500" />
                      <span className="text-sm text-gray-700">{need}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Final Requirement */}
            {currentSession.finalRequirement && (
              <Card className="p-6 border-green-200 bg-green-50">
                <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                  <Lightbulb size={20} className="mr-2" />
                  最終需求總結
                </h3>
                <p className="text-green-800 text-sm mb-4">{currentSession.finalRequirement}</p>
                <Button 
                  onClick={proceedToNextPhase}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  進入三階段創新流程
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">操作選項</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText size={16} className="mr-2" />
                  導出討論記錄
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Brain size={16} className="mr-2" />
                  查看智能體分析
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setCurrentSession(null)}
                >
                  <MessageCircle size={16} className="mr-2" />
                  開始新討論
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
