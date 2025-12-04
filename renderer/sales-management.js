/**
 * 매출 관리 JavaScript
 */

let currentPeriod = 'last7days';
let salesByDayChart = null;
let salesByHourChart = null;
let predictionChart = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    initEventListeners();
    loadSalesData();
});

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = 
        Utils.formatDate(now, 'MM. DD (DAY) HH:mm');
}

// 이벤트 리스너 초기화
function initEventListeners() {
    // 기간 선택 버튼
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const period = btn.dataset.period;
            
            if (period === 'custom') {
                openCustomPeriodModal();
            } else {
                selectPeriod(period);
            }
        });
    });
    
    // 탭 전환
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

// 기간 선택
function selectPeriod(period) {
    currentPeriod = period;
    
    // 버튼 활성화
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.period-btn').classList.add('active');
    
    // 기간 텍스트 업데이트
    const periodTexts = {
        'today': '오늘',
        'yesterday': '어제',
        'last7days': '최근 7일',
        'last30days': '최근 30일'
    };
    document.getElementById('selectedPeriodText').textContent = periodTexts[period];
    
    // 데이터 다시 로드
    loadSalesData();
}

// 탭 전환
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'hourly') {
        document.getElementById('hourlyBestMenus').classList.add('active');
    } else {
        document.getElementById('dailyBestMenus').classList.add('active');
        loadDailyBestMenus();
    }
}

// 매출 데이터 로드
function loadSalesData() {
    const { startDate, endDate } = Utils.getDateRange(currentPeriod);
    const salesData = MockDataAPI.getSalesByPeriod(startDate, endDate);
    
    // 요약 카드 업데이트
    document.getElementById('totalSales').textContent = Utils.formatCurrency(salesData.totalSales);
    document.getElementById('totalOrders').textContent = Utils.formatNumber(salesData.totalOrders) + '건';
    document.getElementById('avgOrderAmount').textContent = Utils.formatCurrency(salesData.avgOrderAmount);
    
    // 요일별 매출 차트
    updateSalesByDayChart(salesData.orders);
    
    // 시간대별 매출 차트
    updateSalesByHourChart(salesData.orders);
    
    // 시간대별 베스트 메뉴
    loadHourlyBestMenus(salesData.orders);
    
    // 예상 주문 수
    loadPrediction();
    
    // 월별 비교
    loadMonthComparison();
}

// 요일별 매출 차트
function updateSalesByDayChart(orders) {
    const salesByDay = MockDataAPI.getSalesByDay();
    
    const ctx = document.getElementById('salesByDayChart');
    
    if (salesByDayChart) {
        salesByDayChart.destroy();
    }
    
    salesByDayChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salesByDay.map(d => d.day),
            datasets: [{
                label: '매출액',
                data: salesByDay.map(d => d.sales),
                backgroundColor: 'rgba(255, 107, 53, 0.8)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '매출: ' + Utils.formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'k';
                        }
                    }
                }
            }
        }
    });
}

// 시간대별 매출 차트
function updateSalesByHourChart(orders) {
    const salesByHour = MockDataAPI.getSalesByHour();
    
    const ctx = document.getElementById('salesByHourChart');
    
    if (salesByHourChart) {
        salesByHourChart.destroy();
    }
    
    salesByHourChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: salesByHour.map(d => d.hour),
            datasets: [{
                label: '매출액',
                data: salesByHour.map(d => d.sales),
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '매출: ' + Utils.formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'k';
                        }
                    }
                }
            }
        }
    });
}

// 시간대별 베스트 메뉴
function loadHourlyBestMenus(orders) {
    const timeSlots = [
        { id: 'bestMenus00', start: 0, end: 6 },
        { id: 'bestMenus06', start: 6, end: 12 },
        { id: 'bestMenus12', start: 12, end: 18 },
        { id: 'bestMenus18', start: 18, end: 24 }
    ];
    
    timeSlots.forEach(slot => {
        const bestMenus = MockDataAPI.getBestMenusByHour(slot.start, slot.end);
        const listEl = document.getElementById(slot.id);
        
        if (bestMenus.length === 0) {
            listEl.innerHTML = '<li class="empty">주문 내역이 없습니다</li>';
        } else {
            listEl.innerHTML = bestMenus.map((menu, index) => `
                <li>
                    <span class="menu-rank">${index + 1}</span>
                    <span class="menu-name">${menu.name}</span>
                    <span class="menu-quantity">${menu.quantity}개</span>
                </li>
            `).join('');
        }
    });
}

// 요일별 베스트 메뉴
function loadDailyBestMenus() {
    const days = [
        { id: 'bestMenusMon', day: 1 },
        { id: 'bestMenusTue', day: 2 },
        { id: 'bestMenusWed', day: 3 },
        { id: 'bestMenusThu', day: 4 },
        { id: 'bestMenusFri', day: 5 },
        { id: 'bestMenusSat', day: 6 },
        { id: 'bestMenusSun', day: 0 }
    ];
    
    days.forEach(dayInfo => {
        const bestMenus = MockDataAPI.getBestMenusByDay(dayInfo.day);
        const listEl = document.getElementById(dayInfo.id);
        
        if (bestMenus.length === 0) {
            listEl.innerHTML = '<li class="empty">주문 내역이 없습니다</li>';
        } else {
            listEl.innerHTML = bestMenus.map((menu, index) => `
                <li>
                    <span class="menu-rank">${index + 1}</span>
                    <span class="menu-name">${menu.name}</span>
                    <span class="menu-quantity">${menu.quantity}개</span>
                </li>
            `).join('');
        }
    });
}

// 예상 주문 수
function loadPrediction() {
    const prediction = MockDataAPI.getSalesPrediction();
    
    const ctx = document.getElementById('predictionChart');
    
    if (predictionChart) {
        predictionChart.destroy();
    }
    
    predictionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: prediction.map(p => `${p.date.split('-')[1]}/${p.date.split('-')[2]} (${p.dayName})`),
            datasets: [{
                label: '예상 주문 수',
                data: prediction.map(p => p.predictedOrders),
                backgroundColor: 'rgba(72, 187, 120, 0.8)',
                borderColor: 'rgba(72, 187, 120, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '예상 주문: ' + context.parsed.y + '건';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 월별 비교
function loadMonthComparison() {
    const now = new Date();
    const currentMonth = { year: now.getFullYear(), month: now.getMonth() };
    const lastMonth = { 
        year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
        month: now.getMonth() === 0 ? 11 : now.getMonth() - 1
    };
    
    const comparison = MockDataAPI.getSalesComparison(currentMonth, lastMonth);
    
    // 이번 달 데이터
    document.getElementById('currentMonthSales').textContent = Utils.formatCurrency(comparison.month1.sales);
    document.getElementById('currentMonthOrders').textContent = Utils.formatNumber(comparison.month1.orders) + '건';
    
    // 지난 달 데이터
    document.getElementById('lastMonthSales').textContent = Utils.formatCurrency(comparison.month2.sales);
    document.getElementById('lastMonthOrders').textContent = Utils.formatNumber(comparison.month2.orders) + '건';
    
    // 증감률
    const growthRateEl = document.getElementById('growthRate');
    const growthRateContainer = growthRateEl.closest('.growth-rate');
    
    growthRateEl.textContent = Utils.formatPercent(comparison.growthRate);
    
    if (comparison.growthRate < 0) {
        growthRateContainer.classList.add('negative');
        growthRateContainer.querySelector('i').className = 'fas fa-arrow-down';
    } else {
        growthRateContainer.classList.remove('negative');
        growthRateContainer.querySelector('i').className = 'fas fa-arrow-up';
    }
    
    // 베스트 메뉴
    const currentMonthMenusEl = document.getElementById('currentMonthBestMenus');
    currentMonthMenusEl.innerHTML = comparison.month1.bestMenus.map((menu, index) => `
        <li>
            <span class="menu-rank">${index + 1}</span>
            <span class="menu-name">${menu.name}</span>
            <span class="menu-quantity">${menu.quantity}개</span>
        </li>
    `).join('');
    
    const lastMonthMenusEl = document.getElementById('lastMonthBestMenus');
    lastMonthMenusEl.innerHTML = comparison.month2.bestMenus.map((menu, index) => `
        <li>
            <span class="menu-rank">${index + 1}</span>
            <span class="menu-name">${menu.name}</span>
            <span class="menu-quantity">${menu.quantity}개</span>
        </li>
    `).join('');
}

// 사용자 지정 기간 선택 모달
function openCustomPeriodModal() {
    const modal = document.getElementById('customPeriodModal');
    modal.classList.add('active');
    
    // 기본값 설정 (최근 7일)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    document.getElementById('customStartDate').value = sevenDaysAgo.toISOString().split('T')[0];
    document.getElementById('customEndDate').value = now.toISOString().split('T')[0];
}

function closeCustomPeriodModal() {
    const modal = document.getElementById('customPeriodModal');
    modal.classList.remove('active');
}

function applyCustomPeriod() {
    const startDate = new Date(document.getElementById('customStartDate').value);
    const endDate = new Date(document.getElementById('customEndDate').value);
    
    if (startDate > endDate) {
        Utils.showToast('시작일이 종료일보다 늦습니다', 'error');
        return;
    }
    
    // 사용자 지정 기간으로 설정
    currentPeriod = 'custom';
    
    // 버튼 활성화
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.period === 'custom') {
            btn.classList.add('active');
        }
    });
    
    // 기간 텍스트 업데이트
    document.getElementById('selectedPeriodText').textContent = 
        `${Utils.formatDate(startDate, 'YYYY-MM-DD')} ~ ${Utils.formatDate(endDate, 'YYYY-MM-DD')}`;
    
    // 데이터 로드
    const salesData = MockDataAPI.getSalesByPeriod(startDate, endDate);
    
    // 요약 카드 업데이트
    document.getElementById('totalSales').textContent = Utils.formatCurrency(salesData.totalSales);
    document.getElementById('totalOrders').textContent = Utils.formatNumber(salesData.totalOrders) + '건';
    document.getElementById('avgOrderAmount').textContent = Utils.formatCurrency(salesData.avgOrderAmount);
    
    // 차트 업데이트
    updateSalesByDayChart(salesData.orders);
    updateSalesByHourChart(salesData.orders);
    loadHourlyBestMenus(salesData.orders);
    
    closeCustomPeriodModal();
}

// 뒤로가기
function goBack() {
    window.location.href = 'order-management.html';
}

