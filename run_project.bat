@echo off
echo Checking for PHP...
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] PHP is not installed or not in your system PATH.
    echo.
    echo Please install XAMPP (https://www.apachefriends.org/) or install PHP manually.
    echo After installing, make sure to add the PHP folder to your System PATH environment variable.
    echo.
    echo If you have XAMPP installed, you can also copy this project folder to 'C:\xampp\htdocs\Medical'
    echo and access it via 'http://localhost/Medical'.
    echo.
    pause
    exit /b
)

echo.
echo PHP is installed!
echo Starting local server at http://localhost:8000
echo Press Ctrl+C to stop the server.
echo.
start http://localhost:8000
php -S localhost:8000
pause
