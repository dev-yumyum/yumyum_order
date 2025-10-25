/**
 * YumYum Order Management - Electron Main Process
 * Windows 데스크톱 애플리케이션 메인 프로세스
 */

const { app, BrowserWindow, Menu, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
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
    icon: path.join(__dirname, '../assets/icon.ico'), // 아이콘 경로
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: false, // 준비가 완료되면 표시
    autoHideMenuBar: !isDev, // 개발 모드가 아니면 메뉴바 숨김
    titleBarStyle: 'default'
  });

  // HTML 파일 로드 - 로그인 화면부터 시작
  const htmlPath = path.join(__dirname, '../renderer/login.html');
  mainWindow.loadFile(htmlPath);

  // 윈도우 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
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

  // 시리얼 포트 목록 조회
  ipcMain.handle('get-serial-ports', async () => {
    try {
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
      return { success: false, error: error.message };
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
        icon: path.join(__dirname, '../assets/icon.ico'),
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
