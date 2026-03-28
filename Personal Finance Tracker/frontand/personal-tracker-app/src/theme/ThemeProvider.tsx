import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type AppTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: AppTheme
  isDarkMode: boolean
  setTheme: (theme: AppTheme) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'pft_app_theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return storedTheme === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => getInitialTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDarkMode: theme === 'dark',
      setTheme: (nextTheme) => setThemeState(nextTheme),
      toggleTheme: () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider.')
  }
  return context
}
