# YumYum Order Management System

YumYum 주문 관리 시스템입니다.

## 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 실행
```bash
npm start
```

## 개발 도구

### 테스트 실행
```bash
# 단일 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch
```

### 코드 품질 관리
```bash
# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포맷팅
npm run format
```

## 프로젝트 구조

```
yumyum_order/
├── src/           # 소스 코드
│   ├── main.js       # Electron 메인 프로세스
│   ├── main-simple.js # 간단한 메인 프로세스
│   ├── app.js        # 앱 로직
│   └── config.js     # 설정
├── renderer/      # Electron 렌더러 프로세스
│   ├── order-management.html  # 주문 관리 화면
│   ├── order-management.js    # 주문 관리 로직
│   ├── order-management.css   # 주문 관리 스타일
│   ├── settings.html          # 설정 화면
│   ├── settings.js            # 설정 로직
│   ├── settings.css           # 설정 스타일
│   └── backend-config.js      # 백엔드 API 설정
├── test/          # 테스트 파일
├── docs/          # 문서
├── dist/          # 빌드 결과물
├── package.json   # 프로젝트 설정
├── .gitignore     # Git 무시 파일
├── eslint.config.js    # ESLint 설정
├── .prettierrc.json    # Prettier 설정
└── README.md      # 프로젝트 설명서
```

## 기술 스택

- **Runtime**: Node.js + Electron
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier
- **Development**: Nodemon
- **Desktop**: Electron
- **UI**: HTML5 + CSS3 + JavaScript

## 주문 관리 화면 테스트

전문적인 주문 접수 화면이 구현되어 있습니다:

```bash
# Electron 앱 실행
npm run electron
```

### 주요 기능
- **주문 관리**: 실시간 주문 접수 및 상태 관리
- **설정 화면**: 프린터, 알림 등 다양한 설정
- **프린터 연동**: COM1~, USB, 네트워크 프린터 지원
- **백엔드 API**: 자동 연결 및 재시도 메커니즘
- **탭 전환**: 요청사항/메뉴정보/주문정보 탭
- **실시간 타이머**: 15분 카운터
- **상태 관리**: 취소/준비완료/완료처리 버튼

### 키보드 단축키
- `Ctrl+1,2,3`: 탭 전환
- `ESC`: 모달 닫기
- `Ctrl+P`: 주문정보 출력

## 백엔드 API 설정

백엔드 API 연결은 `renderer/backend-config.js` 파일에서 관리됩니다.

### 기본 설정
```javascript
const BACKEND_CONFIG = {
    apiUrl: 'http://localhost:3000',
    apiKey: '',
    timeout: 10000,
    retryCount: 3,
    autoConnect: true
};
```

### 환경 변수 지원
```bash
# API 서버 URL 설정
export API_URL=http://your-api-server.com

# API 인증 키 설정
export API_KEY=your-api-key
```

### API 사용 예제
```javascript
// 주문 조회
const result = await fetchOrders();

// 주문 생성
const newOrder = await createOrder(orderData);

// 주문 상태 업데이트
const updated = await updateOrderStatus(orderId, 'completed');
```

### 자동 연결
앱 시작 시 자동으로 백엔드 서버에 연결을 시도합니다. 연결 실패 시 로컬 모드로 작동합니다.

## 개발 가이드

1. 코드 작성 전 `npm run lint`로 코드 품질 확인
2. 테스트 작성 후 `npm test`로 테스트 실행
3. 커밋 전 `npm run format`으로 코드 포맷팅
4. 개발 중에는 `npm run dev`로 자동 재시작 모드 사용
