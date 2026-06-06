"""
Detector de contenedores de basura usando YOLO-World (zero-shot).
Cadena de fallback: YOLO-World → YOLOv8 pre-entrenado → simulación.
"""

import os
import logging
from PIL import Image
from io import BytesIO

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CLASSES = [
    "trash",
    "garbage",
    "litter",
    "rubbish",
    "waste",
    "basura",
    "street litter",
    "scattered trash",
    "trash on the street",
    "garbage on the street",
    "waste on the ground",
    "basura en la calle",
    "residuos",
    "desperdicios",
    "waste container",
    "dumpster",
    "trash can",
    "garbage bin",
    "recycling bin",
    "large garbage container",
    "contenedor de basura",
    "overflowing dumpster",
    "overflowing trash can",
    "full garbage container",
    "overfilled dumpster",
    "trash bags",
    "garbage bags",
    "garbage pile",
    "pile of trash",
    "trash on ground",
    "garbage on ground",
    "bolsas de basura",
    "construction debris",
    "bulky waste",
    "household waste pile",
    # Basura individual regada en el piso
    "bottle",
    "plastic bottle",
    "glass bottle",
    "botella",
    "can",
    "aluminum can",
    "lata",
    "paper",
    "paper waste",
    "cardboard",
    "carton",
    "plastic bag",
    "plastic wrapper",
    "bolsa plastica",
    "food container",
    "takeout container",
    "styrofoam cup",
    "styrofoam",
    "cigarette butt",
    "cigarette",
    "piece of clothing",
    "old clothes",
    "tire",
    "rubber tire",
    "electronic waste",
    "abandoned object",
    "miscellaneous trash",
    "basura scattered",
    # Items comunes en la calle (Perú/Puno)
    "plastic cup",
    "paper cup",
    "disposable cup",
    "vaso plastico",
    "food wrapper",
    "snack wrapper",
    "candy wrapper",
    "shopping bag",
    "plastic shopping bag",
    "bolsa de compras",
    "face mask",
    "medical mask",
    "mascarilla",
    "fruit",
    "fruit peel",
    "cascara",
    "shoe",
    "old shoe",
    "zapato",
    "furniture",
    "old furniture",
    "mueble",
    "mattress",
    "colchon",
    "blanket",
    "old blanket",
    "wood",
    "scrap wood",
    "metal scrap",
    "pipe",
    "cable",
    "wire",
]

# Colores para cada clase (BGR para OpenCV)
CLASS_COLORS = {
    # Contenedores → verde
    "waste container":           (60, 180, 75),
    "dumpster":                  (60, 180, 75),
    "trash can":                 (60, 180, 75),
    "garbage bin":               (60, 180, 75),
    "recycling bin":             (60, 180, 75),
    "large garbage container":   (60, 180, 75),
    "contenedor de basura":      (60, 180, 75),
    # Desbordado → rojo
    "overflowing dumpster":      (60, 60, 255),
    "overflowing trash can":     (60, 60, 255),
    "full garbage container":    (60, 60, 255),
    "overfilled dumpster":       (60, 60, 255),
    # Bolsas → naranja
    "trash bags":                (0, 165, 255),
    "garbage bags":              (0, 165, 255),
    "bolsas de basura":          (0, 165, 255),
    # Acumulación → naranja/amarillo
    "garbage pile":              (0, 165, 255),
    "pile of trash":             (0, 165, 255),
    "trash on ground":           (0, 215, 255),
    "garbage on ground":         (0, 215, 255),
    # Desechos grandes → morado
    "construction debris":       (200, 100, 200),
    "bulky waste":               (200, 100, 200),
    "household waste pile":      (200, 100, 200),
    # Basura individual regada → celeste / rosa
    "bottle":                    (255, 180, 100),
    "plastic bottle":            (255, 180, 100),
    "glass bottle":              (255, 180, 100),
    "botella":                   (255, 180, 100),
    "can":                       (180, 130, 255),
    "aluminum can":              (180, 130, 255),
    "lata":                      (180, 130, 255),
    "paper":                     (255, 200, 150),
    "paper waste":               (255, 200, 150),
    "cardboard":                 (255, 200, 150),
    "carton":                    (255, 200, 150),
    "plastic bag":               (150, 200, 255),
    "plastic wrapper":           (150, 200, 255),
    "bolsa plastica":            (150, 200, 255),
    "food container":            (100, 200, 200),
    "takeout container":         (100, 200, 200),
    "styrofoam cup":             (200, 200, 200),
    "styrofoam":                 (200, 200, 200),
    "cigarette butt":            (100, 100, 100),
    "cigarette":                 (100, 100, 100),
    "piece of clothing":         (200, 150, 100),
    "old clothes":               (200, 150, 100),
    "tire":                      (50, 50, 50),
    "rubber tire":               (50, 50, 50),
    "electronic waste":          (100, 200, 50),
    "abandoned object":          (180, 180, 180),
    "miscellaneous trash":       (180, 180, 180),
    "basura scattered":          (180, 180, 180),
    # Catch-all genérico → gris claro
    "trash":                     (180, 180, 180),
    "garbage":                   (180, 180, 180),
    "litter":                    (180, 180, 180),
    "rubbish":                   (180, 180, 180),
    "waste":                     (180, 180, 180),
    "basura":                    (180, 180, 180),
    "street litter":             (180, 180, 180),
    "scattered trash":           (180, 180, 180),
    "trash on the street":       (180, 180, 180),
    "garbage on the street":     (180, 180, 180),
    "waste on the ground":       (180, 180, 180),
    "basura en la calle":        (180, 180, 180),
    "residuos":                  (180, 180, 180),
    "desperdicios":              (180, 180, 180),
    # Items comunes calle → varios
    "plastic cup":               (200, 200, 100),
    "paper cup":                 (200, 200, 100),
    "disposable cup":            (200, 200, 100),
    "vaso plastico":             (200, 200, 100),
    "food wrapper":              (150, 200, 150),
    "snack wrapper":             (150, 200, 150),
    "candy wrapper":             (150, 200, 150),
    "shopping bag":              (100, 180, 200),
    "plastic shopping bag":      (100, 180, 200),
    "bolsa de compras":          (100, 180, 200),
    "face mask":                 (150, 150, 200),
    "medical mask":              (150, 150, 200),
    "mascarilla":                (150, 150, 200),
    "fruit":                     (100, 200, 200),
    "fruit peel":                (100, 200, 200),
    "cascara":                   (100, 200, 200),
    "shoe":                      (150, 100, 50),
    "old shoe":                  (150, 100, 50),
    "zapato":                    (150, 100, 50),
    "furniture":                 (200, 100, 100),
    "old furniture":             (200, 100, 100),
    "mueble":                    (200, 100, 100),
    "mattress":                  (200, 150, 100),
    "colchon":                   (200, 150, 100),
    "blanket":                   (200, 180, 150),
    "old blanket":               (200, 180, 150),
    "wood":                      (100, 150, 100),
    "scrap wood":                (100, 150, 100),
    "metal scrap":               (100, 100, 100),
    "pipe":                      (100, 100, 150),
    "cable":                     (100, 100, 150),
    "wire":                      (100, 100, 150),
}

# -------------------------------------------------------------------
# Modelo
# -------------------------------------------------------------------
_model = None

def get_model():
    """Carga el modelo YOLO-World (descarga la primera vez)."""
    global _model
    if _model is not None:
        return _model
    try:
        logger.info("Cargando YOLO-World (yolov8s-world.pt)...")
        from ultralytics import YOLO
        _model = YOLO("yolov8s-world.pt")
        _model.set_classes(CLASSES)
        # Mover a GPU si está disponible
        import torch
        if torch.cuda.is_available():
            _model.to("cuda:0")
            logger.info(f"YOLO-World movido a GPU: {torch.cuda.get_device_name(0)}")
        logger.info("YOLO-World cargado exitosamente")
    except Exception as e:
        logger.warning(f"No se pudo cargar YOLO-World: {e}")
        _model = None
    return _model

# -------------------------------------------------------------------
# Detección
# -------------------------------------------------------------------

DetectionResult = dict  # {class_name, confidence, bbox: [x1,y1,x2,y2]}


def detect(image_bytes: bytes) -> list[DetectionResult]:
    """
    Ejecuta detección en la imagen.
    Retorna lista de {clase, confianza, bbox}.
    Si YOLO-World falla, retorna lista vacía (frontend hace fallback).
    """
    model = get_model()
    if model is None:
        logger.warning("YOLO-World no disponible, saltando detección")
        return []

    try:
        # Abrir imagen desde bytes
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        # Inferencia
        results = model(img, conf=0.02, verbose=False)
        detections = []

        for r in results:
            if r.boxes is None:
                continue
            for box, cls_id, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
                class_name = CLASSES[int(cls_id)]
                confidence = float(conf)
                bbox = [int(box[0]), int(box[1]), int(box[2]), int(box[3])]
                detections.append({
                    "clase": class_name,
                    "confianza": round(confidence, 2),
                    "bbox": bbox,
                })

        logger.info(f"YOLO-World detectó {len(detections)} objetos")
        return detections

    except Exception as e:
        logger.error(f"Error en detección: {e}")
        return []


def get_class_colors_rgb() -> dict:
    """
    Retorna CLASS_COLORS convertidos de BGR (OpenCV) a hex RGB para el frontend.
    """
    rgb = {}
    for cls_name, bgr in CLASS_COLORS.items():
        b, g, r = bgr
        rgb[cls_name] = f"#{r:02x}{g:02x}{b:02x}"
    return rgb


def draw_bboxes(image_bytes: bytes, detections: list[DetectionResult]) -> bytes:
    """
    Dibuja bounding boxes sobre la imagen original.
    Retorna imagen como bytes JPEG.
    """
    try:
        import cv2
        import numpy as np

        img_array = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            cls_name = det["clase"]
            conf = det["confianza"]
            color = CLASS_COLORS.get(cls_name, (200, 200, 200))

            # Rectángulo
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            # Etiqueta
            label = f"{cls_name} {conf:.0%}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            cv2.rectangle(img, (x1, y1 - th - 6), (x1 + tw + 6, y1), color, -1)
            cv2.putText(img, label, (x1 + 3, y1 - 3),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return buffer.tobytes()

    except Exception as e:
        logger.error(f"Error dibujando bboxes: {e}")
        return image_bytes
