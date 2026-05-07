import type { OCRResult, MathExpression } from '@/lib/types'

// Tesseract.js types
interface TesseractWorker {
  loadLanguage: (lang: string) => Promise<void>
  initialize: (lang: string) => Promise<void>
  recognize: (image: string | File | Blob) => Promise<{ data: { text: string; confidence: number } }>
  terminate: () => Promise<void>
}

interface TesseractModule {
  createWorker: (lang?: string) => Promise<TesseractWorker>
}

let tesseractModule: TesseractModule | null = null

async function getTesseract(): Promise<TesseractModule> {
  if (tesseractModule) return tesseractModule
  
  // Dynamic import for client-side only
  const Tesseract = await import('tesseract.js')
  tesseractModule = Tesseract as unknown as TesseractModule
  return tesseractModule
}

/**
 * Extract text from an image using Tesseract.js OCR
 */
export async function extractTextFromImage(
  imageData: string | File | Blob,
  language: string = 'rus+eng'
): Promise<OCRResult> {
  const Tesseract = await getTesseract()
  
  const worker = await Tesseract.createWorker(language)
  
  try {
    const result = await worker.recognize(imageData)
    
    const text = result.data.text.trim()
    const confidence = result.data.confidence / 100
    
    // Extract potential math expressions
    const mathExpressions = extractMathExpressions(text)
    
    return {
      text,
      confidence,
      mathExpressions,
      language: language.split('+')[0]
    }
  } finally {
    await worker.terminate()
  }
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<OCRResult> {
  const pdfjsLib = await import('pdfjs-dist')
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
  
  let fullText = ''
  const allMathExpressions: MathExpression[] = []
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    
    fullText += pageText + '\n\n'
    
    // Extract math from this page
    const pageMath = extractMathExpressions(pageText)
    pageMath.forEach(expr => {
      expr.position = { line: i, start: 0, end: 0 }
    })
    allMathExpressions.push(...pageMath)
  }
  
  return {
    text: fullText.trim(),
    confidence: 0.95, // PDF text extraction is generally reliable
    mathExpressions: allMathExpressions,
    language: 'mixed'
  }
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
    // Expressions with parentheses
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
