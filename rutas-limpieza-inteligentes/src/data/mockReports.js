/**
 * Datos simulados de Juliaca para la demo — JulIAca LimpIA
 */

export const JULIACA_CENTER = [-15.4911, -70.1331]
// Alias legacy
export const PUNO_CENTER = JULIACA_CENTER

// Zonas predefinidas con coordenadas
export const INITIAL_REPORTS = [
  {
    id: 1,
    zona: 'Plaza de Armas de Juliaca',
    descripcion: 'Acumulación de bolsas de basura en la plaza central',
    latitud: -15.4908,
    longitud: -70.1325,
    nivel: 'Medio',
    confianza: '87%',
    prioridad: 'Media',
    estado: 'Pendiente',
    imagen: '🏛️',
    fecha: '2026-05-17',
  },
  {
    id: 2,
    zona: 'Mercado Santa Bárbara',
    descripcion: 'Contenedores desbordados de residuos orgánicos',
    latitud: -15.4905,
    longitud: -70.1345,
    nivel: 'Crítico',
    confianza: '93%',
    prioridad: 'Alta',
    estado: 'Pendiente',
    imagen: '🏪',
    fecha: '2026-05-18',
  },
  {
    id: 3,
    zona: 'Terminal Terrestre',
    descripcion: 'Residuos plásticos dispersos en la entrada',
    latitud: -15.4940,
    longitud: -70.1370,
    nivel: 'Medio',
    confianza: '81%',
    prioridad: 'Media',
    estado: 'Pendiente',
    imagen: '🚌',
    fecha: '2026-05-17',
  },
  {
    id: 4,
    zona: 'Universidad Andina',
    descripcion: 'Acumulación de papel y residuos de oficina',
    latitud: -15.4870,
    longitud: -70.1200,
    nivel: 'Bajo',
    confianza: '76%',
    prioridad: 'Baja',
    estado: 'Pendiente',
    imagen: '🎓',
    fecha: '2026-05-16',
  },
  {
    id: 5,
    zona: 'Av. Circunvalación',
    descripcion: 'Escombros de construcción en la vereda',
    latitud: -15.4920,
    longitud: -70.1280,
    nivel: 'Crítico',
    confianza: '91%',
    prioridad: 'Alta',
    estado: 'Pendiente',
    imagen: '🏗️',
    fecha: '2026-05-18',
  },
  {
    id: 6,
    zona: 'Zona Industrial',
    descripcion: 'Residuos industriales acumulados',
    latitud: -15.4950,
    longitud: -70.1400,
    nivel: 'Crítico',
    confianza: '88%',
    prioridad: 'Alta',
    estado: 'Pendiente',
    imagen: '🏭',
    fecha: '2026-05-18',
  },
  {
    id: 7,
    zona: 'Barrio La Era',
    descripcion: 'Basura doméstica acumulada en la esquina',
    latitud: -15.4890,
    longitud: -70.1260,
    nivel: 'Bajo',
    confianza: '72%',
    prioridad: 'Baja',
    estado: 'Pendiente',
    imagen: '🏘️',
    fecha: '2026-05-16',
  },
]

// Zonas disponibles para nuevos reportes
export const ZONES = [
  'Plaza de Armas de Juliaca',
  'Mercado Santa Bárbara',
  'Terminal Terrestre',
  'Universidad Andina',
  'Av. Circunvalación',
  'Zona Industrial',
  'Barrio La Era',
  'Cerro Santa Bárbara',
  'Salida Cusco',
  'Salida Arequipa',
  'Estadio',
  'Aeropuerto',
]

// Coordenadas de cada zona
export const ZONE_COORDS = {
  'Plaza de Armas de Juliaca': { lat: -15.4908, lng: -70.1325 },
  'Mercado Santa Bárbara': { lat: -15.4905, lng: -70.1345 },
  'Terminal Terrestre': { lat: -15.4940, lng: -70.1370 },
  'Universidad Andina': { lat: -15.4870, lng: -70.1200 },
  'Av. Circunvalación': { lat: -15.4920, lng: -70.1280 },
  'Zona Industrial': { lat: -15.4950, lng: -70.1400 },
  'Barrio La Era': { lat: -15.4890, lng: -70.1260 },
  'Cerro Santa Bárbara': { lat: -15.4860, lng: -70.1350 },
  'Salida Cusco': { lat: -15.4850, lng: -70.1150 },
  'Salida Arequipa': { lat: -15.4980, lng: -70.1380 },
  'Estadio': { lat: -15.4880, lng: -70.1300 },
  'Aeropuerto': { lat: -15.4770, lng: -70.1570 },
}

// Punto de inicio para rutas (Municipalidad / Plaza de Armas)
export const START_POINT = { latitud: -15.4908, longitud: -70.1325 }

// Punto de la municipalidad
export const START_DISPLAY = { lat: -15.4908, lng: -70.1325 }
