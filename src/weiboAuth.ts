import { BaseWindow, BrowserWindow, globalShortcut } from "electron";

/**
 * 获取小红书授权
 * 1. 打开一个小红书登录窗口
 * 2. 用户扫描，拦截登录事件
 * 3. 读取cookie
 * 4. 退出登录窗口，返回cookie
 */
export const getWeibo = ( parent: BaseWindow, params?: any): Promise<Record<string, string> | undefined>  => {
  return new Promise(( resolve, reject) => {

    // 计算父窗口的中心点
    const parentCenterX = parent.getBounds().x + parent.getBounds().width / 2;
    const parentCenterY = parent.getBounds().y + parent.getBounds().height / 2;


    // 子窗口的尺寸
    const width = 1050;
    const height = 850;

    // 计算子窗口的起始点，使其在父窗口的中心(需要转成整数，否则会不准的)
    const x = parseInt(parentCenterX - width / 2 + '');
    const y = parseInt(parentCenterY - height / 2 + '');


    // 1. 创建窗口
    const win = new BrowserWindow({
      parent: parent,
      x: x, y: y, width: width, height: height,
      autoHideMenuBar: true,

      // 禁止使用缓存
      webPreferences: {
        partition: 'no-cache',
        nodeIntegration: true,
      }
    })

    globalShortcut.register('f12', function () {
      win?.webContents.openDevTools({ mode: 'bottom' })
    })
    
    // 2. 打开微博登录页
    win.webContents.loadURL('https://passport.weibo.com/sso/signin');

    // 3. 监听所有网络请求，判断是否登录成功
    win.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
      console.log('onBeforeRequest: ', details.method, details.url)
      if (details.url !== 'https://weibo.com/') {
        callback({ cancel: false })
        return
      }
      
      const cookie = (await win.webContents.session.cookies.get({ url: 'https://weibo.com' })).map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
      console.log('cookie: ', cookie)
      // 回调
      resolve({ cookie: cookie })
      // 关闭窗口
      win.close()
    });

    /**
     * 登录成功
     */
    win.webContents.on('will-navigate', async (e, url) => {
      console.log('will-navigate: ', url)

      // 不是跳转到首页的，忽略
      // if (!url.includes('https://passport.weibo.com/sso/v2/login')) {
      //   return
      // // }
// 
      // e.preventDefault()
      // 获取 cookie
      // const cookie = (await win.webContents.session.cookies.get({ url: 'https://weibo.com' })).map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
      // console.log('cookie: ', cookie)

      

      // 回调
      // resolve({ cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')})
      // 关闭窗口
      // win.close()
    })


    // 直接关闭
    win.on('close', () => {
      resolve(undefined)
      win.webContents.session.clearStorageData()
    })
  })
}