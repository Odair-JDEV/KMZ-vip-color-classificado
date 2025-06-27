@echo off
chcp 65001 >nul

REM Instalador Automático - KMZ Color Classifier
REM Para sistemas Windows

echo ==========================================
echo   KMZ Color Classifier - Instalador
echo ==========================================
echo.

REM Verificar se Node.js está instalado
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo • Visite: https://nodejs.org/
    echo • Baixe a versão LTS ^(recomendada^)
    echo • Execute o instalador
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: %NODE_VERSION%

REM Verificar se npm está instalado
echo 🔍 Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    echo npm geralmente vem com Node.js. Reinstale o Node.js.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm encontrado: v%NPM_VERSION%
echo.

REM Instalar dependências
echo 📦 Instalando dependências...
echo Isso pode levar alguns minutos...
echo.

npm install

if %errorlevel% equ 0 (
    echo.
    echo ✅ Instalação concluída com sucesso!
    echo.
    echo ==========================================
    echo   COMO USAR
    echo ==========================================
    echo.
    echo Para processar um arquivo KMZ:
    echo   node kmz-extractor-with-colors.js caminho\para\arquivo.kmz
    echo.
    echo Ou use o script de execução:
    echo   run.bat caminho\para\arquivo.kmz
    echo.
    echo Exemplo:
    echo   node kmz-extractor-with-colors.js .\meu-arquivo.kmz
    echo.
    echo ==========================================
    echo   ARQUIVOS GERADOS
    echo ==========================================
    echo.
    echo • Codigos-salvos-regularizado.txt
    echo   └─ Códigos com cor verde ^(ff00b371^) - podem ser salvos
    echo.
    echo • pedente-pra-regularizar.txt
    echo   └─ Códigos com cor laranja/rosa - precisam regularizar
    echo.
    echo • [arquivo]_cores-desconhecidas.txt
    echo   └─ Códigos com cores não mapeadas
    echo.
    echo 🎉 Pronto para usar!
) else (
    echo.
    echo ❌ Erro durante a instalação!
    echo Verifique sua conexão com a internet e tente novamente.
)

echo.
pause
