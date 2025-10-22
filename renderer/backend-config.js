// 백엔드 API 설정
const BACKEND_CONFIG = {
    // API 서버 URL
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    
    // API 인증 키 (필요시)
    apiKey: process.env.API_KEY || '',
    
    // 연결 타임아웃 (밀리초)
    timeout: 10000,
    
    // 재시도 횟수
    retryCount: 3,
    
    // API 엔드포인트
    endpoints: {
        orders: '/api/orders',           // 주문 조회
        createOrder: '/api/orders/create',   // 주문 생성
        updateOrder: '/api/orders/update',   // 주문 상태 업데이트
        menu: '/api/menu',                // 메뉴 조회
        health: '/api/health'             // 서버 상태 확인
    },
    
    // 자동 연결 여부
    autoConnect: true
};

// API 요청 헬퍼 함수
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${BACKEND_CONFIG.apiUrl}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (BACKEND_CONFIG.apiKey) {
        headers['Authorization'] = `Bearer ${BACKEND_CONFIG.apiKey}`;
    }
    
    const options = {
        method,
        headers
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    let lastError = null;
    
    // 재시도 로직
    for (let attempt = 0; attempt <= BACKEND_CONFIG.retryCount; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), BACKEND_CONFIG.timeout);
            
            options.signal = controller.signal;
            
            const response = await fetch(url, options);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return { success: true, data: result };
            
        } catch (error) {
            lastError = error;
            console.error(`API 요청 실패 (시도 ${attempt + 1}/${BACKEND_CONFIG.retryCount + 1}):`, error.message);
            
            // 마지막 시도가 아니면 잠시 대기 후 재시도
            if (attempt < BACKEND_CONFIG.retryCount) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }
    
    return { 
        success: false, 
        error: lastError?.message || '알 수 없는 오류가 발생했습니다' 
    };
}

// 서버 연결 테스트
async function testConnection() {
    console.log('백엔드 서버 연결 테스트 중...');
    const result = await apiRequest(BACKEND_CONFIG.endpoints.health);
    
    if (result.success) {
        console.log('백엔드 서버 연결 성공:', result.data);
        return true;
    } else {
        console.error('백엔드 서버 연결 실패:', result.error);
        return false;
    }
}

// 주문 조회
async function fetchOrders() {
    return await apiRequest(BACKEND_CONFIG.endpoints.orders);
}

// 주문 생성
async function createOrder(orderData) {
    return await apiRequest(BACKEND_CONFIG.endpoints.createOrder, 'POST', orderData);
}

// 주문 상태 업데이트
async function updateOrderStatus(orderId, status) {
    return await apiRequest(
        `${BACKEND_CONFIG.endpoints.updateOrder}/${orderId}`, 
        'PATCH', 
        { status }
    );
}

// 메뉴 조회
async function fetchMenu() {
    return await apiRequest(BACKEND_CONFIG.endpoints.menu);
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BACKEND_CONFIG,
        apiRequest,
        testConnection,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        fetchMenu
    };
}

// 자동 연결 초기화
if (BACKEND_CONFIG.autoConnect && typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        console.log('YumYum 주문 관리 시스템 백엔드 자동 연결 시도...');
        const connected = await testConnection();
        if (connected) {
            console.log('백엔드 서버와 정상적으로 연결되었습니다.');
        } else {
            console.warn('백엔드 서버 연결에 실패했습니다. 로컬 모드로 작동합니다.');
        }
    });
}


