/**
 * Config 테스트
 */

const config = require('../src/config');

describe('Config', () => {
  test('기본 설정값들이 정의되어 있어야 함', () => {
    expect(config.PORT).toBeDefined();
    expect(config.NODE_ENV).toBeDefined();
    expect(config.ORDER).toBeDefined();
    expect(config.LOGGING).toBeDefined();
  });

  test('주문 관련 설정이 올바르게 정의되어 있어야 함', () => {
    expect(config.ORDER.DEFAULT_STATUS).toBe('pending');
    expect(config.ORDER.VALID_STATUSES).toContain('pending');
    expect(config.ORDER.VALID_STATUSES).toContain('delivered');
    expect(config.ORDER.MAX_ORDERS_PER_REQUEST).toBe(100);
  });

  test('환경 확인 함수들이 정상 동작해야 함', () => {
    expect(typeof config.isDevelopment).toBe('function');
    expect(typeof config.isProduction).toBe('function');
    expect(typeof config.loadEnvironment).toBe('function');
  });

  test('로깅 설정이 올바르게 정의되어 있어야 함', () => {
    expect(config.LOGGING.LEVEL).toBeDefined();
    expect(config.LOGGING.ENABLE_CONSOLE).toBe(true);
  });
});
