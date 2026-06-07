import { Image as ImageIcon, MapPin } from 'lucide-react'
import { useState, useMemo } from 'react'

const LEVEL_COLORS = {
  Crítico: { badge: 'var(--severity-critico-badge)', bg: 'var(--severity-critico-bg)', text: 'var(--severity-critico-text)' },
  Medio: { badge: 'var(--severity-medio-badge)', bg: 'var(--severity-medio-bg)', text: 'var(--severity-medio-text)' },
  Bajo: { badge: 'var(--severity-bajo-badge)', bg: 'var(--severity-bajo-bg)', text: 'var(--severity-bajo-text)' },
  Pendiente: { badge: '#3b82f6', bg: '#eff6ff', text: '#1e40af' },
}

function ReportCard({ r, colors, isProcessing, onSelectReport, onProcessReport }) {
  const [imgError, setImgError] = useState(false)
  const rawSrc = r.imagen_anotada_b64 || r.imagen_b64

  const imgSrc = useMemo(() => {
    if (!rawSrc || typeof rawSrc !== 'string') return null
    if (rawSrc.startsWith('data:') || rawSrc.startsWith('blob:')) return rawSrc
    return `data:image/jpeg;base64,${rawSrc}`
  }, [rawSrc])

  const showImage = imgSrc && !imgError

  return (
    <div
      onClick={() => onSelectReport && onSelectReport(r)}
      style={{
        borderRadius: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{
        width: '100%', aspectRatio: '4/3',
        background: 'var(--bg-active)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 42, overflow: 'hidden',
        borderBottom: '1px solid var(--border-color)',
      }}>
        {showImage ? (
          <img
            key={imgSrc}
            src={imgSrc}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : r.imagen ? (
          <span>{r.imagen}</span>
        ) : (
          <ImageIcon size={36} color="var(--text-muted)" />
        )}
      </div>

      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{
            padding: '1px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
            background: colors.badge, color: 'white',
          }}>
            {r.nivel}
          </span>
          {r.confianza && r.confianza !== '—' && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.confianza}</span>
          )}
        </div>

        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 2,
        }}>
          {r.zona || 'Ubicación'}
        </div>

        <div style={{
          fontSize: 11, color: 'var(--text-secondary)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', marginBottom: 4,
        }}>
          {r.descripcion}
        </div>

        {r.objetos && r.objetos.length > 0 && (
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
            {r.objetos.slice(0, 3).map((obj, i) => (
              <span key={i} style={{
                fontSize: 9, padding: '1px 6px', borderRadius: 4,
                background: (r.colores_clases?.[obj.clase] || '#e2e8f0') + '25',
                color: 'var(--text-secondary)',
              }}>
                {obj.clase}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {r.fecha}
          </span>
          {r.nivel === 'Pendiente' && (r.imagen_b64 || r.imagen) && (
            <button
              onClick={e => { e.stopPropagation(); onProcessReport && onProcessReport(r) }}
              disabled={isProcessing}
              style={{
                padding: '3px 8px', borderRadius: 6, border: 'none',
                background: isProcessing ? 'var(--disabled-bg)' : 'var(--color-primary)',
                color: isProcessing ? 'var(--disabled-text)' : 'white',
                fontSize: 10, fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              {isProcessing ? '...' : 'IA'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReportList({ reports, onSelectReport, onProcessReport, processing }) {
  if (reports.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', gap: 8, padding: 40,
      }}>
        <MapPin size={40} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>No hay reportes</span>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: 8,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 10,
      alignContent: 'start',
    }}>
      {reports.map(r => {
        const colors = LEVEL_COLORS[r.nivel] || LEVEL_COLORS.Pendiente
        const isProcessing = processing && r.nivel === 'Pendiente' && r.imagen_b64
        return (
          <ReportCard
            key={r.id}
            r={r}
            colors={colors}
            isProcessing={isProcessing}
            onSelectReport={onSelectReport}
            onProcessReport={onProcessReport}
          />
        )
      })}
    </div>
  )
}
