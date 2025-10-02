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
            requests = parts.join(' / ');
        }
    }

    return {
        orderTime: order.createdAt || new Date().toISOString(),
        customerName: order.customerName || '고객',
        customerPhone: order.customerPhone || '',
        storeName: '냠냠픽업 가맹점',
        storeAddress: '서울시 강남구 테헤란로 123',
        orderType: order.type || '포장',
        items: order.items || [],
        totalAmount: order.totalAmount || 0,
        requests: requests || '없음'
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

// 전역으로 함수 노출
if (typeof window !== 'undefined') {
    window.printHelper = {
        autoPrintReceipt,
        printOrderReceipt,
        convertOrderToReceiptData,
        getStoredPrinterSettings
    };
}

