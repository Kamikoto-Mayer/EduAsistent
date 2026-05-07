// Main types for EduAsistent homework checking system

export type Subject = 
  | 'russian'
  | 'literature'
  | 'history'
  | 'social'
  | 'math'
  | 'algebra'
  | 'geometry'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'other'

export type TaskType =
  | 'essay'
  | 'homework'
  | 'test'
  | 'exercise'
  | 'project'
  | 'lab'
  | 'other'

export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type ScoreScale = 1 | 2 | 3 | 4 | 5

export interface HomeworkSubmission {
  text?: string
  files?: UploadedFile[]
  subject: Subject
  taskType: TaskType
  topic?: string
  gradeLevel?: GradeLevel
  studentName?: string
  additionalContext?: string
}

export interface UploadedFile {
  id: string
  name: string
  type: 'image' | 'pdf' | 'text'
  mimeType: string
  size: number
  dataUrl?: string
  extractedText?: string
  extractedMath?: MathExpression[]
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface MathExpression {
  original: string
  latex?: string
  confidence: number
  position?: {
    line: number
    start: number
    end: number
  }
}

export interface OCRResult {
  text: string
  confidence: number
  mathExpressions: MathExpression[]
  language?: string
  imageDataUrl?: string
}

export interface AnalysisError {
  id: string
  type: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'factual' | 'logic' | 'calculation' | 'method'
  severity: 'minor' | 'moderate' | 'major'
  location?: {
    start: number
    end: number
    text: string
  }
  description: string
  suggestion: string
  explanation?: string
}

export interface MathCorrection {
  step: number
  original: string
  correct: string
  explanation: string
  errorType: 'calculation' | 'method' | 'notation' | 'logic'
}

export interface AnalysisResult {
  // Overall assessment
  overallScore: ScoreScale
  summary: string
  
  // Category scores (not all apply to every subject)
  scores: {
    grammar?: ScoreScale
    content?: ScoreScale
    structure?: ScoreScale
    argumentation?: ScoreScale
    calculation?: ScoreScale
    methodology?: ScoreScale
    creativity?: ScoreScale
  }
  
  // Detailed feedback
  errors: AnalysisError[]
  strengths: string[]
  improvements: string[]
  
  // Math-specific
  mathCorrections?: MathCorrection[]
  
  // Teacher recommendations
  recommendations: string[]
  
  // For display
  detailedFeedback: string
}

export interface HomeworkReport {
  id: string
  createdAt: Date
  
  // Submission info
  submission: HomeworkSubmission
  
  // Recognition results
  recognizedText: string
  recognizedMath: MathExpression[]
  
  // AI Analysis
  analysis: AnalysisResult
  
  // Processing metadata
  processingTime: number
  aiModel?: string
}

export interface CheckingProgress {
  stage: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete' | 'error'
  progress: number // 0-100
  message: string
  details?: string
}

// Subject display names in Russian
export const SUBJECT_NAMES: Record<Subject, string> = {
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

export const TASK_TYPE_NAMES: Record<TaskType, string> = {
  essay: 'Сочинение',
  homework: 'Домашняя работа',
  test: 'Контрольная работа',
  exercise: 'Упражнение',
  project: 'Проект',
  lab: 'Лабораторная работа',
  other: 'Другое'
}

export const SCORE_DESCRIPTIONS: Record<ScoreScale, string> = {
  1: 'Неудовлетворительно',
  2: 'Плохо',
  3: 'Удовлетворительно',
  4: 'Хорошо',
  5: 'Отлично'
}
