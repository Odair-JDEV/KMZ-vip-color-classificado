#!/bin/bash

# Script Rápido para Comparação Padrão
# Procura automaticamente pelos arquivos padrão

echo "=========================================="
echo "  Comparação Rápida de Códigos"
echo "=========================================="
echo ""

# Procurar pelos arquivos padrão
FILE1="1Codigos-salvos-regularizado.txt"
FILE2="2Codigos-salvos-regularizado.txt"

if [ ! -f "$FILE1" ]; then
    echo "❌ Arquivo padrão não encontrado: $FILE1"
    echo ""
    echo "💡 Este script procura automaticamente por:"
    echo "  • 1Codigos-salvos-regularizado.txt"
    echo "  • 2Codigos-salvos-regularizado.txt"
    echo ""
    echo "Use ./compare-codes.sh para especificar arquivos diferentes."
    exit 1
fi

if [ ! -f "$FILE2" ]; then
    echo "❌ Arquivo padrão não encontrado: $FILE2"
    echo ""
    echo "💡 Este script procura automaticamente por:"
    echo "  • 1Codigos-salvos-regularizado.txt"
    echo "  • 2Codigos-salvos-regularizado.txt"
    echo ""
    echo "Use ./compare-codes.sh para especificar arquivos diferentes."
    exit 1
fi

echo "✅ Arquivos encontrados:"
echo "  📁 $FILE1"
echo "  📁 $FILE2"
echo ""

node compare-codes.js "$FILE1" "$FILE2"

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Comparação concluída!"
    echo ""
    echo "📁 Arquivos gerados:"
    echo "  • naoenviados.txt"
    echo "  • relatorio-comparacao.txt"
else
    echo "❌ Erro durante a comparação!"
fi

echo ""
