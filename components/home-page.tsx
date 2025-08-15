
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { CardGrid } from '@/components/card-grid'
import { EmptyState } from '@/components/empty-state'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Plus, BookOpen, Target, Zap, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

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

interface PaginatedResponse {
  cards: CardData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function HomePage() {
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0
  })

  const router = useRouter()

  useEffect(() => {
    fetchCards()
  }, [searchQuery, selectedTag])

  const fetchCards = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (searchQuery) params.set('search', searchQuery)
      if (selectedTag) params.set('tag', selectedTag)

      const response = await fetch(`/api/cards?${params}`, {
        credentials: 'include'
      })
      if (response.status === 401) {
        router.push('/login')
        return
      }
      if (response.ok) {
        const data: PaginatedResponse = await response.json()
        setCards(data.cards)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error al obtener fichas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleTagFilter = (tag: string | null) => {
    setSelectedTag(tag)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const stats = [
    {
      title: "Fichas Creadas",
      value: pagination.total,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Estudiando Hoy",
      value: Math.ceil(pagination.total * 0.3),
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Progreso Semanal",
      value: Math.ceil(pagination.total * 0.7),
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900"
    }
  ]

  return (
    <div className="min-h-screen">
      <Navigation
        onSearch={handleSearch}
        onTagFilter={handleTagFilter}
        searchQuery={searchQuery}
        selectedTag={selectedTag}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {pagination.total === 0 && !loading && !searchQuery && !selectedTag && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                  <Brain className="h-12 w-12 text-white" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Transforma tu aprendizaje con{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IA inteligente
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
              >
                Crea fichas de estudio interactivas y personalizables desde cualquier tema. 
                Cuatro niveles de profundidad para un aprendizaje adaptativo y efectivo.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/create">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Crear Primera Ficha
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Ver Demo
                </Button>
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid md:grid-cols-3 gap-6 mt-16"
            >
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>IA Avanzada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Genera contenido educativo estructurado en 4 niveles de profundidad adaptados a tu estilo.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Aprendizaje Adaptativo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Sistema de repaso inteligente que se adapta a tu progreso y dificultades específicas.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Completamente Local</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Funciona 100% en tu dispositivo. Tus datos permanecen privados y seguros siempre.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Stats and Content */}
        {(pagination.total > 0 || loading || searchQuery || selectedTag) && (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                      <CardContent className="flex items-center p-6">
                        <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {stat.value}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Content */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {searchQuery ? `Resultados para "${searchQuery}"` : selectedTag ? `Fichas: ${selectedTag}` : 'Mis Fichas'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {pagination.total} ficha{pagination.total !== 1 ? 's' : ''} encontrada{pagination.total !== 1 ? 's' : ''}
                </p>
              </div>
              <Link href="/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Ficha
                </Button>
              </Link>
            </div>

            {/* Cards Grid */}
            {loading ? (
              <LoadingSpinner />
            ) : cards.length > 0 ? (
              <CardGrid cards={cards} />
            ) : (
              <EmptyState
                searchQuery={searchQuery}
                selectedTag={selectedTag}
                onClearFilters={() => {
                  setSearchQuery('')
                  setSelectedTag(null)
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
