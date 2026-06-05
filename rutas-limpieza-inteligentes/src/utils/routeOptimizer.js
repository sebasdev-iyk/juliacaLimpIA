import { calculateDistance, calculateRouteDistance, estimateTime } from './distance.js'

/**
 * Genera ruta inteligente ordenando reportes por:
 * 1. Prioridad (Crítico > Medio > Bajo)
 * 2. Cercanía al punto anterior (heurística del vecino más cercano)
 *
 * @param {Array} reports - Lista de reportes
 * @param {Object} startPoint - Punto de inicio {latitud, longitud}
 * @returns {{ orderedPoints, distance, time, fuel, co2, savingsPercent }}
 */
export function generateSmartRoute(reports, startPoint = null) {
  if (!reports || reports.length === 0) {
    return { orderedPoints: [], distance: 0, time: 0, fuel: 0, co2: 0, savingsPercent: 0 }
  }

  const priorityMap = { Crítico: 3, Medio: 2, Bajo: 1 }
  const start = startPoint || { latitud: -15.8422, longitud: -70.0198 } // Plaza de Armas

  // Copiar y ordenar inicialmente por prioridad
  const remaining = [...reports].sort(
    (a, b) => priorityMap[b.nivel] - priorityMap[a.nivel]
  )

  // Vecino más cercano respetando prioridad
  const ordered = []
  let current = { latitud: start.latitud, longitud: start.longitud }

  while (remaining.length > 0) {
    // Agrupar por nivel de prioridad
    const topPriority = priorityMap[remaining[0].nivel]

    // Filtrar solo los de máxima prioridad restante
    const candidates = remaining.filter(r => priorityMap[r.nivel] === topPriority)

    // Elegir el más cercano al punto actual
    let nearestIdx = 0
    let minDist = Infinity
    candidates.forEach((c, i) => {
      const d = calculateDistance(
        current.latitud, current.longitud,
        c.latitud, c.longitud
      )
      if (d < minDist) {
        minDist = d
        nearestIdx = i
      }
    })

    const chosen = candidates[nearestIdx]
    const realIdx = remaining.indexOf(chosen)
    ordered.push(chosen)
    remaining.splice(realIdx, 1)
    current = { latitud: chosen.latitud, longitud: chosen.longitud }
  }

  const distance = calculateRouteDistance(ordered)
  const time = estimateTime(distance)
  const fuel = Math.round(distance * 0.4 * 10) / 10
  const co2 = Math.round(fuel * 2.68 * 10) / 10
  const fixedDistance = distance * 1.22 // asumimos 22% más larga la ruta fija
  const savingsPercent = Math.round(((fixedDistance - distance) / fixedDistance) * 100)

  return { orderedPoints: ordered, distance, time, fuel, co2, savingsPercent }
}
