import { useRef, useEffect, useMemo, useState } from 'react'
import { useReportes } from '../store/reportStore'

const NIVELES = ['Todos', 'Crítico', 'Medio', 'Bajo']
const ESTADOS = ['Todos', 'Pendiente', 'En proceso', 'Resuelto']

const COLORMAP = [
  [0.0, '#14532d'],
  [0.1, '#166534'],
  [0.25, '#16a34a'],
  [0.4, '#84cc16'],
  [0.55, '#eab308'],
  [0.7, '#f97316'],
  [0.85, '#ef4444'],
  [1.0, '#991b1b'],
]

function getColor(value) {
  for (let i = 1; i < COLORMAP.length; i++) {
    if (value <= COLORMAP[i][0]) {
      const prev = COLORMAP[i - 1]
      const curr = COLORMAP[i]
      const t = (value - prev[0]) / (curr[0] - prev[0])
      return lerpColor(prev[1], curr[1], t)
    }
  }
  return COLORMAP[COLORMAP.length - 1][1]
}

function lerpColor(a, b, t) {
  const ah = parseInt(a.replace('#', ''), 16)
  const bh = parseInt(b.replace('#', ''), 16)
  const ar = (ah >> 16), ag = (ah >> 8) & 255, ab = ah & 255
  const br = (bh >> 16), bg = (bh >> 8) & 255, bb = bh & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const b_ = Math.round(ab + (bb - ab) * t)
  return `rgb(${r},${g},${b_})`
}

export default function HeatmapPage() {
  const { reports } = useReportes()
  const canvasRef = useRef(null)
  const [viewMode, setViewMode] = useState('heat')
  const [filtroNivel, setFiltroNivel] = useState('Todos')
  const [filtroEstado, setFiltroEstado] = useState('Todos')

  const filtrados = useMemo(() => {
    return reports.filter(r => {
      if (filtroNivel !== 'Todos' && r.nivel !== filtroNivel) return false
      if (filtroEstado !== 'Todos' && r.estado !== filtroEstado) return false
      return r.latitud && r.longitud
    })
  }, [reports, filtroNivel, filtroEstado])

  const { bounds, stats } = useMemo(() => {
    if (filtrados.length === 0) return { bounds: null, stats: {} }
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
    filtrados.forEach(r => {
      if (r.latitud < minLat) minLat = r.latitud
      if (r.latitud > maxLat) maxLat = r.latitud
      if (r.longitud < minLng) minLng = r.longitud
      if (r.longitud > maxLng) maxLng = r.longitud
    })
    const pad = 0.003
    return {
      bounds: { minLat: minLat - pad, maxLat: maxLat + pad, minLng: minLng - pad, maxLng: maxLng + pad },
      stats: { total: filtrados.length, criticos: filtrados.filter(r => r.nivel === 'Crítico').length },
    }
  }, [filtrados])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !bounds) return
    const ctx = canvas.getContext('2d')
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.scale(2, 2)
    }
    resize()
    window.addEventListener('resize', resize)

    const w = canvas.width / 2
    const h = canvas.height / 2

    // Map coordinates to canvas pixels
    const mapX = (lng) => ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * w
    const mapY = (lat) => ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * h

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const x = (w / 5) * i
      const y = (h / 5) * i
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    if (viewMode === 'heat') {
      // Off-screen canvas for density accumulation
      const offscreen = document.createElement('canvas')
      offscreen.width = w
      offscreen.height = h
      const offCtx = offscreen.getContext('2d')

      const radius = Math.max(w, h) * 0.06

      filtrados.forEach(r => {
        const cx = mapX(r.longitud)
        const cy = mapY(r.latitud)
        const intensity = r.nivel === 'Crítico' ? 1.0 : r.nivel === 'Medio' ? 0.6 : 0.3
        const grad = offCtx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0, `rgba(255,255,255,${intensity})`)
        grad.addColorStop(0.3, `rgba(255,255,255,${intensity * 0.7})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        offCtx.fillStyle = grad
        offCtx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
      })

      const imageData = offCtx.getImageData(0, 0, w, h)
      const pixels = imageData.data

      for (let i = 0; i < pixels.length; i += 4) {
        const intensity = pixels[i + 3] / 255
        if (intensity > 0.01) {
          const color = getColor(Math.min(intensity, 1))
          const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/)
          if (match) {
            pixels[i] = parseInt(match[1])
            pixels[i + 1] = parseInt(match[2])
            pixels[i + 2] = parseInt(match[3])
            pixels[i + 3] = Math.min(intensity * 255 * 1.2, 255)
          }
        }
      }

      offCtx.putImageData(imageData, 0, 0)
      ctx.drawImage(offscreen, 0, 0)
    } else {
      // Point view
      filtrados.forEach(r => {
        const cx = mapX(r.longitud)
        const cy = mapY(r.latitud)
        const color = r.nivel === 'Crítico' ? '#ef4444' : r.nivel === 'Medio' ? '#f59e0b' : '#10b981'
        const size = r.nivel === 'Crítico' ? 6 : 4

        ctx.beginPath()
        ctx.arc(cx, cy, size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Glow for critical points
        if (r.nivel === 'Crítico') {
          ctx.beginPath()
          ctx.arc(cx, cy, size + 3, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(239,68,68,0.2)'
          ctx.fill()
        }
      })
    }

    return () => window.removeEventListener('resize', resize)
  }, [filtrados, viewMode, bounds])

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-4xl mx-auto px-5 pt-6 pb-8 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1D1F]">Mapa de Calor</h1>
          <p className="text-[#6F767E] text-sm mt-1">Densidad de reportes ciudadanos por zona</p>
        </div>

        {/* Stats + Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-card">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-[#6F767E]">Bajo</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-[#6F767E]">Medio</span>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-[#6F767E]">Crítico</span>
            </div>
            {stats.total > 0 && (
              <span className="text-xs font-semibold text-[#6F767E] bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-card">
                {stats.total} reportes · {stats.criticos} críticos
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle view */}
            <div className="bg-white border border-gray-100 rounded-xl p-1 shadow-card flex">
              <button onClick={() => setViewMode('heat')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'heat' ? 'bg-[#135C3A] text-white shadow-sm' : 'text-[#6F767E] hover:text-[#1A1D1F]'}`}>
                Calor
              </button>
              <button onClick={() => setViewMode('points')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'points' ? 'bg-[#135C3A] text-white shadow-sm' : 'text-[#6F767E] hover:text-[#1A1D1F]'}`}>
                Puntos
              </button>
            </div>

            {/* Filter nivel */}
            <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-[#6F767E] shadow-card focus:ring-2 focus:ring-[#135C3A]"
            >
              {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            {/* Filter estado */}
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-[#6F767E] shadow-card focus:ring-2 focus:ring-[#135C3A]"
            >
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Canvas heatmap */}
        <div className="relative bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          <div className="w-full" style={{ aspectRatio: '16/10' }}>
            {filtrados.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center bg-[#0f172a] rounded-3xl">
                <div>
                  <span className="material-symbols-outlined text-5xl text-gray-600">heatmap</span>
                  <p className="text-gray-400 text-sm mt-2">
                    {reports.length === 0 ? 'Aún no hay reportes' : 'Sin resultados para los filtros'}
                  </p>
                </div>
              </div>
            ) : (
              <canvas ref={canvasRef} className="w-full h-full rounded-3xl" />
            )}
          </div>
        </div>

        {/* Info */}
        {filtrados.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-card border border-gray-100">
            <h3 className="font-bold text-sm text-[#1A1D1F] mb-3">Zonas con mayor densidad</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(() => {
                const zonas = {}
                filtrados.forEach(r => {
                  zonas[r.zona] = (zonas[r.zona] || 0) + 1
                })
                return Object.entries(zonas)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([zona, count]) => (
                    <div key={zona} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs font-semibold text-[#1A1D1F] truncate">{zona}</span>
                      <span className="text-xs font-bold text-[#6F767E] ml-auto">{count} rep.</span>
                    </div>
                  ))
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
