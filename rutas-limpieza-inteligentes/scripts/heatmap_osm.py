"""
Mapa de Calor Interactivo — Puntos de Residuos en Juliaca (OpenStreetMap + Folium)
==================================================================================
Extrae coordenadas de puntos de interés (contenedores, basura, reciclaje) desde
OpenStreetMap usando OSMnx, genera un heatmap interactivo con Folium y lo exporta
a HTML.

Librerías necesarias:
    pip install osmnx folium pandas

Autor: Juliaca LimpIA — Sistema de Recolección Inteligente
"""

import osmnx as ox
import folium
from folium.plugins import HeatMap
import pandas as pd

# ─── 1. CONFIGURACIÓN ────────────────────────────────────────────────────

CIUDAD = "Juliaca, San Roman, Puno, Peru"
TAGS = {
    "amenity": ["waste_basket", "waste_disposal", "recycling", "recycling:container"],
    "landuse": ["landfill", "waste"],
    "man_made": ["wastewater_plant"],
}
RADIO = 0.02  # Radio del heatmap (grados)
BLUR = 0.015  # Desenfoque
OPACIDAD_MIN = 0.2
ARCHIVO_SALIDA = "heatmap_juliaca_residuos.html"

# ─── 2. EXTRACCIÓN ───────────────────────────────────────────────────────

print(f"🔍 Descargando puntos de residuos en: {CIUDAD}")
print(f"   Tags: {TAGS}")
print()

try:
    gdf = ox.geometries_from_place(CIUDAD, tags=TAGS)
except Exception as e:
    print(f"⚠️  Error con OSMnx: {e}")
    print("   Intentando con Overpass API directamente...")
    # Fallback: usar overpass para consulta más simple
    import overpass
    api = overpass.API()
    query = f"""
    area["name"="Juliaca"]["admin_level"="8"]->.a;
    (
      node(area.a)[amenity=waste_basket];
      node(area.a)[amenity=waste_disposal];
      node(area.a)[amenity=recycling];
    );
    out center;
    """
    response = api.get(query)
    coords_raw = [(el.lat, el.lon) for el in response.elements if hasattr(el, 'lat')]
    df = pd.DataFrame(coords_raw, columns=["lat", "lon"])
    print(f"   Extraídos {len(df)} puntos vía Overpass\n")
else:
    print(f"   Extraídos {len(gdf)} elementos de OSM\n")

    # ─── 3. PROCESAMIENTO ────────────────────────────────────────────────

    if gdf.empty:
        print("⚠️  No se encontraron datos. Usando coordenadas simuladas basadas en Juliaca.")
        # Datos de ejemplo cerca de la Plaza de Armas de Juliaca
        coords_ejemplo = [
            (-15.4908, -70.1325), (-15.4915, -70.1330), (-15.4895, -70.1315),
            (-15.4920, -70.1340), (-15.4900, -70.1300), (-15.4912, -70.1350),
            (-15.4885, -70.1290), (-15.4930, -70.1360), (-15.4890, -70.1280),
            (-15.4925, -70.1310), (-15.4903, -70.1335), (-15.4918, -70.1320),
            (-15.4898, -70.1345), (-15.4922, -70.1305), (-15.4905, -70.1310),
            (-15.4910, -70.1365), (-15.4880, -70.1320), (-15.4935, -70.1330),
        ]
        df = pd.DataFrame(coords_ejemplo, columns=["lat", "lon"])
    else:
        # Extraer centroides de geometrías
        if "geometry" in gdf.columns:
            coords = gdf["geometry"].centroid.apply(lambda p: (p.y, p.x))
        else:
            coords = gdf[["lat", "lon"]].dropna()
        df = pd.DataFrame(coords.tolist(), columns=["lat", "lon"]) if hasattr(coords, 'tolist') else coords

# ─── 4. MAPA BASE ─────────────────────────────────────────────────────────

centro_lat = df["lat"].mean()
centro_lon = df["lon"].mean()

mapa = folium.Map(
    location=[centro_lat, centro_lon],
    zoom_start=14,
    tiles="OpenStreetMap",
    control_scale=True,
)

# ─── 5. CAPA DE CALOR ─────────────────────────────────────────────────────

datos_heatmap = df[["lat", "lon"]].values.tolist()

HeatMap(
    datos_heatmap,
    radius=RADIO * 1000,      # Escalar para visualización
    blur=BLUR * 1000,
    min_opacity=OPACIDAD_MIN,
    gradient={
        0.2: "#10b981",       # Verde (bajo)
        0.5: "#f59e0b",       # Ámbar (medio)
        0.8: "#ef4444",       # Rojo (alto)
    },
    name="Densidad de Residuos",
    control=True,
).add_to(mapa)

# ─── 6. CAPA DE PUNTOS (opcional) ────────────────────────────────────────

for _, row in df.iterrows():
    folium.CircleMarker(
        location=[row["lat"], row["lon"]],
        radius=4,
        color="#135C3A",
        fill=True,
        fill_color="#52B788",
        fill_opacity=0.7,
        weight=1,
    ).add_to(mapa)

folium.LayerControl().add_to(mapa)

# ─── 7. EXPORTACIÓN ───────────────────────────────────────────────────────

mapa.save(ARCHIVO_SALIDA)
print(f"✅ Heatmap guardado: {ARCHIVO_SALIDA}")
print(f"   Total puntos: {len(df)}")
print(f"   Centro: ({centro_lat:.4f}, {centro_lon:.4f})")
print(f"   Abre el archivo en tu navegador para verlo.")
