/**
 * KMZ Extractor Tool with Color Classification
 *
 * Este script processa arquivos KMZ (Google Earth/Maps) e classifica por cores:
 *
 * 1. Extrai o conteúdo do arquivo KMZ
 * 2. Analisa o arquivo KML para extrair informações de placemarks
 * 3. Classifica placemarks baseado nas cores:
 *    - Verde-Padrão (ff00b371): pode salvar - vai para "Codigos-salvos-regularizado.txt"
 *    - Laranja-escuro (ff3643f4): tem que regularizar - vai para "pedente-pra-regularizar.txt"
 *    - Rosa-escuro (ff631ee9): tem que regularizar - vai para "pedente-pra-regularizar.txt"
 * 4. Renomeia imagens baseado nos dados de placemarks
 * 5. Verifica e converte todas as imagens para o formato JPG
 *
 * Uso: node kmz-extractor-with-colors.js [caminho-para-arquivo.kmz]
 */

const fs = require("fs").promises
const path = require("path")
const { existsSync } = require("fs")
const fsExtra = require("fs-extra")
const AdmZip = require("adm-zip")
const { DOMParser } = require("@xmldom/xmldom")
const sharp = require("sharp")

// Função para verificar espaço em disco disponível
async function checkDiskSpace(directory) {
  try {
    const stats = (await fs.statfs) ? fs.statfs(directory) : null
    if (stats) {
      const freeSpace = stats.bavail * stats.bsize
      const freeSpaceGB = (freeSpace / (1024 * 1024 * 1024)).toFixed(2)
      console.log(`💾 Espaço livre no disco: ${freeSpaceGB} GB`)
      return freeSpace
    }
  } catch (error) {
    console.log(`⚠️  Não foi possível verificar espaço em disco: ${error.message}`)
  }
  return null
}

// Função para obter tamanho do arquivo
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath)
    const sizeGB = (stats.size / (1024 * 1024 * 1024)).toFixed(2)
    console.log(`📁 Tamanho do arquivo KMZ: ${sizeGB} GB`)
    return stats.size
  } catch (error) {
    console.error(`Erro ao obter tamanho do arquivo: ${error.message}`)
    return 0
  }
}

// Função para limpar diretório temporário
async function cleanTempDirectory(tempDir) {
  try {
    if (existsSync(tempDir)) {
      console.log(`🧹 Limpando diretório temporário: ${tempDir}`)
      await fsExtra.remove(tempDir)
      console.log(`✅ Diretório temporário limpo`)
    }
  } catch (error) {
    console.error(`⚠️  Erro ao limpar diretório temporário: ${error.message}`)
  }
}

// Função para extrair KMZ com tratamento de erro melhorado
async function extractKMZSafely(kmzFilePath, tempDir) {
  try {
    console.log("📦 Extraindo arquivo KMZ...")

    // Verificar espaço em disco
    const fileSize = await getFileSize(kmzFilePath)
    const freeSpace = await checkDiskSpace(path.dirname(tempDir))

    if (freeSpace && fileSize > 0) {
      // Estimar espaço necessário (arquivo descompactado pode ser 3-5x maior)
      const estimatedSpace = fileSize * 5
      if (freeSpace < estimatedSpace) {
        const neededGB = (estimatedSpace / (1024 * 1024 * 1024)).toFixed(2)
        const freeGB = (freeSpace / (1024 * 1024 * 1024)).toFixed(2)

        console.log(`❌ ERRO: Espaço insuficiente no disco!`)
        console.log(`   Espaço necessário (estimado): ${neededGB} GB`)
        console.log(`   Espaço disponível: ${freeGB} GB`)
        console.log(`   Diferença: ${(neededGB - freeGB).toFixed(2)} GB`)
        console.log(``)
        console.log(`💡 SOLUÇÕES:`)
        console.log(`   1. Libere espaço no disco removendo arquivos desnecessários`)
        console.log(`   2. Use um disco com mais espaço disponível`)
        console.log(`   3. Mova o arquivo KMZ para outro local com mais espaço`)
        console.log(`   4. Use a opção de extração parcial (apenas KML)`)

        throw new Error(`Espaço insuficiente no disco. Necessário: ${neededGB} GB, Disponível: ${freeGB} GB`)
      }
    }

    // Tentar extração normal
    const zip = new AdmZip(kmzFilePath)
    zip.extractAllTo(tempDir, true)

    console.log(`✅ Extração concluída com sucesso`)
    return true
  } catch (error) {
    if (error.code === "ENOSPC") {
      console.log(`❌ ERRO: Sem espaço no disco durante a extração`)
      console.log(``)
      console.log(`💡 SOLUÇÕES IMEDIATAS:`)
      console.log(`   1. Limpar diretório temporário e tentar novamente`)
      console.log(`   2. Usar modo de extração apenas do KML (mais rápido)`)
      console.log(`   3. Mover para disco com mais espaço`)

      // Limpar o que foi extraído parcialmente
      await cleanTempDirectory(tempDir)

      // Tentar extração apenas do KML
      console.log(`🔄 Tentando extração apenas do arquivo KML...`)
      return await extractOnlyKML(kmzFilePath, tempDir)
    }

    throw error
  }
}

// Função para extrair apenas o arquivo KML (economia de espaço)
async function extractOnlyKML(kmzFilePath, tempDir) {
  try {
    console.log(`📄 Extraindo apenas arquivo KML para economizar espaço...`)

    const zip = new AdmZip(kmzFilePath)
    const entries = zip.getEntries()

    // Criar diretório se não existir
    if (!existsSync(tempDir)) {
      await fs.mkdir(tempDir, { recursive: true })
    }

    // Extrair apenas arquivos KML
    let kmlFound = false
    for (const entry of entries) {
      if (entry.entryName.toLowerCase().includes(".kml")) {
        console.log(`  Extraindo: ${entry.entryName}`)
        zip.extractEntryTo(entry, tempDir, false, true)
        kmlFound = true
      }
    }

    if (!kmlFound) {
      throw new Error("Nenhum arquivo KML encontrado no KMZ")
    }

    console.log(`✅ Extração do KML concluída (modo economia de espaço)`)
    console.log(`⚠️  AVISO: Imagens não foram extraídas para economizar espaço`)
    console.log(`   Apenas a classificação por cores será realizada`)

    return true
  } catch (error) {
    console.error(`❌ Erro na extração do KML: ${error.message}`)
    return false
  }
}

// Definição das cores e suas classificações
const COLOR_RULES = {
  ff00b371: { type: "salvar", description: "Verde-Padrão" },
  ff3643f4: { type: "regularizar", description: "Laranja-escuro" },
  ff631ee9: { type: "regularizar", description: "Rosa-escuro" },
}

// Função para encontrar arquivos recursivamente
async function findFiles(directory, fileName) {
  const files = await fs.readdir(directory, { withFileTypes: true })
  const results = []

  for (const file of files) {
    const fullPath = path.join(directory, file.name)

    if (file.isDirectory()) {
      const subResults = await findFiles(fullPath, fileName)
      results.push(...subResults)
    } else if (file.name === fileName) {
      results.push(fullPath)
    }
  }

  return results
}

// Função para encontrar pastas recursivamente
async function findFolders(directory) {
  const items = await fs.readdir(directory, { withFileTypes: true })
  let folders = []

  for (const item of items) {
    const fullPath = path.join(directory, item.name)

    if (item.isDirectory()) {
      folders.push(fullPath)
      const subFolders = await findFolders(fullPath)
      folders = folders.concat(subFolders)
    }
  }

  return folders
}

// Função para extrair cor do placemark
function extractPlacemarkColor(placemark) {
  // Procurar por elementos de estilo
  const styleElements = placemark.getElementsByTagName("Style")

  for (let i = 0; i < styleElements.length; i++) {
    const style = styleElements[i]

    // Procurar por IconStyle
    const iconStyles = style.getElementsByTagName("IconStyle")
    for (let j = 0; j < iconStyles.length; j++) {
      const iconStyle = iconStyles[j]
      const colorElements = iconStyle.getElementsByTagName("color")

      if (colorElements.length > 0) {
        const color = colorElements[0].textContent.trim().toLowerCase()
        console.log(`    Cor encontrada no IconStyle: ${color}`)
        return color
      }
    }

    // Procurar por LineStyle
    const lineStyles = style.getElementsByTagName("LineStyle")
    for (let j = 0; j < lineStyles.length; j++) {
      const lineStyle = lineStyles[j]
      const colorElements = lineStyle.getElementsByTagName("color")

      if (colorElements.length > 0) {
        const color = colorElements[0].textContent.trim().toLowerCase()
        console.log(`    Cor encontrada no LineStyle: ${color}`)
        return color
      }
    }

    // Procurar por PolyStyle
    const polyStyles = style.getElementsByTagName("PolyStyle")
    for (let j = 0; j < polyStyles.length; j++) {
      const polyStyle = polyStyles[j]
      const colorElements = polyStyle.getElementsByTagName("color")

      if (colorElements.length > 0) {
        const color = colorElements[0].textContent.trim().toLowerCase()
        console.log(`    Cor encontrada no PolyStyle: ${color}`)
        return color
      }
    }
  }

  // Procurar por referência de estilo
  const styleUrlElements = placemark.getElementsByTagName("styleUrl")
  if (styleUrlElements.length > 0) {
    const styleUrl = styleUrlElements[0].textContent.trim()
    console.log(`    StyleUrl encontrado: ${styleUrl}`)

    // Procurar o estilo referenciado no documento
    const xmlDoc = placemark.ownerDocument
    const styles = xmlDoc.getElementsByTagName("Style")

    for (let i = 0; i < styles.length; i++) {
      const style = styles[i]
      const styleId = style.getAttribute("id")

      if (styleUrl === `#${styleId}`) {
        console.log(`    Estilo referenciado encontrado: ${styleId}`)

        // Procurar cor no estilo referenciado
        const iconStyles = style.getElementsByTagName("IconStyle")
        for (let j = 0; j < iconStyles.length; j++) {
          const iconStyle = iconStyles[j]
          const colorElements = iconStyle.getElementsByTagName("color")

          if (colorElements.length > 0) {
            const color = colorElements[0].textContent.trim().toLowerCase()
            console.log(`    Cor encontrada no estilo referenciado: ${color}`)
            return color
          }
        }
      }
    }
  }

  return null
}

// Função para classificar placemark baseado na cor
function classifyPlacemark(color) {
  if (!color) {
    return { type: "desconhecido", description: "Cor não identificada" }
  }

  const rule = COLOR_RULES[color.toLowerCase()]
  if (rule) {
    return rule
  }

  return { type: "desconhecido", description: `Cor não mapeada: ${color}` }
}

// Função principal
async function processKMZ(kmzFilePath) {
  console.log(`Processando arquivo KMZ: ${kmzFilePath}`)

  try {
    const kmzBaseName = path.basename(kmzFilePath, path.extname(kmzFilePath))
    const tempDir = path.join(path.dirname(kmzFilePath), `extracted_${kmzBaseName}`)

    // Arquivos de saída para classificação por cores
    const salvarOutputFile = path.join(path.dirname(kmzFilePath), "Codigos-salvos-regularizado.txt")
    const regularizarOutputFile = path.join(path.dirname(kmzFilePath), "pedente-pra-regularizar.txt")
    const desconhecidoOutputFile = path.join(path.dirname(kmzFilePath), `${kmzBaseName}_cores-desconhecidas.txt`)

    console.log(`Diretório de extração: ${tempDir}`)
    console.log(`Códigos para salvar serão salvos em: ${salvarOutputFile}`)
    console.log(`Códigos para regularizar serão salvos em: ${regularizarOutputFile}`)
    console.log(`Códigos com cores desconhecidas serão salvos em: ${desconhecidoOutputFile}`)

    if (!existsSync(tempDir)) {
      await fs.mkdir(tempDir, { recursive: true })
      console.log(`Diretório de extração criado: ${tempDir}`)
    } else {
      console.log(`Diretório de extração já existe, usando conteúdo existente se aplicável`)
    }

    // Extrair o arquivo KMZ
    console.log("Extraindo arquivo KMZ...")
    // zip.extractAllTo(tempDir, true)
    const extractionSuccess = await extractKMZSafely(kmzFilePath, tempDir)
    if (!extractionSuccess) {
      throw new Error("Falha na extração do arquivo KMZ")
    }

    // Buscar arquivos KML recursivamente
    console.log("Buscando arquivo KML...")
    const kmlFiles = await findFiles(tempDir, "doc.kml")

    if (kmlFiles.length === 0) {
      throw new Error("Arquivo doc.kml não encontrado na extração")
    }

    const kmlPath = kmlFiles[0]
    console.log(`Arquivo KML encontrado em: ${kmlPath}`)

    // Localizar a pasta cloud_media recursivamente
    console.log("Buscando pasta cloud_media...")
    let cloudMediaPath = null

    const defaultCloudMediaPath = path.join(path.dirname(kmlPath), "cloud_media")
    if (existsSync(defaultCloudMediaPath)) {
      cloudMediaPath = defaultCloudMediaPath
    } else {
      const folders = await findFolders(tempDir)
      const cloudMediaFolders = folders.filter((folder) => path.basename(folder) === "cloud_media")

      if (cloudMediaFolders.length > 0) {
        cloudMediaPath = cloudMediaFolders[0]
      }
    }

    if (!cloudMediaPath) {
      throw new Error("Pasta cloud_media não encontrada na extração")
    }

    console.log(`Pasta cloud_media encontrada em: ${cloudMediaPath}`)

    // Ler e analisar o arquivo KML
    console.log("Analisando arquivo KML...")
    const kmlContent = await fs.readFile(kmlPath, "utf8")
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(kmlContent, "text/xml")

    // Extrair informações dos Placemarks
    const placemarks = xmlDoc.getElementsByTagName("Placemark")
    console.log(`Encontrados ${placemarks.length} placemarks no arquivo KML`)

    // Arrays para armazenar os códigos classificados
    const codigosSalvar = []
    const codigosRegularizar = []
    const codigosDesconhecidos = []

    // Mapear imagens para renomear
    const imageMap = new Map()
    let processedPlacemarks = 0
    let skippedPlacemarks = 0

    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i]

      const placemarkId = placemark.getAttribute("id")

      let nameElements = placemark.getElementsByTagName("name")
      if (nameElements.length === 0) {
        nameElements = placemark.getElementsByTagName("n")
      }

      if (nameElements.length === 0) {
        console.log(`Placemark #${i} (ID: ${placemarkId || "não definido"}) não possui elemento name/n, pulando...`)
        skippedPlacemarks++
        continue
      }

      const placemarkName = nameElements[0].textContent.trim()
      console.log(`\nProcessando Placemark #${i} (ID: ${placemarkId || "não definido"}, Nome: ${placemarkName})`)

      // Extrair cor do placemark
      console.log(`  Extraindo cor do placemark...`)
      const color = extractPlacemarkColor(placemark)

      // Classificar o placemark baseado na cor
      const classification = classifyPlacemark(color)
      console.log(`  Classificação: ${classification.type} (${classification.description})`)

      // Adicionar aos arrays apropriados
      const placemarkEntry = `${placemarkName} |`

      switch (classification.type) {
        case "salvar":
          codigosSalvar.push(placemarkEntry)
          console.log(`  ✓ Adicionado aos códigos para salvar`)
          break
        case "regularizar":
          codigosRegularizar.push(placemarkEntry)
          console.log(`  ⚠ Adicionado aos códigos para regularizar`)
          break
        default:
          codigosDesconhecidos.push(`${placemarkEntry} (Cor: ${color || "não encontrada"})`)
          console.log(`  ? Adicionado aos códigos com cor desconhecida`)
          break
      }

      // Continuar com o processamento de imagens (código original)
      let descriptionContent = ""
      const descElements = placemark.getElementsByTagName("description")

      if (descElements.length > 0) {
        descriptionContent = descElements[0].textContent
        console.log(`  Encontrado elemento description com ${descriptionContent.length} caracteres`)
      } else {
        console.log(`  Elemento description não encontrado no Placemark ${placemarkName}`)
        skippedPlacemarks++
        continue
      }

      let description = ""
      const preMatch =
        descriptionContent.match(/<pre.*?>(.*?)<\/pre>/s) ||
        descriptionContent.match(/pre id="com\.exlyo\.mapmarker\.description_p_tag">(.*?)<\/pre>/s)

      if (preMatch && preMatch[1]) {
        description = preMatch[1].trim()
        console.log(`  Descrição extraída: "${description}"`)
      } else {
        console.log(`  Não foi possível extrair a descrição do pré-tag para ${placemarkName}`)
        description = placemarkName
      }

      let imgMatches = [...descriptionContent.matchAll(/src="cloud_media\/(.*?)"/g)]

      if (imgMatches.length === 0) {
        imgMatches = [...descriptionContent.matchAll(/src="(.*?)"/g)]
      }

      if (imgMatches.length === 0) {
        console.log(`  Nenhuma referência de imagem encontrada para ${placemarkName}`)
        console.log(`  Buscando imagens na pasta cloud_media diretamente...`)

        try {
          const cloudMediaFiles = await fs.readdir(cloudMediaPath)
          const imageFiles = cloudMediaFiles.filter((file) => {
            const ext = path.extname(file).toLowerCase()
            return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(ext)
          })

          if (imageFiles.length > 0) {
            imgMatches = imageFiles.map((file) => [null, file])
            console.log(`  Encontradas ${imgMatches.length} imagens na pasta cloud_media`)
          } else {
            console.log(`  Nenhuma imagem encontrada na pasta cloud_media`)
            processedPlacemarks++
            continue
          }
        } catch (error) {
          console.error(`  Erro ao listar arquivos em cloud_media: ${error.message}`)
          skippedPlacemarks++
          continue
        }
      }

      console.log(`  Encontradas ${imgMatches.length} referências de imagem`)
      let imageCount = 0

      const cleanPlacemarkName = removeXIcon(placemarkName)
      const cleanDescription = removeXIcon(description)

      for (const match of imgMatches) {
        const imagePath = match[1]
        console.log(`  Processando imagem: ${imagePath}`)

        let newName = `${cleanPlacemarkName} ${cleanDescription}`.trim()

        if (imageCount > 0) {
          newName += ".."
        }

        newName += ".jpg"
        newName = sanitizeFileName(newName)

        imageMap.set(imagePath, newName)
        console.log(`  Mapeado: ${imagePath} -> ${newName}`)
        imageCount++
      }

      processedPlacemarks++
    }

    console.log(`\nResumo do processamento:`)
    console.log(`- Total de Placemarks: ${placemarks.length}`)
    console.log(`- Placemarks processados: ${processedPlacemarks}`)
    console.log(`- Placemarks ignorados: ${skippedPlacemarks}`)
    console.log(`- Códigos para salvar: ${codigosSalvar.length}`)
    console.log(`- Códigos para regularizar: ${codigosRegularizar.length}`)
    console.log(`- Códigos com cor desconhecida: ${codigosDesconhecidos.length}`)
    console.log(`- Imagens para renomear: ${imageMap.size}`)

    // Salvar os códigos classificados em arquivos separados
    console.log(`\nSalvando códigos classificados...`)

    // Salvar códigos para salvar
    if (codigosSalvar.length > 0) {
      try {
        const content = codigosSalvar.join("\n")
        await fs.writeFile(salvarOutputFile, content)
        console.log(`✓ ${codigosSalvar.length} códigos salvos em: ${salvarOutputFile}`)
      } catch (error) {
        console.error(`✗ Erro ao salvar códigos para salvar: ${error.message}`)
      }
    }

    // Salvar códigos para regularizar
    if (codigosRegularizar.length > 0) {
      try {
        const content = codigosRegularizar.join("\n")
        await fs.writeFile(regularizarOutputFile, content)
        console.log(`✓ ${codigosRegularizar.length} códigos salvos em: ${regularizarOutputFile}`)
      } catch (error) {
        console.error(`✗ Erro ao salvar códigos para regularizar: ${error.message}`)
      }
    }

    // Salvar códigos com cor desconhecida
    if (codigosDesconhecidos.length > 0) {
      try {
        const content = codigosDesconhecidos.join("\n")
        await fs.writeFile(desconhecidoOutputFile, content)
        console.log(
          `✓ ${codigosDesconhecidos.length} códigos com cor desconhecida salvos em: ${desconhecidoOutputFile}`,
        )
      } catch (error) {
        console.error(`✗ Erro ao salvar códigos com cor desconhecida: ${error.message}`)
      }
    }

    // Renomear os arquivos (código original)
    console.log(`\nRenomeando ${imageMap.size} arquivos de imagem...`)

    let renamedCount = 0
    let errorCount = 0

    for (const [originalName, newName] of imageMap.entries()) {
      const originalPath = path.join(cloudMediaPath, originalName)
      const newPath = path.join(cloudMediaPath, newName)

      try {
        if (existsSync(originalPath)) {
          if (existsSync(newPath)) {
            console.log(`⚠ Arquivo já existe com o nome: ${newName}, ignorando...`)
            renamedCount++
          } else {
            await fs.rename(originalPath, newPath)
            console.log(`✓ Renomeado: ${originalName} -> ${newName}`)
            renamedCount++
          }
        } else {
          console.warn(`⚠ Arquivo não encontrado: ${originalPath}`)
          errorCount++
        }
      } catch (error) {
        console.error(`✗ Erro ao renomear ${originalName}: ${error.message}`)
        errorCount++
      }
    }

    // Verificar e converter imagens não-JPG para JPG
    console.log("\nVerificando formatos de imagem na pasta cloud_media...")
    await convertNonJpgImages(cloudMediaPath)

    console.log("\n" + "=".repeat(60))
    console.log("PROCESSAMENTO CONCLUÍDO!")
    console.log("=".repeat(60))
    console.log(`📊 ESTATÍSTICAS FINAIS:`)
    console.log(`   • Placemarks processados: ${processedPlacemarks}`)
    console.log(`   • Arquivos renomeados: ${renamedCount}`)
    console.log(`   • Erros de renomeação: ${errorCount}`)
    console.log(``)
    console.log(`📋 CLASSIFICAÇÃO POR CORES:`)
    console.log(`   ✅ Códigos para salvar: ${codigosSalvar.length}`)
    console.log(`   ⚠️  Códigos para regularizar: ${codigosRegularizar.length}`)
    console.log(`   ❓ Códigos com cor desconhecida: ${codigosDesconhecidos.length}`)
    console.log(``)
    console.log(`📁 ARQUIVOS GERADOS:`)
    if (codigosSalvar.length > 0) console.log(`   • ${salvarOutputFile}`)
    if (codigosRegularizar.length > 0) console.log(`   • ${regularizarOutputFile}`)
    if (codigosDesconhecidos.length > 0) console.log(`   • ${desconhecidoOutputFile}`)
    console.log("=".repeat(60))
  } catch (error) {
    console.error("Erro ao processar o arquivo KMZ:", error)
  }
}

// Função para verificar e converter imagens não-JPG para JPG (código original mantido)
async function convertNonJpgImages(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath)
    console.log(`Encontrados ${files.length} arquivos na pasta cloud_media`)

    let convertedCount = 0
    let alreadyJpgCount = 0
    let errorCount = 0
    let nonImageCount = 0

    const imageExtensions = new Set([
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".tiff",
      ".tif",
      ".svg",
      ".heic",
      ".heif",
      ".avif",
    ])

    for (const file of files) {
      const filePath = path.join(directoryPath, file)
      const fileExt = path.extname(file).toLowerCase()

      const stats = await fs.stat(filePath)
      if (stats.isDirectory()) {
        console.log(`Ignorando diretório: ${file}`)
        continue
      }

      if (fileExt === ".jpg" || fileExt === ".jpeg") {
        console.log(`✓ Arquivo já está em formato JPG: ${file}`)

        if (fileExt !== ".jpg") {
          try {
            const baseName = path.basename(file, fileExt)
            const newFileName = baseName + ".jpg"
            const newFilePath = path.join(directoryPath, newFileName)

            await fs.rename(filePath, newFilePath)
            console.log(`✓ Extensão normalizada: ${file} -> ${newFileName}`)
          } catch (error) {
            console.error(`✗ Erro ao normalizar extensão de ${file}: ${error.message}`)
          }
        }

        alreadyJpgCount++
        continue
      }

      if (imageExtensions.has(fileExt)) {
        console.log(`Convertendo ${file} para JPG...`)

        try {
          const outputFileName = path.basename(file, fileExt) + ".jpg"
          const outputPath = path.join(directoryPath, outputFileName)

          if (existsSync(outputPath)) {
            console.log(`⚠ Arquivo já existe: ${outputFileName}, ignorando conversão...`)
            convertedCount++
          } else {
            const imageBuffer = await fs.readFile(filePath)

            await sharp(imageBuffer, { failOnError: false }).jpeg({ quality: 90 }).toFile(outputPath)

            await fs.unlink(filePath)

            console.log(`✓ Convertido: ${file} -> ${outputFileName}`)
            convertedCount++
          }
        } catch (error) {
          console.error(`✗ Erro ao converter ${file}: ${error.message}`)
          errorCount++

          if (fileExt === ".bmp") {
            try {
              console.log(`  Tentando método alternativo para BMP...`)
              const imageBuffer = await fsExtra.readFile(filePath)

              const outputFileName = path.basename(file, fileExt) + ".jpg"
              const outputPath = path.join(directoryPath, outputFileName)

              if (existsSync(outputPath)) {
                console.log(`⚠ Arquivo já existe: ${outputFileName}, ignorando conversão alternativa...`)
                convertedCount++
                errorCount--
              } else {
                await sharp(imageBuffer, {
                  failOnError: false,
                  density: 300,
                })
                  .flatten()
                  .jpeg({ quality: 90 })
                  .toFile(outputPath)

                await fs.unlink(filePath)

                console.log(`✓ Convertido com método alternativo: ${file} -> ${outputFileName}`)
                convertedCount++
                errorCount--
              }
            } catch (altError) {
              console.error(`✗ Erro no método alternativo para ${file}: ${altError.message}`)
            }
          }
        }
      } else {
        try {
          const imageBuffer = await fs.readFile(filePath)

          await sharp(imageBuffer, { failOnError: false }).metadata()

          console.log(`Detectado arquivo de imagem sem extensão adequada: ${file}`)

          const outputFileName = path.basename(file, fileExt) + ".jpg"
          const outputPath = path.join(directoryPath, outputFileName)

          if (existsSync(outputPath)) {
            console.log(`⚠ Arquivo já existe: ${outputFileName}, ignorando conversão...`)
            convertedCount++
          } else {
            await sharp(imageBuffer, { failOnError: false }).jpeg({ quality: 90 }).toFile(outputPath)

            await fs.unlink(filePath)

            console.log(`✓ Convertido: ${file} -> ${outputFileName}`)
            convertedCount++
          }
        } catch (error) {
          console.log(`Arquivo ignorado (não é uma imagem ou não pode ser processado): ${file}`)
          nonImageCount++
        }
      }
    }

    console.log("\nResumo da conversão de imagens:")
    console.log(`- Total de arquivos verificados: ${files.length}`)
    console.log(`- Arquivos já em formato JPG: ${alreadyJpgCount}`)
    console.log(`- Arquivos convertidos para JPG: ${convertedCount}`)
    console.log(`- Arquivos não-imagem ignorados: ${nonImageCount}`)
    console.log(`- Erros de conversão: ${errorCount}`)
  } catch (error) {
    console.error("Erro ao verificar e converter imagens:", error)
  }
}

// Função para remover o ícone ❌ do texto (código original mantido)
function removeXIcon(text) {
  if (!text) return ""

  const cleaned = text.replace(/\s*❌\s*/g, " ").trim()

  if (text !== cleaned) {
    console.log(`  Removido ícone ❌ de: "${text}" -> "${cleaned}"`)
  }

  return cleaned
}

// Função para sanitizar nomes de arquivo (código original mantido)
function sanitizeFileName(fileName) {
  return fileName
    .replace(/[/\\:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
}

// Função para executar o programa
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log("Uso: node kmz-extractor-with-colors.js caminho/para/arquivo.kmz")
    console.log("")
    console.log("Este script classifica placemarks baseado nas cores:")
    console.log("• Verde-Padrão (ff00b371): pode salvar -> Codigos-salvos-regularizado.txt")
    console.log("• Laranja-escuro (ff3643f4): tem que regularizar -> pedente-pra-regularizar.txt")
    console.log("• Rosa-escuro (ff631ee9): tem que regularizar -> pedente-pra-regularizar.txt")
    return
  }

  const kmzFilePath = args[0]

  if (!existsSync(kmzFilePath)) {
    console.error(`Arquivo não encontrado: ${kmzFilePath}`)
    return
  }

  await processKMZ(kmzFilePath)
}

// Executar o programa
main().catch(console.error)
