/**
 * 애플리케이션 설정
 */

const config = {
  // 서버 설정
  PORT: process.env.PORT || 700,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // 주문 관련 설정
  ORDER: {
    DEFAULT_STATUS: 'pending',
    VALID_STATUSES: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    MAX_ORDERS_PER_REQUEST: 100
  },

  // 로깅 설정
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    ENABLE_CONSOLE: true
  },

  // 개발 모드 확인
  isDevelopment: () => config.NODE_ENV === 'development',
  isProduction: () => config.NODE_ENV === 'production',

  // 환경별 설정 로드
  loadEnvironment: () => {
    if (config.isDevelopment()) {
      console.log('개발 모드로 실행 중입니다.');
    } else if (config.isProduction()) {
      console.log('프로덕션 모드로 실행 중입니다.');
    }
  }
};

module.exports = config;
