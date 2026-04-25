'use client'

import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Loan, LoanSummary, PaymentMonth } from '@/lib/loan-types'
import { calculateLoanSummary, formatCurrency, formatDate, formatPercentage } from '@/lib/loan-calculations'

interface ReportsProps {
  loan: Loan
  onClose: () => void
}

function getStatusText(status: PaymentMonth['status'] | LoanSummary['status']) {
  switch (status) {
    case 'pagado': return 'Pagado'
    case 'parcial': return 'Parcial'
    case 'pendiente': return 'Pendiente'
  }
}

export function Reports({ loan, onClose }: ReportsProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const summary = calculateLoanSummary(loan)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadCSV = () => {
    const headers = ['Mes', 'Fecha', 'Capital', 'Interés Normal', 'Sobrante Anterior', 'Interés Extra', 'Total a Pagar', 'Monto Pagado', 'Sobrante', 'Estado']
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
      getStatusText(p.status)
    ])

    const csvContent = [
      `Préstamo: ${loan.name}`,
      `Monto: ${loan.amount}`,
      `Plazo: ${loan.termMonths} meses`,
      `Tasa: ${loan.monthlyInterestRate}%`,
      `Cuenta: ${loan.sourceAccount}`,
      `Generado: ${new Date().toLocaleString('es-MX')}`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-${loan.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleDownloadHTML = () => {
    if (!reportRef.current) return

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte - ${loan.name}</title>
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
  <div class="footer">Generado el ${new Date().toLocaleString('es-MX')} - Banco Personal</div>
</body>
</html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-${loan.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-screen p-4 md:p-8">
        <Card className="max-w-5xl mx-auto bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between print:hidden">
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <span>📄</span>
              Reporte del Préstamo
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrint}
                className="border-border/50"
              >
                Imprimir / PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadCSV}
                className="border-border/50"
              >
                Descargar CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadHTML}
                className="border-border/50"
              >
                Descargar HTML
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClose}
                className="border-border/50"
              >
                Cerrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={reportRef} className="space-y-6">
              {/* Header */}
              <div className="border-b border-border/50 pb-4">
                <h1 className="text-2xl font-bold text-orange-400">{loan.name}</h1>
                <p className="text-muted-foreground mt-1">
                  Cuenta: {loan.sourceAccount} • Inicio: {formatDate(loan.startDate)} • {loan.termMonths} meses a {formatPercentage(loan.monthlyInterestRate)} mensual
                </p>
                {loan.notes && <p className="text-muted-foreground mt-2 text-sm italic">{loan.notes}</p>}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Prestado</p>
                  <p className="text-lg font-bold text-orange-400">{formatCurrency(summary.totalBorrowed)}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Proyectado</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(summary.totalProjected)}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Pagado</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(summary.totalPaid)}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Saldo Pendiente</p>
                  <p className="text-lg font-bold text-rose-400">{formatCurrency(summary.pendingBalance)}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Interés Normal</p>
                  <p className="text-lg font-bold text-cyan-400">{formatCurrency(summary.normalInterestTotal)}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Interés Extra</p>
                  <p className="text-lg font-bold text-amber-400">{formatCurrency(summary.extraInterestTotal)}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Pago Base Mensual</p>
                  <p className="text-lg font-bold text-blue-400">{formatCurrency(summary.monthlyBasePayment)}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <p className="text-lg font-bold">{getStatusText(summary.status)}</p>
                </div>
              </div>

              {/* Payments Table */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Detalle de Pagos</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-2 text-muted-foreground">Mes</th>
                        <th className="text-left py-2 px-2 text-muted-foreground">Fecha</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">Capital</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">Interés</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">Sobrante</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">Int. Extra</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">Total</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">Pagado</th>
                        <th className="text-center py-2 px-2 text-muted-foreground">Estado</th>
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
                            <Badge 
                              className={
                                payment.status === 'pagado' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                  : payment.status === 'parcial'
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }
                            >
                              {getStatusText(payment.status)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border/50 text-center text-muted-foreground text-sm">
                Reporte generado el {new Date().toLocaleString('es-MX')} • Banco Personal
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
