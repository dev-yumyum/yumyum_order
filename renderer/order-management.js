/**
 * YumYum 주문 관리 시스템 - UI 인터랙션
 */

// 전역 변수
let selectedOrderId = null;

// 비즈니스 규칙 및 조건들
const BUSINESS_RULES = {
    OPERATING_HOURS: {
        start: '09:00',
        end: '22:00'
    },
    ORDER_LIMITS: {
        maxItemsPerOrder: 10,
        maxOrdersPerHour: 50,
        minOrderAmount: 1000
    },
    TIME_LIMITS: {
        maxPreparationTime: 30, // 분
        cancelTimeout: 5 // 분
    },
    MENU_STATUS: {
        available: 'available',
        soldOut: 'soldOut',
        hidden: 'hidden'
    }
};

let orders = [
    {
        id: 'order-1',
        type: '포장',
        number: 28,
        menuCount: 1,
        totalAmount: 4000,
        status: 'preparing',
        customerName: '홍길동',
        customerPhone: '010-1234-5678',
        orderTime: '02.29 14:30',
        createdAt: new Date().toISOString(), // 생성 시간 추가
        items: [
            { name: '아이스 아메리카노', quantity: 1, price: 4000 }
        ],
        requests: {
            store: '영업 소급만 부어주세요',
            extras: '수저포크 X 김치, 단무지 X'
        },
        timer: 15,
        validationStatus: 'pending' // 검증 상태 추가
    }
];

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCurrentTime();
    
    // 1초마다 시간 업데이트
    setInterval(updateCurrentTime, 1000);
    
    // 1분마다 타이머 업데이트
    setInterval(updateTimers, 60000);
    
    // 5분마다 실시간 조건 검증
    setInterval(performRealTimeValidation, 5 * 60 * 1000);
    
    // 10분마다 모든 주문 재검증
    setInterval(validateAllOrders, 10 * 60 * 1000);
});

// 애플리케이션 초기화
function initializeApp() {
    console.log('YumYum 주문 관리 시스템 초기화');
    
    // 영업 상태 확인
    checkOperatingStatus();
    
    // 주문 조건 검증
    validateAllOrders();
    
    // 첫 번째 주문 선택
    if (orders.length > 0) {
        selectOrder(orders[0].id);
    }
    
    // 기본 탭 활성화
    switchTab('requests');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 탭 버튼 클릭
    // 탭 버튼 이벤트 리스너 제거 (통합 UI로 변경)
    // const tabButtons = document.querySelectorAll('.tab-btn');
    // tabButtons.forEach(btn => {
    //     btn.addEventListener('click', (e) => {
    //         const tabName = e.target.dataset.tab;
    //         switchTab(tabName);
    //     });
    // });
    
    // 주문 상태 버튼들
    const cancelBtn = document.querySelector('.btn-cancel');
    const readyBtn = document.querySelector('.btn-ready');
    const completeBtn = document.querySelector('.btn-complete');
    
    if (cancelBtn) cancelBtn.addEventListener('click', () => updateOrderStatus('cancelled'));
    if (readyBtn) readyBtn.addEventListener('click', () => updateOrderStatus('ready'));
    if (completeBtn) completeBtn.addEventListener('click', () => updateOrderStatus('completed'));
    
    // 주문정보 재출력 버튼
    const reorderBtn = document.querySelector('.btn-reorder');
    if (reorderBtn) {
        reorderBtn.addEventListener('click', printOrderInfo);
    }
    
    // 메뉴 토글 버튼
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // 설정 버튼
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
    
    // 닫기 버튼
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeApplication);
    }
    
    // 모달 배경 클릭 시 닫기
    const readyModal = document.getElementById('readyNotificationModal');
    if (readyModal) {
        readyModal.addEventListener('click', (e) => {
            if (e.target === readyModal) {
                closeReadyModal();
            }
        });
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
    
    // 매 시간마다 영업 상태 재확인 (정각에만)
    if (now.getMinutes() === 0 && now.getSeconds() === 0) {
        checkOperatingStatus();
    }
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // 모든 탭 패널 숨김
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
    // 탭 기능 제거됨 - 통합 UI 사용
    // const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    // const activeTabPanel = document.getElementById(tabName);
}

// 주문 선택
function selectOrder(orderId) {
    selectedOrderId = orderId;
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // UI 업데이트
    updateOrderDisplay(order);
    updateSidebarSelection(orderId);
}

// 주문 표시 업데이트
function updateOrderDisplay(order) {
    // 주문 헤더 업데이트
    const orderTitle = document.querySelector('.order-title h2');
    const orderSubtitle = document.querySelector('.order-subtitle');
    
    if (orderTitle) {
        orderTitle.textContent = `${order.type} ${order.number}`;
    }
    
    if (orderSubtitle) {
        orderSubtitle.textContent = `메뉴 ${order.menuCount}개 · 총 ${order.totalAmount.toLocaleString()}원 (결제완료)`;
    }
    
    // 통합 주문정보 업데이트
    updateIntegratedOrderInfo(order);
}

// 통합 주문정보 업데이트
function updateIntegratedOrderInfo(order) {
    // 기본 주문 정보 업데이트
    const orderTimeInfo = document.getElementById('orderTimeInfo');
    const customerNameInfo = document.getElementById('customerNameInfo');
    const customerPhoneInfo = document.getElementById('customerPhoneInfo');
    const orderTypeInfo = document.getElementById('orderTypeInfo');
    
    if (orderTimeInfo) orderTimeInfo.textContent = order.orderTime;
    if (customerNameInfo) customerNameInfo.textContent = order.customerName;
    if (customerPhoneInfo) customerPhoneInfo.textContent = order.customerPhone;
    if (orderTypeInfo) orderTypeInfo.textContent = order.type;
    
    // 메뉴 정보 업데이트
    const menuList = document.getElementById('integratedMenuList');
    if (menuList && order.items) {
        menuList.innerHTML = order.items.map(item => `
            <div class="menu-item-row">
                <span class="menu-name">${item.name}</span>
                <div class="menu-details">
                    <span class="quantity">${item.quantity}개</span>
                    <span class="price">${item.price.toLocaleString()}원</span>
                </div>
            </div>
        `).join('');
    }
    
    // 총 금액 업데이트
    const totalAmountInfo = document.getElementById('totalAmountInfo');
    if (totalAmountInfo) {
        totalAmountInfo.textContent = `${order.totalAmount.toLocaleString()}원`;
    }
    
    // 요청사항 업데이트
    const requestsContent = document.getElementById('integratedRequests');
    if (requestsContent && order.requests) {
        requestsContent.innerHTML = `
            <div class="request-item">
                <span class="request-label">가게</span>
                <span class="request-text">${order.requests.store || '요청사항 없음'}</span>
            </div>
            <div class="request-item">
                <span class="request-label">취급정</span>
                <span class="request-text">${order.requests.extras || '요청사항 없음'}</span>
            </div>
        `;
    }
}

// 기존 탭 업데이트 함수 제거됨 (통합 UI로 변경)
// function updateMenuTab(order) { ... }

// 기존 탭 업데이트 함수 제거됨 (통합 UI로 변경)
// function updateOrderInfoTab(order) { ... }

// 사이드바 선택 상태 업데이트
function updateSidebarSelection(orderId) {
    const orderItems = document.querySelectorAll('.order-item');
    orderItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`[onclick="selectOrder('${orderId}')"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
}

// 주문 상태 업데이트 (조건 검증 적용)
function updateOrderStatus(status) {
    if (!selectedOrderId) return;
    
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;
    
    // 1. 영업시간 확인
    if (!checkOperatingStatus()) {
        showNotification('영업시간이 아닙니다. 상태 변경이 제한됩니다.', 'warning');
        return;
    }
    
    // 2. 상태 변경 조건 확인
    const statusCheck = canChangeOrderStatus(order, status);
    if (!statusCheck.allowed) {
        showNotification(statusCheck.reason, 'error');
        return;
    }
    
    // 3. 주문 유효성 재검증
    const validation = validateOrderConditions(order);
    if (!validation.isValid && status !== 'cancelled') {
        const errorMsg = `주문 검증 실패: ${validation.errors.join(', ')}`;
        showNotification(errorMsg, 'error');
        console.warn(errorMsg);
        return;
    }
    
    // 상태에 따른 액션
    switch (status) {
        case 'cancelled':
            order.status = status;
            order.updatedAt = new Date().toISOString();
            showNotification('주문이 취소되었습니다.', 'warning');
            logOrderStatusChange(order, status, '관리자에 의한 취소');
            break;
        case 'ready':
            // 준비완료 모달 표시
            showReadyModal();
            break;
        case 'completed':
            order.status = status;
            order.updatedAt = new Date().toISOString();
            order.completedAt = new Date().toISOString();
            showNotification('주문이 완료되었습니다.', 'success');
            logOrderStatusChange(order, status, '주문 완료 처리');
            break;
    }
    
    // 주문 목록 UI 업데이트
    updateOrderDisplay(order);
    
    console.log(`주문 ${selectedOrderId} 상태 처리: ${status}`);
}

// 준비완료 모달 표시
function showReadyModal() {
    const modal = document.getElementById('readyNotificationModal');
    if (modal) {
        modal.classList.add('show');
        // ESC 키로 모달 닫기 방지 (확인 버튼만으로 닫아야 함)
        document.body.style.overflow = 'hidden';
    }
}

// 준비완료 모달 닫기
function closeReadyModal() {
    const modal = document.getElementById('readyNotificationModal');
    if (modal) {
        modal.classList.add('hiding');
        setTimeout(() => {
            modal.classList.remove('show', 'hiding');
            document.body.style.overflow = '';
        }, 300);
    }
}

// 준비완료 확인
function confirmReady() {
    if (!selectedOrderId) {
        closeReadyModal();
        return;
    }
    
    const order = orders.find(o => o.id === selectedOrderId);
    if (order) {
        order.status = 'ready';
        showNotification('주문 준비가 완료되었습니다. 고객에게 알림을 발송했습니다.', 'success');
        console.log(`주문 ${selectedOrderId} 상태가 ready로 변경되었습니다.`);
        
        // 주문 UI 업데이트 (필요시)
        updateOrderDisplay(order);
    }
    
    closeReadyModal();
}

// === 비즈니스 로직 및 조건 검증 함수들 ===

// 영업 상태 확인
function checkOperatingStatus() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM 형식
    const { start, end } = BUSINESS_RULES.OPERATING_HOURS;
    
    const isOperating = currentTime >= start && currentTime <= end;
    
    // 상태 표시기 업데이트
    const statusIndicator = document.querySelector('.status-indicator span');
    const statusIcon = document.querySelector('.status-indicator .online');
    
    if (statusIndicator && statusIcon) {
        if (isOperating) {
            statusIndicator.textContent = '영업중';
            statusIcon.style.color = '#28a745';
        } else {
            statusIndicator.textContent = '영업종료';
            statusIcon.style.color = '#dc3545';
        }
    }
    
    console.log(`영업 상태: ${isOperating ? '영업중' : '영업종료'} (현재시간: ${currentTime})`);
    return isOperating;
}

// 모든 주문 유효성 검증
function validateAllOrders() {
    orders.forEach(order => {
        const validation = validateOrderConditions(order);
        if (!validation.isValid) {
            console.warn(`주문 ${order.id} 검증 실패:`, validation.errors);
            order.validationErrors = validation.errors;
        } else {
            delete order.validationErrors;
        }
    });
}

// 개별 주문 조건 검증
function validateOrderConditions(order) {
    const errors = [];
    
    // 1. 주문 금액 검증
    if (order.totalAmount < BUSINESS_RULES.ORDER_LIMITS.minOrderAmount) {
        errors.push(`최소 주문금액 ${BUSINESS_RULES.ORDER_LIMITS.minOrderAmount}원 미만`);
    }
    
    // 2. 메뉴 개수 검증
    if (order.items && order.items.length > BUSINESS_RULES.ORDER_LIMITS.maxItemsPerOrder) {
        errors.push(`최대 주문 가능 메뉴 개수(${BUSINESS_RULES.ORDER_LIMITS.maxItemsPerOrder}개) 초과`);
    }
    
    // 3. 포장 주문 검증 (예약 기능 제외)
    if (order.type === '포장' && (order.reservationTime || order.reservationDate)) {
        errors.push('포장 주문은 예약이 불가능합니다');
    }
    
    // 4. 준비 시간 초과 검증
    if (order.timer && order.timer > BUSINESS_RULES.TIME_LIMITS.maxPreparationTime) {
        errors.push(`최대 준비시간(${BUSINESS_RULES.TIME_LIMITS.maxPreparationTime}분) 초과`);
    }
    
    // 5. 고객 정보 검증
    if (!order.customerName || order.customerName.trim().length === 0) {
        errors.push('고객명이 없습니다');
    }
    
    if (order.customerPhone && !isValidPhoneNumber(order.customerPhone)) {
        errors.push('유효하지 않은 전화번호입니다');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 전화번호 유효성 검사
function isValidPhoneNumber(phone) {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
}

// 주문 상태 변경 조건 확인
function canChangeOrderStatus(order, newStatus) {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const timeDiff = (now - orderTime) / (1000 * 60); // 분 단위
    
    switch (newStatus) {
        case 'cancelled':
            // 접수 후 일정 시간 내에만 취소 가능
            if (timeDiff > BUSINESS_RULES.TIME_LIMITS.cancelTimeout) {
                return {
                    allowed: false,
                    reason: `주문 후 ${BUSINESS_RULES.TIME_LIMITS.cancelTimeout}분 이내에만 취소 가능합니다`
                };
            }
            if (order.status === 'ready' || order.status === 'completed') {
                return {
                    allowed: false,
                    reason: '이미 준비완료되거나 완료된 주문은 취소할 수 없습니다'
                };
            }
            break;
            
        case 'ready':
            if (order.status !== 'preparing') {
                return {
                    allowed: false,
                    reason: '준비중 상태인 주문만 준비완료로 변경할 수 있습니다'
                };
            }
            break;
            
        case 'completed':
            if (order.status !== 'ready') {
                return {
                    allowed: false,
                    reason: '준비완료 상태인 주문만 완료처리할 수 있습니다'
                };
            }
            break;
    }
    
    return { allowed: true };
}

// 시간당 주문량 확인
function checkHourlyOrderLimit() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentOrders = orders.filter(order => {
        const orderTime = new Date(order.createdAt);
        return orderTime > oneHourAgo;
    });
    
    return {
        count: recentOrders.length,
        limit: BUSINESS_RULES.ORDER_LIMITS.maxOrdersPerHour,
        exceeded: recentOrders.length >= BUSINESS_RULES.ORDER_LIMITS.maxOrdersPerHour
    };
}

// 메뉴 가용성 확인 (실제 환경에서는 DB에서 확인)
function checkMenuAvailability(menuName) {
    // 예시 데이터 (실제로는 서버에서 확인)
    const menuStatus = {
        '아이스 아메리카노': BUSINESS_RULES.MENU_STATUS.available,
        '김치찌개': BUSINESS_RULES.MENU_STATUS.available,
        '불고기': BUSINESS_RULES.MENU_STATUS.soldOut,
        '냉면': BUSINESS_RULES.MENU_STATUS.hidden
    };
    
    return menuStatus[menuName] || BUSINESS_RULES.MENU_STATUS.available;
}

// 주문 상태 변경 로그 기록
function logOrderStatusChange(order, newStatus, reason = '') {
    const logEntry = {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: newStatus,
        timestamp: new Date().toISOString(),
        reason: reason,
        user: 'system' // 실제 환경에서는 로그인한 사용자 정보
    };
    
    // 로컬 스토리지나 서버에 로그 저장
    const logs = JSON.parse(localStorage.getItem('orderLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('orderLogs', JSON.stringify(logs));
    
    console.log('주문 상태 변경 로그:', logEntry);
}

// 실시간 조건 검증 및 알림
function performRealTimeValidation() {
    // 1. 시간당 주문량 확인
    const hourlyCheck = checkHourlyOrderLimit();
    if (hourlyCheck.exceeded) {
        showNotification(`시간당 주문량 한계에 근접했습니다. (${hourlyCheck.count}/${hourlyCheck.limit})`, 'warning');
    }
    
    // 2. 장시간 대기 주문 확인
    const longWaitingOrders = orders.filter(order => {
        return order.status === 'preparing' && 
               order.timer > BUSINESS_RULES.TIME_LIMITS.maxPreparationTime;
    });
    
    if (longWaitingOrders.length > 0) {
        longWaitingOrders.forEach(order => {
            showNotification(`주문 ${order.number}이 최대 준비시간을 초과했습니다. (${order.timer}분)`, 'error');
        });
    }
    
    // 3. 처리 지연 주문 확인
    const delayedOrders = orders.filter(order => {
        return order.status === 'preparing' && order.timer > 20; // 20분 이상 지연
    });
    
    delayedOrders.forEach(order => {
        showNotification(`주문 ${order.number}이 ${order.timer}분째 처리 중입니다.`, 'warning');
    });
}

// 주문 상태별 통계 확인
function getOrderStatistics() {
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        validationErrors: orders.filter(o => o.validationErrors && o.validationErrors.length > 0).length
    };
    
    return stats;
}

// 조건별 주문 필터링
function filterOrdersByCondition(condition) {
    switch (condition) {
        case 'overdue':
            return orders.filter(order => 
                order.timer > BUSINESS_RULES.TIME_LIMITS.maxPreparationTime
            );
        case 'delayed_orders':
            return orders.filter(order => 
                order.status === 'preparing' && order.timer > 20
            );
        case 'validation_failed':
            return orders.filter(order => 
                order.validationErrors && order.validationErrors.length > 0
            );
        case 'high_value':
            return orders.filter(order => 
                order.totalAmount >= 20000
            );
        default:
            return orders;
    }
}

// 타이머 업데이트
function updateTimers() {
    orders.forEach(order => {
        if (order.status === 'preparing') {
            order.timer += 1;
            
            // UI에서 타이머 업데이트
            const timerElement = document.querySelector('.timer-text');
            if (timerElement && order.id === selectedOrderId) {
                timerElement.textContent = `${order.timer}분`;
            }
        }
    });
}

// 주문정보 출력
function printOrderInfo() {
    if (!selectedOrderId) return;
    
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;
    
    // 실제 환경에서는 프린터 연결 또는 PDF 생성
    const printContent = `
        주문번호: ${order.type} ${order.number}
        고객명: ${order.customerName}
        연락처: ${order.customerPhone}
        주문시간: ${order.orderTime}
        예약시간: ${order.reservationDate}
        
        메뉴:
        ${order.items.map(item => `${item.name} ${item.quantity}개 - ${item.price.toLocaleString()}원`).join('\n')}
        
        총금액: ${order.totalAmount.toLocaleString()}원
        
        요청사항:
        가게: ${order.requests.store}
        취급정: ${order.requests.extras}
    `;
    
    console.log('주문정보 출력:', printContent);
    showNotification('주문정보가 출력되었습니다.', 'success');
}

// 사이드바 토글
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// 설정 열기
function openSettings() {
    showNotification('설정 화면을 준비 중입니다.', 'info');
}

// 애플리케이션 닫기
function closeApplication() {
    if (confirm('애플리케이션을 종료하시겠습니까?')) {
        // Electron 환경에서는 window.close() 또는 ipcRenderer 사용
        if (typeof window !== 'undefined' && window.close) {
            window.close();
        } else {
            showNotification('애플리케이션 종료 요청', 'info');
        }
    }
}

// 알림 표시 (개선된 버전)
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
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    notification.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;
    
    document.body.appendChild(notification);
    
    // 자동 제거 (에러는 5초, 나머지는 3초)
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

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                switchTab('requests');
                break;
            case '2':
                e.preventDefault();
                switchTab('menu');
                break;
            case '3':
                e.preventDefault();
                switchTab('order');
                break;
            case 'p':
                e.preventDefault();
                printOrderInfo();
                break;
        }
    }
    
    // ESC 키로 설정/모달 닫기
    if (e.key === 'Escape') {
        // 준비완료 모달이 열려있으면 닫기
        const readyModal = document.getElementById('readyNotificationModal');
        if (readyModal && readyModal.classList.contains('show')) {
            closeReadyModal();
        }
    }
});

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
    
    .sidebar.collapsed {
        width: 60px;
    }
    
    .sidebar.collapsed .section-header span:not(.info-icon),
    .sidebar.collapsed .order-status-text,
    .sidebar.collapsed .order-info,
    .sidebar.collapsed .nav-item span {
        display: none;
    }
`;
document.head.appendChild(style);

// 설정 화면 열기
function openSettings() {
    window.location.href = 'settings.html';
}

// 앱 종료
function closeApp() {
    if (confirm('YumYum 주문 관리 시스템을 종료하시겠습니까?')) {
        if (window.electron) {
            window.electron.closeApp();
        } else {
            window.close();
        }
    }
}

console.log('YumYum 주문 관리 시스템 스크립트 로드 완료');

