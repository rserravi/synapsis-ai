
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Obtener ficha específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const card = await prisma.card.findFirst({
      where: { id: params.id, userId },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Ficha no encontrada' },
        { status: 404 }
      )
    }

    const formattedCard = {
      ...card,
      tags: card.tags.map(ct => ct.tag)
    }

    return NextResponse.json(formattedCard)

  } catch (error) {
    console.error('Error al obtener ficha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar ficha
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { title, source, level1, level2, level3, level4, questions, tags } = data

    const existing = await prisma.card.findFirst({ where: { id: params.id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 })
    }

    // Eliminar etiquetas existentes
    await prisma.cardTag.deleteMany({
      where: { cardId: params.id }
    })

    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        title,
        source,
        level1,
        level2,
        level3,
        level4,
        questions: questions || [],
        tags: {
          create: tags?.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          })) || []
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    const formattedCard = {
      ...card,
      tags: card.tags.map(ct => ct.tag)
    }

    return NextResponse.json(formattedCard)

  } catch (error) {
    console.error('Error al actualizar ficha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar ficha
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const card = await prisma.card.findFirst({ where: { id: params.id, userId } })
    if (!card) {
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 })
    }

    await prisma.card.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error al eliminar ficha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
