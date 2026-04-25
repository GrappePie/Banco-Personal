import { useEffect, useMemo, useState } from 'react'

type IpApiResponse = {
  country_name?: string
  country_code?: string
  languages?: string
}

export type IpLocaleInfo = {
  countryName: string
  countryCode?: string
  languageNames: string[]
  localeCode: string
  source: 'ip' | 'browser' | 'fallback'
}

const DEFAULT_LOCALE = 'es-MX'
const DEFAULT_COUNTRY = 'Desconocido'

function getBrowserLocale() {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE
  }

  return navigator.languages?.[0] ?? navigator.language ?? DEFAULT_LOCALE
}

function getLanguageName(localeCode: string, displayLocale = 'es-MX') {
  try {
    const languageCode = localeCode.split('-')[0]
    const displayNames = new Intl.DisplayNames([displayLocale], { type: 'language' })
    const languageName = displayNames.of(languageCode)

    if (!languageName) {
      return localeCode
    }

    return languageName.charAt(0).toUpperCase() + languageName.slice(1)
  } catch {
    return localeCode
  }
}

function parseLanguageCodes(languages?: string) {
  return languages
    ?.split(',')
    .map((language) => language.trim())
    .filter(Boolean) ?? []
}

function buildBrowserFallback(): IpLocaleInfo {
  const localeCode = getBrowserLocale()

  return {
    countryName: DEFAULT_COUNTRY,
    languageNames: [getLanguageName(localeCode)],
    localeCode,
    source: 'browser',
  }
}

export function useIpLocale() {
  const [localeInfo, setLocaleInfo] = useState<IpLocaleInfo>(() => buildBrowserFallback())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function detectLocale() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('https://ipapi.co/json/', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('No se pudo obtener la ubicación por IP')
        }

        const data = (await response.json()) as IpApiResponse
        const browserLocale = getBrowserLocale()
        const languageCodes = parseLanguageCodes(data.languages)
        const languageNames = languageCodes.length > 0
          ? languageCodes.slice(0, 3).map((languageCode) => getLanguageName(languageCode, browserLocale))
          : [getLanguageName(browserLocale)]

        setLocaleInfo({
          countryName: data.country_name ?? DEFAULT_COUNTRY,
          countryCode: data.country_code,
          languageNames,
          localeCode: languageCodes[0] ?? browserLocale,
          source: 'ip',
        })
      } catch (unknownError) {
        if (controller.signal.aborted) {
          return
        }

        setLocaleInfo(buildBrowserFallback())
        setError(unknownError instanceof Error ? unknownError.message : 'No se pudo detectar la ubicación')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    detectLocale()

    return () => controller.abort()
  }, [])

  const primaryLanguage = useMemo(
    () => localeInfo.languageNames[0] ?? getLanguageName(localeInfo.localeCode),
    [localeInfo.languageNames, localeInfo.localeCode],
  )

  return {
    localeInfo,
    primaryLanguage,
    isLoading,
    error,
  }
}
