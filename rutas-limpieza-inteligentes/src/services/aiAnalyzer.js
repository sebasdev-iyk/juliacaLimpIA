/**
 * Servicio de análisis de imágenes con IA.
 * Cadena de intentos:
 *   1. YOLO-World (microservicio Python localhost:8000) — endpoint único
 *   2. Fallback: fakeImageAnalyzer (simulación)
 */

import { fakeImageAnalyzer } from '../utils/fakeImageAnalyzer'

const AI_SERVICE_URL = 'http://localhost:8000'
const TIMEOUT_MS = 8000

/**
 * Analiza una imagen con el servicio AI.
 * El endpoint /analyze devuelve JSON con detecciones + imagen anotada en base64 + colores.
 * @param {File|null} imageFile - Archivo de imagen a analizar
 * @param {string|null} manualLevel - Nivel manual (Bajo/Medio/Crítico)
 * @returns {Promise<object>} Resultado del análisis
 */
export async function analyzeImage(imageFile, manualLevel = null) {
  // Si el usuario eligió nivel manual, respetarlo
  if (manualLevel) {
    return buildManualResult(manualLevel)
  }

  // Intentar API real primero
  if (imageFile) {
    try {
      const result = await tryApiAnalysis(imageFile)
      if (result) return result
    } catch (e) {
      console.warn('API AI no disponible, usando simulación:', e.message)
    }
  }

  // Fallback: usar fakeImageAnalyzer
  const simulated = trySimulatedAnalysis(imageFile)
  simulated.fallback_simulado = true
  return simulated
}

/**
 * Llama al microservicio YOLO-World (endpoint único /analyze).
 * Retorna JSON con detecciones, imagen base64, y colores de clases.
 */
async function tryApiAnalysis(imageFile) {
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
      throw new Error(`API responded with ${response.status}`)
    }

    const data = await response.json()

    return {
      basura_detectada: data.basura_detectada,
      nivel: data.nivel,
      confianza: data.confianza,
      prioridad: data.prioridad,
      resumen: data.resumen,
      objetos: data.objetos || [],
      metodo: data.metodo || 'YOLO-World',
      es_real: true,
      // Nuevos campos para bounding boxes interactivos
      imagen_anotada_b64: data.imagen_anotada_b64 || null,
      colores_clases: data.colores_clases || {},
    }
  } catch (e) {
    clearTimeout(timeout)
    throw e
  }
}

/**
 * Fallback: análisis simulado con fakeImageAnalyzer.
 */
function trySimulatedAnalysis(imageFile) {
  const analysis = fakeImageAnalyzer(imageFile, null)
  return {
    ...analysis,
    metodo: 'Simulado',
    resumen: `Nivel ${analysis.nivel} (simulación)`,
    es_real: false,
    objetos: [],
    imagen_anotada_b64: null,
    colores_clases: {},
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
