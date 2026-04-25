import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import es from '@/src/locales/es.json'
import en from '@/src/locales/en.json'
import ro from '@/src/locales/ro.json'
import ru from '@/src/locales/ru.json'
import { useIpLocale } from '@/hooks/use-ip-locale'

type LanguageCode = 'es' | 'en' | 'ro' | 'ru'
type TranslationValue = string | Record<string, TranslationValue>
type TranslationDictionary = Record<string, TranslationValue>

type I18nContextValue = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: string, params?: Record<string, string | number>) => string
  supportedLanguages: LanguageCode[]
  detectedLocaleCode: string
  countryCode?: string
  countryName: string
  primaryLanguage: string
  isLocaleLoading: boolean
}

const STORAGE_KEY = 'banco-personal.language'
const DEFAULT_LANGUAGE: LanguageCode = 'es'
const dictionaries: Record<LanguageCode, TranslationDictionary> = { es, en, ro, ru }
const supportedLanguages = Object.keys(dictionaries) as LanguageCode[]
const I18nContext = createContext<I18nContextValue | null>(null)

function normalizeLanguage(languageCode?: string): LanguageCode | null {
  const normalized = languageCode?.toLowerCase().split('-')[0]

  if (normalized && supportedLanguages.includes(normalized as LanguageCode)) {
    return normalized as LanguageCode
  }

  return null
}

function getStoredLanguage(): LanguageCode | null {
  if (typeof window === 'undefined') {
    return null
  }

  return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY) ?? undefined)
}

function getBrowserLanguage(): LanguageCode | null {
  if (typeof navigator === 'undefined') {
    return null
  }

  return normalizeLanguage(navigator.languages?.[0] ?? navigator.language)
}

function getDictionaryValue(dictionary: TranslationDictionary, key: string) {
  return key.split('.').reduce<TranslationValue | undefined>((currentValue, keyPart) => {
    if (!currentValue || typeof currentValue === 'string') {
      return undefined
    }

    return currentValue[keyPart]
  }, dictionary)
}

function interpolate(value: string, params?: Record<string, string | number>) {
  if (!params) {
    return value
  }

  return Object.entries(params).reduce(
    (text, [key, paramValue]) => text.replaceAll(`{{${key}}}`, String(paramValue)),
    value,
  )
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { localeInfo, primaryLanguage, isLoading: isLocaleLoading } = useIpLocale()
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return getStoredLanguage() ?? getBrowserLanguage() ?? DEFAULT_LANGUAGE
  })

  useEffect(() => {
    const storedLanguage = getStoredLanguage()

    if (storedLanguage || isLocaleLoading) {
      return
    }

    const detectedLanguage = normalizeLanguage(localeInfo.localeCode) ?? getBrowserLanguage()

    if (detectedLanguage) {
      setLanguageState(detectedLanguage)
    }
  }, [isLocaleLoading, localeInfo.localeCode])

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage)
    window.localStorage.setItem(STORAGE_KEY, nextLanguage)
  }

  const value = useMemo<I18nContextValue>(() => {
    const currentDictionary = dictionaries[language]
    const fallbackDictionary = dictionaries[DEFAULT_LANGUAGE]

    return {
      language,
      setLanguage,
      supportedLanguages,
      detectedLocaleCode: localeInfo.localeCode,
      countryCode: localeInfo.countryCode,
      countryName: localeInfo.countryName,
      primaryLanguage,
      isLocaleLoading,
      t: (key, params) => {
        const translatedValue = getDictionaryValue(currentDictionary, key)
        const fallbackValue = getDictionaryValue(fallbackDictionary, key)
        const value = typeof translatedValue === 'string'
          ? translatedValue
          : typeof fallbackValue === 'string'
            ? fallbackValue
            : key

        return interpolate(value, params)
      },
    }
  }, [language, localeInfo.countryCode, localeInfo.countryName, localeInfo.localeCode, primaryLanguage, isLocaleLoading])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider')
  }

  return context
}
