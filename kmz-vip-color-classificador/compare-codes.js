/**
 * Comparador de Códigos
 *
 * Este script compara dois arquivos de códigos salvos do extrator KMZ:
 * - Arquivo 1: códigos já enviados/processados
 * - Arquivo 2: códigos novos para verificar
 *
 * Identifica códigos que estão no arquivo 2 mas não no arquivo 1
 * e salva em "naoenviados.txt"
 *
 * Uso: node compare-codes.js arquivo1.txt arquivo2.txt
 */

const fs = require("fs").promises
const path = require("path")
const { existsSync } = require("fs")

// Função para ler e processar arquivo de códigos
async function readCodesFile(filePath) {
  try {
    console.log(`📖 Lendo arquivo: ${path.basename(filePath)}`)

    if (!existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`)
    }

    const content = await fs.readFile(filePath, "utf8")

    // Dividir por linhas e processar cada código
    const lines = content.split("\n")
    const codes = new Set()
    let processedLines = 0
    let emptyLines = 0

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (trimmedLine === "") {
        emptyLines++
        continue
      }

      // Remover o " |" do final se existir
      let code = trimmedLine
      if (code.endsWith(" |")) {
        code = code.slice(0, -2).trim()
      }

      if (code !== "") {
        codes.add(code)
        processedLines++
      }
    }

    console.log(`  ✅ ${processedLines} códigos únicos encontrados`)
    console.log(`  📊 ${emptyLines} linhas vazias ignoradas`)
    console.log(`  📊 Total de linhas: ${lines.length}`)

    return codes
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filePath}: ${error.message}`)
    throw error
  }
}

// Função para salvar códigos não enviados
async function saveNotSentCodes(codes, outputPath) {
  try {
    console.log(`💾 Salvando códigos não enviados...`)

    // Converter Set para Array e ordenar
    const sortedCodes = Array.from(codes).sort()

    // Formatar códigos com " |" no final
    const formattedCodes = sortedCodes.map((code) => `${code} |`)

    // Adicionar cabeçalho informativo
    const header = [
      `# Códigos Não Enviados`,
      `# Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      `# Total de códigos: ${sortedCodes.length}`,
      `# `,
      ``,
    ]

    const content = header.join("\n") + formattedCodes.join("\n")

    await fs.writeFile(outputPath, content, "utf8")

    console.log(`  ✅ Arquivo salvo: ${outputPath}`)
    console.log(`  📊 ${sortedCodes.length} códigos salvos`)

    return sortedCodes.length
  } catch (error) {
    console.error(`❌ Erro ao salvar arquivo: ${error.message}`)
    throw error
  }
}

// Função para gerar relatório detalhado
async function generateDetailedReport(file1Codes, file2Codes, notSentCodes, outputDir) {
  try {
    const reportPath = path.join(outputDir, "relatorio-comparacao.txt")

    // Calcular estatísticas
    const commonCodes = new Set([...file1Codes].filter((code) => file2Codes.has(code)))
    const onlyInFile1 = new Set([...file1Codes].filter((code) => !file2Codes.has(code)))
    const onlyInFile2 = notSentCodes // Códigos que estão apenas no arquivo 2

    const report = [
      `RELATÓRIO DE COMPARAÇÃO DE CÓDIGOS`,
      `${"=".repeat(50)}`,
      ``,
      `📅 Data/Hora: ${new Date().toLocaleString("pt-BR")}`,
      ``,
      `📊 ESTATÍSTICAS GERAIS:`,
      `   • Códigos no Arquivo 1: ${file1Codes.size}`,
      `   • Códigos no Arquivo 2: ${file2Codes.size}`,
      `   • Códigos em comum: ${commonCodes.size}`,
      `   • Apenas no Arquivo 1: ${onlyInFile1.size}`,
      `   • Apenas no Arquivo 2 (não enviados): ${onlyInFile2.size}`,
      ``,
      `📈 ANÁLISE:`,
      `   • Taxa de códigos já enviados: ${((commonCodes.size / file2Codes.size) * 100).toFixed(1)}%`,
      `   • Taxa de códigos novos: ${((onlyInFile2.size / file2Codes.size) * 100).toFixed(1)}%`,
      ``,
      `🔍 DETALHES:`,
      ``,
    ]

    // Adicionar amostra de códigos não enviados (primeiros 10)
    if (onlyInFile2.size > 0) {
      report.push(`📋 PRIMEIROS CÓDIGOS NÃO ENVIADOS:`)
      const sample = Array.from(onlyInFile2).slice(0, 10)
      sample.forEach((code, index) => {
        report.push(`   ${(index + 1).toString().padStart(2, "0")}. ${code}`)
      })

      if (onlyInFile2.size > 10) {
        report.push(`   ... e mais ${onlyInFile2.size - 10} códigos`)
      }
      report.push(``)
    }

    // Adicionar amostra de códigos apenas no arquivo 1 (se houver)
    if (onlyInFile1.size > 0) {
      report.push(`📋 CÓDIGOS APENAS NO ARQUIVO 1 (primeiros 5):`)
      const sample = Array.from(onlyInFile1).slice(0, 5)
      sample.forEach((code, index) => {
        report.push(`   ${(index + 1).toString().padStart(2, "0")}. ${code}`)
      })

      if (onlyInFile1.size > 5) {
        report.push(`   ... e mais ${onlyInFile1.size - 5} códigos`)
      }
      report.push(``)
    }

    report.push(`${"=".repeat(50)}`)
    report.push(`Relatório gerado pelo Comparador de Códigos KMZ`)

    await fs.writeFile(reportPath, report.join("\n"), "utf8")

    console.log(`📋 Relatório detalhado salvo: ${reportPath}`)

    return reportPath
  } catch (error) {
    console.error(`⚠️  Erro ao gerar relatório: ${error.message}`)
    return null
  }
}

// Função principal de comparação
async function compareCodes(file1Path, file2Path, outputDir = null) {
  console.log(`${"=".repeat(60)}`)
  console.log(`  COMPARADOR DE CÓDIGOS KMZ`)
  console.log(`${"=".repeat(60)}`)
  console.log(``)

  try {
    // Definir diretório de saída
    if (!outputDir) {
      outputDir = path.dirname(file2Path)
    }

    console.log(`📁 Arquivo 1 (já enviados): ${path.basename(file1Path)}`)
    console.log(`📁 Arquivo 2 (para verificar): ${path.basename(file2Path)}`)
    console.log(`📁 Diretório de saída: ${outputDir}`)
    console.log(``)

    // Ler os dois arquivos
    console.log(`🔍 ETAPA 1: Lendo arquivos...`)
    const file1Codes = await readCodesFile(file1Path)
    const file2Codes = await readCodesFile(file2Path)
    console.log(``)

    // Comparar códigos
    console.log(`🔍 ETAPA 2: Comparando códigos...`)
    const notSentCodes = new Set()

    for (const code of file2Codes) {
      if (!file1Codes.has(code)) {
        notSentCodes.add(code)
      }
    }

    console.log(`  ✅ Comparação concluída`)
    console.log(`  📊 Códigos não enviados encontrados: ${notSentCodes.size}`)
    console.log(``)

    // Salvar códigos não enviados
    console.log(`🔍 ETAPA 3: Salvando resultados...`)
    const outputPath = path.join(outputDir, "naoenviados.txt")
    const savedCount = await saveNotSentCodes(notSentCodes, outputPath)
    console.log(``)

    // Gerar relatório detalhado
    console.log(`🔍 ETAPA 4: Gerando relatório...`)
    const reportPath = await generateDetailedReport(file1Codes, file2Codes, notSentCodes, outputDir)
    console.log(``)

    // Exibir resumo final
    console.log(`${"=".repeat(60)}`)
    console.log(`  RESUMO FINAL`)
    console.log(`${"=".repeat(60)}`)
    console.log(``)
    console.log(`📊 ESTATÍSTICAS:`)
    console.log(`   • Códigos no arquivo 1: ${file1Codes.size}`)
    console.log(`   • Códigos no arquivo 2: ${file2Codes.size}`)
    console.log(`   • Códigos já enviados: ${file2Codes.size - notSentCodes.size}`)
    console.log(`   • Códigos NÃO enviados: ${notSentCodes.size}`)
    console.log(``)

    const percentageNotSent = file2Codes.size > 0 ? ((notSentCodes.size / file2Codes.size) * 100).toFixed(1) : 0
    console.log(`📈 ANÁLISE:`)
    console.log(`   • ${percentageNotSent}% dos códigos ainda não foram enviados`)
    console.log(`   • ${(100 - percentageNotSent).toFixed(1)}% dos códigos já foram processados`)
    console.log(``)

    console.log(`📁 ARQUIVOS GERADOS:`)
    console.log(`   • ${outputPath}`)
    if (reportPath) {
      console.log(`   • ${reportPath}`)
    }
    console.log(``)

    if (notSentCodes.size > 0) {
      console.log(`✅ ${notSentCodes.size} códigos não enviados identificados e salvos!`)
    } else {
      console.log(`🎉 Todos os códigos já foram enviados!`)
    }

    console.log(`${"=".repeat(60)}`)

    return {
      file1Count: file1Codes.size,
      file2Count: file2Codes.size,
      notSentCount: notSentCodes.size,
      outputPath,
      reportPath,
    }
  } catch (error) {
    console.error(`❌ Erro durante a comparação: ${error.message}`)
    throw error
  }
}

// Função para executar o programa
async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log(`Uso: node compare-codes.js <arquivo1> <arquivo2> [diretorio-saida]`)
    console.log(``)
    console.log(`Parâmetros:`)
    console.log(`  arquivo1        - Arquivo com códigos já enviados/processados`)
    console.log(`  arquivo2        - Arquivo com códigos para verificar`)
    console.log(`  diretorio-saida - (Opcional) Diretório para salvar resultados`)
    console.log(``)
    console.log(`Exemplos:`)
    console.log(`  node compare-codes.js 1Codigos-salvos-regularizado.txt 2Codigos-salvos-regularizado.txt`)
    console.log(`  node compare-codes.js enviados.txt novos.txt ./resultados`)
    console.log(``)
    console.log(`Arquivos gerados:`)
    console.log(`  • naoenviados.txt - Códigos que ainda não foram enviados`)
    console.log(`  • relatorio-comparacao.txt - Relatório detalhado da comparação`)
    return
  }

  const file1Path = args[0]
  const file2Path = args[1]
  const outputDir = args[2] || null

  // Verificar se os arquivos existem
  if (!existsSync(file1Path)) {
    console.error(`❌ Arquivo 1 não encontrado: ${file1Path}`)
    return
  }

  if (!existsSync(file2Path)) {
    console.error(`❌ Arquivo 2 não encontrado: ${file2Path}`)
    return
  }

  await compareCodes(file1Path, file2Path, outputDir)
}

// Executar o programa
main().catch(console.error)
