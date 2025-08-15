
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET - Obtener todas las etiquetas
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { cards: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(tags)

  } catch (error) {
    console.error('Error al obtener etiquetas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva etiqueta
export async function POST(request: NextRequest) {
  try {
    const { name, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#3B82F6'
      }
    })

    return NextResponse.json(tag, { status: 201 })

  } catch (error) {
    console.error('Error al crear etiqueta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
