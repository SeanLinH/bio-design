import { Phase, PhaseStatus } from '@/types'
import { cn, formatPhaseName } from '@/utils'

interface PhaseIndicatorProps {
  phase: Phase
  status: PhaseStatus
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  progress?: number
  compact?: boolean
  className?: string
}

export default function PhaseIndicator({
  phase,
  status,
  size = 'md',
  showProgress = false,
  progress = 0,
  compact = false,
  className
}: PhaseIndicatorProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const statusClasses = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    requires_revision: 'bg-red-100 text-red-700'
  }

  const phaseClasses = {
    identify: 'phase-identify',
    invent: 'phase-invent', 
    implement: 'phase-implement'
  }

  return (
    <div className={cn('inline-flex items-center rounded-full font-medium', className)}>
      <span
        className={cn(
          'rounded-full',
          sizeClasses[size],
          phaseClasses[phase],
          statusClasses[status]
        )}
      >
        {compact ? phase.charAt(0).toUpperCase() : formatPhaseName(phase)}
      </span>
      
      {showProgress && status === 'in_progress' && (
        <div className="ml-2 flex items-center space-x-1">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
      )}
    </div>
  )
}
