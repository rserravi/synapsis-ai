
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tags = searchParams.getAll('tags')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const dateRange = searchParams.get('dateRange') || 'all'
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

    // Filtrar por múltiples etiquetas
    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: tags, mode: 'insensitive' }
          }
        }
      }
    }

    // Filtrar por rango de fechas
    if (dateRange !== 'all') {
      const now = new Date()
      let dateFilter: Date

      switch (dateRange) {
        case 'today':
          dateFilter = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          dateFilter = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          dateFilter = new Date(0) // Fallback
      }

      where.updatedAt = {
        gte: dateFilter
      }
    }

    // Configurar ordenamiento
    let orderBy: any = {}
    if (sortBy === 'title' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.updatedAt = 'desc' // Fallback
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
        orderBy,
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
      },
      filters: {
        search,
        tags,
        sortBy,
        sortOrder,
        dateRange
      }
    })

  } catch (error) {
    console.error('Error en búsqueda avanzada:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
