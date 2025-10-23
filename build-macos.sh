#!/bin/bash

# YumYum Order Management System - macOS Build Script
# macOS 환경용 설치 파일 빌드

echo "=========================================="
echo "YumYum 주문접수 시스템 - macOS 빌드"
echo "=========================================="
echo ""

# 시스템 정보 확인
echo "시스템 정보 확인..."
uname -m
sw_vers 2>/dev/null || echo "macOS 버전 확인 실패"
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
echo "macOS 빌드 시작..."
echo "=========================================="
echo ""

# 현재 시스템 아키텍처 감지
ARCH=$(uname -m)

if [ "$ARCH" = "arm64" ]; then
    echo "Apple Silicon (M1/M2/M3) 감지"
    echo "Apple Silicon용 빌드 중..."
    npm run build:mac-arm
elif [ "$ARCH" = "x86_64" ]; then
    echo "Intel Mac 감지"
    echo "Intel Mac용 빌드 중..."
    npm run build:mac-intel
else
    echo "알 수 없는 아키텍처: $ARCH"
    echo "Universal 빌드 진행..."
    npm run build:mac
fi

# 빌드 결과 확인
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 빌드 완료!"
    echo ""
    echo "생성된 파일:"
    ls -lh dist/*.dmg 2>/dev/null || echo "dist 폴더를 확인하세요"
    ls -lh dist/*.zip 2>/dev/null
    echo ""
    echo "설치 파일 위치: dist/"
    echo "- YumYum 주문접수-1.0.0-*.dmg (디스크 이미지)"
    echo "- YumYum 주문접수-1.0.0-*.zip (압축 파일)"
else
    echo ""
    echo "❌ 빌드 실패"
    exit 1
fi

echo ""
echo "=========================================="
echo "빌드 프로세스 완료"
echo "=========================================="

