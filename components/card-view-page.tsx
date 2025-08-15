
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { CardViewer } from '@/components/card-viewer'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface CardViewPageProps {
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

export function CardViewPage({ cardId }: CardViewPageProps) {
  const [card, setCard] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" message="Cargando ficha..." />
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
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No se pudo cargar la ficha solicitada. Es posible que haya sido eliminada.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
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
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Mis Fichas
              </Button>
            </Link>
          </div>

          <CardViewer card={card} />
        </motion.div>
      </main>
    </div>
  )
}
