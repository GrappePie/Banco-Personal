import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Globe2, Landmark, Plus } from 'lucide-react'
import { Dashboard } from '@/components/loan/dashboard'
import { LoanForm } from '@/components/loan/loan-form'
import { PaymentTable } from '@/components/loan/payment-table'
import { Reports } from '@/components/loan/reports'
import { LoanSelector } from '@/components/loan/loan-selector'
import { useLoan } from '@/hooks/use-loan'
import { useI18n } from '@/src/i18n/i18n-provider'
import { Spinner } from '@/components/ui/spinner'

type View = 'dashboard' | 'create' | 'edit'

export function BancoPersonal() {
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
  const {
    language,
    setLanguage,
    supportedLanguages,
    t,
    countryName,
    primaryLanguage,
    isLocaleLoading,
  } = useI18n()

  const [view, setView] = useState<View>('dashboard')
  const [showReport, setShowReport] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 text-orange-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('app.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('app.title')}</h1>
                <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-xs text-muted-foreground"
                title={t('nav.localeTooltip')}
              >
                <Globe2 className="h-3.5 w-3.5 text-orange-400" />
                <span>
                  {isLocaleLoading
                    ? t('nav.detectingLocation')
                    : `${countryName} · ${primaryLanguage}`}
                </span>
              </div>
              <select
                aria-label={t('nav.language')}
                value={language}
                onChange={(event) => setLanguage(event.target.value as typeof language)}
                className="h-9 rounded-md border border-border/50 bg-background/50 px-2 text-xs text-foreground outline-none hover:bg-muted"
              >
                {supportedLanguages.map((languageCode) => (
                  <option key={languageCode} value={languageCode}>
                    {t(`language.${languageCode}`)}
                  </option>
                ))}
              </select>
              <Button
                variant={view === 'dashboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('dashboard')}
                className={view === 'dashboard' ? 'bg-orange-500 hover:bg-orange-600' : 'border-border/50'}
              >
                {t('nav.dashboard')}
              </Button>
              <Button
                variant={view === 'create' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('create')}
                className={view === 'create' ? 'bg-orange-500 hover:bg-orange-600' : 'border-border/50'}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {t('nav.newLoan')}
              </Button>
              {activeLoan && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReport(true)}
                  className="border-border/50"
                >
                  {t('nav.viewReport')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loans.length > 0 && view === 'dashboard' && (
          <LoanSelector
            loans={loans}
            activeLoanId={activeLoanId}
            onSelect={setActiveLoanId}
            onEdit={(loanId) => {
              setActiveLoanId(loanId)
              setView('edit')
            }}
            onDelete={deleteLoan}
            onNew={() => setView('create')}
          />
        )}

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
              updateLoan({ ...activeLoan, ...loanData, payments: [] })
              setView('dashboard')
            }}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'dashboard' && activeLoan && (
          <>
            <Dashboard loan={activeLoan} onEdit={() => setView('edit')} />
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
              <Landmark className="h-10 w-10 text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('empty.welcome')}</h2>
            <p className="text-muted-foreground mb-6">{t('empty.description')}</p>
            <Button
              onClick={() => setView('create')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {t('empty.createFirstLoan')}
            </Button>
          </div>
        )}
      </main>

      {showReport && activeLoan && (
        <Reports loan={activeLoan} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}
