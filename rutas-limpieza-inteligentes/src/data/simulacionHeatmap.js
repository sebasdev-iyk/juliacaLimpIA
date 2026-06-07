export const ZONAS_JULIACA = [
  { nombre: 'Plaza de Armas', lat: -15.4908, lng: -70.1325, peso: 1.0 },
  { nombre: 'Mercado Santa Bárbara', lat: -15.4902, lng: -70.1348, peso: 0.95 },
  { nombre: 'Terminal Terrestre', lat: -15.4942, lng: -70.1372, peso: 0.8 },
  { nombre: 'Av. Circunvalación', lat: -15.4925, lng: -70.1285, peso: 0.7 },
  { nombre: 'Zona Industrial', lat: -15.4955, lng: -70.1405, peso: 0.75 },
  { nombre: 'Universidad Andina', lat: -15.4872, lng: -70.1202, peso: 0.6 },
  { nombre: 'Barrio La Era', lat: -15.4892, lng: -70.1262, peso: 0.5 },
  { nombre: 'Cerro Santa Bárbara', lat: -15.4862, lng: -70.1352, peso: 0.4 },
  { nombre: 'Salida Cusco', lat: -15.4852, lng: -70.1152, peso: 0.55 },
  { nombre: 'Salida Arequipa', lat: -15.4982, lng: -70.1382, peso: 0.5 },
  { nombre: 'Estadio', lat: -15.4882, lng: -70.1302, peso: 0.45 },
  { nombre: 'Aeropuerto', lat: -15.4772, lng: -70.1572, peso: 0.3 },
]

const NIVELES = ['Bajo', 'Medio', 'Crítico']
const ESTADOS = ['Pendiente', 'En proceso', 'Resuelto']

function randomAround(base, spread) {
  return base + (Math.random() - 0.5) * spread
}

function generateDailyReports(zona, date, count) {
  const reports = []
  for (let i = 0; i < count; i++) {
    const nivel = NIVELES[Math.random() < 0.15 ? 2 : Math.random() < 0.45 ? 1 : 0]
    const estado = Math.random() < 0.3 ? 'Resuelto' : Math.random() < 0.5 ? 'En proceso' : 'Pendiente'
    const confianza = nivel === 'Crítico'
      ? (85 + Math.random() * 14).toFixed(0)
      : nivel === 'Medio'
        ? (75 + Math.random() * 20).toFixed(0)
        : (70 + Math.random() * 25).toFixed(0)

    reports.push({
      id: `sim-${date.getTime()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      zona: zona.nombre,
      descripcion: `Reporte simulado en ${zona.nombre}`,
      latitud: randomAround(zona.lat, 0.003),
      longitud: randomAround(zona.lng, 0.003),
      nivel,
      confianza: `${confianza}%`,
      prioridad: nivel === 'Crítico' ? 'Alta' : nivel === 'Medio' ? 'Media' : 'Baja',
      estado,
      fecha: date.toLocaleDateString('es-PE', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      simulado: true,
      timestamp: date.getTime(),
    })
  }
  return reports
}

export function generarSimulacion(diasAtras = 90) {
  const hoy = new Date()
  const todos = []

  ZONAS_JULIACA.forEach(zona => {
    for (let d = 0; d < diasAtras; d++) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - d)

      const baseDiaria = Math.round(zona.peso * (1.5 + Math.random() * 2.5))
      const varDiaria = Math.random() < 0.2 ? Math.round(3 + Math.random() * 5) : 0
      const total = baseDiaria + varDiaria

      if (total > 0) {
        const reports = generateDailyReports(zona, fecha, total)
        todos.push(...reports)
      }
    }
  })

  return todos.sort((a, b) => b.timestamp - a.timestamp)
}

export function generarPuntosKDE(simData, nivelFiltro = 'Todos', estadoFiltro = 'Todos', diasFiltro = 90) {
  const hoy = new Date()
  const corte = new Date(hoy)
  corte.setDate(corte.getDate() - diasFiltro)

  const filtrados = simData.filter(r => {
    const d = new Date(r.timestamp)
    if (d < corte) return false
    if (nivelFiltro !== 'Todos' && r.nivel !== nivelFiltro) return false
    if (estadoFiltro !== 'Todos' && r.estado !== estadoFiltro) return false
    return true
  })

  // Generar puntos expandidos para KDE (cada reporte genera dispersión)
  const puntos = []
  filtrados.forEach(r => {
    const intensidad = r.nivel === 'Crítico' ? 1.0 : r.nivel === 'Medio' ? 0.6 : 0.3
    const n = r.nivel === 'Crítico' ? 6 : r.nivel === 'Medio' ? 4 : 2
    puntos.push([r.latitud, r.longitud, intensidad])
    for (let i = 0; i < n; i++) {
      puntos.push([
        r.latitud + (Math.random() - 0.5) * 0.004,
        r.longitud + (Math.random() - 0.5) * 0.004,
        Math.max(intensidad * (0.3 + Math.random() * 0.5), 0.1),
      ])
    }
  })
  return puntos
}
