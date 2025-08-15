
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET - Obtener etiqueta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { cards: true }
        }
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Etiqueta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(tag)

  } catch (error) {
    console.error('Error al obtener etiqueta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar etiqueta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una etiqueta con ese nombre (excluyendo la actual)
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        NOT: {
          id: params.id
        }
      }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Ya existe una etiqueta con ese nombre' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name,
        color: color || '#3B82F6'
      },
      include: {
        _count: {
          select: { cards: true }
        }
      }
    })

    return NextResponse.json(tag)

  } catch (error) {
    console.error('Error al actualizar etiqueta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar etiqueta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si la etiqueta está siendo usada
    const tagWithCount = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { cards: true }
        }
      }
    })

    if (!tagWithCount) {
      return NextResponse.json(
        { error: 'Etiqueta no encontrada' },
        { status: 404 }
      )
    }

    if (tagWithCount._count.cards > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una etiqueta que está siendo usada' },
        { status: 400 }
      )
    }

    await prisma.tag.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error al eliminar etiqueta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
