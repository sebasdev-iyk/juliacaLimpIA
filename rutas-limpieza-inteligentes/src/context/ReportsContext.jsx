import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { INITIAL_REPORTS } from '../data/mockReports'

const STORAGE_KEY = 'juliaca_reports'
const ReportsContext = createContext(null)

const log = (msg, data) => console.log(`[${new Date().toLocaleTimeString()}] ReportsContext: ${msg}`, data ?? '')

function loadReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      log('cargados del localStorage', { cantidad: parsed.length })
      return parsed
    }
  } catch (e) {
    log('error al cargar del localStorage', e)
  }
  log('sembrando datos iniciales', { cantidad: INITIAL_REPORTS.length })
  return INITIAL_REPORTS
}

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState(loadReports)

  useEffect(() => {
    try {
      log('guardando en localStorage', { cantidad: reports.length })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
    } catch (e) {
      log('ERROR: no se pudo guardar en localStorage', e.message)
    }
  }, [reports])

  const addReport = useCallback((report) => {
    setReports(prev => [report, ...prev])
  }, [])

  const updateReport = useCallback((id, updates) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])

  return (
    <ReportsContext.Provider value={{ reports, addReport, setReports, updateReport }}>
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error('useReports must be used within ReportsProvider')
  return ctx
}
