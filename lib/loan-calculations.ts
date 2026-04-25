import type { Loan, PaymentMonth, LoanSummary, LoanStatus } from './loan-types'

// Sanitize numeric inputs
export function sanitizeNumber(value: number | string | undefined | null, min = 0): number {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (num === undefined || num === null || isNaN(num)) return min
  return Math.max(num, min)
}

// Sanitize term months
export function sanitizeTermMonths(value: number | string | undefined | null): number {
  const num = sanitizeNumber(value, 1)
  return Math.max(Math.floor(num), 1)
}

// Sanitize interest rate (can be 0)
export function sanitizeInterestRate(value: number | string | undefined | null): number {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (num === undefined || num === null || isNaN(num)) return 0
  return Math.max(num, 0)
}

// Format currency in MXN
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format percentage
export function formatPercentage(rate: number): string {
  return `${rate.toFixed(2)}%`
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Calculate monthly base payment (principal only, without interest)
export function calculateMonthlyPrincipal(amount: number, termMonths: number): number {
  const sanitizedAmount = sanitizeNumber(amount)
  const sanitizedTerm = sanitizeTermMonths(termMonths)
  return sanitizedAmount / sanitizedTerm
}

// Generate payment schedule
export function generatePaymentSchedule(loan: Loan): PaymentMonth[] {
  const amount = sanitizeNumber(loan.amount)
  const termMonths = sanitizeTermMonths(loan.termMonths)
  const monthlyRate = sanitizeInterestRate(loan.monthlyInterestRate) / 100

  const monthlyPrincipal = amount / termMonths
  const startDate = new Date(loan.startDate)
  
  const payments: PaymentMonth[] = []
  let carryOverBalance = 0
  let remainingPrincipal = amount // Track remaining principal for interest calculation

  for (let i = 0; i < termMonths; i++) {
    const paymentDate = new Date(startDate)
    paymentDate.setMonth(paymentDate.getMonth() + i + 1)

    // Interest is calculated on remaining principal, not on the monthly payment
    const normalInterest = remainingPrincipal * monthlyRate
    const extraInterest = carryOverBalance * monthlyRate
    const totalDue = monthlyPrincipal + normalInterest + carryOverBalance + extraInterest

    // Check if we have existing payment data
    const existingPayment = loan.payments?.[i]
    const amountPaid = existingPayment?.amountPaid ?? 0
    const status = existingPayment?.status ?? 'pendiente'
    const paidAt = existingPayment?.paidAt

    // Only calculate balance if payment was made (status is not pendiente for future months)
    let balanceAfterPayment = 0
    if (status !== 'pendiente' || amountPaid > 0) {
      balanceAfterPayment = Math.max(0, totalDue - amountPaid)
    }

    // Carry over balance only if there's an actual partial payment registered
    if (status === 'parcial' && balanceAfterPayment > 0) {
      carryOverBalance = balanceAfterPayment
    } else if (status === 'pagado') {
      carryOverBalance = 0
    }
    // For pending months, don't accumulate balance

    // Reduce remaining principal for next month's interest calculation
    remainingPrincipal -= monthlyPrincipal

    payments.push({
      monthNumber: i + 1,
      estimatedDate: paymentDate.toISOString().split('T')[0],
      principal: monthlyPrincipal,
      normalInterest,
      previousBalance: existingPayment?.previousBalance ?? (i === 0 ? 0 : carryOverBalance),
      extraInterest,
      totalDue,
      amountPaid,
      balanceAfterPayment,
      status,
      paidAt,
    })
  }

  return payments
}

// Recalculate payments with carry-over logic
export function recalculatePayments(loan: Loan): PaymentMonth[] {
  const amount = sanitizeNumber(loan.amount)
  const termMonths = sanitizeTermMonths(loan.termMonths)
  const monthlyRate = sanitizeInterestRate(loan.monthlyInterestRate) / 100

  const monthlyPrincipal = amount / termMonths
  const startDate = new Date(loan.startDate)
  
  const payments: PaymentMonth[] = []
  let carryOverBalance = 0
  let remainingPrincipal = amount // Track remaining principal for interest calculation

  for (let i = 0; i < termMonths; i++) {
    const paymentDate = new Date(startDate)
    paymentDate.setMonth(paymentDate.getMonth() + i + 1)

    const previousBalance = carryOverBalance
    // Interest is calculated on remaining principal, not on the monthly payment
    const normalInterest = remainingPrincipal * monthlyRate
    const extraInterest = previousBalance * monthlyRate
    const totalDue = monthlyPrincipal + normalInterest + previousBalance + extraInterest

    // Get existing payment data
    const existingPayment = loan.payments?.[i]
    const amountPaid = existingPayment?.amountPaid ?? 0
    const paidAt = existingPayment?.paidAt

    // Determine status and balance
    let status: PaymentMonth['status'] = 'pendiente'
    let balanceAfterPayment = 0

    if (amountPaid > 0) {
      if (amountPaid >= totalDue) {
        status = 'pagado'
        balanceAfterPayment = 0
        carryOverBalance = 0
      } else {
        status = 'parcial'
        balanceAfterPayment = totalDue - amountPaid
        carryOverBalance = balanceAfterPayment
      }
    } else {
      // No payment made - don't carry over to next months
      status = 'pendiente'
      balanceAfterPayment = 0
      carryOverBalance = 0
    }

    // Reduce remaining principal for next month's interest calculation
    remainingPrincipal -= monthlyPrincipal

    payments.push({
      monthNumber: i + 1,
      estimatedDate: paymentDate.toISOString().split('T')[0],
      principal: monthlyPrincipal,
      normalInterest,
      previousBalance,
      extraInterest,
      totalDue,
      amountPaid,
      balanceAfterPayment,
      status,
      paidAt,
    })
  }

  return payments
}

// Calculate loan summary
export function calculateLoanSummary(loan: Loan): LoanSummary {
  const amount = sanitizeNumber(loan.amount)
  const termMonths = sanitizeTermMonths(loan.termMonths)
  const monthlyRate = sanitizeInterestRate(loan.monthlyInterestRate) / 100

  const monthlyPrincipal = amount / termMonths
  // First month has highest interest (on full principal)
  const firstMonthInterest = amount * monthlyRate
  const baseMonthlyPayment = monthlyPrincipal + firstMonthInterest

  const payments = recalculatePayments(loan)

  let normalInterestTotal = 0
  let extraInterestTotal = 0
  let totalPaid = 0
  let pendingBalance = 0

  payments.forEach((payment) => {
    normalInterestTotal += payment.normalInterest
    extraInterestTotal += payment.extraInterest
    totalPaid += payment.amountPaid
    if (payment.status !== 'pagado') {
      pendingBalance += payment.totalDue - payment.amountPaid
    }
  })

  const totalProjected = amount + normalInterestTotal + extraInterestTotal

  // Determine overall loan status
  let status: LoanStatus = 'pendiente'
  const allPaid = payments.every(p => p.status === 'pagado')
  const somePaid = payments.some(p => p.status === 'pagado' || p.status === 'parcial')

  if (allPaid) {
    status = 'pagado'
  } else if (somePaid) {
    status = 'parcial'
  }

  return {
    totalBorrowed: amount,
    monthlyBasePayment: baseMonthlyPayment,
    totalProjected,
    totalPaid,
    normalInterestTotal,
    extraInterestTotal,
    pendingBalance,
    status,
  }
}

// Generate unique ID
export function generateId(): string {
  return `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}
