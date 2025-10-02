/**
 * YumYum 설정 화면 - JavaScript
 */

// 설정 데이터
let settings = {
    general: {
        storeAlarmEnabled: true,
        orderAlarmEnabled: true,
        pickupPrintEnabled: false
    },
    printer: {
        autoPrintEnabled: false,
        selectedPrinter: ''
    },
    notification: {
        soundEnabled: true,
        volume: 80,
        popupEnabled: true
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
    setInterval(updateCurrentTime, 1000);
});

// 설정 초기화
function initializeSettings() {
    // 전반 설정
    document.getElementById('storeAlarmEnabled').addEventListener('change', (e) => {
        settings.general.storeAlarmEnabled = e.target.checked;
        saveSettings();
    });

    document.getElementById('orderAlarmEnabled').addEventListener('change', (e) => {
        settings.general.orderAlarmEnabled = e.target.checked;
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
    document.getElementById('orderAlarmEnabled').checked = settings.general.orderAlarmEnabled;
    document.getElementById('pickupPrintEnabled').checked = settings.general.pickupPrintEnabled;

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

// 테스트 인쇄
function testPrint() {
    showToast('테스트 인쇄를 시작합니다', 'info');
    // 실제 인쇄 로직은 메인 프로세스에서 처리
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

console.log('YumYum 설정 화면 로드 완료');

