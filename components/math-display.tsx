'use client'

import { useEffect, useRef, memo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'
import type { MathCorrection } from '@/lib/types'

interface MathDisplayProps {
  latex: string
  display?: boolean
  className?: string
  errorColor?: string
}

/**
 * Render a LaTeX math expression using KaTeX
 */
export const MathDisplay = memo(function MathDisplay({ 
  latex, 
  display = false,
  className,
  errorColor = '#cc0000'
}: MathDisplayProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (containerRef.current && latex) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode: display,
          throwOnError: false,
          errorColor,
          trust: true,
          strict: false,
        })
      } catch (error) {
        console.error('[v0] KaTeX render error:', error)
        if (containerRef.current) {
          containerRef.current.textContent = latex
        }
      }
    }
  }, [latex, display, errorColor])

  return (
    <span 
      ref={containerRef} 
      className={cn(
        'math-display',
        display && 'block text-center my-4',
        className
      )}
    />
  )
})

interface MathBlockProps {
  children: string
  className?: string
}

/**
 * Block-level math display
 */
export function MathBlock({ children, className }: MathBlockProps) {
  return (
    <div className={cn('my-4 overflow-x-auto', className)}>
      <MathDisplay latex={children} display />
    </div>
  )
}

interface MathInlineProps {
  children: string
  className?: string
}

/**
 * Inline math display
 */
export function MathInline({ children, className }: MathInlineProps) {
  return <MathDisplay latex={children} className={className} />
}

interface MathCorrectionDisplayProps {
  correction: MathCorrection
  className?: string
}

/**
 * Display a math correction with original and correct versions
 */
export function MathCorrectionDisplay({ correction, className }: MathCorrectionDisplayProps) {
  const errorTypeLabels: Record<string, string> = {
    calculation: 'Ошибка вычисления',
    method: 'Ошибка метода',
    notation: 'Ошибка записи',
    logic: 'Логическая ошибка',
  }

  return (
    <div className={cn(
      'p-4 rounded-lg border border-border bg-card',
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 text-xs font-medium rounded bg-destructive/10 text-destructive">
          Шаг {correction.step}
        </span>
        <span className="text-xs text-muted-foreground">
          {errorTypeLabels[correction.errorType] || correction.errorType}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Original (incorrect) */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-destructive">Было:</p>
          <div className="p-3 rounded bg-destructive/5 border border-destructive/20">
            {isLatex(correction.original) ? (
              <MathDisplay latex={correction.original} display />
            ) : (
              <code className="text-sm font-mono">{correction.original}</code>
            )}
          </div>
        </div>

        {/* Correct */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-green-600 dark:text-green-400">Правильно:</p>
          <div className="p-3 rounded bg-green-500/5 border border-green-500/20">
            {isLatex(correction.correct) ? (
              <MathDisplay latex={correction.correct} display />
            ) : (
              <code className="text-sm font-mono">{correction.correct}</code>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-3 p-3 rounded bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Объяснение:</span>{' '}
          {correction.explanation}
        </p>
      </div>
    </div>
  )
}

interface MathCorrectionsListProps {
  corrections: MathCorrection[]
  className?: string
}

/**
 * Display a list of math corrections
 */
export function MathCorrectionsList({ corrections, className }: MathCorrectionsListProps) {
  if (corrections.length === 0) return null

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold">Исправления в вычислениях</h3>
      <div className="space-y-3">
        {corrections.map((correction, index) => (
          <MathCorrectionDisplay key={index} correction={correction} />
        ))}
      </div>
    </div>
  )
}

/**
 * Check if a string contains LaTeX commands
 */
function isLatex(text: string): boolean {
  return /\\[a-zA-Z]+|[_^{}]/.test(text)
}

/**
 * Parse text and render math expressions within it
 * Supports $...$ for inline and $$...$$ for display math
 */
export function MathText({ children, className }: { children: string; className?: string }) {
  const parts = parseTextWithMath(children)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>
        }
        if (part.type === 'display') {
          return <MathDisplay key={index} latex={part.content} display />
        }
        return <MathDisplay key={index} latex={part.content} />
      })}
    </span>
  )
}

type MathPart = { type: 'text' | 'inline' | 'display'; content: string }

function parseTextWithMath(text: string): MathPart[] {
  const parts: MathPart[] = []
  let remaining = text
  
  // Match $$...$$ for display math and $...$ for inline math
  const regex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    
    // Add math
    if (match[1]) {
      // Display math ($$...$$)
      parts.push({ type: 'display', content: match[1] })
    } else if (match[2]) {
      // Inline math ($...$)
      parts.push({ type: 'inline', content: match[2] })
    }
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }
  
  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}
