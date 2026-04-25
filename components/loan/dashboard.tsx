'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Loan, LoanSummary } from '@/lib/loan-types'
import { calculateLoanSummary, formatCurrency, formatPercentage } from '@/lib/loan-calculations'

interface DashboardProps {
  loan: Loan
  onEdit?: () => void
}

function getStatusBadge(status: LoanSummary['status']) {
  switch (status) {
    case 'pagado':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Pagado</Badge>
    case 'parcial':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Parcial</Badge>
    case 'pendiente':
    default:
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Pendiente</Badge>
  }
}

export function Dashboard({ loan, onEdit }: DashboardProps) {
  const summary = calculateLoanSummary(loan)

  const stats = [
    {
      label: 'Total Prestado',
      value: formatCurrency(summary.totalBorrowed),
      icon: '💰',
      color: 'text-orange-400',
    },
    {
      label: 'Pago Base Mensual',
      value: formatCurrency(summary.monthlyBasePayment),
      icon: '📅',
      color: 'text-blue-400',
    },
    {
      label: 'Total Proyectado',
      value: formatCurrency(summary.totalProjected),
      icon: '📊',
      color: 'text-purple-400',
    },
    {
      label: 'Total Pagado',
      value: formatCurrency(summary.totalPaid),
      icon: '✅',
      color: 'text-emerald-400',
    },
    {
      label: 'Interés Normal',
      value: formatCurrency(summary.normalInterestTotal),
      icon: '📈',
      color: 'text-cyan-400',
    },
    {
      label: 'Interés Extra',
      value: formatCurrency(summary.extraInterestTotal),
      icon: '⚠️',
      color: 'text-amber-400',
    },
    {
      label: 'Saldo Pendiente',
      value: formatCurrency(summary.pendingBalance),
      icon: '⏳',
      color: 'text-rose-400',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Loan Header */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">{loan.name}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {loan.termMonths} meses • {formatPercentage(loan.monthlyInterestRate)} mensual • {loan.sourceAccount}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="border-border/50 hover:bg-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                Editar
              </Button>
            )}
            {getStatusBadge(summary.status)}
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progreso del Préstamo</span>
            <span className="text-foreground font-medium">
              {summary.totalBorrowed > 0 
                ? Math.min(100, Math.round((summary.totalPaid / summary.totalProjected) * 100))
                : 0}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${summary.totalBorrowed > 0 
                  ? Math.min(100, (summary.totalPaid / summary.totalProjected) * 100)
                  : 0}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2 text-muted-foreground">
            <span>Pagado: {formatCurrency(summary.totalPaid)}</span>
            <span>Total: {formatCurrency(summary.totalProjected)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
