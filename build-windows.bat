@echo off
chcp 65001 >nul
REM YumYum Order Management System - Windows Build Script (Batch)
REM Windows 환경용 설치 파일 빌드

echo ==========================================
echo YumYum 주문접수 시스템 - Windows 빌드
echo ==========================================
echo.

REM Node.js 버전 확인
echo Node.js 버전 확인...
node --version
npm --version
echo.

REM 의존성 설치
echo 의존성 설치 중...
call npm install
if errorlevel 1 (
    echo.
    echo ❌ 의존성 설치 실패
    pause
    exit /b 1
)
echo.

REM 빌드 시작
echo ==========================================
echo Windows 빌드 시작...
echo ==========================================
echo.

REM 64비트 빌드
echo 1. Windows 64-bit 빌드 중...
call npm run build:win
if errorlevel 1 (
    echo.
    echo ❌ 빌드 실패
    pause
    exit /b 1
)

echo.
echo ✅ 빌드 완료!
echo.
echo 생성된 파일:
dir /B dist\*.exe 2>nul
echo.
echo 설치 파일 위치: dist\
echo - YumYum 주문접수-Setup-1.0.0-x64.exe (설치 프로그램)
echo - YumYum 주문접수-Portable-1.0.0-x64.exe (포터블 버전)
echo.
echo ==========================================
echo 빌드 프로세스 완료
echo ==========================================
echo.
pause

