'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Loan } from '@/lib/loan-types'
import { formatCurrency, calculateLoanSummary } from '@/lib/loan-calculations'

interface LoanSelectorProps {
  loans: Loan[]
  activeLoanId: string | null
  onSelect: (loanId: string) => void
  onDelete: (loanId: string) => void
  onNew: () => void
}

export function LoanSelector({ loans, activeLoanId, onSelect, onDelete, onNew }: LoanSelectorProps) {
  if (loans.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No tienes préstamos registrados</p>
          <Button 
            onClick={onNew}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
          >
            Crear Primer Préstamo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {loans.map((loan) => {
        const summary = calculateLoanSummary(loan)
        const isActive = loan.id === activeLoanId
        
        return (
          <div key={loan.id} className="flex items-center gap-1">
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelect(loan.id)}
              className={isActive 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'border-border/50 hover:bg-muted'
              }
            >
              {loan.name}
              <span className="ml-2 text-xs opacity-70">
                {formatCurrency(summary.pendingBalance)}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`¿Eliminar el préstamo "${loan.name}"?`)) {
                  onDelete(loan.id)
                }
              }}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
            >
              ✕
            </Button>
          </div>
        )
      })}
      <Button
        variant="outline"
        size="sm"
        onClick={onNew}
        className="border-dashed border-border/50 hover:bg-muted"
      >
        + Nuevo
      </Button>
    </div>
  )
}
