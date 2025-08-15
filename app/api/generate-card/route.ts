
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { topic, sourceText, difficulty } = await request.json()

    if (!topic && !sourceText) {
      return NextResponse.json(
        { error: 'Se requiere un tema o texto fuente' },
        { status: 400 }
      )
    }

    const content = sourceText || topic
    const difficultyLevel = difficulty || 'medio'

    // Construir el prompt para la IA
    const systemPrompt = `Eres un experto en pedagogía y creación de material didáctico. Tu tarea es generar fichas de estudio estructuradas en 4 niveles de profundidad creciente.

ESTRUCTURA REQUERIDA:
1. Concepto Clave: Una frase concisa que capture la esencia (máximo 15 palabras)
2. Resumen Esencial: 3-5 puntos clave fundamentales (formato bullet points)
3. Resumen Detallado: Explicación profunda y completa (2-3 párrafos)
4. Análisis Extenso: Análisis exhaustivo con ejemplos, aplicaciones y contexto (4-5 párrafos)

ADEMÁS: Genera 3-5 preguntas de autoevaluación que ayuden a verificar la comprensión.

Responde ÚNICAMENTE en formato JSON con esta estructura:
{
  "title": "Título descriptivo de la ficha",
  "level1": "Concepto clave conciso",
  "level2": "• Punto clave 1\\n• Punto clave 2\\n• Punto clave 3",
  "level3": "Explicación detallada en párrafos",
  "level4": "Análisis extenso con ejemplos y contexto",
  "questions": ["¿Pregunta 1?", "¿Pregunta 2?", "¿Pregunta 3?"]
}

Adapta el nivel de complejidad para: ${difficultyLevel}`

    const userPrompt = `Crea una ficha de estudio sobre: ${content}`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        stream: true,
        max_tokens: 4000,
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.statusText}`)
    }

    let buffer = ''
    let partialRead = ''

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()

        try {
          while (true) {
            const result = await reader?.read()
            if (!result || result.done) break
            const { value } = result

            partialRead += decoder.decode(value, { stream: true })
            let lines = partialRead.split('\n')
            partialRead = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  try {
                    const finalResult = JSON.parse(buffer)
                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: finalResult
                    })
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  } catch (e) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      status: 'error',
                      message: 'Error al procesar la respuesta'
                    })}\n\n`))
                  }
                  return
                }
                try {
                  const parsed = JSON.parse(data)
                  buffer += parsed.choices?.[0]?.delta?.content || ''
                  
                  // Enviar progreso
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Generando ficha de estudio...'
                  })
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                } catch (e) {
                  // Ignorar JSON inválido
                }
              }
            }
          }
        } catch (error) {
          console.error('Error en el streaming:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'error',
            message: 'Error en la generación'
          })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error en generate-card:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
