import OpenAI from 'openai'
import type {
  HomeworkSubmission,
  AnalysisResult,
  Subject,
  ScoreScale,
  AnalysisError,
  MathCorrection,
} from '@/lib/types'

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'http://localhost:3000',
    'X-Title': process.env.OPENROUTER_APP_NAME || 'EduAssistant',
  },
})

// const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free'
const MODEL = 'openai/gpt-4o-mini'


// Subject-specific system prompts
const SUBJECT_PROMPTS: Record<Subject, string> = {
  russian: `Ты — опытный учитель русского языка. Проверь работу ученика на:
- Орфографические ошибки
- Пунктуационные ошибки
- Грамматические ошибки
- Стилистические недочёты
- Правильность построения предложений`,

  literature: `Ты — опытный учитель литературы. Оцени работу ученика на:
- Понимание произведения
- Качество анализа
- Аргументация
- Использование цитат
- Логичность изложения
- Грамотность`,

  history: `Ты — опытный учитель истории. Проверь работу ученика на:
- Фактическую точность
- Понимание исторического контекста
- Причинно-следственные связи
- Качество аргументации
- Использование источников`,

  social: `Ты — опытный учитель обществознания. Оцени работу ученика на:
- Понимание понятий и терминов
- Качество анализа
- Аргументация позиции
- Примеры из жизни
- Логичность выводов`,

  math: `Ты — опытный учитель математики. Проверь работу ученика на:
- Правильность вычислений
- Правильность метода решения
- Логику рассуждений
- Оформление решения
- Полноту ответа
Для каждой ошибки покажи правильное решение пошагово.`,

  algebra: `Ты — опытный учитель алгебры. Проверь работу ученика на:
- Правильность алгебраических преобразований
- Правильность решения уравнений и неравенств
- Логику рассуждений
- Оформление решения
Для каждой ошибки покажи правильное решение пошагово.`,

  geometry: `Ты — опытный учитель геометрии. Проверь работу ученика на:
- Правильность доказательств
- Правильность вычислений
- Использование теорем и аксиом
- Логику рассуждений
- Оформление решения
Для каждой ошибки покажи правильное решение.`,

  physics: `Ты — опытный учитель физики. Проверь работу ученика на:
- Правильность физических формул
- Правильность вычислений
- Понимание физических законов
- Правильность единиц измерения
- Оформление решения`,

  chemistry: `Ты — опытный учитель химии. Проверь работу ученика на:
- Правильность химических уравнений
- Правильность вычислений
- Понимание химических процессов
- Правильность формул веществ
- Оформление решения`,

  biology: `Ты — опытный учитель биологии. Проверь работу ученика на:
- Фактическую точность
- Понимание биологических процессов
- Правильность терминологии
- Логичность изложения`,

  other: `Ты — опытный учитель. Проверь работу ученика на:
- Правильность ответа
- Полноту раскрытия темы
- Логичность изложения
- Грамотность`,
}

const BASE_SYSTEM_PROMPT = `
Ты — AI-помощник для учителей, который проверяет домашние задания учеников.

ВАЖНО:
- Отвечай ТОЛЬКО на русском языке
- Будь доброжелателен, но объективен
- Давай конкретные советы по улучшению
- Оценивай по 5-балльной шкале

Верни ответ СТРОГО в JSON без markdown, без пояснений и без лишнего текста.

Формат ответа:
{
  "overallScore": число от 1 до 5,
  "summary": "краткое общее впечатление о работе",
  "scores": {
    "grammar": число от 1 до 5,
    "content": число от 1 до 5,
    "structure": число от 1 до 5,
    "argumentation": число от 1 до 5,
    "calculation": число от 1 до 5,
    "methodology": число от 1 до 5
  },
  "errors": [
    {
      "type": "тип ошибки",
      "severity": "minor|moderate|major",
      "text": "текст с ошибкой",
      "description": "описание ошибки",
      "suggestion": "как исправить"
    }
  ],
  "mathCorrections": [
    {
      "step": номер шага,
      "original": "что написал ученик",
      "correct": "как правильно",
      "explanation": "объяснение",
      "errorType": "calculation|method|notation|logic"
    }
  ],
  "strengths": ["сильные стороны работы"],
  "improvements": ["что нужно улучшить"],
  "recommendations": ["рекомендации для ученика"],
  "detailedFeedback": "развёрнутый комментарий для учителя"
}
`

function buildPrompt(submission: HomeworkSubmission, text: string): string {
  const subjectPrompt = SUBJECT_PROMPTS[submission.subject]

  let prompt = `${subjectPrompt}\n\n`

  if (submission.topic) {
    prompt += `Тема: ${submission.topic}\n`
  }

  if (submission.gradeLevel) {
    prompt += `Класс: ${submission.gradeLevel}\n`
  }

  if (submission.additionalContext) {
    prompt += `Дополнительный контекст: ${submission.additionalContext}\n`
  }

  prompt += `\nРабота ученика:\n${text}\n\nПроверь эту работу и дай подробный анализ в JSON.`
  return prompt
}

function parseAnalysisResponse(content: string): AnalysisResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const result: AnalysisResult = {
      overallScore: normalizeScore(parsed.overallScore),
      summary: parsed.summary || 'Анализ завершён',
      scores: {
        grammar: parsed.scores?.grammar !== undefined ? normalizeScore(parsed.scores.grammar) : undefined,
        content: parsed.scores?.content !== undefined ? normalizeScore(parsed.scores.content) : undefined,
        structure: parsed.scores?.structure !== undefined ? normalizeScore(parsed.scores.structure) : undefined,
        argumentation: parsed.scores?.argumentation !== undefined ? normalizeScore(parsed.scores.argumentation) : undefined,
        calculation: parsed.scores?.calculation !== undefined ? normalizeScore(parsed.scores.calculation) : undefined,
        methodology: parsed.scores?.methodology !== undefined ? normalizeScore(parsed.scores.methodology) : undefined,
        creativity: parsed.scores?.creativity !== undefined ? normalizeScore(parsed.scores.creativity) : undefined,
      },
      errors: normalizeErrors(parsed.errors || []),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      detailedFeedback: parsed.detailedFeedback || '',
      mathCorrections: normalizeMathCorrections(parsed.mathCorrections || []),
    }

    return result
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return {
      overallScore: 3,
      summary: 'Не удалось полностью проанализировать работу',
      scores: {},
      errors: [],
      strengths: [],
      improvements: ['Попробуйте отправить работу ещё раз'],
      recommendations: [],
      detailedFeedback: content,
    }
  }
}

function normalizeScore(score: unknown): ScoreScale {
  const num = Number(score)
  if (Number.isNaN(num) || num < 1) return 1
  if (num > 5) return 5
  return Math.round(num) as ScoreScale
}

function normalizeErrors(errors: unknown[]): AnalysisError[] {
  if (!Array.isArray(errors)) return []

  return errors.map((e, i) => {
    const item = e as Record<string, unknown>
    const text = typeof item.text === 'string' ? item.text : ''
    return {
      id: `error-${i}`,
      type: (item.type as string) || 'other',
      severity: (item.severity as 'minor' | 'moderate' | 'major') || 'moderate',
      location: text ? { start: 0, end: 0, text } : undefined,
      description: (item.description as string) || '',
      suggestion: (item.suggestion as string) || '',
      explanation: item.explanation as string | undefined,
    }
  })
}

function normalizeMathCorrections(corrections: unknown[]): MathCorrection[] {
  if (!Array.isArray(corrections)) return []

  return corrections.map((c, i) => {
    const item = c as Record<string, unknown>
    return {
      step: typeof item.step === 'number' ? item.step : i + 1,
      original: (item.original as string) || '',
      correct: (item.correct as string) || '',
      explanation: (item.explanation as string) || '',
      errorType: (item.errorType as 'calculation' | 'method' | 'notation' | 'logic') || 'calculation',
    }
  })
}

export async function analyzeHomework(
  submission: HomeworkSubmission,
  text: string
): Promise<AnalysisResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const userPrompt = buildPrompt(submission, text)

  const response = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: BASE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from AI')
  }

  return parseAnalysisResponse(content)
}

export async function* analyzeHomeworkStream(
  submission: HomeworkSubmission,
  text: string
): AsyncGenerator<{ type: 'progress' | 'result'; data: string | AnalysisResult }> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const userPrompt = buildPrompt(submission, text)

  const stream = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: BASE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    stream: true,
  })

  let fullContent = ''

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    fullContent += content
    if (content) {
      yield { type: 'progress', data: content }
    }
  }

  yield { type: 'result', data: parseAnalysisResponse(fullContent) }
}