import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Field, Panel, SectionHeader, TooltipLabel, buttonClass, dangerButtonClass, inputClass, secondaryButtonClass } from '../components/ui'
import { InfoTooltip } from '../components/InfoTooltip'
import { useAppStore } from '../store/useAppStore'
import type { Empresa } from '../types'

const emptyEmpresa = (): Empresa => ({ id: crypto.randomUUID(), nombre: '', rut: '', direccion: '', telefono: '', email: '', notas: '', creadaEn: new Date().toISOString() })

export function EmpresasView() {
  const { empresas, addEmpresa, updateEmpresa, deleteEmpresa } = useAppStore()
  const [form, setForm] = useState<Empresa>(emptyEmpresa())
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const editing = empresas.some((item) => item.id === form.id)
  const filtered = useMemo(() => empresas.filter((item) => item.nombre.toLowerCase().includes(search.toLowerCase()) || (item.rut ?? '').includes(search)), [empresas, search])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    const duplicated = empresas.some((item) => item.id !== form.id && item.nombre.trim().toLowerCase() === form.nombre.trim().toLowerCase())
    if (duplicated) {
      setError('Ya existe una empresa con ese nombre exacto.')
      return
    }
    if (editing) {
      updateEmpresa(form)
    } else {
      addEmpresa(form)
    }
    setForm(emptyEmpresa())
  }

  return (
    <>
      <SectionHeader title="Empresas" subtitle="Alta y mantenimiento de proveedores o empresas relacionadas." tooltip="Registrar proveedores permite filtrar compras y ver rankings por monto." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Panel>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Nombre" tooltip="Nombre de la empresa o proveedor. Es obligatorio y no puede repetirse exactamente.">
              <input className={inputClass} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </Field>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Field label="RUT" tooltip="Numero de RUT del proveedor si figura en la factura o boleta. Es opcional.">
                <input className={inputClass} value={form.rut} onChange={(event) => setForm({ ...form, rut: event.target.value })} />
              </Field>
              <Field label="Telefono" tooltip="Telefono de contacto del proveedor. Es opcional.">
                <input className={inputClass} value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} />
              </Field>
            </div>
            <Field label="Direccion" tooltip="Direccion comercial o fiscal del proveedor. Es opcional.">
              <input className={inputClass} value={form.direccion} onChange={(event) => setForm({ ...form, direccion: event.target.value })} />
            </Field>
            <Field label="Email" tooltip="Correo de contacto para consultas o comprobantes. Es opcional.">
              <input className={inputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </Field>
            <Field label="Notas" tooltip="Anotaciones internas sobre esta empresa o proveedor.">
              <textarea className={inputClass} rows={3} value={form.notas} onChange={(event) => setForm({ ...form, notas: event.target.value })} />
            </Field>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button className={buttonClass} type="submit">
                <Plus size={16} />
                {editing ? 'Guardar' : 'Crear'}
              </button>
              <InfoTooltip text="Guarda los datos ingresados. Si estas editando, actualiza la empresa existente." />
              {editing ? (
                <button className={secondaryButtonClass} type="button" onClick={() => setForm(emptyEmpresa())}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </Panel>
        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <input className={inputClass} placeholder="Buscar por nombre o RUT" value={search} onChange={(event) => setSearch(event.target.value)} />
            <InfoTooltip text="Filtra la tabla por nombre de empresa o numero de RUT." />
          </div>
          <div className="overflow-visible md:overflow-x-auto xl:overflow-visible">
            <table className="tablet-card-table tablet-table w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr><th className="py-2"><TooltipLabel tooltip="Nombre registrado para identificar al proveedor.">Nombre</TooltipLabel></th><th><TooltipLabel tooltip="RUT cargado para la empresa, si existe.">RUT</TooltipLabel></th><th className="tablet-optional"><TooltipLabel tooltip="Telefono registrado para contacto.">Telefono</TooltipLabel></th><th className="tablet-actions text-right"><TooltipLabel tooltip="Editar o eliminar esta empresa.">Acciones</TooltipLabel></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((empresa) => (
                  <tr key={empresa.id}>
                    <td className="tablet-card-primary py-3 font-medium text-slate-950" data-label="Nombre">{empresa.nombre}</td>
                    <td data-label="RUT">{empresa.rut}</td>
                    <td className="tablet-optional" data-label="Telefono">{empresa.telefono}</td>
                    <td className="tablet-card-actions text-right" data-label="Acciones">
                      <span className="inline-flex items-center gap-2"><button className={secondaryButtonClass} type="button" onClick={() => setForm(empresa)}><Edit2 size={15} /></button><InfoTooltip text="Carga esta empresa en el formulario para modificar sus datos." /></span>
                      <span className="ml-2 inline-flex items-center gap-2"><button className={dangerButtonClass} type="button" onClick={() => confirm('Eliminar empresa y sus compras asociadas?') && deleteEmpresa(empresa.id)}><Trash2 size={15} /></button><InfoTooltip text="Elimina la empresa. Tambien se eliminan compras asociadas a ella." /></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  )
}
