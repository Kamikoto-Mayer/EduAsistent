import OpenAI from 'openai'

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'http://localhost:3000',
    'X-Title': process.env.OPENROUTER_APP_NAME || 'EduAssistant',
  },
})

const MODEL = process.env.OPENROUTER_OCR_MODEL || 'google/gemini-2.0-flash-001'

export async function POST(req: Request) {
  const body = await req.json()
  const image = body?.image

  if (!image) {
    return Response.json({ error: 'No image provided' }, { status: 400 })
  }

  const response = await openrouter.chat.completions.create({
    model: MODEL,
    temperature: 0,
    max_tokens: 2500,
    messages: [
      {
        role: 'system',
        content: `
Ты OCR-система для распознавания рукописного текста и математики.
Верни ТОЛЬКО JSON:
{
  "text": "весь распознанный текст",
  "confidence": 0.0,
  "language": "ru|en|mixed|unknown",
  "mathExpressions": [
    {
      "original": "x^2 + 2x + 1 = 0",
      "latex": "x^{2} + 2x + 1 = 0",
      "confidence": 0.0,
      "position": { "line": 0, "start": 0, "end": 0 }
    }
  ]
}
        `.trim(),
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Распознай текст и математику на изображении. Верни только JSON.' },
          { type: 'image_url', image_url: { url: image } },
        ],
      },
    ],
  })

  const content = response.choices[0]?.message?.content || ''

  let parsed: any = null
  try {
    parsed = JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        parsed = JSON.parse(match[0])
      } catch {
        parsed = null
      }
    }
  }

  return Response.json(
    parsed || {
      text: content || '',
      confidence: 0.5,
      language: 'unknown',
      mathExpressions: [],
    }
  )
}