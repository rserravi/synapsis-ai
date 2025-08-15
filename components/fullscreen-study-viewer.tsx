
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  Tag,
  Maximize,
  Minimize,
  Play,
  Pause,
  Square,
  Timer,
  CheckCircle2,
  AlertTriangle
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

interface FullscreenStudyViewerProps {
  card: CardData
  onNext: () => void
  onPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
  currentIndex: number
  totalCards: number
  onExit?: () => void
}

export function FullscreenStudyViewer({ 
  card, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious,
  currentIndex,
  totalCards,
  onExit
}: FullscreenStudyViewerProps) {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [studyPhase, setStudyPhase] = useState<'concept' | 'question' | 'review'>('concept')
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [levelTimes, setLevelTimes] = useState<number[]>([0, 0, 0, 0])
  const [understanding, setUnderstanding] = useState<number | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  const levels = [
    {
      id: 1,
      name: 'Concepto Clave',
      icon: Brain,
      color: 'text-blue-600',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      content: card.level1,
      estimatedTime: 30 // seconds
    },
    {
      id: 2,
      name: 'Resumen Esencial',
      icon: Target,
      color: 'text-green-600',
      bgGradient: 'from-green-500/20 to-green-600/20',
      content: card.level2,
      estimatedTime: 60
    },
    {
      id: 3,
      name: 'Resumen Detallado',
      icon: BookOpen,
      color: 'text-purple-600',
      bgGradient: 'from-purple-500/20 to-purple-600/20',
      content: card.level3,
      estimatedTime: 120
    },
    {
      id: 4,
      name: 'Análisis Extenso',
      icon: Microscope,
      color: 'text-orange-600',
      bgGradient: 'from-orange-500/20 to-orange-600/20',
      content: card.level4,
      estimatedTime: 180
    }
  ]

  const currentLevelData = levels[currentLevel - 1]
  const progressPercentage = (currentLevel / levels.length) * 100

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
        setLevelTimes(prev => {
          const newTimes = [...prev]
          newTimes[currentLevel - 1] = newTimes[currentLevel - 1] + 1
          return newTimes
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, currentLevel])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextStep()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevStep()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        exitFullscreen()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        resetCard()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentLevel, studyPhase])

  // Auto advance effect
  useEffect(() => {
    if (autoAdvance && studyPhase === 'concept') {
      const timer = setTimeout(() => {
        nextStep()
      }, currentLevelData.estimatedTime * 1000)
      return () => clearTimeout(timer)
    }
  }, [autoAdvance, currentLevel, studyPhase])

  const nextStep = () => {
    if (studyPhase === 'review') {
      nextCard()
    } else if (studyPhase === 'question') {
      setStudyPhase('review')
    } else if (currentLevel < 4) {
      setCurrentLevel(currentLevel + 1)
    } else {
      setStudyPhase('question')
    }
  }

  const prevStep = () => {
    if (studyPhase === 'review') {
      setStudyPhase('question')
    } else if (studyPhase === 'question') {
      setStudyPhase('concept')
      setCurrentLevel(4)
    } else if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1)
    }
  }

  const resetCard = useCallback(() => {
    setCurrentLevel(1)
    setStudyPhase('concept')
    setTimeSpent(0)
    setLevelTimes([0, 0, 0, 0])
    setUnderstanding(null)
    setIsTimerRunning(true)
  }, [])

  const nextCard = () => {
    resetCard()
    onNext()
  }

  const previousCard = () => {
    resetCard()
    onPrevious()
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
    onExit?.()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getUnderstandingColor = (level: number) => {
    if (level <= 2) return 'text-red-600 bg-red-100'
    if (level <= 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getUnderstandingIcon = (level: number) => {
    if (level <= 2) return AlertTriangle
    if (level <= 3) return Eye
    return CheckCircle2
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Header Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Progress */}
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Ficha {currentIndex} / {totalCards}
              </div>
              <div className="w-32">
                <Progress 
                  value={studyPhase === 'review' ? 100 : progressPercentage} 
                  className="h-2" 
                />
              </div>
              <div className="text-sm text-slate-500">
                {studyPhase === 'review' ? 'Revisión' : `Nivel ${currentLevel}/4`}
              </div>
            </div>

            {/* Center: Timer */}
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-slate-500" />
              <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                {formatTime(timeSpent)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={autoAdvance ? 'bg-blue-100 text-blue-700' : ''}
              >
                Auto
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={exitFullscreen}>
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {card.title}
          </h1>
          
          {/* Tags */}
          {card.tags?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {card.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-sm"
                  style={{
                    borderColor: tag.color,
                    color: tag.color
                  }}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={studyPhase === 'review' ? 'review' : studyPhase === 'question' ? 'questions' : currentLevel}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[500px] flex items-center justify-center"
          >
            {studyPhase === 'review' ? (
              /* Review Phase */
              <Card className="w-full max-w-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                    ¡Ficha completada!
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                      <p className="font-medium text-green-700 dark:text-green-300">Tiempo total</p>
                      <p className="text-xl font-bold text-green-800 dark:text-green-200">
                        {formatTime(timeSpent)}
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                      <p className="font-medium text-green-700 dark:text-green-300">Niveles revisados</p>
                      <p className="text-xl font-bold text-green-800 dark:text-green-200">4/4</p>
                    </div>
                  </div>

                  {/* Understanding Rating */}
                  <div className="space-y-3">
                    <p className="font-medium text-green-700 dark:text-green-300">
                      ¿Cómo de bien entendiste el contenido?
                    </p>
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={understanding === rating ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUnderstanding(rating)}
                          className={`w-10 h-10 rounded-full ${
                            understanding === rating ? getUnderstandingColor(rating) : ''
                          }`}
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                    <div className="flex justify-center space-x-6 text-xs text-green-600 dark:text-green-400">
                      <span>😕 Confuso</span>
                      <span>🤔 Parcial</span>
                      <span>😊 Bien</span>
                      <span>🤓 Muy bien</span>
                      <span>🧠 Perfecto</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : studyPhase === 'question' ? (
              /* Questions Phase */
              <Card className="w-full max-w-4xl bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center mb-6">
                    <HelpCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                      Autoevaluación
                    </h2>
                    <p className="text-amber-700 dark:text-amber-300 mt-2">
                      Reflexiona sobre estas preguntas para consolidar tu aprendizaje
                    </p>
                  </div>

                  <div className="space-y-4">
                    {card.questions?.length > 0 ? (
                      card.questions.map((question, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <p className="flex-1 font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                              {question}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-amber-700 dark:text-amber-300">
                          No hay preguntas disponibles para esta ficha.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Level Content Phase */
              <Card className={`w-full max-w-4xl bg-gradient-to-br ${currentLevelData.bgGradient} backdrop-blur-sm shadow-2xl`}>
                <CardContent className="p-8">
                  {/* Level Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg mb-4">
                      <currentLevelData.icon className={`h-8 w-8 ${currentLevelData.color}`} />
                    </div>
                    <h2 className={`text-3xl font-bold ${currentLevelData.color} mb-2`}>
                      {currentLevelData.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Nivel {currentLevel} de 4 • Tiempo estimado: {Math.floor(currentLevelData.estimatedTime / 60)}:{(currentLevelData.estimatedTime % 60).toString().padStart(2, '0')}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {currentLevelData.content}
                      </div>
                    </div>
                  </div>

                  {/* Level Timer */}
                  <div className="mt-6 flex justify-center">
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg px-4 py-2 flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Tiempo en este nivel: {formatTime(levelTimes[currentLevel - 1])}
                      </span>
                    </div>
                  </div>
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
          className="flex justify-between items-center mt-8"
        >
          {/* Previous Controls */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={previousCard}
              disabled={!hasPrevious}
              size="lg"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Ficha Anterior
            </Button>
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentLevel === 1 && studyPhase === 'concept'}
              size="lg"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Atrás
            </Button>
            <Button
              variant="outline"
              onClick={resetCard}
              size="lg"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reiniciar
            </Button>
          </div>

          {/* Next Controls */}
          <div className="flex space-x-2">
            <Button
              onClick={nextStep}
              disabled={studyPhase === 'review' && !hasNext}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {studyPhase === 'review' ? (
                hasNext ? 'Siguiente Ficha' : 'Finalizar'
              ) : studyPhase === 'question' ? (
                'Completar'
              ) : currentLevel === 4 ? (
                'Ver Preguntas'
              ) : (
                'Siguiente Nivel'
              )}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={nextCard}
              disabled={!hasNext}
              size="lg"
            >
              Saltar Ficha
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400">
            <span>← → Navegar</span>
            <span>F Pantalla completa</span>
            <span>R Reiniciar</span>
            <span>ESC Salir</span>
            <span>Espacio Siguiente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
