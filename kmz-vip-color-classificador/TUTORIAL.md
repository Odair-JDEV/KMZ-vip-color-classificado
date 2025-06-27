# 📚 Tutorial Completo - KMZ Color Classifier

## 🎯 Objetivo

Este tutorial vai te guiar passo a passo para usar o KMZ Color Classifier, desde a instalação até o processamento dos seus arquivos.

## 📋 Passo 1: Preparação

### 1.1 Baixar os Arquivos
1. Baixe todos os arquivos do projeto
2. Crie uma pasta no seu computador (ex: `C:\KMZ-Classifier` ou `/home/usuario/kmz-classifier`)
3. Coloque todos os arquivos nesta pasta

### 1.2 Verificar Arquivos
Certifique-se de ter estes arquivos:
- ✅ `kmz-extractor-with-colors.js`
- ✅ `package.json`
- ✅ `install.bat` (Windows) ou `install.sh` (Linux/macOS)
- ✅ `run.bat` (Windows) ou `run.sh` (Linux/macOS)
- ✅ `README.md`

## 🔧 Passo 2: Instalação

### 2.1 Windows

1. **Abrir Prompt de Comando como Administrador:**
   - Pressione `Win + R`
   - Digite `cmd`
   - Pressione `Ctrl + Shift + Enter`

2. **Navegar até a pasta:**
   \`\`\`cmd
   cd C:\KMZ-Classifier
   \`\`\`

3. **Executar o instalador:**
   \`\`\`cmd
   install.bat
   \`\`\`

4. **Aguardar a instalação** (pode levar alguns minutos)

### 2.2 Linux/macOS

1. **Abrir Terminal**

2. **Navegar até a pasta:**
   \`\`\`bash
   cd /caminho/para/kmz-classifier
   \`\`\`

3. **Tornar o instalador executável:**
   \`\`\`bash
   chmod +x install.sh
   \`\`\`

4. **Executar o instalador:**
   \`\`\`bash
   ./install.sh
   \`\`\`

5. **Aguardar a instalação** (pode levar alguns minutos)

## 🚀 Passo 3: Primeiro Uso

### 3.1 Preparar Arquivo KMZ
1. Tenha seu arquivo KMZ pronto
2. Anote o caminho completo do arquivo
3. Exemplo: `C:\Users\João\Desktop\dados.kmz`

### 3.2 Executar o Processamento

**Windows:**
\`\`\`cmd
run.bat C:\Users\João\Desktop\dados.kmz
\`\`\`

**Linux/macOS:**
\`\`\`bash
./run.sh /home/joao/Desktop/dados.kmz
\`\`\`

### 3.3 Acompanhar o Progresso
O script mostrará informações como:
\`\`\`
🚀 Processando arquivo: dados.kmz
Extraindo arquivo KMZ...
Buscando arquivo KML...
Analisando arquivo KML...
Encontrados 150 placemarks no arquivo KML

Processando Placemark #1 (Nome: CODIGO001)
  Extraindo cor do placemark...
  Cor encontrada no IconStyle: ff00b371
  Classificação: salvar (Verde-Padrão)
  ✓ Adicionado aos códigos para salvar
\`\`\`

## 📊 Passo 4: Entendendo os Resultados

### 4.1 Arquivos Gerados

Após o processamento, você encontrará:

**📄 `Codigos-salvos-regularizado.txt`**
\`\`\`
CODIGO001 |
CODIGO005 |
CODIGO012 |
\`\`\`
*Códigos com cor verde - podem ser salvos*

**📄 `pedente-pra-regularizar.txt`**
\`\`\`
CODIGO002 |
CODIGO007 |
CODIGO015 |
\`\`\`
*Códigos com cor laranja/rosa - precisam regularizar*

**📄 `dados_cores-desconhecidas.txt`**
\`\`\`
CODIGO003 | (Cor: ff123456)
CODIGO009 | (Cor: não encontrada)
\`\`\`
*Códigos com cores não mapeadas*

### 4.2 Relatório Final
\`\`\`
==========================================================
PROCESSAMENTO CONCLUÍDO!
==========================================================
📊 ESTATÍSTICAS FINAIS:
   • Placemarks processados: 150
   • Arquivos renomeados: 45
   • Erros de renomeação: 0

📋 CLASSIFICAÇÃO POR CORES:
   ✅ Códigos para salvar: 89
   ⚠️  Códigos para regularizar: 52
   ❓ Códigos com cor desconhecida: 9

📁 ARQUIVOS GERADOS:
   • Codigos-salvos-regularizado.txt
   • pedente-pra-regularizar.txt
   • dados_cores-desconhecidas.txt
==========================================================
\`\`\`

## 🎨 Passo 5: Entendendo as Cores

### 5.1 Sistema de Classificação

| Cor Visual | Código Hex | Status | Ação Necessária |
|------------|------------|--------|-----------------|
| 🟢 Verde | `ff00b371` | ✅ Aprovado | Pode salvar diretamente |
| 🟠 Laranja | `ff3643f4` | ⚠️ Pendente | Precisa regularizar |
| 🟣 Rosa | `ff631ee9` | ⚠️ Pendente | Precisa regularizar |

### 5.2 Como as Cores são Detectadas

O script procura cores em:
1. **IconStyle** - Cor do ícone do placemark
2. **LineStyle** - Cor das linhas
3. **PolyStyle** - Cor de preenchimento de polígonos
4. **Estilos referenciados** - Via `styleUrl`

## 🔄 Passo 6: Processamento em Lote

### 6.1 Múltiplos Arquivos

Para processar vários arquivos:

**Windows:**
\`\`\`cmd
for %f in (*.kmz) do run.bat "%f"
\`\`\`

**Linux/macOS:**
\`\`\`bash
for file in *.kmz; do ./run.sh "$file"; done
\`\`\`

### 6.2 Script Personalizado

Crie um arquivo `processar-todos.bat` (Windows):
\`\`\`bat
@echo off
echo Processando todos os arquivos KMZ...
for %%f in (*.kmz) do (
    echo Processando: %%f
    run.bat "%%f"
    echo ----------------------------------------
)
echo Todos os arquivos processados!
pause
\`\`\`

## 🛠️ Passo 7: Personalização

### 7.1 Adicionar Novas Cores

Edite o arquivo `kmz-extractor-with-colors.js`:

\`\`\`javascript
const COLOR_RULES = {
  ff00b371: { type: "salvar", description: "Verde-Padrão" },
  ff3643f4: { type: "regularizar", description: "Laranja-escuro" },
  ff631ee9: { type: "regularizar", description: "Rosa-escuro" },
  // Adicione suas cores aqui:
  ff0000ff: { type: "urgente", description: "Vermelho-Urgente" },
  ff00ffff: { type: "revisar", description: "Azul-Revisar" },
}
\`\`\`

### 7.2 Personalizar Nomes dos Arquivos

Modifique estas linhas no script:
\`\`\`javascript
const salvarOutputFile = path.join(path.dirname(kmzFilePath), "Meus-Codigos-Aprovados.txt")
const regularizarOutputFile = path.join(path.dirname(kmzFilePath), "Meus-Codigos-Pendentes.txt")
\`\`\`

## 🐛 Passo 8: Solução de Problemas Comuns

### 8.1 "Comando não reconhecido"
**Problema:** `'node' não é reconhecido como comando`
**Solução:**
1. Reinstale o Node.js de [nodejs.org](https://nodejs.org/)
2. Reinicie o computador
3. Abra um novo terminal

### 8.2 "Arquivo não encontrado"
**Problema:** Script não encontra o arquivo KMZ
**Solução:**
\`\`\`bash
# Use o caminho completo
run.bat "C:\Caminho Completo\Para\Arquivo.kmz"

# Ou navegue até a pasta do arquivo
cd C:\Pasta\Do\Arquivo
run.bat arquivo.kmz
\`\`\`

### 8.3 "Permission denied"
**Problema:** Erro de permissão no Linux/macOS
**Solução:**
\`\`\`bash
chmod +x install.sh
chmod +x run.sh
sudo ./install.sh  # Se necessário
\`\`\`

### 8.4 Arquivo KMZ Corrompido
**Problema:** Erro ao extrair KMZ
**Solução:**
1. Verifique se o arquivo não está corrompido
2. Tente abrir no Google Earth primeiro
3. Re-exporte o arquivo se necessário

## 📈 Passo 9: Dicas Avançadas

### 9.1 Processamento Eficiente
- Organize seus arquivos KMZ em uma pasta específica
- Use nomes descritivos para os arquivos
- Processe em lotes durante horários de menor uso

### 9.2 Backup dos Resultados
\`\`\`bash
# Criar pasta de backup
mkdir backup-resultados

# Copiar arquivos de resultado
cp *.txt backup-resultados/
\`\`\`

### 9.3 Análise dos Resultados
\`\`\`bash
# Contar códigos por categoria
wc -l Codigos-salvos-regularizado.txt
wc -l pedente-pra-regularizar.txt

# Ver primeiras linhas
head -10 Codigos-salvos-regularizado.txt
\`\`\`

## ✅ Passo 10: Checklist Final

Antes de usar em produção:

- [ ] Node.js instalado e funcionando
- [ ] Todas as dependências instaladas
- [ ] Teste com arquivo KMZ pequeno
- [ ] Verificar arquivos de saída
- [ ] Confirmar classificação das cores
- [ ] Backup dos arquivos originais
- [ ] Documentar processo para equipe

## 🎉 Conclusão

Agora você está pronto para usar o KMZ Color Classifier! 

**Lembre-se:**
- Sempre faça backup dos arquivos originais
- Teste com arquivos pequenos primeiro
- Verifique os resultados antes de usar em produção
- Mantenha o Node.js atualizado

**Próximos passos:**
- Automatize o processo para uso regular
- Personalize as cores conforme sua necessidade
- Integre com outros sistemas se necessário

---

**💡 Dica:** Salve este tutorial para consultas futuras!
