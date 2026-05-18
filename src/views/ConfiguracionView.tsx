import { useState } from 'react'
import type { FormEvent } from 'react'
import { Field, Panel, SectionHeader, buttonClass, dangerButtonClass, inputClass, secondaryButtonClass } from '../components/ui'
import { defaultConfig, useAppStore } from '../store/useAppStore'
import type { AppConfig } from '../types'

export function ConfiguracionView() {
  const { config, updateConfig, loadDemoData, clearBusinessData, importLocalDataToServer } = useAppStore()
  const [form, setForm] = useState<AppConfig>(config)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    updateConfig({ ...form, tasaIVA: Number(form.tasaIVA), decimales: Number(form.decimales) })
  }

  return (
    <>
      <SectionHeader title="Configuracion" subtitle="Parametros locales de calculo y visualizacion." tooltip="La tasa de IVA inicial es 22%, pero queda parametrizada para cambios futuros." />
      <div className="grid gap-4 xl:grid-cols-[520px_1fr]">
        <Panel>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Nombre negocio"><input className={inputClass} value={form.nombreNegocio} onChange={(e) => setForm({ ...form, nombreNegocio: e.target.value })} /></Field>
            <Field label="Tasa IVA (%)"><input className={inputClass} type="number" step="0.01" value={form.tasaIVA} onChange={(e) => setForm({ ...form, tasaIVA: Number(e.target.value) })} /></Field>
            <Field label="Moneda"><input className={inputClass} value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value.toUpperCase() })} /></Field>
            <Field label="Redondeo decimal"><input className={inputClass} type="number" min="0" max="4" value={form.decimales} onChange={(e) => setForm({ ...form, decimales: Number(e.target.value) })} /></Field>
            <div className="flex flex-wrap gap-2"><button className={buttonClass} type="submit">Guardar configuracion</button><button className={secondaryButtonClass} type="button" onClick={() => setForm(defaultConfig)}>Restaurar valores iniciales</button></div>
          </form>
        </Panel>
        <Panel>
          <h3 className="text-sm font-semibold text-slate-950">Datos demo</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Carga empresas, compras y ventas de ejemplo para probar dashboard, graficas y exportaciones.</p>
          <div className="mt-4 flex flex-wrap gap-2"><button className={secondaryButtonClass} type="button" onClick={loadDemoData}>Cargar datos demo</button><button className={dangerButtonClass} type="button" onClick={() => confirm('Eliminar todos los datos de negocio?') && clearBusinessData()}>Limpiar datos</button></div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-950">Migracion inicial</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Importa al servidor los datos antiguos guardados en este navegador.</p>
            <button className={secondaryButtonClass} type="button" onClick={importLocalDataToServer}>Importar datos locales al servidor</button>
          </div>
        </Panel>
      </div>
    </>
  )
}
