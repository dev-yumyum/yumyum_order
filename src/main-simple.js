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

// 영수증 HTML 생성
function generateReceiptHtml(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Courier New', monospace;
          width: 80mm;
          margin: 0;
          padding: 10mm;
          font-size: 12px;
        }
        .header {
          text-align: center;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
        }
        .info {
          margin: 10px 0;
          font-size: 11px;
        }
        .items {
          margin: 15px 0;
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .total {
          font-weight: bold;
          font-size: 14px;
          margin-top: 10px;
          text-align: right;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">${data.storeName || 'YumYum 매장'}</div>
      <div class="info">
        <div>주문번호: ${data.orderId}</div>
        <div>일시: ${data.date}</div>
      </div>
      <div class="items">
        ${data.items.map(item => `
          <div class="item">
            <span>${item.name} x ${item.quantity}</span>
            <span>${item.price.toLocaleString()}원</span>
          </div>
        `).join('')}
      </div>
      <div class="total">
        합계: ${data.total.toLocaleString()}원
      </div>
      <div class="info">
        결제방법: ${data.paymentMethod || '현금'}
      </div>
      <div class="footer">
        감사합니다<br>
        YumYum Order System
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
