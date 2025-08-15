
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Target, 
  BookOpen, 
  Microscope, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
  Tag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

interface StudyViewerProps {
  card: CardData
  onNext: () => void
  onPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
  currentIndex: number
  totalCards: number
}

export function StudyViewer({ 
  card, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious,
  currentIndex,
  totalCards 
}: StudyViewerProps) {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyPhase, setStudyPhase] = useState<'concept' | 'question'>('concept')

  const levels = [
    {
      id: 1,
      name: 'Concepto Clave',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
      content: card.level1
    },
    {
      id: 2,
      name: 'Resumen Esencial',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
      content: card.level2
    },
    {
      id: 3,
      name: 'Resumen Detallado',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
      content: card.level3
    },
    {
      id: 4,
      name: 'Análisis Extenso',
      icon: Microscope,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
      content: card.level4
    }
  ]

  const currentLevelData = levels[currentLevel - 1]
  const progressPercentage = (currentLevel / levels.length) * 100

  const nextLevel = () => {
    if (currentLevel < 4) {
      setCurrentLevel(currentLevel + 1)
      setShowAnswer(false)
    } else {
      setStudyPhase('question')
      setShowAnswer(false)
    }
  }

  const prevLevel = () => {
    if (studyPhase === 'question') {
      setStudyPhase('concept')
      setCurrentLevel(4)
    } else if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1)
      setShowAnswer(false)
    }
  }

  const resetCard = () => {
    setCurrentLevel(1)
    setStudyPhase('concept')
    setShowAnswer(false)
  }

  const nextCard = () => {
    resetCard()
    onNext()
  }

  const previousCard = () => {
    resetCard()
    onPrevious()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate">
            {card.title}
          </h2>
          <Button variant="outline" size="sm" onClick={resetCard}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Tags */}
        {card.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: tag.color,
                  color: tag.color
                }}
              >
                <Tag className="h-2 w-2 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {studyPhase === 'question' ? 'Autoevaluación' : `Nivel ${currentLevel} de 4`}
          </span>
          <span className="text-sm text-slate-500">
            {studyPhase === 'question' ? '100%' : `${Math.round(progressPercentage)}%`}
          </span>
        </div>
        <Progress 
          value={studyPhase === 'question' ? 100 : progressPercentage} 
          className="h-2" 
        />
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={studyPhase === 'question' ? 'questions' : currentLevel}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[500px]"
        >
          {studyPhase === 'question' ? (
            /* Questions Phase */
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                  <HelpCircle className="h-6 w-6" />
                  <span>¿Cuánto has aprendido?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {card.questions?.length > 0 ? (
                  <div className="space-y-4">
                    {card.questions.map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <p className="flex-1 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {question}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: card.questions.length * 0.1 + 0.2 }}
                      className="mt-6 p-4 bg-amber-100 dark:bg-amber-900 rounded-lg text-center"
                    >
                      <p className="text-amber-800 dark:text-amber-200 font-medium">
                        💡 Reflexiona sobre estas preguntas para consolidar tu aprendizaje
                      </p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-amber-700 dark:text-amber-300">
                      No hay preguntas disponibles para esta ficha.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Level Content Phase */
            <Card className={`${currentLevelData.bgColor} shadow-xl border-0`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg">
                    <currentLevelData.icon className={`h-7 w-7 ${currentLevelData.color}`} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${currentLevelData.color}`}>
                      {currentLevelData.name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Nivel {currentLevel} de 4
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                      {currentLevelData.content}
                    </div>
                  </div>
                </div>

                {/* Study Controls */}
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                  >
                    {showAnswer ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Ocultar Detalles
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Más Detalles
                      </>
                    )}
                  </Button>
                </div>

                <AnimatePresence>
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-4"
                    >
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                        💡 Consejo: Asegúrate de comprender completamente este nivel antes de continuar al siguiente.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg"
      >
        {/* Previous Controls */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={previousCard}
            disabled={!hasPrevious}
            className="hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Ficha Anterior
          </Button>
          <Button
            variant="outline"
            onClick={prevLevel}
            disabled={currentLevel === 1 && studyPhase === 'concept'}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Atrás
          </Button>
        </div>

        {/* Card Counter */}
        <div className="text-center">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Ficha {currentIndex} de {totalCards}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {studyPhase === 'question' ? 'Autoevaluación' : `Nivel ${currentLevel}`}
          </div>
        </div>

        {/* Next Controls */}
        <div className="flex space-x-2">
          <Button
            onClick={studyPhase === 'question' ? nextCard : nextLevel}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {studyPhase === 'question' ? 'Siguiente Ficha' : 
             currentLevel === 4 ? 'Ver Preguntas' : 'Siguiente Nivel'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            onClick={nextCard}
            disabled={!hasNext}
            className="hidden sm:flex"
          >
            Saltar Ficha
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
