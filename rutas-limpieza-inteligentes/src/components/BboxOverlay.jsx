import { useState, useRef, useEffect, useCallback } from 'react'

const TOOLTIP_STYLE = {
  position: 'absolute',
  background: 'var(--tooltip-bg)',
  color: 'var(--tooltip-text)',
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 4,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  zIndex: 20,
  transform: 'translate(-50%, -100%)',
  marginTop: -8,
}

/**
 * BboxOverlay — renderiza bounding boxes como SVG interactivo sobre una imagen.
 *
 * Props:
 *   objetos       — [{clase, confianza, bbox: [x1,y1,x2,y2]}]
 *   coloresClases — { "clase": "#rrggbb" }
 *   imagenB64     — string base64 de la imagen anotada
 *   imageUrl      — URL de la imagen original (cuando no hay b64)
 *   filterConf    — confianza mínima para mostrar (0..1)
 *   hiddenClasses — Set de clases ocultas
 */
export default function BboxOverlay({
  objetos = [],
  coloresClases = {},
  imagenB64 = null,
  imageUrl = null,
  filterConf = 0,
  hiddenClasses = new Set(),
}) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const [dims, setDims] = useState({ w: 1, h: 1, nw: 1, nh: 1 })
  const [tooltip, setTooltip] = useState(null)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  // Calcular escalado imagen ↔ viewport
  const updateDims = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const nw = imgRef.current.naturalWidth || 1
    const nh = imgRef.current.naturalHeight || 1
    setDims({ w: rect.width, h: rect.height, nw, nh })
  }, [])

  useEffect(() => {
    updateDims()
    const ro = new ResizeObserver(updateDims)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [updateDims])

  // Escalar coordenadas nativas → viewport
  const sx = (x) => (x / dims.nw) * dims.w
  const sy = (y) => (y / dims.nh) * dims.h

  // Objetos filtrados
  const visible = objetos.filter(o =>
    o.confianza >= filterConf &&
    !hiddenClasses.has(o.clase)
  )

  // Imagen src
  const src = imagenB64
    ? `data:image/jpeg;base64,${imagenB64}`
    : imageUrl

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 8,
        background: 'var(--bbox-bg)',
      }}
    >
      {/* Imagen subyacente */}
      <img
        ref={imgRef}
        src={src}
        alt="Análisis"
        onLoad={updateDims}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          borderRadius: 8,
        }}
      />

      {/* SVG overlay con bounding boxes */}
      {visible.length > 0 && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {visible.map((obj, i) => {
            const [x1, y1, x2, y2] = obj.bbox
            const color = coloresClases[obj.clase] || '#cccccc'
            const isHovered = hoveredIdx === i

            return (
              <g
                key={i}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  setHoveredIdx(i)
                  const rect = containerRef.current.getBoundingClientRect()
                  const cx = sx((x1 + x2) / 2)
                  setTooltip({
                    text: `${obj.clase} · ${(obj.confianza * 100).toFixed(0)}%`,
                    left: cx,
                    top: sy(y1),
                    clientX: e.clientX,
                    clientY: e.clientY,
                  })
                }}
                onMouseMove={(e) => {
                  const rect = containerRef.current.getBoundingClientRect()
                  setTooltip(prev => prev ? {
                    ...prev,
                    clientX: e.clientX,
                    clientY: e.clientY,
                  } : null)
                }}
                onMouseLeave={() => {
                  setHoveredIdx(null)
                  setTooltip(null)
                }}
              >
                {/* Rectángulo semi-transparente de fondo */}
                <rect
                  x={sx(x1)}
                  y={sy(y1)}
                  width={sx(x2) - sx(x1)}
                  height={sy(y2) - sy(y1)}
                  fill={`${color}22`}
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                  rx={3}
                  ry={3}
                />
                {/* Label sobre el rect */}
                <text
                  x={sx(x1) + 4}
                  y={sy(y1) - 5}
                  fill={color}
                  fontSize={isHovered ? 13 : 11}
                  fontWeight={isHovered ? 700 : 500}
                  style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)' }}
                >
                  {obj.clase} {(obj.confianza * 100).toFixed(0)}%
                </text>
              </g>
            )
          })}
        </svg>
      )}

      {/* Tooltip flotante */}
      {tooltip && (
        <div
          style={{
            ...TOOLTIP_STYLE,
            left: tooltip.clientX - (containerRef.current?.getBoundingClientRect().left || 0),
            top: tooltip.clientY - (containerRef.current?.getBoundingClientRect().top || 0) - 30,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Sin objetos visibles */}
      {visible.length === 0 && objetos.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          background: 'var(--no-objects-bg)',
          color: 'var(--no-objects-text)',
          fontSize: 12,
          padding: '4px 8px',
          borderRadius: 4,
          textAlign: 'center',
        }}>
          ⚡ {objetos.length} objetos — todos filtrados por confianza o clase oculta
        </div>
      )}
    </div>
  )
}
