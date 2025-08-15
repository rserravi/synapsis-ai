
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Search,
  Filter,
  X,
  Calendar,
  Tag,
  SortAsc,
  SortDesc,
  Clock,
  BookOpen,
  Sliders
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'

interface Tag {
  id: string
  name: string
  color: string
  _count: { cards: number }
}

interface SearchFilters {
  query: string
  tags: string[]
  sortBy: 'title' | 'createdAt' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
  dateRange: 'all' | 'today' | 'week' | 'month'
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  totalResults: number
  isLoading?: boolean
}

export function AdvancedSearch({ onFiltersChange, totalResults, isLoading = false }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    dateRange: 'all'
  })

  useEffect(() => {
    fetchTags()
  }, [])

  // Debounced search to avoid too many API calls
  const debouncedFilterChange = useCallback(
    debounce((newFilters: SearchFilters) => {
      onFiltersChange(newFilters)
    }, 300),
    [onFiltersChange]
  )

  useEffect(() => {
    debouncedFilterChange(filters)
    return () => debouncedFilterChange.cancel()
  }, [filters, debouncedFilterChange])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags', { credentials: 'include' })
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      if (response.ok) {
        const tagsData = await response.json()
        setTags(tagsData)
      }
    } catch (error) {
      console.error('Error al obtener etiquetas:', error)
    }
  }

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const addTag = (tagName: string) => {
    if (!filters.tags.includes(tagName)) {
      updateFilter('tags', [...filters.tags, tagName])
    }
  }

  const removeTag = (tagName: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tagName))
  }

  const clearAllFilters = () => {
    setFilters({
      query: '',
      tags: [],
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      dateRange: 'all'
    })
  }

  const hasActiveFilters = filters.query || filters.tags.length > 0 || 
                          filters.dateRange !== 'all' || filters.sortBy !== 'updatedAt' || 
                          filters.sortOrder !== 'desc'

  const sortOptions = [
    { value: 'title', label: 'Título' },
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'updatedAt', label: 'Última actualización' }
  ]

  const dateRangeOptions = [
    { value: 'all', label: 'Todo el tiempo' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' }
  ]

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-lg">Búsqueda Avanzada</CardTitle>
            {totalResults > 0 && (
              <Badge variant="outline">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-500"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Sliders className="h-4 w-4 mr-2" />
              {isExpanded ? 'Ocultar' : 'Filtros'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Buscar en todas las fichas..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10 pr-4"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Quick Tag Filters */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-1">
              <Tag className="h-4 w-4" />
              <span>Filtrar por etiquetas</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 8).map((tag) => {
                const isSelected = filters.tags.includes(tag.name)
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer hover:shadow-sm transition-all"
                    style={{
                      backgroundColor: isSelected ? tag.color : undefined,
                      borderColor: tag.color,
                      color: isSelected ? 'white' : tag.color
                    }}
                    onClick={() => isSelected ? removeTag(tag.name) : addTag(tag.name)}
                  >
                    {tag.name} ({tag._count.cards})
                    {isSelected && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                )
              })}
              {tags.length > 8 && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setIsExpanded(true)}>
                  +{tags.length - 8} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Selected Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Filtros activos
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.query && (
                <Badge variant="outline" className="bg-white dark:bg-slate-800">
                  Búsqueda: "{filters.query}"
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('query', '')} />
                </Badge>
              )}
              {filters.tags.map((tagName) => {
                const tag = tags.find(t => t.name === tagName)
                return (
                  <Badge
                    key={tagName}
                    variant="outline"
                    className="bg-white dark:bg-slate-800"
                    style={{ borderColor: tag?.color, color: tag?.color }}
                  >
                    {tagName}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tagName)} />
                  </Badge>
                )
              })}
              {filters.dateRange !== 'all' && (
                <Badge variant="outline" className="bg-white dark:bg-slate-800">
                  <Calendar className="h-3 w-3 mr-1" />
                  {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('dateRange', 'all')} />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 pt-4 border-t"
            >
              <div className="grid md:grid-cols-2 gap-4">
                {/* Sorting */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ordenar por</Label>
                  <div className="flex space-x-2">
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value as any)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {filters.sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rango de fechas</Label>
                  <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRangeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* All Tags */}
              {tags.length > 8 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Todas las etiquetas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {tags.map((tag) => {
                      const isSelected = filters.tags.includes(tag.name)
                      return (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addTag(tag.name)
                              } else {
                                removeTag(tag.name)
                              }
                            }}
                          />
                          <Label
                            htmlFor={`tag-${tag.id}`}
                            className="text-sm cursor-pointer flex items-center space-x-1"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                            <span className="text-slate-500">({tag._count.cards})</span>
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
