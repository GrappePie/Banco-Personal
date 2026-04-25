'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Wallet, CalendarDays, BarChart3, CheckCircle2, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import type { Loan, LoanSummary } from '@/lib/loan-types'
import { calculateLoanSummary, formatPercentage } from '@/lib/loan-calculations'
import { useI18n } from '@/src/i18n/i18n-provider'
import { useLocalizedCurrency } from '@/hooks/use-localized-currency'

interface DashboardProps {
  loan: Loan
  onEdit?: () => void
}

function getStatusBadge(status: LoanSummary['status'], t: (key: string) => string) {
  switch (status) {
    case 'pagado':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{t('status.paid')}</Badge>
    case 'parcial':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{t('status.partial')}</Badge>
    case 'pendiente':
    default:
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{t('status.pending')}</Badge>
  }
}

export function Dashboard({ loan, onEdit }: DashboardProps) {
  const { t } = useI18n()
  const { formatCurrency } = useLocalizedCurrency()
  const summary = calculateLoanSummary(loan)

  const stats = [
    {
      label: t('dashboard.stats.totalBorrowed'),
      value: formatCurrency(summary.totalBorrowed),
      icon: Wallet,
      color: 'text-orange-400',
    },
    {
      label: t('dashboard.stats.monthlyBasePayment'),
      value: formatCurrency(summary.monthlyBasePayment),
      icon: CalendarDays,
      color: 'text-blue-400',
    },
    {
      label: t('dashboard.stats.totalProjected'),
      value: formatCurrency(summary.totalProjected),
      icon: BarChart3,
      color: 'text-purple-400',
    },
    {
      label: t('dashboard.stats.totalPaid'),
      value: formatCurrency(summary.totalPaid),
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
    {
      label: t('dashboard.stats.normalInterest'),
      value: formatCurrency(summary.normalInterestTotal),
      icon: TrendingUp,
      color: 'text-cyan-400',
    },
    {
      label: t('dashboard.stats.extraInterest'),
      value: formatCurrency(summary.extraInterestTotal),
      icon: AlertTriangle,
      color: 'text-amber-400',
    },
    {
      label: t('dashboard.stats.pendingBalance'),
      value: formatCurrency(summary.pendingBalance),
      icon: Clock,
      color: 'text-rose-400',
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">{loan.name}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {loan.termMonths} {t('dashboard.months')} • {formatPercentage(loan.monthlyInterestRate)} {t('dashboard.monthly')} • {loan.sourceAccount}
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
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                {t('dashboard.edit')}
              </Button>
            )}
            {getStatusBadge(summary.status, t)}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('dashboard.progress')}</span>
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
            <span>{t('dashboard.paid')}: {formatCurrency(summary.totalPaid)}</span>
            <span>{t('dashboard.total')}: {formatCurrency(summary.totalProjected)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
