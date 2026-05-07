import type { OCRResult, MathExpression } from '@/lib/types'

async function fileToDataUrl(imageData: string | File | Blob): Promise<string> {
  if (typeof imageData === 'string') return imageData

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(imageData)
  })
}

export async function extractTextFromImage(
  imageData: string | File | Blob
): Promise<OCRResult> {
  const dataUrl = await fileToDataUrl(imageData)

  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: dataUrl }),
  })

  if (!res.ok) {
    throw new Error('OCR request failed')
  }

  const data = await res.json()

  return {
    text: data.text || '',
    confidence: typeof data.confidence === 'number' ? data.confidence : 0,
    mathExpressions: Array.isArray(data.mathExpressions) ? data.mathExpressions : [],
    language: data.language || 'unknown',
    imageDataUrl: dataUrl,
  }
}

export async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<OCRResult> {
  try {
    const pdfText = await extractPDFTextSimple(pdfData)
    const mathExpressions = extractMathExpressions(pdfText)

    return {
      text: pdfText || '[PDF загружен - текст не найден, требуется ручной ввод]',
      confidence: pdfText ? 0.9 : 0,
      mathExpressions,
      language: 'mixed',
    }
  } catch (error) {
    console.error('[ocr-service] PDF extraction error:', error)
    return {
      text: '[PDF загружен - ошибка извлечения текста]',
      confidence: 0,
      mathExpressions: [],
      language: 'unknown',
    }
  }
}

async function extractPDFTextSimple(pdfData: ArrayBuffer): Promise<string> {
  const data = new Uint8Array(pdfData)
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const content = decoder.decode(data)

  const textParts: string[] = []
  const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g
  let match: RegExpExecArray | null

  while ((match = streamPattern.exec(content)) !== null) {
    const streamContent = match[1]
    const textPattern = /\(([^)]+)\)\s*Tj|\[([\s\S]*?)\]\s*TJ/g
    let textMatch: RegExpExecArray | null

    while ((textMatch = textPattern.exec(streamContent)) !== null) {
      const text = textMatch[1] || textMatch[2]
      if (text) {
        const cleanText = text
          .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\\\/g, '\\')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\s+/g, ' ')
          .trim()

        if (cleanText && cleanText.length > 1) textParts.push(cleanText)
      }
    }
  }

  if (textParts.length === 0) {
    const readablePattern = /[А-Яа-яЁёA-Za-z0-9\s.,!?;:'"()\-+=*/]{10,}/g
    const readableMatches = content.match(readablePattern)
    if (readableMatches) textParts.push(...readableMatches.slice(0, 50))
  }

  return textParts.join(' ').trim()
}

function extractMathExpressions(text: string): MathExpression[] {
  const expressions: MathExpression[] = []

  const patterns = [
    /[\d\w\s+\-*/^()]+\s*=\s*[\d\w\s+\-*/^()]+/g,
    /\d+\s*\/\s*\d+/g,
    /\w+\s*\^\s*\d+/g,
    /√\s*[\d\w()]+/g,
    /sqrt\s*\([\d\w\s+\-*/]+\)/gi,
    /\([\d\w\s+\-*/^]+\)/g,
    /[\d\w\s+\-*/^()]+\s*[<>≤≥]\s*[\d\w\s+\-*/^()]+/g,
    /(?:sin|cos|tan|log|ln|lim)\s*\([\d\w\s+\-*/^]+\)/gi,
    /∫[\d\w\s+\-*/^]+d\w/g,
    /d\/d\w\s*\([\d\w\s+\-*/^]+\)/g,
  ]

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const expr = match[0].trim()
      if (expr.length > 2) {
        expressions.push({
          original: expr,
          latex: convertToLatex(expr),
          confidence: 0.7,
          position: {
            line: 0,
            start: match.index || 0,
            end: (match.index || 0) + expr.length,
          },
        })
      }
    }
  })

  return expressions.filter(
    (expr, index, self) => index === self.findIndex(e => e.original === expr.original)
  )
}

function convertToLatex(expression: string): string {
  let latex = expression
  latex = latex.replace(/sqrt\s*\(/gi, '\\sqrt{')
  latex = latex.replace(/√\s*/g, '\\sqrt{')
  latex = latex.replace(/\^(\d+)/g, '^{$1}')
  latex = latex.replace(/\^(\w)/g, '^{$1}')
  latex = latex.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')
  latex = latex.replace(/sin\s*\(/gi, '\\sin(')
  latex = latex.replace(/cos\s*\(/gi, '\\cos(')
  latex = latex.replace(/tan\s*\(/gi, '\\tan(')
  latex = latex.replace(/log\s*\(/gi, '\\log(')
  latex = latex.replace(/ln\s*\(/gi, '\\ln(')
  latex = latex.replace(/lim\s*/gi, '\\lim ')
  latex = latex.replace(/≤/g, '\\leq')
  latex = latex.replace(/≥/g, '\\geq')
  latex = latex.replace(/∫/g, '\\int')
  latex = latex.replace(/×/g, '\\times')
  latex = latex.replace(/·/g, '\\cdot')
  return latex
}

export async function processFile(file: File): Promise<OCRResult> {
  const fileType = file.type

  if (fileType === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer()
    return extractTextFromPDF(arrayBuffer)
  }

  if (fileType.startsWith('image/')) {
    return extractTextFromImage(file)
  }

  if (fileType === 'text/plain') {
    const text = await file.text()
    return {
      text,
      confidence: 1.0,
      mathExpressions: extractMathExpressions(text),
      language: 'unknown',
    }
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}

export async function processDataUrl(dataUrl: string): Promise<OCRResult> {
  return extractTextFromImage(dataUrl)
}