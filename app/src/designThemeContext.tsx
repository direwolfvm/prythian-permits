/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type DesignTheme = "night" | "spring" | "summer" | "autumn" | "winter" | "day" | "dawn"

type DesignThemeContextValue = {
  designTheme: DesignTheme
  setDesignTheme: (theme: DesignTheme) => void
}

const STORAGE_KEY = "design-theme"
const DATA_ATTRIBUTE = "data-design-theme"

const VALID_THEMES = new Set<DesignTheme>(["night", "spring", "summer", "autumn", "winter", "day", "dawn"])

function getStoredDesignTheme(): DesignTheme {
  if (typeof window === "undefined") {
    return "night"
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY)
  if (storedValue && VALID_THEMES.has(storedValue as DesignTheme)) {
    return storedValue as DesignTheme
  }

  return "night"
}

function applyDesignTheme(theme: DesignTheme) {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.setAttribute(DATA_ATTRIBUTE, theme)
}

const DesignThemeContext = createContext<DesignThemeContextValue | undefined>(undefined)

export function DesignThemeProvider({ children }: { children: ReactNode }) {
  const [designTheme, setDesignTheme] = useState<DesignTheme>(() => {
    const storedTheme = getStoredDesignTheme()
    applyDesignTheme(storedTheme)
    return storedTheme
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, designTheme)
    }

    applyDesignTheme(designTheme)
  }, [designTheme])

  const value = useMemo(
    () => ({
      designTheme,
      setDesignTheme
    }),
    [designTheme]
  )

  return <DesignThemeContext.Provider value={value}>{children}</DesignThemeContext.Provider>
}

export function useDesignTheme() {
  const context = useContext(DesignThemeContext)
  if (!context) {
    throw new Error("useDesignTheme must be used within a DesignThemeProvider")
  }

  return context
}
