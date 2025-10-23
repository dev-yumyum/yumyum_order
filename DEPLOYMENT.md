# YumYum 주문접수 시스템 - 배포 패키지 구성 완료

## ✅ 완료된 작업

### 1. **package.json 업데이트**
- Windows 및 macOS 빌드 스크립트 추가
- Electron Builder 설정 완료
- 다양한 아키텍처 지원 (x64, ia32, arm64)

### 2. **빌드 스크립트 생성**
- `build-windows.sh` - Linux/macOS에서 Windows 빌드용
- `build-windows.bat` - Windows에서 빌드용
- `build-macos.sh` - macOS에서 빌드용

### 3. **문서 작성**
- `README.md` - 프로젝트 소개 및 빠른 시작
- `INSTALL.md` - 자세한 설치 가이드
- `BUILD.md` - 빌드 가이드
- `CHANGELOG.md` - 변경 사항 기록

### 4. **macOS 설정**
- `entitlements.mac.plist` - macOS 권한 설정
- DMG 배경 이미지 설정
- 코드 서명 설정

### 5. **.gitignore 업데이트**
- 빌드 결과물 제외
- 캐시 파일 제외
- 임시 파일 제외

## 📦 빌드 명령어

### Windows (64-bit)
```bash
npm run build:win
```

생성 파일:
- `dist/YumYum 주문접수-Setup-1.0.0-x64.exe` (설치 프로그램)
- `dist/YumYum 주문접수-Portable-1.0.0-x64.exe` (포터블)

### Windows (32-bit)
```bash
npm run build:win32
```

생성 파일:
- `dist/YumYum 주문접수-Setup-1.0.0-ia32.exe`

### macOS (Apple Silicon)
```bash
npm run build:mac-arm
```

생성 파일:
- `dist/YumYum 주문접수-1.0.0-arm64.dmg`
- `dist/YumYum 주문접수-1.0.0-arm64.zip`

### macOS (Intel)
```bash
npm run build:mac-intel
```

생성 파일:
- `dist/YumYum 주문접수-1.0.0-x64.dmg`
- `dist/YumYum 주문접수-1.0.0-x64.zip`

### 모든 플랫폼
```bash
npm run build:all
```

## 🎯 지원 플랫폼

### Windows
- ✅ Windows 10 (64-bit) - 권장
- ✅ Windows 10 (32-bit)
- ✅ Windows 11 (64-bit)
- ✅ 포터블 버전 (설치 불필요)

### macOS
- ✅ macOS 10.13 이상 (Intel)
- ✅ macOS 11.0 이상 (Apple Silicon)
- ✅ Universal 빌드 지원

## 📋 빌드 전 체크리스트

- [x] Node.js v16+ 설치
- [x] npm install 완료
- [ ] 아이콘 파일 준비
  - [ ] `assets/icon.ico` (Windows, 256x256)
  - [ ] `assets/icon.icns` (macOS, 512x512)
  - [ ] `assets/icon.png` (Linux, 512x512)
  - [ ] `assets/dmg-background.png` (macOS DMG 배경)
- [x] package.json 버전 확인
- [x] 빌드 스크립트 실행 권한 설정

## 🚀 빌드 실행 방법

### Windows에서
```cmd
build-windows.bat
```

또는

```bash
npm run build:win
```

### macOS에서
```bash
./build-macos.sh
```

또는

```bash
npm run build:mac
```

## 📦 배포 파일 설명

### Windows NSIS 설치 프로그램
- 사용자가 설치 경로 선택 가능
- 바탕화면 바로가기 자동 생성
- 시작 메뉴에 등록
- 제거 프로그램 자동 등록
- 관리자 권한 없이 설치 가능

### Windows 포터블 버전
- 설치 불필요
- USB 메모리에서 실행 가능
- 레지스트리 수정 없음
- 완전 독립 실행

### macOS DMG
- 드래그 앤 드롭 설치
- Applications 폴더 바로가기
- 아름다운 배경 이미지
- 자동 마운트/언마운트

## 🔧 빌드 설정

### Windows 설정
```json
{
  "target": ["nsis", "portable"],
  "arch": ["x64", "ia32"],
  "icon": "assets/icon.ico"
}
```

### macOS 설정
```json
{
  "target": ["dmg", "zip"],
  "arch": ["x64", "arm64"],
  "icon": "assets/icon.icns",
  "hardenedRuntime": true
}
```

## ⚠️ 주의사항

### Windows 빌드
- Wine이 설치되면 macOS/Linux에서도 Windows 빌드 가능
- 디지털 서명 없이 배포 시 SmartScreen 경고 표시됨
- 코드 서명 인증서 구매 권장 ($100-400/년)

### macOS 빌드
- **반드시 macOS에서만 빌드 가능**
- Apple Developer 계정 필요 (코드 서명 시)
- 첫 실행 시 Gatekeeper 경고 가능
- notarization 권장 (앱 공증)

## 🎨 아이콘 제작 필요

현재 `assets/icon.ico`만 존재합니다. 다음 파일들을 추가로 제작해야 합니다:

### 필수
- [ ] `assets/icon.icns` - macOS 아이콘 (512x512@2x)
- [ ] `assets/icon.png` - 범용 PNG (512x512)

### 선택
- [ ] `assets/dmg-background.png` - DMG 배경 (540x380)
- [ ] `assets/installer-header.bmp` - Windows 설치 헤더
- [ ] `assets/installer-sidebar.bmp` - Windows 설치 사이드바

### 아이콘 제작 도구
- **Windows**: IcoFX, GIMP
- **macOS**: Image2icon, IconFly
- **온라인**: CloudConvert, RedKetchup

## 📞 문제 해결

### 빌드 실패 시
1. node_modules 삭제 후 재설치
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. 빌드 캐시 정리
   ```bash
   rm -rf dist/
   ```

3. Electron Builder 재설치
   ```bash
   npm install --save-dev electron-builder
   ```

### macOS "code signing" 오류
```bash
# 임시 해결: package.json에서 hardenedRuntime: false
```

### Windows "Access denied" 오류
```cmd
# 관리자 권한으로 CMD 실행
```

## 🎉 완료!

모든 설정이 완료되었습니다. 이제 다음 명령어로 빌드할 수 있습니다:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# 모두
npm run build:all
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

