/**
 * YumYum Order Management - Electron Main Process
 * Windows 데스크톱 애플리케이션 메인 프로세스
 */

const { app, BrowserWindow, Menu, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');

// SerialPort를 안전하게 로드 (선택적 의존성)
let SerialPort = null;
try {
  SerialPort = require('serialport').SerialPort;
} catch (error) {
  console.warn('SerialPort 모듈을 로드할 수 없습니다. 시리얼 포트 기능이 비활성화됩니다.', error.message);
}

const isDev = process.env.NODE_ENV === 'development';

// YumYum 애플리케이션 로직
const YumYumApp = require('./app');
const orderApp = new YumYumApp();

let mainWindow = null;

// 메인 윈도우 생성
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'YumYum 주문 접수 시스템',
    icon: path.join(__dirname, '../assets/icon.png'), // 아이콘 경로
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: true, // 즉시 표시
    autoHideMenuBar: !isDev, // 개발 모드가 아니면 메뉴바 숨김
    titleBarStyle: 'default'
  });

  // HTML 파일 로드 - 로그인 화면부터 시작
  const htmlPath = path.join(__dirname, '../renderer/login.html');
  mainWindow.loadFile(htmlPath);

  // 윈도우 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus(); // 창을 앞으로 가져오기
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 윈도우 닫기 이벤트
  mainWindow.on('closed', () => {
    mainWindow = null;
    orderApp.shutdown();
  });

  // 외부 링크는 기본 브라우저에서 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 애플리케이션 메뉴 설정
function createMenu() {
  const template = [
    {
      label: '파일',
      submenu: [
        {
          label: '새 주문',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-order');
          }
        },
        { type: 'separator' },
        {
          label: '주문 내역 저장',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: '주문 내역 저장',
              defaultPath: `주문내역_${new Date().toISOString().slice(0, 10)}.json`,
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-save-orders', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: '종료',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '주문',
      submenu: [
        {
          label: '주문 접수',
          accelerator: 'F1',
          click: () => {
            mainWindow.webContents.send('menu-take-order');
          }
        },
        {
          label: '주문 조회',
          accelerator: 'F2',
          click: () => {
            mainWindow.webContents.send('menu-view-orders');
          }
        },
        {
          label: '주문 상태 변경',
          accelerator: 'F3',
          click: () => {
            mainWindow.webContents.send('menu-update-status');
          }
        }
      ]
    },
    {
      label: '도움말',
      submenu: [
        {
          label: '정보',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'YumYum 주문 접수 시스템',
              message: 'YumYum Order Management System',
              detail: 'Version 1.0.0\n윈도우용 주문 접수 프로그램\n\n개발자: DoWon Jung'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC 통신 핸들러들
function setupIpcHandlers() {
  // 주문 추가
  ipcMain.handle('add-order', async (event, orderData) => {
    try {
      const order = orderApp.addOrder(orderData);
      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 모든 주문 조회
  ipcMain.handle('get-all-orders', async () => {
    try {
      const orders = orderApp.getAllOrders();
      return { success: true, orders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 주문 상태 업데이트
  ipcMain.handle('update-order-status', async (event, orderId, status) => {
    try {
      const order = orderApp.updateOrderStatus(orderId, status);
      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 주문 조회
  ipcMain.handle('get-order', async (event, orderId) => {
    try {
      const order = orderApp.getOrder(orderId);
      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 프린터 목록 가져오기
  ipcMain.handle('get-printers', async () => {
    try {
      if (!mainWindow) {
        return [];
      }
      // getPrintersAsync() 사용 (deprecated 경고 해결)
      const printers = await mainWindow.webContents.getPrintersAsync();
      return printers;
    } catch (error) {
      console.error('프린터 목록 가져오기 실패:', error);
      return [];
    }
  });

  // 프린터 연결 확인
  ipcMain.handle('check-printer', async (event, printerName) => {
    try {
      if (!mainWindow) {
        return false;
      }
      // getPrintersAsync() 사용 (deprecated 경고 해결)
      const printers = await mainWindow.webContents.getPrintersAsync();
      const printer = printers.find(p => p.name === printerName);
      return printer ? printer.status === 0 : false;
    } catch (error) {
      console.error('프린터 연결 확인 실패:', error);
      return false;
    }
  });

  // 영수증 인쇄
  ipcMain.handle('print-receipt', async (event, printerName, receiptData) => {
    try {
      // 영수증 HTML 생성
      const receiptHtml = generateReceiptHtml(receiptData);
      
      // 인쇄 옵션
      const options = {
        silent: true,
        deviceName: printerName,
        margins: {
          marginType: 'none'
        },
        pageSize: {
          width: 80000, // 80mm in microns
          height: 297000 // A4 height for auto-cut
        }
      };

      // BrowserWindow를 사용하여 인쇄
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false
        }
      });

      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHtml)}`);
      await printWindow.webContents.print(options);
      printWindow.close();

      return { success: true };
    } catch (error) {
      console.error('인쇄 실패:', error);
      return { success: false, error: error.message };
    }
  });

  // 시리얼 포트 목록 조회
  ipcMain.handle('get-serial-ports', async () => {
    try {
      if (!SerialPort) {
        console.warn('SerialPort 모듈을 사용할 수 없습니다.');
        return { 
          success: true, 
          ports: [],
          message: 'SerialPort 기능을 사용할 수 없습니다.'
        };
      }
      
      const ports = await SerialPort.list();
      return { 
        success: true, 
        ports: ports.map(port => ({
          path: port.path,
          manufacturer: port.manufacturer,
          serialNumber: port.serialNumber,
          productId: port.productId,
          vendorId: port.vendorId
        }))
      };
    } catch (error) {
      console.error('시리얼 포트 조회 오류:', error);
      return { success: false, error: error.message, ports: [] };
    }
  });

  // 오디오 파일 경로 가져오기
  ipcMain.handle('get-audio-path', async (event, fileName) => {
    try {
      const fs = require('fs');
      
      // 여러 가능한 경로 확인
      const possiblePaths = [
        path.join(__dirname, '../assets/sounds', fileName),
        path.join(process.resourcesPath, 'app.asar.unpacked/assets/sounds', fileName),
        path.join(process.resourcesPath, 'assets/sounds', fileName)
      ];
      
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          console.log('오디오 파일 찾음:', testPath);
          return { success: true, path: testPath };
        }
      }
      
      console.error('오디오 파일을 찾을 수 없음:', fileName);
      return { success: false, error: '파일을 찾을 수 없습니다' };
    } catch (error) {
      console.error('오디오 경로 조회 오류:', error);
      return { success: false, error: error.message };
    }
  });

  // 시스템 알림 표시
  ipcMain.handle('show-notification', async (event, options) => {
    try {
      const notification = new Notification({
        title: options.title || 'YumYum 주문 관리',
        body: options.body || '',
        icon: path.join(__dirname, '../assets/icon.png'),
        silent: options.silent || false,
        urgency: 'critical', // macOS에서 중요 알림으로 표시
        timeoutType: 'default'
      });

      notification.show();

      // 알림 클릭 시 윈도우 포커스
      notification.on('click', () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.focus();
          mainWindow.show();
          
          // 주문 ID가 있으면 해당 주문으로 이동
          if (options.orderId) {
            mainWindow.webContents.send('notification-clicked', options.orderId);
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('시스템 알림 표시 오류:', error);
      return { success: false, error: error.message };
    }
  });
}

// 연락처 중간 4자리 마스킹 함수
function maskPhoneNumber(phone) {
  if (!phone) return '';
  // 010-1234-5678 -> 010-****-5678
  return phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3');
}

// 날짜 포맷 함수 (년 월 일 시 분)
function formatDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
}

// 영수증 HTML 생성
function generateReceiptHtml(data) {
  const orderDateTime = formatDateTime(data.orderTime || new Date());
  const maskedPhone = maskPhoneNumber(data.customerPhone);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
          width: 72mm;
          margin: 0;
          padding: 4mm;
          font-size: 11px;
          line-height: 1.4;
        }
        .receipt-header {
          text-align: center;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 2px solid #000;
        }
        .store-info {
          text-align: center;
          font-size: 10px;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #000;
        }
        .order-info {
          margin: 8px 0;
          font-size: 10px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .info-label {
          font-weight: bold;
          width: 70px;
        }
        .info-value {
          flex: 1;
          text-align: right;
        }
        .section-divider {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .items-section {
          margin: 10px 0;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
          font-size: 10px;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          width: 40px;
          text-align: center;
        }
        .item-price {
          width: 70px;
          text-align: right;
        }
        .total-section {
          margin: 10px 0;
          padding: 8px 0;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 14px;
        }
        .requests-section {
          margin: 10px 0;
          padding: 8px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          font-size: 10px;
        }
        .requests-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #000;
          font-size: 9px;
        }
        .company-info {
          margin: 3px 0;
        }
      </style>
    </head>
    <body>
      <!-- 헤더 -->
      <div class="receipt-header">주문 영수증</div>
      
      <!-- 상점 정보 -->
      <div class="store-info">
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">
          ${data.storeName || '냠냠픽업 가맹점'}
        </div>
        <div>${data.storeAddress || '서울시 강남구 테헤란로 123'}</div>
      </div>
      
      <!-- 주문 정보 -->
      <div class="order-info">
        <div class="info-row">
          <span class="info-label">주문시간</span>
          <span class="info-value">${orderDateTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">주문유형</span>
          <span class="info-value">${data.orderType || '포장'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">고객명</span>
          <span class="info-value">${data.customerName || '-'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">연락처</span>
          <span class="info-value">${maskedPhone}</span>
        </div>
      </div>
      
      <div class="section-divider"></div>
      
      <!-- 주문 메뉴 -->
      <div class="items-section">
        <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px;">주문 내역</div>
        ${(data.items || []).map(item => `
          <div class="item-row">
            <span class="item-name">${item.name}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">${(item.price * item.quantity).toLocaleString()}원</span>
          </div>
        `).join('')}
      </div>
      
      <!-- 합계 금액 -->
      <div class="total-section">
        <div class="total-row">
          <span>합계금액</span>
          <span>${(data.totalAmount || 0).toLocaleString()}원</span>
        </div>
      </div>
      
      <!-- 요청사항 -->
      ${data.requests ? `
        <div class="requests-section">
          <div class="requests-title">요청사항</div>
          <div>${data.requests}</div>
        </div>
      ` : ''}
      
      <!-- 하단 정보 -->
      <div class="footer">
        <div style="font-weight: bold; margin-bottom: 6px;">감사합니다</div>
        <div class="company-info">냠냠픽업</div>
        <div class="company-info">사업자번호: 123-45-67890 (임시)</div>
        <div class="company-info">대표자: 홍길동</div>
        <div style="margin-top: 6px; font-size: 8px;">
          본 영수증은 거래내역 확인용입니다
        </div>
      </div>
    </body>
    </html>
  `;
}

// 애플리케이션 이벤트 핸들러
app.whenReady().then(() => {
  console.log('YumYum 주문 접수 시스템 시작 중...');
  
  // 주문 애플리케이션 초기화
  orderApp.initialize();
  
  // 메인 윈도우 생성
  createMainWindow();
  
  // 메뉴 생성
  createMenu();
  
  // IPC 핸들러 설정
  setupIpcHandlers();

  console.log('YumYum 주문 접수 시스템이 시작되었습니다.');
});

// 모든 윈도우가 닫혔을 때
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 앱이 활성화될 때 (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// 앱 종료 전
app.on('before-quit', () => {
  if (orderApp) {
    orderApp.shutdown();
  }
});

// 예외 처리
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('오류 발생', `예상치 못한 오류가 발생했습니다:\n${error.message}`);
});

module.exports = { mainWindow, orderApp };
