'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Loan, PaymentMonth } from '@/lib/loan-types'
import { formatCurrency, formatDate } from '@/lib/loan-calculations'

interface PaymentTableProps {
  loan: Loan
  onPayment: (monthIndex: number, amount: number) => void
  onPayFull: (monthIndex: number) => void
  onResetPayments: () => void
}

function getStatusBadge(status: PaymentMonth['status']) {
  switch (status) {
    case 'pagado':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Pagado</Badge>
    case 'parcial':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Parcial</Badge>
    case 'pendiente':
    default:
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Pendiente</Badge>
  }
}

export function PaymentTable({ loan, onPayment, onPayFull, onResetPayments }: PaymentTableProps) {
  const [editingMonth, setEditingMonth] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const handlePaymentSubmit = (monthIndex: number) => {
    const amount = parseFloat(paymentAmount) || 0
    onPayment(monthIndex, amount)
    setEditingMonth(null)
    setPaymentAmount('')
  }

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <span>📅</span>
          Calendario de Pagos
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetPayments}
          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
        >
          Reiniciar Pagos
        </Button>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Mes</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Fecha Est.</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Capital</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Interés</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Sobrante Ant.</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Int. Extra</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Total</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Pagado</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Sobrante</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Estado</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loan.payments.map((payment, index) => (
                <tr key={payment.monthNumber} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-3 px-2 text-foreground font-medium">#{payment.monthNumber}</td>
                  <td className="py-3 px-2 text-muted-foreground">{formatDate(payment.estimatedDate)}</td>
                  <td className="py-3 px-2 text-right text-foreground">{formatCurrency(payment.principal)}</td>
                  <td className="py-3 px-2 text-right text-cyan-400">{formatCurrency(payment.normalInterest)}</td>
                  <td className="py-3 px-2 text-right text-amber-400">{formatCurrency(payment.previousBalance)}</td>
                  <td className="py-3 px-2 text-right text-amber-400">{formatCurrency(payment.extraInterest)}</td>
                  <td className="py-3 px-2 text-right text-orange-400 font-semibold">{formatCurrency(payment.totalDue)}</td>
                  <td className="py-3 px-2 text-right text-emerald-400">{formatCurrency(payment.amountPaid)}</td>
                  <td className="py-3 px-2 text-right text-rose-400">{formatCurrency(payment.balanceAfterPayment)}</td>
                  <td className="py-3 px-2 text-center">{getStatusBadge(payment.status)}</td>
                  <td className="py-3 px-2">
                    {editingMonth === index ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Monto"
                          className="w-24 h-7 text-xs bg-background/50"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handlePaymentSubmit(index)}
                          className="h-7 px-2 bg-emerald-500 hover:bg-emerald-600 text-xs"
                        >
                          ✓
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingMonth(null)
                            setPaymentAmount('')
                          }}
                          className="h-7 px-2 text-xs"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingMonth(index)
                            setPaymentAmount(payment.totalDue.toFixed(2))
                          }}
                          className="h-7 px-2 text-xs border-border/50"
                        >
                          Pagar
                        </Button>
                        {payment.status !== 'pagado' && (
                          <Button 
                            size="sm" 
                            onClick={() => onPayFull(index)}
                            className="h-7 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                          >
                            Completo
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {loan.payments.map((payment, index) => (
            <Card key={payment.monthNumber} className="bg-background/30 border-border/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Mes #{payment.monthNumber}</span>
                  {getStatusBadge(payment.status)}
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(payment.estimatedDate)}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Capital:</span>
                    <span className="ml-2 text-foreground">{formatCurrency(payment.principal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Interés:</span>
                    <span className="ml-2 text-cyan-400">{formatCurrency(payment.normalInterest)}</span>
                  </div>
                  {payment.previousBalance > 0 && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Sobrante:</span>
                        <span className="ml-2 text-amber-400">{formatCurrency(payment.previousBalance)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Int. Extra:</span>
                        <span className="ml-2 text-amber-400">{formatCurrency(payment.extraInterest)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div>
                    <span className="text-muted-foreground text-sm">Total:</span>
                    <span className="ml-2 text-orange-400 font-bold">{formatCurrency(payment.totalDue)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Pagado:</span>
                    <span className="ml-2 text-emerald-400 font-bold">{formatCurrency(payment.amountPaid)}</span>
                  </div>
                </div>

                {editingMonth === index ? (
                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Monto a pagar"
                      className="flex-1 bg-background/50"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handlePaymentSubmit(index)}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      ✓
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingMonth(null)
                        setPaymentAmount('')
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingMonth(index)
                        setPaymentAmount(payment.totalDue.toFixed(2))
                      }}
                      className="flex-1 border-border/50"
                    >
                      Registrar Pago
                    </Button>
                    {payment.status !== 'pagado' && (
                      <Button 
                        size="sm" 
                        onClick={() => onPayFull(index)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        Pagar Completo
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
