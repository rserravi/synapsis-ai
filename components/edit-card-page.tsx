
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { MarkdownEditor } from '@/components/markdown-editor'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  X, 
  AlertCircle,
  Brain,
  Target,
  BookOpen,
  Microscope,
  HelpCircle,
  Tag
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface EditCardPageProps {
  cardId: string
}

interface CardData {
  id: string
  title: string
  level1: string
  level2: string
  level3: string
  level4: string
  questions: string[]
  tags: { id: string; name: string; color: string }[]
  createdAt: string
  updatedAt: string
}

export function EditCardPage({ cardId }: EditCardPageProps) {
  const [card, setCard] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newQuestion, setNewQuestion] = useState('')

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCard()
  }, [cardId])

  const fetchCard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cards/${cardId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Ficha no encontrada')
        } else {
          setError('Error al cargar la ficha')
        }
        return
      }

      const cardData = await response.json()
      setCard(cardData)
    } catch (error) {
      console.error('Error al obtener ficha:', error)
      setError('Error al cargar la ficha')
    } finally {
      setLoading(false)
    }
  }

  const saveCard = async () => {
    if (!card) return

    setSaving(true)
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: card.title,
          level1: card.level1,
          level2: card.level2,
          level3: card.level3,
          level4: card.level4,
          questions: card.questions,
          tags: card.tags?.map(tag => tag.name) || [],
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar la ficha')
      }

      toast({
        title: "Ficha actualizada",
        description: "Los cambios se han guardado correctamente.",
      })

      router.push(`/cards/${cardId}`)

    } catch (error) {
      console.error('Error al guardar:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar la ficha.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof CardData, value: any) => {
    if (!card) return
    setCard({ ...card, [field]: value })
  }

  const addTag = () => {
    if (newTag.trim() && card) {
      const currentTagNames = card.tags?.map(t => t.name) || []
      if (!currentTagNames.includes(newTag.trim())) {
        const newTagObj = {
          id: `temp-${Date.now()}`,
          name: newTag.trim(),
          color: '#3B82F6'
        }
        setCard({
          ...card,
          tags: [...(card.tags || []), newTagObj]
        })
      }
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (!card) return
    setCard({
      ...card,
      tags: (card.tags || []).filter(tag => tag.name !== tagToRemove)
    })
  }

  const addQuestion = () => {
    if (newQuestion.trim() && card) {
      setCard({
        ...card,
        questions: [...(card.questions || []), newQuestion.trim()]
      })
      setNewQuestion('')
    }
  }

  const removeQuestion = (index: number) => {
    if (!card) return
    const newQuestions = [...(card.questions || [])]
    newQuestions.splice(index, 1)
    setCard({ ...card, questions: newQuestions })
  }

  const updateQuestion = (index: number, value: string) => {
    if (!card) return
    const newQuestions = [...(card.questions || [])]
    newQuestions[index] = value
    setCard({ ...card, questions: newQuestions })
  }

  const levels = [
    {
      id: 'level1',
      name: 'Concepto Clave',
      icon: Brain,
      color: 'text-blue-600',
      description: 'La idea principal y más concisa'
    },
    {
      id: 'level2',
      name: 'Resumen Esencial',
      icon: Target,
      color: 'text-green-600',
      description: 'Los puntos clave fundamentales'
    },
    {
      id: 'level3',
      name: 'Resumen Detallado',
      icon: BookOpen,
      color: 'text-purple-600',
      description: 'Explicación completa del concepto'
    },
    {
      id: 'level4',
      name: 'Análisis Extenso',
      icon: Microscope,
      color: 'text-orange-600',
      description: 'Análisis profundo con ejemplos'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" message="Cargando editor..." />
        </main>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {error || 'Ficha no encontrada'}
            </h2>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(`/cards/${cardId}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Ver Ficha
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Editar{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Ficha
                  </span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Personaliza tu ficha con soporte completo para Markdown
                </p>
              </div>
              
              <Button
                onClick={saveCard}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={card.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Título de la ficha..."
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label>Etiquetas</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {card.tags?.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center space-x-1 cursor-pointer hover:bg-red-50"
                          onClick={() => removeTag(tag.name)}
                        >
                          <Tag className="h-3 w-3" />
                          <span>{tag.name}</span>
                          <X className="h-3 w-3 text-red-500" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nueva etiqueta..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag} disabled={!newTag.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Levels */}
              <Card>
                <CardHeader>
                  <CardTitle>Contenido por Niveles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="level1" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      {levels.map((level) => {
                        const Icon = level.icon
                        return (
                          <TabsTrigger
                            key={level.id}
                            value={level.id}
                            className="flex flex-col items-center p-2 text-xs"
                          >
                            <Icon className={`h-4 w-4 ${level.color} mb-1`} />
                            <span className="hidden sm:inline">Nivel {level.id.slice(-1)}</span>
                          </TabsTrigger>
                        )
                      })}
                    </TabsList>

                    {levels.map((level) => {
                      const Icon = level.icon
                      return (
                        <TabsContent key={level.id} value={level.id} className="mt-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-5 w-5 ${level.color}`} />
                              <div>
                                <h3 className={`font-semibold ${level.color}`}>
                                  {level.name}
                                </h3>
                                <p className="text-xs text-slate-500">
                                  {level.description}
                                </p>
                              </div>
                            </div>
                            
                            <MarkdownEditor
                              value={card[level.id as keyof CardData] as string}
                              onChange={(value) => updateField(level.id as keyof CardData, value)}
                              placeholder={`Escribe el contenido para ${level.name.toLowerCase()}...`}
                              height="300px"
                            />
                          </div>
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5 text-amber-600" />
                    <span>Preguntas de Autoevaluación</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {card.questions?.map((question, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={question}
                            onChange={(e) => updateQuestion(index, e.target.value)}
                            placeholder="Pregunta..."
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <Input
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Nueva pregunta..."
                      onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                    />
                    <Button
                      onClick={addQuestion}
                      disabled={!newQuestion.trim()}
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Pregunta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Markdown Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ayuda de Markdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs space-y-2">
                    <div>
                      <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">**texto**</code>
                      <span className="ml-2 text-slate-600">Negrita</span>
                    </div>
                    <div>
                      <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">*texto*</code>
                      <span className="ml-2 text-slate-600">Cursiva</span>
                    </div>
                    <div>
                      <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded"># Título</code>
                      <span className="ml-2 text-slate-600">Encabezado</span>
                    </div>
                    <div>
                      <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">- elemento</code>
                      <span className="ml-2 text-slate-600">Lista</span>
                    </div>
                    <div>
                      <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">`código`</code>
                      <span className="ml-2 text-slate-600">Código inline</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
