/**
 * Llama al API público de OSRM (Open Source Routing Machine)
 * para obtener rutas que siguen calles reales.
 *
 * OSRM usa datos de OpenStreetMap — sin necesidad de API key.
 * API pública: https://router.project-osrm.org/
 *
 * @param {Array<{lat: number, lng: number}>} waypoints - Puntos en orden a visitar
 * @returns {Promise<{geometry: number[][], distanceKm: number, durationMin: number}>}
 */
export async function fetchRouteFromOSRM(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    throw new Error('Se necesitan al menos 2 puntos para calcular ruta')
  }

  // OSRM espera coordenadas en formato: lng,lat separadas por ;
  const coordsStr = waypoints
    .map(p => `${p.lng},${p.lat}`)
    .join(';')

  const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full&steps=false&alternatives=false`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`OSRM respondió con error ${response.status}`)
  }

  const data = await response.json()
  if (!data.routes || data.routes.length === 0) {
    throw new Error('OSRM no encontró una ruta viable')
  }

  const route = data.routes[0]
  // GeoJSON devuelve [lng, lat] — convertimos a [lat, lng] para Leaflet
  const geometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
  const distanceKm = Math.round((route.distance / 1000) * 10) / 10
  const durationMin = Math.round(route.duration / 60)

  return { geometry, distanceKm, durationMin }
}

/**
 * Versión simulada para usar sin conexión a internet.
 * Genera una ruta con pequeñas desviaciones para simular calles.
 */
export function simulateRoadRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    return { geometry: [], distanceKm: 0, durationMin: 0 }
  }

  const geometry = []
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i]
    const to = waypoints[i + 1]

    // Generar puntos intermedios con pequeñas desviaciones
    const steps = 8
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const lat = from.lat + (to.lat - from.lat) * t
      const lng = from.lng + (to.lng - from.lng) * t
      // Desviación senoidal para simular curvatura de calle
      const offset = 0.0003 * Math.sin(t * Math.PI) * (i % 2 === 0 ? 1 : -1)
      geometry.push([lat + offset, lng + offset * 0.7])
    }
  }
  // Agregar el último punto exacto
  const last = waypoints[waypoints.length - 1]
  geometry.push([last.lat, last.lng])

  // Calcular distancia Haversine total y aumentarla ~25% para simular calles reales
  let straightDist = 0
  for (let i = 1; i < waypoints.length; i++) {
    const R = 6371
    const dLat = ((waypoints[i].lat - waypoints[i - 1].lat) * Math.PI) / 180
    const dLng = ((waypoints[i].lng - waypoints[i - 1].lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((waypoints[i - 1].lat * Math.PI) / 180) *
        Math.cos((waypoints[i].lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    straightDist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const distanceKm = Math.round(straightDist * 1.25 * 10) / 10
  const durationMin = Math.round((distanceKm / 25) * 60)

  return { geometry, distanceKm, durationMin }
}
