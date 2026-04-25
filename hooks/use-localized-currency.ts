import { useCurrencyConversion } from '@/hooks/use-currency-conversion'
import { useI18n } from '@/src/i18n/i18n-provider'
import { formatMoney } from '@/src/currency/currency'

export function useLocalizedCurrency() {
  const { countryCode, language } = useI18n()
  const currencyConversion = useCurrencyConversion(countryCode)

  const formatCurrency = (amountInMxn: number) => {
    const convertedAmount = currencyConversion.convertFromMxn(amountInMxn) ?? amountInMxn
    const currency = currencyConversion.rate
      ? currencyConversion.targetCurrency
      : currencyConversion.baseCurrency

    return formatMoney(convertedAmount, currency, language)
  }

  return {
    ...currencyConversion,
    formatCurrency,
  }
}
