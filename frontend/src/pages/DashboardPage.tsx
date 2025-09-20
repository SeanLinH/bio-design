import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Clock, 
  Users, 
  BookOpen, 
  Target,
  Award,
  BarChart3,
  FileText,
  Lightbulb
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  organization: string
  role: string
}

interface ProjectSummary {
  id: string
  title: string
  phase: 'identify' | 'invent' | 'implement'
  status: 'active' | 'completed' | 'paused'
  progress: number
  lastActivity: string
  needsCount?: number
  solutionsCount?: number
  businessModels?: number
}

interface DashboardStats {
  totalProjects: number
  completedProjects: number
  activeDebates: number
  generatedReports: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    completedProjects: 0,
    activeDebates: 0,
    generatedReports: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 從localStorage獲取用戶信息
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // 模擬獲取用戶項目數據
    const mockProjects: ProjectSummary[] = [
      {
        id: '1',
        title: 'AI-Powered Diabetes Detection Device',
        phase: 'implement',
        status: 'active',
        progress: 75,
        lastActivity: '2 hours ago',
        needsCount: 12,
        solutionsCount: 8,
        businessModels: 3
      },
      {
        id: '2',
        title: 'Remote Patient Monitoring System',
        phase: 'invent',
        status: 'active',
        progress: 45,
        lastActivity: '1 day ago',
        needsCount: 8,
        solutionsCount: 5
      },
      {
        id: '3',
        title: 'Cardiac Rehabilitation App',
        phase: 'identify',
        status: 'paused',
        progress: 30,
        lastActivity: '3 days ago',
        needsCount: 6
      },
      {
        id: '4',
        title: 'Mental Health Assessment Tool',
        phase: 'implement',
        status: 'completed',
        progress: 100,
        lastActivity: '1 week ago',
        needsCount: 10,
        solutionsCount: 6,
        businessModels: 2
      }
    ]

    setProjects(mockProjects)
    setStats({
      totalProjects: mockProjects.length,
      completedProjects: mockProjects.filter(p => p.status === 'completed').length,
      activeDebates: 3,
      generatedReports: 7
    })
    setLoading(false)
  }, [])

  const createNewProject = async () => {
    // 重定向到項目創建頁面
    window.location.href = '/project/new'
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'identify': return 'bg-blue-100 text-blue-800'
      case 'invent': return 'bg-green-100 text-green-800'
      case 'implement': return 'bg-orange-100 text-orange-800'
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            歡迎回來，{user?.firstName || 'User'}！
          </h1>
          <p className="text-gray-600 mt-1">
            繼續您的創新之旅 • {user?.organization}
          </p>
        </div>
        <Button onClick={createNewProject} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          新建項目
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">總項目數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">活躍辯論</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDebates}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText size={24} className="text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">生成報告</p>
              <p className="text-2xl font-bold text-gray-900">{stats.generatedReports}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">我的項目</h2>
            <Button variant="outline" onClick={() => window.location.href = '/sessions'}>
              查看全部
            </Button>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/session/${project.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPhaseColor(project.phase)}>
                        Phase: {project.phase.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-1" />
                      Last activity: {project.lastActivity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Project Metrics */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {project.needsCount && (
                    <div className="flex items-center">
                      <Target size={14} className="mr-1" />
                      {project.needsCount} needs
                    </div>
                  )}
                  {project.solutionsCount && (
                    <div className="flex items-center">
                      <Lightbulb size={14} className="mr-1" />
                      {project.solutionsCount} solutions
                    </div>
                  )}
                  {project.businessModels && (
                    <div className="flex items-center">
                      <BarChart3 size={14} className="mr-1" />
                      {project.businessModels} business models
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start"
                      onClick={() => window.location.href = '/question'}>
                <Plus size={16} className="mr-2" />
                開始AI問答
              </Button>
              <Button variant="outline" className="w-full justify-start"
                      onClick={() => window.location.href = '/innovation-workflow'}>
                <Target size={16} className="mr-2" />
                創新工作流程
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users size={16} className="mr-2" />
                查看智能體狀態
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen size={16} className="mr-2" />
                瀏覽知識庫
              </Button>
              <Button variant="outline" className="w-full justify-start"
                      onClick={() => window.location.href = '/business-strategy'}>
                <BarChart3 size={16} className="mr-2" />
                商業策略分析
              </Button>
              <Button variant="outline" className="w-full justify-start"
                      onClick={() => window.location.href = '/reports'}>
                <FileText size={16} className="mr-2" />
                查看報告
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">最近活動</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-gray-900">AI辯論完成</p>
                  <p className="text-gray-600">糖尿病檢測設備項目</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-gray-900">文檔上傳成功</p>
                  <p className="text-gray-600">遠程監控系統</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-gray-900">報告生成完成</p>
                  <p className="text-gray-600">心理健康評估工具</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Insights */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">表現洞察</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">項目成功率</span>
                <span className="text-sm font-medium text-green-600">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均完成時間</span>
                <span className="text-sm font-medium text-blue-600">21 天</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">智能體協作度</span>
                <span className="text-sm font-medium text-purple-600">92%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
