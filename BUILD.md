# 빠른 빌드 가이드

## 현재 환경에서 빌드하기

### macOS에서 빌드

**자동 빌드 스크립트 사용**
```bash
./build-macos.sh
```

또는 **직접 명령어 실행**

Apple Silicon (M1/M2/M3):
```bash
npm run build:mac-arm
```

Intel Mac:
```bash
npm run build:mac-intel
```

Universal (Intel + Apple Silicon):
```bash
npm run build:mac
```

### Windows에서 빌드

**자동 빌드 스크립트 사용**
```
build-windows.bat
```

또는 **직접 명령어 실행**

PowerShell 또는 CMD:
```
npm run build:win
```

Git Bash:
```bash
./build-windows.sh
```

## 생성되는 파일

### Windows
```
dist/
├── YumYum 주문접수-Setup-1.0.0-x64.exe      # 64비트 설치 프로그램
├── YumYum 주문접수-Setup-1.0.0-ia32.exe     # 32비트 설치 프로그램
└── YumYum 주문접수-Portable-1.0.0-x64.exe   # 포터블 버전
```

### macOS
```
dist/
├── YumYum 주문접수-1.0.0-arm64.dmg   # Apple Silicon용 디스크 이미지
├── YumYum 주문접수-1.0.0-x64.dmg     # Intel Mac용 디스크 이미지
├── YumYum 주문접수-1.0.0-arm64.zip   # Apple Silicon용 압축 파일
└── YumYum 주문접수-1.0.0-x64.zip     # Intel Mac용 압축 파일
```

## 빌드 전 체크리스트

- [ ] Node.js v16 이상 설치
- [ ] npm install 실행
- [ ] assets/ 폴더에 아이콘 파일 존재 확인
  - `assets/icon.ico` (Windows)
  - `assets/icon.icns` (macOS)
  - `assets/icon.png` (Linux)
- [ ] package.json의 version 확인
- [ ] 충분한 디스크 공간 (약 500MB)

## 크로스 플랫폼 빌드

### macOS에서 Windows 빌드
```bash
npm run build:win
```
(Wine이 설치되어 있으면 가능)

### Windows에서 macOS 빌드
❌ 불가능 (macOS에서만 macOS 빌드 가능)

## 문제 해결

### "electron-builder not found" 오류
```bash
npm install --save-dev electron-builder
```

### 빌드 시간이 너무 오래 걸림
- node_modules 삭제 후 재설치
```bash
rm -rf node_modules
npm install
```

### macOS에서 "code signing" 오류
package.json의 `mac.hardenedRuntime`을 `false`로 변경하거나
개발자 인증서 등록

### 빌드 캐시 정리
```bash
rm -rf dist/
npm run build
```

## 배포 전 테스트

빌드 후 반드시 테스트하세요:

1. 설치 프로그램 실행
2. 앱 정상 실행 확인
3. 모든 기능 동작 확인
4. 프린터 연결 테스트
5. 설정 저장/로드 테스트
6. 제거 후 재설치 테스트

## 자동 업데이트 (향후 추가 예정)

현재는 수동 업데이트만 지원합니다.
자동 업데이트 기능은 추후 추가될 예정입니다.

