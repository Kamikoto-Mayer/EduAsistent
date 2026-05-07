'use client'

import { cn } from '@/lib/utils'
import { Loader2, CheckCircle, Upload, FileSearch, Brain, FileText } from 'lucide-react'
import type { CheckingProgress } from '@/lib/types'

interface ProcessingStatusProps {
  progress: CheckingProgress
  className?: string
}

const STAGES = [
  { key: 'uploading', label: 'Загрузка файлов', icon: Upload },
  { key: 'extracting', label: 'Распознавание текста', icon: FileSearch },
  { key: 'analyzing', label: 'AI анализ', icon: Brain },
  { key: 'generating', label: 'Формирование отчёта', icon: FileText },
]

export function ProcessingStatus({ progress, className }: ProcessingStatusProps) {
  const currentIndex = STAGES.findIndex(s => s.key === progress.stage)
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{progress.message}</span>
          <span>{Math.round(progress.progress)}%</span>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon
          const isComplete = index < currentIndex || progress.stage === 'complete'
          const isCurrent = index === currentIndex && progress.stage !== 'complete'
          const isPending = index > currentIndex && progress.stage !== 'complete'
          
          return (
            <div 
              key={stage.key}
              className={cn(
                'flex flex-col items-center gap-2 flex-1',
                isPending && 'opacity-40'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                isComplete && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary/20 text-primary',
                isPending && 'bg-muted text-muted-foreground'
              )}>
                {isComplete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={cn(
                'text-xs text-center',
                isCurrent && 'font-medium text-foreground',
                !isCurrent && 'text-muted-foreground'
              )}>
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Details */}
      {progress.details && (
        <div className="text-sm text-muted-foreground text-center animate-pulse">
          {progress.details}
        </div>
      )}
    </div>
  )
}

interface SimpleLoadingProps {
  message?: string
  className?: string
}

export function SimpleLoading({ message = 'Обработка...', className }: SimpleLoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
