/**
 * 운영정보 관리 JavaScript
 */

let operationInfo = null;
let tempHolidayPicker = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadOperationInfo();
    initTimeOptions();
    initFlatpickr();
    initBreakTimeToggle();
});

// 운영정보 로드
function loadOperationInfo() {
    operationInfo = MockDataAPI.getOperationInfo();
    
    // 가게 정보
    document.getElementById('storeName').value = operationInfo.storeInfo.name;
    document.getElementById('storeAddress').value = operationInfo.storeInfo.address;
    document.getElementById('storePhone').value = operationInfo.storeInfo.phone;
    
    // 운영시간
    renderOperationHours();
    
    // 정기 휴무일
    renderRegularHolidays();
    
    // 임시 휴무일
    renderTempHolidays();
    
    // 브레이크타임
    document.getElementById('breakTimeEnabled').checked = operationInfo.breakTime.enabled;
    document.getElementById('breakTimeStart').value = operationInfo.breakTime.startTime;
    document.getElementById('breakTimeEnd').value = operationInfo.breakTime.endTime;
    
    if (operationInfo.breakTime.enabled) {
        document.getElementById('breakTimeInputs').classList.add('active');
    }
}

// 운영시간 렌더링
function renderOperationHours() {
    const container = document.getElementById('operationHours');
    container.innerHTML = operationInfo.operationHours.map(hour => `
        <div class="hour-row">
            <span class="day-label">${hour.dayName}요일</span>
            <div class="day-checkbox">
                <input type="checkbox" id="dayEnabled${hour.day}" 
                       ${hour.enabled ? 'checked' : ''} 
                       onchange="toggleDayEnabled(${hour.day})">
                <label for="dayEnabled${hour.day}">영업</label>
            </div>
            <div class="time-inputs">
                <select id="dayStart${hour.day}" ${!hour.enabled ? 'disabled' : ''}>
                    ${generateTimeOptionsHTML(hour.startTime)}
                </select>
                <span>~</span>
                <select id="dayEnd${hour.day}" ${!hour.enabled ? 'disabled' : ''}>
                    ${generateTimeOptionsHTML(hour.endTime)}
                </select>
            </div>
        </div>
    `).join('');
}

// 시간 옵션 HTML 생성
function generateTimeOptionsHTML(selectedTime) {
    const times = Utils.generateTimeOptions();
    return times.map(time => 
        `<option value="${time}" ${time === selectedTime ? 'selected' : ''}>${time}</option>`
    ).join('');
}

// 요일 영업 토글
function toggleDayEnabled(day) {
    const enabled = document.getElementById(`dayEnabled${day}`).checked;
    document.getElementById(`dayStart${day}`).disabled = !enabled;
    document.getElementById(`dayEnd${day}`).disabled = !enabled;
}

// 시간 옵션 초기화 (브레이크타임)
function initTimeOptions() {
    const times = Utils.generateTimeOptions();
    const startSelect = document.getElementById('breakTimeStart');
    const endSelect = document.getElementById('breakTimeEnd');
    
    startSelect.innerHTML = times.map(time => 
        `<option value="${time}">${time}</option>`
    ).join('');
    
    endSelect.innerHTML = times.map(time => 
        `<option value="${time}">${time}</option>`
    ).join('');
}

// Flatpickr 초기화 (임시 휴무일 달력)
function initFlatpickr() {
    tempHolidayPicker = flatpickr('#tempHolidayDate', {
        mode: 'range',
        dateFormat: 'Y-m-d',
        locale: 'ko',
        minDate: 'today'
    });
}

// 브레이크타임 토글
function initBreakTimeToggle() {
    document.getElementById('breakTimeEnabled').addEventListener('change', (e) => {
        const inputs = document.getElementById('breakTimeInputs');
        if (e.target.checked) {
            inputs.classList.add('active');
        } else {
            inputs.classList.remove('active');
        }
    });
}

// 정기 휴무일 추가
function addRegularHoliday() {
    const weekSelect = document.getElementById('holidayWeek');
    const week = weekSelect.value;
    const dayCheckboxes = document.querySelectorAll('.day-checkboxes input[type="checkbox"]:checked');
    
    if (dayCheckboxes.length === 0) {
        Utils.showToast('요일을 선택해주세요', 'error');
        return;
    }
    
    dayCheckboxes.forEach(checkbox => {
        const dayOfWeek = parseInt(checkbox.value);
        const holiday = {
            type: week ? 'specific' : 'weekly',
            week: week ? parseInt(week) : null,
            dayOfWeek: dayOfWeek
        };
        
        // 중복 체크
        const exists = operationInfo.regularHolidays.some(h => 
            h.dayOfWeek === holiday.dayOfWeek && 
            h.week === holiday.week
        );
        
        if (!exists) {
            operationInfo.regularHolidays.push(holiday);
        }
    });
    
    // 체크박스 초기화
    dayCheckboxes.forEach(cb => cb.checked = false);
    weekSelect.value = '';
    
    renderRegularHolidays();
    Utils.showToast('정기 휴무일이 추가되었습니다', 'success');
}

// 정기 휴무일 렌더링
function renderRegularHolidays() {
    const container = document.getElementById('regularHolidayList');
    
    if (operationInfo.regularHolidays.length === 0) {
        container.innerHTML = '<div class="holiday-list empty">등록된 정기 휴무일이 없습니다</div>';
        return;
    }
    
    container.innerHTML = operationInfo.regularHolidays.map((holiday, index) => {
        const dayName = Utils.getDayName(holiday.dayOfWeek);
        const weekText = holiday.week ? `${holiday.week}째주` : '매주';
        
        return `
            <div class="holiday-tag">
                <span>${weekText} ${dayName}요일</span>
                <button class="remove-btn" onclick="removeRegularHoliday(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
}

// 정기 휴무일 삭제
function removeRegularHoliday(index) {
    operationInfo.regularHolidays.splice(index, 1);
    renderRegularHolidays();
    Utils.showToast('정기 휴무일이 삭제되었습니다', 'success');
}

// 임시 휴무일 추가
function addTempHoliday() {
    const selectedDates = tempHolidayPicker.selectedDates;
    
    if (selectedDates.length === 0) {
        Utils.showToast('날짜를 선택해주세요', 'error');
        return;
    }
    
    const startDate = selectedDates[0];
    const endDate = selectedDates[1] || selectedDates[0];
    
    const holiday = {
        startDate: Utils.formatDate(startDate, 'YYYY-MM-DD'),
        endDate: Utils.formatDate(endDate, 'YYYY-MM-DD')
    };
    
    operationInfo.temporaryHolidays.push(holiday);
    
    tempHolidayPicker.clear();
    renderTempHolidays();
    Utils.showToast('임시 휴무일이 추가되었습니다', 'success');
}

// 임시 휴무일 렌더링
function renderTempHolidays() {
    const container = document.getElementById('tempHolidayList');
    
    if (operationInfo.temporaryHolidays.length === 0) {
        container.innerHTML = '<div class="holiday-list empty">등록된 임시 휴무일이 없습니다</div>';
        return;
    }
    
    container.innerHTML = operationInfo.temporaryHolidays.map((holiday, index) => {
        const dateText = holiday.startDate === holiday.endDate ? 
            holiday.startDate : 
            `${holiday.startDate} ~ ${holiday.endDate}`;
        
        return `
            <div class="holiday-tag">
                <span>${dateText}</span>
                <button class="remove-btn" onclick="removeTempHoliday(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
}

// 임시 휴무일 삭제
function removeTempHoliday(index) {
    operationInfo.temporaryHolidays.splice(index, 1);
    renderTempHolidays();
    Utils.showToast('임시 휴무일이 삭제되었습니다', 'success');
}

// 운영정보 저장
function saveOperationInfo() {
    // 운영시간 수집
    operationInfo.operationHours = operationInfo.operationHours.map(hour => ({
        day: hour.day,
        dayName: hour.dayName,
        enabled: document.getElementById(`dayEnabled${hour.day}`).checked,
        startTime: document.getElementById(`dayStart${hour.day}`).value,
        endTime: document.getElementById(`dayEnd${hour.day}`).value
    }));
    
    // 운영시간 유효성 검사
    for (const hour of operationInfo.operationHours) {
        if (hour.enabled && Utils.isTimeAfter(hour.startTime, hour.endTime)) {
            Utils.showToast(`${hour.dayName}요일: 시작 시간이 종료 시간보다 늦습니다`, 'error');
            return;
        }
    }
    
    // 브레이크타임 수집
    operationInfo.breakTime = {
        enabled: document.getElementById('breakTimeEnabled').checked,
        startTime: document.getElementById('breakTimeStart').value,
        endTime: document.getElementById('breakTimeEnd').value
    };
    
    // 브레이크타임 유효성 검사
    if (operationInfo.breakTime.enabled) {
        if (Utils.isTimeAfter(operationInfo.breakTime.startTime, operationInfo.breakTime.endTime)) {
            Utils.showToast('브레이크타임: 시작 시간이 종료 시간보다 늦습니다', 'error');
            return;
        }
    }
    
    // 저장
    MockDataAPI.saveOperationInfo(operationInfo);
    Utils.showToast('운영정보가 저장되었습니다', 'success');
}

// 뒤로가기
function goBack() {
    window.location.href = 'order-management.html';
}





