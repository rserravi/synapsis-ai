
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Target, 
  BookOpen, 
  Microscope, 
  HelpCircle,
  Play,
  Edit,
  Share2,
  Bookmark,
  Tag,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
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

interface CardViewerProps {
  card: CardData
}

export function CardViewer({ card }: CardViewerProps) {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [showQuestions, setShowQuestions] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const levels = [
    {
      id: 1,
      name: 'Concepto Clave',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: 'La idea principal y más concisa',
      content: card.level1
    },
    {
      id: 2,
      name: 'Resumen Esencial',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
      description: 'Los puntos clave fundamentales',
      content: card.level2
    },
    {
      id: 3,
      name: 'Resumen Detallado',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      borderColor: 'border-purple-200 dark:border-purple-800',
      description: 'Explicación completa del concepto',
      content: card.level3
    },
    {
      id: 4,
      name: 'Análisis Extenso',
      icon: Microscope,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      borderColor: 'border-orange-200 dark:border-orange-800',
      description: 'Análisis profundo con ejemplos y contexto',
      content: card.level4
    }
  ]

  const currentLevelData = levels[currentLevel - 1]
  const progressPercentage = (currentLevel / levels.length) * 100

  const nextLevel = () => {
    if (currentLevel < 4) {
      setCurrentLevel(currentLevel + 1)
    } else {
      setShowQuestions(true)
    }
  }

  const prevLevel = () => {
    if (showQuestions) {
      setShowQuestions(false)
    } else if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1)
    }
  }

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.title,
          text: card.level1,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl mb-4">
                  {card.title}
                </CardTitle>
                
                {/* Tags */}
                {card.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {card.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="flex items-center space-x-1"
                        style={{
                          borderColor: tag.color,
                          color: tag.color
                        }}
                      >
                        <Tag className="h-3 w-3" />
                        <span>{tag.name}</span>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Creada {formatDistanceToNow(new Date(card.createdAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HelpCircle className="h-4 w-4" />
                    <span>{card.questions?.length || 0} preguntas</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={shareCard}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Link href={`/cards/${card.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/study?card=${card.id}`}>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Play className="h-4 w-4 mr-2" />
                    Estudiar
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {showQuestions ? 'Autoevaluación' : `Nivel ${currentLevel} de 4`}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <Progress value={showQuestions ? 100 : progressPercentage} className="h-2" />
      </motion.div>

      {/* Content */}
      <motion.div
        key={showQuestions ? 'questions' : currentLevel}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        {showQuestions ? (
          /* Questions Section */
          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                <HelpCircle className="h-6 w-6" />
                <span>Preguntas de Autoevaluación</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {card.questions?.length > 0 ? (
                <div className="space-y-4">
                  {card.questions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <p className="flex-1 text-slate-700 dark:text-slate-300 font-medium">
                          {question}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-amber-700 dark:text-amber-300 text-center py-8">
                  No hay preguntas disponibles para esta ficha.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Level Content */
          <Card className={`${currentLevelData.bgColor} ${currentLevelData.borderColor} border-2`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm`}>
                  <currentLevelData.icon className={`h-6 w-6 ${currentLevelData.color}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${currentLevelData.color}`}>
                    {currentLevelData.name}
                  </h2>
                  <p className={`text-sm ${currentLevelData.color} opacity-75`}>
                    {currentLevelData.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentLevelData.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex justify-between items-center"
      >
        <Button
          variant="outline"
          onClick={prevLevel}
          disabled={currentLevel === 1 && !showQuestions}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
          {showQuestions ? (
            <span>Autoevaluación completada</span>
          ) : (
            <span>
              Nivel {currentLevel} de 4
            </span>
          )}
        </div>

        <Button
          onClick={nextLevel}
          disabled={showQuestions}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {currentLevel === 4 ? 'Ver Preguntas' : 'Siguiente'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}
