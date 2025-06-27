#!/bin/bash

# Instalador Automático - KMZ Color Classifier
# Para sistemas Unix/Linux/macOS

echo "=========================================="
echo "  KMZ Color Classifier - Instalador"
echo "=========================================="
echo ""

# Verificar se Node.js está instalado
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo ""
    echo "Por favor, instale o Node.js primeiro:"
    echo "• Visite: https://nodejs.org/"
    echo "• Baixe a versão LTS (recomendada)"
    echo "• Execute o instalador"
    echo ""
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Verificar se npm está instalado
echo "🔍 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado!"
    echo "npm geralmente vem com Node.js. Reinstale o Node.js."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm encontrado: v$NPM_VERSION"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
echo "Isso pode levar alguns minutos..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Instalação concluída com sucesso!"
    echo ""
    echo "=========================================="
    echo "  COMO USAR"
    echo "=========================================="
    echo ""
    echo "Para processar um arquivo KMZ:"
    echo "  node kmz-extractor-with-colors.js caminho/para/arquivo.kmz"
    echo ""
    echo "Ou use o script de execução:"
    echo "  ./run.sh caminho/para/arquivo.kmz"
    echo ""
    echo "Exemplo:"
    echo "  node kmz-extractor-with-colors.js ./meu-arquivo.kmz"
    echo ""
    echo "=========================================="
    echo "  ARQUIVOS GERADOS"
    echo "=========================================="
    echo ""
    echo "• Codigos-salvos-regularizado.txt"
    echo "  └─ Códigos com cor verde (ff00b371) - podem ser salvos"
    echo ""
    echo "• pedente-pra-regularizar.txt"
    echo "  └─ Códigos com cor laranja/rosa - precisam regularizar"
    echo ""
    echo "• [arquivo]_cores-desconhecidas.txt"
    echo "  └─ Códigos com cores não mapeadas"
    echo ""
    echo "🎉 Pronto para usar!"
else
    echo ""
    echo "❌ Erro durante a instalação!"
    echo "Verifique sua conexão com a internet e tente novamente."
    exit 1
fi
