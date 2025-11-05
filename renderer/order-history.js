/**
 * YumYum 주문 내역 관리 시스템
 */

// 로그인 확인
function checkAuth() {
    const authData = localStorage.getItem('yumyum_auth');
    if (!authData) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 페이지 로드 시 인증 확인
if (!checkAuth()) {
    // 로그인 페이지로 리다이렉트
}

// 전역 변수
let orderHistory = [];
let filteredOrders = [];
let currentStatusFilter = 'all';
let selectedOrder = null;

// 날짜 관련 유틸리티
const DateUtils = {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // 날짜를 표시 형식으로 변환
    formatDisplayDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(/\. /g, '.').replace(/, /g, ' ');
    },
    
    // 오늘 날짜
    getToday() {
        return this.formatDate(new Date());
    },
    
    // 어제 날짜
    getYesterday() {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return this.formatDate(date);
    },
    
    // n일 전 날짜
    getDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return this.formatDate(date);
    },
    
    // 날짜 범위 확인
    isInRange(dateStr, startDate, endDate) {
        const date = new Date(dateStr);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // 시간 부분 제거
        date.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return date >= start && date <= end;
    }
};

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadOrderHistory();
    setupEventListeners();
    updateCurrentTime();
    
    // 1초마다 시간 업데이트
    setInterval(updateCurrentTime, 1000);
});

// 페이지 초기화
function initializePage() {
    // 오늘 날짜로 기본 설정
    const today = DateUtils.getToday();
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
    
    console.log('주문 내역 페이지 초기화 완료');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 날짜 입력 변경 시
    document.getElementById('startDate').addEventListener('change', validateDateRange);
    document.getElementById('endDate').addEventListener('change', validateDateRange);
}

// 날짜 범위 유효성 검사
function validateDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate && endDate && startDate > endDate) {
        showNotification('시작일이 종료일보다 늦을 수 없습니다.', 'error');
        document.getElementById('endDate').value = startDate;
    }
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    }).replace(/\./g, '.') + ' ' + now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// 주문 내역 로드 (localStorage에서)
function loadOrderHistory() {
    // localStorage에서 실제 주문 내역 가져오기
    const savedHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    
    // 테스트 데이터 생성 (데모 목적)
    const testOrders = generateTestOrderHistory();
    
    // 실제 주문 내역과 테스트 데이터 합치기
    orderHistory = [...savedHistory, ...testOrders];
    
    // 날짜 순 정렬 (최신순)
    orderHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 기본 검색 (오늘)
    searchOrders();
}

// 테스트 주문 내역 생성
function generateTestOrderHistory() {
    const testData = [];
    const statuses = ['completed', 'cancelled', 'rejected'];
    const types = ['포장', '매장식사'];
    const menus = [
        { name: '아이스 아메리카노', price: 4000 },
        { name: '카페라떼', price: 4500 },
        { name: '카푸치노', price: 4500 },
        { name: '바닐라라떼', price: 5000 },
        { name: '크로와상', price: 3500 },
        { name: '치즈케이크', price: 6000 }
    ];
    
    const customers = [
        { name: '김철수', phone: '010-1234-5678' },
        { name: '이영희', phone: '010-2345-6789' },
        { name: '박민수', phone: '010-3456-7890' },
        { name: '정수진', phone: '010-4567-8901' }
    ];
    
    // 오늘부터 30일 전까지의 주문 생성
    for (let i = 0; i < 50; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(Math.floor(Math.random() * 12) + 9); // 9-21시
        date.setMinutes(Math.floor(Math.random() * 60));
        
        const randomMenu = menus[Math.floor(Math.random() * menus.length)];
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        testData.push({
            id: `order-${Date.now()}-${i}`,
            orderNumber: Math.floor(Math.random() * 100) + 1,
            type: types[Math.floor(Math.random() * types.length)],
            status: randomStatus,
            customerName: randomCustomer.name,
            customerPhone: randomCustomer.phone,
            createdAt: date.toISOString(),
            completedAt: randomStatus === 'completed' ? date.toISOString() : null,
            cancelledAt: randomStatus === 'cancelled' ? date.toISOString() : null,
            rejectedAt: randomStatus === 'rejected' ? date.toISOString() : null,
            items: [
                {
                    name: randomMenu.name,
                    quantity: quantity,
                    price: randomMenu.price * quantity
                }
            ],
            totalAmount: randomMenu.price * quantity,
            preparationTime: Math.floor(Math.random() * 30) + 10,
            requests: {
                store: Math.random() > 0.5 ? '빨리 부탁드립니다' : '포장 꼼꼼히 부탁드려요',
                extras: Math.random() > 0.5 ? '수저포크 O' : '수저포크 X'
            }
        });
    }
    
    // 날짜 순 정렬 (최신순)
    return testData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// 빠른 날짜 선택
function selectQuickDate(period) {
    const today = DateUtils.getToday();
    let startDate = today;
    
    switch(period) {
        case 'today':
            startDate = today;
            break;
        case 'yesterday':
            startDate = DateUtils.getYesterday();
            break;
        case 'week':
            startDate = DateUtils.getDaysAgo(7);
            break;
        case 'month':
            startDate = DateUtils.getDaysAgo(30);
            break;
    }
    
    document.getElementById('startDate').value = startDate;
    document.getElementById('endDate').value = today;
    
    // 버튼 활성화 상태 변경
    document.querySelectorAll('.btn-quick').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.btn-quick').classList.add('active');
    
    // 자동 검색
    searchOrders();
}

// 주문 검색
function searchOrders() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('시작일과 종료일을 선택해주세요.', 'warning');
        return;
    }
    
    // 날짜 범위로 필터링
    filteredOrders = orderHistory.filter(order => {
        return DateUtils.isInRange(order.createdAt, startDate, endDate);
    });
    
    // 상태 필터 적용
    filterByStatus();
    
    // 통계 업데이트
    updateStatistics();
    
    // 주문 목록 표시
    displayOrders();
    
    console.log(`검색 완료: ${filteredOrders.length}건`);
}

// 상태별 필터링
function filterByStatus() {
    const statusFilter = document.getElementById('statusFilter').value;
    currentStatusFilter = statusFilter;
    
    if (statusFilter === 'all') {
        // 필터링 없음
        displayOrders();
    } else {
        // 상태별 필터링
        const filtered = filteredOrders.filter(order => order.status === statusFilter);
        displayOrders(filtered);
    }
}

// 통계 업데이트
function updateStatistics() {
    const completed = filteredOrders.filter(o => o.status === 'completed');
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled' || o.status === 'rejected');
    
    const totalRevenue = completed.reduce((sum, order) => sum + order.totalAmount, 0);
    
    document.getElementById('completedCount').textContent = `${completed.length}건`;
    document.getElementById('cancelledCount').textContent = `${cancelled.length}건`;
    document.getElementById('totalRevenue').textContent = `${totalRevenue.toLocaleString()}원`;
}

// 주문 목록 표시
function displayOrders(orders = filteredOrders) {
    const listContainer = document.getElementById('orderHistoryList');
    
    if (!orders || orders.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>조회된 주문 내역이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    // 상태별 필터 적용
    if (currentStatusFilter !== 'all') {
        orders = orders.filter(o => o.status === currentStatusFilter);
    }
    
    listContainer.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

// 주문 카드 생성
function createOrderCard(order) {
    const statusText = {
        'completed': '완료',
        'cancelled': '취소',
        'rejected': '거부'
    };
    
    const itemsPreview = order.items.map(item => 
        `${item.name} ${item.quantity}개`
    ).join(', ');
    
    return `
        <div class="order-card" onclick="showOrderDetail('${order.id}')">
            <div class="order-card-header">
                <div class="order-number">
                    ${order.type} ${order.orderNumber}번
                </div>
                <div class="order-status ${order.status}">
                    ${statusText[order.status] || order.status}
                </div>
            </div>
            <div class="order-card-body">
                <div class="order-info-row">
                    <span class="order-info-label">주문시간</span>
                    <span class="order-info-value">${DateUtils.formatDisplayDate(order.createdAt)}</span>
                </div>
                <div class="order-info-row">
                    <span class="order-info-label">고객명</span>
                    <span class="order-info-value">${order.customerName}</span>
                </div>
                <div class="order-info-row">
                    <span class="order-info-label">총 금액</span>
                    <span class="order-info-value">${order.totalAmount.toLocaleString()}원</span>
                </div>
                <div class="order-items-preview">
                    ${itemsPreview}
                </div>
            </div>
        </div>
    `;
}

// 주문 상세 모달 표시
function showOrderDetail(orderId) {
    selectedOrder = orderHistory.find(o => o.id === orderId);
    
    if (!selectedOrder) {
        showNotification('주문을 찾을 수 없습니다.', 'error');
        return;
    }
    
    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');
    
    const statusText = {
        'completed': '완료',
        'cancelled': '취소',
        'rejected': '거부'
    };
    
    content.innerHTML = `
        <div class="order-detail-section">
            <div class="detail-section-title">기본 정보</div>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <div class="detail-info-label">주문번호</div>
                    <div class="detail-info-value">${selectedOrder.type} ${selectedOrder.orderNumber}번</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">상태</div>
                    <div class="detail-info-value">
                        <span class="order-status ${selectedOrder.status}">
                            ${statusText[selectedOrder.status] || selectedOrder.status}
                        </span>
                    </div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">주문시간</div>
                    <div class="detail-info-value">${DateUtils.formatDisplayDate(selectedOrder.createdAt)}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">완료/취소시간</div>
                    <div class="detail-info-value">
                        ${selectedOrder.completedAt ? DateUtils.formatDisplayDate(selectedOrder.completedAt) : 
                          selectedOrder.cancelledAt ? DateUtils.formatDisplayDate(selectedOrder.cancelledAt) :
                          selectedOrder.rejectedAt ? DateUtils.formatDisplayDate(selectedOrder.rejectedAt) : '-'}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="order-detail-section">
            <div class="detail-section-title">고객 정보</div>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <div class="detail-info-label">고객명</div>
                    <div class="detail-info-value">${selectedOrder.customerName}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">연락처</div>
                    <div class="detail-info-value">${selectedOrder.customerPhone}</div>
                </div>
            </div>
        </div>
        
        <div class="order-detail-section">
            <div class="detail-section-title">주문 메뉴</div>
            <div class="detail-menu-list">
                ${selectedOrder.items.map(item => `
                    <div class="detail-menu-item">
                        <div>
                            <span class="detail-menu-name">${item.name}</span>
                            <span class="detail-menu-quantity">x${item.quantity}</span>
                        </div>
                        <div class="detail-menu-price">${item.price.toLocaleString()}원</div>
                    </div>
                `).join('')}
            </div>
            <div class="detail-total">
                <div class="detail-total-label">총 금액</div>
                <div class="detail-total-value">${selectedOrder.totalAmount.toLocaleString()}원</div>
            </div>
        </div>
        
        <div class="order-detail-section">
            <div class="detail-section-title">요청사항</div>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <div class="detail-info-label">가게 요청</div>
                    <div class="detail-info-value">${selectedOrder.requests.store || '-'}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">추가 요청</div>
                    <div class="detail-info-value">${selectedOrder.requests.extras || '-'}</div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 주문 상세 모달 닫기
function closeDetailModal() {
    const modal = document.getElementById('orderDetailModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    selectedOrder = null;
}

// 주문 상세 영수증 출력
function printOrderDetail() {
    if (!selectedOrder) return;
    
    if (window.printHelper) {
        window.printHelper.printOrderReceipt(selectedOrder).then(result => {
            if (result.success) {
                showNotification('영수증이 출력되었습니다.', 'success');
            }
        }).catch(error => {
            console.error('영수증 출력 오류:', error);
            showNotification('영수증 출력 중 오류가 발생했습니다.', 'error');
        });
    } else {
        showNotification('프린터 설정을 확인해주세요.', 'warning');
    }
}

// 뒤로 가기
function goBack() {
    window.location.href = 'order-management.html';
}

// 설정 열기
function openSettings() {
    window.location.href = 'settings.html';
}

// 앱 닫기
function closeApp() {
    if (confirm('YumYum 주문 관리 시스템을 종료하시겠습니까?')) {
        if (window.electron) {
            window.electron.closeApp();
        } else {
            window.close();
        }
    }
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 기존 알림들을 위로 이동
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach((notif, index) => {
        const currentTop = parseInt(notif.style.top) || 70;
        notif.style.top = (currentTop + 70) + 'px';
    });
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // 타입별 색상 및 아이콘
    let bgColor, icon;
    switch (type) {
        case 'success':
            bgColor = '#28a745';
            icon = '✓';
            break;
        case 'warning':
            bgColor = '#ffc107';
            icon = '⚠';
            break;
        case 'error':
            bgColor = '#dc3545';
            icon = '✗';
            break;
        default:
            bgColor = '#007bff';
            icon = 'ℹ';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    notification.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;
    
    document.body.appendChild(notification);
    
    // 자동 제거
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
    
    // 클릭으로 제거
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    });
}

// 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('주문 내역 시스템 스크립트 로드 완료');

