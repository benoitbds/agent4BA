import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import en from './messages/en.json'
import fr from './messages/fr.json'

type Locale = 'en' | 'fr'

type Messages = Record<string, string>

const dictionaries: Record<Locale, Messages> = {
  en,
  fr,
}

interface I18nContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''))
}

function detectLocale(): Locale {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.toLowerCase()
    if (lang.startsWith('fr')) return 'fr'
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale())

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const message = dictionaries[locale][key] ?? dictionaries.en[key] ?? key
      return interpolate(message, vars)
    }
  }, [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return ctx
}
