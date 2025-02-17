const { app, screen, BrowserWindow, globalShortcut } = require("electron");

app.on('ready', () => {

  const top = new BrowserWindow()
  const child = new BrowserWindow({ parent: top, modal: true })
  child.show()
  top.show()
})

// app.on('ready', () => {
//   // 配置控制台快捷键
//   globalShortcut.register('f12', function () {
//     win.webContents.openDevTools({ mode: 'bottom' })
//   })

    
//   const win = new BrowserWindow({
//     x: 0,
//     y: 0,
//     width: screen.getAllDisplays()[0].size.width / 2,
//     height: screen.getAllDisplays()[0].size.height,
//     autoHideMenuBar: true,
//     webPreferences: {
//       partition: 'no-cache',
//       nodeIntegration: true
//     }
//   })

//   win.setBackgroundColor('hsl(230, 100%, 50%)')
//   win.setBackgroundColor('rgb(255, 145, 145)')
//   win.setBackgroundColor('#ff00a3')
//   win.setBackgroundColor('blueviolet')

//   // win.webContents.session.clearCache()
//   win.webContents.loadURL('https://creator.xiaohongshu.com/login?source=official')


//   /**
//    * 处理链接跳转
//    */
//   win.webContents.on('will-navigate', async (e, url) => {
//     if (url !== 'https://creator.xiaohongshu.com/new/home') {
//       return
//     }
//     // e.preventDefault()
//     console.log('url: ', url);
//     // 获取 cookie
//     const cookies = await win.webContents.session.cookies.get({ url: 'https://creator.xiaohongshu.com' })
//     console.log('------------------>cookies',  cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '))
//     // console.log(cookies);
//   })


//   /**
//    * 处理 window.open 跳转
//    */
//   win.webContents.setWindowOpenHandler((data) => {
//     console.log('setWindowOpenHandler');
//   })
// })


// 如果没有窗口打开则打开一个窗口 (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// 关闭所有窗口时退出应用 (Windows & Linux & macOS)
app.on('window-all-closed', () => {
  app.quit()
})

const createWindow = () => {
  console.log('--------------> createWindow');
  
}

/**
 * 获取小红书授权
 * 1. 打开一个小红书登录窗口
 * 2. 用户扫描，拦截登录事件
 * 3. 读取cookie
 * 4. 退出登录窗口，返回cookie
 */
const loadXiaohongshuConfig = () => {

}