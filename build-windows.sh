#!/bin/bash

# YumYum Order Management System - Windows Build Script
# Windows 환경용 설치 파일 빌드

echo "=========================================="
echo "YumYum 주문접수 시스템 - Windows 빌드"
echo "=========================================="
echo ""

# Node.js 버전 확인
echo "Node.js 버전 확인..."
node --version
npm --version
echo ""

# 의존성 설치
echo "의존성 설치 중..."
npm install
echo ""

# 빌드 시작
echo "=========================================="
echo "Windows 빌드 시작..."
echo "=========================================="
echo ""

# 64비트 빌드
echo "1. Windows 64-bit 빌드 중..."
npm run build:win

# 빌드 결과 확인
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 빌드 완료!"
    echo ""
    echo "생성된 파일:"
    ls -lh dist/*.exe 2>/dev/null || echo "dist 폴더를 확인하세요"
    echo ""
    echo "설치 파일 위치: dist/"
    echo "- YumYum 주문접수-Setup-1.0.0-x64.exe (설치 프로그램)"
    echo "- YumYum 주문접수-Portable-1.0.0-x64.exe (포터블 버전)"
else
    echo ""
    echo "❌ 빌드 실패"
    exit 1
fi

echo ""
echo "=========================================="
echo "빌드 프로세스 완료"
echo "=========================================="

