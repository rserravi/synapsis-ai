
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Edit, HelpCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

export function MarkdownEditor({ value, onChange, placeholder, height = "400px" }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState('edit')

  const insertText = (text: string, selectionOffset = 0) => {
    const textarea = document.activeElement as HTMLTextAreaElement
    if (textarea && textarea.tagName === 'TEXTAREA') {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + text + value.substring(end)
      onChange(newValue)
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + selectionOffset, start + selectionOffset)
      }, 0)
    } else {
      onChange(value + text)
    }
  }

  const formatButtons = [
    {
      label: 'Negrita',
      icon: 'B',
      action: () => insertText('**texto**', 2),
      className: 'font-bold'
    },
    {
      label: 'Cursiva',
      icon: 'I',
      action: () => insertText('*texto*', 1),
      className: 'italic'
    },
    {
      label: 'Título',
      icon: 'H1',
      action: () => insertText('# Título\n\n', 2),
      className: 'font-bold'
    },
    {
      label: 'Lista',
      icon: '•',
      action: () => insertText('- Elemento de lista\n- Otro elemento\n\n', 2),
      className: ''
    },
    {
      label: 'Código',
      icon: '</>',
      action: () => insertText('`código`', 1),
      className: 'font-mono text-xs'
    },
    {
      label: 'Enlace',
      icon: '🔗',
      action: () => insertText('[texto del enlace](https://ejemplo.com)', 1),
      className: ''
    }
  ]

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <TabsList className="h-8">
              <TabsTrigger value="edit" className="flex items-center space-x-1 text-xs">
                <Edit className="h-3 w-3" />
                <span>Editar</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center space-x-1 text-xs">
                <Eye className="h-3 w-3" />
                <span>Vista Previa</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === 'edit' && (
              <div className="flex items-center space-x-1">
                {formatButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 text-xs ${button.className}`}
                    onClick={button.action}
                    title={button.label}
                  >
                    {button.icon}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <TabsContent value="edit" className="m-0">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="border-0 resize-none focus:ring-0"
              style={{ height, minHeight: height }}
            />
          </TabsContent>

          <TabsContent value="preview" className="m-0">
            <div 
              className="p-4 prose prose-slate dark:prose-invert max-w-none overflow-auto"
              style={{ height, minHeight: height }}
            >
              {value ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Custom components for better styling
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-3 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 mb-3 space-y-1">
                        {children}
                      </ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400 mb-3">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className
                      if (isInline) {
                        return (
                          <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200">
                            {children}
                          </code>
                        )
                      }
                      return (
                        <code className={className}>
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto mb-3">
                        {children}
                      </pre>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-slate-900 dark:text-slate-100">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-slate-800 dark:text-slate-200">
                        {children}
                      </em>
                    ),
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <HelpCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">La vista previa aparecerá aquí</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
