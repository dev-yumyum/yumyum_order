/**
 * 웹 환경용 어댑터
 * Electron API를 웹 API로 대체
 */

// Electron 환경 감지
const isElectron = typeof require !== 'undefined' && typeof window !== 'undefined' && typeof window.process === 'object';

let electronAPI = null;

// Electron 환경이면 ipcRenderer 로드
if (isElectron) {
    try {
        const { ipcRenderer } = require('electron');
        electronAPI = ipcRenderer;
    } catch (error) {
        console.warn('Electron API 로드 실패:', error);
    }
}

// 웹 환경용 API 어댑터
const WebAdapter = {
    // 프린터 목록 가져오기
    async getPrinters() {
        if (electronAPI) {
            return await electronAPI.invoke('get-printers');
        }
        // 웹 환경에서는 빈 배열 반환
        console.warn('웹 환경에서는 프린터 기능을 사용할 수 없습니다.');
        return [];
    },

    // 프린터 확인
    async checkPrinter(printerName) {
        if (electronAPI) {
            return await electronAPI.invoke('check-printer', printerName);
        }
        // 웹 환경에서는 false 반환
        return false;
    },

    // 영수증 인쇄
    async printReceipt(printerName, receiptData) {
        if (electronAPI) {
            return await electronAPI.invoke('print-receipt', printerName, receiptData);
        }
        // 웹 환경에서는 브라우저 인쇄 대화상자 사용
        console.log('웹 환경: 브라우저 인쇄 기능 사용');
        window.print();
        return { success: true, message: '브라우저 인쇄 대화상자가 열렸습니다.' };
    },

    // 시리얼 포트 목록 조회
    async getSerialPorts() {
        if (electronAPI) {
            return await electronAPI.invoke('get-serial-ports');
        }
        // 웹 환경에서는 빈 배열 반환
        console.warn('웹 환경에서는 시리얼 포트 기능을 사용할 수 없습니다.');
        return { success: true, ports: [], message: '웹 환경에서는 시리얼 포트를 사용할 수 없습니다.' };
    },

    // 오디오 파일 경로 가져오기
    async getAudioPath(fileName) {
        if (electronAPI) {
            return await electronAPI.invoke('get-audio-path', fileName);
        }
        // 웹 환경에서는 상대 경로 반환
        return { 
            success: true, 
            path: `./assets/sounds/${fileName}` 
        };
    },

    // 시스템 알림 표시
    async showNotification(options) {
        if (electronAPI) {
            return await electronAPI.invoke('show-notification', options);
        }
        
        // 웹 환경에서는 브라우저 Notification API 사용
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(options.title || 'YumYum 주문 관리', {
                    body: options.body || '',
                    icon: './assets/icon.png',
                    silent: options.silent || false
                });
                return { success: true };
            } else if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification(options.title || 'YumYum 주문 관리', {
                        body: options.body || '',
                        icon: './assets/icon.png',
                        silent: options.silent || false
                    });
                    return { success: true };
                }
            }
        }
        
        // 알림 권한이 없으면 콘솔에 로그
        console.log('알림:', options.title, options.body);
        return { success: false, error: '알림 권한이 없습니다.' };
    },

    // 앱 종료 (웹에서는 탭 닫기)
    closeApp() {
        if (electronAPI) {
            electronAPI.send('close-app');
        } else {
            window.close();
        }
    },

    // 이벤트 리스너 등록
    on(channel, callback) {
        if (electronAPI) {
            electronAPI.on(channel, callback);
        } else {
            // 웹 환경에서는 CustomEvent 사용
            window.addEventListener(channel, (e) => {
                callback(e, e.detail);
            });
        }
    },

    // 이벤트 리스너 제거
    off(channel, callback) {
        if (electronAPI) {
            electronAPI.removeListener(channel, callback);
        } else {
            window.removeEventListener(channel, callback);
        }
    },

    // 커스텀 이벤트 발생 (웹 환경용)
    emit(channel, data) {
        if (!electronAPI) {
            const event = new CustomEvent(channel, { detail: data });
            window.dispatchEvent(event);
        }
    }
};

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.WebAdapter = WebAdapter;
    
    // Electron 환경인지 웹 환경인지 표시
    window.isElectron = isElectron;
    console.log(`실행 환경: ${isElectron ? 'Electron' : 'Web'}`);
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebAdapter;
}
