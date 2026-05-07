'use client'

import { useState } from 'react'
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
  Copy,
  Check,
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

const subjects = [
  { id: 'russian', name: 'Русский язык', icon: Pen, color: 'text-blue-500' },
  { id: 'literature', name: 'Литература', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'history', name: 'История', icon: History, color: 'text-amber-500' },
  { id: 'social', name: 'Обществознание', icon: Users, color: 'text-violet-500' },
]

const taskTypes = [
  { id: 'essay', name: 'Сочинение', description: 'Творческая работа на заданную тему' },
  { id: 'summary', name: 'Изложение', description: 'Пересказ прочитанного текста' },
  { id: 'answer', name: 'Ответ на вопрос', description: 'Развернутый ответ' },
  { id: 'analysis', name: 'Анализ текста', description: 'Разбор литературного произведения' },
]

export function HomeworkChecker() {
  const [subject, setSubject] = useState('russian')
  const [taskType, setTaskType] = useState('essay')
  const [topic, setTopic] = useState('')
  const [studentWork, setStudentWork] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentWork.trim() || isLoading) return

    setIsLoading(true)
    setResult('')
    setError(null)

    const selectedSubject = subjects.find(s => s.id === subject)?.name || 'Русский язык'
    const selectedTaskType = taskTypes.find(t => t.id === taskType)?.name || 'Сочинение'

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          taskType: selectedTaskType,
          topic,
          content: studentWork,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка сервера')
      }

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
              if (parsed.text) {
                fullText += parsed.text
                setResult(fullText)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStudentWork('')
    setTopic('')
    setResult('')
    setError(null)
  }

  const handleCopyResult = async () => {
    if (!result) return
    
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

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
            Заполните информацию о задании и вставьте текст работы
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
              <div className="grid grid-cols-2 gap-2">
                {subjects.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSubject(s.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${
                        subject === s.id
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-card/80 text-foreground'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${subject === s.id ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${subject === s.id ? 'text-primary' : s.color}`} />
                      </div>
                      <span>{s.name}</span>
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
                placeholder="Например: Весна в моём городе"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Student work textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                Текст работы ученика
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={studentWork}
                  onChange={(e) => setStudentWork(e.target.value)}
                  placeholder="Вставьте или введите текст работы ученика для проверки...

Пример:
Весна пришла в наш город незаметно. Сначала стал таять снег, потом на деревьях появились первые почки..."
                  rows={10}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
                />
              </div>
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

            {/* Submit buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!studentWork.trim() || isLoading}
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
              {(result || error) && (
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Результат анализа
              </CardTitle>
              <CardDescription>
                AI-оценка работы с рекомендациями
              </CardDescription>
            </div>
            {result && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyResult}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Копировать
                  </>
                )}
              </Button>
            )}
          </div>
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

          {!result && !isLoading && !error && (
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
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Грамматика и орфография</p>
                    <p className="text-xs text-muted-foreground">Проверка ошибок в тексте</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Стиль и логика</p>
                    <p className="text-xs text-muted-foreground">Анализ изложения мыслей</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Рекомендации</p>
                    <p className="text-xs text-muted-foreground">Советы по улучшению работы</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && !result && (
            <div className="flex flex-col items-center justify-center h-[450px] text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-6">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
                Анализирую работу...
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                AI проверяет грамматику, стилистику и соответствие теме. Это займёт несколько секунд.
              </p>
              <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Обработка текста...</span>
              </div>
            </div>
          )}

          {result && !error && (
            <div className="space-y-4">
              {/* Analysis result */}
              <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="rounded-xl bg-muted/30 p-5 border border-border prose prose-sm prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {result}
                    {isLoading && <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 rounded-sm" />}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
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
