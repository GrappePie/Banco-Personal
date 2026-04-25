export type PaymentStatus = 'pendiente' | 'parcial' | 'pagado'
export type LoanStatus = 'pendiente' | 'parcial' | 'pagado'
export type InterestType = 'flat' | 'declining'

export interface PaymentMonth {
  monthNumber: number
  estimatedDate: string
  principal: number
  normalInterest: number
  previousBalance: number
  extraInterest: number
  totalDue: number
  amountPaid: number
  balanceAfterPayment: number
  status: PaymentStatus
  paidAt?: string
}

export interface Loan {
  id: string
  name: string
  amount: number
  termMonths: number
  monthlyInterestRate: number
  interestType: InterestType // 'flat' = fixed on original amount, 'declining' = on remaining balance
  startDate: string
  sourceAccount: string
  notes: string
  createdAt: string
  payments: PaymentMonth[]
}

export interface LoanSummary {
  totalBorrowed: number
  monthlyBasePayment: number
  totalProjected: number
  totalPaid: number
  normalInterestTotal: number
  extraInterestTotal: number
  pendingBalance: number
  status: LoanStatus
}
