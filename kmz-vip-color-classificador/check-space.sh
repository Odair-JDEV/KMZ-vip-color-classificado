#!/bin/bash

# Verificador de Espaço em Disco
# Para sistemas Unix/Linux/macOS

if [ $# -eq 0 ]; then
    echo "=========================================="
    echo "  Verificador de Espaço em Disco"
    echo "=========================================="
    echo ""
    echo "Uso: ./check-space.sh <caminho-para-arquivo.kmz>"
    echo ""
    echo "Este utilitário verifica se há espaço suficiente"
    echo "no disco para processar um arquivo KMZ."
    echo ""
    exit 1
fi

node check-disk-space.js "$1"
