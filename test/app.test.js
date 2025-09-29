/**
 * YumYumApp 테스트
 */

const YumYumApp = require('../src/app');

describe('YumYumApp', () => {
  let app;

  beforeEach(() => {
    app = new YumYumApp();
    app.initialize();
  });

  afterEach(() => {
    app.shutdown();
  });

  describe('초기화', () => {
    test('앱이 정상적으로 초기화되어야 함', () => {
      expect(app.isRunning).toBe(true);
      expect(app.orders).toEqual([]);
    });
  });

  describe('주문 관리', () => {
    test('새 주문을 추가할 수 있어야 함', () => {
      const orderData = {
        customerName: '홍길동',
        items: ['김치찌개', '공기밥'],
        totalAmount: 8000
      };

      const order = app.addOrder(orderData);

      expect(order.id).toBeDefined();
      expect(order.customerName).toBe('홍길동');
      expect(order.status).toBe('pending');
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(app.orders).toHaveLength(1);
    });

    test('주문 ID로 주문을 조회할 수 있어야 함', () => {
      const orderData = {
        customerName: '이순신',
        items: ['불고기'],
        totalAmount: 12000
      };

      const createdOrder = app.addOrder(orderData);
      const foundOrder = app.getOrder(createdOrder.id);

      expect(foundOrder).toBeDefined();
      expect(foundOrder.id).toBe(createdOrder.id);
      expect(foundOrder.customerName).toBe('이순신');
    });

    test('존재하지 않는 주문 ID로 조회하면 undefined를 반환해야 함', () => {
      const foundOrder = app.getOrder('NON_EXISTENT_ID');
      expect(foundOrder).toBeUndefined();
    });

    test('모든 주문을 조회할 수 있어야 함', () => {
      app.addOrder({ customerName: '고객1' });
      app.addOrder({ customerName: '고객2' });

      const orders = app.getAllOrders();
      expect(orders).toHaveLength(2);
      expect(orders[0].customerName).toBe('고객1');
      expect(orders[1].customerName).toBe('고객2');
    });

    test('주문 상태를 업데이트할 수 있어야 함', () => {
      const order = app.addOrder({ customerName: '테스트고객' });
      const updatedOrder = app.updateOrderStatus(order.id, 'confirmed');

      expect(updatedOrder.status).toBe('confirmed');
      expect(updatedOrder.updatedAt).toBeInstanceOf(Date);
    });

    test('존재하지 않는 주문의 상태 업데이트는 null을 반환해야 함', () => {
      const result = app.updateOrderStatus('NON_EXISTENT_ID', 'confirmed');
      expect(result).toBeNull();
    });
  });

  describe('주문 ID 생성', () => {
    test('고유한 주문 ID를 생성해야 함', () => {
      const id1 = app.generateOrderId();
      const id2 = app.generateOrderId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^ORDER_\d+_[A-Z0-9]+$/);
    });
  });
});
