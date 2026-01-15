/**
 * 메뉴 품절관리 JavaScript
 */

let menus = { main: [], side: [] };
let currentTab = 'main';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadMenus();
    updateSoldOutCount();
});

// 메뉴 로드
function loadMenus() {
    menus = MockDataAPI.getMenus();
    
    // localStorage에서 품절 상태 불러오기
    const savedStatus = localStorage.getItem('menuSoldOutStatus');
    if (savedStatus) {
        const statusObj = JSON.parse(savedStatus);
        
        menus.main.forEach(menu => {
            if (statusObj[menu.id] !== undefined) {
                menu.isSoldOut = statusObj[menu.id];
            }
        });
        
        menus.side.forEach(menu => {
            if (statusObj[menu.id] !== undefined) {
                menu.isSoldOut = statusObj[menu.id];
            }
        });
    }
    
    renderMenus();
}

// 메뉴 렌더링
function renderMenus() {
    renderMainMenus();
    renderSideMenus();
    updateSoldOutCount();
}

// 메인 메뉴 렌더링
function renderMainMenus() {
    const grid = document.getElementById('mainMenuGrid');
    
    if (menus.main.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #a0aec0; padding: 40px;">등록된 메뉴가 없습니다</p>';
        return;
    }
    
    grid.innerHTML = menus.main.map(menu => createMenuCard(menu)).join('');
}

// 사이드 메뉴 렌더링
function renderSideMenus() {
    const grid = document.getElementById('sideMenuGrid');
    
    if (menus.side.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #a0aec0; padding: 40px;">등록된 메뉴가 없습니다</p>';
        return;
    }
    
    grid.innerHTML = menus.side.map(menu => createMenuCard(menu)).join('');
}

// 메뉴 카드 생성
function createMenuCard(menu) {
    return `
        <div class="menu-card ${menu.isSoldOut ? 'soldout' : ''}" id="menu-${menu.id}">
            <div class="menu-image">
                <i class="fas fa-utensils"></i>
            </div>
            <div class="menu-info">
                <div class="menu-name">${menu.name}</div>
                <div class="menu-price">${Utils.formatCurrency(menu.price)}</div>
                <div class="menu-toggle">
                    <span class="toggle-label">${menu.isSoldOut ? '품절' : '판매중'}</span>
                    <div class="toggle-switch ${menu.isSoldOut ? 'soldout' : ''}" 
                         onclick="toggleSoldOut(${menu.id})">
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 품절 토글
function toggleSoldOut(menuId) {
    const allMenus = [...menus.main, ...menus.side];
    const menu = allMenus.find(m => m.id === menuId);
    
    if (!menu) return;
    
    menu.isSoldOut = !menu.isSoldOut;
    
    // 상태 저장
    MockDataAPI.updateMenuStatus(menuId, menu.isSoldOut);
    
    // UI 업데이트
    const card = document.getElementById(`menu-${menuId}`);
    const toggle = card.querySelector('.toggle-switch');
    const label = card.querySelector('.toggle-label');
    
    if (menu.isSoldOut) {
        card.classList.add('soldout');
        toggle.classList.add('soldout');
        label.textContent = '품절';
    } else {
        card.classList.remove('soldout');
        toggle.classList.remove('soldout');
        label.textContent = '판매중';
    }
    
    updateSoldOutCount();
}

// 탭 전환
function switchTab(tab) {
    currentTab = tab;
    
    // 탭 버튼 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    // 탭 컨텐츠 표시
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'main') {
        document.getElementById('mainMenuTab').classList.add('active');
    } else {
        document.getElementById('sideMenuTab').classList.add('active');
    }
}

// 전체 품절/판매
function setSoldOutAll(isSoldOut) {
    const targetMenus = currentTab === 'main' ? menus.main : menus.side;
    
    targetMenus.forEach(menu => {
        menu.isSoldOut = isSoldOut;
        MockDataAPI.updateMenuStatus(menu.id, isSoldOut);
    });
    
    renderMenus();
    
    const message = isSoldOut ? '모든 메뉴가 품절 처리되었습니다' : '모든 메뉴가 판매 재개되었습니다';
    Utils.showToast(message, 'success');
}

// 품절 개수 업데이트
function updateSoldOutCount() {
    const allMenus = [...menus.main, ...menus.side];
    const soldOutCount = allMenus.filter(m => m.isSoldOut).length;
    document.getElementById('soldoutCount').textContent = `품절: ${soldOutCount}개`;
}

// 뒤로가기
function goBack() {
    window.location.href = 'order-management.html';
}





