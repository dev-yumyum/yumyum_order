// 백엔드 API 설정
const BACKEND_CONFIG = {
    // API 서버 URL - Spring Boot 서버 (포트 8080)
    apiUrl: process.env.API_URL || 'http://localhost:8080',
    
    // API 인증 키 (필요시)
    apiKey: process.env.API_KEY || '',
    
    // 연결 타임아웃 (밀리초)
    timeout: 10000,
    
    // 재시도 횟수
    retryCount: 3,
    
    // API 엔드포인트
    endpoints: {
        // 주문 관련
        orders: '/api/orders',                      // 전체 주문 조회
        orderById: '/api/orders',                   // 특정 주문 조회 (GET /api/orders/{id})
        createOrder: '/api/orders',                 // 주문 생성 (POST)
        updateOrder: '/api/orders',                 // 주문 업데이트 (PUT /api/orders/{id})
        deleteOrder: '/api/orders',                 // 주문 삭제 (DELETE /api/orders/{id})
        ordersByStatus: '/api/orders/status',       // 상태별 주문 조회 (GET /api/orders/status/{status})
        
        // 운영 상태 관련
        operationStatus: '/api/operation/status',   // 운영 상태 조회/변경
        
        // 설정 관련
        settings: '/api/settings',                  // 설정 조회/저장
        
        // 통계 관련
        statistics: '/api/statistics',              // 통계 조회
        
        // 서버 상태
        health: '/actuator/health'                  // Spring Boot Actuator
    },
    
    // 자동 연결 여부
    autoConnect: true,
    
    // 로컬 모드 (백엔드 없이 작동)
    localMode: false
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

// ============= 주문 관련 API =============

// 전체 주문 조회
async function fetchOrders() {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 주문 조회 건너뜀');
        return { success: true, data: [] };
    }
    return await apiRequest(BACKEND_CONFIG.endpoints.orders);
}

// 특정 주문 조회
async function fetchOrderById(orderId) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 주문 조회 건너뜀');
        return { success: true, data: null };
    }
    return await apiRequest(`${BACKEND_CONFIG.endpoints.orderById}/${orderId}`);
}

// 상태별 주문 조회
async function fetchOrdersByStatus(status) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 상태별 주문 조회 건너뜀');
        return { success: true, data: [] };
    }
    return await apiRequest(`${BACKEND_CONFIG.endpoints.ordersByStatus}/${status}`);
}

// 주문 생성
async function createOrder(orderData) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 주문 생성 건너뜀', orderData);
        return { success: true, data: { id: Date.now(), ...orderData } };
    }
    return await apiRequest(BACKEND_CONFIG.endpoints.createOrder, 'POST', orderData);
}

// 주문 업데이트
async function updateOrder(orderId, orderData) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 주문 업데이트 건너뜀', orderId, orderData);
        return { success: true, data: orderData };
    }
    return await apiRequest(`${BACKEND_CONFIG.endpoints.updateOrder}/${orderId}`, 'PUT', orderData);
}

// 주문 상태 업데이트
async function updateOrderStatus(orderId, status) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 주문 상태 업데이트 건너뜀', orderId, status);
        return { success: true, data: { status } };
    }
    return await apiRequest(
        `${BACKEND_CONFIG.endpoints.updateOrder}/${orderId}`, 
        'PATCH', 
        { status }
    );
}

// 주문 삭제
async function deleteOrder(orderId) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 주문 삭제 건너뜀', orderId);
        return { success: true };
    }
    return await apiRequest(`${BACKEND_CONFIG.endpoints.deleteOrder}/${orderId}`, 'DELETE');
}

// ============= 운영 상태 관련 API =============

// 운영 상태 조회
async function fetchOperationStatus() {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 운영 상태 조회 건너뜀');
        return { success: true, data: { status: 'online' } };
    }
    return await apiRequest(BACKEND_CONFIG.endpoints.operationStatus);
}

// 운영 상태 변경
async function updateOperationStatus(status, resumeTime = null) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 운영 상태 변경 건너뜀', status, resumeTime);
        return { success: true, data: { status, resumeTime } };
    }
    return await apiRequest(
        BACKEND_CONFIG.endpoints.operationStatus, 
        'POST', 
        { status, resumeTime }
    );
}

// ============= 설정 관련 API =============

// 설정 조회
async function fetchSettings() {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 설정 조회 건너뜀');
        return { success: true, data: {} };
    }
    return await apiRequest(BACKEND_CONFIG.endpoints.settings);
}

// 설정 저장
async function saveSettings(settingsData) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 설정 저장 건너뜀', settingsData);
        return { success: true, data: settingsData };
    }
    return await apiRequest(BACKEND_CONFIG.endpoints.settings, 'POST', settingsData);
}

// ============= 통계 관련 API =============

// 통계 조회
async function fetchStatistics(startDate = null, endDate = null) {
    if (BACKEND_CONFIG.localMode) {
        console.log('로컬 모드: 통계 조회 건너뜀');
        return { success: true, data: {} };
    }
    
    let endpoint = BACKEND_CONFIG.endpoints.statistics;
    if (startDate && endDate) {
        endpoint += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    return await apiRequest(endpoint);
}

// ============= 로컬 모드 전환 =============

// 로컬 모드 활성화
function enableLocalMode() {
    BACKEND_CONFIG.localMode = true;
    console.log('로컬 모드 활성화: 백엔드 없이 작동합니다.');
}

// 로컬 모드 비활성화
function disableLocalMode() {
    BACKEND_CONFIG.localMode = false;
    console.log('로컬 모드 비활성화: 백엔드 연결을 시도합니다.');
}

// 백엔드 API 객체
const BackendAPI = {
    // 설정
    config: BACKEND_CONFIG,
    enableLocalMode,
    disableLocalMode,
    
    // 연결
    testConnection,
    
    // 주문
    fetchOrders,
    fetchOrderById,
    fetchOrdersByStatus,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    
    // 운영 상태
    fetchOperationStatus,
    updateOperationStatus,
    
    // 설정
    fetchSettings,
    saveSettings,
    
    // 통계
    fetchStatistics,
    
    // 직접 API 요청
    apiRequest
};

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackendAPI;
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
    window.BackendAPI = BackendAPI;
}

// 자동 연결 초기화
if (BACKEND_CONFIG.autoConnect && typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        console.log('=== YumYum 백엔드 서버 자동 연결 시도 ===');
        console.log('서버 URL:', BACKEND_CONFIG.apiUrl);
        
        const connected = await testConnection();
        
        if (connected) {
            console.log('✅ 백엔드 서버와 정상적으로 연결되었습니다.');
            console.log('백엔드 모드로 작동합니다.');
        } else {
            console.warn('⚠️ 백엔드 서버 연결에 실패했습니다.');
            console.warn('로컬 모드로 작동합니다. (백엔드 없이 작동)');
            enableLocalMode();
        }
    });
}


