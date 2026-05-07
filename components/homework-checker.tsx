'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Sparkles, 
  Loader2, 
  BookOpen, 
  CheckCircle,
  Lightbulb,
  RotateCcw,
  Pen,
  History,
  Users,
  Info,
  FileText,
  AlertTriangle,
  RefreshCw,
  Calculator,
  Ruler,
  Atom,
  FlaskConical,
  Leaf,
  Upload,
  Keyboard
} from 'lucide-react'
import { FileUpload } from '@/components/file-upload'
import { ReportView } from '@/components/report-view'
import { ProcessingStatus, SimpleLoading } from '@/components/processing-status'
import type { UploadedFile, AnalysisResult, CheckingProgress, Subject, TaskType } from '@/lib/types'

const subjects = [
  { id: 'russian' as Subject, name: 'Русский язык', icon: Pen, color: 'text-blue-500' },
  { id: 'literature' as Subject, name: 'Литература', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'history' as Subject, name: 'История', icon: History, color: 'text-amber-500' },
  { id: 'social' as Subject, name: 'Обществознание', icon: Users, color: 'text-violet-500' },
  { id: 'math' as Subject, name: 'Математика', icon: Calculator, color: 'text-pink-500' },
  { id: 'algebra' as Subject, name: 'Алгебра', icon: Calculator, color: 'text-rose-500' },
  { id: 'geometry' as Subject, name: 'Геометрия', icon: Ruler, color: 'text-cyan-500' },
  { id: 'physics' as Subject, name: 'Физика', icon: Atom, color: 'text-orange-500' },
  { id: 'chemistry' as Subject, name: 'Химия', icon: FlaskConical, color: 'text-green-500' },
  { id: 'biology' as Subject, name: 'Биология', icon: Leaf, color: 'text-lime-500' },
]

const taskTypes = [
  { id: 'homework' as TaskType, name: 'Домашняя работа', description: 'Стандартное домашнее задание' },
  { id: 'essay' as TaskType, name: 'Сочинение', description: 'Творческая работа на заданную тему' },
  { id: 'test' as TaskType, name: 'Контрольная', description: 'Контрольная или самостоятельная работа' },
  { id: 'exercise' as TaskType, name: 'Упражнение', description: 'Отдельное упражнение или задача' },
]

type InputMode = 'text' | 'file'

export function HomeworkChecker() {
  const [subject, setSubject] = useState<Subject>('russian')
  const [taskType, setTaskType] = useState<TaskType>('homework')
  const [topic, setTopic] = useState('')
  const [studentWork, setStudentWork] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [extractedText, setExtractedText] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<CheckingProgress | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [legacyResult, setLegacyResult] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFilesProcessed = useCallback((files: UploadedFile[], text: string) => {
    setUploadedFiles(files)
    setExtractedText(text)
  }, [])

  const getTextContent = () => {
    if (inputMode === 'file') {
      return extractedText
    }
    return studentWork
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = getTextContent()
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setAnalysisResult(null)
    setLegacyResult('')
    setError(null)
    setProgress({
      stage: 'analyzing',
      progress: 30,
      message: 'Анализируем работу...',
    })

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          taskType,
          topic,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка сервера')
      }

      setProgress({
        stage: 'generating',
        progress: 60,
        message: 'Формируем отчёт...',
      })

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Ошибка чтения ответа')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              
              // Check if this is a structured analysis result
              if (parsed.type === 'analysis' && parsed.data) {
                setAnalysisResult(parsed.data)
              } else if (parsed.text) {
                // Legacy demo mode - streaming text
                fullText += parsed.text
                setLegacyResult(fullText)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'Готово!',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      setProgress(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStudentWork('')
    setTopic('')
    setAnalysisResult(null)
    setLegacyResult('')
    setError(null)
    setProgress(null)
    setUploadedFiles([])
    setExtractedText('')
  }

  const content = getTextContent()
  const hasContent = content.trim().length > 0

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input section */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Данные для проверки
          </CardTitle>
          <CardDescription>
            Загрузите фото работы или введите текст вручную
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                Предмет
                <span className="text-xs text-muted-foreground font-normal">(выберите один)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjects.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSubject(s.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all ${
                        subject === s.id
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-card/80 text-foreground'
                      }`}
                    >
                      <div className={`p-1 rounded-lg ${subject === s.id ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Icon className={`h-3.5 w-3.5 ${subject === s.id ? 'text-primary' : s.color}`} />
                      </div>
                      <span className="truncate text-xs">{s.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Task type selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Тип задания
              </label>
              <div className="grid grid-cols-2 gap-2">
                {taskTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTaskType(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      taskType === t.id
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                    }`}
                  >
                    <span className={`text-sm font-medium ${taskType === t.id ? 'text-primary' : 'text-foreground'}`}>
                      {t.name}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                Тема задания
                <span className="text-xs text-muted-foreground font-normal">(опционально)</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Например: Квадратные уравнения"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Input mode toggle */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Способ ввода
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    inputMode === 'text'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:border-primary/50 text-foreground'
                  }`}
                >
                  <Keyboard className="h-4 w-4" />
                  <span className="text-sm font-medium">Ввести текст</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    inputMode === 'file'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:border-primary/50 text-foreground'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Загрузить фото</span>
                </button>
              </div>
            </div>

            {/* Text input or File upload */}
            {inputMode === 'text' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Текст работы ученика
                  <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={studentWork}
                  onChange={(e) => setStudentWork(e.target.value)}
                  placeholder="Вставьте или введите текст работы ученика для проверки..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {studentWork.length} символов
                  </p>
                  {studentWork.length > 0 && studentWork.length < 50 && (
                    <p className="text-xs text-amber-500 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Рекомендуется минимум 50 символов
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Загрузить работу
                  <span className="text-destructive">*</span>
                </label>
                <FileUpload 
                  onFilesProcessed={handleFilesProcessed}
                  disabled={isLoading}
                />
                {extractedText && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Распознанный текст</span>
                      <span className="text-xs text-muted-foreground">{extractedText.length} символов</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{extractedText}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!hasContent || isLoading}
                size="lg"
                className="flex-1 gap-2 rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Анализирую...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Проверить работу
                  </>
                )}
              </Button>
              {(analysisResult || legacyResult || error) && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="gap-2 rounded-xl"
                >
                  <RotateCcw className="h-4 w-4" />
                  Сбросить
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results section */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Результат анализа
          </CardTitle>
          <CardDescription>
            AI-оценка работы с рекомендациями
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center h-[450px] text-center px-4">
              <div className="rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 p-6 mb-6">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Произошла ошибка
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {error}
              </p>
              <Button
                onClick={handleReset}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Попробовать снова
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!analysisResult && !legacyResult && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center h-[450px] text-center px-4">
              <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 mb-6">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Готов к проверке
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Заполните форму слева и нажмите «Проверить работу», чтобы получить детальный AI-анализ
              </p>
              <div className="grid gap-3 text-left w-full max-w-xs">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Проверка ошибок</p>
                    <p className="text-xs text-muted-foreground">Грамматика, орфография, вычисления</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Распознавание текста</p>
                    <p className="text-xs text-muted-foreground">OCR для фото и PDF документов</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Детальный отчёт</p>
                    <p className="text-xs text-muted-foreground">Оценка, ошибки и рекомендации</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && !analysisResult && !legacyResult && (
            <div className="h-[450px] flex flex-col items-center justify-center">
              {progress ? (
                <div className="w-full max-w-sm">
                  <ProcessingStatus progress={progress} />
                </div>
              ) : (
                <SimpleLoading message="Подготовка к анализу..." />
              )}
            </div>
          )}

          {/* Structured Analysis Result */}
          {analysisResult && !error && (
            <div className="max-h-[550px] overflow-y-auto pr-2">
              <ReportView 
                analysis={analysisResult}
                subject={subjects.find(s => s.id === subject)?.name}
              />
              
              {/* Quick actions */}
              {!isLoading && (
                <div className="flex flex-wrap items-center gap-4 pt-4 mt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Анализ завершён
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Рекомендации сформированы
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legacy text result (demo mode) */}
          {legacyResult && !analysisResult && !error && (
            <div className="space-y-4">
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <div className="rounded-xl bg-muted/30 p-5 border border-border prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {legacyResult}
                    {isLoading && <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 rounded-sm" />}
                  </div>
                </div>
              </div>

              {!isLoading && (
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Анализ завершён
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Рекомендации сформированы
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
