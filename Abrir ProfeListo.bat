@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "PATH=%LOCALAPPDATA%\Programs\nodejs;%ProgramFiles%\nodejs;%PATH%"

echo Comprobando si ProfeListo ya esta en marcha...
powershell -NoProfile -Command "try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }"

if %errorlevel%==0 (
    echo ProfeListo ya estaba encendido. Abriendo navegador...
    start "" "http://localhost:5173/"
    exit /b 0
)

where npm >nul 2>&1
if not %errorlevel%==0 (
    echo.
    echo [ERROR] No se encontro Node.js/npm en este equipo.
    echo Verifica que Node.js este instalado en %LOCALAPPDATA%\Programs\nodejs o en Archivos de programa.
    pause
    exit /b 1
)

echo Iniciando el servidor local de ProfeListo...
start "Servidor ProfeListo (minimizado - dejalo abierto mientras estudias)" /min cmd /c "cd /d ""%~dp0"" && set ""PATH=%LOCALAPPDATA%\Programs\nodejs;%ProgramFiles%\nodejs;%PATH%"" && npm run dev"

echo Esperando a que la app este lista...
powershell -NoProfile -Command "$ready = $false; for ($i = 0; $i -lt 30; $i++) { try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 1; $ready = $true; break } catch { Start-Sleep -Milliseconds 500 } }; if (-not $ready) { exit 1 }"

if not %errorlevel%==0 (
    echo.
    echo [AVISO] El servidor tardo mas de lo esperado en responder.
    echo Intenta abrir http://localhost:5173/ manualmente en unos segundos.
    pause
    exit /b 1
)

echo Abriendo ProfeListo en tu navegador...
start "" "http://localhost:5173/"
exit /b 0
