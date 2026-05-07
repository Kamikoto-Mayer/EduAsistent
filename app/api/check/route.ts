import { analyzeHomework } from '@/lib/services/ai-service'
import type { HomeworkSubmission, Subject, TaskType, GradeLevel } from '@/lib/types'

export const maxDuration = 60

interface CheckRequest {
  content: string
  subject: string
  taskType: string
  topic?: string
  gradeLevel?: number
  studentName?: string
  additionalContext?: string
}

// Demo response generator - used when OPENAI_API_KEY is not configured
function generateDemoResponse(subject: string, taskType: string, topic: string, content: string): string {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length
  const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0
  const charCount = content.length
  
  let score = 4
  if (wordCount > 100) score = 4
  if (wordCount > 200 && sentenceCount > 10) score = 5
  if (wordCount < 50) score = 3
  
  const scoreText = score === 5 ? '5 (Отлично)' : score === 4 ? '4 (Хорошо)' : '3 (Удовлетворительно)'
  
  return `## Результат проверки работы

### Общая информация
- **Предмет:** ${subject}
- **Тип работы:** ${taskType}
- **Тема:** ${topic || 'Не указана'}
- **Объём работы:** ${wordCount} слов, ${sentenceCount} предложений, ${charCount} символов

---

### Анализ содержания

#### Сильные стороны работы:
1. **Структурированность** — работа имеет логическое построение
2. **Раскрытие темы** — основные аспекты темы затронуты
3. **Объём** — работа соответствует требованиям

#### Области для улучшения:
1. Рекомендуется разнообразить используемую лексику
2. Обратите внимание на логические связки между абзацами
3. Добавьте больше конкретных примеров

---

### Статистика
- Средняя длина предложения: ${avgWordsPerSentence} слов
- Общее количество слов: ${wordCount}

---

### Итоговая оценка

**Оценка: ${scoreText}**

*Это демонстрационный анализ. Для полноценной AI-проверки добавьте OPENAI_API_KEY в настройках проекта.*`
}

// Stream helper for demo mode
async function streamDemoResponse(text: string): Promise<ReadableStream> {
  const encoder = new TextEncoder()
  
  return new ReadableStream({
    async start(controller) {
      const words = text.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '')
        const chunk = { text: word, type: 'text' }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
        await new Promise(resolve => setTimeout(resolve, 15))
      }
      
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })
}

// Stream helper for real AI response
async function streamAIResponse(analysis: Awaited<ReturnType<typeof analyzeHomework>>): Promise<ReadableStream> {
  const encoder = new TextEncoder()
  
  return new ReadableStream({
    async start(controller) {
      // Send the structured analysis as JSON
      const chunk = { 
        type: 'analysis',
        data: analysis 
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })
}

export async function POST(req: Request) {
  try {
    const body: CheckRequest = await req.json()
    const { content, subject, taskType, topic, gradeLevel, studentName, additionalContext } = body
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Текст работы не предоставлен' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Check if OpenAI API key is configured
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    
    if (!hasOpenAI) {
      // Demo mode - stream demo response
      const demoResponse = generateDemoResponse(
        subject || 'Русский язык',
        taskType || 'Сочинение', 
        topic || '',
        content
      )
      
      const stream = await streamDemoResponse(demoResponse)
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }
    
    // Real AI mode
    const submission: HomeworkSubmission = {
      text: content,
      subject: (subject || 'russian') as Subject,
      taskType: (taskType || 'homework') as TaskType,
      topic,
      gradeLevel: gradeLevel as GradeLevel | undefined,
      studentName,
      additionalContext,
    }
    
    try {
      const analysis = await analyzeHomework(submission, content)
      const stream = await streamAIResponse(analysis)
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (aiError) {
      console.error('OpenAI API Error:', aiError)
      
      // Fallback to demo mode on AI error
      const demoResponse = generateDemoResponse(
        subject || 'Русский язык',
        taskType || 'Сочинение', 
        topic || '',
        content
      )
      
      const stream = await streamDemoResponse(
        demoResponse + '\n\n*Ошибка AI: используется демо-режим.*'
      )
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }
  } catch (error) {
    console.error('API Error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Произошла ошибка при обработке запроса.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
