'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText } from 'lucide-react'
import type { Loan, InterestType } from '@/lib/loan-types'
import { getTodayDate, sanitizeNumber, sanitizeTermMonths, sanitizeInterestRate } from '@/lib/loan-calculations'
import { useI18n } from '@/src/i18n/i18n-provider'

interface LoanFormProps {
  onSubmit: (loan: Omit<Loan, 'id' | 'createdAt' | 'payments'>) => void
  onCancel?: () => void
  initialData?: Partial<Loan>
}

const TERM_OPTIONS = [1, 2, 3, 4, 5, 6, 9, 12]

export function LoanForm({ onSubmit, onCancel, initialData }: LoanFormProps) {
  const { t } = useI18n()
  const [name, setName] = useState(initialData?.name || '')
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '')
  const [termMonths, setTermMonths] = useState(initialData?.termMonths?.toString() || '4')
  const [customTerm, setCustomTerm] = useState('')
  const [useCustomTerm, setUseCustomTerm] = useState(false)
  const [monthlyInterestRate, setMonthlyInterestRate] = useState(initialData?.monthlyInterestRate?.toString() || '1.2')
  const [interestType, setInterestType] = useState<InterestType>(initialData?.interestType || 'flat')
  const [startDate, setStartDate] = useState(initialData?.startDate || getTodayDate())
  const [sourceAccount, setSourceAccount] = useState(initialData?.sourceAccount || '')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalTerm = useCustomTerm ? sanitizeTermMonths(customTerm) : sanitizeTermMonths(termMonths)

    onSubmit({
      name: name.trim() || t('form.defaultLoanName'),
      amount: sanitizeNumber(amount),
      termMonths: finalTerm,
      monthlyInterestRate: sanitizeInterestRate(monthlyInterestRate),
      interestType,
      startDate: startDate || getTodayDate(),
      sourceAccount: sourceAccount.trim() || t('form.defaultSourceAccount'),
      notes: notes.trim(),
    })
  }

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-400" />
          {initialData ? t('form.editTitle') : t('form.newTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">{t('form.loanName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.loanNamePlaceholder')}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">{t('form.amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="15650.11"
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">{t('form.term')}</Label>
            <div className="flex flex-wrap gap-2">
              {TERM_OPTIONS.map((term) => (
                <Button
                  key={term}
                  type="button"
                  variant={!useCustomTerm && termMonths === term.toString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTermMonths(term.toString())
                    setUseCustomTerm(false)
                  }}
                  className={!useCustomTerm && termMonths === term.toString() 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'border-border/50 hover:bg-muted'
                  }
                >
                  {term}
                </Button>
              ))}
              <Button
                type="button"
                variant={useCustomTerm ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseCustomTerm(true)}
                className={useCustomTerm 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'border-border/50 hover:bg-muted'
                }
              >
                {t('form.other')}
              </Button>
            </div>
            {useCustomTerm && (
              <Input
                type="number"
                min="1"
                value={customTerm}
                onChange={(e) => setCustomTerm(e.target.value)}
                placeholder={t('form.customTermPlaceholder')}
                className="bg-background/50 border-border/50 mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate" className="text-foreground">{t('form.monthlyInterestRate')}</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              min="0"
              value={monthlyInterestRate}
              onChange={(e) => setMonthlyInterestRate(e.target.value)}
              placeholder="1.2"
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">{t('form.interestType')}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={interestType === 'flat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInterestType('flat')}
                className={interestType === 'flat' 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white flex-1' 
                  : 'border-border/50 hover:bg-muted flex-1'
                }
              >
                {t('form.flat')}
              </Button>
              <Button
                type="button"
                variant={interestType === 'declining' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInterestType('declining')}
                className={interestType === 'declining' 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white flex-1' 
                  : 'border-border/50 hover:bg-muted flex-1'
                }
              >
                {t('form.declining')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {interestType === 'flat' 
                ? t('form.flatDescription')
                : t('form.decliningDescription')
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-foreground">{t('form.startDate')}</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account" className="text-foreground">{t('form.sourceAccount')}</Label>
            <Input
              id="account"
              value={sourceAccount}
              onChange={(e) => setSourceAccount(e.target.value)}
              placeholder={t('form.sourceAccountPlaceholder')}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">{t('form.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('form.notesPlaceholder')}
              rows={3}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {initialData ? t('form.saveChanges') : t('form.createLoan')}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="border-border/50 hover:bg-muted"
              >
                {t('form.cancel')}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
