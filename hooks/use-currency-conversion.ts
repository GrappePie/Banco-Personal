import { useEffect, useMemo, useState } from 'react'
import { getCurrencyForCountry } from '@/src/currency/currency'

type ExchangeRateResponse = {
  result?: string
  base_code?: string
  rates?: Record<string, number>
}

type CachedRate = {
  rate: number
  updatedAt: string
}

const BASE_CURRENCY = 'MXN'
const CACHE_PREFIX = 'banco-personal.exchange-rate'

function getCacheKey(targetCurrency: string) {
  return `${CACHE_PREFIX}.${BASE_CURRENCY}.${targetCurrency}`
}

function getCachedRate(targetCurrency: string): CachedRate | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const value = window.localStorage.getItem(getCacheKey(targetCurrency))
    return value ? JSON.parse(value) as CachedRate : null
  } catch {
    return null
  }
}

function setCachedRate(targetCurrency: string, cachedRate: CachedRate) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getCacheKey(targetCurrency), JSON.stringify(cachedRate))
}

export function useCurrencyConversion(countryCode?: string) {
  const targetCurrency = useMemo(() => getCurrencyForCountry(countryCode), [countryCode])
  const [rate, setRate] = useState<number | null>(() => {
    if (targetCurrency === BASE_CURRENCY) {
      return 1
    }

    return getCachedRate(targetCurrency)?.rate ?? null
  })
  const [updatedAt, setUpdatedAt] = useState<string | null>(() => {
    return getCachedRate(targetCurrency)?.updatedAt ?? null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadRate() {
      if (targetCurrency === BASE_CURRENCY) {
        setRate(1)
        setUpdatedAt(new Date().toISOString())
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Could not load exchange rates')
        }

        const data = await response.json() as ExchangeRateResponse
        const nextRate = data.rates?.[targetCurrency]

        if (!nextRate) {
          throw new Error(`Exchange rate not available for ${targetCurrency}`)
        }

        const cachedRate = {
          rate: nextRate,
          updatedAt: new Date().toISOString(),
        }

        setCachedRate(targetCurrency, cachedRate)
        setRate(nextRate)
        setUpdatedAt(cachedRate.updatedAt)
      } catch (unknownError) {
        if (controller.signal.aborted) {
          return
        }

        const cachedRate = getCachedRate(targetCurrency)

        if (cachedRate) {
          setRate(cachedRate.rate)
          setUpdatedAt(cachedRate.updatedAt)
        }

        setError(unknownError instanceof Error ? unknownError.message : 'Could not load exchange rates')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadRate()

    return () => controller.abort()
  }, [targetCurrency])

  const convertFromMxn = (amount: number) => {
    if (!rate) {
      return null
    }

    return amount * rate
  }

  return {
    baseCurrency: BASE_CURRENCY,
    targetCurrency,
    rate,
    updatedAt,
    isLoading,
    error,
    convertFromMxn,
  }
}
