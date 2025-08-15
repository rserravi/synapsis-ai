
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Play,
  Eye 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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

interface CardGridProps {
  cards: CardData[]
}

export function CardGrid({ cards }: CardGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onHoverStart={() => setHoveredCard(card.id)}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <Card className={`h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer group ${
            hoveredCard === card.id ? 'ring-2 ring-blue-500' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Tags */}
              {card.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
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
                      {tag.name}
                    </Badge>
                  ))}
                  {card.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{card.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Concept Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Concepto Clave
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-200 line-clamp-2">
                  {card.level1}
                </p>
              </div>

              {/* Preview Points */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Puntos Clave
                </p>
                <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {card.level2?.split('\n').slice(0, 3).map((point, idx) => (
                    <div key={idx} className="text-xs">
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(card.updatedAt), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{card.questions?.length || 0} preguntas</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Link href={`/cards/${card.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full group-hover:border-blue-500 group-hover:text-blue-600">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </Link>
                <Link href={`/study?card=${card.id}`}>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Play className="h-4 w-4 mr-2" />
                    Estudiar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
