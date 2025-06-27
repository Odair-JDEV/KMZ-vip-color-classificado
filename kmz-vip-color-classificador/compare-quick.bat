@echo off
chcp 65001 >nul

REM Script Rápido para Comparação Padrão
REM Procura automaticamente pelos arquivos padrão

echo ==========================================
echo   Comparação Rápida de Códigos
echo ==========================================
echo.

REM Procurar pelos arquivos padrão
set FILE1=1Codigos-salvos-regularizado.txt
set FILE2=2Codigos-salvos-regularizado.txt

if not exist "%FILE1%" (
    echo ❌ Arquivo padrão não encontrado: %FILE1%
    echo.
    echo 💡 Este script procura automaticamente por:
    echo   • 1Codigos-salvos-regularizado.txt
    echo   • 2Codigos-salvos-regularizado.txt
    echo.
    echo Use compare-codes.bat para especificar arquivos diferentes.
    pause
    exit /b 1
)

if not exist "%FILE2%" (
    echo ❌ Arquivo padrão não encontrado: %FILE2%
    echo.
    echo 💡 Este script procura automaticamente por:
    echo   • 1Codigos-salvos-regularizado.txt
    echo   • 2Codigos-salvos-regularizado.txt
    echo.
    echo Use compare-codes.bat para especificar arquivos diferentes.
    pause
    exit /b 1
)

echo ✅ Arquivos encontrados:
echo   📁 %FILE1%
echo   📁 %FILE2%
echo.

node compare-codes.js "%FILE1%" "%FILE2%"

echo.
if %errorlevel% equ 0 (
    echo ✅ Comparação concluída!
    echo.
    echo 📁 Arquivos gerados:
    echo   • naoenviados.txt
    echo   • relatorio-comparacao.txt
) else (
    echo ❌ Erro durante a comparação!
)

echo.
pause
