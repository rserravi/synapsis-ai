
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se encontró archivo' },
        { status: 400 }
      )
    }

    // Validar tipos de archivo
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no soportado. Solo se permiten TXT, PDF y DOCX' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear directorio uploads si no existe
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.name)
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const filePath = path.join(uploadsDir, fileName)

    // Guardar archivo
    await writeFile(filePath, buffer)

    // Extraer texto según el tipo de archivo
    let extractedText = ''

    if (file.type === 'text/plain') {
      extractedText = buffer.toString('utf-8')
    } else if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Para PDF y DOCX, devolvemos la ruta del archivo para procesamiento posterior
      return NextResponse.json({
        success: true,
        fileName,
        fileType: file.type,
        filePath: `/uploads/${fileName}`,
        needsProcessing: true
      })
    }

    return NextResponse.json({
      success: true,
      fileName,
      fileType: file.type,
      extractedText
    })

  } catch (error) {
    console.error('Error al subir archivo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
