#!/bin/bash

# Script de Execução com Verificação de Espaço - KMZ Color Classifier
# Para sistemas Unix/Linux/macOS

if [ $# -eq 0 ]; then
    echo "=========================================="
    echo "  KMZ Color Classifier"
    echo "=========================================="
    echo ""
    echo "Uso: ./run.sh <caminho-para-arquivo.kmz>"
    echo ""
    echo "Exemplo:"
    echo "  ./run.sh ./meu-arquivo.kmz"
    echo "  ./run.sh /home/usuario/documentos/dados.kmz"
    echo ""
    echo "Classificação por cores:"
    echo "• Verde-Padrão (ff00b371): pode salvar"
    echo "• Laranja-escuro (ff3643f4): tem que regularizar"
    echo "• Rosa-escuro (ff631ee9): tem que regularizar"
    echo ""
    echo "💡 DICA: Use './check-space.sh arquivo.kmz' para verificar espaço primeiro"
    echo ""
    exit 1
fi

KMZ_FILE="$1"

if [ ! -f "$KMZ_FILE" ]; then
    echo "❌ Arquivo não encontrado: $KMZ_FILE"
    exit 1
fi

echo "=========================================="
echo "  KMZ Color Classifier"
echo "=========================================="
echo ""
echo "📁 Arquivo: $(basename "$KMZ_FILE")"
echo "📍 Localização: $(dirname "$KMZ_FILE")"
echo ""

# Verificar espaço em disco primeiro
echo "🔍 Verificando espaço em disco..."
node check-disk-space.js "$KMZ_FILE"
exit_code=$?

if [ $exit_code -eq 1 ]; then
    echo ""
    echo "❌ ESPAÇO INSUFICIENTE NO DISCO!"
    echo ""
    echo "Opções disponíveis:"
    echo "  1. Liberar espaço e tentar novamente"
    echo "  2. Mover arquivo para disco com mais espaço"
    echo "  3. Processar apenas KML (sem imagens)"
    echo ""
    read -p "Deseja processar apenas o KML? (s/N): " choice
    if [[ $choice =~ ^[Ss]$ ]]; then
        echo ""
        echo "🔄 Processando apenas KML (modo economia de espaço)..."
        node kmz-extractor-with-colors.js "$KMZ_FILE" --kml-only
    else
        echo ""
        echo "❌ Processamento cancelado. Libere espaço e tente novamente."
        exit 1
    fi
elif [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Espaço suficiente detectado!"
    echo "🚀 Iniciando processamento completo..."
    echo ""
    node kmz-extractor-with-colors.js "$KMZ_FILE"
else
    echo ""
    echo "⚠️  Não foi possível verificar espaço automaticamente"
    echo "🚀 Tentando processamento (use Ctrl+C para cancelar se necessário)..."
    echo ""
    node kmz-extractor-with-colors.js "$KMZ_FILE"
fi

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Processamento concluído com sucesso!"
    echo "Verifique os arquivos gerados na mesma pasta do arquivo KMZ."
else
    echo "❌ Erro durante o processamento!"
    echo "Verifique as mensagens de erro acima."
fi
