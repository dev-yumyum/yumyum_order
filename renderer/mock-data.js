/**
 * 목업 데이터 - 개발 및 테스트용
 */

// 메뉴 데이터
const MOCK_MENUS = {
    main: [
        { id: 1, name: '후라이드 치킨', price: 18000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 2, name: '양념 치킨', price: 19000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 3, name: '간장 치킨', price: 19000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 4, name: '반반 치킨', price: 19000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 5, name: '순살 치킨', price: 20000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 6, name: '파닭', price: 21000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 7, name: '마늘 치킨', price: 20000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 8, name: '핫 치킨', price: 19000, category: 'main', isSoldOut: true, imageUrl: 'assets/icon.png' },
        { id: 9, name: '허니 치킨', price: 20000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 10, name: '레몬 치킨', price: 21000, category: 'main', isSoldOut: false, imageUrl: 'assets/icon.png' }
    ],
    side: [
        { id: 11, name: '감자튀김', price: 3000, category: 'side', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 12, name: '치즈볼', price: 4000, category: 'side', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 13, name: '콜라', price: 2000, category: 'side', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 14, name: '사이다', price: 2000, category: 'side', isSoldOut: false, imageUrl: 'assets/icon.png' },
        { id: 15, name: '떡볶이', price: 5000, category: 'side', isSoldOut: false, imageUrl: 'assets/icon.png' }
    ]
};

// 최근 3개월 주문 데이터 생성
function generateMockOrders() {
    const orders = [];
    const allMenus = [...MOCK_MENUS.main, ...MOCK_MENUS.side];
    const now = new Date();
    
    // 90일간의 데이터 생성
    for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        
        const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일
        
        // 요일별 주문 수 패턴 (주말에 더 많음)
        let ordersPerDay = dayOfWeek === 0 || dayOfWeek === 6 ? 
            Math.floor(Math.random() * 20) + 25 : // 주말: 25-45건
            Math.floor(Math.random() * 15) + 15;  // 평일: 15-30건
        
        // 해당 날짜의 주문 생성
        for (let i = 0; i < ordersPerDay; i++) {
            // 시간대별 주문 패턴
            let hour;
            const rand = Math.random();
            if (rand < 0.15) { // 15% - 오전
                hour = Math.floor(Math.random() * 3) + 9; // 9-11시
            } else if (rand < 0.50) { // 35% - 점심
                hour = Math.floor(Math.random() * 3) + 12; // 12-14시
            } else if (rand < 0.70) { // 20% - 오후
                hour = Math.floor(Math.random() * 3) + 15; // 15-17시
            } else { // 30% - 저녁
                hour = Math.floor(Math.random() * 4) + 18; // 18-21시
            }
            
            const minute = Math.floor(Math.random() * 60);
            const orderTime = new Date(date);
            orderTime.setHours(hour, minute, 0, 0);
            
            // 메뉴 선택 (1-3개)
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let totalAmount = 0;
            
            for (let j = 0; j < itemCount; j++) {
                const menu = allMenus[Math.floor(Math.random() * allMenus.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                items.push({
                    menuId: menu.id,
                    name: menu.name,
                    price: menu.price,
                    quantity: quantity,
                    category: menu.category
                });
                totalAmount += menu.price * quantity;
            }
            
            orders.push({
                id: `ORDER_${orderTime.getTime()}_${i}`,
                customerName: `고객${Math.floor(Math.random() * 100)}`,
                items: items,
                totalAmount: totalAmount,
                orderTime: orderTime.toISOString(),
                dayOfWeek: dayOfWeek,
                hour: hour,
                status: 'completed',
                createdAt: orderTime.toISOString()
            });
        }
    }
    
    return orders;
}

// 기간별 매출 집계
function calculateSalesByPeriod(orders, startDate, endDate) {
    const filtered = orders.filter(order => {
        const orderDate = new Date(order.orderTime);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    const totalSales = filtered.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filtered.length;
    const avgOrderAmount = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    
    return {
        totalSales,
        totalOrders,
        avgOrderAmount,
        orders: filtered
    };
}

// 요일별 매출 집계
function calculateSalesByDay(orders) {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const salesByDay = Array(7).fill(0).map((_, i) => ({ day: dayNames[i], sales: 0, orders: 0 }));
    
    orders.forEach(order => {
        salesByDay[order.dayOfWeek].sales += order.totalAmount;
        salesByDay[order.dayOfWeek].orders += 1;
    });
    
    return salesByDay;
}

// 시간대별 매출 집계
function calculateSalesByHour(orders) {
    const salesByHour = Array(24).fill(0).map((_, i) => ({ 
        hour: `${String(i).padStart(2, '0')}:00`, 
        sales: 0, 
        orders: 0 
    }));
    
    orders.forEach(order => {
        salesByHour[order.hour].sales += order.totalAmount;
        salesByHour[order.hour].orders += 1;
    });
    
    return salesByHour;
}

// 시간대별 베스트 메뉴
function getBestMenusByHour(orders, hourStart, hourEnd) {
    const filtered = orders.filter(order => order.hour >= hourStart && order.hour < hourEnd);
    const menuSales = {};
    
    filtered.forEach(order => {
        order.items.forEach(item => {
            if (!menuSales[item.menuId]) {
                menuSales[item.menuId] = {
                    menuId: item.menuId,
                    name: item.name,
                    quantity: 0,
                    sales: 0
                };
            }
            menuSales[item.menuId].quantity += item.quantity;
            menuSales[item.menuId].sales += item.price * item.quantity;
        });
    });
    
    return Object.values(menuSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
}

// 요일별 베스트 메뉴
function getBestMenusByDay(orders, dayOfWeek) {
    const filtered = orders.filter(order => order.dayOfWeek === dayOfWeek);
    const menuSales = {};
    
    filtered.forEach(order => {
        order.items.forEach(item => {
            if (!menuSales[item.menuId]) {
                menuSales[item.menuId] = {
                    menuId: item.menuId,
                    name: item.name,
                    quantity: 0,
                    sales: 0
                };
            }
            menuSales[item.menuId].quantity += item.quantity;
            menuSales[item.menuId].sales += item.price * item.quantity;
        });
    });
    
    return Object.values(menuSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
}

// 월별 비교 데이터
function getSalesComparison(orders, month1, month2) {
    const month1Data = orders.filter(order => {
        const date = new Date(order.orderTime);
        return date.getFullYear() === month1.year && date.getMonth() === month1.month;
    });
    
    const month2Data = orders.filter(order => {
        const date = new Date(order.orderTime);
        return date.getFullYear() === month2.year && date.getMonth() === month2.month;
    });
    
    const month1Sales = month1Data.reduce((sum, order) => sum + order.totalAmount, 0);
    const month2Sales = month2Data.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const growthRate = month2Sales > 0 ? 
        ((month1Sales - month2Sales) / month2Sales * 100).toFixed(1) : 0;
    
    return {
        month1: {
            sales: month1Sales,
            orders: month1Data.length,
            bestMenus: getBestMenusFromOrders(month1Data)
        },
        month2: {
            sales: month2Sales,
            orders: month2Data.length,
            bestMenus: getBestMenusFromOrders(month2Data)
        },
        growthRate: parseFloat(growthRate)
    };
}

// 주문 데이터에서 베스트 메뉴 추출
function getBestMenusFromOrders(orders) {
    const menuSales = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!menuSales[item.menuId]) {
                menuSales[item.menuId] = {
                    menuId: item.menuId,
                    name: item.name,
                    quantity: 0,
                    sales: 0
                };
            }
            menuSales[item.menuId].quantity += item.quantity;
            menuSales[item.menuId].sales += item.price * item.quantity;
        });
    });
    
    return Object.values(menuSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
}

// 예상 주문 수 계산 (최근 30일 평균 기반)
function getSalesPrediction(orders) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.orderTime);
        return orderDate >= thirtyDaysAgo;
    });
    
    const dailyOrders = {};
    recentOrders.forEach(order => {
        const date = new Date(order.orderTime).toDateString();
        dailyOrders[date] = (dailyOrders[date] || 0) + 1;
    });
    
    const avgOrdersPerDay = Object.values(dailyOrders).reduce((a, b) => a + b, 0) / 30;
    
    // 다음 7일 예측
    const predictions = [];
    for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(now);
        futureDate.setDate(futureDate.getDate() + i);
        const dayOfWeek = futureDate.getDay();
        
        // 요일 패턴 반영
        let prediction = avgOrdersPerDay;
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            prediction *= 1.3; // 주말 30% 증가
        }
        
        predictions.push({
            date: futureDate.toISOString().split('T')[0],
            dayName: ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek],
            predictedOrders: Math.round(prediction)
        });
    }
    
    return predictions;
}

// 운영정보 기본 데이터
const MOCK_OPERATION_INFO = {
    storeInfo: {
        name: '냠냠픽업 강남점',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678'
    },
    operationHours: [
        { day: 0, dayName: '일', enabled: true, startTime: '10:00', endTime: '22:00' },
        { day: 1, dayName: '월', enabled: true, startTime: '10:00', endTime: '22:00' },
        { day: 2, dayName: '화', enabled: true, startTime: '10:00', endTime: '22:00' },
        { day: 3, dayName: '수', enabled: true, startTime: '10:00', endTime: '22:00' },
        { day: 4, dayName: '목', enabled: true, startTime: '10:00', endTime: '22:00' },
        { day: 5, dayName: '금', enabled: true, startTime: '10:00', endTime: '23:00' },
        { day: 6, dayName: '토', enabled: true, startTime: '10:00', endTime: '23:00' }
    ],
    regularHolidays: [],
    temporaryHolidays: [],
    breakTime: {
        enabled: false,
        startTime: '15:00',
        endTime: '17:00'
    }
};

// 목업 데이터 API
const MockDataAPI = {
    // 메뉴 조회
    getMenus: () => ({ ...MOCK_MENUS }),
    getMainMenus: () => MOCK_MENUS.main,
    getSideMenus: () => MOCK_MENUS.side,
    
    // 메뉴 품절 상태 업데이트
    updateMenuStatus: (menuId, isSoldOut) => {
        const allMenus = [...MOCK_MENUS.main, ...MOCK_MENUS.side];
        const menu = allMenus.find(m => m.id === menuId);
        if (menu) {
            menu.isSoldOut = isSoldOut;
            // localStorage에 저장
            localStorage.setItem('menuSoldOutStatus', JSON.stringify(
                allMenus.reduce((acc, m) => ({ ...acc, [m.id]: m.isSoldOut }), {})
            ));
            return true;
        }
        return false;
    },
    
    // 주문 데이터
    getOrders: () => {
        if (!window._mockOrders) {
            window._mockOrders = generateMockOrders();
        }
        return window._mockOrders;
    },
    
    // 매출 통계
    getSalesByPeriod: (startDate, endDate) => {
        const orders = MockDataAPI.getOrders();
        return calculateSalesByPeriod(orders, startDate, endDate);
    },
    
    getSalesByDay: () => {
        const orders = MockDataAPI.getOrders();
        return calculateSalesByDay(orders);
    },
    
    getSalesByHour: () => {
        const orders = MockDataAPI.getOrders();
        return calculateSalesByHour(orders);
    },
    
    getBestMenusByHour: (hourStart, hourEnd) => {
        const orders = MockDataAPI.getOrders();
        return getBestMenusByHour(orders, hourStart, hourEnd);
    },
    
    getBestMenusByDay: (dayOfWeek) => {
        const orders = MockDataAPI.getOrders();
        return getBestMenusByDay(orders, dayOfWeek);
    },
    
    getSalesComparison: (month1, month2) => {
        const orders = MockDataAPI.getOrders();
        return getSalesComparison(orders, month1, month2);
    },
    
    getSalesPrediction: () => {
        const orders = MockDataAPI.getOrders();
        return getSalesPrediction(orders);
    },
    
    // 운영정보
    getOperationInfo: () => {
        const saved = localStorage.getItem('operationInfo');
        return saved ? JSON.parse(saved) : MOCK_OPERATION_INFO;
    },
    
    saveOperationInfo: (data) => {
        localStorage.setItem('operationInfo', JSON.stringify(data));
        return true;
    }
};

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.MockDataAPI = MockDataAPI;
}



