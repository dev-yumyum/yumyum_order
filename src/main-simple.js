/**
 * YumYum 주문 접수 시스템 - 메인 프로세스
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
const YumYumApp = require('./app');
const appInstance = new YumYumApp();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/order-management.html'));
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC 핸들러 설정
function setupIpcHandlers() {
  appInstance.initialize();
  
  // 주문 추가
  ipcMain.handle('add-order', async (event, orderData) => {
    try {
      const order = appInstance.addOrder(orderData);
      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // 모든 주문 조회
  ipcMain.handle('get-all-orders', async () => {
    try {
      const orders = appInstance.getAllOrders();
      return { success: true, orders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // 특정 주문 조회
  ipcMain.handle('get-order', async (event, orderId) => {
    try {
      const order = appInstance.getOrder(orderId);
      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // 주문 상태 업데이트
  ipcMain.handle('update-order-status', async (event, orderId, status) => {
    try {
      const order = appInstance.updateOrderStatus(orderId, status);
      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 프린터 목록 가져오기
  ipcMain.handle('get-printers', async () => {
    try {
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

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    appInstance.shutdown();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log('YumYum Order Management System starting...');
