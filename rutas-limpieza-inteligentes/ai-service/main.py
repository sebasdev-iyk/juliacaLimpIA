"""
API REST para análisis de imágenes de contenedores de basura.
POST /analyze → imagen → YOLO-World → severidad → JSON + imagen anotada

Endpoints:
  POST /analyze   → análisis completo
  GET  /health    → health check
  GET  /status    → estado del modelo
"""

import base64
import io
import logging
import os
import sys

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse

from detector import detect, draw_bboxes, get_model, get_class_colors_rgb
from severity import compute_severity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Waste Container AI Detector",
    description="Detección de contenedores desbordados con YOLO-World",
    version="1.0.0",
)

# CORS — permitir requests desde el frontend Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------------

@app.get("/health")
async def health():
    """Health check simple."""
    return {"status": "ok"}


@app.get("/status")
async def status():
    """Estado del modelo cargado."""
    model = get_model()
    return {
        "modelo": "YOLO-World (yolov8s-world.pt)" if model else "No disponible",
        "cargado": model is not None,
        "clases": [
            "waste container", "dumpster", "overflowing dumpster",
            "trash bags", "garbage pile", "garbage on ground",
            "recycling bin", "contenedor de basura", "bolsas de basura",
        ],
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Analiza una imagen de contenedor/basura.
    
    Args:
        file: imagen JPEG/PNG
    
    Returns:
        JSON con detecciones, severidad, imagen anotada (base64) y colores por clase
        Esto permite al frontend renderizar bounding boxes interactivos en SVG.
    """
    # Validar tipo de archivo
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Solo se aceptan imágenes")

    # Leer imagen
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(400, "Imagen vacía")

    # Detectar objetos (UNA SOLA inferencia)
    detections = detect(image_bytes)

    # Calcular severidad
    severity = compute_severity(detections)

    # Dibujar bounding boxes sobre la imagen
    annotated_bytes = draw_bboxes(image_bytes, detections)
    annotated_b64 = base64.b64encode(annotated_bytes).decode("utf-8")

    # Colores de clases BGR→hex para el frontend
    class_colors = get_class_colors_rgb()

    # Resultado final con imagen incluida
    result = {
        "basura_detectada": severity["basura_detectada"],
        "nivel": severity["nivel"],
        "confianza": severity["confianza"],
        "prioridad": severity["prioridad"],
        "resumen": severity["resumen"],
        "objetos": detections,
        "total_objetos": len(detections),
        "tipos_detectados": list(set(d["clase"] for d in detections)),
        "metodo": "YOLO-World (zero-shot)",
        "imagen_anotada_b64": annotated_b64,
        "colores_clases": class_colors,
    }

    return JSONResponse(content=result)


@app.post("/analyze-with-image")
async def analyze_with_image(file: UploadFile = File(...)):
    """
    Analiza la imagen y devuelve JSON + la imagen anotada como JPEG.
    Útil para mostrar bounding boxes en el frontend.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Solo se aceptan imágenes")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(400, "Imagen vacía")

    detections = detect(image_bytes)
    annotated = draw_bboxes(image_bytes, detections)
    severity = compute_severity(detections)

    return Response(
        content=annotated,
        media_type="image/jpeg",
        headers={
            "X-Detections": str(len(detections)),
            "X-Severity": severity["nivel"],
            "X-Confidence": severity["confianza"],
            "X-Summary": severity["resumen"],
        },
    )


# -------------------------------------------------------------------
# Entry point
# -------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Iniciando servidor en puerto {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
