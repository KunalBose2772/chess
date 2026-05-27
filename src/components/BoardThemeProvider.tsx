'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface BoardTheme {
  id: string
  name: string
  light: string
  dark: string
  accent: string
  description: string
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'classic',
    name: 'Emerald Royal',
    light: '#ECECD7',
    dark: '#4B5320',
    accent: '#10B981',
    description: 'Deep forest emerald paired with warm alabaster cream, standard in top grandmaster tournaments.',
  },
  {
    id: 'sapphire',
    name: 'Midnight Sapphire',
    light: '#EFF6FF',
    dark: '#1E3A8A',
    accent: '#3B82F6',
    description: 'Crisp arctic ice against rich deep-sea sapphire. Modern, highly-contrasting, and tech-forward.',
  },
  {
    id: 'mahogany',
    name: 'Mahogany Heritage',
    light: '#F5DEB3',
    dark: '#6E260E',
    accent: '#F59E0B',
    description: 'Polished mahogany wood with sun-bleached maple, bringing the texture and warmth of physical luxury sets.',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Onyx',
    light: '#94A3B8',
    dark: '#1E293B',
    accent: '#F43F5E',
    description: 'Stealth obsidian grey matched with satin titanium. Elegant, easy on the eyes for late-night sessions.',
  },
  {
    id: 'sakura',
    name: 'Blossom Sakura',
    light: '#FDF2F8',
    dark: '#DB2777',
    accent: '#F43F5E',
    description: 'Romantic cherry blossom pink paired with deep crimson rose. Vibrant, warm, and highly artistic.',
  },
  {
    id: 'dunes',
    name: 'Desert Dunes',
    light: '#FDF6E2',
    dark: '#B45309',
    accent: '#D97706',
    description: 'Sun-drenched Sahara sand alongside rich terracotta clay. Warm, relaxing, and organic.',
  },
  {
    id: 'nebula',
    name: 'Amethyst Nebula',
    light: '#F5F3FF',
    dark: '#5B21B6',
    accent: '#A78BFA',
    description: 'Lilac mist overlaying deep interstellar violet. Perfect for players who love cosmic, high-concept visual themes.',
  },
  {
    id: 'monochrome',
    name: 'Monochrome Luxury',
    light: '#F8FAFC',
    dark: '#0F172A',
    accent: '#64748B',
    description: 'High-contrast platinum white and carbon graphite. Clean, sharp, and hyper-modern.',
  }
]

type BoardThemeContextType = {
  boardTheme: BoardTheme
  setBoardThemeById: (id: string) => void
}

const BoardThemeContext = createContext<BoardThemeContextType | undefined>(undefined)

export function BoardThemeProvider({ children }: { children: React.ReactNode }) {
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(BOARD_THEMES[0])

  useEffect(() => {
    const savedThemeId = localStorage.getItem('boardThemeId')
    if (savedThemeId) {
      // Map old theme IDs to new IDs if needed
      let mappedId = savedThemeId
      if (savedThemeId === 'wood') mappedId = 'mahogany'
      if (savedThemeId === 'blue') mappedId = 'sapphire'
      if (savedThemeId === 'pink') mappedId = 'sakura'

      const found = BOARD_THEMES.find((t) => t.id === mappedId)
      if (found) {
        setBoardTheme(found)
      }
    }
  }, [])

  const setBoardThemeById = (id: string) => {
    // Map old theme IDs if they ever show up
    let mappedId = id
    if (id === 'wood') mappedId = 'mahogany'
    if (id === 'blue') mappedId = 'sapphire'
    if (id === 'pink') mappedId = 'sakura'

    const found = BOARD_THEMES.find((t) => t.id === mappedId)
    if (found) {
      setBoardTheme(found)
      localStorage.setItem('boardThemeId', found.id)
    }
  }

  return (
    <BoardThemeContext.Provider value={{ boardTheme, setBoardThemeById }}>
      {children}
    </BoardThemeContext.Provider>
  )
}

export const useBoardTheme = () => {
  const context = useContext(BoardThemeContext)
  if (context === undefined) {
    throw new Error('useBoardTheme must be used within a BoardThemeProvider')
  }
  return context
}
