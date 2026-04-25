import type { Loan } from './loan-types'
import { generateId, getTodayDate, recalculatePayments } from './loan-calculations'

const STORAGE_KEY = 'banco_personal_loans'

// Optional helper for manual testing only. It is not used automatically.
export function createDefaultLoan(): Loan {
  const loan: Loan = {
    id: generateId(),
    name: 'RTX 5070 TUF',
    amount: 15650.11,
    termMonths: 4,
    monthlyInterestRate: 1.2,
    startDate: getTodayDate(),
    sourceAccount: 'Revolut',
    notes: 'Préstamo para tarjeta gráfica',
    createdAt: new Date().toISOString(),
    payments: [],
  }

  loan.payments = recalculatePayments(loan)
  return loan
}

export function loadLoans(): Loan[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading loans:', error)
    return []
  }
}

export function saveLoans(loans: Loan[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))
  } catch (error) {
    console.error('Error saving loans:', error)
  }
}

export function addLoan(loan: Omit<Loan, 'id' | 'createdAt' | 'payments'>): Loan {
  const newLoan: Loan = {
    ...loan,
    id: generateId(),
    createdAt: new Date().toISOString(),
    payments: [],
  }
  
  newLoan.payments = recalculatePayments(newLoan)
  
  const loans = loadLoans()
  loans.push(newLoan)
  saveLoans(loans)
  
  return newLoan
}

export function updateLoan(updatedLoan: Loan): void {
  const loans = loadLoans()
  const index = loans.findIndex(l => l.id === updatedLoan.id)
  
  if (index !== -1) {
    loans[index] = updatedLoan
    saveLoans(loans)
  }
}

export function deleteLoan(loanId: string): void {
  const loans = loadLoans()
  const filtered = loans.filter(l => l.id !== loanId)
  saveLoans(filtered)
}

export function getLoan(loanId: string): Loan | undefined {
  const loans = loadLoans()
  return loans.find(l => l.id === loanId)
}
