# YumYum 주문접수 시스템 - 설치 가이드

## 시스템 요구사항

### Windows
- Windows 10 이상 (64-bit 또는 32-bit)
- 최소 4GB RAM
- 200MB 디스크 공간

### macOS
- macOS 10.13 (High Sierra) 이상
- Intel 또는 Apple Silicon (M1/M2/M3) 프로세서
- 최소 4GB RAM
- 200MB 디스크 공간

## 빌드 방법

### 개발 환경 설정

1. Node.js 설치 (v16 이상)
```bash
# Node.js 버전 확인
node --version
npm --version
```

2. 프로젝트 의존성 설치
```bash
npm install
```

3. 개발 모드로 실행
```bash
npm run electron
```

### 설치 패키지 빌드

#### Windows 빌드 (Windows 또는 macOS에서 실행 가능)

**64-bit 설치 파일**
```bash
npm run build:win
```

**32-bit 설치 파일**
```bash
npm run build:win32
```

**포터블 버전** (설치 없이 실행 가능)
```bash
npm run build:win
```

생성되는 파일:
- `dist/YumYum 주문접수-Setup-1.0.0-x64.exe` - 64비트 설치 프로그램
- `dist/YumYum 주문접수-Setup-1.0.0-ia32.exe` - 32비트 설치 프로그램
- `dist/YumYum 주문접수-Portable-1.0.0-x64.exe` - 포터블 버전

#### macOS 빌드 (macOS에서만 실행 가능)

**Intel Mac 빌드**
```bash
npm run build:mac-intel
```

**Apple Silicon (M1/M2/M3) 빌드**
```bash
npm run build:mac-arm
```

**Universal (Intel + Apple Silicon) 빌드**
```bash
npm run build:mac
```

생성되는 파일:
- `dist/YumYum 주문접수-1.0.0-x64.dmg` - Intel Mac용
- `dist/YumYum 주문접수-1.0.0-arm64.dmg` - Apple Silicon용
- `dist/YumYum 주문접수-1.0.0-universal.dmg` - Universal 버전

#### 모든 플랫폼 빌드
```bash
npm run build:all
```

## 설치 방법

### Windows 설치

1. **설치 프로그램 사용**
   - `YumYum 주문접수-Setup-1.0.0-x64.exe` 실행
   - 설치 마법사 지시에 따라 설치
   - 설치 경로 선택 가능
   - 바탕화면 바로가기 자동 생성

2. **포터블 버전 사용**
   - `YumYum 주문접수-Portable-1.0.0-x64.exe` 다운로드
   - 원하는 폴더에 저장
   - 실행 파일을 더블클릭하여 실행
   - 설치 없이 바로 사용 가능

### macOS 설치

1. **DMG 파일 사용**
   - `YumYum 주문접수-1.0.0-arm64.dmg` (Apple Silicon) 또는
   - `YumYum 주문접수-1.0.0-x64.dmg` (Intel) 다운로드
   - DMG 파일을 더블클릭하여 마운트
   - 앱을 Applications 폴더로 드래그

2. **처음 실행 시**
   ```
   "YumYum 주문접수"는 인터넷에서 다운로드한 앱입니다. 열어도 괜찮습니까?
   ```
   - "열기" 클릭

3. **Gatekeeper 우회** (필요한 경우)
   - 앱을 Control + 클릭 (또는 우클릭)
   - "열기" 선택
   - 확인 대화상자에서 "열기" 클릭

## 업데이트 방법

### Windows
1. 새 버전의 설치 프로그램 다운로드
2. 실행하면 자동으로 이전 버전 제거 후 새 버전 설치
3. 설정 및 데이터는 자동으로 유지됨

### macOS
1. 새 버전의 DMG 파일 다운로드
2. 기존 앱을 Applications 폴더에서 휴지통으로 이동
3. 새 버전의 앱을 Applications 폴더로 복사

## 제거 방법

### Windows
1. **제어판에서 제거**
   - 제어판 > 프로그램 > 프로그램 제거
   - "YumYum 주문접수" 선택 후 제거

2. **설정 파일 제거** (선택사항)
   - `%APPDATA%/yumyum_order` 폴더 삭제

### macOS
1. **앱 제거**
   - Applications 폴더에서 "YumYum 주문접수" 앱을 휴지통으로 이동
   - 휴지통 비우기

2. **설정 파일 제거** (선택사항)
   ```bash
   rm -rf ~/Library/Application\ Support/yumyum_order
   rm -rf ~/Library/Preferences/com.yumyum.order.management.plist
   ```

## 문제 해결

### Windows

**Q: "Windows에서 PC 보호" 메시지가 표시됩니다**
A: "추가 정보" 클릭 후 "실행" 선택. 디지털 서명이 없는 앱이기 때문에 나타나는 정상적인 메시지입니다.

**Q: 프린터가 인식되지 않습니다**
A: 프린터 드라이버가 설치되어 있는지 확인하고, 설정에서 프린터를 다시 선택해주세요.

### macOS

**Q: "손상되어 열 수 없습니다" 메시지가 표시됩니다**
A: 터미널에서 다음 명령어 실행:
```bash
sudo xattr -cr /Applications/YumYum\ 주문접수.app
```

**Q: 앱이 실행되지 않습니다**
A: 
1. 시스템 환경설정 > 보안 및 개인 정보 보호
2. "일반" 탭에서 "확인 없이 열기" 클릭

## 개발자 정보

- 제작: DoWon Jung
- 문의: support@yumyum.com
- 버전: 1.0.0
- 라이선스: MIT

## 추가 정보

### 데이터 저장 위치

**Windows**
- 설정: `%APPDATA%/yumyum_order/config.json`
- 주문 데이터: `%APPDATA%/yumyum_order/orders/`
- 로그: `%APPDATA%/yumyum_order/logs/`

**macOS**
- 설정: `~/Library/Application Support/yumyum_order/config.json`
- 주문 데이터: `~/Library/Application Support/yumyum_order/orders/`
- 로그: `~/Library/Application Support/yumyum_order/logs/`

### 네트워크 요구사항
- 인터넷 연결 필요 (주문 수신 및 동기화)
- 방화벽에서 앱 허용 필요
- 포트: 3000, 8080 (로컬 서버)

