export const maxDuration = 60

// Demo response generator - simulates AI homework analysis
function generateDemoResponse(subject: string, taskType: string, topic: string, content: string): string {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length
  const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0
  const charCount = content.length
  
  // Calculate a simulated score based on text metrics
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
1. **Структурированность** — работа имеет логическое построение и последовательное изложение мыслей
2. **Раскрытие темы** — основные аспекты темы затронуты, прослеживается понимание материала
3. **Объём** — работа соответствует требованиям по объёму для данного типа задания
4. **Связность текста** — предложения связаны между собой, есть плавные переходы

#### Области для улучшения:
1. Рекомендуется разнообразить используемую лексику, избегая повторов
2. Обратите внимание на логические связки между абзацами
3. Добавьте больше конкретных примеров для подкрепления аргументов
4. Проверьте пунктуацию в сложных предложениях

---

### Проверка грамотности

**Статистика текста:**
- Средняя длина предложения: ${avgWordsPerSentence} слов
- Общее количество слов: ${wordCount}
- Количество предложений: ${sentenceCount}

**Рекомендации по стилистике:**
- Избегайте повторов одних и тех же слов в соседних предложениях
- Используйте разнообразные синтаксические конструкции
- Проверьте согласование подлежащего и сказуемого
- Обратите внимание на употребление деепричастных оборотов

---

### Рекомендации по улучшению

1. **Введение** — сделайте его более ярким и привлекающим внимание, сформулируйте основной тезис
2. **Основная часть** — добавьте конкретные примеры, цитаты или факты для подкрепления аргументов
3. **Заключение** — усильте выводы, свяжите их с введением, подведите итоги размышлений
4. **Общий стиль** — поработайте над разнообразием лексики и синтаксических конструкций

---

### Итоговая оценка

**Оценка: ${scoreText}**

Работа демонстрирует понимание темы и умение связно излагать мысли. ${score === 5 ? 'Отличная работа! Все требования выполнены на высоком уровне.' : score === 4 ? 'Для получения отличной оценки рекомендуется углубить анализ и добавить больше аргументации.' : 'Необходимо доработать содержание и увеличить объём работы.'}

**Критерии оценивания:**
- Соответствие теме: ${score >= 4 ? 'Соответствует' : 'Частично соответствует'}
- Грамотность: Требуется проверка
- Логика изложения: ${score >= 4 ? 'Хорошая' : 'Удовлетворительная'}
- Объём работы: ${wordCount > 100 ? 'Достаточный' : 'Недостаточный'}

---

*Это демонстрационный анализ. Для полноценной AI-проверки с использованием нейросети GPT необходимо настроить Vercel AI Gateway в настройках проекта.*`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { subject, taskType, topic, content } = body
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Текст работы не предоставлен' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const demoResponse = generateDemoResponse(
      subject || 'Русский язык',
      taskType || 'Сочинение', 
      topic || '',
      content
    )
    
    // Create a streaming response that simulates typing
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send the response character by character with small delays
        const words = demoResponse.split(' ')
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '')
          const chunk = { text: word }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
          
          // Small delay for realistic streaming effect
          await new Promise(resolve => setTimeout(resolve, 15))
        }
        
        // Send done message
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
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
