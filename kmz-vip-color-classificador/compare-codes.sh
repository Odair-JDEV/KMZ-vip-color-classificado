#!/bin/bash

# Comparador de Códigos - Linux/macOS
# Compara dois arquivos de códigos e identifica os não enviados

if [ $# -lt 2 ]; then
    echo "=========================================="
    echo "  Comparador de Códigos KMZ"
    echo "=========================================="
    echo ""
    echo "Uso: ./compare-codes.sh <arquivo1> <arquivo2>"
    echo ""
    echo "Parâmetros:"
    echo "  arquivo1 - Códigos já enviados/processados"
    echo "  arquivo2 - Códigos novos para verificar"
    echo ""
    echo "Exemplos:"
    echo "  ./compare-codes.sh 1Codigos-salvos-regularizado.txt 2Codigos-salvos-regularizado.txt"
    echo "  ./compare-codes.sh enviados.txt novos.txt"
    echo ""
    echo "Arquivos gerados:"
    echo "  • naoenviados.txt - Códigos não enviados"
    echo "  • relatorio-comparacao.txt - Relatório detalhado"
    echo ""
    exit 1
fi

FILE1="$1"
FILE2="$2"

if [ ! -f "$FILE1" ]; then
    echo "❌ Arquivo 1 não encontrado: $FILE1"
    exit 1
fi

if [ ! -f "$FILE2" ]; then
    echo "❌ Arquivo 2 não encontrado: $FILE2"
    exit 1
fi

echo "=========================================="
echo "  Comparador de Códigos KMZ"
echo "=========================================="
echo ""
echo "📁 Arquivo 1: $(basename "$FILE1")"
echo "📁 Arquivo 2: $(basename "$FILE2")"
echo ""

node compare-codes.js "$FILE1" "$FILE2"

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Comparação concluída com sucesso!"
    echo ""
    echo "📁 Verifique os arquivos gerados:"
    echo "  • naoenviados.txt"
    echo "  • relatorio-comparacao.txt"
else
    echo "❌ Erro durante a comparação!"
fi

echo ""
