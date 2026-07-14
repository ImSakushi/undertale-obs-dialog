@echo off
setlocal
title Undertale OBS Dialog
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js est introuvable.
  echo Installe Node.js depuis https://nodejs.org/ puis relance ce fichier.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installation des dependances...
  call npm install
  if errorlevel 1 (
    echo.
    echo L'installation a echoue.
    pause
    exit /b 1
  )
)

echo Demarrage du panneau web...
echo Le navigateur va s'ouvrir automatiquement.
echo Ferme cette fenetre pour arreter le serveur.
echo.
call npm start

echo.
echo Serveur arrete.
pause
