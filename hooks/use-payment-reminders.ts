import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Loan, PaymentMonth } from '@/lib/loan-types'

type ReminderPayment = {
  loanName: string
  payment: PaymentMonth
  daysUntilDue: number
}

type PermissionState = NotificationPermission | 'unsupported'

type ReminderText = {
  title: string
  body: string
}

const NOTIFIED_STORAGE_KEY = 'banco-personal.payment-reminders.notified'
const REMINDER_DAYS_BEFORE = 3
const CHECK_INTERVAL_MS = 60 * 60 * 1000

function getTodayAtStartOfDay() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function getDaysUntilDue(dateString: string) {
  const today = getTodayAtStartOfDay()
  const dueDate = new Date(dateString)
  dueDate.setHours(0, 0, 0, 0)

  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getReminderId(loanId: string, monthNumber: number, daysUntilDue: number) {
  const today = getTodayAtStartOfDay().toISOString().split('T')[0]
  return `${today}:${loanId}:${monthNumber}:${daysUntilDue}`
}

function getNotifiedIds() {
  if (typeof window === 'undefined') {
    return new Set<string>()
  }

  try {
    const value = window.localStorage.getItem(NOTIFIED_STORAGE_KEY)
    return new Set<string>(value ? JSON.parse(value) : [])
  } catch {
    return new Set<string>()
  }
}

function saveNotifiedIds(ids: Set<string>) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-200)))
}

function getUpcomingPayments(loans: Loan[]) {
  return loans.flatMap((loan) => {
    return loan.payments
      .filter((payment) => payment.status !== 'pagado')
      .map((payment) => ({
        loanId: loan.id,
        loanName: loan.name,
        payment,
        daysUntilDue: getDaysUntilDue(payment.estimatedDate),
      }))
      .filter(({ daysUntilDue }) => daysUntilDue >= 0 && daysUntilDue <= REMINDER_DAYS_BEFORE)
  })
}

export function usePaymentReminders(
  loans: Loan[],
  getReminderText: (reminderPayment: ReminderPayment) => ReminderText,
) {
  const [permission, setPermission] = useState<PermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }

    return Notification.permission
  })

  const upcomingPayments = useMemo(() => getUpcomingPayments(loans), [loans])

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported')
      return 'unsupported' as const
    }

    const nextPermission = await Notification.requestPermission()
    setPermission(nextPermission)
    return nextPermission
  }, [])

  const checkReminders = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const notifiedIds = getNotifiedIds()
    const reminders = getUpcomingPayments(loans)

    reminders.forEach(({ loanId, loanName, payment, daysUntilDue }) => {
      const reminderId = getReminderId(loanId, payment.monthNumber, daysUntilDue)

      if (notifiedIds.has(reminderId)) {
        return
      }

      const { title, body } = getReminderText({ loanName, payment, daysUntilDue })

      new Notification(title, {
        body,
        tag: reminderId,
        requireInteraction: daysUntilDue === 0,
      })

      notifiedIds.add(reminderId)
    })

    saveNotifiedIds(notifiedIds)
  }, [loans, getReminderText])

  useEffect(() => {
    checkReminders()
    const intervalId = window.setInterval(checkReminders, CHECK_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [checkReminders])

  return {
    permission,
    requestPermission,
    checkReminders,
    upcomingCount: upcomingPayments.length,
  }
}
