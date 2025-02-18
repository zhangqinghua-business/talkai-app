import { app, BaseWindow, BrowserWindow, ipcMain, screen, shell } from 'electron';
import path from 'path';
import { getWeibo } from './src/weiboAuth';
import { getXiaohongshuAuth } from './src/xiaohongshuAuth';

const getCookie = async (mainWindow: BaseWindow, type: 'weibo' | 'xiaohongshu', params?: any, ) => {
  console.log('请求获取cookie: ', type);
  if (type === 'weibo') {
    return getWeibo(mainWindow, params)
  }
  if (type === 'xiaohongshu') {
    return getXiaohongshuAuth(mainWindow, params)
  }
}

const createWindow = async () => {
  // 1. 创建一个窗口
  const mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: Math.min(screen.getAllDisplays()[0].size.width * 0.95, 1700) ,
    height: Math.min(screen.getAllDisplays()[0].size.height, 1440),
    backgroundColor: 'blueviolet',
    autoHideMenuBar: true,  // 隐藏菜单栏，仅针对win平台
    webPreferences: {
      preload: path.resolve(__dirname, './src/preload.js')
    }
  })

  // 2. 配置控制台快捷键
  // globalShortcut.register('f12', function () {
  //   mainWindow?.webContents.openDevTools({ mode: 'bottom' })
  // })

  // 3. 使用浏览器打开链接（文档，下载链接之类的）
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  })

  // 4. 监听推送平台绑定事件
  ipcMain.handle('getCookie', (_, type, params) => getCookie(mainWindow, type, params))

  // 5. 加载链接
  // mainWindow?.loadURL('http://localhost:3000')
  // mainWindow?.loadURL('https://zdh.sourceai.top/home')
  // mainWindow?.loadURL('https://chat.xiaoniaoai.com/home')
  // mainWindow?.loadURL('https://ai.top911.cn/home')
  // mainWindow?.loadURL('https://test.xiaoniaoai.com/home')
  // mainWindow?.loadURL('https://ai.zmt.cool/home')
  // mainWindow?.loadURL('https://juyunapp.cn/home')
  // mainWindow?.loadURL('https://ai.mabbk.cn/home')
  // mainWindow?.loadURL('https://vipai.m3xm.cn/home')
  // mainWindow?.loadURL('https://xiaoniaoai.yunjiazd.com/home')
  mainWindow?.loadURL(process.env.HOME_PAGE || 'https://chat.xiaoniaoai.com/home')
}

// 创建窗口
app.on('ready', createWindow);

// 如果没有窗口打开则打开一个窗口 (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// 关闭所有窗口时退出应用 (Windows & Linux & macOS)
app.on('window-all-closed', () => {
  app.quit()
})