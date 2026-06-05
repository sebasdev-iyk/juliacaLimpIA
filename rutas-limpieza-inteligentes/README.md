# 🗑️ Rutas de Limpieza Inteligentes

**Prototipo para Hackathon 2026**

> "De rutas fijas a rutas inteligentes basadas en fotos reales y ubicación GPS."

## ¿Qué es?

Una demo funcional que muestra cómo optimizar el recojo de basura en la ciudad de **Puno** usando fotos, geolocalización y un algoritmo simple de rutas inteligentes.

## Problema que resuelve

Las rutas fijas de recolección de basura no responden a la demanda real. Esto genera acumulación de residuos en zonas críticas, pérdida de tiempo y combustible. Este sistema permite:

1. 📸 Reportar acumulaciones con foto
2. 🤖 Analizar el nivel de residuos (simulado con IA)
3. 🗺️ Visualizar puntos críticos en el mapa
4. 🚛 Generar una ruta inteligente que prioriza lo más urgente

## Flujo principal

```
FOTO → ANÁLISIS → REPORTE EN MAPA → RUTA INTELIGENTE
```

## Tecnologías

- **React 18** — interfaz de usuario
- **Leaflet + react-leaflet** — mapas interactivos
- **Lucide React** — iconos
- **Vite 5** — bundler rápido
- **JavaScript (ES modules)** — lógica de negocio

## Estructura del proyecto

```
src/
├── components/
│   ├── MapView.jsx       # Mapa con marcadores y ruta
│   ├── ReportForm.jsx    # Formulario de nuevo reporte
│   ├── StatsCards.jsx    # Tarjetas de estadísticas
│   └── RoutePanel.jsx    # Panel de ruta generada
├── data/
│   └── mockReports.js    # Datos simulados de Puno
├── utils/
│   ├── distance.js       # Cálculo de distancia Haversine
│   ├── fakeImageAnalyzer.js  # Simulación de análisis IA
│   └── routeOptimizer.js     # Algoritmo de ruta inteligente
├── App.jsx               # Componente principal
├── main.jsx              # Entry point
└── styles.css            # Estilos globales
```

## Cómo ejecutar

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

Abrir [http://localhost:5173](http://localhost:5173)

## Cómo usar la demo

1. **Agregar reporte:** Usa el formulario lateral. Sube una imagen (o usa imagen de prueba), selecciona zona, y haz clic en "Analizar con IA" o elige nivel manual.
2. **Ver en mapa:** El reporte aparece como marcador en el mapa. Verde = Bajo, Amarillo = Medio, Rojo = Crítico.
3. **Generar ruta:** Presiona "Generar Ruta Inteligente". El sistema ordena los puntos por prioridad y cercanía.
4. **Ver resultados:** El panel muestra distancia, tiempo, ahorro y el orden de atención.

## ¿Qué es simulado?

| Parte | Estado | Nota |
|-------|--------|------|
| Análisis de imagen | ⚡ Simulado | Devuelve resultado según nombre de archivo o nivel manual |
| Coordenadas GPS | ⚡ Simulado | Usa coordenadas predefinidas de Puno |
| Datos de combustible/CO₂ | ⚡ Estimaciones | Cálculo basado en distancia |
| Algoritmo de ruta | ✅ Real | Vecino más cercano con prioridad por nivel |

## Conectar IA real después

El archivo `src/utils/fakeImageAnalyzer.js` tiene la estructura lista. Solo reemplaza la función interna por una llamada a:
- YOLOv8 local (Python + ONNX)
- API de Google Cloud Vision
- API de OpenAI Vision

El algoritmo espera un objeto con `{ basura_detectada, nivel, confianza, prioridad }`.

## Algoritmo de ruta inteligente

```
1. Ordenar reportes por prioridad (Crítico > Medio > Bajo)
2. Empezar desde la Municipalidad de Puno
3. Para cada grupo de prioridad:
   - Elegir el punto más cercano al actual
   - Avanzar a ese punto
4. Calcular distancia total, tiempo estimado y ahorro
```

## Zonas de Puno incluidas

Plaza de Armas, Mercado Central, Terminal Terrestre, UNA Puno, Av. El Sol, Puerto de Puno, Barrio Bellavista, y más.

## Licencia

Hackathon 2026 — Demostración educativa
