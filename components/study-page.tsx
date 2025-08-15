
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { StudyViewer } from '@/components/study-viewer'
import { FullscreenStudyViewer } from '@/components/fullscreen-study-viewer'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Shuffle, Target, Maximize, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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

export function StudyPage() {
  const searchParams = useSearchParams()
  const [cards, setCards] = useState<CardData[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [studyMode, setStudyMode] = useState<'sequential' | 'random'>('sequential')
  const [viewMode, setViewMode] = useState<'normal' | 'fullscreen'>('normal')

  const cardIdParam = searchParams?.get('card')

  useEffect(() => {
    fetchCards()
  }, [cardIdParam])

  const fetchCards = async () => {
    try {
      setLoading(true)
      
      if (cardIdParam) {
        // Estudiar una ficha específica
        const response = await fetch(`/api/cards/${cardIdParam}`)
        if (response.ok) {
          const card = await response.json()
          setCards([card])
        }
      } else {
        // Estudiar todas las fichas
        const response = await fetch('/api/cards?limit=50')
        if (response.ok) {
          const data = await response.json()
          setCards(data.cards)
        }
      }
    } catch (error) {
      console.error('Error al obtener fichas:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextCard = () => {
    if (studyMode === 'random') {
      const randomIndex = Math.floor(Math.random() * cards.length)
      setCurrentCardIndex(randomIndex)
    } else {
      setCurrentCardIndex((prev) => (prev + 1) % cards.length)
    }
  }

  const prevCard = () => {
    if (studyMode === 'sequential') {
      setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length)
    } else {
      const randomIndex = Math.floor(Math.random() * cards.length)
      setCurrentCardIndex(randomIndex)
    }
  }

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentCardIndex(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" message="Cargando modo de estudio..." />
        </main>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  No hay fichas para estudiar
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Crea algunas fichas primero para comenzar a estudiar.
                </p>
                <div className="space-y-3">
                  <Link href="/create">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Crear Mi Primera Ficha
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver al Inicio
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    )
  }

  const currentCard = cards[currentCardIndex]

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
            <div className="flex items-center justify-between mb-4">
              <Link href="/">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Inicio
                </Button>
              </Link>
              
              <div className="flex space-x-2">
                <Button
                  variant={studyMode === 'sequential' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStudyMode('sequential')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Secuencial
                </Button>
                <Button
                  variant={studyMode === 'random' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStudyMode('random')}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Aleatorio
                </Button>
                <Button variant="outline" size="sm" onClick={shuffleCards}>
                  <Shuffle className="h-4 w-4" />
                </Button>
                <div className="border-l pl-2 ml-2">
                  <Button
                    variant={viewMode === 'fullscreen' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'fullscreen' ? 'normal' : 'fullscreen')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Maximize className="h-4 w-4 mr-2" />
                    Inmersivo
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Modo{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Estudio
                </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Ficha {currentCardIndex + 1} de {cards.length}
              </p>
            </div>
          </div>

          {/* Study Viewer */}
          {viewMode === 'fullscreen' ? (
            <FullscreenStudyViewer
              card={currentCard}
              onNext={nextCard}
              onPrevious={prevCard}
              hasNext={true}
              hasPrevious={studyMode === 'sequential'}
              currentIndex={currentCardIndex + 1}
              totalCards={cards.length}
              onExit={() => setViewMode('normal')}
            />
          ) : (
            <StudyViewer
              card={currentCard}
              onNext={nextCard}
              onPrevious={prevCard}
              hasNext={true}
              hasPrevious={studyMode === 'sequential'}
              currentIndex={currentCardIndex + 1}
              totalCards={cards.length}
            />
          )}
        </motion.div>
      </main>
    </div>
  )
}
