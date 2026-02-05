# YumYum Order - 브랜치 관리 전략

## 📋 브랜치 구조

### Main 브랜치
- **브랜치명**: `main`
- **용도**: 안정적인 프로덕션 코드
- **규칙**: 
  - ⚠️ **직접 수정 금지**
  - 기능 브랜치에서 개발 후 PR을 통해서만 병합
  - 항상 배포 가능한 상태 유지

### 기능 브랜치 (Feature Branches)

#### 1. 워딩 변경 및 자동 운영중단 기능
- **브랜치명**: `feature/wording-and-auto-stop`
- **커밋**: `73a46d6`
- **기능**:
  - '접수' → '수락' 워딩 변경
  - '거부' → '거절' 워딩 변경
  - 3회 연속 거절 시 자동 운영중단
  - 다음날 자정 자동 재개
  - 설정에서 수동 재개 기능

#### 2. 주문 유형 UI 개선
- **브랜치명**: `feature/order-type-ui`
- **커밋**: `b56cc30`
- **기능**:
  - 포장/매장식사 주문 유형 명확 표시
  - 영수증에 주문 유형 배지 추가
  - UI에 유형별 아이콘 추가 (📦 포장, 🍽️ 매장식사)
  - 유형별 색상 구분

---

## 🔄 작업 흐름 (Workflow)

### 1. 새 기능 개발 시작

```bash
# main 브랜치에서 최신 코드 가져오기
git checkout main
git pull origin main

# 새 기능 브랜치 생성
git checkout -b feature/기능명

# 예: 메뉴 관리 기능
git checkout -b feature/menu-management
```

### 2. 작업 중

```bash
# 작업 후 변경사항 확인
git status

# 변경사항 스테이징
git add .

# 커밋 (의미있는 메시지 작성)
git commit -m "feat: 메뉴 관리 기능 추가"

# 원격 브랜치에 푸시
git push origin feature/기능명
```

### 3. 기능 완료 후 Main에 병합

```bash
# main 브랜치로 전환
git checkout main

# 기능 브랜치 병합
git merge feature/기능명

# 원격에 푸시
git push origin main

# (선택) 병합된 브랜치 삭제
git branch -d feature/기능명
```

### 4. 다른 기능 브랜치로 전환

```bash
# 브랜치 목록 확인
git branch -v

# 원하는 브랜치로 전환
git checkout feature/다른기능명
```

---

## 📝 브랜치 명명 규칙

### Feature 브랜치
```
feature/기능명
```

**예시:**
- `feature/menu-management` - 메뉴 관리
- `feature/sales-report` - 매출 리포트
- `feature/customer-review` - 고객 리뷰
- `feature/printer-setup` - 프린터 설정

### Bugfix 브랜치
```
bugfix/버그설명
```

**예시:**
- `bugfix/order-timer` - 주문 타이머 버그
- `bugfix/print-error` - 출력 오류

### Hotfix 브랜치 (긴급 수정)
```
hotfix/긴급수정내용
```

**예시:**
- `hotfix/payment-crash` - 결제 크래시

---

## 🎯 커밋 메시지 규칙

### 형식
```
타입(범위): 제목

본문 (선택사항)
```

### 타입
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 기타 작업

### 예시
```bash
feat(주문): 주문 취소 기능 추가
fix(영수증): 출력 시 금액 오류 수정
docs(README): 설치 방법 업데이트
refactor(주문관리): 타이머 로직 개선
```

---

## ⚠️ 주의사항

1. **Main 브랜치는 절대 직접 수정하지 않습니다**
2. 항상 기능 브랜치에서 작업합니다
3. 작업 전 `git pull`로 최신 코드를 받습니다
4. 의미있는 커밋 메시지를 작성합니다
5. 커밋 단위는 작고 명확하게 유지합니다

---

## 📊 현재 브랜치 상태

```bash
# 모든 브랜치 확인
git branch -v

# 현재 브랜치 확인
git branch --show-current

# 브랜치 간 차이 확인
git diff main..feature/브랜치명
```

---

## 🚀 빠른 참조

### 자주 사용하는 명령어

```bash
# 브랜치 생성 및 전환
git checkout -b feature/새기능

# 브랜치 전환
git checkout feature/기존기능

# 브랜치 목록
git branch -a

# 변경사항 확인
git status

# 커밋
git add .
git commit -m "feat: 기능 추가"

# 푸시
git push origin feature/기능명

# Main에 병합
git checkout main
git merge feature/기능명
git push origin main
```

---

## 📞 문제 발생 시

### Main을 실수로 수정한 경우

```bash
# 변경사항 확인
git status

# 임시 저장 (stash)
git stash

# 새 브랜치 생성
git checkout -b feature/실수로-작업한-내용

# 임시 저장한 내용 복원
git stash pop

# 커밋
git add .
git commit -m "feat: 기능 추가"

# Main 원상복구
git checkout main
git reset --hard origin/main
```

### 브랜치 간 이동 시 충돌

```bash
# 현재 작업 임시 저장
git stash

# 브랜치 전환
git checkout 다른브랜치

# 작업 복원 (필요시)
git stash pop
```

---

## 📅 업데이트 날짜

마지막 업데이트: 2026-02-05
