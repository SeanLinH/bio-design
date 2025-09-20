import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Search, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useCurrentSession } from '@/hooks/useApp'
import { formatPhaseName } from '@/utils'
import PhaseIndicator from '../ui/PhaseIndicator'
import NotificationDropdown from '../ui/NotificationDropdown'

interface UserData {
  firstName: string
  lastName: string
  email: string
  organization: string
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const { sidebarOpen, toggleSidebar, currentPhase } = useAppStore()
  const currentSession = useCurrentSession()

  useEffect(() => {
    // 從localStorage獲取用戶信息
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    // 點擊外部關閉用戶菜單
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [userMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    setUser(null)
    window.location.href = '/auth'
  }

  return (
    <header className="sticky top-0 z-fixed bg-white border-b border-gray-200 shadow-soft">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="btn-ghost p-2 lg:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo and app name */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white font-bold text-sm">
                BD
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  Bio-Design Platform
                </h1>
                {currentSession && (
                  <p className="text-xs text-gray-500 truncate max-w-48">
                    {currentSession.title}
                  </p>
                )}
              </div>
            </Link>

            {/* Current phase indicator */}
            {currentSession && (
              <div className="hidden md:flex items-center space-x-2">
                <PhaseIndicator 
                  phase={currentPhase} 
                  status={currentSession.phase_results[currentPhase]?.status || 'not_started'}
                  size="sm"
                />
              </div>
            )}
          </div>

          {/* Center section - Search (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search sessions, documents, agents..."
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Search (Mobile) */}
            <button className="btn-ghost p-2 lg:hidden">
              <Search size={20} />
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Phase navigation (Mobile) */}
            {currentSession && (
              <div className="md:hidden">
                <PhaseIndicator 
                  phase={currentPhase} 
                  status={currentSession.phase_results[currentPhase]?.status || 'not_started'}
                  size="sm"
                  compact
                />
              </div>
            )}

            {/* User menu */}
            <div className="relative user-menu-container">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.firstName}
                    </span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.organization}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <SettingsIcon size={16} className="mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="btn-primary text-sm px-4 py-2">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-ghost p-2 sm:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              {/* Current session info */}
              {currentSession && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Current Session
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {currentSession.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <PhaseIndicator 
                      phase={currentPhase} 
                      status={currentSession.phase_results[currentPhase]?.status || 'not_started'}
                      size="sm"
                    />
                    <span className="text-sm text-gray-500">
                      {formatPhaseName(currentPhase)} Phase
                    </span>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="pt-2 border-t border-gray-200">
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {currentSession && (
                  <>
                    <Link
                      to={`/session/${currentSession.session_id}/identify`}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Identify Phase
                    </Link>
                    <Link
                      to={`/session/${currentSession.session_id}/invent`}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Invent Phase
                    </Link>
                    <Link
                      to={`/session/${currentSession.session_id}/implement`}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Implement Phase
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
