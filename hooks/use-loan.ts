'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Loan } from '@/lib/loan-types'
import { loadLoans, saveLoans } from '@/lib/loan-storage'
import { recalculatePayments, generateId, sanitizeNumber } from '@/lib/loan-calculations'

export function useLoan() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [activeLoanId, setActiveLoanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedLoans = loadLoans()
    setLoans(storedLoans)
    setActiveLoanId(storedLoans[0]?.id ?? null)
    setIsLoading(false)
  }, [])

  const activeLoan = loans.find(l => l.id === activeLoanId) || null

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

  const updateLoan = useCallback((updatedLoan: Loan, recalculate = true) => {
    const finalLoan = recalculate 
      ? { ...updatedLoan, payments: recalculatePayments(updatedLoan) }
      : updatedLoan
    
    const updatedLoans = loans.map(l => 
      l.id === finalLoan.id ? finalLoan : l
    )
    setLoans(updatedLoans)
    saveLoans(updatedLoans)
  }, [loans])

  const deleteLoan = useCallback((loanId: string) => {
    const updatedLoans = loans.filter(l => l.id !== loanId)
    setLoans(updatedLoans)
    saveLoans(updatedLoans)
    
    if (activeLoanId === loanId) {
      setActiveLoanId(updatedLoans[0]?.id || null)
    }
  }, [loans, activeLoanId])

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

    updatedLoan.payments = recalculatePayments(updatedLoan)

    updateLoan(updatedLoan, false)
  }, [activeLoan, updateLoan])

  const payFull = useCallback((monthIndex: number) => {
    if (!activeLoan) return
    const payment = activeLoan.payments[monthIndex]
    if (payment) {
      registerPayment(monthIndex, payment.totalDue)
    }
  }, [activeLoan, registerPayment])

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
    updateLoan(resetLoan, false)
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
