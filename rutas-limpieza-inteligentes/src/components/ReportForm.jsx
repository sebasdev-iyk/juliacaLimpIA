import { useState, useRef } from 'react'
import { ZONES, ZONE_COORDS } from '../data/mockReports'
import { analyzeImage } from '../services/aiAnalyzer'
import BboxOverlay from './BboxOverlay'

const LEVEL_COLORS = {
  Crítico: { bg: 'var(--severity-critico-bg)', border: 'var(--severity-critico-border)', badge: 'var(--severity-critico-badge)', text: 'var(--severity-critico-text)' },
  Medio: { bg: 'var(--severity-medio-bg)', border: 'var(--severity-medio-border)', badge: 'var(--severity-medio-badge)', text: 'var(--severity-medio-text)' },
  Bajo: { bg: 'var(--severity-bajo-bg)', border: 'var(--severity-bajo-border)', badge: 'var(--severity-bajo-badge)', text: 'var(--severity-bajo-text)' },
}

export default function ReportForm({ onAddReport, onClose }) {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [desc, setDesc] = useState('')
  const [zone, setZone] = useState(ZONES[0])
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  // Estado para bounding boxes interactivos
  const [filterConf, setFilterConf] = useState(0)
  const [hiddenClasses, setHiddenClasses] = useState(new Set())

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
      setResult(null)
      setFilterConf(0)
      setHiddenClasses(new Set())
    }
  }

  const useTestImage = () => {
    const images = [
      { name: 'basura-critico-01.jpg', label: 'Crítico' },
      { name: 'residuos-medio-02.jpg', label: 'Medio' },
      { name: 'papeles-bajo-03.jpg', label: 'Bajo' },
    ]
    const pick = images[Math.floor(Math.random() * images.length)]
    const blob = new Blob(['fake'], { type: 'image/jpeg' })
    const file = new File([blob], pick.name, { type: 'image/jpeg' })
    setImage(file)
    setImagePreview(null)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!image) {
      alert('Sube una imagen primero')
      return
    }

    setAnalyzing(true)
    setResult(null)

    // Una sola llamada — el backend devuelve todo: detecciones + imagen
    const analysis = await analyzeImage(image, null)
    setResult(analysis)
    setAnalyzing(false)
  }

  const toggleClass = (cls) => {
    setHiddenClasses(prev => {
      const next = new Set(prev)
      if (next.has(cls)) next.delete(cls)
      else next.add(cls)
      return next
    })
  }

  const handleSubmit = () => {
    if (!result) {
      alert('Analiza la imagen primero')
      return
    }

    const coords = ZONE_COORDS[zone] || { lat: -15.84, lng: -70.02 }

    const newReport = {
      id: Date.now(),
      zona: zone,
      descripcion: desc || 'Reporte ciudadano',
      latitud: coords.lat + (Math.random() - 0.5) * 0.004,
      longitud: coords.lng + (Math.random() - 0.5) * 0.004,
      nivel: result.nivel,
      confianza: result.confianza,
      prioridad: result.prioridad,
      estado: 'Pendiente',
      imagen: '📸',
      fecha: new Date().toLocaleDateString('es-PE'),
    }

    onAddReport(newReport)

    // Reset
    setImage(null)
    setImagePreview(null)
    setDesc('')
    setResult(null)
    setFilterConf(0)
    setHiddenClasses(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleQuickAdd = (level) => {
    const coords = ZONE_COORDS[zone] || { lat: -15.84, lng: -70.02 }
    const report = {
      id: Date.now() + Math.random(),
      zona: zone,
      descripcion: desc || `Reporte ${level}`,
      latitud: coords.lat + (Math.random() - 0.5) * 0.004,
      longitud: coords.lng + (Math.random() - 0.5) * 0.004,
      nivel: level,
      confianza: level === 'Crítico' ? '91%' : level === 'Medio' ? '82%' : '75%',
      prioridad: level === 'Crítico' ? 'Alta' : level === 'Medio' ? 'Media' : 'Baja',
      estado: 'Pendiente',
      imagen: '📸',
      fecha: new Date().toLocaleDateString('es-PE'),
    }
    onAddReport(report)
    setDesc('')
  }

  const colors = result ? LEVEL_COLORS[result.nivel] || LEVEL_COLORS.Bajo : null

  // Agrupar objetos por clase para la leyenda
  const classSummary = result?.objetos
    ? Object.entries(
        result.objetos.reduce((acc, o) => {
          acc[o.clase] = (acc[o.clase] || 0) + 1
          return acc
        }, {})
      ).sort((a, b) => b[1] - a[1])
    : []

  return (
    <div className="report-form-content">
      <h3 className="report-form-title">📸 Nuevo reporte</h3>

      {/* Subir imagen */}
      <div
        onClick={() => !analyzing && fileInputRef.current?.click()}
        className="report-form-image-upload"
        style={{
          cursor: image ? 'default' : 'pointer',
          padding: image ? 0 : undefined,
          minHeight: image ? undefined : 140,
        }}
      >
        {!imagePreview && !result?.imagen_anotada_b64 && (
          <>
            <span className="report-form-image-icon">📷</span>
            <span className="report-form-image-label">Subir foto</span>
          </>
        )}

        {/* Preview con BboxOverlay interactivo */}
        {(imagePreview || result?.imagen_anotada_b64) && (
          <BboxOverlay
            objetos={result?.objetos || []}
            coloresClases={result?.colores_clases || {}}
            imagenB64={result?.imagen_anotada_b64 || null}
            imageUrl={imagePreview || null}
            filterConf={filterConf}
            hiddenClasses={hiddenClasses}
          />
        )}

        {/* Badge del método */}
        {result && !analyzing && (
          <div className={`report-form-badge ${result.es_real ? 'badge-real' : 'badge-sim'}`}
               style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
            {result.metodo || (result.es_real ? 'YOLO-World' : 'Simulado')}
          </div>
        )}

        {/* Warning de simulación */}
        {result && result.fallback_simulado && (
          <div className="report-form-warning">
            ⚠️ Servidor AI no disponible — resultado simulado
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImage}
        style={{ display: 'none' }}
      />

      {/* Leyenda de clases + slider de confianza (solo si hay objetos) */}
      {result?.objetos?.length > 0 && (
        <div className="bbox-controls">
          {/* Slider de confianza */}
          <div className="bbox-conf-slider">
            <label>
              Confianza mínima: <strong>{(filterConf * 100).toFixed(0)}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={filterConf}
              onChange={e => setFilterConf(parseFloat(e.target.value))}
              className="bbox-slider"
            />
          </div>

          {/* Leyenda de clases */}
          <div className="bbox-legend">
            <div className="bbox-legend-title">
              Clases detectadas ({result.objetos.length} objetos)
            </div>
            <div className="bbox-legend-items">
              {classSummary.map(([cls, count]) => {
                const color = result.colores_clases[cls] || '#cccccc'
                const hidden = hiddenClasses.has(cls)
                return (
                  <button
                    key={cls}
                    onClick={() => toggleClass(cls)}
                    className={`bbox-legend-item ${hidden ? 'bbox-legend-hidden' : ''}`}
                    style={{
                      borderLeftColor: color,
                      opacity: hidden ? 0.4 : 1,
                    }}
                  >
                    <span
                      className="bbox-legend-dot"
                      style={{ background: color }}
                    />
                    <span className="bbox-legend-label">{cls}</span>
                    <span className="bbox-legend-count">{count}</span>
                    <span className="bbox-legend-eye">{hidden ? '👁️‍🗨️' : '👁️'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Botón imagen de prueba */}
      <button
        onClick={useTestImage}
        className="report-form-test-btn"
      >
        🎲 Usar imagen de prueba
      </button>

      {/* Descripción */}
      <textarea
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Descripción del reporte..."
        className="report-form-textarea"
        rows={3}
      />

      {/* Zona */}
      <select
        value={zone}
        onChange={e => setZone(e.target.value)}
        className="report-form-select"
      >
        {ZONES.map(z => (
          <option key={z} value={z}>{z}</option>
        ))}
      </select>

      {/* Botón Analizar */}
      {!result && !analyzing && (
        <button
          onClick={handleAnalyze}
          className="report-form-btn report-form-btn-analyze"
          disabled={!image}
        >
          🤖 Analizar con IA
        </button>
      )}

      {/* Analizando */}
      {analyzing && (
        <div className="report-form-analyzing">
          <div className="report-form-spinner" />
          <div>Analizando con YOLO-World...</div>
        </div>
      )}

      {/* Resultado del análisis */}
      {result && !analyzing && (
        <>
          <div
            className="report-form-result"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Header */}
            <div className="report-form-result-header">
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {result.es_real ? '🧠' : '⚙️'} Análisis completo
              </span>
              <span
                className="report-form-result-badge"
                style={{
                  background: colors.badge,
                  color: 'white',
                }}
              >
                {result.nivel}
              </span>
            </div>

            {/* Métricas principales */}
            <div className="report-form-metrics">
              <div><span className="metric-label">Basura:</span> <strong>{result.basura_detectada ? 'Sí' : 'No'}</strong></div>
              <div><span className="metric-label">Confianza:</span> <strong>{result.confianza}</strong></div>
              <div><span className="metric-label">Prioridad:</span> <strong style={{ color: colors.badge }}>{result.prioridad}</strong></div>
              <div><span className="metric-label">Método:</span> <strong>{result.metodo}</strong></div>
            </div>

            {/* Resumen */}
            {result.resumen && (
              <div className="report-form-resumen">
                {result.resumen}
              </div>
            )}

            {/* Lista de objetos detectados */}
            {result.objetos && result.objetos.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Objetos detectados ({result.objetos.length})
                </div>
                {result.objetos.map((obj, i) => {
                  const color = result.colores_clases[obj.clase] || 'var(--text-secondary)'
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '4px 8px', borderRadius: 4,
                      background: i % 2 === 0 ? 'var(--object-row-alt)' : 'var(--object-row-base)',
                      fontSize: 13, alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          display: 'inline-block',
                          width: 10, height: 10,
                          borderRadius: 2,
                          background: color,
                        }} />
                        {obj.clase}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{(obj.confianza * 100).toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botón agregar */}
          <button
            onClick={handleSubmit}
            className="report-form-btn report-form-btn-submit"
          >
            📍 Agregar reporte al mapa
          </button>
        </>
      )}

      {/* Separador */}
      <div className="report-form-divider">
        <span>o agrega rápido</span>
      </div>

      {/* Botones de agregado rápido */}
      <div className="report-form-quick-add">
        {[
          { level: 'Crítico', color: 'var(--quick-btn-critico-text)', bg: 'var(--quick-btn-critico-bg)' },
          { level: 'Medio', color: 'var(--quick-btn-medio-text)', bg: 'var(--quick-btn-medio-bg)' },
          { level: 'Bajo', color: 'var(--quick-btn-bajo-text)', bg: 'var(--quick-btn-bajo-bg)' },
        ].map(item => (
          <button
            key={item.level}
            onClick={() => handleQuickAdd(item.level)}
            className="report-form-quick-btn"
            style={{
              background: item.bg,
              color: item.color,
            }}
          >
            + {item.level}
          </button>
        ))}
      </div>
    </div>
  )
}
