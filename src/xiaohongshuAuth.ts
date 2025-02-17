import { BaseWindow, BrowserWindow, globalShortcut } from "electron";

/**
 * 获取小红书授权
 * 1. 打开一个小红书登录窗口
 * 2. 用户扫描，拦截登录事件
 * 3. 读取cookie
 * 4. 退出登录窗口，返回cookie
 */
export const getXiaohongshuAuth = ( parent: BaseWindow, params?: any): Promise<Record<string, string> | undefined>  => {
  return new Promise(( resolve, reject) => {

    // 计算父窗口的中心点
    const parentCenterX = parent.getBounds().x + parent.getBounds().width / 2;
    const parentCenterY = parent.getBounds().y + parent.getBounds().height / 2;


    // 子窗口的尺寸
    const width = params.isLifeServiceSeller ? 1400: 1050;
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

    // globalShortcut.register('f12', function () {
    //   win?.webContents.openDevTools({ mode: 'bottom' })
    // })

    // 小红书本地生活号
    console.log('------------------------------>: ', params);
    
    if ((params.isLifeServiceSeller + '') === 'true') {
      test2(win, resolve, reject)
    } 
    // 小红书普通账号
    else {
      test1(win, resolve, reject)
    }

    // 直接关闭
    win.on('close', () => {
      resolve(undefined)
      win.webContents.session.clearStorageData()
    })
  })
}

/**
 * 普通小红书账号
 * @param win 
 * @param resolve 
 * @param reject 
 */
const test1 = (win: BrowserWindow, resolve: any, reject: any) => {
  // 1. 打开登录页面
  // win.webContents.loadURL('https://creator.xiaohongshu.com/login?source=official');
  win.webContents.loadURL('https://www.xiaohongshu.com/explore');
  

  // 2. 监听所有网络请求，判断是否登录成功
  win.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
    // 1. 过滤非登录成功的
    if (details.method !== 'POST' || details.url !== 'https://edith.xiaohongshu.com/api/sns/web/v1/homefeed') {
      // 允许请求继续
      callback({ cancel: false })
      return
    }

    // 2. 获取 cookie
    // const cookies = await win.webContents.session.cookies.get({ url: 'https://www.xiaohongshu.com' })

    // console.log('登录成功 cookies----------> : ', cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '));

    // 2. 登录成功，跳转到创作中心
    win.webContents.loadURL('https://creator.xiaohongshu.com/login?source=official');

   



    // 3. 回调
    // resolve({ cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')})
    // 4. 关闭窗口
    // win.close()

    // callback({ cancel: false })
  });

  /**
   * 登录成功
   */
  win.webContents.on('will-navigate', async (e, url) => {
    console.log('will-navigate: ', url)

    // 不是跳转到首页的，忽略
    // if (url !== 'https://creator.xiaohongshu.com/new/home') {
    //   return
    // }
    // e.preventDefault()
    // 获取 cookie
    const cookies = await win.webContents.session.cookies.get({ url: 'https://creator.xiaohongshu.com' })

    // console.log('cookies----------> : ', url, cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '));
    
    // await new Promise(r => setTimeout(r, 2000))

    // console.log('cookies deplay----------> : ', url, cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '));

    // 回调
    resolve({ cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')})
    // 关闭窗口
    win.close()
  })

  win.webContents.on('will-navigate', async (e, url) => {
    console.log('will-redirect: ', url)
  })
}

/**
 * 本地生活号
 */
const test2 = (win: BrowserWindow, resolve: any, reject: any) => {
  // 1. 打开登录页面
  win.webContents.loadURL('https://life.xiaohongshu.com/zhaoshang');

  /**
   * 登录成功
   */
  win.webContents.on('will-navigate', async (e, url) => {
    console.log('登录成功，跳转页面--------------》', url);
    
    // 不是跳转到首页的，忽略
    if (url !== 'https://life.xiaohongshu.com/') {
      return
    }
    e.preventDefault()
    // 获取 cookie
    const cookies = await win.webContents.session.cookies.get({ url: 'https://life.xiaohongshu.com' })
    // 回调
    resolve({ cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')})
    // 关闭窗口
    win.close()

    console.log('-------------------------> 关闭了窗口：', url);
    
  })
}