/**
 * YumYum 주문 접수 시스템 - 렌더러 프로세스
 * UI 상호작용 및 IPC 통신 처리
 */

// Electron 환경 감지 및 API 로드
let ipcRenderer = null;
if (typeof require !== 'undefined' && typeof window !== 'undefined' && typeof window.process === 'object') {
    try {
        const electron = require('electron');
        ipcRenderer = electron.ipcRenderer;
    } catch (error) {
        console.log('Electron 환경이 아닙니다. 웹 모드로 실행합니다.');
    }
}

// 전역 변수
let currentOrders = [];
let menuItemCount = 0;
let selectedOrderId = null;

// 기본 메뉴 항목
const defaultMenu = [
    { name: '김치찌개', price: 8000 },
    { name: '된장찌개', price: 7000 },
    { name: '불고기', price: 15000 },
    { name: '비빔밥', price: 9000 },
    { name: '냉면', price: 10000 },
    { name: '공기밥', price: 1000 }
];

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCurrentTime();
    loadOrders();
    
    // 1초마다 시간 업데이트
    setInterval(updateCurrentTime, 1000);
    
    // 10초마다 주문 목록 새로고침
    setInterval(loadOrders, 10000);
});

// 애플리케이션 초기화
function initializeApp() {
    console.log('YumYum 주문 접수 시스템 초기화');
    
    // 기본 메뉴 항목 추가
    addMenuItemToForm('김치찌개', 8000);
    
    // 통계 업데이트
    updateStatistics();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 네비게이션 탭
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    
    // 주문 폼
    const orderForm = document.getElementById('orderForm');
    orderForm.addEventListener('submit', handleOrderSubmit);
    
    // 새 주문 버튼
    const newOrderBtn = document.getElementById('newOrderBtn');
    newOrderBtn.addEventListener('click', resetOrderForm);
    
    // 메뉴 추가 버튼
    const addMenuBtn = document.getElementById('addMenuBtn');
    addMenuBtn.addEventListener('click', () => addMenuItemToForm());
    
    // 폼 초기화 버튼
    const resetFormBtn = document.getElementById('resetFormBtn');
    resetFormBtn.addEventListener('click', resetOrderForm);
    
    // 주문 새로고침 버튼
    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    refreshOrdersBtn.addEventListener('click', loadOrders);
    
    // 상태 필터
    const statusFilter = document.getElementById('statusFilter');
    statusFilter.addEventListener('change', filterOrders);
    
    // 모달 관련
    const modal = document.getElementById('orderDetailModal');
    const modalClose = document.querySelector('.modal-close');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    
    modalClose.addEventListener('click', closeModal);
    updateStatusBtn.addEventListener('click', updateOrderStatus);
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // 메뉴 이벤트 위임
    const menuItems = document.getElementById('menuItems');
    menuItems.addEventListener('input', calculateTotal);
    menuItems.addEventListener('click', handleMenuButtonClick);
    
    // IPC 메시지 리스너
    setupIpcListeners();
}

// IPC 리스너 설정
function setupIpcListeners() {
    // Electron 환경이 아니면 리스너 설정 건너뛰기
    if (!ipcRenderer) {
        console.log('웹 환경: IPC 리스너 설정 건너뛰기');
        return;
    }
    
    // 메뉴에서 온 메시지들
    ipcRenderer.on('menu-new-order', resetOrderForm);
    ipcRenderer.on('menu-take-order', () => switchTab('orders'));
    ipcRenderer.on('menu-view-orders', () => switchTab('order-list'));
    ipcRenderer.on('menu-update-status', () => switchTab('order-list'));
    
    ipcRenderer.on('menu-save-orders', async (event, filePath) => {
        if (filePath) {
            // 주문 데이터 저장 로직
            const fs = require('fs');
            fs.writeFileSync(filePath, JSON.stringify(currentOrders, null, 2));
            showToast('주문 내역이 저장되었습니다.', 'success');
        }
    });
}

// 탭 전환
function switchTab(tabId) {
    // 모든 탭 비활성화
    const tabContents = document.querySelectorAll('.tab-content');
    const navItems = document.querySelectorAll('.nav-item');
    
    tabContents.forEach(tab => tab.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));
    
    // 선택한 탭 활성화
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // 탭별 초기화
    if (tabId === 'order-list') {
        loadOrders();
    } else if (tabId === 'statistics') {
        updateStatistics();
    }
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    document.getElementById('currentTime').textContent = timeString;
}

// 메뉴 아이템을 폼에 추가
function addMenuItemToForm(name = '', price = 0) {
    menuItemCount++;
    const menuItems = document.getElementById('menuItems');
    
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.dataset.id = menuItemCount;
    
    menuItem.innerHTML = `
        <input type="text" placeholder="메뉴명" value="${name}" class="menu-name" required>
        <input type="number" placeholder="가격" value="${price}" class="menu-price" min="0" required>
        <input type="number" placeholder="수량" value="1" class="menu-quantity" min="1" required>
        <button type="button" class="remove-menu" data-id="${menuItemCount}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    menuItems.appendChild(menuItem);
    calculateTotal();
}

// 메뉴 버튼 클릭 처리
function handleMenuButtonClick(e) {
    if (e.target.matches('.remove-menu') || e.target.closest('.remove-menu')) {
        const button = e.target.closest('.remove-menu');
        const menuItem = button.closest('.menu-item');
        menuItem.remove();
        calculateTotal();
    }
}

// 총 금액 계산
function calculateTotal() {
    const menuItems = document.querySelectorAll('.menu-item');
    let total = 0;
    
    menuItems.forEach(item => {
        const price = parseInt(item.querySelector('.menu-price').value) || 0;
        const quantity = parseInt(item.querySelector('.menu-quantity').value) || 0;
        total += price * quantity;
    });
    
    document.getElementById('totalAmount').textContent = total.toLocaleString() + '원';
    return total;
}

// 주문 제출 처리
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    try {
        // 폼 데이터 수집
        const formData = new FormData(e.target);
        const menuItems = collectMenuItems();
        
        if (menuItems.length === 0) {
            showToast('최소 하나의 메뉴 항목을 추가해주세요.', 'error');
            return;
        }
        
        const orderData = {
            customerName: formData.get('customerName'),
            customerPhone: formData.get('customerPhone'),
            customerAddress: formData.get('customerAddress'),
            specialRequests: formData.get('specialRequests'),
            items: menuItems,
            totalAmount: calculateTotal()
        };
        
        // 주문 데이터 전송 (Electron 또는 웹)
        let result;
        if (ipcRenderer) {
            // Electron 환경: 메인 프로세스로 전송
            result = await ipcRenderer.invoke('add-order', orderData);
        } else {
            // 웹 환경: localStorage 또는 백엔드 API 사용
            if (typeof BackendAPI !== 'undefined' && !BackendAPI.config.localMode) {
                result = await BackendAPI.createOrder(orderData);
            } else {
                // 로컬 스토리지에 저장
                const orders = JSON.parse(localStorage.getItem('yumyum_orders') || '[]');
                const newOrder = {
                    id: 'ORD-' + Date.now(),
                    ...orderData,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                orders.push(newOrder);
                localStorage.setItem('yumyum_orders', JSON.stringify(orders));
                result = { success: true, order: newOrder };
            }
        }
        
        if (result.success) {
            showToast(`주문이 성공적으로 접수되었습니다. (주문번호: ${result.order.id})`, 'success');
            resetOrderForm();
            updateStatistics();
            
            // 주문 목록 탭이 활성화되어 있으면 새로고침
            if (document.getElementById('order-list').classList.contains('active')) {
                loadOrders();
            }
        } else {
            showToast('주문 접수에 실패했습니다: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('주문 제출 오류:', error);
        showToast('주문 처리 중 오류가 발생했습니다.', 'error');
    }
}

// 메뉴 아이템 수집
function collectMenuItems() {
    const menuItems = document.querySelectorAll('.menu-item');
    const items = [];
    
    menuItems.forEach(item => {
        const name = item.querySelector('.menu-name').value.trim();
        const price = parseInt(item.querySelector('.menu-price').value) || 0;
        const quantity = parseInt(item.querySelector('.menu-quantity').value) || 1;
        
        if (name && price > 0) {
            items.push({ name, price, quantity });
        }
    });
    
    return items;
}

// 주문 폼 초기화
function resetOrderForm() {
    document.getElementById('orderForm').reset();
    const menuItems = document.getElementById('menuItems');
    menuItems.innerHTML = '';
    menuItemCount = 0;
    
    // 기본 메뉴 항목 추가
    addMenuItemToForm('김치찌개', 8000);
    
    calculateTotal();
    showToast('주문 폼이 초기화되었습니다.', 'success');
}

// 주문 목록 로드
async function loadOrders() {
    try {
        let result;
        
        if (ipcRenderer) {
            // Electron 환경
            result = await ipcRenderer.invoke('get-all-orders');
        } else {
            // 웹 환경
            if (typeof BackendAPI !== 'undefined' && !BackendAPI.config.localMode) {
                result = await BackendAPI.fetchOrders();
                if (result.success) {
                    result.orders = result.data;
                }
            } else {
                // 로컬 스토리지에서 로드
                const orders = JSON.parse(localStorage.getItem('yumyum_orders') || '[]');
                result = { success: true, orders: orders };
            }
        }
        
        if (result.success) {
            currentOrders = result.orders;
            displayOrders(currentOrders);
            updateStatistics();
        } else {
            showToast('주문 목록을 불러오는데 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('주문 목록 로드 오류:', error);
        showToast('주문 목록 로드 중 오류가 발생했습니다.', 'error');
    }
}

// 주문 목록 표시
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>주문이 없습니다</h3>
                <p>새로운 주문을 기다리고 있습니다.</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item" onclick="showOrderDetail('${order.id}')">
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-info">
                <div class="info-item">
                    <span class="info-label">고객명</span>
                    <span class="info-value">${order.customerName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">전화번호</span>
                    <span class="info-value">${order.customerPhone || '-'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">총 금액</span>
                    <span class="info-value">${order.totalAmount.toLocaleString()}원</span>
                </div>
                <div class="info-item">
                    <span class="info-label">주문 시간</span>
                    <span class="info-value">${new Date(order.createdAt).toLocaleString('ko-KR')}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 주문 필터링
function filterOrders() {
    const filterValue = document.getElementById('statusFilter').value;
    const filteredOrders = filterValue ? 
        currentOrders.filter(order => order.status === filterValue) : 
        currentOrders;
    
    displayOrders(filteredOrders);
}

// 주문 상세 정보 표시
async function showOrderDetail(orderId) {
    try {
        selectedOrderId = orderId;
        let result;
        
        if (ipcRenderer) {
            result = await ipcRenderer.invoke('get-order', orderId);
        } else {
            // 웹 환경
            if (typeof BackendAPI !== 'undefined' && !BackendAPI.config.localMode) {
                result = await BackendAPI.fetchOrderById(orderId);
                if (result.success) {
                    result.order = result.data;
                }
            } else {
                // 로컬 스토리지에서 찾기
                const orders = JSON.parse(localStorage.getItem('yumyum_orders') || '[]');
                const order = orders.find(o => o.id === orderId);
                result = { success: !!order, order: order };
            }
        }
        
        if (result.success && result.order) {
            const order = result.order;
            const modal = document.getElementById('orderDetailModal');
            const content = document.getElementById('orderDetailContent');
            
            content.innerHTML = `
                <div class="order-detail">
                    <div class="detail-section">
                        <h4>주문 정보</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>주문번호:</strong> ${order.id}
                            </div>
                            <div class="detail-item">
                                <strong>고객명:</strong> ${order.customerName}
                            </div>
                            <div class="detail-item">
                                <strong>전화번호:</strong> ${order.customerPhone || '-'}
                            </div>
                            <div class="detail-item">
                                <strong>배달주소:</strong> ${order.customerAddress || '-'}
                            </div>
                            <div class="detail-item">
                                <strong>주문시간:</strong> ${new Date(order.createdAt).toLocaleString('ko-KR')}
                            </div>
                            <div class="detail-item">
                                <strong>현재상태:</strong> <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>주문 메뉴</h4>
                        <div class="menu-list">
                            ${order.items.map(item => `
                                <div class="menu-item-detail">
                                    <span class="menu-name">${item.name}</span>
                                    <span class="menu-info">${item.quantity}개 × ${item.price.toLocaleString()}원</span>
                                    <span class="menu-total">${(item.quantity * item.price).toLocaleString()}원</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="total-section">
                            <strong>총 금액: ${order.totalAmount.toLocaleString()}원</strong>
                        </div>
                    </div>
                    
                    ${order.specialRequests ? `
                        <div class="detail-section">
                            <h4>특별 요청사항</h4>
                            <p>${order.specialRequests}</p>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // 상태 선택기 설정
            const statusSelect = document.getElementById('orderStatusUpdate');
            statusSelect.value = order.status;
            
            modal.classList.add('show');
        }
    } catch (error) {
        console.error('주문 상세 정보 로드 오류:', error);
        showToast('주문 상세 정보를 불러오는데 실패했습니다.', 'error');
    }
}

// 주문 상태 업데이트
async function updateOrderStatus() {
    if (!selectedOrderId) return;
    
    try {
        const newStatus = document.getElementById('orderStatusUpdate').value;
        let result;
        
        if (ipcRenderer) {
            result = await ipcRenderer.invoke('update-order-status', selectedOrderId, newStatus);
        } else {
            // 웹 환경
            if (typeof BackendAPI !== 'undefined' && !BackendAPI.config.localMode) {
                result = await BackendAPI.updateOrderStatus(selectedOrderId, newStatus);
            } else {
                // 로컬 스토리지에서 업데이트
                const orders = JSON.parse(localStorage.getItem('yumyum_orders') || '[]');
                const orderIndex = orders.findIndex(o => o.id === selectedOrderId);
                if (orderIndex !== -1) {
                    orders[orderIndex].status = newStatus;
                    localStorage.setItem('yumyum_orders', JSON.stringify(orders));
                    result = { success: true };
                } else {
                    result = { success: false, error: '주문을 찾을 수 없습니다.' };
                }
            }
        }
        
        if (result.success) {
            showToast('주문 상태가 업데이트되었습니다.', 'success');
            closeModal();
            loadOrders();
            updateStatistics();
        } else {
            showToast('상태 업데이트에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('상태 업데이트 오류:', error);
        showToast('상태 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('orderDetailModal');
    modal.classList.remove('show');
    selectedOrderId = null;
}

// 통계 업데이트
function updateStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = currentOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    });
    
    const totalOrdersToday = todayOrders.length;
    const totalRevenueToday = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // 평균 처리 시간 계산 (완료된 주문만)
    const completedOrders = todayOrders.filter(order => 
        order.status === 'delivered' && order.updatedAt
    );
    
    let averageTime = 0;
    if (completedOrders.length > 0) {
        const totalTime = completedOrders.reduce((sum, order) => {
            const start = new Date(order.createdAt).getTime();
            const end = new Date(order.updatedAt).getTime();
            return sum + (end - start);
        }, 0);
        averageTime = Math.round(totalTime / completedOrders.length / (1000 * 60)); // 분 단위
    }
    
    // UI 업데이트
    document.getElementById('totalOrdersToday').textContent = totalOrdersToday;
    document.getElementById('totalRevenueToday').textContent = totalRevenueToday.toLocaleString() + '원';
    document.getElementById('averageTime').textContent = averageTime + '분';
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        pending: '접수 대기',
        confirmed: '주문 확인',
        preparing: '조리 중',
        ready: '조리 완료',
        delivered: '배달 완료',
        cancelled: '주문 취소'
    };
    return statusMap[status] || status;
}

// 토스트 알림 표시
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    
    // 아이콘 설정
    if (type === 'success') {
        toast.className = 'toast show';
        toastIcon.className = 'toast-icon fas fa-check-circle';
    } else if (type === 'error') {
        toast.className = 'toast show error';
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
    }
    
    // 3초 후 자동 숨김
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                resetOrderForm();
                switchTab('orders');
                break;
            case 's':
                e.preventDefault();
                // 저장 기능은 메인 프로세스에서 처리
                break;
        }
    }
    
    // 기능키
    switch (e.key) {
        case 'F1':
            e.preventDefault();
            switchTab('orders');
            break;
        case 'F2':
            e.preventDefault();
            switchTab('order-list');
            break;
        case 'F3':
            e.preventDefault();
            switchTab('statistics');
            break;
        case 'Escape':
            closeModal();
            break;
    }
});

console.log('YumYum 렌더러 프로세스 초기화 완료');
