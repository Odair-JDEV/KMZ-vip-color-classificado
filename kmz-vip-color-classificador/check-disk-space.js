/**
 * Verificador de Espaço em Disco
 * Utilitário para verificar espaço disponível antes de processar arquivos KMZ
 */

const fs = require("fs").promises
const path = require("path")
const { existsSync } = require("fs")

// Função para verificar espaço em disco (Windows)
async function checkDiskSpaceWindows(driveLetter) {
  try {
    const { exec } = require("child_process")
    const util = require("util")
    const execPromise = util.promisify(exec)

    const { stdout } = await execPromise(`dir ${driveLetter}:\\ /-c`)
    const lines = stdout.split("\n")
    const lastLine = lines[lines.length - 2]
    const match = lastLine.match(/([0-9,]+)\s+bytes\s+free/)

    if (match) {
      const freeBytes = Number.parseInt(match[1].replace(/,/g, ""))
      return freeBytes
    }
  } catch (error) {
    console.error(`Erro ao verificar espaço no disco ${driveLetter}: ${error.message}`)
  }
  return null
}

// Função para verificar espaço em disco (Unix/Linux/macOS)
async function checkDiskSpaceUnix(directory) {
  try {
    const { exec } = require("child_process")
    const util = require("util")
    const execPromise = util.promisify(exec)

    const { stdout } = await execPromise(`df -B1 "${directory}"`)
    const lines = stdout.split("\n")
    const dataLine = lines[1]
    const columns = dataLine.split(/\s+/)
    const freeBytes = Number.parseInt(columns[3])

    return freeBytes
  } catch (error) {
    console.error(`Erro ao verificar espaço no disco: ${error.message}`)
  }
  return null
}

// Função para obter tamanho do arquivo
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.size
  } catch (error) {
    console.error(`Erro ao obter tamanho do arquivo: ${error.message}`)
    return 0
  }
}

// Função para formatar bytes em formato legível
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Função principal de verificação
async function checkSpaceForKMZ(kmzFilePath) {
  console.log("=".repeat(60))
  console.log("  VERIFICADOR DE ESPAÇO EM DISCO")
  console.log("=".repeat(60))
  console.log("")

  if (!existsSync(kmzFilePath)) {
    console.error(`❌ Arquivo não encontrado: ${kmzFilePath}`)
    return false
  }

  console.log(`📁 Arquivo KMZ: ${path.basename(kmzFilePath)}`)
  console.log(`📍 Localização: ${path.dirname(kmzFilePath)}`)
  console.log("")

  // Obter tamanho do arquivo
  const fileSize = await getFileSize(kmzFilePath)
  console.log(`📊 Tamanho do arquivo: ${formatBytes(fileSize)}`)

  // Estimar espaço necessário para extração
  const estimatedExtractionSize = fileSize * 5 // Estimativa conservadora
  console.log(`📊 Espaço estimado para extração: ${formatBytes(estimatedExtractionSize)}`)
  console.log("")

  // Verificar espaço disponível
  const directory = path.dirname(kmzFilePath)
  let freeSpace = null

  if (process.platform === "win32") {
    const driveLetter = directory.charAt(0)
    freeSpace = await checkDiskSpaceWindows(driveLetter)
  } else {
    freeSpace = await checkDiskSpaceUnix(directory)
  }

  if (freeSpace !== null) {
    console.log(`💾 Espaço livre no disco: ${formatBytes(freeSpace)}`)
    console.log("")

    // Verificar se há espaço suficiente
    if (freeSpace >= estimatedExtractionSize) {
      console.log("✅ ESPAÇO SUFICIENTE")
      console.log(`   Margem de segurança: ${formatBytes(freeSpace - estimatedExtractionSize)}`)
      console.log("")
      console.log("🚀 Você pode processar este arquivo com segurança!")
      return true
    } else {
      const deficit = estimatedExtractionSize - freeSpace
      console.log("❌ ESPAÇO INSUFICIENTE")
      console.log(`   Espaço necessário adicional: ${formatBytes(deficit)}`)
      console.log("")
      console.log("💡 SOLUÇÕES:")
      console.log(`   1. Libere pelo menos ${formatBytes(deficit)} de espaço`)
      console.log("   2. Mova o arquivo para um disco com mais espaço")
      console.log("   3. Use o modo 'apenas KML' para economizar espaço")
      console.log("   4. Processe o arquivo em um computador com mais espaço")
      console.log("")

      // Sugestões específicas para liberar espaço
      console.log("🧹 COMO LIBERAR ESPAÇO:")
      console.log("   • Esvazie a Lixeira")
      console.log("   • Remova arquivos temporários (%temp%)")
      console.log("   • Desinstale programas não utilizados")
      console.log("   • Mova arquivos grandes para outro disco")
      console.log("   • Use Limpeza de Disco do Windows")

      return false
    }
  } else {
    console.log("⚠️  Não foi possível verificar o espaço em disco automaticamente")
    console.log("")
    console.log("📋 VERIFICAÇÃO MANUAL:")
    console.log(`   1. Verifique se há pelo menos ${formatBytes(estimatedExtractionSize)} livres`)
    console.log("   2. Considere usar um disco com mais espaço")
    console.log("   3. Tente o modo 'apenas KML' se necessário")

    return null
  }
}

// Função para executar verificação
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log("Uso: node check-disk-space.js caminho/para/arquivo.kmz")
    console.log("")
    console.log("Este utilitário verifica se há espaço suficiente no disco")
    console.log("para processar um arquivo KMZ antes de executar o extrator.")
    return
  }

  const kmzFilePath = args[0]
  const hasSpace = await checkSpaceForKMZ(kmzFilePath)

  console.log("")
  console.log("=".repeat(60))

  if (hasSpace === true) {
    console.log("✅ RESULTADO: Espaço suficiente - pode processar!")
    process.exit(0)
  } else if (hasSpace === false) {
    console.log("❌ RESULTADO: Espaço insuficiente - libere espaço primeiro!")
    process.exit(1)
  } else {
    console.log("⚠️  RESULTADO: Verificação manual necessária")
    process.exit(2)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { checkSpaceForKMZ, formatBytes }
