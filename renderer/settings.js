/**
 * YumYum 설정 화면 - JavaScript
 */

// 설정 데이터
let settings = {
    general: {
        storeAlarmEnabled: true,
        volumeLevel: 3, // 1-6 단계
        autoAcceptEnabled: false,
        autoAcceptTime: 15, // 5-60분
        pickupPrintEnabled: false
    },
    printer: {
        autoPrintEnabled: true, // 주문 접수 시 자동 영수증 출력
        selectedPrinter: '',
        paperWidth: 80,
        printSpeed: 150, // mm/s
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
    // 전반 설정
    document.getElementById('storeAlarmEnabled').addEventListener('change', (e) => {
        settings.general.storeAlarmEnabled = e.target.checked;
        toggleVolumeControl(e.target.checked);
        saveSettings();
    });

    document.getElementById('autoAcceptEnabled').addEventListener('change', (e) => {
        settings.general.autoAcceptEnabled = e.target.checked;
        toggleAutoAcceptTimeSection(e.target.checked);
        saveSettings();
    });

    document.getElementById('pickupPrintEnabled').addEventListener('change', (e) => {
        settings.general.pickupPrintEnabled = e.target.checked;
        saveSettings();
    });

    // 프린터 설정
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
    // 전반 설정
    document.getElementById('storeAlarmEnabled').checked = settings.general.storeAlarmEnabled;
    document.getElementById('autoAcceptEnabled').checked = settings.general.autoAcceptEnabled;
    document.getElementById('pickupPrintEnabled').checked = settings.general.pickupPrintEnabled;
    
    // 볼륨 레벨 적용
    setVolumeLevel(settings.general.volumeLevel || 3);
    
    // 자동접수 시간 적용
    document.getElementById('autoAcceptTime').textContent = settings.general.autoAcceptTime || 15;
    
    // 볼륨 컨트롤 표시/숨김
    toggleVolumeControl(settings.general.storeAlarmEnabled);
    
    // 자동접수 시간 설정 표시/숨김
    toggleAutoAcceptTimeSection(settings.general.autoAcceptEnabled);

    // 프린터 설정
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
    
    // 볼륨 레벨에 따른 실제 볼륨 값 (0-100)
    const volumeValue = (level / 6) * 100;
    
    // 실제 사운드 재생 (Web Audio API 사용)
    // 여기서는 간단한 비프음으로 테스트
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = 800; // 800Hz
        gainNode.gain.value = volumeValue / 100 * 0.3; // 볼륨 조절
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 100); // 0.1초 재생
    } catch (error) {
        console.log('사운드 테스트 실패:', error);
    }
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

// 설정 내보내기 (다른 페이지에서 사용)
function getSettings() {
    return settings;
}

// 백엔드 API 연결은 backend-config.js에서 관리됩니다

console.log('YumYum 설정 화면 로드 완료');

