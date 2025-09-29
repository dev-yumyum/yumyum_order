/**
 * YumYum Order Management System
 * 메인 애플리케이션 엔트리 포인트
 */

const YumYumApp = require('./app');
const config = require('./config');

// 서버 시작 함수
function startServer() {
  const PORT = config.PORT || 3000;

  console.log('YumYum Order Management System 시작 중...');
  console.log(`서버가 포트 ${PORT}에서 실행됩니다.`);

  // 환경 설정 로드
  config.loadEnvironment();

  // 애플리케이션 인스턴스 생성 및 초기화
  const app = new YumYumApp();
  app.initialize();

  // 예제 주문 추가 (개발 모드에서만)
  if (config.isDevelopment()) {
    const sampleOrder = app.addOrder({
      customerName: '테스트 고객',
      items: ['김치찌개', '공기밥'],
      totalAmount: 8000
    });
    console.log(`예제 주문이 생성되었습니다: ${sampleOrder.id}`);
  }

  console.log('서버가 성공적으로 시작되었습니다.');
  return app;
}

// 애플리케이션 시작
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
