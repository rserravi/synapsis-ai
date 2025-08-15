
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { 
  Brain, 
  Search, 
  Plus, 
  BookOpen, 
  Settings, 
  Tags,
  Home,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  name: string
  color: string
  _count: { cards: number }
}

interface NavigationProps {
  onSearch?: (query: string) => void
  onTagFilter?: (tag: string | null) => void
  searchQuery?: string
  selectedTag?: string | null
}

export function Navigation({ onSearch, onTagFilter, searchQuery = '', selectedTag = null }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags', { credentials: 'include' })
      if (response.status === 401) {
        logout()
        router.push('/login')
        return
      }
      if (response.ok) {
        const tagsData = await response.json()
        setTags(tagsData)
      }
    } catch (error) {
      console.error('Error al obtener etiquetas:', error)
    }
  }

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearch?.(value)
  }

  const handleTagClick = (tagName: string) => {
    const newSelectedTag = selectedTag === tagName ? null : tagName
    onTagFilter?.(newSelectedTag)
  }

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/create', label: 'Crear Ficha', icon: Plus },
    { href: '/study', label: 'Estudiar', icon: BookOpen },
  ]

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-200">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Synapsis AI
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fichas Inteligentes
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      isActive && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Search */}
        {(pathname === '/' || pathname?.startsWith('/cards')) && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar fichas..."
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        )}

        {user ? (
          <UserMenu user={user} onLogout={logout} />
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Tags Filter */}
        {(pathname === '/' || pathname?.startsWith('/cards')) && tags?.length > 0 && (
          <div className="pb-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2 mt-4 flex-wrap">
              <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                <Tags className="h-4 w-4" />
                <span>Filtrar:</span>
              </div>
              <Badge
                variant={selectedTag === null ? "default" : "outline"}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => onTagFilter?.(null)}
              >
                <Filter className="h-3 w-3 mr-1" />
                Todas ({tags.reduce((sum, tag) => sum + tag._count.cards, 0)})
              </Badge>
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTag === tag.name ? "default" : "outline"}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => handleTagClick(tag.name)}
                  style={{
                    backgroundColor: selectedTag === tag.name ? tag.color : undefined,
                    borderColor: tag.color,
                    color: selectedTag === tag.name ? 'white' : tag.color
                  }}
                >
                  {tag.name} ({tag._count.cards})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

interface UserMenuProps {
  user: { name?: string; email?: string }
  onLogout: () => void
}

function UserMenu({ user, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col gap-1 p-2">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>Cerrar sesión</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
