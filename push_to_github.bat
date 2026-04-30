@echo off
echo ========================================
echo   MINING ERP - PRO MAX AUTO PUSH
echo ========================================
echo.

:: Check if ERP remote exists, if so, rename it to origin for consistency
git remote | findstr /C:"ERP" > nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Detected remote 'ERP'. Renaming to 'origin'...
    git remote rename ERP origin
)

:: Ensure origin remote is set correctly
git remote remove origin > nul 2>&1
git remote add origin https://github.com/abadijayacopier/ERP.git
echo [INFO] Remote URL set to https://github.com/abadijayacopier/ERP.git

echo [1/3] Adding changes...
git add .

echo [2/3] Committing changes...
git commit -m "Update Pro Max: Database Schema, Personnel Management, and Operator Workflow Sync"

echo [3/3] Pushing to GitHub (Main Branch)...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [RETRY] Push failed on 'main'. Trying 'master'...
    git push -u origin master
)

echo.
echo ========================================
echo   SYNC COMPLETE! CHECK YOUR GITHUB.
echo ========================================
pause
