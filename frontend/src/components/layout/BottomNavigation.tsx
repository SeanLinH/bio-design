import { Link, useLocation } from 'react-router-dom'
import { Home, Search, FileText, Users } from 'lucide-react'
import { useCurrentSession } from '@/hooks/useApp'
import { cn } from '@/utils'

export default function BottomNavigation() {
  const location = useLocation()
  const currentSession = useCurrentSession()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Sessions', href: '/sessions', icon: FileText },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Agents', href: '/agents', icon: Users },
  ]

  // Add current session phases if available
  if (currentSession) {
    navigation.splice(1, 0, {
      name: 'Current',
      href: `/session/${currentSession.session_id}`,
      icon: FileText
    })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-fixed">
      <div className="flex">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1",
                "text-xs font-medium transition-colors",
                isActive 
                  ? "text-primary-600 bg-primary-50" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon size={20} className="mb-1" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
