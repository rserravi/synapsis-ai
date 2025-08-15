
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Obtener todas las fichas con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    let where: any = {}

    // Búsqueda de texto completo
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { level1: { contains: search, mode: 'insensitive' } },
        { level2: { contains: search, mode: 'insensitive' } },
        { level3: { contains: search, mode: 'insensitive' } },
        { level4: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filtrar por etiqueta
    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: { equals: tag, mode: 'insensitive' }
          }
        }
      }
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.card.count({ where })
    ])

    // Formatear respuesta
    const formattedCards = cards.map(card => ({
      ...card,
      tags: card.tags.map(ct => ct.tag)
    }))

    return NextResponse.json({
      cards: formattedCards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error al obtener fichas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva ficha
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { title, source, level1, level2, level3, level4, questions, tags } = data

    if (!title || !level1 || !level2 || !level3 || !level4) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const card = await prisma.card.create({
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

    return NextResponse.json(formattedCard, { status: 201 })

  } catch (error) {
    console.error('Error al crear ficha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
