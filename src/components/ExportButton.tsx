import { FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { exportarExcel } from '../utils/exportExcel'
import { currentMonth, currentYear } from '../utils/date'
import { secondaryButtonClass } from './ui'
import { InfoTooltip } from './InfoTooltip'
import { useToast } from './toastContext'

export function ExportButton({ month = currentMonth(), year = currentYear(), label = 'Exportar Excel' }: { month?: number; year?: number; label?: string }) {
  const { empresas, compras, ventas, config } = useAppStore()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const handleExport = async () => {
    setBusy(true)
    try {
      await exportarExcel(empresas, compras, ventas, config, { month, year })
      toast.success('Excel exportado correctamente.')
    } catch {
      toast.error('Ocurrio un error al exportar Excel. Intenta nuevamente.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" className={secondaryButtonClass} onClick={handleExport} disabled={busy}>
        <FileSpreadsheet size={16} />
        {busy ? 'Exportando...' : label}
      </button>
      <InfoTooltip text="Genera un archivo Excel del periodo elegido con resumen, movimientos, empresas y liquidacion estimada." />
    </span>
  )
}
