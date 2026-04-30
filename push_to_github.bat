@echo off
echo ========================================
echo   MINING ERP - AUTO PUSH TO GITHUB
echo ========================================
echo.

:: Check if .git folder exists
if not exist ".git" (
    echo [INFO] Initializing Git Repository...
    git init
    git remote add origin https://github.com/abadijayacopier/ERP.git
)

:: Ensure remote is correct
git remote set-url origin https://github.com/abadijayacopier/ERP.git

echo [1/3] Adding changes...
git add .

echo [2/3] Committing changes...
git commit -m "Update Pro Max: Operator Workflow, Sync Company Profile, DSR Actions, and Auto Mechanic Dropdown"

echo [3/3] Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Push failed. Retrying with 'master' branch...
    git push -u origin master
)

echo.
echo ========================================
echo   SYNC COMPLETE! CHECK YOUR GITHUB.
echo ========================================
pause
