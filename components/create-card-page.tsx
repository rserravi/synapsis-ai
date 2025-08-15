
'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { CardCreator } from '@/components/card-creator'
import { CardPreview } from '@/components/card-preview'
import { motion } from 'framer-motion'

export function CreateCardPage() {
  const [generatedCard, setGeneratedCard] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Crear Nueva{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ficha de Estudio
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Introduce un tema, texto o sube un archivo. Nuestra IA creará una ficha estructurada 
              con cuatro niveles de profundidad para un aprendizaje efectivo.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Creator Panel */}
            <div>
              <CardCreator
                onCardGenerated={setGeneratedCard}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-24">
              <CardPreview
                card={generatedCard}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
