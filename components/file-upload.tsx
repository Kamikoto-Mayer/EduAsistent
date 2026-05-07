'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UploadedFile, OCRResult } from '@/lib/types'

interface FileUploadProps {
  onFilesProcessed: (files: UploadedFile[], extractedText: string) => void
  disabled?: boolean
  maxFiles?: number
  maxSizeMB?: number
}

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
}

export function FileUpload({ 
  onFilesProcessed, 
  disabled = false,
  maxFiles = 5,
  maxSizeMB = 10 
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fileType = file.type.startsWith('image/') 
      ? 'image' 
      : file.type === 'application/pdf' 
        ? 'pdf' 
        : 'text'
    
    const uploadedFile: UploadedFile = {
      id,
      name: file.name,
      type: fileType,
      mimeType: file.type,
      size: file.size,
      status: 'processing',
    }

    try {
      // For images, create a data URL for preview and OCR
      if (fileType === 'image') {
        const dataUrl = await readFileAsDataUrl(file)
        uploadedFile.dataUrl = dataUrl
        
        // Process OCR
        const { processDataUrl } = await import('@/lib/services/ocr-service')
        const ocrResult = await processDataUrl(dataUrl)
        uploadedFile.extractedText = ocrResult.text
        uploadedFile.extractedMath = ocrResult.mathExpressions
      }
      // For PDFs
      else if (fileType === 'pdf') {
        const { extractTextFromPDF } = await import('@/lib/services/ocr-service')
        const arrayBuffer = await file.arrayBuffer()
        const ocrResult = await extractTextFromPDF(arrayBuffer)
        uploadedFile.extractedText = ocrResult.text
        uploadedFile.extractedMath = ocrResult.mathExpressions
      }
      // For text files
      else {
        const text = await file.text()
        uploadedFile.extractedText = text
      }
      
      uploadedFile.status = 'completed'
    } catch (err) {
      console.error('[v0] File processing error:', err)
      uploadedFile.status = 'error'
      uploadedFile.error = err instanceof Error ? err.message : 'Ошибка обработки файла'
    }

    return uploadedFile
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    setError(null)
    setIsProcessing(true)
    
    try {
      // Add files with pending status
      const pendingFiles: UploadedFile[] = acceptedFiles.map(file => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'text',
        mimeType: file.type,
        size: file.size,
        status: 'pending' as const,
      }))
      
      setFiles(prev => [...prev, ...pendingFiles])
      
      // Process files
      const processedFiles: UploadedFile[] = []
      for (const file of acceptedFiles) {
        const processed = await processFile(file)
        processedFiles.push(processed)
        
        // Update the file in state
        setFiles(prev => prev.map(f => 
          f.name === file.name && f.status === 'pending' ? processed : f
        ))
      }
      
      // Combine all extracted text
      const combinedText = processedFiles
        .filter(f => f.status === 'completed' && f.extractedText)
        .map(f => f.extractedText)
        .join('\n\n')
      
      onFilesProcessed(processedFiles, combinedText)
    } catch (err) {
      console.error('[v0] Drop error:', err)
      setError('Ошибка при обработке файлов')
    } finally {
      setIsProcessing(false)
    }
  }, [processFile, onFilesProcessed])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: disabled || isProcessing,
  })

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      const combinedText = updated
        .filter(f => f.status === 'completed' && f.extractedText)
        .map(f => f.extractedText)
        .join('\n\n')
      onFilesProcessed(updated, combinedText)
      return updated
    })
  }

  const clearAll = () => {
    setFiles([])
    setError(null)
    onFilesProcessed([], '')
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10',
          (disabled || isProcessing) && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive',
          'border-border bg-background'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          {isProcessing ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Обработка файлов...</p>
            </>
          ) : (
            <>
              <Upload className={cn(
                'h-10 w-10',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive 
                    ? 'Отпустите файлы здесь' 
                    : 'Перетащите файлы сюда или нажмите для выбора'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Изображения (JPG, PNG, WebP), PDF или текстовые файлы
                </p>
                <p className="text-xs text-muted-foreground">
                  До {maxFiles} файлов, максимум {maxSizeMB}МБ каждый
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {(error || fileRejections.length > 0) && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {error || fileRejections.map(r => `${r.file.name}: ${r.errors[0]?.message}`).join(', ')}
          </span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Загруженные файлы ({files.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={isProcessing}
              className="text-xs"
            >
              Очистить все
            </Button>
          </div>
          
          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  file.status === 'error' && 'border-destructive bg-destructive/5',
                  file.status === 'completed' && 'border-green-500/30 bg-green-500/5',
                  file.status === 'processing' && 'border-primary/30 bg-primary/5',
                  file.status === 'pending' && 'border-border'
                )}
              >
                {/* File icon */}
                <div className="shrink-0">
                  {file.type === 'image' ? (
                    file.dataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={file.dataUrl} 
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <Image className="h-10 w-10 text-muted-foreground" />
                    )
                  ) : (
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} КБ
                    {file.extractedText && ` • ${file.extractedText.split(/\s+/).length} слов распознано`}
                  </p>
                  {file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>

                {/* Status indicator */}
                <div className="shrink-0">
                  {file.status === 'processing' && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  disabled={file.status === 'processing'}
                  className="shrink-0 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to read file as data URL
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
