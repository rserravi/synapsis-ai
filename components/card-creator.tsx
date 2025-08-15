
'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Upload, 
  FileText, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface CardCreatorProps {
  onCardGenerated: (card: any) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

export function CardCreator({ onCardGenerated, isGenerating, setIsGenerating }: CardCreatorProps) {
  const [activeTab, setActiveTab] = useState('text')
  const [topic, setTopic] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [difficulty, setDifficulty] = useState('medio')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return

    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no soportado. Solo se permiten TXT, PDF y DOCX.')
      return
    }

    setUploadedFile(file)
    setError('')
    setStatusMessage('Procesando archivo...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Error al subir archivo')
      }

      const uploadResult = await uploadResponse.json()

      if (uploadResult.needsProcessing) {
        // Procesar archivo con IA
        const processResponse = await fetch('/api/process-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: uploadResult.fileName,
            fileType: uploadResult.fileType,
          }),
        })

        if (!processResponse.ok) {
          throw new Error('Error al procesar archivo')
        }

        const processResult = await processResponse.json()
        setExtractedText(processResult.extractedText)
      } else {
        setExtractedText(uploadResult.extractedText)
      }

      setStatusMessage('Archivo procesado correctamente')
      toast({
        title: "Archivo cargado",
        description: "El contenido del archivo se ha extraído correctamente.",
      })

    } catch (error) {
      console.error('Error al procesar archivo:', error)
      setError('Error al procesar el archivo. Inténtalo de nuevo.')
    }
  }, [toast])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const generateCard = async () => {
    if (!topic && !sourceText && !extractedText) {
      setError('Debes proporcionar un tema, texto o subir un archivo.')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setStatusMessage('Iniciando generación...')
    setError('')

    try {
      const content = extractedText || sourceText || topic
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: !sourceText && !extractedText ? topic : undefined,
          sourceText: content !== topic ? content : undefined,
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error('Error en la generación')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let partialRead = ''

      while (true) {
        const result = await reader?.read()
        if (!result || result.done) break
        const { value } = result

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.status === 'processing') {
                setProgress(prev => Math.min(prev + 5, 95))
                setStatusMessage(parsed.message || 'Generando contenido...')
              } else if (parsed.status === 'completed') {
                setProgress(100)
                setStatusMessage('¡Ficha generada correctamente!')
                onCardGenerated(parsed.result)
                
                toast({
                  title: "Ficha creada",
                  description: "Tu ficha de estudio se ha generado exitosamente.",
                })
                return
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Error en la generación')
              }
            } catch (e) {
              // Ignorar JSON inválido
            }
          }
        }
      }

    } catch (error) {
      console.error('Error:', error)
      setError('Error al generar la ficha. Inténtalo de nuevo.')
      toast({
        title: "Error",
        description: "No se pudo generar la ficha. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setProgress(0)
      setStatusMessage('')
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setExtractedText('')
    setStatusMessage('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <span>Generador de Fichas IA</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Texto/Tema</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Subir Archivo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Tema o Concepto</Label>
                <Input
                  id="topic"
                  placeholder="Ej: Fotosíntesis, Guerra Civil Española, Integrales..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div>
                <Label htmlFor="sourceText">Texto Fuente (Opcional)</Label>
                <Textarea
                  id="sourceText"
                  placeholder="Pega aquí el texto del que quieres crear la ficha..."
                  rows={6}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isGenerating 
                  ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isGenerating && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.pdf,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                disabled={isGenerating}
              />

              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-700">
                {uploadedFile ? 'Archivo cargado' : 'Arrastra o haz clic para subir'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Soporta archivos TXT, PDF y DOCX (máx. 10MB)
              </p>

              {uploadedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">{uploadedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFile()
                    }}
                    disabled={isGenerating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {extractedText && (
              <div className="mt-4">
                <Label>Contenido extraído</Label>
                <div className="mt-1 p-3 bg-slate-50 rounded-lg border max-h-32 overflow-y-auto">
                  <p className="text-sm text-slate-600 line-clamp-6">
                    {extractedText.substring(0, 500)}
                    {extractedText.length > 500 && '...'}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Configuración */}
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label htmlFor="difficulty">Nivel de Dificultad</Label>
            <Select value={difficulty} onValueChange={setDifficulty} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="básico">Básico - Conceptos fundamentales</SelectItem>
                <SelectItem value="medio">Intermedio - Desarrollo completo</SelectItem>
                <SelectItem value="avanzado">Avanzado - Análisis profundo</SelectItem>
                <SelectItem value="experto">Experto - Nivel académico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error/Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{statusMessage}</p>
                <p className="text-sm text-slate-500">{progress}%</p>
              </div>
              <Progress value={progress} className="w-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <Button
          onClick={generateCard}
          disabled={isGenerating || (!topic && !sourceText && !extractedText)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generando Ficha...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generar Ficha con IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
