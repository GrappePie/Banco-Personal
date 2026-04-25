import { useCurrencyConversion } from '@/hooks/use-currency-conversion'
import { useI18n } from '@/src/i18n/i18n-provider'
import { formatMoney } from '@/src/currency/currency'

export function useLocalizedCurrency() {
  const { countryCode, language } = useI18n()
  const currencyConversion = useCurrencyConversion(countryCode)

  const activeCurrency = currencyConversion.rate
    ? currencyConversion.targetCurrency
    : currencyConversion.baseCurrency

  const formatCurrency = (amountInMxn: number) => {
    const convertedAmount = currencyConversion.convertFromMxn(amountInMxn) ?? amountInMxn

    return formatMoney(convertedAmount, activeCurrency, language)
  }

  const convertFromMxn = (amountInMxn: number) => {
    return currencyConversion.convertFromMxn(amountInMxn) ?? amountInMxn
  }

  const convertToMxn = (amountInActiveCurrency: number) => {
    if (!currencyConversion.rate) {
      return amountInActiveCurrency
    }

    return amountInActiveCurrency / currencyConversion.rate
  }

  return {
    ...currencyConversion,
    activeCurrency,
    formatCurrency,
    convertFromMxn,
    convertToMxn,
  }
}
