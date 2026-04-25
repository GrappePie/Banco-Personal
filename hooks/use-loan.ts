'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Loan, PaymentMonth } from '@/lib/loan-types'
import { loadLoans, saveLoans, createDefaultLoan } from '@/lib/loan-storage'
import { recalculatePayments, generateId, sanitizeNumber } from '@/lib/loan-calculations'

export function useLoan() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [activeLoanId, setActiveLoanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load loans on mount
  useEffect(() => {
    const storedLoans = loadLoans()
    if (storedLoans.length === 0) {
      const defaultLoan = createDefaultLoan()
      setLoans([defaultLoan])
      setActiveLoanId(defaultLoan.id)
      saveLoans([defaultLoan])
    } else {
      setLoans(storedLoans)
      setActiveLoanId(storedLoans[0].id)
    }
    setIsLoading(false)
  }, [])

  // Get active loan
  const activeLoan = loans.find(l => l.id === activeLoanId) || null

  // Create new loan
  const createLoan = useCallback((loanData: Omit<Loan, 'id' | 'createdAt' | 'payments'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      payments: [],
    }
    newLoan.payments = recalculatePayments(newLoan)
    
    const updatedLoans = [...loans, newLoan]
    setLoans(updatedLoans)
    setActiveLoanId(newLoan.id)
    saveLoans(updatedLoans)
    
    return newLoan
  }, [loans])

  // Update loan
  const updateLoan = useCallback((updatedLoan: Loan) => {
    const updatedLoans = loans.map(l => 
      l.id === updatedLoan.id ? updatedLoan : l
    )
    setLoans(updatedLoans)
    saveLoans(updatedLoans)
  }, [loans])

  // Delete loan
  const deleteLoan = useCallback((loanId: string) => {
    const updatedLoans = loans.filter(l => l.id !== loanId)
    setLoans(updatedLoans)
    saveLoans(updatedLoans)
    
    if (activeLoanId === loanId) {
      setActiveLoanId(updatedLoans[0]?.id || null)
    }
  }, [loans, activeLoanId])

  // Register payment
  const registerPayment = useCallback((monthIndex: number, amount: number) => {
    if (!activeLoan) return

    const sanitizedAmount = sanitizeNumber(amount)
    const updatedPayments = [...activeLoan.payments]
    const payment = updatedPayments[monthIndex]

    if (payment) {
      payment.amountPaid = sanitizedAmount
      payment.paidAt = new Date().toISOString()

      if (sanitizedAmount >= payment.totalDue) {
        payment.status = 'pagado'
        payment.balanceAfterPayment = 0
      } else if (sanitizedAmount > 0) {
        payment.status = 'parcial'
        payment.balanceAfterPayment = payment.totalDue - sanitizedAmount
      } else {
        payment.status = 'pendiente'
        payment.balanceAfterPayment = 0
      }
    }

    const updatedLoan = {
      ...activeLoan,
      payments: updatedPayments,
    }

    // Recalculate all payments to handle carry-over
    updatedLoan.payments = recalculatePayments(updatedLoan)

    updateLoan(updatedLoan)
  }, [activeLoan, updateLoan])

  // Pay full amount
  const payFull = useCallback((monthIndex: number) => {
    if (!activeLoan) return
    const payment = activeLoan.payments[monthIndex]
    if (payment) {
      registerPayment(monthIndex, payment.totalDue)
    }
  }, [activeLoan, registerPayment])

  // Reset all payments
  const resetPayments = useCallback(() => {
    if (!activeLoan) return

    const resetLoan: Loan = {
      ...activeLoan,
      payments: activeLoan.payments.map(p => ({
        ...p,
        amountPaid: 0,
        balanceAfterPayment: 0,
        status: 'pendiente' as const,
        paidAt: undefined,
      })),
    }

    resetLoan.payments = recalculatePayments(resetLoan)
    updateLoan(resetLoan)
  }, [activeLoan, updateLoan])

  return {
    loans,
    activeLoan,
    activeLoanId,
    isLoading,
    setActiveLoanId,
    createLoan,
    updateLoan,
    deleteLoan,
    registerPayment,
    payFull,
    resetPayments,
  }
}
