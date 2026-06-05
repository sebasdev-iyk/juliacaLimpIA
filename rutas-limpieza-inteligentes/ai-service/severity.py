"""
Lógica de severidad basada en detecciones.
Convierte objetos detectados → nivel Crítico/Medio/Bajo.
"""

# Umbrales de severidad
CRITICAL_CLASSES = {
    "overflowing dumpster", "overflowing trash can",
    "full garbage container", "overfilled dumpster",
    "garbage pile", "pile of trash",
    "construction debris", "bulky waste", "household waste pile",
}
MEDIUM_CLASSES = {
    "trash bags", "garbage bags", "bolsas de basura",
    "trash on ground", "garbage on ground",
    # Catch-all genérico — cualquier basura genérica es Medio
    "trash", "garbage", "litter", "rubbish", "waste",
    "basura", "residuos", "desperdicios",
    "street litter", "scattered trash",
    "trash on the street", "garbage on the street",
    "waste on the ground", "basura en la calle",
}
LOW_CLASSES = {
    "waste container", "dumpster", "trash can",
    "garbage bin", "recycling bin",
    "large garbage container", "contenedor de basura",
}
# Basura individual regada en el piso (botellas, latas, papeles, etc.)
INDIVIDUAL_TRASH = {
    "bottle", "plastic bottle", "glass bottle", "botella",
    "can", "aluminum can", "lata",
    "paper", "paper waste", "cardboard", "carton",
    "plastic bag", "plastic wrapper", "bolsa plastica",
    "food container", "takeout container",
    "styrofoam cup", "styrofoam",
    "cigarette butt", "cigarette",
    "piece of clothing", "old clothes",
    "tire", "rubber tire",
    "electronic waste",
    "abandoned object", "miscellaneous trash", "basura scattered",
    # Items de calle
    "plastic cup", "paper cup", "disposable cup", "vaso plastico",
    "food wrapper", "snack wrapper", "candy wrapper",
    "shopping bag", "plastic shopping bag", "bolsa de compras",
    "face mask", "medical mask", "mascarilla",
    "fruit", "fruit peel", "cascara",
    "shoe", "old shoe", "zapato",
    "furniture", "old furniture", "mueble",
    "mattress", "colchon",
    "blanket", "old blanket",
    "wood", "scrap wood",
    "metal scrap",
    "pipe", "cable", "wire",
}

# Threshold para considerar "mucha basura regada"
MANY_INDIVIDUAL_THRESHOLD = 2  # >= 2 items individuales → Medio


def compute_severity(detections: list[dict]) -> dict:
    """
    Evalúa las detecciones y devuelve nivel, confianza y prioridad.

    Args:
        detections: lista de {clase, confianza, bbox}

    Returns:
        {nivel, confianza, prioridad, basura_detectada, resumen}
    """
    if not detections:
        return {
            "basura_detectada": False,
            "nivel": "Bajo",
            "confianza": "0%",
            "prioridad": "Baja",
            "resumen": "No se detectaron objetos de interés",
        }

    # Máxima confianza entre todas las detecciones
    max_conf = max(d["confianza"] for d in detections)
    conf_pct = f"{int(max_conf * 100)}%"

    # Clasificar detecciones
    critical_detected = [d for d in detections if d["clase"] in CRITICAL_CLASSES]
    medium_detected = [d for d in detections if d["clase"] in MEDIUM_CLASSES]
    low_detected = [d for d in detections if d["clase"] in LOW_CLASSES]
    individual_detected = [d for d in detections if d["clase"] in INDIVIDUAL_TRASH]

    # ---- Lógica de severidad ----
    # Regla 1: Desborde o acumulación grave → Crítico
    if critical_detected:
        nivel = "Crítico"
        prioridad = "Alta"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    # Regla 2: Bolsas/basura en suelo + cualquier contenedor → Medio
    elif medium_detected and (low_detected or critical_detected):
        nivel = "Medio"
        prioridad = "Media"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    # Regla 3: Muchas basuras individuales regadas (>=3) → Medio
    elif len(individual_detected) >= MANY_INDIVIDUAL_THRESHOLD:
        nivel = "Medio"
        prioridad = "Media"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    # Regla 4: Bolsas sueltas (2+) → Medio
    elif medium_detected and len(medium_detected) >= 2:
        nivel = "Medio"
        prioridad = "Media"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    # Regla 5: Bolsas + basura individual → Medio
    elif medium_detected and individual_detected:
        nivel = "Medio"
        prioridad = "Media"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    # Regla 6: Contenedor limpio + basura individual → Medio
    elif low_detected and individual_detected:
        nivel = "Medio"
        prioridad = "Media"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    # Regla 7: Contenedor solo y limpio → Bajo
    elif low_detected:
        nivel = "Bajo"
        prioridad = "Baja"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    # Regla 8: 1-2 items individuales solos → Bajo
    elif individual_detected:
        nivel = "Bajo"
        prioridad = "Baja"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    # Regla 9: Solo basura menor → Bajo
    else:
        nivel = "Bajo"
        prioridad = "Baja"
        resumen = _build_summary(critical_detected, medium_detected, low_detected, individual_detected)

    return {
        "basura_detectada": len(detections) > 0,
        "nivel": nivel,
        "confianza": conf_pct,
        "prioridad": prioridad,
        "resumen": resumen,
    }


def _build_summary(critical, medium, low, individual=None):
    """Genera resumen legible de las detecciones."""
    parts = []
    for d in critical:
        parts.append(f"{d['clase']} ({d['confianza']:.0%})")
    for d in medium:
        parts.append(f"{d['clase']} ({d['confianza']:.0%})")
    for d in low:
        parts.append(f"{d['clase']} ({d['confianza']:.0%})")
    if individual:
        for d in individual:
            parts.append(f"{d['clase']} ({d['confianza']:.0%})")
    if not parts:
        return "Sin detecciones relevantes"
    return ", ".join(parts[:5])  # máximo 5 objetos


def get_priority_color(nivel: str) -> str:
    """Retorna color CSS para cada nivel."""
    return {
        "Crítico": "#ef4444",
        "Medio": "#eab308",
        "Bajo": "#22c55e",
    }.get(nivel, "#94a3b8")
