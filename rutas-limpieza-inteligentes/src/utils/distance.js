/**
 * Calcula distancia Haversine entre dos puntos (en km)
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Calcula distancia total de una ruta (array de puntos)
 */
export function calculateRouteDistance(points) {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += calculateDistance(
      points[i - 1].latitud, points[i - 1].longitud,
      points[i].latitud, points[i].longitud
    )
  }
  return Math.round(total * 10) / 10
}

/**
 * Estima tiempo en minutos (velocidad promedio 30 km/h)
 */
export function estimateTime(distanceKm) {
  return Math.round((distanceKm / 30) * 60)
}
