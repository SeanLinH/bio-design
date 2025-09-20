import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNavigation from './BottomNavigation'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/utils/cn'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const sidebarOpen = useAppStore(state => state.sidebarOpen)
  const currentPhase = useAppStore(state => state.phase_theme)

  return (
    <div 
      className={cn(
        "min-h-screen bg-gray-50 transition-colors duration-300",
        `phase-${currentPhase}`
      )}
      data-phase={currentPhase}
    >
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            "min-h-[calc(100vh-4rem)]", // Account for header height
            sidebarOpen 
              ? "lg:ml-64" // When sidebar is open on large screens
              : "lg:ml-16", // When sidebar is collapsed on large screens
            "pb-16 md:pb-0" // Account for bottom navigation on mobile
          )}
        >
          {/* Content wrapper with proper padding and constraints */}
          <div className="container-app py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNavigation />
    </div>
  )
}
