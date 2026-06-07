import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'juliaca_limpia_reportes'
const ReportContext = createContext()

function loadReports() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

export function ReportProvider({ children }) {
  const [reports, setReports] = useState(loadReports)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reports)) } catch {}
  }, [reports])

  const addReport = useCallback((report) => {
    setReports(prev => [report, ...prev])
  }, [])

  const updateReport = useCallback((id, updates) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])

  return (
    <ReportContext.Provider value={{ reports, addReport, updateReport }}>
      {children}
    </ReportContext.Provider>
  )
}

export function useReportes() {
  const ctx = useContext(ReportContext)
  if (!ctx) throw new Error('useReportes debe usarse dentro de ReportProvider')
  return ctx
}
