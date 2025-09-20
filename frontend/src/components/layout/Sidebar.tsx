import { Link } from 'react-router-dom'
import { 
  Home, 
  Search, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  TestTube,
  MessageCircle
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useCurrentSession } from '@/hooks/useApp'
import { cn } from '@/utils'

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, currentPhase } = useAppStore()
  const currentSession = useCurrentSession()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Question', href: '/question', icon: MessageCircle },
    { name: 'Innovation Flow', href: '/innovation-workflow', icon: Search },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Test Backend', href: '/test', icon: TestTube },
    { name: 'Connection Test', href: '/connection-test', icon: Settings },
    { name: 'Sessions', href: '/sessions', icon: FileText },
    { name: 'Agents', href: '/agents', icon: Users },
    { name: 'Debates', href: '/debates', icon: MessageSquare },
  ]

  const phaseNavigation = currentSession ? [
    { 
      name: 'Identify', 
      href: `/session/${currentSession.session_id}/identify`, 
      phase: 'identify' as const,
      active: currentPhase === 'identify'
    },
    { 
      name: 'Invent', 
      href: `/session/${currentSession.session_id}/invent`, 
      phase: 'invent' as const,
      active: currentPhase === 'invent'
    },
    { 
      name: 'Implement', 
      href: `/session/${currentSession.session_id}/implement`, 
      phase: 'implement' as const,
      active: currentPhase === 'implement'
    },
  ] : []

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-sticky lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-16 left-0 z-sticky h-[calc(100vh-4rem)] bg-white border-r border-gray-200",
          "transition-all duration-300 ease-in-out",
          sidebarOpen 
            ? "w-64 translate-x-0" 
            : "w-16 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Navigation</h2>
                <button
                  onClick={toggleSidebar}
                  className="btn-ghost p-1 hidden lg:block"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={toggleSidebar}
                className="btn-ghost p-1 w-full flex justify-center"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    !sidebarOpen && "justify-center"
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>

            {/* Phase navigation */}
            {currentSession && phaseNavigation.length > 0 && (
              <div className="px-4 pb-4">
                {sidebarOpen && (
                  <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Session
                  </h3>
                )}
                <nav className="space-y-1">
                  {phaseNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        item.active 
                          ? `phase-${item.phase} text-white`
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        !sidebarOpen && "justify-center"
                      )}
                      title={!sidebarOpen ? item.name : undefined}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.phase === 'identify' ? "bg-identify-500" :
                        item.phase === 'invent' ? "bg-invent-500" :
                        "bg-implement-500"
                      )} />
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/settings"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                !sidebarOpen && "justify-center"
              )}
              title={!sidebarOpen ? 'Settings' : undefined}
            >
              <Settings size={20} />
              {sidebarOpen && <span>Settings</span>}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
