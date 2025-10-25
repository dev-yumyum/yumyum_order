// 로그인 폼 제출 처리
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const storeCode = document.getElementById('storeCode').value.trim();
    const password = document.getElementById('password').value.trim();
    const autoLogin = document.getElementById('autoLogin').checked;
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = e.target.querySelector('.btn-login');
    
    // 에러 메시지 숨기기
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
    
    // 로딩 상태 표시
    loginBtn.classList.add('loading');
    loginBtn.textContent = '';
    
    try {
        // 간단한 로컬 인증 (실제 프로덕션에서는 백엔드 API 호출)
        const isValid = await validateLogin(storeCode, password);
        
        if (isValid) {
            // 로그인 정보 저장
            const loginData = {
                storeCode: storeCode,
                loginTime: new Date().toISOString(),
                autoLogin: autoLogin
            };
            
            localStorage.setItem('yumyum_auth', JSON.stringify(loginData));
            
            if (autoLogin) {
                localStorage.setItem('yumyum_auto_login', 'true');
            }
            
            // 성공 메시지 표시 후 메인 화면으로 이동
            showSuccessAndRedirect();
        } else {
            throw new Error('가게 코드 또는 비밀번호가 올바르지 않습니다.');
        }
    } catch (error) {
        // 에러 처리
        loginBtn.classList.remove('loading');
        loginBtn.textContent = '로그인';
        errorMessage.textContent = error.message;
        errorMessage.classList.add('show');
    }
});

// 로그인 검증 (임시 - 실제로는 백엔드 API 호출)
async function validateLogin(storeCode, password) {
    // 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 로컬 스토리지에서 저장된 가게 정보 확인
    const storedAccounts = JSON.parse(localStorage.getItem('yumyum_accounts') || '[]');
    
    // 기본 계정 (개발용)
    const defaultAccounts = [
        { storeCode: 'yumyum', password: '1234' },
        { storeCode: 'admin', password: 'admin' },
        { storeCode: 'test', password: 'test' }
    ];
    
    const allAccounts = [...defaultAccounts, ...storedAccounts];
    
    // 계정 확인
    return allAccounts.some(account => 
        account.storeCode === storeCode && account.password === password
    );
}

// 성공 메시지 표시 후 리다이렉트
function showSuccessAndRedirect() {
    const loginBtn = document.querySelector('.btn-login');
    loginBtn.classList.remove('loading');
    loginBtn.textContent = '로그인 성공!';
    loginBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    
    setTimeout(() => {
        window.location.href = 'order-management.html';
    }, 500);
}

// 페이지 로드 시 자동 로그인 확인
window.addEventListener('DOMContentLoaded', () => {
    const autoLogin = localStorage.getItem('yumyum_auto_login');
    const authData = localStorage.getItem('yumyum_auth');
    
    if (autoLogin === 'true' && authData) {
        const auth = JSON.parse(authData);
        // 로그인 후 24시간 이내인지 확인
        const loginTime = new Date(auth.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
            // 자동 로그인으로 메인 화면으로 이동
            window.location.href = 'order-management.html';
        } else {
            // 24시간이 지났으면 자동 로그인 해제
            localStorage.removeItem('yumyum_auto_login');
        }
    }
});

// Enter 키 처리
document.getElementById('storeCode').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('password').focus();
    }
});

document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});

