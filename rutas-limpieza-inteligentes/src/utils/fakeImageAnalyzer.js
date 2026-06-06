function randBox(w, h) {
  const cw = w * (0.15 + Math.random() * 0.4)
  const ch = h * (0.15 + Math.random() * 0.4)
  const x = Math.random() * (w - cw)
  const y = Math.random() * (h - ch)
  return [Math.floor(x), Math.floor(y), Math.floor(x + cw), Math.floor(y + ch)]
}

const CLASSES = [
  'bolsa de basura', 'contenedor', 'residuos plásticos',
  'papeles', 'residuos orgánicos', 'escombros',
  'botella PET', 'caja de cartón', 'lata',
]

const CLASS_COLORS = {
  'bolsa de basura': '#ef4444',
  'contenedor': '#f59e0b',
  'residuos plásticos': '#3b82f6',
  'papeles': '#10b981',
  'residuos orgánicos': '#8b5cf6',
  'escombros': '#ec4899',
  'botella PET': '#06b6d4',
  'caja de cartón': '#f97316',
  'lata': '#84cc16',
}

const LEVELS = ['Bajo', 'Medio', 'Crítico']

export function fakeImageAnalyzer(imageFile, manualLevel = null) {
  if (manualLevel) {
    return buildResult(manualLevel, 640, 480)
  }

  if (imageFile?.name) {
    const name = imageFile.name.toLowerCase()
    if (name.includes('critico') || name.includes('crit')) return buildResult('Crítico', 640, 480)
    if (name.includes('medio')) return buildResult('Medio', 640, 480)
    if (name.includes('bajo') || name.includes('baja')) return buildResult('Bajo', 640, 480)
  }

  const rand = Math.random()
  if (rand < 0.4) return buildResult('Crítico', 640, 480)
  if (rand < 0.75) return buildResult('Medio', 640, 480)
  return buildResult('Bajo', 640, 480)
}

function buildResult(level, imgW, imgH) {
  const confidences = {
    Crítico: 0.85 + Math.random() * 0.14,
    Medio: 0.75 + Math.random() * 0.2,
    Bajo: 0.7 + Math.random() * 0.25,
  }
  const confidence = Math.round(confidences[level] * 100)

  const numObj = level === 'Crítico' ? 4 + Math.floor(Math.random() * 3) : level === 'Medio' ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2)

  const objetos = []
  const clasesUsadas = new Set()
  for (let i = 0; i < numObj; i++) {
    const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)]
    clasesUsadas.add(cls)
    objetos.push({
      clase: cls,
      confianza: 0.5 + Math.random() * 0.5,
      bbox: randBox(imgW, imgH),
    })
  }

  const coloresClases = {}
  for (const c of clasesUsadas) {
    coloresClases[c] = CLASS_COLORS[c] || '#cccccc'
  }

  return {
    basura_detectada: true,
    nivel: level,
    confianza: `${confidence}%`,
    prioridad: level === 'Crítico' ? 'Alta' : level === 'Medio' ? 'Media' : 'Baja',
    objetos,
    coloresClases,
  }
}
