/**
 * 공통 유틸리티 함수
 */

// 날짜 포맷팅
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour)
        .replace('mm', minute)
        .replace('ss', second)
        .replace('DAY', dayName);
}

// 금액 포맷팅
function formatCurrency(amount) {
    return amount.toLocaleString('ko-KR') + '원';
}

// 숫자 포맷팅
function formatNumber(num) {
    return num.toLocaleString('ko-KR');
}

// 요일 가져오기 (0: 일요일 ~ 6: 토요일)
function getDayOfWeek(date) {
    return new Date(date).getDay();
}

// 요일 이름 가져오기
function getDayName(dayOfWeek) {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return dayNames[dayOfWeek];
}

// 날짜 범위 계산
function getDateRange(type) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    let startDate, endDate;
    
    switch (type) {
        case 'today':
            startDate = new Date(now);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
            
        case 'yesterday':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 1);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            break;
            
        case 'last7days':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 6);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
            
        case 'last30days':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 29);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
            
        case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
            
        case 'lastMonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            break;
            
        default:
            startDate = new Date(now);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
    }
    
    return { startDate, endDate };
}

// 증감률 계산
function calculateGrowthRate(current, previous) {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous * 100).toFixed(1);
}

// 퍼센트 포맷팅
function formatPercent(value) {
    const num = parseFloat(value);
    const sign = num > 0 ? '+' : '';
    return `${sign}${num}%`;
}

// 시간 옵션 생성 (00:00 ~ 23:30, 30분 단위)
function generateTimeOptions() {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const h = String(hour).padStart(2, '0');
            const m = String(minute).padStart(2, '0');
            times.push(`${h}:${m}`);
        }
    }
    return times;
}

// 시간 비교 (time1이 time2보다 큰지)
function isTimeAfter(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return h1 * 60 + m1 > h2 * 60 + m2;
}

// 현재 시간이 운영시간인지 확인
function isOpenNow(operationHours, breakTime) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 해당 요일의 운영시간 확인
    const daySchedule = operationHours.find(h => h.day === dayOfWeek);
    if (!daySchedule || !daySchedule.enabled) {
        return false;
    }
    
    // 운영시간 내인지 확인
    if (currentTime < daySchedule.startTime || currentTime > daySchedule.endTime) {
        return false;
    }
    
    // 브레이크타임 확인
    if (breakTime && breakTime.enabled) {
        if (currentTime >= breakTime.startTime && currentTime < breakTime.endTime) {
            return false;
        }
    }
    
    return true;
}

// 휴무일인지 확인
function isHoliday(date, regularHolidays, temporaryHolidays) {
    const checkDate = new Date(date);
    const dayOfWeek = checkDate.getDay();
    const weekOfMonth = Math.ceil(checkDate.getDate() / 7);
    
    // 정기 휴무일 확인
    for (const holiday of regularHolidays) {
        if (holiday.dayOfWeek === dayOfWeek) {
            // 매주 반복
            if (holiday.type === 'weekly' || !holiday.week) {
                return true;
            }
            // 특정 주 반복
            if (holiday.week === weekOfMonth) {
                return true;
            }
        }
    }
    
    // 임시 휴무일 확인
    for (const holiday of temporaryHolidays) {
        const startDate = new Date(holiday.startDate);
        const endDate = new Date(holiday.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        if (checkDate >= startDate && checkDate <= endDate) {
            return true;
        }
    }
    
    return false;
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 3초 후 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 로딩 표시
function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>로딩 중...</p>
        </div>
    `;
    document.body.appendChild(loading);
}

// 로딩 숨김
function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

// 확인 다이얼로그
function showConfirm(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <p class="confirm-message">${message}</p>
            <div class="confirm-buttons">
                <button class="btn-cancel">취소</button>
                <button class="btn-confirm">확인</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.btn-cancel').addEventListener('click', () => {
        overlay.remove();
        if (onCancel) onCancel();
    });
    
    overlay.querySelector('.btn-confirm').addEventListener('click', () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    });
}

// 뒤로가기
function goBack() {
    window.history.back();
}

// 페이지 이동
function navigateTo(page) {
    window.location.href = page;
}

// 유틸리티 객체
const Utils = {
    formatDate,
    formatCurrency,
    formatNumber,
    getDayOfWeek,
    getDayName,
    getDateRange,
    calculateGrowthRate,
    formatPercent,
    generateTimeOptions,
    isTimeAfter,
    isOpenNow,
    isHoliday,
    showToast,
    showLoading,
    hideLoading,
    showConfirm,
    goBack,
    navigateTo
};

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

