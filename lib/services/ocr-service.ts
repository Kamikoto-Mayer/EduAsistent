import type { OCRResult, MathExpression } from '@/lib/types'

/**
 * Extract text from an image using browser Canvas API
 * This is a simple text extraction without heavy OCR libraries
 * For production, consider using a server-side OCR API
 */
export async function extractTextFromImage(
  imageData: string | File | Blob
): Promise<OCRResult> {
  // For now, return a placeholder indicating manual input is needed
  // In production, you would use a server-side OCR API like Google Cloud Vision
  // or process images server-side with Tesseract
  
  let dataUrl: string
  
  if (typeof imageData === 'string') {
    dataUrl = imageData
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(imageData)
    })
  }
  
  // Return result indicating image was received
  // The actual OCR will be done by OpenAI Vision API
  return {
    text: '[Изображение загружено - текст будет проанализирован ИИ]',
    confidence: 0,
    mathExpressions: [],
    language: 'unknown',
    imageDataUrl: dataUrl
  }
}

/**
 * Extract text from a PDF file using simple text extraction
 */
export async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<OCRResult> {
  try {
    // Simple PDF text extraction without workers
    const pdfText = await extractPDFTextSimple(pdfData)
    const mathExpressions = extractMathExpressions(pdfText)
    
    return {
      text: pdfText || '[PDF загружен - текст не найден, требуется ручной ввод]',
      confidence: pdfText ? 0.9 : 0,
      mathExpressions,
      language: 'mixed'
    }
  } catch (error) {
    console.error('[v0] PDF extraction error:', error)
    return {
      text: '[PDF загружен - ошибка извлечения текста]',
      confidence: 0,
      mathExpressions: [],
      language: 'unknown'
    }
  }
}

/**
 * Simple PDF text extraction without web workers
 */
async function extractPDFTextSimple(pdfData: ArrayBuffer): Promise<string> {
  // Convert ArrayBuffer to Uint8Array
  const data = new Uint8Array(pdfData)
  
  // Try to extract text from PDF by parsing the raw content
  // This is a simplified approach that works for text-based PDFs
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const content = decoder.decode(data)
  
  // Find text streams in PDF
  const textParts: string[] = []
  
  // Pattern for text content in PDFs
  const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g
  let match
  
  while ((match = streamPattern.exec(content)) !== null) {
    const streamContent = match[1]
    
    // Look for text operators
    const textPattern = /\(([^)]+)\)\s*Tj|\[([\s\S]*?)\]\s*TJ/g
    let textMatch
    
    while ((textMatch = textPattern.exec(streamContent)) !== null) {
      const text = textMatch[1] || textMatch[2]
      if (text) {
        // Clean up the extracted text
        const cleanText = text
          .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\\\/g, '\\')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\s+/g, ' ')
          .trim()
        
        if (cleanText && cleanText.length > 1) {
          textParts.push(cleanText)
        }
      }
    }
  }
  
  // If no text found via streams, try to find readable text
  if (textParts.length === 0) {
    // Look for any readable Russian or English text
    const readablePattern = /[А-Яа-яЁёA-Za-z0-9\s.,!?;:'"()\-+=*/]{10,}/g
    const readableMatches = content.match(readablePattern)
    if (readableMatches) {
      textParts.push(...readableMatches.slice(0, 50)) // Limit to prevent overflow
    }
  }
  
  return textParts.join(' ').trim()
}

/**
 * Extract mathematical expressions from text
 * Uses pattern matching to find common math notation
 */
function extractMathExpressions(text: string): MathExpression[] {
  const expressions: MathExpression[] = []
  
  // Patterns for common math expressions
  const patterns = [
    // Equations with equals sign
    /[\d\w\s+\-*/^()]+\s*=\s*[\d\w\s+\-*/^()]+/g,
    // Fractions written as a/b
    /\d+\s*\/\s*\d+/g,
    // Powers written as x^n
    /\w+\s*\^\s*\d+/g,
    // Square roots
    /√\s*[\d\w()]+/g,
    /sqrt\s*\([\d\w\s+\-*/]+\)/gi,
    // Expressions with parentheses containing operations
    /\([\d\w\s+\-*/^]+\)/g,
    // Inequalities
    /[\d\w\s+\-*/^()]+\s*[<>≤≥]\s*[\d\w\s+\-*/^()]+/g,
    // Functions
    /(?:sin|cos|tan|log|ln|lim)\s*\([\d\w\s+\-*/^]+\)/gi,
    // Integrals and derivatives (if typed)
    /∫[\d\w\s+\-*/^]+d\w/g,
    /d\/d\w\s*\([\d\w\s+\-*/^]+\)/g,
  ]
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const expr = match[0].trim()
      if (expr.length > 2) { // Ignore very short matches
        expressions.push({
          original: expr,
          latex: convertToLatex(expr),
          confidence: 0.7,
          position: {
            line: 0,
            start: match.index || 0,
            end: (match.index || 0) + expr.length
          }
        })
      }
    }
  })
  
  // Remove duplicates
  const unique = expressions.filter((expr, index, self) =>
    index === self.findIndex(e => e.original === expr.original)
  )
  
  return unique
}

/**
 * Convert common math notation to LaTeX
 */
function convertToLatex(expression: string): string {
  let latex = expression
  
  // Replace sqrt
  latex = latex.replace(/sqrt\s*\(/gi, '\\sqrt{')
  latex = latex.replace(/√\s*/g, '\\sqrt{')
  
  // Replace powers
  latex = latex.replace(/\^(\d+)/g, '^{$1}')
  latex = latex.replace(/\^(\w)/g, '^{$1}')
  
  // Replace fractions (simple a/b format)
  latex = latex.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')
  
  // Replace functions
  latex = latex.replace(/sin\s*\(/gi, '\\sin(')
  latex = latex.replace(/cos\s*\(/gi, '\\cos(')
  latex = latex.replace(/tan\s*\(/gi, '\\tan(')
  latex = latex.replace(/log\s*\(/gi, '\\log(')
  latex = latex.replace(/ln\s*\(/gi, '\\ln(')
  latex = latex.replace(/lim\s*/gi, '\\lim ')
  
  // Replace inequalities
  latex = latex.replace(/≤/g, '\\leq')
  latex = latex.replace(/≥/g, '\\geq')
  
  // Replace integral symbol
  latex = latex.replace(/∫/g, '\\int')
  
  // Replace multiplication dot
  latex = latex.replace(/×/g, '\\times')
  latex = latex.replace(/·/g, '\\cdot')
  
  return latex
}

/**
 * Process a file and extract text
 */
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
      language: 'unknown'
    }
  }
  
  throw new Error(`Unsupported file type: ${fileType}`)
}

/**
 * Process a data URL (base64 encoded image)
 */
export async function processDataUrl(dataUrl: string): Promise<OCRResult> {
  return extractTextFromImage(dataUrl)
}
