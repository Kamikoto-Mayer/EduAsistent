'use client'

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Lightbulb,
  TrendingUp,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MathCorrectionsList } from '@/components/math-display'
import type { AnalysisResult, ScoreScale } from '@/lib/types'

interface ReportViewProps {
  analysis: AnalysisResult
  subject?: string
  className?: string
}

const SCORE_COLORS: Record<ScoreScale, string> = {
  1: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950',
  2: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950',
  3: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950',
  4: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950',
  5: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950',
}

const SCORE_DESCRIPTIONS: Record<ScoreScale, string> = {
  1: 'Неудовлетворительно',
  2: 'Плохо',
  3: 'Удовлетворительно',
  4: 'Хорошо',
  5: 'Отлично',
}

const SEVERITY_COLORS = {
  minor: 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950',
  moderate: 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950',
  major: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
}

const SEVERITY_LABELS = {
  minor: 'Незначительная',
  moderate: 'Умеренная',
  major: 'Серьёзная',
}

const SCORE_LABELS: Record<string, string> = {
  grammar: 'Грамотность',
  content: 'Содержание',
  structure: 'Структура',
  argumentation: 'Аргументация',
  calculation: 'Вычисления',
  methodology: 'Методология',
  creativity: 'Креативность',
}

export function ReportView({ analysis, subject, className }: ReportViewProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    errors: true,
    strengths: true,
    improvements: true,
    recommendations: true,
    detailed: false,
  })
  const [copied, setCopied] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const copyToClipboard = async () => {
    const text = formatReportText(analysis)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scores = Object.entries(analysis.scores).filter(([_, v]) => v !== undefined)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Score */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center justify-center w-16 h-16 rounded-xl text-2xl font-bold',
            SCORE_COLORS[analysis.overallScore]
          )}>
            {analysis.overallScore}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Общая оценка</h2>
            <p className="text-muted-foreground">
              {SCORE_DESCRIPTIONS[analysis.overallScore]}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Копировать отчёт
            </>
          )}
        </Button>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-foreground">{analysis.summary}</p>
      </div>

      {/* Category Scores */}
      {scores.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scores.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <span className="text-sm font-medium">{SCORE_LABELS[key] || key}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= (value as number)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Errors Section */}
      {analysis.errors.length > 0 && (
        <CollapsibleSection
          title={`Ошибки (${analysis.errors.length})`}
          icon={<XCircle className="h-5 w-5 text-destructive" />}
          expanded={expandedSections.errors}
          onToggle={() => toggleSection('errors')}
        >
          <div className="space-y-3">
            {analysis.errors.map((error, index) => (
              <div
                key={error.id || index}
                className={cn(
                  'p-4 rounded-lg border',
                  SEVERITY_COLORS[error.severity]
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-background">
                    {SEVERITY_LABELS[error.severity]}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {error.type}
                  </span>
                </div>
                
                {error.location?.text && (
                  <div className="mb-2 p-2 rounded bg-background font-mono text-sm">
                    &ldquo;{error.location.text}&rdquo;
                  </div>
                )}
                
                <p className="text-sm mb-2">{error.description}</p>
                
                <div className="flex items-start gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{error.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Math Corrections */}
      {analysis.mathCorrections && analysis.mathCorrections.length > 0 && (
        <MathCorrectionsList corrections={analysis.mathCorrections} />
      )}

      {/* Strengths Section */}
      {analysis.strengths.length > 0 && (
        <CollapsibleSection
          title={`Сильные стороны (${analysis.strengths.length})`}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          expanded={expandedSections.strengths}
          onToggle={() => toggleSection('strengths')}
        >
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Improvements Section */}
      {analysis.improvements.length > 0 && (
        <CollapsibleSection
          title={`Что улучшить (${analysis.improvements.length})`}
          icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
          expanded={expandedSections.improvements}
          onToggle={() => toggleSection('improvements')}
        >
          <ul className="space-y-2">
            {analysis.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <span className="text-sm">{improvement}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Recommendations Section */}
      {analysis.recommendations.length > 0 && (
        <CollapsibleSection
          title={`Рекомендации (${analysis.recommendations.length})`}
          icon={<Lightbulb className="h-5 w-5 text-primary" />}
          expanded={expandedSections.recommendations}
          onToggle={() => toggleSection('recommendations')}
        >
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Detailed Feedback */}
      {analysis.detailedFeedback && (
        <CollapsibleSection
          title="Подробный комментарий"
          icon={<Star className="h-5 w-5 text-muted-foreground" />}
          expanded={expandedSections.detailed}
          onToggle={() => toggleSection('detailed')}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{analysis.detailedFeedback}</p>
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({ 
  title, 
  icon, 
  expanded, 
  onToggle, 
  children 
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="p-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}

function formatReportText(analysis: AnalysisResult): string {
  let text = `ОТЧЁТ О ПРОВЕРКЕ\n\n`
  text += `Общая оценка: ${analysis.overallScore}/5 (${SCORE_DESCRIPTIONS[analysis.overallScore]})\n\n`
  text += `${analysis.summary}\n\n`

  if (analysis.errors.length > 0) {
    text += `ОШИБКИ:\n`
    analysis.errors.forEach((e, i) => {
      text += `${i + 1}. [${SEVERITY_LABELS[e.severity]}] ${e.description}\n`
      if (e.suggestion) text += `   Рекомендация: ${e.suggestion}\n`
    })
    text += '\n'
  }

  if (analysis.strengths.length > 0) {
    text += `СИЛЬНЫЕ СТОРОНЫ:\n`
    analysis.strengths.forEach(s => text += `• ${s}\n`)
    text += '\n'
  }

  if (analysis.improvements.length > 0) {
    text += `ЧТО УЛУЧШИТЬ:\n`
    analysis.improvements.forEach(i => text += `• ${i}\n`)
    text += '\n'
  }

  if (analysis.recommendations.length > 0) {
    text += `РЕКОМЕНДАЦИИ:\n`
    analysis.recommendations.forEach(r => text += `• ${r}\n`)
  }

  return text
}
