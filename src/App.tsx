import { useState } from 'react'
import type { ReactNode } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { useAppStore } from './store/useAppStore'
import type { ViewKey } from './types'
import { ComprasView } from './views/ComprasView'
import { ConfiguracionView } from './views/ConfiguracionView'
import { DashboardView } from './views/DashboardView'
import { EmpresasView } from './views/EmpresasView'
import { ExportacionesView } from './views/ExportacionesView'
import { LiquidacionView } from './views/LiquidacionView'
import { LoginView } from './views/LoginView'
import { VentasView } from './views/VentasView'

const views: Record<ViewKey, ReactNode> = {
  dashboard: <DashboardView />,
  empresas: <EmpresasView />,
  compras: <ComprasView />,
  ventas: <VentasView />,
  liquidacion: <LiquidacionView />,
  exportaciones: <ExportacionesView />,
  configuracion: <ConfiguracionView />,
}

function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const clearBusinessData = useAppStore((state) => state.clearBusinessData)
  const [activeView, setActiveView] = useState<ViewKey>('dashboard')

  if (!isAuthenticated) return <LoginView />

  return (
    <ErrorBoundary
      resetKey={activeView}
      onBackToDashboard={() => setActiveView('dashboard')}
      onClearLocalData={() => {
        localStorage.removeItem('control-iva-uy-local')
        clearBusinessData()
        setActiveView('dashboard')
        window.location.reload()
      }}
    >
      <Layout activeView={activeView} setActiveView={setActiveView}>
        {views[activeView] ?? views.dashboard}
      </Layout>
    </ErrorBoundary>
  )
}

export default App
