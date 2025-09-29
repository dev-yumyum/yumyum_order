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

- **Runtime**: Node.js
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier
- **Development**: Nodemon

## 주문 관리 화면 테스트

전문적인 주문 접수 화면이 구현되어 있습니다:

```bash
# 주문 관리 화면 열기
open renderer/order-management.html
```

### 주요 기능
- **준비완료 버튼**: 클릭 시 "준비완료 알림" 모달 팝업 표시
- **탭 전환**: 요청사항/메뉴정보/주문정보 탭
- **실시간 타이머**: 15분 카운터
- **상태 관리**: 취소/준비완료/완료처리 버튼

### 키보드 단축키
- `Ctrl+1,2,3`: 탭 전환
- `ESC`: 모달 닫기
- `Ctrl+P`: 주문정보 출력

## 개발 가이드

1. 코드 작성 전 `npm run lint`로 코드 품질 확인
2. 테스트 작성 후 `npm test`로 테스트 실행
3. 커밋 전 `npm run format`으로 코드 포맷팅
4. 개발 중에는 `npm run dev`로 자동 재시작 모드 사용
