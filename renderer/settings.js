/**
 * YumYum 설정 화면 - JavaScript
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

// 알림음 이름 매핑
const soundNames = {
    'voice-order-received': '주문이 접수되었습니다',
    'voice-yumyum-pickup-order': '얍얍픽업 주문',
    'voice-yumyum-pickup': '얌얌픽업',
    'bell': '종소리',
    'clear-notification': '맑은알림음'
};

// 설정 데이터
let settings = {
    general: {
        storeAlarmEnabled: true,
        volumeLevel: 3, // 1-6 단계
        notificationSound: 'voice-order-received', // 알림음 선택
        autoAcceptEnabled: false,
        autoAcceptTime: 15, // 5-60분
        pickupPrintEnabled: false,
        autoLoginEnabled: false,
        autoPauseEnabled: true,
        originPrintEnabled: false
    },
    printer: {
        enabled: true,
        printerName: '프린터',
        copies: 3, // 0-6
        connectionPort: '선택없음',
        connectionSpeed: 9600,
        autoPrintEnabled: true,
        orderReceiptCount: 1,
        orderSheetCount: 1,
        orderReceiptEnabled: true,
        orderSheetEnabled: true,
        selectedPrinter: '',
        paperWidth: 80,
        printSpeed: 150,
        paperCut: 'auto',
        printerSize: {
            width: 142,
            depth: 185,
            height: 136
        }
    },
    notification: {
        soundEnabled: true,
        volume: 80,
        popupEnabled: true
    },
    backend: {
        autoConnect: true,
        apiUrl: 'http://localhost:3000',
        apiKey: '',
        timeout: 10000,
        retryCount: 3,
        endpoints: {
            orders: '/api/orders',
            createOrder: '/api/orders/create',
            updateOrder: '/api/orders/update',
            menu: '/api/menu'
        }
    },
    alarmDetails: {
        orderAlarm: 'all',
        orderTime: 10,
        pickupAlarm: 'all',
        pickupTime: 10,
        cookingCompleteAlarm: false,
        cookingCompleteCustom: false,
        cookingTime: 10
    }
};

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    loadSettings();
    updateCurrentTime();
    loadPrinters();
    setInterval(updateCurrentTime, 1000);
});

// 설정 초기화
function initializeSettings() {
    // 운영 설정 - 자동 로그인
    document.getElementById('autoLoginEnabled')?.addEventListener('change', (e) => {
        settings.general.autoLoginEnabled = e.target.checked;
        saveSettings();
        showToast('자동 로그인 설정이 저장되었습니다', 'success');
    });

    // 운영 설정 - 자동 영업 임시중지
    document.getElementById('autoPauseEnabled')?.addEventListener('change', (e) => {
        settings.general.autoPauseEnabled = e.target.checked;
        saveSettings();
        showToast('자동 영업 임시중지 설정이 저장되었습니다', 'success');
    });

    // 운영 설정 - 원산지 출력
    document.getElementById('originPrintEnabled')?.addEventListener('change', (e) => {
        settings.general.originPrintEnabled = e.target.checked;
        saveSettings();
        showToast('원산지 출력 설정이 저장되었습니다', 'success');
    });

    // 전반 설정
    document.getElementById('storeAlarmEnabled')?.addEventListener('change', (e) => {
        settings.general.storeAlarmEnabled = e.target.checked;
        toggleVolumeControl(e.target.checked);
        saveSettings();
    });

    document.getElementById('autoAcceptEnabled')?.addEventListener('change', (e) => {
        settings.general.autoAcceptEnabled = e.target.checked;
        toggleAutoAcceptTimeSection(e.target.checked);
        saveSettings();
    });

    document.getElementById('pickupPrintEnabled')?.addEventListener('change', (e) => {
        settings.general.pickupPrintEnabled = e.target.checked;
        saveSettings();
    });

    // 프린터 설정
    document.getElementById('printerEnabled')?.addEventListener('change', (e) => {
        settings.printer.enabled = e.target.checked;
        saveSettings();
        showToast('프린터 사용 설정이 저장되었습니다', 'success');
    });

    document.getElementById('orderReceiptEnabled')?.addEventListener('change', (e) => {
        settings.printer.orderReceiptEnabled = e.target.checked;
        saveSettings();
    });

    document.getElementById('orderSheetEnabled')?.addEventListener('change', (e) => {
        settings.printer.orderSheetEnabled = e.target.checked;
        saveSettings();
    });

    document.getElementById('autoPrintEnabled')?.addEventListener('change', (e) => {
        settings.printer.autoPrintEnabled = e.target.checked;
        saveSettings();
    });

    document.getElementById('printerSelect')?.addEventListener('change', (e) => {
        settings.printer.selectedPrinter = e.target.value;
        saveSettings();
    });

    // 알림 설정
    document.getElementById('soundEnabled')?.addEventListener('change', (e) => {
        settings.notification.soundEnabled = e.target.checked;
        saveSettings();
    });

    document.getElementById('volumeSlider')?.addEventListener('input', (e) => {
        settings.notification.volume = parseInt(e.target.value);
        saveSettings();
    });

    document.getElementById('popupEnabled')?.addEventListener('change', (e) => {
        settings.notification.popupEnabled = e.target.checked;
        saveSettings();
    });

    console.log('설정 화면 초기화 완료');
}

// 설정 로드
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('yumyum_settings');
        if (savedSettings) {
            const loaded = JSON.parse(savedSettings);
            settings = { ...settings, ...loaded };
            applySettings();
        }
    } catch (error) {
        console.error('설정 로드 실패:', error);
    }
}

// 설정 적용
function applySettings() {
    // 운영 설정
    if (document.getElementById('autoLoginEnabled')) {
        document.getElementById('autoLoginEnabled').checked = settings.general.autoLoginEnabled;
    }
    if (document.getElementById('autoPauseEnabled')) {
        document.getElementById('autoPauseEnabled').checked = settings.general.autoPauseEnabled;
    }
    if (document.getElementById('originPrintEnabled')) {
        document.getElementById('originPrintEnabled').checked = settings.general.originPrintEnabled;
    }

    // 전반 설정
    if (document.getElementById('storeAlarmEnabled')) {
        document.getElementById('storeAlarmEnabled').checked = settings.general.storeAlarmEnabled;
    }
    if (document.getElementById('autoAcceptEnabled')) {
        document.getElementById('autoAcceptEnabled').checked = settings.general.autoAcceptEnabled;
    }
    if (document.getElementById('pickupPrintEnabled')) {
        document.getElementById('pickupPrintEnabled').checked = settings.general.pickupPrintEnabled;
    }
    
    // 볼륨 레벨 적용
    setVolumeLevel(settings.general.volumeLevel || 3);
    
    // 알림음 설정 적용
    if (document.getElementById('currentSoundDisplay')) {
        const soundName = soundNames[settings.general.notificationSound] || '주문이 접수되었습니다';
        document.getElementById('currentSoundDisplay').textContent = soundName;
    }
    
    // 자동접수 시간 적용
    if (document.getElementById('autoAcceptTime')) {
        document.getElementById('autoAcceptTime').textContent = settings.general.autoAcceptTime || 15;
    }
    
    // 볼륨 컨트롤 표시/숨김
    toggleVolumeControl(settings.general.storeAlarmEnabled);
    
    // 자동접수 시간 설정 표시/숨김
    toggleAutoAcceptTimeSection(settings.general.autoAcceptEnabled);

    // 프린터 설정
    if (document.getElementById('printerEnabled')) {
        document.getElementById('printerEnabled').checked = settings.printer.enabled;
    }
    if (document.getElementById('printerName')) {
        document.getElementById('printerName').value = settings.printer.printerName;
    }
    if (document.getElementById('printerCopies')) {
        document.getElementById('printerCopies').value = `${settings.printer.copies}줄`;
    }
    if (document.getElementById('connectionPort')) {
        document.getElementById('connectionPort').value = settings.printer.connectionPort;
    }
    if (document.getElementById('connectionSpeed')) {
        document.getElementById('connectionSpeed').value = settings.printer.connectionSpeed;
    }
    if (document.getElementById('orderReceiptCount')) {
        document.getElementById('orderReceiptCount').textContent = `${settings.printer.orderReceiptCount}장`;
    }
    if (document.getElementById('orderSheetCount')) {
        document.getElementById('orderSheetCount').textContent = `${settings.printer.orderSheetCount}장`;
    }
    if (document.getElementById('orderReceiptEnabled')) {
        document.getElementById('orderReceiptEnabled').checked = settings.printer.orderReceiptEnabled;
    }
    if (document.getElementById('orderSheetEnabled')) {
        document.getElementById('orderSheetEnabled').checked = settings.printer.orderSheetEnabled;
    }
    if (document.getElementById('autoPrintEnabled')) {
        document.getElementById('autoPrintEnabled').checked = settings.printer.autoPrintEnabled;
    }
    if (document.getElementById('printerSelect')) {
        document.getElementById('printerSelect').value = settings.printer.selectedPrinter;
    }

    // 알림 설정
    if (document.getElementById('soundEnabled')) {
        document.getElementById('soundEnabled').checked = settings.notification.soundEnabled;
    }
    if (document.getElementById('volumeSlider')) {
        document.getElementById('volumeSlider').value = settings.notification.volume;
    }
    if (document.getElementById('popupEnabled')) {
        document.getElementById('popupEnabled').checked = settings.notification.popupEnabled;
    }
}

// 설정 저장
function saveSettings() {
    try {
        localStorage.setItem('yumyum_settings', JSON.stringify(settings));
        console.log('설정 저장 완료');
    } catch (error) {
        console.error('설정 저장 실패:', error);
    }
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const day = days[now.getDay()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const timeString = `${month}. ${date} (${day}) ${hours}:${minutes}`;
    document.getElementById('currentTime').textContent = timeString;
}

// 설정 탭 전환
function switchSettingsTab(tabName) {
    // 모든 패널 숨기기
    const panels = document.querySelectorAll('.settings-panel');
    panels.forEach(panel => panel.classList.remove('active'));

    // 모든 네비게이션 아이템 비활성화
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // 선택한 패널 표시
    document.getElementById(`${tabName}-settings`).classList.add('active');

    // 선택한 네비게이션 아이템 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// 이전 버튼
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // Electron 환경에서는 이전 화면으로 이동
        window.location.href = 'order-management.html';
    }
}

// 상세 알림 설정 모달 열기
function openDetailAlarmSettings() {
    const modal = document.getElementById('detailAlarmModal');
    modal.classList.add('show');
    
    // 저장된 알림 설정 적용
    if (settings.alarmDetails.orderAlarm) {
        document.querySelector(`input[name="orderAlarm"][value="${settings.alarmDetails.orderAlarm}"]`).checked = true;
    }
    if (settings.alarmDetails.pickupAlarm) {
        document.querySelector(`input[name="pickupAlarm"][value="${settings.alarmDetails.pickupAlarm}"]`).checked = true;
    }
    document.getElementById('orderTime').value = settings.alarmDetails.orderTime;
    document.getElementById('pickupTime').value = settings.alarmDetails.pickupTime;
    document.getElementById('cookingTime').value = settings.alarmDetails.cookingTime;
    document.getElementById('cookingCompleteAlarm').checked = settings.alarmDetails.cookingCompleteAlarm;
    document.getElementById('cookingCompleteCustom').checked = settings.alarmDetails.cookingCompleteCustom;
}

// 상세 알림 설정 모달 닫기
function closeDetailAlarmModal() {
    const modal = document.getElementById('detailAlarmModal');
    modal.classList.remove('show');
}

// 알림 설정 저장
function saveAlarmSettings() {
    // 주문 알림 설정
    const orderAlarmRadio = document.querySelector('input[name="orderAlarm"]:checked');
    if (orderAlarmRadio) {
        settings.alarmDetails.orderAlarm = orderAlarmRadio.value;
    }

    // 픽업 알림 설정
    const pickupAlarmRadio = document.querySelector('input[name="pickupAlarm"]:checked');
    if (pickupAlarmRadio) {
        settings.alarmDetails.pickupAlarm = pickupAlarmRadio.value;
    }

    // 시간 설정
    settings.alarmDetails.orderTime = parseInt(document.getElementById('orderTime').value);
    settings.alarmDetails.pickupTime = parseInt(document.getElementById('pickupTime').value);
    settings.alarmDetails.cookingTime = parseInt(document.getElementById('cookingTime').value);

    // 체크박스 설정
    settings.alarmDetails.cookingCompleteAlarm = document.getElementById('cookingCompleteAlarm').checked;
    settings.alarmDetails.cookingCompleteCustom = document.getElementById('cookingCompleteCustom').checked;

    saveSettings();
    closeDetailAlarmModal();
    showToast('알림 설정이 저장되었습니다', 'success');
}

// 시간 증가
function increaseTime(inputId) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) || 0;
    value = Math.min(value + 5, 60); // 최대 60분
    input.value = value;
}

// 시간 감소
function decreaseTime(inputId) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) || 0;
    value = Math.max(value - 5, 0); // 최소 0분
    input.value = value;
}

// 기기 관리 열기
function openDeviceManagement() {
    showToast('기기 관리 기능은 준비 중입니다', 'info');
}

// 업데이트 확인
function checkUpdate() {
    showToast('현재 최신 버전입니다 (v1.0.0)', 'success');
}

// 업데이트 적용
function updateNow() {
    showToast('업데이트를 확인하고 있습니다...', 'info');
}

// 프린터 목록 로드
async function loadPrinters() {
    try {
        const printerSelect = document.getElementById('printerSelect');
        if (!printerSelect) return;

        // 기존 옵션 제거 (첫번째 기본 옵션 제외)
        while (printerSelect.options.length > 1) {
            printerSelect.remove(1);
        }

        // 시스템 프린터 목록 가져오기
        if (window.electron && window.electron.getPrinters) {
            const printers = await window.electron.getPrinters();
            
            printers.forEach(printer => {
                const option = document.createElement('option');
                option.value = printer.name;
                option.textContent = `${printer.name}${printer.isDefault ? ' (기본)' : ''}`;
                if (printer.status === 0) {
                    option.textContent += ' [준비됨]';
                }
                printerSelect.appendChild(option);
            });

            updatePortInfo(printers);
            
            // 저장된 프린터 선택
            if (settings.printer.selectedPrinter) {
                printerSelect.value = settings.printer.selectedPrinter;
            }
        } else {
            // Electron API 없을 때 더미 데이터
            addDummyPrinters(printerSelect);
        }
    } catch (error) {
        console.error('프린터 목록 로드 실패:', error);
        showToast('프린터 목록을 불러올 수 없습니다', 'error');
    }
}

// 더미 프린터 추가 (개발/테스트용)
function addDummyPrinters(selectElement) {
    const dummyPrinters = [
        { name: 'POS-80 영수증 프린터 (COM1)', port: 'COM1' },
        { name: 'EPSON TM-T88V (USB001)', port: 'USB001' },
        { name: '기본 프린터', port: 'LPT1' }
    ];

    dummyPrinters.forEach(printer => {
        const option = document.createElement('option');
        option.value = printer.name;
        option.textContent = printer.name;
        selectElement.appendChild(option);
    });

    // 더미 포트 정보 표시
    updatePortInfo(dummyPrinters.map(p => ({
        name: p.name,
        status: 0,
        displayName: p.port
    })));
}

// 프린터 새로고침
function refreshPrinters() {
    showToast('프린터 목록을 새로고침합니다', 'info');
    loadPrinters();
}

// 포트 정보 업데이트
function updatePortInfo(printers) {
    const portInfo = document.getElementById('portInfo');
    if (!portInfo) return;

    if (!printers || printers.length === 0) {
        portInfo.innerHTML = '<p class="info-label">감지된 프린터가 없습니다</p>';
        return;
    }

    let html = '';
    printers.forEach((printer, index) => {
        const isConnected = printer.status === 0 || printer.status === undefined;
        const portName = printer.displayName || `PORT${index + 1}`;
        
        html += `
            <div class="port-item">
                <div>
                    <div class="port-name">${printer.name}</div>
                    <div style="font-size: 12px; color: #999; margin-top: 4px;">${portName}</div>
                </div>
                <span class="port-status ${isConnected ? 'connected' : 'disconnected'}">
                    ${isConnected ? '연결됨' : '오프라인'}
                </span>
            </div>
        `;
    });

    portInfo.innerHTML = html;
}

// 프린터 연결 확인
async function checkPrinterConnection() {
    const selectedPrinter = document.getElementById('printerSelect').value;
    const statusElement = document.getElementById('printerStatus');

    if (!selectedPrinter) {
        statusElement.textContent = '프린터를 선택해주세요';
        statusElement.className = 'status-text';
        showToast('프린터를 먼저 선택해주세요', 'error');
        return;
    }

    statusElement.textContent = '연결 확인 중...';
    statusElement.className = 'status-text';

    try {
        // 실제 연결 확인 (Electron API 사용)
        if (window.electron && window.electron.checkPrinter) {
            const isConnected = await window.electron.checkPrinter(selectedPrinter);
            
            if (isConnected) {
                statusElement.textContent = '✓ 프린터가 정상적으로 연결되었습니다';
                statusElement.className = 'status-text success';
                showToast('프린터 연결이 정상입니다', 'success');
            } else {
                statusElement.textContent = '✗ 프린터 연결에 실패했습니다';
                statusElement.className = 'status-text error';
                showToast('프린터 연결을 확인해주세요', 'error');
            }
        } else {
            // 개발 모드에서는 성공으로 표시
            statusElement.textContent = '✓ 프린터가 정상적으로 연결되었습니다 (개발 모드)';
            statusElement.className = 'status-text success';
            showToast('프린터 연결이 정상입니다 (개발 모드)', 'success');
        }
    } catch (error) {
        console.error('프린터 연결 확인 실패:', error);
        statusElement.textContent = '✗ 연결 확인 중 오류가 발생했습니다';
        statusElement.className = 'status-text error';
        showToast('프린터 연결 확인 실패', 'error');
    }
}

// 프린터 설정 저장
function savePrinterSettings() {
    settings.printer.selectedPrinter = document.getElementById('printerSelect').value;
    settings.printer.paperWidth = parseInt(document.getElementById('paperWidth').value);
    settings.printer.printSpeed = parseInt(document.getElementById('printSpeed').value); // mm/s로 저장
    settings.printer.paperCut = document.getElementById('paperCut').value;

    saveSettings();
    showToast(`프린터 설정이 저장되었습니다 (속도: ${settings.printer.printSpeed}mm/s)`, 'success');
}

// 테스트 인쇄
async function testPrint() {
    const selectedPrinter = document.getElementById('printerSelect').value;
    
    if (!selectedPrinter) {
        showToast('프린터를 먼저 선택해주세요', 'error');
        return;
    }

    showToast('테스트 인쇄를 시작합니다', 'info');

    try {
        // 테스트 영수증 내용
        const testReceipt = {
            storeName: 'YumYum 테스트 매장',
            orderId: 'TEST-' + Date.now(),
            date: new Date().toLocaleString('ko-KR'),
            items: [
                { name: '테스트 메뉴 1', quantity: 1, price: 10000 },
                { name: '테스트 메뉴 2', quantity: 2, price: 15000 }
            ],
            total: 40000,
            paymentMethod: '현금'
        };

        if (window.electron && window.electron.printReceipt) {
            const result = await window.electron.printReceipt(selectedPrinter, testReceipt);
            if (result.success) {
                showToast('테스트 인쇄가 완료되었습니다', 'success');
            } else {
                showToast('인쇄 중 오류가 발생했습니다', 'error');
            }
        } else {
            // 개발 모드
            console.log('테스트 인쇄 데이터:', testReceipt);
            showToast('테스트 인쇄 완료 (개발 모드)', 'success');
        }
    } catch (error) {
        console.error('테스트 인쇄 실패:', error);
        showToast('테스트 인쇄 중 오류가 발생했습니다', 'error');
    }
}

// 토스트 메시지
function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    // 스타일 추가
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // 3초 후 자동 제거
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
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
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 모달 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    const modal = document.getElementById('detailAlarmModal');
    if (e.target === modal) {
        closeDetailAlarmModal();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDetailAlarmModal();
    }
});

// ============= 볼륨 및 자동접수 관련 함수 =============

// 볼륨 레벨 설정
function setVolumeLevel(level) {
    // 1-6 범위 검증
    if (level < 1) level = 1;
    if (level > 6) level = 6;
    
    settings.general.volumeLevel = level;
    
    // UI 업데이트
    updateVolumeGaugeUI(level);
    
    // 텍스트 업데이트
    document.getElementById('volumeLevelText').textContent = level;
    
    // 설정 저장
    saveSettings();
    
    // 알림음 테스트 (선택사항)
    playVolumeTestSound(level);
    
    console.log(`볼륨 레벨 설정: ${level}단계`);
}

// 볼륨 게이지 UI 업데이트
function updateVolumeGaugeUI(level) {
    // 모든 레벨 버튼에서 active 클래스 제거
    document.querySelectorAll('.gauge-level').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 레벨까지 active 클래스 추가
    for (let i = 1; i <= level; i++) {
        const btn = document.querySelector(`.gauge-level[data-level="${i}"]`);
        if (btn) {
            btn.classList.add('active');
        }
    }
    
    // 게이지 바 너비 조절
    const gaugeBar = document.getElementById('volumeGaugeBar');
    if (gaugeBar) {
        const percentage = (level / 6) * 100;
        gaugeBar.style.width = percentage + '%';
    }
}

// 볼륨 테스트 사운드 재생
function playVolumeTestSound(level) {
    if (!settings.general.storeAlarmEnabled) return;
    
    // 현재 설정된 알림음 재생
    const soundId = settings.general.notificationSound || 'voice-order-received';
    playNotificationSound(soundId, level);
}

// 볼륨 컨트롤 표시/숨김
function toggleVolumeControl(show) {
    const volumeSection = document.getElementById('volumeControlSection');
    if (volumeSection) {
        volumeSection.style.display = show ? 'flex' : 'none';
    }
}

// 자동접수 시간 증가
function increaseAutoTime() {
    let currentTime = parseInt(document.getElementById('autoAcceptTime').textContent) || 15;
    
    if (currentTime < 60) {
        currentTime += 5;
        document.getElementById('autoAcceptTime').textContent = currentTime;
        settings.general.autoAcceptTime = currentTime;
        saveSettings();
        showToast(`자동 조리시간: ${currentTime}분`, 'info');
    } else {
        showToast('최대 60분까지 설정 가능합니다', 'warning');
    }
}

// 자동접수 시간 감소
function decreaseAutoTime() {
    let currentTime = parseInt(document.getElementById('autoAcceptTime').textContent) || 15;
    
    if (currentTime > 5) {
        currentTime -= 5;
        document.getElementById('autoAcceptTime').textContent = currentTime;
        settings.general.autoAcceptTime = currentTime;
        saveSettings();
        showToast(`자동 조리시간: ${currentTime}분`, 'info');
    } else {
        showToast('최소 5분부터 설정 가능합니다', 'warning');
    }
}

// 자동접수 시간 설정 섹션 표시/숨김
function toggleAutoAcceptTimeSection(show) {
    const section = document.getElementById('autoAcceptTimeSection');
    if (section) {
        section.style.display = show ? 'flex' : 'none';
    }
}

// ============= 운영 설정 전용 함수 =============

// 준비시간 설정 열기
function openPrepTimeSettings() {
    showToast('주문 준비시간 설정 기능은 준비 중입니다', 'info');
}

// 순서 변경 드래그 앤 드롭 기능
let draggedElement = null;

// 드래그 시작
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

// 드래그 오버
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

// 드래그 엔터
function handleDragEnter(e) {
    this.classList.add('drag-over');
}

// 드래그 리브
function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

// 드롭
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        // 순서 변경
        const parent = this.parentNode;
        const draggedIndex = Array.from(parent.children).indexOf(draggedElement);
        const targetIndex = Array.from(parent.children).indexOf(this);

        if (draggedIndex < targetIndex) {
            parent.insertBefore(draggedElement, this.nextSibling);
        } else {
            parent.insertBefore(draggedElement, this);
        }

        showToast('순서가 변경되었습니다', 'success');
        saveOrderSequence();
    }

    this.classList.remove('drag-over');
    return false;
}

// 드래그 종료
function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // 모든 drag-over 클래스 제거
    document.querySelectorAll('.sequence-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// 드래그 앤 드롭 초기화
function initializeDragDrop() {
    const sequenceItems = document.querySelectorAll('.sequence-item');
    
    sequenceItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart, false);
        item.addEventListener('dragenter', handleDragEnter, false);
        item.addEventListener('dragover', handleDragOver, false);
        item.addEventListener('dragleave', handleDragLeave, false);
        item.addEventListener('drop', handleDrop, false);
        item.addEventListener('dragend', handleDragEnd, false);
    });
}

// 순서 저장
function saveOrderSequence() {
    const sequenceContainer = document.getElementById('orderInfoSequence');
    if (!sequenceContainer) return;

    const items = Array.from(sequenceContainer.querySelectorAll('.sequence-item span'));
    const sequence = items.map(span => span.textContent);
    
    settings.orderInfoSequence = sequence;
    saveSettings();
}

// 페이지 로드 시 드래그 앤 드롭 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeDragDrop, 500);
    });
} else {
    setTimeout(initializeDragDrop, 500);
}

// ============= 프린터 설정 전용 함수 =============

// 프린터 탭 전환
function switchPrinterTab(tabName) {
    // 모든 탭 버튼에서 active 제거
    document.querySelectorAll('.printer-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 탭 버튼에 active 추가
    const selectedBtn = document.querySelector(`.printer-tab-btn[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // TODO: 탭별 콘텐츠 표시/숨김 처리
    showToast(`${tabName} 탭이 선택되었습니다`, 'info');
}

// 프린터 도움말 열기
function openPrinterHelp() {
    showToast('프린터 설정 방법 안내를 표시합니다', 'info');
}

// 프린터명 변경 모달
function openPrinterNameModal() {
    const newName = prompt('프린터명을 입력하세요:', settings.printer.printerName);
    if (newName && newName.trim()) {
        settings.printer.printerName = newName.trim();
        document.getElementById('printerName').value = newName.trim();
        saveSettings();
        showToast('프린터명이 변경되었습니다', 'success');
    }
}

// 줄바꿈 선택 모달 열기
function openCopiesModal() {
    const modal = document.getElementById('copiesModal');
    if (modal) {
        // 현재 설정값 선택
        const currentCopies = settings.printer.copies;
        const radio = document.querySelector(`input[name="copies"][value="${currentCopies}"]`);
        if (radio) {
            radio.checked = true;
        }
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// 줄바꿈 선택 모달 닫기
function closeCopiesModal() {
    const modal = document.getElementById('copiesModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// 줄바꿈 저장
function saveCopies() {
    const selected = document.querySelector('input[name="copies"]:checked');
    if (selected) {
        const copies = parseInt(selected.value);
        settings.printer.copies = copies;
        document.getElementById('printerCopies').value = `${copies}줄`;
        saveSettings();
        showToast(`줄바꿈이 ${copies}줄로 설정되었습니다`, 'success');
        closeCopiesModal();
    }
}

// 연결포트 모달 열기
async function openPortModal() {
    const modal = document.getElementById('portModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        await loadSerialPorts();
    }
}

// 연결포트 모달 닫기
function closePortModal() {
    const modal = document.getElementById('portModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// 시리얼 포트 목록 로드
async function loadSerialPorts() {
    const portRadioGroup = document.getElementById('portRadioGroup');
    if (!portRadioGroup) return;

    // 로딩 메시지 표시
    portRadioGroup.innerHTML = '<div class="loading-message">포트를 검색 중입니다...</div>';

    try {
        if (!window.electron || !window.electron.getSerialPorts) {
            portRadioGroup.innerHTML = '<div class="error-message">포트 검색 기능을 사용할 수 없습니다.</div>';
            return;
        }

        const result = await window.electron.getSerialPorts();
        
        if (!result.success) {
            portRadioGroup.innerHTML = '<div class="error-message">포트 검색 중 오류가 발생했습니다.</div>';
            return;
        }

        const ports = result.ports;

        if (ports.length === 0) {
            portRadioGroup.innerHTML = '<div class="no-ports-message">사용 가능한 포트가 없습니다.</div>';
            return;
        }

        // 포트 목록 표시
        let html = '';
        ports.forEach((port, index) => {
            const isChecked = port.path === settings.printer.connectionPort ? 'checked' : '';
            const portLabel = port.manufacturer 
                ? `${port.path} (${port.manufacturer})`
                : port.path;
            
            html += `
                <label class="radio-option port-option">
                    <input type="radio" name="port" value="${port.path}" ${isChecked}>
                    <div class="port-info">
                        <span class="port-label">${portLabel}</span>
                        ${port.serialNumber ? `<span class="port-detail">S/N: ${port.serialNumber}</span>` : ''}
                    </div>
                </label>
            `;
        });

        // "선택없음" 옵션 추가
        const noneChecked = settings.printer.connectionPort === '선택없음' ? 'checked' : '';
        html += `
            <label class="radio-option">
                <input type="radio" name="port" value="선택없음" ${noneChecked}>
                <span class="radio-label">선택없음</span>
            </label>
        `;

        portRadioGroup.innerHTML = html;

    } catch (error) {
        console.error('포트 로드 오류:', error);
        portRadioGroup.innerHTML = '<div class="error-message">포트 검색 중 오류가 발생했습니다.</div>';
    }
}

// 포트 새로고침
async function refreshPorts() {
    await loadSerialPorts();
    showToast('포트 목록을 새로고침했습니다', 'success');
}

// 연결포트 저장
function savePort() {
    const selected = document.querySelector('input[name="port"]:checked');
    if (selected) {
        const port = selected.value;
        settings.printer.connectionPort = port;
        document.getElementById('connectionPort').value = port;
        saveSettings();
        showToast(`연결포트가 ${port}로 설정되었습니다`, 'success');
        closePortModal();
    }
}

// 연결속도 선택 모달 열기
function openSpeedModal() {
    const modal = document.getElementById('speedModal');
    if (modal) {
        // 현재 설정값 선택
        const currentSpeed = settings.printer.connectionSpeed;
        const radio = document.querySelector(`input[name="speed"][value="${currentSpeed}"]`);
        if (radio) {
            radio.checked = true;
        }
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// 연결속도 선택 모달 닫기
function closeSpeedModal() {
    const modal = document.getElementById('speedModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// 연결속도 저장
function saveSpeed() {
    const selected = document.querySelector('input[name="speed"]:checked');
    if (selected) {
        const speed = selected.value === 'default' ? '사용자 설정' : selected.value;
        if (speed !== '사용자 설정') {
            settings.printer.connectionSpeed = parseInt(speed);
        }
        document.getElementById('connectionSpeed').value = speed;
        saveSettings();
        showToast(`연결속도가 ${speed}로 설정되었습니다`, 'success');
        closeSpeedModal();
    }
}

// 인쇄 매수 증가
function increasePrintCount(type) {
    if (type === 'orderReceipt') {
        if (settings.printer.orderReceiptCount < 10) {
            settings.printer.orderReceiptCount++;
            document.getElementById('orderReceiptCount').textContent = `${settings.printer.orderReceiptCount}장`;
            saveSettings();
        } else {
            showToast('최대 10장까지 설정 가능합니다', 'warning');
        }
    } else if (type === 'orderSheet') {
        if (settings.printer.orderSheetCount < 10) {
            settings.printer.orderSheetCount++;
            document.getElementById('orderSheetCount').textContent = `${settings.printer.orderSheetCount}장`;
            saveSettings();
        } else {
            showToast('최대 10장까지 설정 가능합니다', 'warning');
        }
    }
}

// 인쇄 매수 감소
function decreasePrintCount(type) {
    if (type === 'orderReceipt') {
        if (settings.printer.orderReceiptCount > 1) {
            settings.printer.orderReceiptCount--;
            document.getElementById('orderReceiptCount').textContent = `${settings.printer.orderReceiptCount}장`;
            saveSettings();
        } else {
            showToast('최소 1장부터 설정 가능합니다', 'warning');
        }
    } else if (type === 'orderSheet') {
        if (settings.printer.orderSheetCount > 1) {
            settings.printer.orderSheetCount--;
            document.getElementById('orderSheetCount').textContent = `${settings.printer.orderSheetCount}장`;
            saveSettings();
        } else {
            showToast('최소 1장부터 설정 가능합니다', 'warning');
        }
    }
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeSpeedModal();
        closeCopiesModal();
        closePortModal();
        closeSoundModal();
    }
});

// ============= 알림음 설정 =============

// 알림음 선택 모달 열기
function openSoundModal() {
    const modal = document.getElementById('soundModal');
    if (modal) {
        // 현재 설정값 선택
        const currentSound = settings.general.notificationSound;
        const radio = document.querySelector(`input[name="sound"][value="${currentSound}"]`);
        if (radio) {
            radio.checked = true;
        }
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// 알림음 선택 모달 닫기
function closeSoundModal() {
    const modal = document.getElementById('soundModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// 알림음 재생 (공통 함수)
async function playNotificationSound(soundId, volumeLevel = null) {
    try {
        // 볼륨 레벨이 지정되지 않으면 현재 설정 사용
        const level = volumeLevel !== null ? volumeLevel : settings.general.volumeLevel;
        const volume = level / 6; // 0-1 범위로 변환
        
        // 오디오 파일 매핑 (실제 파일명)
        const audioFiles = {
            'voice-order-received': '주문이 접수되었습니다.m4a',
            'voice-yumyum-pickup-order': '얌얌픽업 주문.m4a',
            'voice-yumyum-pickup': '얌얌픽업.m4a',
            'bell': null, // 파일 없음
            'clear-notification': null // 파일 없음
        };
        
        const audioFile = audioFiles[soundId];
        
        // 실제 오디오 파일이 있으면 재생
        if (audioFile && window.electron && window.electron.getAudioPath) {
            // Electron 메인 프로세스에서 오디오 파일 경로 가져오기
            try {
                const result = await window.electron.getAudioPath(audioFile);
                if (result.success) {
                    console.log('오디오 파일 경로:', result.path);
                    const audio = new Audio(`file://${result.path}`);
                    audio.volume = volume;
                    await audio.play();
                    console.log('오디오 재생 성공');
                } else {
                    console.log('오디오 파일 경로 찾기 실패, 비프음 재생');
                    playBeepSound(soundId, volume);
                }
            } catch (err) {
                console.log('오디오 재생 실패:', err);
                playBeepSound(soundId, volume);
            }
        } else {
            console.log('오디오 파일 없음 또는 Electron 환경 아님, 비프음 재생');
            playBeepSound(soundId, volume);
        }
        
    } catch (error) {
        console.log('알림음 재생 실패:', error);
        playBeepSound(soundId, volume || 0.5);
    }
}

// 비프음 재생 (오디오 파일이 없을 때)
function playBeepSound(soundId, volume) {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        // 알림음 종류에 따라 다른 주파수 사용
        const frequencies = {
            'voice-order-received': 800,
            'voice-yumyum-pickup-order': 900,
            'voice-yumyum-pickup': 1000,
            'bell': 600,
            'clear-notification': 1200
        };
        
        oscillator.frequency.value = frequencies[soundId] || 800;
        gainNode.gain.value = volume * 0.3;
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            context.close();
        }, 150);
    } catch (error) {
        console.log('비프음 재생 실패:', error);
    }
}

// 알림음 미리듣기
function playSound(soundId, event) {
    event.preventDefault();
    event.stopPropagation();
    
    playNotificationSound(soundId);
    showToast(`"${soundNames[soundId]}" 미리듣기`, 'info');
}

// 알림음 저장
function saveSound() {
    const selected = document.querySelector('input[name="sound"]:checked');
    if (selected) {
        const soundId = selected.value;
        const soundName = soundNames[soundId];
        
        settings.general.notificationSound = soundId;
        document.getElementById('currentSoundDisplay').textContent = soundName;
        saveSettings();
        showToast(`알림음이 "${soundName}"로 설정되었습니다`, 'success');
        closeSoundModal();
    }
}

// 설정 내보내기 (다른 페이지에서 사용)
function getSettings() {
    return settings;
}

// 백엔드 API 연결은 backend-config.js에서 관리됩니다

console.log('YumYum 설정 화면 로드 완료');



