/**
 * Simula análisis de imagen con IA.
 * En una versión real, aquí iría YOLOv8 o un modelo similar.
 *
 * Reglas de simulación:
 * - Si el nombre del archivo incluye "critico" → nivel Crítico
 * - Si incluye "medio" → nivel Medio
 * - Si incluye "bajo" → nivel Bajo
 * - Si no se especifica, se asigna aleatoriamente
 * - También permite selección manual para demo
 */

const LEVELS = ['Bajo', 'Medio', 'Crítico']

export function fakeImageAnalyzer(imageFile, manualLevel = null) {
  // Si el usuario eligió manualmente, usar ese nivel
  if (manualLevel) {
    return buildResult(manualLevel)
  }

  // Si hay un archivo con nombre indicativo
  if (imageFile?.name) {
    const name = imageFile.name.toLowerCase()
    if (name.includes('critico') || name.includes('crit')) return buildResult('Crítico')
    if (name.includes('medio')) return buildResult('Medio')
    if (name.includes('bajo') || name.includes('baja')) return buildResult('Bajo')
  }

  // Si no hay pista, asignar aleatorio controlado
  // (70% crítico o medio para que la demo se vea interesante)
  const rand = Math.random()
  if (rand < 0.4) return buildResult('Crítico')
  if (rand < 0.75) return buildResult('Medio')
  return buildResult('Bajo')
}

function buildResult(level) {
  const confidences = {
    Crítico: 0.85 + Math.random() * 0.14,
    Medio: 0.75 + Math.random() * 0.2,
    Bajo: 0.7 + Math.random() * 0.25,
  }
  const confidence = Math.round(confidences[level] * 100)

  return {
    basura_detectada: true,
    nivel: level,
    confianza: `${confidence}%`,
    prioridad: level === 'Crítico' ? 'Alta' : level === 'Medio' ? 'Media' : 'Baja',
  }
}
