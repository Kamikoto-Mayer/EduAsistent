import type { 
  HomeworkSubmission, 
  AnalysisResult, 
  HomeworkReport,
  MathExpression,
  SUBJECT_NAMES,
  TASK_TYPE_NAMES,
  SCORE_DESCRIPTIONS
} from '@/lib/types'

/**
 * Generate a complete homework report
 */
export function generateReport(
  submission: HomeworkSubmission,
  recognizedText: string,
  recognizedMath: MathExpression[],
  analysis: AnalysisResult,
  processingTime: number
): HomeworkReport {
  return {
    id: generateReportId(),
    createdAt: new Date(),
    submission,
    recognizedText,
    recognizedMath,
    analysis,
    processingTime,
    aiModel: 'gpt-4o-mini'
  }
}

/**
 * Generate a unique report ID
 */
function generateReportId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `report-${timestamp}-${random}`
}

/**
 * Format report as plain text for copying
 */
export function formatReportAsText(report: HomeworkReport): string {
  const { submission, analysis } = report
  
  const subjectNames: Record<string, string> = {
    russian: 'Русский язык',
    literature: 'Литература',
    history: 'История',
    social: 'Обществознание',
    math: 'Математика',
    algebra: 'Алгебра',
    geometry: 'Геометрия',
    physics: 'Физика',
    chemistry: 'Химия',
    biology: 'Биология',
    other: 'Другой предмет'
  }
  
  const taskTypeNames: Record<string, string> = {
    essay: 'Сочинение',
    homework: 'Домашняя работа',
    test: 'Контрольная работа',
    exercise: 'Упражнение',
    project: 'Проект',
    lab: 'Лабораторная работа',
    other: 'Другое'
  }
  
  const scoreDescriptions: Record<number, string> = {
    1: 'Неудовлетворительно',
    2: 'Плохо',
    3: 'Удовлетворительно',
    4: 'Хорошо',
    5: 'Отлично'
  }
  
  let text = `
ОТЧЁТ О ПРОВЕРКЕ ДОМАШНЕГО ЗАДАНИЯ
==================================

Предмет: ${subjectNames[submission.subject] || submission.subject}
Тип работы: ${taskTypeNames[submission.taskType] || submission.taskType}
${submission.topic ? `Тема: ${submission.topic}` : ''}
${submission.studentName ? `Ученик: ${submission.studentName}` : ''}
${submission.gradeLevel ? `Класс: ${submission.gradeLevel}` : ''}
Дата проверки: ${report.createdAt.toLocaleDateString('ru-RU')}

ОБЩАЯ ОЦЕНКА: ${analysis.overallScore}/5 (${scoreDescriptions[analysis.overallScore]})
---------------

${analysis.summary}

`

  // Category scores
  const scoreLabels: Record<string, string> = {
    grammar: 'Грамотность',
    content: 'Содержание',
    structure: 'Структура',
    argumentation: 'Аргументация',
    calculation: 'Вычисления',
    methodology: 'Методология',
    creativity: 'Креативность'
  }
  
  const scores = Object.entries(analysis.scores).filter(([_, v]) => v !== undefined)
  if (scores.length > 0) {
    text += `ОЦЕНКИ ПО КАТЕГОРИЯМ:\n`
    scores.forEach(([key, value]) => {
      text += `  ${scoreLabels[key] || key}: ${value}/5\n`
    })
    text += '\n'
  }

  // Errors
  if (analysis.errors.length > 0) {
    text += `ОШИБКИ (${analysis.errors.length}):\n`
    analysis.errors.forEach((error, i) => {
      const severityLabels: Record<string, string> = {
        minor: 'незначительная',
        moderate: 'умеренная',
        major: 'серьёзная'
      }
      text += `\n${i + 1}. [${severityLabels[error.severity] || error.severity}] ${error.description}\n`
      if (error.location?.text) {
        text += `   В тексте: "${error.location.text}"\n`
      }
      text += `   Рекомендация: ${error.suggestion}\n`
    })
    text += '\n'
  }

  // Math corrections
  if (analysis.mathCorrections && analysis.mathCorrections.length > 0) {
    text += `ИСПРАВЛЕНИЯ В ВЫЧИСЛЕНИЯХ:\n`
    analysis.mathCorrections.forEach((correction, i) => {
      text += `\nШаг ${correction.step}:\n`
      text += `  Было: ${correction.original}\n`
      text += `  Правильно: ${correction.correct}\n`
      text += `  Объяснение: ${correction.explanation}\n`
    })
    text += '\n'
  }

  // Strengths
  if (analysis.strengths.length > 0) {
    text += `СИЛЬНЫЕ СТОРОНЫ:\n`
    analysis.strengths.forEach(strength => {
      text += `  ✓ ${strength}\n`
    })
    text += '\n'
  }

  // Improvements
  if (analysis.improvements.length > 0) {
    text += `ЧТО НУЖНО УЛУЧШИТЬ:\n`
    analysis.improvements.forEach(improvement => {
      text += `  • ${improvement}\n`
    })
    text += '\n'
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    text += `РЕКОМЕНДАЦИИ:\n`
    analysis.recommendations.forEach(rec => {
      text += `  → ${rec}\n`
    })
    text += '\n'
  }

  // Detailed feedback
  if (analysis.detailedFeedback) {
    text += `ПОДРОБНЫЙ КОММЕНТАРИЙ:\n${analysis.detailedFeedback}\n`
  }

  text += `
----------------------------------
Проверено с помощью EduAsistent AI
Время обработки: ${(report.processingTime / 1000).toFixed(1)} сек
`

  return text.trim()
}

/**
 * Generate HTML for printable report
 */
export function formatReportAsHTML(report: HomeworkReport): string {
  const textReport = formatReportAsText(report)
  
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Отчёт о проверке - EduAsistent</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      line-height: 1.6;
    }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
    }
  </style>
</head>
<body>
  <pre>${textReport}</pre>
</body>
</html>
`
}
