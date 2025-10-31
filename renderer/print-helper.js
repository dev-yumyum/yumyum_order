/**
 * 영수증 출력 헬퍼 함수
 */

// 설정에서 프린터 정보 가져오기
function getStoredPrinterSettings() {
    try {
        const settings = localStorage.getItem('yumyum_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            return parsed.printer;
        }
    } catch (error) {
        console.error('프린터 설정 로드 실패:', error);
    }
    return null;
}

// 전화번호 마스킹 처리 (중간 4자리)
function maskPhoneNumber(phone) {
    if (!phone) return '***-****-****';
    
    // 하이픈 제거
    const cleaned = phone.replace(/-/g, '');
    
    if (cleaned.length === 11) {
        // 010-****-5678 형식
        return `${cleaned.substring(0, 3)}-****-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
        // 02-****-5678 형식
        return `${cleaned.substring(0, 2)}-****-${cleaned.substring(6)}`;
    }
    
    return '***-****-****';
}

// 당일 주문 번호 가져오기
function getTodayOrderNumber(order) {
    // localStorage에서 당일 주문 목록 가져오기
    const today = new Date().toDateString();
    const orderHistory = JSON.parse(localStorage.getItem('yumyum_order_history') || '[]');
    
    // 당일 주문만 필터링
    const todayOrders = orderHistory.filter(o => {
        const orderDate = new Date(o.createdAt || o.orderTime);
        return orderDate.toDateString() === today;
    });
    
    // 현재 주문의 순번 찾기 (createdAt 기준으로 정렬)
    todayOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.orderTime);
        const dateB = new Date(b.createdAt || b.orderTime);
        return dateA - dateB;
    });
    
    const orderIndex = todayOrders.findIndex(o => o.id === order.id);
    return orderIndex >= 0 ? orderIndex + 1 : todayOrders.length + 1;
}

// 예상 완료 시간 계산
function calculateExpectedTime(order) {
    const orderTime = new Date(order.createdAt || order.orderTime);
    const preparationMinutes = order.preparationTime || 15;
    
    const expectedTime = new Date(orderTime.getTime() + preparationMinutes * 60000);
    return expectedTime;
}

// 시간 포맷 (초 단위까지)
function formatTimeWithSeconds(date) {
    const d = date instanceof Date ? date : new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// 날짜 포맷
function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 주문 데이터를 영수증 데이터로 변환
function convertOrderToReceiptData(order) {
    // 요청사항 통합
    let requests = '';
    if (order.requests) {
        if (typeof order.requests === 'string') {
            requests = order.requests;
        } else if (typeof order.requests === 'object') {
            const parts = [];
            if (order.requests.store) parts.push(order.requests.store);
            if (order.requests.delivery) parts.push(order.requests.delivery);
            if (order.requests.extras) parts.push(order.requests.extras);
            requests = parts.join('\n');
        }
    }

    const orderTime = new Date(order.createdAt || order.orderTime);
    const expectedTime = calculateExpectedTime(order);
    const orderNumber = getTodayOrderNumber(order);

    return {
        // 헤더
        storeName: '얌얌픽업',
        
        // 주문 정보
        orderNumber: orderNumber,
        orderDate: formatDate(orderTime),
        orderTime: formatTimeWithSeconds(orderTime),
        
        // 고객 정보
        customerName: order.customerName || '고객',
        customerPhone: maskPhoneNumber(order.customerPhone),
        
        // 주문 내역
        orderType: order.type || '포장',
        items: order.items || [],
        totalAmount: order.totalAmount || 0,
        requests: requests || '없음',
        
        // 예상 완료 시간
        expectedCompletionTime: formatTimeWithSeconds(expectedTime),
        
        // 푸터
        thankYouMessage: `${order.customerName || '고객'}님 얌얌픽업을 주문해주셔서 감사합니다`
    };
}

// 영수증 자동 출력
async function autoPrintReceipt(order) {
    try {
        // 프린터 설정 확인
        const printerSettings = getStoredPrinterSettings();
        
        if (!printerSettings || !printerSettings.autoPrintEnabled) {
            console.log('자동 인쇄가 비활성화되어 있습니다.');
            return { success: false, reason: 'auto_print_disabled' };
        }

        if (!printerSettings.selectedPrinter) {
            console.warn('선택된 프린터가 없습니다.');
            return { success: false, reason: 'no_printer_selected' };
        }

        // Electron API 확인
        if (!window.electron || !window.electron.printReceipt) {
            console.error('프린터 API를 사용할 수 없습니다.');
            return { success: false, reason: 'api_not_available' };
        }

        // 주문 데이터를 영수증 데이터로 변환
        const receiptData = convertOrderToReceiptData(order);

        // 영수증 출력
        console.log('영수증 출력 중...', printerSettings.selectedPrinter);
        const result = await window.electron.printReceipt(
            printerSettings.selectedPrinter,
            receiptData
        );

        if (result.success) {
            console.log('영수증 출력 성공');
            return { success: true };
        } else {
            console.error('영수증 출력 실패:', result.error);
            return { success: false, reason: 'print_failed', error: result.error };
        }

    } catch (error) {
        console.error('영수증 출력 중 오류:', error);
        return { success: false, reason: 'exception', error: error.message };
    }
}

// 수동 영수증 출력 (특정 주문)
async function printOrderReceipt(order) {
    try {
        const printerSettings = getStoredPrinterSettings();
        
        if (!printerSettings || !printerSettings.selectedPrinter) {
            alert('프린터가 설정되지 않았습니다. 설정 화면에서 프린터를 선택해주세요.');
            return { success: false };
        }

        if (!window.electron || !window.electron.printReceipt) {
            alert('프린터 기능을 사용할 수 없습니다.');
            return { success: false };
        }

        const receiptData = convertOrderToReceiptData(order);
        const result = await window.electron.printReceipt(
            printerSettings.selectedPrinter,
            receiptData
        );

        if (result.success) {
            alert('영수증이 출력되었습니다.');
            return { success: true };
        } else {
            alert('영수증 출력에 실패했습니다: ' + result.error);
            return { success: false };
        }

    } catch (error) {
        console.error('영수증 출력 중 오류:', error);
        alert('영수증 출력 중 오류가 발생했습니다.');
        return { success: false };
    }
}

// 영수증 HTML 생성
function generateReceiptHTML(receiptData) {
    const itemsHTML = receiptData.items.map(item => `
        <div class="receipt-item">
            <span class="item-name">${item.name}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">${item.price.toLocaleString()}원</span>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
            width: 80mm;
            padding: 10mm;
            font-size: 12pt;
            line-height: 1.4;
        }
        .receipt-container {
            width: 100%;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
        }
        .store-name {
            font-size: 20pt;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .section {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #999;
        }
        .section-title {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 11pt;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11pt;
        }
        .info-label {
            font-weight: 500;
        }
        .info-value {
            text-align: right;
        }
        .order-number {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
        }
        .receipt-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11pt;
        }
        .item-name {
            flex: 1;
        }
        .item-qty {
            width: 50px;
            text-align: center;
        }
        .item-price {
            width: 80px;
            text-align: right;
        }
        .total-section {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px solid #000;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14pt;
            font-weight: bold;
            margin-top: 5px;
        }
        .requests {
            white-space: pre-wrap;
            word-break: break-word;
            margin-top: 5px;
            padding: 8px;
            background: #f5f5f5;
            border-radius: 4px;
            font-size: 10pt;
        }
        .expected-time {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin: 15px 0;
            padding: 10px;
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #000;
            font-size: 11pt;
        }
        .thank-you {
            font-weight: bold;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <!-- 헤더 -->
        <div class="header">
            <div class="store-name">${receiptData.storeName}</div>
        </div>

        <!-- 주문번호 -->
        <div class="order-number">주문번호: ${receiptData.orderNumber}</div>

        <!-- 주문 일시 -->
        <div class="section">
            <div class="info-row">
                <span class="info-label">주문일자:</span>
                <span class="info-value">${receiptData.orderDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">주문시간:</span>
                <span class="info-value">${receiptData.orderTime}</span>
            </div>
        </div>

        <!-- 고객 정보 -->
        <div class="section">
            <div class="section-title">고객 정보</div>
            <div class="info-row">
                <span class="info-label">고객명:</span>
                <span class="info-value">${receiptData.customerName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">연락처:</span>
                <span class="info-value">${receiptData.customerPhone}</span>
            </div>
            <div class="info-row">
                <span class="info-label">주문유형:</span>
                <span class="info-value">${receiptData.orderType}</span>
            </div>
        </div>

        <!-- 주문 메뉴 -->
        <div class="section">
            <div class="section-title">주문 메뉴</div>
            ${itemsHTML}
        </div>

        <!-- 요청사항 -->
        ${receiptData.requests !== '없음' ? `
        <div class="section">
            <div class="section-title">요청사항</div>
            <div class="requests">${receiptData.requests}</div>
        </div>
        ` : ''}

        <!-- 예상 완료 시간 -->
        <div class="expected-time">
            예상 완료시간: ${receiptData.expectedCompletionTime}
        </div>

        <!-- 합계 -->
        <div class="total-section">
            <div class="total-row">
                <span>합계</span>
                <span>${receiptData.totalAmount.toLocaleString()}원</span>
            </div>
        </div>

        <!-- 푸터 -->
        <div class="footer">
            <div class="thank-you">${receiptData.thankYouMessage}</div>
        </div>
    </div>
</body>
</html>
    `;
}

// 영수증 미리보기 (새 창)
function previewReceipt(order) {
    const receiptData = convertOrderToReceiptData(order);
    const html = generateReceiptHTML(receiptData);
    
    const printWindow = window.open('', '_blank', 'width=400,height=800');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // 인쇄 버튼 추가
    setTimeout(() => {
        printWindow.focus();
    }, 500);
}

// 전역으로 함수 노출
if (typeof window !== 'undefined') {
    window.printHelper = {
        autoPrintReceipt,
        printOrderReceipt,
        convertOrderToReceiptData,
        getStoredPrinterSettings,
        generateReceiptHTML,
        previewReceipt,
        maskPhoneNumber,
        getTodayOrderNumber,
        calculateExpectedTime
    };
}


