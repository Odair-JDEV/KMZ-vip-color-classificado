@echo off
chcp 65001 >nul

REM Script de Execução com Verificação de Espaço - KMZ Color Classifier
REM Para sistemas Windows

if "%~1"=="" (
    echo ==========================================
    echo   KMZ Color Classifier
    echo ==========================================
    echo.
    echo Uso: run.bat ^<caminho-para-arquivo.kmz^>
    echo.
    echo Exemplo:
    echo   run.bat .\meu-arquivo.kmz
    echo   run.bat C:\Users\Usuario\Documents\dados.kmz
    echo.
    echo Classificação por cores:
    echo • Verde-Padrão ^(ff00b371^): pode salvar
    echo • Laranja-escuro ^(ff3643f4^): tem que regularizar
    echo • Rosa-escuro ^(ff631ee9^): tem que regularizar
    echo.
    echo 💡 DICA: Use 'check-space.bat arquivo.kmz' para verificar espaço primeiro
    echo.
    pause
    exit /b 1
)

set KMZ_FILE=%~1

if not exist "%KMZ_FILE%" (
    echo ❌ Arquivo não encontrado: %KMZ_FILE%
    pause
    exit /b 1
)

echo ==========================================
echo   KMZ Color Classifier
echo ==========================================
echo.
echo 📁 Arquivo: %~nx1
echo 📍 Localização: %~dp1
echo.

REM Verificar espaço em disco primeiro
echo 🔍 Verificando espaço em disco...
node check-disk-space.js "%KMZ_FILE%"

if %errorlevel% equ 1 (
    echo.
    echo ❌ ESPAÇO INSUFICIENTE NO DISCO!
    echo.
    echo Opções disponíveis:
    echo   1. Liberar espaço e tentar novamente
    echo   2. Mover arquivo para disco com mais espaço
    echo   3. Processar apenas KML ^(sem imagens^)
    echo.
    set /p choice="Deseja processar apenas o KML? (s/N): "
    if /i "!choice!"=="s" (
        echo.
        echo 🔄 Processando apenas KML ^(modo economia de espaço^)...
        node kmz-extractor-with-colors.js "%KMZ_FILE%" --kml-only
    ) else (
        echo.
        echo ❌ Processamento cancelado. Libere espaço e tente novamente.
        pause
        exit /b 1
    )
) else if %errorlevel% equ 0 (
    echo.
    echo ✅ Espaço suficiente detectado!
    echo 🚀 Iniciando processamento completo...
    echo.
    node kmz-extractor-with-colors.js "%KMZ_FILE%"
) else (
    echo.
    echo ⚠️  Não foi possível verificar espaço automaticamente
    echo 🚀 Tentando processamento ^(use Ctrl+C para cancelar se necessário^)...
    echo.
    node kmz-extractor-with-colors.js "%KMZ_FILE%"
)

echo.
if %errorlevel% equ 0 (
    echo ✅ Processamento concluído com sucesso!
    echo Verifique os arquivos gerados na mesma pasta do arquivo KMZ.
) else (
    echo ❌ Erro durante o processamento!
    echo Verifique as mensagens de erro acima.
)

echo.
pause
