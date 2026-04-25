export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  AR: 'ARS',
  AU: 'AUD',
  BR: 'BRL',
  CA: 'CAD',
  CH: 'CHF',
  CL: 'CLP',
  CN: 'CNY',
  CO: 'COP',
  CZ: 'CZK',
  DK: 'DKK',
  ES: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  GB: 'GBP',
  HK: 'HKD',
  HU: 'HUF',
  ID: 'IDR',
  IL: 'ILS',
  IN: 'INR',
  IS: 'ISK',
  JP: 'JPY',
  KR: 'KRW',
  MD: 'MDL',
  MX: 'MXN',
  MY: 'MYR',
  NO: 'NOK',
  NZ: 'NZD',
  PE: 'PEN',
  PH: 'PHP',
  PL: 'PLN',
  RO: 'RON',
  RU: 'RUB',
  SE: 'SEK',
  SG: 'SGD',
  TH: 'THB',
  TR: 'TRY',
  US: 'USD',
  ZA: 'ZAR'
}

const MONEY_NUMBER_FORMAT_LOCALE = 'en-US'

export function getCurrencyForCountry(countryCode?: string) {
  if (!countryCode) {
    return 'MXN'
  }

  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? 'USD'
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(MONEY_NUMBER_FORMAT_LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString(MONEY_NUMBER_FORMAT_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}
