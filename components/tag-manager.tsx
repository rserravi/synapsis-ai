
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Tag,
  Plus,
  Edit,
  Trash2,
  Palette,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

interface TagData {
  id: string
  name: string
  color: string
  _count: { cards: number }
}

interface TagManagerProps {
  trigger?: React.ReactNode
  onTagsUpdated?: () => void
}

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6B7280', // Gray
]

export function TagManager({ trigger, onTagsUpdated }: TagManagerProps) {
  const [tags, setTags] = useState<TagData[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagData | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(predefinedColors[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { toast } = useToast()
  const router = useRouter()
  const { logout } = useAuth()

  const handleUnauthorized = () => {
    toast({
      title: 'Sesión expirada',
      description: 'Por favor, inicia sesión nuevamente.',
    })
    logout()
    router.push('/login')
  }

  useEffect(() => {
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tags', { credentials: 'include' })
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      if (response.ok) {
        const tagsData = await response.json()
        setTags(tagsData)
      }
    } catch (error) {
      console.error('Error al obtener etiquetas:', error)
      setError('Error al cargar etiquetas')
    } finally {
      setLoading(false)
    }
  }

  const createTag = async () => {
    if (!newTagName.trim()) {
      setError('El nombre de la etiqueta es requerido')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
        credentials: 'include',
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error('Error al crear etiqueta')
      }

      await fetchTags()
      setNewTagName('')
      setNewTagColor(predefinedColors[0])
      setError('')
      onTagsUpdated?.()
      
      toast({
        title: "Etiqueta creada",
        description: `La etiqueta "${newTagName}" se ha creado correctamente.`,
      })

    } catch (error) {
      console.error('Error al crear etiqueta:', error)
      setError('Error al crear la etiqueta')
    } finally {
      setLoading(false)
    }
  }

  const updateTag = async () => {
    if (!editingTag || !newTagName.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
        credentials: 'include',
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error('Error al actualizar etiqueta')
      }

      await fetchTags()
      setEditingTag(null)
      setNewTagName('')
      setNewTagColor(predefinedColors[0])
      setError('')
      onTagsUpdated?.()
      
      toast({
        title: "Etiqueta actualizada",
        description: `La etiqueta se ha actualizado correctamente.`,
      })

    } catch (error) {
      console.error('Error al actualizar etiqueta:', error)
      setError('Error al actualizar la etiqueta')
    } finally {
      setLoading(false)
    }
  }

  const deleteTag = async (tag: TagData) => {
    if (tag._count.cards > 0) {
      setError(`No se puede eliminar la etiqueta "${tag.name}" porque está siendo usada por ${tag._count.cards} ficha(s)`)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error('Error al eliminar etiqueta')
      }

      await fetchTags()
      setError('')
      onTagsUpdated?.()
      
      toast({
        title: "Etiqueta eliminada",
        description: `La etiqueta "${tag.name}" se ha eliminado correctamente.`,
      })

    } catch (error) {
      console.error('Error al eliminar etiqueta:', error)
      setError('Error al eliminar la etiqueta')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (tag: TagData) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
    setError('')
  }

  const cancelEditing = () => {
    setEditingTag(null)
    setNewTagName('')
    setNewTagColor(predefinedColors[0])
    setError('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Tag className="h-4 w-4 mr-2" />
            Gestionar Etiquetas
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Gestionar Etiquetas</span>
          </DialogTitle>
          <DialogDescription>
            Crea, edita y organiza las etiquetas para tus fichas de estudio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create/Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingTag ? 'Editar Etiqueta' : 'Crear Nueva Etiqueta'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tagName">Nombre</Label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nombre de la etiqueta..."
                    onKeyPress={(e) => e.key === 'Enter' && (editingTag ? updateTag() : createTag())}
                  />
                </div>
                
                <div>
                  <Label>Color</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div
                      className="w-8 h-8 rounded-md border-2 border-white shadow-sm"
                      style={{ backgroundColor: newTagColor }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-md border-2 ${
                            newTagColor === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTagColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                {editingTag ? (
                  <>
                    <Button onClick={updateTag} disabled={loading || !newTagName.trim()}>
                      <Edit className="h-4 w-4 mr-2" />
                      {loading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={createTag} disabled={loading || !newTagName.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? 'Creando...' : 'Crear Etiqueta'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Etiquetas Existentes ({tags.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && tags.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">Cargando etiquetas...</p>
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    No hay etiquetas creadas. ¡Crea tu primera etiqueta!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  <AnimatePresence>
                    {tags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <div>
                            <span className="font-medium">{tag.name}</span>
                            <p className="text-sm text-slate-500">
                              {tag._count.cards} ficha{tag._count.cards !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(tag)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTag(tag)}
                            disabled={tag._count.cards > 0}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
