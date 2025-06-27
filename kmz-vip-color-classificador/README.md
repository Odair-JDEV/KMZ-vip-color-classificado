# KMZ Color Classifier

Extrator e classificador de arquivos KMZ baseado em cores dos placemarks do Google Earth/Maps.

## 📋 Descrição

Este script processa arquivos KMZ e classifica os placemarks baseado nas cores definidas:

- **🟢 Verde-Padrão (`ff00b371`)**: Códigos que podem ser salvos
- **🟠 Laranja-escuro (`ff3643f4`)**: Códigos que precisam regularizar  
- **🟣 Rosa-escuro (`ff631ee9`)**: Códigos que precisam regularizar

## 🚀 Instalação Rápida

### Windows
1. Baixe todos os arquivos para uma pasta
2. Execute `install.bat` como administrador
3. Aguarde a instalação das dependências

### Linux/macOS
1. Baixe todos os arquivos para uma pasta
2. Torne o instalador executável:
   \`\`\`bash
   chmod +x install.sh
   \`\`\`
3. Execute o instalador:
   \`\`\`bash
   ./install.sh
   \`\`\`

## 📦 Pré-requisitos

- **Node.js** versão 14 ou superior
- **npm** (geralmente vem com Node.js)

### Instalação do Node.js

1. Visite [nodejs.org](https://nodejs.org/)
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador
4. Reinicie o terminal/prompt de comando

## 🔧 Instalação Manual

Se preferir instalar manualmente:

\`\`\`bash
# 1. Clone ou baixe os arquivos
# 2. Instale as dependências
npm install

# 3. Verifique se tudo está funcionando
node --version
npm --version
\`\`\`

## 📖 Como Usar

### Método 1: Scripts de Execução (Recomendado)

**Windows:**
\`\`\`cmd
run.bat caminho\para\arquivo.kmz
\`\`\`

**Linux/macOS:**
\`\`\`bash
chmod +x run.sh
./run.sh caminho/para/arquivo.kmz
\`\`\`

### Método 2: Execução Direta

\`\`\`bash
node kmz-extractor-with-colors.js caminho/para/arquivo.kmz
\`\`\`

### Exemplos Práticos

\`\`\`bash
# Windows
run.bat C:\Users\Usuario\Desktop\dados.kmz
run.bat .\meu-arquivo.kmz

# Linux/macOS  
./run.sh /home/usuario/documentos/dados.kmz
./run.sh ./meu-arquivo.kmz
\`\`\`

## 📁 Arquivos Gerados

O script gera os seguintes arquivos na mesma pasta do arquivo KMZ:

### 📄 `Codigos-salvos-regularizado.txt`
- Contém códigos com cor **verde** (`ff00b371`)
- Estes códigos **podem ser salvos** diretamente
- Formato: `CODIGO123 |`

### 📄 `pedente-pra-regularizar.txt`  
- Contém códigos com cores **laranja** (`ff3643f4`) e **rosa** (`ff631ee9`)
- Estes códigos **precisam ser regularizados**
- Formato: `CODIGO456 |`

### 📄 `[nome-arquivo]_cores-desconhecidas.txt`
- Contém códigos com cores não mapeadas
- Para análise e possível inclusão nas regras
- Formato: `CODIGO789 | (Cor: ff123456)`

### 📁 `extracted_[nome-arquivo]/`
- Pasta com conteúdo extraído do KMZ
- Imagens renomeadas e convertidas para JPG
- Arquivo KML original

## 🎨 Regras de Cores

| Cor | Código Hex | Classificação | Ação |
|-----|------------|---------------|------|
| 🟢 Verde-Padrão | `ff00b371` | Pode salvar | Salvo em `Codigos-salvos-regularizado.txt` |
| 🟠 Laranja-escuro | `ff3643f4` | Regularizar | Salvo em `pedente-pra-regularizar.txt` |
| 🟣 Rosa-escuro | `ff631ee9` | Regularizar | Salvo em `pedente-pra-regularizar.txt` |

## 🔍 Funcionalidades

### ✅ Processamento de KMZ
- Extração automática de arquivos KMZ
- Análise de arquivos KML
- Busca recursiva por arquivos

### 🎨 Classificação por Cores
- Detecção automática de cores em placemarks
- Suporte a estilos inline e referenciados
- Classificação baseada em regras predefinidas

### 🖼️ Processamento de Imagens
- Renomeação baseada nos dados dos placemarks
- Conversão automática para formato JPG
- Remoção de ícones especiais (❌)

### 📊 Relatórios Detalhados
- Estatísticas completas de processamento
- Contadores por categoria
- Log detalhado de operações

## 🐛 Solução de Problemas

### Erro: "Node.js não encontrado"
\`\`\`bash
# Instale o Node.js de nodejs.org
# Reinicie o terminal após a instalação
node --version  # Deve mostrar a versão
\`\`\`

### Erro: "Arquivo não encontrado"
\`\`\`bash
# Verifique se o caminho está correto
# Use aspas se o caminho contém espaços
run.bat "C:\Pasta com Espaços\arquivo.kmz"
\`\`\`

### Erro: "Permission denied" (Linux/macOS)
\`\`\`bash
# Torne os scripts executáveis
chmod +x install.sh
chmod +x run.sh
\`\`\`

### Erro durante instalação de dependências
\`\`\`bash
# Limpe o cache do npm
npm cache clean --force

# Tente instalar novamente
npm install
\`\`\`

### Erro: "sharp" não instala
\`\`\`bash
# Para sistemas com problemas de compilação
npm install --platform=linux --arch=x64 sharp
# ou
npm install --platform=win32 --arch=x64 sharp
\`\`\`

## 📋 Estrutura de Arquivos

\`\`\`
kmz-color-classifier/
├── 📄 kmz-extractor-with-colors.js  # Script principal
├── 📄 package.json                  # Dependências
├── 📄 README.md                     # Este arquivo
├── 📄 install.sh                    # Instalador Linux/macOS
├── 📄 install.bat                   # Instalador Windows
├── 📄 run.sh                        # Executor Linux/macOS
├── 📄 run.bat                       # Executor Windows
└── 📁 node_modules/                 # Dependências (após instalação)
\`\`\`

## 🔧 Dependências

- **adm-zip**: Extração de arquivos KMZ
- **@xmldom/xmldom**: Análise de arquivos KML/XML
- **sharp**: Processamento e conversão de imagens
- **fs-extra**: Operações avançadas de sistema de arquivos

## 📝 Exemplo de Uso Completo

\`\`\`bash
# 1. Instalar (apenas uma vez)
./install.sh

# 2. Processar arquivo KMZ
./run.sh ./dados-campo.kmz

# 3. Verificar arquivos gerados
ls -la *.txt
# Codigos-salvos-regularizado.txt
# pedente-pra-regularizar.txt
# dados-campo_cores-desconhecidas.txt
\`\`\`

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se o Node.js está instalado corretamente
2. Confirme que o arquivo KMZ não está corrompido
3. Execute com permissões adequadas
4. Verifique os logs de erro no terminal

## 📄 Licença

MIT License - Livre para uso pessoal e comercial.

---

**🎉 Pronto para classificar seus arquivos KMZ!**
