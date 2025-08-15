
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), 'uploads', fileName)
    const fileBuffer = await readFile(filePath)

    let messages: any[] = []

    if (fileType === 'application/pdf') {
      // Para PDF, enviar como base64 al LLM
      const base64String = fileBuffer.toString('base64')
      messages = [{
        role: "user",
        content: [{
          type: "file",
          file: {
            filename: fileName,
            file_data: `data:application/pdf;base64,${base64String}`
          }
        }, {
          type: "text",
          text: "Extrae todo el texto de este documento PDF y devuélvelo en formato texto plano."
        }]
      }]
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Para DOCX, usar mammoth para extraer texto
      const mammoth = require('mammoth')
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer })
        return NextResponse.json({
          success: true,
          extractedText: result.value
        })
      } catch (error) {
        // Si mammoth falla, usar LLM como fallback
        const base64String = fileBuffer.toString('base64')
        messages = [{
          role: "user",
          content: `Aquí hay un archivo DOCX en base64. Extrae todo el texto:
          
${base64String}`
        }]
      }
    } else {
      return NextResponse.json(
        { error: 'Tipo de archivo no soportado para procesamiento' },
        { status: 400 }
      )
    }

    // Procesar con LLM
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.statusText}`)
    }

    const result = await response.json()
    const extractedText = result.choices?.[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      extractedText
    })

  } catch (error) {
    console.error('Error al procesar archivo:', error)
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    )
  }
}
