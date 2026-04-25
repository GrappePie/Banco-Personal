'use client'

import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Printer, FileSpreadsheet, FileCode, X } from 'lucide-react'
import type { Loan, LoanSummary, PaymentMonth } from '@/lib/loan-types'
import { calculateLoanSummary, formatCurrency, formatDate, formatPercentage } from '@/lib/loan-calculations'
import { useI18n } from '@/src/i18n/i18n-provider'

interface ReportsProps {
  loan: Loan
  onClose: () => void
}

function getStatusText(status: PaymentMonth['status'] | LoanSummary['status'], t: (key: string) => string) {
  switch (status) {
    case 'pagado': return t('status.paid')
    case 'parcial': return t('status.partial')
    case 'pendiente': return t('status.pending')
  }
}

export function Reports({ loan, onClose }: ReportsProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const summary = calculateLoanSummary(loan)
  const { language, t } = useI18n()
  const generatedAt = new Date().toLocaleString(language)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('reports.title')} - ${loan.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; background: white; color: #1a1a1a; font-size: 12px; line-height: 1.4; }
    h1 { color: #ea580c; font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 16px; margin-bottom: 12px; color: #333; }
    .header { border-bottom: 2px solid #ea580c; padding-bottom: 16px; margin-bottom: 20px; }
    .header p { color: #666; font-size: 13px; margin-top: 4px; }
    .header .notes { font-style: italic; margin-top: 8px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-card { background: #f5f5f5; padding: 12px; border-radius: 6px; border: 1px solid #e5e5e5; }
    .summary-label { color: #666; font-size: 11px; text-transform: uppercase; }
    .summary-value { font-size: 16px; font-weight: bold; margin-top: 4px; }
    .text-orange { color: #ea580c; }
    .text-emerald { color: #059669; }
    .text-amber { color: #d97706; }
    .text-cyan { color: #0891b2; }
    .text-rose { color: #e11d48; }
    .text-blue { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
    th, td { padding: 8px 6px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f5f5f5; color: #666; font-weight: 600; text-transform: uppercase; font-size: 10px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; }
    .badge-pagado { background: #d1fae5; color: #059669; }
    .badge-parcial { background: #fef3c7; color: #d97706; }
    .badge-pendiente { background: #dbeafe; color: #2563eb; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #666; font-size: 11px; text-align: center; }
    @media print { body { padding: 0; } @page { margin: 1.5cm; size: landscape; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${loan.name}</h1>
    <p>${t('reports.account')}: ${loan.sourceAccount} &bull; ${t('reports.start')}: ${formatDate(loan.startDate)} &bull; ${loan.termMonths} ${t('dashboard.months')} ${formatPercentage(loan.monthlyInterestRate)} ${t('dashboard.monthly')} &bull; ${t('form.interestType')}: ${loan.interestType === 'declining' ? t('form.declining') : t('form.flat')}</p>
    ${loan.notes ? `<p class="notes">${loan.notes}</p>` : ''}
  </div>

  <div class="summary">
    <div class="summary-card"><div class="summary-label">${t('dashboard.stats.totalBorrowed')}</div><div class="summary-value text-orange">${formatCurrency(summary.totalBorrowed)}</div></div>
    <div class="summary-card"><div class="summary-label">${t('dashboard.stats.totalProjected')}</div><div class="summary-value">${formatCurrency(summary.totalProjected)}</div></div>
    <div class="summary-card"><div class="summary-label">${t('dashboard.stats.totalPaid')}</div><div class="summary-value text-emerald">${formatCurrency(summary.totalPaid)}</div></div>
    <div class="summary-card"><div class="summary-label">${t('dashboard.stats.pendingBalance')}</div><div class="summary-value text-rose">${formatCurrency(summary.pendingBalance)}</div></div>
    <div class="summary-card"><div class="summary-label">${t('dashboard.stats.normalInterest')}</div><div class="summary-value text-cyan">${formatCurrency(summary.normalInterestTotal)}</div></div>
    <div class="summary-card"><div class="summary-label">${t('dashboard.stats.extraInterest')}</div><div class="summary-value text-amber">${formatCurrency(summary.extraInterestTotal)}</div></div>
    <div class="summary-card"><div class="summary-label">${t('dashboard.stats.monthlyBasePayment')}</div><div class="summary-value text-blue">${formatCurrency(summary.monthlyBasePayment)}</div></div>
    <div class="summary-card"><div class="summary-label">${t('payments.status')}</div><div class="summary-value">${getStatusText(summary.status, t)}</div></div>
  </div>

  <h2>${t('reports.detail')}</h2>
  <table>
    <thead>
      <tr>
        <th>${t('payments.month')}</th>
        <th>${t('payments.date')}</th>
        <th class="text-right">${t('payments.principal')}</th>
        <th class="text-right">${t('payments.interest')}</th>
        <th class="text-right">${t('payments.balance')}</th>
        <th class="text-right">${t('payments.extraInterest')}</th>
        <th class="text-right">${t('payments.total')}</th>
        <th class="text-right">${t('payments.paid')}</th>
        <th class="text-center">${t('payments.status')}</th>
      </tr>
    </thead>
    <tbody>
      ${loan.payments.map(p => `
        <tr>
          <td>#${p.monthNumber}</td>
          <td>${formatDate(p.estimatedDate)}</td>
          <td class="text-right">${formatCurrency(p.principal)}</td>
          <td class="text-right text-cyan">${formatCurrency(p.normalInterest)}</td>
          <td class="text-right text-amber">${formatCurrency(p.previousBalance)}</td>
          <td class="text-right text-amber">${formatCurrency(p.extraInterest)}</td>
          <td class="text-right text-orange"><strong>${formatCurrency(p.totalDue)}</strong></td>
          <td class="text-right text-emerald">${formatCurrency(p.amountPaid)}</td>
          <td class="text-center"><span class="badge badge-${p.status}">${getStatusText(p.status, t)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">${t('reports.generated', { date: generatedAt })}</div>
</body>
</html>`

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.onload = () => printWindow.print()
  }

  const handleDownloadCSV = () => {
    const headers = [
      t('payments.month'),
      t('payments.date'),
      t('payments.principal'),
      t('dashboard.stats.normalInterest'),
      t('payments.previousBalance'),
      t('payments.extraInterest'),
      t('payments.total'),
      t('payments.paid'),
      t('payments.balance'),
      t('payments.status'),
    ]
    const rows = loan.payments.map(p => [
      p.monthNumber,
      p.estimatedDate,
      p.principal.toFixed(2),
      p.normalInterest.toFixed(2),
      p.previousBalance.toFixed(2),
      p.extraInterest.toFixed(2),
      p.totalDue.toFixed(2),
      p.amountPaid.toFixed(2),
      p.balanceAfterPayment.toFixed(2),
      getStatusText(p.status, t),
    ])

    const csvContent = [
      `${t('reports.title')}: ${loan.name}`,
      `${t('form.amount')}: ${loan.amount}`,
      `${t('form.term')}: ${loan.termMonths} ${t('dashboard.months')}`,
      `${t('form.monthlyInterestRate')}: ${loan.monthlyInterestRate}%`,
      `${t('reports.account')}: ${loan.sourceAccount}`,
      t('reports.generated', { date: generatedAt }),
      '',
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `report-${loan.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleDownloadHTML = () => {
    if (!reportRef.current) return

    const htmlContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('reports.title')} - ${loan.name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #0f0f0f; color: #fff; }
    h1 { color: #f97316; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #333; }
    th { background: #1a1a1a; color: #999; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .summary-card { background: #1a1a1a; padding: 16px; border-radius: 8px; }
    .summary-label { color: #999; font-size: 12px; }
    .summary-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
    .text-orange { color: #f97316; }
    .text-emerald { color: #10b981; }
    .text-amber { color: #f59e0b; }
    .text-cyan { color: #06b6d4; }
    .text-rose { color: #f43f5e; }
    .footer { margin-top: 24px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  ${reportRef.current.innerHTML}
  <div class="footer">${t('reports.generated', { date: generatedAt })}</div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `report-${loan.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-auto print:relative print:bg-white print:backdrop-blur-none">
      <div className="min-h-screen p-4 md:p-8 print:p-0 print:min-h-0">
        <Card className="max-w-5xl mx-auto bg-card border-border/50 print:border-0 print:shadow-none print:max-w-none print-content">
          <CardHeader className="flex flex-row items-center justify-between print-hidden">
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-400" />
              {t('reports.title')}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handlePrint} className="border-border/50">
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                {t('reports.print')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="border-border/50">
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                {t('reports.csv')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadHTML} className="border-border/50">
                <FileCode className="h-3.5 w-3.5 mr-1.5" />
                {t('reports.html')}
              </Button>
              <Button variant="outline" size="sm" onClick={onClose} className="border-border/50">
                <X className="h-3.5 w-3.5 mr-1.5" />
                {t('reports.close')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="print:p-0">
            <div ref={reportRef} className="space-y-6 print-content">
              <div className="border-b border-border/50 pb-4">
                <h1 className="text-2xl font-bold text-orange-400">{loan.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {t('reports.account')}: {loan.sourceAccount} • {t('reports.start')}: {formatDate(loan.startDate)} • {loan.termMonths} {t('dashboard.months')} {formatPercentage(loan.monthlyInterestRate)} {t('dashboard.monthly')}
                </p>
                {loan.notes && <p className="text-muted-foreground mt-2 text-sm italic">{loan.notes}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg"><p className="text-xs text-muted-foreground">{t('dashboard.stats.totalBorrowed')}</p><p className="text-lg font-bold text-orange-400">{formatCurrency(summary.totalBorrowed)}</p></div>
                <div className="bg-muted/20 p-4 rounded-lg"><p className="text-xs text-muted-foreground">{t('dashboard.stats.totalProjected')}</p><p className="text-lg font-bold text-foreground">{formatCurrency(summary.totalProjected)}</p></div>
                <div className="bg-muted/20 p-4 rounded-lg"><p className="text-xs text-muted-foreground">{t('dashboard.stats.totalPaid')}</p><p className="text-lg font-bold text-emerald-400">{formatCurrency(summary.totalPaid)}</p></div>
                <div className="bg-muted/20 p-4 rounded-lg"><p className="text-xs text-muted-foreground">{t('dashboard.stats.pendingBalance')}</p><p className="text-lg font-bold text-rose-400">{formatCurrency(summary.pendingBalance)}</p></div>
                <div className="bg-muted/20 p-4 rounded-lg"><p className="text-xs text-muted-foreground">{t('dashboard.stats.normalInterest')}</p><p className="text-lg font-bold text-cyan-400">{formatCurrency(summary.normalInterestTotal)}</p></div>
                <div className="bg-muted/20 p-4 rounded-lg"><p className="text-xs text-muted-foreground">{t('dashboard.stats.extraInterest')}</p><p className="text-lg font-bold text-amber-400">{formatCurrency(summary.extraInterestTotal)}</p></div>
                <div className="bg-muted/20 p-4 rounded-lg"><p className="text-xs text-muted-foreground">{t('dashboard.stats.monthlyBasePayment')}</p><p className="text-lg font-bold text-blue-400">{formatCurrency(summary.monthlyBasePayment)}</p></div>
                <div className="bg-muted/20 p-4 rounded-lg"><p className="text-xs text-muted-foreground">{t('payments.status')}</p><p className="text-lg font-bold">{getStatusText(summary.status, t)}</p></div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">{t('reports.detail')}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-2 text-muted-foreground">{t('payments.month')}</th>
                        <th className="text-left py-2 px-2 text-muted-foreground">{t('payments.date')}</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">{t('payments.principal')}</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">{t('payments.interest')}</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">{t('payments.balance')}</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">{t('payments.extraInterest')}</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">{t('payments.total')}</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">{t('payments.paid')}</th>
                        <th className="text-center py-2 px-2 text-muted-foreground">{t('payments.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loan.payments.map((payment) => (
                        <tr key={payment.monthNumber} className="border-b border-border/30">
                          <td className="py-2 px-2 text-foreground">#{payment.monthNumber}</td>
                          <td className="py-2 px-2 text-muted-foreground">{formatDate(payment.estimatedDate)}</td>
                          <td className="py-2 px-2 text-right text-foreground">{formatCurrency(payment.principal)}</td>
                          <td className="py-2 px-2 text-right text-cyan-400">{formatCurrency(payment.normalInterest)}</td>
                          <td className="py-2 px-2 text-right text-amber-400">{formatCurrency(payment.previousBalance)}</td>
                          <td className="py-2 px-2 text-right text-amber-400">{formatCurrency(payment.extraInterest)}</td>
                          <td className="py-2 px-2 text-right text-orange-400 font-medium">{formatCurrency(payment.totalDue)}</td>
                          <td className="py-2 px-2 text-right text-emerald-400">{formatCurrency(payment.amountPaid)}</td>
                          <td className="py-2 px-2 text-center">
                            <Badge className={payment.status === 'pagado' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : payment.status === 'parcial' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}>
                              {getStatusText(payment.status, t)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 text-center text-muted-foreground text-sm">
                {t('reports.generated', { date: generatedAt })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
