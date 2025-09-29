/**
 * YumYum 주문 관리 시스템 - UI 인터랙션
 */

// 전역 변수
let selectedOrderId = null;
let orders = [
    {
        id: 'order-1',
        type: '포장',
        number: 28,
        reservationTime: '17:00',
        menuCount: 1,
        totalAmount: 4000,
        status: 'preparing',
        customerName: '홍길동',
        customerPhone: '010-1234-5678',
        orderTime: '02.29 14:30',
        reservationDate: '02.29 17:00',
        items: [
            { name: '아이스 아메리카노', quantity: 1, price: 4000 }
        ],
        requests: {
            store: '영업 소급만 부어주세요',
            extras: '수저포크 X 김치, 단무지 X'
        },
        timer: 15
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
});

// 애플리케이션 초기화
function initializeApp() {
    console.log('YumYum 주문 관리 시스템 초기화');
    
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
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    
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
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // 모든 탭 패널 숨김
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
    // 선택한 탭 활성화
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeTabPanel = document.getElementById(tabName);
    
    if (activeTabBtn && activeTabPanel) {
        activeTabBtn.classList.add('active');
        activeTabPanel.classList.add('active');
    }
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
        orderTitle.textContent = `${order.type} ${order.number} · 예약 ${order.reservationTime}`;
    }
    
    if (orderSubtitle) {
        orderSubtitle.textContent = `메뉴 ${order.menuCount}개 · 총 ${order.totalAmount.toLocaleString()}원 (결제완료)`;
    }
    
    // 요청사항 업데이트
    updateRequestsTab(order);
    
    // 메뉴정보 업데이트
    updateMenuTab(order);
    
    // 주문정보 업데이트
    updateOrderInfoTab(order);
}

// 요청사항 탭 업데이트
function updateRequestsTab(order) {
    const requestsPanel = document.getElementById('requests');
    if (!requestsPanel) return;
    
    const requestSection = requestsPanel.querySelector('.request-section');
    if (requestSection) {
        requestSection.innerHTML = `
            <div class="request-item">
                <span class="request-label">가게</span>
                <span class="request-text">${order.requests.store}</span>
            </div>
            <div class="request-item">
                <span class="request-label">취급정</span>
                <span class="request-text">${order.requests.extras}</span>
            </div>
        `;
    }
}

// 메뉴정보 탭 업데이트
function updateMenuTab(order) {
    const menuPanel = document.getElementById('menu');
    if (!menuPanel) return;
    
    const menuList = menuPanel.querySelector('.menu-list');
    if (menuList) {
        menuList.innerHTML = order.items.map(item => `
            <div class="menu-item-detail">
                <div class="menu-header">
                    <span class="menu-name">${item.name}</span>
                    <div class="menu-controls">
                        <span class="quantity">${item.quantity}</span>
                        <span class="price">${item.price.toLocaleString()}원</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    const menuTotal = menuPanel.querySelector('.menu-total .total-row');
    if (menuTotal) {
        menuTotal.innerHTML = `
            <span>소계</span>
            <span>${order.totalAmount.toLocaleString()}원</span>
        `;
    }
}

// 주문정보 탭 업데이트
function updateOrderInfoTab(order) {
    const orderPanel = document.getElementById('order');
    if (!orderPanel) return;
    
    const customerInfo = orderPanel.querySelector('.customer-info');
    if (customerInfo) {
        customerInfo.innerHTML = `
            <div class="info-row">
                <span class="info-label">고객명</span>
                <span class="info-value">${order.customerName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">연락처</span>
                <span class="info-value">${order.customerPhone}</span>
            </div>
            <div class="info-row">
                <span class="info-label">주문시간</span>
                <span class="info-value">${order.orderTime}</span>
            </div>
            <div class="info-row">
                <span class="info-label">예약시간</span>
                <span class="info-value">${order.reservationDate}</span>
            </div>
        `;
    }
}

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

// 주문 상태 업데이트
function updateOrderStatus(status) {
    if (!selectedOrderId) return;
    
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;
    
    // 상태에 따른 액션
    switch (status) {
        case 'cancelled':
            order.status = status;
            showNotification('주문이 취소되었습니다.', 'warning');
            break;
        case 'ready':
            // 준비완료 모달 표시
            showReadyModal();
            break;
        case 'completed':
            order.status = status;
            showNotification('주문이 완료되었습니다.', 'success');
            break;
    }
    
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

// 알림 표시
function showNotification(message, type = 'info') {
    // 간단한 알림 시스템 (실제로는 toast 라이브러리 사용)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
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

console.log('YumYum 주문 관리 시스템 스크립트 로드 완료');
