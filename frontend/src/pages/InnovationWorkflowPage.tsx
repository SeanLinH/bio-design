import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DocumentUploadZone from '@/components/common/DocumentUploadZone'
import innovationService from '@/services/innovationService'
import type { Phase } from '@/types'
import toast from 'react-hot-toast'
import { 
  Upload, 
  FileText, 
  Users, 
  Target, 
  CheckCircle,
  ArrowRight,
  Download,
  Play,
  Brain,
  Globe,
  Database,
  TrendingUp,
  DollarSign,
  BarChart3
} from 'lucide-react'

interface WorkflowPhase {
  id: 'identify' | 'invent' | 'implement'
  name: string
  description: string
  status: 'not-started' | 'in-progress' | 'completed'
  progress: number
  tasks: PhaseTask[]
  outputs: string[]
}

interface PhaseTask {
  id: string
  name: string
  description: string
  status: 'not-started' | 'in-progress' | 'completed'
  agentsInvolved: string[]
}

interface Document {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'image' | 'data'
  size: string
  uploadedAt: string
  phase: string
}

export default function InnovationWorkflowPage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [currentPhase, setCurrentPhase] = useState<'identify' | 'invent' | 'implement'>('identify')
  const [requirement, setRequirement] = useState<string>('')
  const [identifiedNeeds, setIdentifiedNeeds] = useState<string[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([])
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  // Backend-returned artifacts can be displayed later if needed
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isStarting, setIsStarting] = useState(false)
  const pollTimer = useRef<number | null>(null)
  const [phases, setPhases] = useState<WorkflowPhase[]>([
    {
      id: 'identify',
      name: 'IDENTIFY',
      description: '識別醫療需求和機會',
      status: 'not-started',
      progress: 0,
      tasks: [
        {
          id: 'need-analysis',
          name: '需求分析',
          description: '透過文獻研究和實地觀察識別未滿足的醫療需求',
          status: 'not-started',
          agentsInvolved: ['Research Analyst', 'Clinical Expert']
        },
        {
          id: 'stakeholder-mapping',
          name: '利益相關者映射',
          description: '識別和分析所有相關的利益相關者',
          status: 'not-started',
          agentsInvolved: ['Business Strategist', 'User Experience Expert']
        },
        {
          id: 'market-research',
          name: '市場研究',
          description: '分析現有解決方案和市場機會',
          status: 'not-started',
          agentsInvolved: ['Business Strategist', 'Research Analyst']
        }
      ],
      outputs: []
    },
    {
      id: 'invent',
      name: 'INVENT',
      description: '發明和設計解決方案',
      status: 'not-started',
      progress: 0,
      tasks: [
        {
          id: 'ideation',
          name: '創意發想',
          description: '產生多種創新解決方案概念',
          status: 'not-started',
          agentsInvolved: ['Design Thinker', 'Technology Specialist']
        },
        {
          id: 'concept-development',
          name: '概念開發',
          description: '詳細開發最有前景的解決方案概念',
          status: 'not-started',
          agentsInvolved: ['Technology Specialist', 'Clinical Expert', 'Design Thinker']
        },
        {
          id: 'prototyping',
          name: '原型設計',
          description: '創建功能原型進行初步測試',
          status: 'not-started',
          agentsInvolved: ['Technology Specialist', 'Design Thinker']
        }
      ],
      outputs: []
    },
    {
      id: 'implement',
      name: 'IMPLEMENT',
      description: '實施和商業化',
      status: 'not-started',
      progress: 0,
      tasks: [
        {
          id: 'business-model',
          name: '商業模式設計',
          description: '開發可持續的商業模式和收入策略',
          status: 'not-started',
          agentsInvolved: ['Business Strategist', 'Regulatory Expert']
        },
        {
          id: 'regulatory-strategy',
          name: '監管策略',
          description: '制定產品上市的監管路徑',
          status: 'not-started',
          agentsInvolved: ['Regulatory Expert', 'Clinical Expert']
        },
        {
          id: 'market-strategy',
          name: '市場策略',
          description: '制定產品推廣和銷售策略',
          status: 'not-started',
          agentsInvolved: ['Business Strategist', 'User Experience Expert']
        }
      ],
      outputs: []
    }
  ])

  useEffect(() => {
    // 從sessionStorage獲取來自問答系統的需求
    const savedRequirement = sessionStorage.getItem('identifiedRequirement')
    const savedNeeds = sessionStorage.getItem('identifiedNeeds')
    const savedSessionId = sessionStorage.getItem('innovation_session_id')
    
    if (savedRequirement) {
      setRequirement(savedRequirement)
    }
    if (savedNeeds) {
      setIdentifiedNeeds(JSON.parse(savedNeeds))
    }
    // 確保存在後端 Session
    const ensureSession = async () => {
      try {
        if (savedSessionId) {
          // Validate saved session exists; if not, create a new one
          try {
            const existing = await innovationService.getSession(savedSessionId)
            const id = (existing as any)?.id || (existing as any)?.session_id || savedSessionId
            setSessionId(id)
            return
          } catch (err) {
            console.warn('Saved session invalid, creating a new one')
            sessionStorage.removeItem('innovation_session_id')
          }
        }
        const title = `Bio-Design Innovation Session - ${new Date().toLocaleString()}`
        const resp: any = await innovationService.createSession({ title })
        const id: string = resp?.id || resp?.session_id
        if (id) {
          setSessionId(id)
          sessionStorage.setItem('innovation_session_id', id)
          toast.success('已建立新的創新工作流程 Session')
        }
      } catch (e) {
        console.error('Failed to create session', e)
        toast.error('建立 Session 失敗，請檢查後端是否啟動')
      }
    }
    void ensureSession()
    return () => {
      if (pollTimer.current) {
        window.clearInterval(pollTimer.current)
        pollTimer.current = null
      }
    }
  }, [])

  const onFilesSelected = (files: File[]) => {
    // 用於顯示在區塊中的檔案列表（本地）
    setUploadFiles(files)
  }

  const uploadSelectedFiles = async () => {
    if (!sessionId || uploadFiles.length === 0) return
    try {
      setIsUploading(true)
      setUploadProgress(0)
      const res: any = await innovationService.uploadDocuments(
        sessionId,
        currentPhase as Phase,
        uploadFiles,
        (p) => setUploadProgress(p)
      )
      // 更新顯示的檔案（以後端為準）
      const mappedDocs: Document[] = (res.documents || []).map((d: any) => ({
        id: d.document_id || Math.random().toString(),
        name: d.filename,
        type: 'doc',
        size: ((d.file_size_bytes || 0) / 1024 / 1024).toFixed(2) + 'MB',
        uploadedAt: new Date().toLocaleString(),
        phase: currentPhase,
      }))
      setUploadedDocs((prev) => [...prev, ...mappedDocs])
    } catch (e) {
      console.error('Upload failed', e)
      alert('上傳失敗，請稍後再試')
    } finally {
      setIsUploading(false)
    }
  }

  const startPhase = async (phaseId: 'identify' | 'invent' | 'implement') => {
    if (!sessionId) {
      toast.error('尚未建立後端 Session，請稍後再試')
      return
    }
    setCurrentPhase(phaseId)
    setIsStarting(true)
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { ...phase, status: 'in-progress', progress: 0 }
        : phase
    ))

    try {
      const context: any = {
        requirement,
        identified_needs: identifiedNeeds,
      }
      await innovationService.startPhase(sessionId, phaseId as Phase, context)
      // 開始輪詢進度
      startPollingProgress(phaseId)
    } catch (e: any) {
      console.error('Failed to start phase', e)
      const msg = e?.message || '啟動階段失敗'
      toast.error(msg)
      // 還原狀態
      setPhases(prev => prev.map(phase => 
        phase.id === phaseId 
          ? { ...phase, status: 'not-started', progress: 0 }
          : phase
      ))
    } finally {
      setIsStarting(false)
    }
  }

  const startPollingProgress = (phaseId: Phase) => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current)
      pollTimer.current = null
    }
    pollTimer.current = window.setInterval(async () => {
      try {
        if (!sessionId) return
        const progress: any = await innovationService.getPhaseProgress(sessionId, phaseId)
        const pct: number = progress?.progress_percentage ?? progress?.progress ?? 0
        setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, progress: Math.round(pct) } : p))

        const status: string = progress?.status || ''
        if (status === 'completed' || pct >= 100) {
          window.clearInterval(pollTimer.current!)
          pollTimer.current = null
          await fetchPhaseResults(phaseId)
        }
      } catch (e) {
        console.error('Progress polling failed', e)
      }
    }, 3000)
  }

  const fetchPhaseResults = async (phaseId: Phase) => {
    try {
      const results: any[] = await innovationService.getPhaseResults(sessionId, phaseId)
      const outputs: string[] = results.map((r: any) => r.title || r.solution_title || r.implementation_title || r.id || JSON.stringify(r).slice(0, 60))
      setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, status: 'completed', progress: 100, outputs } : p))
      toast.success(`${phaseId.toUpperCase()} 階段已完成`)
    } catch (e) {
      console.error('Failed to fetch phase results', e)
      setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, status: 'completed', progress: 100 } : p))
      toast('已完成，但無法取得輸出結果', { icon: 'ℹ️' })
    }
  }

  // outputs 由後端結果填充

  const getCurrentPhaseData = () => {
    return phases.find(p => p.id === currentPhase)
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'identify': return 'bg-blue-100 text-blue-800'
      case 'invent': return 'bg-green-100 text-green-800'
      case 'implement': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleNextStep = async () => {
    if (!sessionId) return
    if (currentPhase === 'identify') {
      try {
        await innovationService.transitionPhase(sessionId, 'invent', true)
        setCurrentPhase('invent')
        await startPhase('invent')
      } catch (e) {
        console.error('Transition to INVENT failed', e)
        toast.error('無法轉換到 INVENT 階段')
      }
    } else if (currentPhase === 'invent') {
      try {
        await innovationService.transitionPhase(sessionId, 'implement', true)
        setCurrentPhase('implement')
        await startPhase('implement')
      } catch (e) {
        console.error('Transition to IMPLEMENT failed', e)
        toast.error('無法轉換到 IMPLEMENT 階段')
      }
    } else if (currentPhase === 'implement') {
      window.location.href = '/business-strategy'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bio-Design 三階段創新工作流程
        </h1>
        <p className="text-gray-600">
          Stanford Biodesign 方法論：IDENTIFY → INVENT → IMPLEMENT
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">Session: {sessionId ? sessionId : '尚未建立'}</Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                const title = `Bio-Design Innovation Session - ${new Date().toLocaleString()}`
                const resp: any = await innovationService.createSession({ title })
                const id: string = resp?.id || resp?.session_id
                if (id) {
                  setSessionId(id)
                  sessionStorage.setItem('innovation_session_id', id)
                  toast.success('已建立新的 Session')
                }
              } catch (err) {
                toast.error('建立 Session 失敗')
              }
            }}
          >
            建立新 Session
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem('innovation_session_id')
              toast('已清除本地儲存的 Session', { icon: '🧹' })
              setSessionId('')
            }}
          >
            清除快取
          </Button>
        </div>
      </div>

      {/* Requirement Context */}
      {requirement && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Target size={20} className="mr-2" />
            識別的需求
          </h3>
          <p className="text-blue-800 mb-4">{requirement}</p>
          {identifiedNeeds.length > 0 && (
            <div>
              <p className="text-sm font-medium text-blue-900 mb-2">關鍵需求點：</p>
              <div className="flex flex-wrap gap-2">
                {identifiedNeeds.map((need, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Phase Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {phases.map((phase, index) => (
          <Card 
            key={phase.id} 
            className={`p-6 cursor-pointer transition-all ${
              currentPhase === phase.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
            }`}
            onClick={() => setCurrentPhase(phase.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  phase.status === 'completed' ? 'bg-green-500' :
                  phase.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                  <Badge className={getPhaseColor(phase.id)}>{phase.status}</Badge>
                </div>
              </div>
              {phase.status === 'completed' && (
                <CheckCircle size={24} className="text-green-500" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{phase.description}</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>進度</span>
                <span>{phase.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
            </div>

            {/* Task Count */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>任務數量</span>
              <span>{phase.tasks.filter(t => t.status === 'completed').length}/{phase.tasks.length}</span>
            </div>

            {/* Start Button */}
            {phase.status === 'not-started' && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  startPhase(phase.id)
                }}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                disabled={isStarting || !sessionId}
              >
                <Play size={16} className="mr-2" />
                開始 {phase.name}
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Detailed Phase View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Phase Details */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {getCurrentPhaseData()?.name} 階段詳情
              </h3>
              <Badge className={getPhaseColor(currentPhase)}>
                {getCurrentPhaseData()?.status}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-3">執行任務</h4>
              {getCurrentPhaseData()?.tasks.map((task) => (
                <div key={task.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {task.status === 'completed' ? (
                      <CheckCircle size={16} className="text-white" />
                    ) : task.status === 'in-progress' ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{task.name}</h5>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {task.agentsInvolved.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phase Outputs */}
            {getCurrentPhaseData()?.outputs.length ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">階段輸出</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getCurrentPhaseData()?.outputs.map((output, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                      <FileText size={16} className="text-green-600 mr-2" />
                      <span className="text-sm text-green-800">{output}</span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        <Download size={12} className="mr-1" />
                        下載
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>

          {/* Document Upload (Connected to Backend) */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Upload size={20} className="mr-2" />
              文檔上傳 - {getCurrentPhaseData()?.name} 階段
            </h3>
            <DocumentUploadZone
              onFilesUploaded={onFilesSelected}
              uploadedFiles={uploadFiles}
              maxFiles={10}
            />
            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={uploadSelectedFiles}
                disabled={!sessionId || uploadFiles.length === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <span>上傳中... {uploadProgress}%</span>
                ) : (
                  <span>上傳到後端</span>
                )}
              </Button>
              <span className="text-sm text-gray-500">
                Session: {sessionId ? sessionId.slice(0, 8) + '...' : '尚未建立'}
              </span>
            </div>

            {/* Uploaded Files from Server */}
            {(uploadedDocs.filter(doc => doc.phase === currentPhase).length > 0) && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-3">已上傳文檔</h4>
                <div className="space-y-2">
                  {uploadedDocs
                    .filter(doc => doc.phase === currentPhase)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText size={16} className="text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.size} • {doc.uploadedAt}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{doc.phase}</Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Agents Status */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Brain size={20} className="mr-2" />
              AI 智能體狀態
            </h3>
            <div className="space-y-3">
              {[
                'Clinical Expert',
                'Technology Specialist',
                'Business Strategist',
                'Research Analyst',
                'Design Thinker',
                'Regulatory Expert',
                'User Experience Expert'
              ].map((agent) => (
                <div key={agent} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{agent}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Web Search Results */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Globe size={20} className="mr-2" />
              智能體網路搜索
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">最新醫療技術趨勢</p>
                <p className="text-xs text-blue-600">Research Analyst 搜索中...</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">監管政策更新</p>
                <p className="text-xs text-green-600">Regulatory Expert 已完成</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-900">市場競爭分析</p>
                <p className="text-xs text-orange-600">Business Strategist 進行中</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Database size={16} className="mr-2" />
                查看數據分析
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp size={16} className="mr-2" />
                生成趨勢報告
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign size={16} className="mr-2" />
                商業模式分析
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 size={16} className="mr-2" />
                市場預測
              </Button>
            </div>
          </Card>

          {/* Next Steps */}
          {getCurrentPhaseData()?.status === 'completed' && (
            <Card className="p-6 border-green-200 bg-green-50">
              <h3 className="font-semibold text-green-900 mb-4">下一步</h3>
              <Button 
                onClick={handleNextStep}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {currentPhase === 'identify' && '進入 INVENT 階段'}
                {currentPhase === 'invent' && '進入 IMPLEMENT 階段'}
                {currentPhase === 'implement' && '生成商業策略'}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
