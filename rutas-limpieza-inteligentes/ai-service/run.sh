#!/bin/bash
# Inicia el servicio de IA para detección de contenedores
# Uso: ./run.sh [puerto]

PORT=${1:-8000}

echo "======================================"
echo "  🗑️  Waste Container AI Detector"
echo "======================================"
echo "  Puerto: $PORT"
echo "  Modelo: YOLO-World (zero-shot)"
echo "  Clases: contenedor, desborde, bolsas"
echo "  GPU:    $(python3 -c 'import torch; print("Sí" if torch.cuda.is_available() else "No")')"
echo "======================================"
echo ""

export PORT="$PORT"
cd "$(dirname "$0")"
python3 main.py
