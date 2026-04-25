'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dashboard } from '@/components/loan/dashboard'
import { LoanForm } from '@/components/loan/loan-form'
import { PaymentTable } from '@/components/loan/payment-table'
import { Reports } from '@/components/loan/reports'
import { LoanSelector } from '@/components/loan/loan-selector'
import { useLoan } from '@/hooks/use-loan'
import { Spinner } from '@/components/ui/spinner'

type View = 'dashboard' | 'create' | 'edit'

export default function BancoPersonal() {
  const {
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
  } = useLoan()

  const [view, setView] = useState<View>('dashboard')
  const [showReport, setShowReport] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 text-orange-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando Banco Personal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
                <span className="text-xl">🏦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Banco Personal</h1>
                <p className="text-xs text-muted-foreground">Administra tus préstamos personales</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={view === 'dashboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('dashboard')}
                className={view === 'dashboard' ? 'bg-orange-500 hover:bg-orange-600' : 'border-border/50'}
              >
                Dashboard
              </Button>
              <Button
                variant={view === 'create' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('create')}
                className={view === 'create' ? 'bg-orange-500 hover:bg-orange-600' : 'border-border/50'}
              >
                + Nuevo Préstamo
              </Button>
              {activeLoan && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReport(true)}
                  className="border-border/50"
                >
                  Ver Reporte
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Loan Selector */}
        {loans.length > 0 && view === 'dashboard' && (
          <LoanSelector
            loans={loans}
            activeLoanId={activeLoanId}
            onSelect={setActiveLoanId}
            onDelete={deleteLoan}
            onNew={() => setView('create')}
          />
        )}

        {/* Views */}
        {view === 'create' && (
          <LoanForm
            onSubmit={(loanData) => {
              createLoan(loanData)
              setView('dashboard')
            }}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'edit' && activeLoan && (
          <LoanForm
            initialData={activeLoan}
            onSubmit={(loanData) => {
              updateLoan({ ...activeLoan, ...loanData })
              setView('dashboard')
            }}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'dashboard' && activeLoan && (
          <>
            <Dashboard loan={activeLoan} />
            <PaymentTable
              loan={activeLoan}
              onPayment={registerPayment}
              onPayFull={payFull}
              onResetPayments={resetPayments}
            />
          </>
        )}

        {view === 'dashboard' && !activeLoan && loans.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏦</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Bienvenido a Banco Personal</h2>
            <p className="text-muted-foreground mb-6">Comienza creando tu primer préstamo personal</p>
            <Button
              onClick={() => setView('create')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              Crear Primer Préstamo
            </Button>
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReport && activeLoan && (
        <Reports loan={activeLoan} onClose={() => setShowReport(false)} />
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, .print\\:hidden {
            display: none !important;
          }
          .fixed {
            position: relative !important;
          }
        }
      `}</style>
    </div>
  )
}
