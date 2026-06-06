/**
 * Servicio de análisis de imágenes con IA.
 * Usa exclusivamente el microservicio YOLO-World (localhost:8000).
 * Sin fallback simulado.
 */

const AI_SERVICE_URL = 'http://localhost:8000'
const TIMEOUT_MS = 30000

export async function analyzeImage(imageFile, manualLevel = null) {
  const log = (msg, data) => console.log(`[${new Date().toLocaleTimeString()}] aiAnalyzer: ${msg}`, data ?? '')

  if (manualLevel) {
    return buildManualResult(manualLevel)
  }

  if (!imageFile) {
    throw new Error('Se requiere una imagen para analizar')
  }

  log('enviando imagen al backend...', { size: imageFile.size, name: imageFile.name })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Backend respondió con error ${response.status}`)
    }

    const data = await response.json()
    log('backend respondió exitosamente', {
      objetos: data.objetos?.length,
      nivel: data.nivel,
      tiene_imagen_anotada: !!data.imagen_anotada_b64,
    })

    return {
      basura_detectada: data.basura_detectada,
      nivel: data.nivel,
      confianza: data.confianza,
      prioridad: data.prioridad,
      resumen: data.resumen,
      objetos: data.objetos || [],
      metodo: data.metodo || 'YOLO-World',
      es_real: true,
      imagen_anotada_b64: data.imagen_anotada_b64 || null,
      colores_clases: data.colores_clases || {},
    }
  } catch (e) {
    clearTimeout(timeout)
    log('ERROR:', e.message)
    throw new Error(`No se pudo analizar la imagen: ${e.message}`)
  }
}

function buildManualResult(level) {
  const confidences = { Crítico: '92%', Medio: '84%', Bajo: '76%' }
  return {
    basura_detectada: true,
    nivel: level,
    confianza: confidences[level] || '80%',
    prioridad: level === 'Crítico' ? 'Alta' : level === 'Medio' ? 'Media' : 'Baja',
    resumen: `Nivel ${level} (selección manual)`,
    metodo: 'Manual',
    es_real: false,
    objetos: [],
    imagen_anotada_b64: null,
    colores_clases: {},
  }
}
