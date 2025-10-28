# 백엔드 연동 설정 가이드

YumYum 주문 접수 시스템의 백엔드 연동을 위한 설정 가이드입니다.

## 📋 목차

1. [백엔드 서버 설정](#백엔드-서버-설정)
2. [API 엔드포인트](#api-엔드포인트)
3. [CORS 설정](#cors-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [테스트 방법](#테스트-방법)

---

## 백엔드 서버 설정

### Spring Boot 서버 정보
- **기본 포트**: 8080
- **Base URL**: `http://localhost:8080`
- **Health Check**: `/actuator/health`

### 필요한 Spring Boot 의존성

```xml
<!-- Spring Boot Actuator (Health Check) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- Spring Boot Web (REST API) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

---

## API 엔드포인트

프론트엔드에서 사용하는 API 엔드포인트 목록입니다.

### 주문 관련 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/orders` | 전체 주문 조회 |
| GET | `/api/orders/{id}` | 특정 주문 조회 |
| GET | `/api/orders/status/{status}` | 상태별 주문 조회 |
| POST | `/api/orders` | 주문 생성 |
| PUT | `/api/orders/{id}` | 주문 업데이트 |
| PATCH | `/api/orders/{id}` | 주문 상태 업데이트 |
| DELETE | `/api/orders/{id}` | 주문 삭제 |

### 운영 상태 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/operation/status` | 운영 상태 조회 |
| POST | `/api/operation/status` | 운영 상태 변경 |

### 설정 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/settings` | 설정 조회 |
| POST | `/api/settings` | 설정 저장 |

### 통계 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/statistics` | 통계 조회 |
| GET | `/api/statistics?startDate={date}&endDate={date}` | 기간별 통계 |

### Health Check

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/actuator/health` | 서버 상태 확인 |

---

## CORS 설정

Electron 앱에서 백엔드 API를 호출하려면 CORS 설정이 필요합니다.

### Spring Boot CORS 설정 (Java)

`src/main/java/com/yumyum/order/config/WebConfig.java` 파일을 생성하세요:

```java
package com.yumyum.order.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")  // 모든 origin 허용
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
```

### 또는 Controller 레벨에서 설정

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  // 모든 origin 허용
public class OrderController {
    // ... controller code
}
```

---

## 환경 변수 설정

프론트엔드에서 백엔드 URL을 변경하려면 환경 변수를 설정하세요.

### 개발 환경

```bash
# macOS/Linux
export API_URL=http://localhost:8080

# Windows (CMD)
set API_URL=http://localhost:8080

# Windows (PowerShell)
$env:API_URL="http://localhost:8080"
```

### 프로덕션 환경

```bash
# 실제 서버 URL로 변경
export API_URL=https://api.yumyum.com
```

### package.json 스크립트에서 설정

```json
{
  "scripts": {
    "electron:dev": "API_URL=http://localhost:8080 electron .",
    "electron:prod": "API_URL=https://api.yumyum.com electron ."
  }
}
```

---

## 테스트 방법

### 1. Spring Boot 서버 실행

```bash
cd /Users/dowonjung/Desktop/도원프로젝트/yumyum_order
mvn spring-boot:run
```

### 2. Health Check 확인

브라우저에서 접속:
```
http://localhost:8080/actuator/health
```

응답 예시:
```json
{
  "status": "UP"
}
```

### 3. Electron 앱 실행

```bash
npm run electron
```

### 4. 콘솔 확인

개발자 도구 (Command + Option + I) → Console 탭에서 확인:

```
=== YumYum 백엔드 서버 자동 연결 시도 ===
서버 URL: http://localhost:8080
백엔드 서버 연결 테스트 중...
백엔드 서버 연결 성공: { status: "UP" }
✅ 백엔드 서버와 정상적으로 연결되었습니다.
백엔드 모드로 작동합니다.
```

### 5. 로컬 모드로 테스트 (백엔드 없이)

콘솔에서 수동으로 로컬 모드 활성화:

```javascript
BackendAPI.enableLocalMode()
```

---

## 주문 데이터 형식

### 주문 생성 요청 (POST /api/orders)

```json
{
  "type": "포장",
  "number": "001",
  "customerName": "홍길동",
  "customerPhone": "010-1234-5678",
  "menus": [
    {
      "name": "김치찌개",
      "quantity": 2,
      "price": 8000,
      "options": []
    }
  ],
  "totalAmount": 16000,
  "paymentMethod": "카드",
  "requests": [
    {
      "message": "포장 잘 부탁드립니다"
    }
  ],
  "status": "pending",
  "orderTime": "2025년 10월 27일 14시 30분"
}
```

### 주문 응답

```json
{
  "id": "12345",
  "type": "포장",
  "number": "001",
  "customerName": "홍길동",
  "customerPhone": "010-1234-5678",
  "menus": [...],
  "totalAmount": 16000,
  "status": "pending",
  "orderTime": "2025년 10월 27일 14시 30분",
  "createdAt": "2025-10-27T14:30:00Z"
}
```

---

## 운영 상태 데이터 형식

### 상태 변경 요청 (POST /api/operation/status)

```json
{
  "status": "offline",
  "resumeTime": "2025-10-27T16:30:00Z"
}
```

---

## 로컬 모드

백엔드 서버가 없어도 앱이 작동하도록 로컬 모드를 지원합니다.

### 로컬 모드 특징
- 모든 API 호출이 로컬에서 처리됨
- 데이터는 localStorage에 저장됨
- 백엔드 연결 실패 시 자동으로 로컬 모드로 전환

### 수동으로 전환

```javascript
// 로컬 모드 활성화
BackendAPI.enableLocalMode()

// 로컬 모드 비활성화
BackendAPI.disableLocalMode()
```

---

## 문제 해결

### 연결 실패 시

1. Spring Boot 서버가 실행 중인지 확인
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. 포트가 올바른지 확인
   - 기본: 8080
   - application.properties에서 `server.port` 확인

3. 방화벽 설정 확인

4. CORS 설정 확인

### 로그 확인

```javascript
// 백엔드 설정 확인
console.log(BackendAPI.config)

// 연결 테스트
await BackendAPI.testConnection()
```

---

## 다음 단계

1. ✅ 백엔드 API 연동 설정 완료
2. ⏳ Spring Boot Controller 구현
3. ⏳ 데이터베이스 연결
4. ⏳ 실시간 주문 수신 (WebSocket)
5. ⏳ 배포 및 운영

---

**작성일**: 2025-10-27
**버전**: 1.0.7

