/**
 * YumYum 애플리케이션 메인 로직
 */

class YumYumApp {
  constructor() {
    this.orders = [];
    this.isRunning = false;
  }

  // 애플리케이션 초기화
  initialize() {
    console.log('YumYum 애플리케이션 초기화 중...');
    this.isRunning = true;
    return this;
  }

  // 주문 추가
  addOrder(orderData) {
    const order = {
      id: this.generateOrderId(),
      ...orderData,
      createdAt: new Date(),
      status: 'pending'
    };

    this.orders.push(order);
    console.log(`새 주문이 추가되었습니다: ${order.id}`);

    return order;
  }

  // 주문 조회
  getOrder(orderId) {
    return this.orders.find(order => order.id === orderId);
  }

  // 모든 주문 조회
  getAllOrders() {
    return [...this.orders];
  }

  // 주문 상태 업데이트
  updateOrderStatus(orderId, status) {
    const order = this.getOrder(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      console.log(`주문 ${orderId}의 상태가 ${status}로 변경되었습니다.`);
      return order;
    }
    return null;
  }

  // 주문 ID 생성
  generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    return `ORDER_${timestamp}_${random}`.toUpperCase();
  }

  // 애플리케이션 종료
  shutdown() {
    console.log('YumYum 애플리케이션을 종료합니다...');
    this.isRunning = false;
  }
}

module.exports = YumYumApp;
