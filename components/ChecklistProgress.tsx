'use client'

import { Check } from 'lucide-react'

interface ChecklistProgressProps {
  completed: number
  total: number
}

export default function ChecklistProgress({ completed, total }: ChecklistProgressProps) {
  // Handle case where there are no checklist items yet
  if (total === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-gray-700">
          <div className="h-full rounded-full bg-gray-600 w-0" />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">No items yet</span>
      </div>
    )
  }

  const percentage = Math.round((completed / total) * 100)
  const isComplete = completed === total

  return (
    <div className="flex items-center gap-2">
      {/* Progress bar */}
      <div className="flex-1 h-2 rounded-full bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Text label */}
      {isComplete ? (
        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium whitespace-nowrap">
          <Check className="w-3 h-3" />
          Complete!
        </span>
      ) : (
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {completed} of {total} done
        </span>
      )}
    </div>
  )
}
