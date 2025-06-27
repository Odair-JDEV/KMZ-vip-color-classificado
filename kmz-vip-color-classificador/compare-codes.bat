@echo off
chcp 65001 >nul

REM Comparador de Códigos - Windows
REM Compara dois arquivos de códigos e identifica os não enviados

if "%~2"=="" (
    echo ==========================================
    echo   Comparador de Códigos KMZ
    echo ==========================================
    echo.
    echo Uso: compare-codes.bat ^<arquivo1^> ^<arquivo2^>
    echo.
    echo Parâmetros:
    echo   arquivo1 - Códigos já enviados/processados
    echo   arquivo2 - Códigos novos para verificar
    echo.
    echo Exemplos:
    echo   compare-codes.bat 1Codigos-salvos-regularizado.txt 2Codigos-salvos-regularizado.txt
    echo   compare-codes.bat enviados.txt novos.txt
    echo.
    echo Arquivos gerados:
    echo   • naoenviados.txt - Códigos não enviados
    echo   • relatorio-comparacao.txt - Relatório detalhado
    echo.
    pause
    exit /b 1
)

set FILE1=%~1
set FILE2=%~2

if not exist "%FILE1%" (
    echo ❌ Arquivo 1 não encontrado: %FILE1%
    pause
    exit /b 1
)

if not exist "%FILE2%" (
    echo ❌ Arquivo 2 não encontrado: %FILE2%
    pause
    exit /b 1
)

echo ==========================================
echo   Comparador de Códigos KMZ
echo ==========================================
echo.
echo 📁 Arquivo 1: %~nx1
echo 📁 Arquivo 2: %~nx2
echo.

node compare-codes.js "%FILE1%" "%FILE2%"

echo.
if %errorlevel% equ 0 (
    echo ✅ Comparação concluída com sucesso!
    echo.
    echo 📁 Verifique os arquivos gerados:
    echo   • naoenviados.txt
    echo   • relatorio-comparacao.txt
) else (
    echo ❌ Erro durante a comparação!
)

echo.
pause
