
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/loading-spinner'
import { 
  Save, 
  Eye, 
  Edit, 
  Plus,
  Brain,
  Target,
  BookOpen,
  Microscope,
  HelpCircle,
  Tag
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface CardPreviewProps {
  card: any
  isGenerating: boolean
}

export function CardPreview({ card, isGenerating }: CardPreviewProps) {
  const [editMode, setEditMode] = useState(false)
  const [editedCard, setEditedCard] = useState(card)
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (card) {
      setEditedCard(card)
      setEditMode(false)
    }
  }, [card])

  const saveCard = async () => {
    if (!editedCard) return

    setSaving(true)
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedCard.title,
          level1: editedCard.level1,
          level2: editedCard.level2,
          level3: editedCard.level3,
          level4: editedCard.level4,
          questions: editedCard.questions || [],
          tags: editedCard.tags || [],
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar la ficha')
      }

      const savedCard = await response.json()
      
      toast({
        title: "Ficha guardada",
        description: "Tu ficha se ha guardado correctamente.",
      })

      router.push(`/cards/${savedCard.id}`)

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

  const addTag = () => {
    if (newTag.trim() && editedCard) {
      const currentTags = editedCard.tags || []
      if (!currentTags.includes(newTag.trim())) {
        setEditedCard({
          ...editedCard,
          tags: [...currentTags, newTag.trim()]
        })
      }
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (editedCard) {
      setEditedCard({
        ...editedCard,
        tags: (editedCard.tags || []).filter((tag: string) => tag !== tagToRemove)
      })
    }
  }

  const levels = [
    {
      id: 'level1',
      name: 'Concepto Clave',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: 'Idea principal y concisa'
    },
    {
      id: 'level2',
      name: 'Resumen Esencial',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: 'Puntos clave fundamentales'
    },
    {
      id: 'level3',
      name: 'Resumen Detallado',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      description: 'Explicación completa'
    },
    {
      id: 'level4',
      name: 'Análisis Extenso',
      icon: Microscope,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      description: 'Análisis profundo con ejemplos'
    }
  ]

  if (isGenerating) {
    return (
      <Card className="h-fit">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" message="Generando tu ficha de estudio..." />
        </CardContent>
      </Card>
    )
  }

  if (!card) {
    return (
      <Card className="h-fit">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Vista Previa</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Tu ficha aparecerá aquí una vez generada. Podrás editarla antes de guardar.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editMode ? (
                <Input
                  value={editedCard?.title || ''}
                  onChange={(e) => setEditedCard({
                    ...editedCard,
                    title: e.target.value
                  })}
                  className="text-lg font-semibold"
                  placeholder="Título de la ficha..."
                />
              ) : (
                <CardTitle className="text-lg">{editedCard?.title}</CardTitle>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditMode(!editMode)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          {/* Tags Section */}
          <div className="space-y-2 mt-4">
            <div className="flex flex-wrap gap-2">
              {editedCard?.tags?.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`${editMode ? 'cursor-pointer hover:bg-red-50' : ''}`}
                  onClick={() => editMode && removeTag(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  {editMode && <span className="ml-1 text-red-500">×</span>}
                </Badge>
              ))}
            </div>
            
            {editMode && (
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nueva etiqueta..."
                  className="text-sm h-8"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
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
                <TabsContent key={level.id} value={level.id} className="mt-4 space-y-4">
                  <div className={`${level.bgColor} rounded-lg p-4`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className={`h-5 w-5 ${level.color}`} />
                      <h3 className={`font-semibold ${level.color}`}>{level.name}</h3>
                    </div>
                    <p className={`text-xs ${level.color} opacity-75 mb-3`}>
                      {level.description}
                    </p>
                    
                    {editMode ? (
                      <textarea
                        value={editedCard?.[level.id] || ''}
                        onChange={(e) => setEditedCard({
                          ...editedCard,
                          [level.id]: e.target.value
                        })}
                        className="w-full min-h-[100px] p-3 border rounded-lg resize-none bg-white/50 dark:bg-slate-900/50"
                        placeholder={`Contenido para ${level.name.toLowerCase()}...`}
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {editedCard?.[level.id]}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )
            })}

            {/* Questions Tab */}
            <TabsContent value="questions" className="mt-4 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-600">Preguntas de Autoevaluación</h3>
                </div>
                
                <div className="space-y-3">
                  {editedCard?.questions?.map((question: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      {editMode ? (
                        <Input
                          value={question}
                          onChange={(e) => {
                            const newQuestions = [...(editedCard.questions || [])]
                            newQuestions[index] = e.target.value
                            setEditedCard({
                              ...editedCard,
                              questions: newQuestions
                            })
                          }}
                          className="flex-1"
                        />
                      ) : (
                        <p className="flex-1 text-sm">{question}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6 pt-4 border-t">
            <Button
              onClick={saveCard}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Ficha'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
