import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { buttonClass, dangerButtonClass } from './ui'

type Props = {
  children: ReactNode
  onBackToDashboard: () => void
  onClearLocalData: () => void
  resetKey: string
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Error al renderizar la seccion', error, info)
    }
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  private backToDashboard = () => {
    this.setState({ error: null })
    this.props.onBackToDashboard()
  }

  private clearLocalData = () => {
    this.setState({ error: null })
    this.props.onClearLocalData()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
        <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-950">Ocurrio un error al cargar esta seccion.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Podes volver al dashboard o limpiar los datos locales si el problema viene de informacion vieja guardada en este navegador.
          </p>
          {import.meta.env.DEV ? (
            <pre className="mt-4 max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-white">
              {this.state.error.message}
              {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
            </pre>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={buttonClass} onClick={this.backToDashboard}>
              Volver al dashboard
            </button>
            <button type="button" className={dangerButtonClass} onClick={this.clearLocalData}>
              Limpiar datos locales
            </button>
          </div>
        </section>
      </main>
    )
  }
}
