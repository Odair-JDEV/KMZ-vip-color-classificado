@echo off
chcp 65001 >nul

REM Verificador de Espaço em Disco
REM Para sistemas Windows

if "%~1"=="" (
    echo ==========================================
    echo   Verificador de Espaço em Disco
    echo ==========================================
    echo.
    echo Uso: check-space.bat ^<caminho-para-arquivo.kmz^>
    echo.
    echo Este utilitário verifica se há espaço suficiente
    echo no disco para processar um arquivo KMZ.
    echo.
    pause
    exit /b 1
)

node check-disk-space.js "%~1"
pause
