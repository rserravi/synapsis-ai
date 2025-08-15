
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, Search, Filter, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  searchQuery?: string
  selectedTag?: string | null
  onClearFilters?: () => void
}

export function EmptyState({ searchQuery, selectedTag, onClearFilters }: EmptyStateProps) {
  const isFiltered = searchQuery || selectedTag

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center py-12"
    >
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            {isFiltered ? (
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-amber-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {isFiltered ? 'No se encontraron fichas' : 'Aún no tienes fichas'}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {isFiltered ? (
                <>
                  No hay fichas que coincidan con tu búsqueda
                  {searchQuery && (
                    <> de <span className="font-medium">"{searchQuery}"</span></>
                  )}
                  {selectedTag && (
                    <> en la categoría <span className="font-medium">"{selectedTag}"</span></>
                  )}
                </>
              ) : (
                'Comienza creando tu primera ficha de estudio con IA. Solo necesitas un tema o texto para empezar.'
              )}
            </p>

            <div className="space-y-3">
              {isFiltered ? (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                  <Link href="/create">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva Ficha
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/create">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Mi Primera Ficha
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
