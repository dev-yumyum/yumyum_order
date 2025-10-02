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
