/**
 * YumYum 주문 관리 시스템 - UI 인터랙션
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
let selectedOrderId = null;
let currentPreparationTime = 10; // 기본 준비시간 10분
const MIN_PREPARATION_TIME = 5; // 최소 5분
const MAX_PREPARATION_TIME = 60; // 최대 60분
const TIME_STEP = 5; // 5분 단위
let appSettings = null; // 앱 설정

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

// 날짜 포맷팅 함수
function formatOrderTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
}

let orders = [
    {
        id: 'order-1',
        type: '포장',
        number: 28,
        menuCount: 1,
        totalAmount: 4000,
        status: 'pending', // 신규 주문 상태로 변경
        customerName: '홍길동',
        customerPhone: '010-1234-5678',
        orderTime: formatOrderTime(new Date()),
        createdAt: new Date().toISOString(), // 생성 시간 추가
        items: [
            { name: '아이스 아메리카노', quantity: 1, price: 4000 }
        ],
        requests: {
            store: '영업 소급만 부어주세요',
            extras: '수저포크 X 김치, 단무지 X'
        },
        timer: 0,
        preparationTime: 10, // 예상 준비시간
        validationStatus: 'pending' // 검증 상태 추가
    }
];

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCurrentTime();
    loadSettings(); // 설정 로드
    
    // 1초마다 시간 업데이트
    setInterval(updateCurrentTime, 1000);
    
    // 1초마다 타이머 업데이트 (내부에서 초 단위로 카운팅)
    setInterval(updateTimers, 1000);
    
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
    const printReceiptBtn = document.querySelector('.btn-print-receipt');
    const readyBtn = document.querySelector('.btn-ready');
    const completeBtn = document.querySelector('.btn-complete');
    
    if (printReceiptBtn) printReceiptBtn.addEventListener('click', printOrderInfo);
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
        menuToggle.addEventListener('click', openSideMenu);
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
    
    // 주문 접수 영역 표시 여부 결정
    const acceptSection = document.getElementById('orderAcceptSection');
    if (acceptSection) {
        if (order.status === 'pending') {
            // 자동접수가 켜져 있으면 자동으로 접수
            if (appSettings && appSettings.general.autoAcceptEnabled) {
                autoAcceptOrder(order);
                return;
            }
            
            // 신규 주문인 경우 접수 영역 표시
            acceptSection.style.display = 'block';
            // 준비시간 초기화
            currentPreparationTime = order.preparationTime || 10;
            updatePreparationTimeDisplay();
            
            // 알림 재생
            playOrderNotification();
        } else {
            // 접수된 주문은 접수 영역 숨김
            acceptSection.style.display = 'none';
        }
    }
    
    // UI 업데이트
    updateOrderDisplay(order);
    updateSidebarSelection(orderId);
    
    // 새 주문인 경우 영수증 자동 출력 (5분 이내 생성된 주문)
    if (order.createdAt && window.printHelper) {
        const orderTime = new Date(order.createdAt);
        const now = new Date();
        const diffMinutes = (now - orderTime) / 1000 / 60;
        
        // 5분 이내 생성된 주문이고, 아직 출력하지 않은 주문
        if (diffMinutes <= 5 && !order.receiptPrinted) {
            // 영수증 자동 출력
            window.printHelper.autoPrintReceipt(order).then(result => {
                if (result.success) {
                    console.log('새 주문 영수증 자동 출력 완료:', orderId);
                    // 출력 완료 플래그 설정
                    order.receiptPrinted = true;
                } else {
                    console.log('영수증 자동 출력 실패:', result.reason);
                }
            }).catch(error => {
                console.error('영수증 출력 오류:', error);
            });
        }
    }
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
            <div class="menu-item-inline">
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
        let requestsHtml = '';
        
        // 가게 요청사항이 있으면 추가
        if (order.requests.store && order.requests.store !== '요청사항 없음') {
            requestsHtml += `<div class="request-message">${order.requests.store}</div>`;
        }
        
        // 취급 요청사항이 있으면 추가
        if (order.requests.extras && order.requests.extras !== '요청사항 없음') {
            requestsHtml += `<div class="request-message">${order.requests.extras}</div>`;
        }
        
        // 요청사항이 하나도 없으면
        if (!requestsHtml) {
            requestsHtml = '<div class="request-message">요청사항 없음</div>';
        }
        
        requestsContent.innerHTML = requestsHtml;
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
            order.cancelledAt = new Date().toISOString();
            showNotification('주문이 취소되었습니다.', 'warning');
            logOrderStatusChange(order, status, '관리자에 의한 취소');
            saveOrderToHistory(order); // 주문 내역에 저장
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
            saveOrderToHistory(order); // 주문 내역에 저장
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
        order.readyCompletedAt = new Date().toISOString(); // 준비완료 시간 저장
        showNotification('주문 준비가 완료되었습니다. 고객에게 알림을 발송했습니다.', 'success');
        console.log(`주문 ${selectedOrderId} 상태가 ready로 변경되었습니다.`);
        
        // 사이드바 UI 업데이트 - 준비완료 주문을 맨 아래로 이동
        updatePreparingSection();
        
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
        // 신규 상태(pending)거나 준비중(preparing) 상태일 때 타이머 증가
        // 준비완료(ready) 상태일 때는 타이머 멈춤
        if (order.status === 'pending' || order.status === 'preparing') {
            // 초 단위로 증가 (timer는 초 단위로 저장)
            if (!order.timerSeconds) {
                order.timerSeconds = 0;
            }
            order.timerSeconds += 1;
            
            // 분 단위로 변환
            const minutes = Math.floor(order.timerSeconds / 60);
            
            // 해당 주문의 타이머 UI 업데이트
            updateOrderTimerUI(order.id, minutes, order.timerSeconds);
        }
    });
}

// 주문 타이머 UI 업데이트 (원형 프로그레스 바 포함)
function updateOrderTimerUI(orderId, minutes, seconds) {
    // 사이드바의 주문 아이템 찾기
    const orderElement = document.querySelector(`.order-item[data-order-id="${orderId}"]`);
    if (!orderElement) return;
    
    const timerText = orderElement.querySelector('.timer-text');
    const timerProgress = orderElement.querySelector('.timer-progress');
    
    if (timerText) {
        timerText.textContent = `${minutes}분`;
        timerText.style.color = '#ff4444';
    }
    
    if (timerProgress) {
        // 원의 둘레: 2πr = 2 × π × 20 = 125.6
        const circumference = 125.6;
        // 30분을 기준으로 프로그레스 계산 (30분 = 100%)
        const maxMinutes = 30;
        const progress = Math.min(minutes / maxMinutes, 1);
        const offset = circumference * (1 - progress);
        
        timerProgress.style.strokeDashoffset = offset;
        
        // 시간에 따라 색상 변경
        if (minutes < 10) {
            timerProgress.style.stroke = '#ff4444'; // 빨강
        } else if (minutes < 20) {
            timerProgress.style.stroke = '#ff8800'; // 주황
        } else {
            timerProgress.style.stroke = '#ff0000'; // 진한 빨강
        }
    }
}

// 주문정보 출력
function printOrderInfo() {
    if (!selectedOrderId) return;
    
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;
    
    // 영수증 출력 헬퍼 사용
    if (window.printHelper) {
        window.printHelper.printOrderReceipt(order).then(result => {
            if (result.success) {
                console.log('영수증 재출력 완료');
                showNotification('영수증이 출력되었습니다.', 'success');
            }
        }).catch(error => {
            console.error('영수증 재출력 오류:', error);
            showNotification('영수증 출력 중 오류가 발생했습니다.', 'error');
        });
    } else {
        // 폴백: 콘솔 출력
        const printContent = `
            주문번호: ${order.type} ${order.number}
            고객명: ${order.customerName}
            연락처: ${order.customerPhone}
            주문시간: ${order.orderTime}
            
            메뉴:
            ${order.items.map(item => `${item.name} ${item.quantity}개 - ${item.price.toLocaleString()}원`).join('\n')}
            
            총금액: ${order.totalAmount.toLocaleString()}원
            
            요청사항:
            ${order.requests ? (typeof order.requests === 'string' ? order.requests : JSON.stringify(order.requests)) : '없음'}
        `;
        
        console.log('주문정보 출력:', printContent);
        showNotification('프린터 설정을 확인해주세요.', 'warning');
    }
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
        const currentBottom = parseInt(notif.style.bottom) || 20;
        notif.style.bottom = (currentBottom + 70) + 'px';
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
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 100000;
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
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100%);
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

// 테스트 주문 생성 함수
function createTestOrder() {
    const testMenus = [
        { name: '아이스 아메리카노', price: 4000 },
        { name: '카페라떼', price: 4500 },
        { name: '카푸치노', price: 4500 },
        { name: '바닐라라떼', price: 5000 },
        { name: '카라멜마끼아또', price: 5500 },
        { name: '크로와상', price: 3500 },
        { name: '치즈케이크', price: 6000 },
        { name: '초코브라우니', price: 4500 }
    ];
    
    const testCustomers = [
        { name: '김철수', phone: '010-1234-5678' },
        { name: '이영희', phone: '010-2345-6789' },
        { name: '박민수', phone: '010-3456-7890' },
        { name: '정수진', phone: '010-4567-8901' },
        { name: '최동훈', phone: '010-5678-9012' }
    ];
    
    const orderTypes = ['포장', '매장'];
    
    // 랜덤 선택
    const randomMenu = testMenus[Math.floor(Math.random() * testMenus.length)];
    const randomCustomer = testCustomers[Math.floor(Math.random() * testCustomers.length)];
    const randomType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const randomQuantity = Math.floor(Math.random() * 3) + 1; // 1-3개
    
    // 주문 번호 생성
    const orderNumber = Math.floor(Math.random() * 100) + 1;
    
    // 새 주문 생성 (신규 상태로)
    const newOrder = {
        id: `order-${Date.now()}`,
        type: randomType,
        number: orderNumber,
        menuCount: randomQuantity,
        totalAmount: randomMenu.price * randomQuantity,
        status: 'pending', // 신규 주문 상태
        customerName: randomCustomer.name,
        customerPhone: randomCustomer.phone,
        orderTime: formatOrderTime(new Date()),
        createdAt: new Date().toISOString(),
        items: [
            { 
                name: randomMenu.name, 
                quantity: randomQuantity, 
                price: randomMenu.price * randomQuantity 
            }
        ],
        requests: {
            store: Math.random() > 0.5 ? '빨리 부탁드립니다' : '포장 꼼꼼히 부탁드려요',
            extras: Math.random() > 0.5 ? '수저포크 O 김치 X' : '수저포크 X 김치 X'
        },
        timer: 0,
        timerSeconds: 0, // 초 단위 타이머
        preparationTime: 10, // 기본 준비시간
        validationStatus: 'pending',
        receiptPrinted: false
    };
    
    // 주문 목록에 추가
    orders.unshift(newOrder);
    
    // 사이드바에 주문 추가
    addOrderToSidebar(newOrder);
    
    // 사이드바 카운터 업데이트
    updateSidebarCounters();
    
    // 주문 알림 팝업 표시 (오른쪽 하단 알림도 자동으로 표시됨)
    showOrderAlert(newOrder);
    
    console.log('테스트 주문 생성:', newOrder);
}

// 사이드바에 주문 추가
function addOrderToSidebar(order) {
    // 주문 상태에 따라 적절한 섹션 선택
    let targetSection;
    let statusLabel;
    
    if (order.status === 'pending') {
        // 신규 섹션
        targetSection = document.querySelector('.sidebar-section:nth-child(1)');
        statusLabel = '신규';
    } else if (order.status === 'preparing') {
        // 진행 섹션
        targetSection = document.querySelector('.sidebar-section:nth-child(2)');
        statusLabel = '접수';
    } else {
        return; // 다른 상태는 사이드바에 표시하지 않음
    }
    
    if (!targetSection) return;
    
    // 주문 시간에서 시간만 추출 (예: "2025년 10월 24일 14시 30분" -> "14:30")
    const timeMatch = order.orderTime.match(/(\d+)시 (\d+)분/);
    const shortTime = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : order.orderTime;
    
    // 주문 아이템 HTML 생성 (SVG 타이머 포함)
    const orderItemHTML = `
        <div class="order-item ${order.status === 'pending' ? 'new-order' : ''}" data-order-id="${order.id}" onclick="selectOrder('${order.id}')">
            <div class="order-info">
                <div class="order-type">${order.type} ${order.number}</div>
                <div class="order-details">
                    <span class="menu-count">메뉴 ${order.menuCount}개</span>
                    <span class="order-time">${shortTime} ${statusLabel}</span>
                </div>
            </div>
            <div class="order-timer">
                <div class="timer-circle">
                    <svg width="48" height="48">
                        <circle class="timer-background" cx="24" cy="24" r="20" fill="none" stroke-width="3"/>
                        <circle class="timer-progress" cx="24" cy="24" r="20" fill="none" stroke-width="3" 
                                stroke-dasharray="125.6" stroke-dashoffset="125.6"/>
                    </svg>
                    <span class="timer-text">${order.timer || 0}분</span>
                </div>
            </div>
        </div>
    `;
    
    // 기존 "신규건이 없습니다" 텍스트 제거
    const noOrderText = targetSection.querySelector('.order-status-text');
    if (noOrderText) {
        noOrderText.remove();
    }
    
    // 주문 아이템 추가
    targetSection.insertAdjacentHTML('beforeend', orderItemHTML);
}

// 사이드바 카운터 업데이트
function updateSidebarCounters() {
    const newOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'ready');
    
    // 신규 카운터
    const newHeader = document.querySelector('.sidebar-section:nth-child(1) .section-header span:first-of-type');
    if (newHeader) {
        newHeader.textContent = `신규 ${newOrders.length}건`;
    }
    
    // 진행 카운터 (준비중 + 준비완료)
    const preparingHeader = document.querySelector('.sidebar-section:nth-child(2) .section-header span:first-of-type');
    if (preparingHeader) {
        preparingHeader.textContent = `진행 ${preparingOrders.length}건`;
    }
}

// ============= 주문 접수/거부 및 준비시간 조절 기능 =============

// 준비시간 표시 업데이트
function updatePreparationTimeDisplay() {
    const display = document.getElementById('preparationTimeDisplay');
    if (display) {
        display.textContent = `${currentPreparationTime}분`;
    }
    
    // 버튼 활성화/비활성화
    const minusBtn = document.querySelector('.time-minus');
    const plusBtn = document.querySelector('.time-plus');
    
    if (minusBtn) {
        minusBtn.disabled = currentPreparationTime <= MIN_PREPARATION_TIME;
    }
    
    if (plusBtn) {
        plusBtn.disabled = currentPreparationTime >= MAX_PREPARATION_TIME;
    }
}

// 준비시간 감소
function decreasePreparationTime() {
    if (currentPreparationTime > MIN_PREPARATION_TIME) {
        currentPreparationTime -= TIME_STEP;
        updatePreparationTimeDisplay();
        console.log(`준비시간 감소: ${currentPreparationTime}분`);
    }
}

// 준비시간 증가
function increasePreparationTime() {
    if (currentPreparationTime < MAX_PREPARATION_TIME) {
        currentPreparationTime += TIME_STEP;
        updatePreparationTimeDisplay();
        console.log(`준비시간 증가: ${currentPreparationTime}분`);
    }
}

// 주문 접수
function acceptOrder() {
    if (!selectedOrderId) {
        showNotification('선택된 주문이 없습니다.', 'error');
        return;
    }
    
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
        showNotification('주문을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 주문 상태 업데이트
    order.status = 'preparing';
    order.preparationTime = currentPreparationTime;
    order.acceptedAt = new Date().toISOString();
    order.timer = 0;
    order.timerSeconds = 0;
    
    // 접수 영역 숨김
    const acceptSection = document.getElementById('orderAcceptSection');
    if (acceptSection) {
        acceptSection.style.display = 'none';
    }
    
    // 알림 메시지 표시
    showNotification(`주문이 접수되었습니다. 예상 준비시간: ${currentPreparationTime}분`, 'success');
    
    // 주문 접수 확인 팝업 표시
    showOrderAcceptedPopup(order);
    
    // 사이드바에서 신규에서 진행으로 이동
    removeFromSidebar(order.id);
    updatePreparingSection();
    
    // 주문 디스플레이 업데이트
    updateOrderDisplay(order);
    
    // 영수증 자동 출력
    if (window.printHelper) {
        window.printHelper.autoPrintReceipt(order).then(result => {
            if (result.success) {
                console.log('주문 접수 영수증 자동 출력 완료:', order.id);
                order.receiptPrinted = true;
            }
        }).catch(error => {
            console.error('영수증 출력 오류:', error);
        });
    }
    
    console.log(`주문 ${order.id} 접수 완료 - 준비시간: ${currentPreparationTime}분`);
}

// 주문 거부
function rejectOrder() {
    if (!selectedOrderId) {
        showNotification('선택된 주문이 없습니다.', 'error');
        return;
    }
    
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
        showNotification('주문을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 거부 확인
    if (!confirm(`주문을 거부하시겠습니까?\n\n주문번호: ${order.type} ${order.number}\n고객명: ${order.customerName}\n금액: ${order.totalAmount.toLocaleString()}원`)) {
        return;
    }
    
    // 주문 상태 업데이트
    order.status = 'rejected';
    order.rejectedAt = new Date().toISOString();
    
    // 주문 내역에 저장
    saveOrderToHistory(order);
    
    // 접수 영역 숨김
    const acceptSection = document.getElementById('orderAcceptSection');
    if (acceptSection) {
        acceptSection.style.display = 'none';
    }
    
    // 알림 메시지 표시
    showNotification(`주문이 거부되었습니다. (${order.type} ${order.number})`, 'warning');
    
    // 주문 목록에서 제거
    const orderIndex = orders.findIndex(o => o.id === selectedOrderId);
    if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
    }
    
    // 사이드바에서 제거
    removeFromSidebar(order.id);
    
    // 사이드바 카운터 업데이트
    updateSidebarCounters();
    
    // 다음 주문 선택
    if (orders.length > 0) {
        selectOrder(orders[0].id);
    } else {
        selectedOrderId = null;
    }
    
    console.log(`주문 ${order.id} 거부 완료`);
}

// 사이드바에서 주문을 진행중으로 이동
function moveToPreparing(order) {
    // 기존 주문 아이템 제거
    removeFromSidebar(order.id);
    
    // 진행중 섹션에 추가
    addOrderToSidebar(order);
}

// 진행중 섹션 업데이트 (정렬 포함)
function updatePreparingSection() {
    const preparingSection = document.querySelector('.sidebar-section:nth-child(2)');
    if (!preparingSection) return;
    
    // 진행중 주문 필터링 및 정렬
    const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'ready');
    
    // 정렬: 준비중(최신순) -> 준비완료(최신순)
    preparingOrders.sort((a, b) => {
        // 상태별로 먼저 그룹화
        if (a.status === 'preparing' && b.status === 'ready') return -1;
        if (a.status === 'ready' && b.status === 'preparing') return 1;
        
        // 같은 상태 내에서는 최신순 정렬
        const timeA = a.status === 'ready' ? 
            new Date(a.readyCompletedAt || a.createdAt).getTime() : 
            new Date(a.createdAt).getTime();
        const timeB = b.status === 'ready' ? 
            new Date(b.readyCompletedAt || b.createdAt).getTime() : 
            new Date(b.createdAt).getTime();
        
        return timeB - timeA; // 최신순 (내림차순)
    });
    
    // 기존 주문 아이템 모두 제거
    const existingOrders = preparingSection.querySelectorAll('.order-item');
    existingOrders.forEach(item => item.remove());
    
    // 빈 상태 텍스트 제거
    const noOrderText = preparingSection.querySelector('.order-status-text');
    if (noOrderText) {
        noOrderText.remove();
    }
    
    // 정렬된 주문 아이템 다시 추가
    if (preparingOrders.length === 0) {
        preparingSection.insertAdjacentHTML('beforeend', '<div class="order-status-text">진행건이 없습니다</div>');
    } else {
        preparingOrders.forEach(order => {
            const statusLabel = order.status === 'ready' ? '준비완료' : '접수';
            const minutes = order.timerSeconds ? Math.floor(order.timerSeconds / 60) : 0;
            
            // 주문 시간에서 시간만 추출 (예: "2025년 10월 24일 14시 30분" -> "14:30")
            const timeMatch = order.orderTime.match(/(\d+)시 (\d+)분/);
            const shortTime = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : order.orderTime;
            
            const orderItemHTML = `
                <div class="order-item ${order.id === selectedOrderId ? 'active' : ''}" data-order-id="${order.id}" onclick="selectOrder('${order.id}')">
                    <div class="order-info">
                        <div class="order-type">${order.type} ${order.number}</div>
                        <div class="order-details">
                            <span class="menu-count">메뉴 ${order.menuCount}개</span>
                            <span class="order-time">${order.status === 'ready' ? '준비완료' : shortTime + ' ' + statusLabel}</span>
                        </div>
                    </div>
                    <div class="order-timer">
                        <div class="timer-circle">
                            <svg width="48" height="48">
                                <circle class="timer-background" cx="24" cy="24" r="20" fill="none" stroke-width="3"/>
                                <circle class="timer-progress" cx="24" cy="24" r="20" fill="none" stroke-width="3" 
                                        stroke-dasharray="125.6" stroke-dashoffset="125.6"/>
                            </svg>
                            <span class="timer-text">${minutes}분</span>
                        </div>
                    </div>
                </div>
            `;
            
            preparingSection.insertAdjacentHTML('beforeend', orderItemHTML);
        });
    }
    
    // 카운터 업데이트
    updateSidebarCounters();
}

// 사이드바에서 주문 제거
function removeFromSidebar(orderId) {
    const orderItem = document.querySelector(`[onclick="selectOrder('${orderId}')"]`);
    if (orderItem) {
        orderItem.remove();
    }
}

// 페이지 네비게이션
function navigateTo(page) {
    switch(page) {
        case 'orders':
            // 현재 페이지 (주문관리)
            break;
        case 'history':
            // 주문 내역 페이지로 이동
            window.location.href = 'order-history.html';
            break;
        default:
            console.log('Unknown page:', page);
    }
}

// 주문 내역 저장 (완료/취소/거부 시)
function saveOrderToHistory(order) {
    // localStorage에서 기존 내역 가져오기
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    
    // 이미 있는 주문이면 업데이트, 없으면 추가
    const existingIndex = history.findIndex(o => o.id === order.id);
    if (existingIndex !== -1) {
        history[existingIndex] = order;
    } else {
        history.push(order);
    }
    
    // localStorage에 저장
    localStorage.setItem('orderHistory', JSON.stringify(history));
    
    console.log('주문 내역 저장:', order.id);
}

// ============= 설정 관련 함수 =============

// 설정 로드
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('yumyum_settings');
        if (savedSettings) {
            appSettings = JSON.parse(savedSettings);
            // notificationSound가 없으면 기본값 설정
            if (!appSettings.general.notificationSound) {
                appSettings.general.notificationSound = 'voice-order-received';
            }
            console.log('설정 로드 완료:', appSettings);
        } else {
            // 기본 설정
            appSettings = {
                general: {
                    storeAlarmEnabled: true,
                    volumeLevel: 3,
                    notificationSound: 'voice-order-received',
                    autoAcceptEnabled: false,
                    autoAcceptTime: 15
                }
            };
        }
    } catch (error) {
        console.error('설정 로드 실패:', error);
        appSettings = {
            general: {
                storeAlarmEnabled: true,
                volumeLevel: 3,
                notificationSound: 'voice-order-received',
                autoAcceptEnabled: false,
                autoAcceptTime: 15
            }
        };
    }
}

// 자동 접수
function autoAcceptOrder(order) {
    if (!appSettings || !appSettings.general.autoAcceptEnabled) return;
    
    // 자동 조리시간 설정
    const autoTime = appSettings.general.autoAcceptTime || 15;
    
    // 주문 상태 업데이트
    order.status = 'preparing';
    order.preparationTime = autoTime;
    order.acceptedAt = new Date().toISOString();
    order.timer = 0;
    order.timerSeconds = 0;
    
    // 접수 영역 숨김
    const acceptSection = document.getElementById('orderAcceptSection');
    if (acceptSection) {
        acceptSection.style.display = 'none';
    }
    
    // 알림 재생
    playOrderNotification();
    
    // 알림 메시지 표시
    showNotification(`주문이 자동 접수되었습니다. 예상 준비시간: ${autoTime}분`, 'success');
    
    // 사이드바에서 신규에서 진행으로 이동
    removeFromSidebar(order.id);
    updatePreparingSection();
    
    // 주문 디스플레이 업데이트
    updateOrderDisplay(order);
    
    // 영수증 자동 출력
    if (window.printHelper) {
        window.printHelper.autoPrintReceipt(order).then(result => {
            if (result.success) {
                console.log('자동 접수 영수증 출력 완료:', order.id);
                order.receiptPrinted = true;
            }
        }).catch(error => {
            console.error('영수증 출력 오류:', error);
        });
    }
    
    console.log(`주문 ${order.id} 자동 접수 완료 - 준비시간: ${autoTime}분`);
}

// 주문 알림음 재생
function playOrderNotification() {
    if (!appSettings || !appSettings.general.storeAlarmEnabled) {
        console.log('알림이 비활성화되어 있습니다.');
        return;
    }
    
    const volumeLevel = appSettings.general.volumeLevel || 3;
    const volumeValue = (volumeLevel / 6) * 100;
    
    try {
        // Web Audio API로 알림음 재생
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        // 주문 알림음 (더 긴 소리)
        oscillator.frequency.value = 880; // A5 음
        gainNode.gain.value = volumeValue / 100 * 0.5;
        
        oscillator.start();
        
        // 2번 울리기
        setTimeout(() => {
            oscillator.frequency.value = 1046; // C6 음
        }, 200);
        
        setTimeout(() => oscillator.stop(), 400);
        
        console.log(`알림음 재생 (볼륨: ${volumeLevel}단계)`);
    } catch (error) {
        console.error('알림음 재생 실패:', error);
    }
}

// ============= 사이드 메뉴 관련 함수 =============

// 사이드 메뉴 열기
function openSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    if (sideMenu) {
        sideMenu.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// 사이드 메뉴 닫기
function closeSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    if (sideMenu) {
        sideMenu.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 공지 · 한마디
function openNotice() {
    showNotification('공지 · 한마디 기능은 준비 중입니다', 'info');
    closeSideMenu();
}

// 주문내역
function openOrderHistory() {
    window.location.href = 'order-history.html';
    closeSideMenu();
}

// 운영정보 관리
function openOperationInfo() {
    showNotification('운영정보 관리 기능은 준비 중입니다', 'info');
    closeSideMenu();
}

// 메뉴 품절 관리
function openMenuManagement() {
    showNotification('메뉴 품절 관리 기능은 준비 중입니다', 'info');
    closeSideMenu();
}

// 리뷰 관리
function openReviewManagement() {
    showNotification('리뷰 관리 기능은 준비 중입니다', 'info');
    closeSideMenu();
}

// 주문접수 설정
function openOrderSettings() {
    showNotification('주문접수 설정 기능은 준비 중입니다', 'info');
    closeSideMenu();
}

// 운영 설정
function openOperationSettings() {
    window.location.href = 'settings.html';
    closeSideMenu();
}

// 프린터 설정
function openPrinterSettings() {
    window.location.href = 'settings.html?tab=printer';
    closeSideMenu();
}

// 알림 설정
function openNotificationSettings() {
    window.location.href = 'settings.html?tab=notification';
    closeSideMenu();
}

// FAQ
function openFAQ() {
    showNotification('자주 묻는 질문 페이지로 이동합니다', 'info');
    closeSideMenu();
}

// 사이드 메뉴 오버레이 클릭 시 닫기
document.addEventListener('click', (e) => {
    const sideMenu = document.getElementById('sideMenu');
    if (e.target === sideMenu) {
        closeSideMenu();
    }
});

// ============= 주문 알림 팝업 관련 함수 =============

let currentAlertOrderId = null;

// 주문 알림 팝업 표시
function showOrderAlert(order) {
    console.log('showOrderAlert 호출됨:', order);
    const modal = document.getElementById('orderAlertModal');
    const alertType = document.getElementById('alertOrderType');
    const alertMenu = document.getElementById('alertOrderMenu');
    const alertAmount = document.getElementById('alertOrderAmount');
    
    console.log('모달 요소:', modal);
    console.log('alertType:', alertType);
    console.log('alertMenu:', alertMenu);
    console.log('alertAmount:', alertAmount);
    
    if (!modal || !alertType || !alertMenu || !alertAmount) {
        console.error('팝업 요소를 찾을 수 없습니다!');
        return;
    }
    
    // 주문 정보 설정
    currentAlertOrderId = order.id;
    alertType.textContent = `${order.type} ${order.number}`;
    
    // 메뉴 정보 생성
    const menuText = order.menus.map(menu => 
        `${menu.name} x ${menu.quantity}`
    ).join(', ');
    alertMenu.textContent = menuText;
    
    // 총 금액
    alertAmount.textContent = `${order.totalAmount.toLocaleString()}원`;
    
    // 모달 표시
    modal.classList.add('show');
    modal.style.display = 'flex'; // 명시적으로 display 설정
    console.log('모달 표시됨, classList:', modal.classList);
    console.log('모달 display:', modal.style.display);
    
    // 오른쪽 하단 알림도 표시
    showNotification(`새로운 주문이 들어왔습니다! (${order.type} ${order.number})`, 'warning');
    
    // 시스템 알림도 표시
    showSystemNotification(order);
    
    // 알림음 재생
    playOrderAlertSound();
}

// 시스템 알림 표시 (PC 알림)
function showSystemNotification(order) {
    // Electron 환경인지 확인
    if (window.electron && window.electron.showNotification) {
        // Electron 네이티브 알림 사용
        const menuText = order.menus.map(menu => 
            `${menu.name} x ${menu.quantity}`
        ).join(', ');
        
        window.electron.showNotification({
            title: '새로운 주문이 들어왔습니다!',
            body: `${order.type} ${order.number}\n${menuText}\n${order.totalAmount.toLocaleString()}원`,
            orderId: order.id,
            silent: false
        }).then(result => {
            if (result.success) {
                console.log('PC 시스템 알림 표시됨');
            } else {
                console.error('PC 시스템 알림 표시 실패:', result.error);
            }
        }).catch(error => {
            console.error('PC 시스템 알림 오류:', error);
        });
    } else {
        // 브라우저 환경 - 웹 Notification API 사용 (폴백)
        if (!('Notification' in window)) {
            console.log('이 브라우저는 데스크톱 알림을 지원하지 않습니다.');
            return;
        }
        
        // 권한 요청
        if (Notification.permission === 'granted') {
            createBrowserNotification(order);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    createBrowserNotification(order);
                }
            });
        }
    }
}

// 브라우저 알림 생성 (폴백용)
function createBrowserNotification(order) {
    const menuText = order.menus.map(menu => 
        `${menu.name} x ${menu.quantity}`
    ).join(', ');
    
    const notification = new Notification('새로운 주문이 들어왔습니다!', {
        body: `${order.type} ${order.number}\n${menuText}\n${order.totalAmount.toLocaleString()}원`,
        icon: '../assets/icon.png',
        badge: '../assets/icon.png',
        tag: order.id,
        requireInteraction: true,
        silent: false
    });
    
    // 알림 클릭 시 해당 주문으로 이동
    notification.onclick = function() {
        window.focus();
        selectOrder(order.id);
        notification.close();
    };
    
    // 10초 후 자동 닫기
    setTimeout(() => {
        notification.close();
    }, 10000);
}

// 알림음 재생
function playOrderAlertSound() {
    try {
        console.log('=== 알림음 재생 시도 ===');
        console.log('appSettings:', appSettings);
        
        // 설정에서 선택한 알림음 재생
        if (appSettings && appSettings.general && appSettings.general.notificationSound) {
            const soundId = appSettings.general.notificationSound;
            const volumeLevel = appSettings.general.volumeLevel || 3;
            
            console.log('soundId:', soundId, 'volumeLevel:', volumeLevel);
            console.log('playNotificationSound 함수 존재:', typeof playNotificationSound === 'function');
            
            // playNotificationSound 함수 호출
            if (typeof playNotificationSound === 'function') {
                console.log('알림음 재생 함수 호출 중...');
                playNotificationSound(soundId, volumeLevel);
            } else if (typeof window.playNotificationSound === 'function') {
                console.log('window.playNotificationSound 호출 중...');
                window.playNotificationSound(soundId, volumeLevel);
            } else {
                console.error('playNotificationSound 함수를 찾을 수 없습니다!');
            }
        } else {
            console.error('appSettings 또는 notificationSound가 없습니다!');
        }
    } catch (error) {
        console.error('알림음 재생 실패:', error);
    }
}

// 확인 버튼 클릭 (주문으로 이동)
function confirmOrderAlert() {
    closeOrderAlert();
    if (currentAlertOrderId) {
        selectOrder(currentAlertOrderId);
        currentAlertOrderId = null;
    }
}

// 팝업 닫기
function closeOrderAlert() {
    const modal = document.getElementById('orderAlertModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        console.log('모달 닫힘');
    }
    currentAlertOrderId = null;
}

// ESC 키로 팝업 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('orderAlertModal');
        if (modal && modal.classList.contains('show')) {
            closeOrderAlert();
        }
    }
});

// 주문 접수 완료 팝업 표시
function showOrderAcceptedPopup(order) {
    // 간단한 확인 알림 (3초 후 자동으로 진행중 섹션으로 이동)
    setTimeout(() => {
        // 진행중 섹션으로 스크롤
        const preparingOrders = document.querySelectorAll('.sidebar-section:nth-child(2) .order-item');
        const orderElement = Array.from(preparingOrders).find(el => 
            el.getAttribute('data-order-id') === order.id
        );
        if (orderElement) {
            orderElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 500);
}

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        // 인증 정보 삭제
        localStorage.removeItem('yumyum_auth');
        localStorage.removeItem('yumyum_auto_login');
        
        // 로그인 페이지로 이동
        window.location.href = 'login.html';
    }
}

// ============= 임시운영중단 관련 함수 =============

let tempCloseTimer = null;
let operationStatus = 'online'; // 'online' or 'offline'

// 임시운영중단 모달 열기
function openTempCloseModal() {
    const modal = document.getElementById('tempCloseModal');
    const resumeContainer = document.getElementById('resumeOperationContainer');
    
    if (operationStatus === 'offline') {
        // 현재 운영중단 상태이면 재개 정보 표시
        resumeContainer.style.display = 'block';
    } else {
        // 운영중이면 선택 옵션 표시
        resumeContainer.style.display = 'none';
    }
    
    modal.classList.add('show');
    modal.style.display = 'flex';
}

// 임시운영중단 모달 닫기
function closeTempCloseModal() {
    const modal = document.getElementById('tempCloseModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
}

// 임시운영중단 선택
function selectTempClose(minutes) {
    const statusIndicator = document.querySelector('.status-indicator i');
    const statusText = document.querySelector('.status-indicator span');
    const resumeContainer = document.getElementById('resumeOperationContainer');
    const resumeTimeInfo = document.getElementById('resumeTimeInfo');
    
    // 운영 상태 변경
    operationStatus = 'offline';
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
    statusText.textContent = '운영중단';
    
    // 재개 시간 계산
    const resumeTime = new Date();
    resumeTime.setMinutes(resumeTime.getMinutes() + minutes);
    
    const resumeTimeStr = formatResumeTime(resumeTime, minutes);
    resumeTimeInfo.textContent = resumeTimeStr;
    
    // 로컬 스토리지에 저장
    localStorage.setItem('yumyum_operation_status', JSON.stringify({
        status: 'offline',
        resumeTime: resumeTime.toISOString(),
        closedMinutes: minutes
    }));
    
    // 재개 컨테이너 표시
    resumeContainer.style.display = 'block';
    
    // 타이머 설정
    if (tempCloseTimer) {
        clearTimeout(tempCloseTimer);
    }
    
    tempCloseTimer = setTimeout(() => {
        resumeOperation();
    }, minutes * 60 * 1000);
    
    showNotification(`운영이 ${minutes >= 1440 ? '하루종일' : minutes / 60 + '시간'} 중단되었습니다`, 'info');
}

// 운영 재개
function resumeOperation() {
    const statusIndicator = document.querySelector('.status-indicator i');
    const statusText = document.querySelector('.status-indicator span');
    
    // 운영 상태 변경
    operationStatus = 'online';
    statusIndicator.classList.remove('offline');
    statusIndicator.classList.add('online');
    statusText.textContent = '영업중';
    
    // 타이머 취소
    if (tempCloseTimer) {
        clearTimeout(tempCloseTimer);
        tempCloseTimer = null;
    }
    
    // 로컬 스토리지에서 제거
    localStorage.removeItem('yumyum_operation_status');
    
    // 모달 닫기
    closeTempCloseModal();
    
    showNotification('운영이 재개되었습니다', 'success');
}

// 재개 시간 포맷팅
function formatResumeTime(resumeTime, minutes) {
    if (minutes >= 1440) {
        return '하루종일 운영이 중단됩니다';
    }
    
    const hours = String(resumeTime.getHours()).padStart(2, '0');
    const mins = String(resumeTime.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}에 자동으로 운영이 재개됩니다`;
}

// 페이지 로드 시 운영 상태 복원
function restoreOperationStatus() {
    const savedStatus = localStorage.getItem('yumyum_operation_status');
    if (savedStatus) {
        const status = JSON.parse(savedStatus);
        const resumeTime = new Date(status.resumeTime);
        const now = new Date();
        
        if (resumeTime > now) {
            // 아직 재개 시간이 안됐으면 운영중단 상태 유지
            const statusIndicator = document.querySelector('.status-indicator i');
            const statusText = document.querySelector('.status-indicator span');
            
            operationStatus = 'offline';
            statusIndicator.classList.remove('online');
            statusIndicator.classList.add('offline');
            statusText.textContent = '운영중단';
            
            // 남은 시간 계산하여 타이머 설정
            const remainingMs = resumeTime - now;
            tempCloseTimer = setTimeout(() => {
                resumeOperation();
            }, remainingMs);
            
            console.log('운영중단 상태 복원 완료. 재개 시간:', resumeTime);
        } else {
            // 재개 시간이 지났으면 자동으로 운영 재개
            resumeOperation();
        }
    }
}

// 페이지 로드 시 운영 상태 복원 실행
restoreOperationStatus();

console.log('YumYum 주문 관리 시스템 스크립트 로드 완료');

