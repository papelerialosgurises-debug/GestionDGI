import { Lock } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAppStore } from '../store/useAppStore'
import { buttonClass, inputClass } from '../components/ui'

export function LoginView() {
  const login = useAppStore((state) => state.login)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!login(password)) setError('Contrasena incorrecta.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Lock size={20} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-950">Acceso local</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Herramienta interna para control y estimacion de IVA. No es un sistema oficial de DGI.</p>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Contrasena</span>
          <input
            className={inputClass}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            placeholder="Ingresar contrasena"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button type="submit" className={`mt-5 w-full ${buttonClass}`}>
          Entrar
        </button>
        <p className="mt-4 text-xs leading-5 text-slate-400">Proteccion basica local. No es autenticacion segura real.</p>
      </form>
    </main>
  )
}
