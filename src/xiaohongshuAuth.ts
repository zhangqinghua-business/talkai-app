import { BaseWindow, BrowserWindow } from "electron";

/**
 * 获取小红书授权
 * 1. 打开一个小红书登录窗口
 * 2. 用户扫描，拦截登录事件
 * 3. 读取cookie
 * 4. 退出登录窗口，返回cookie
 */
export const getXiaohongshuAuth = ( parent: BaseWindow, params?: any): Promise<Record<string, string> | undefined>  => {
  return new Promise(async (resolve, reject) => {

    // 计算父窗口的中心点
    const parentCenterX = parent.getBounds().x + parent.getBounds().width / 2;
    const parentCenterY = parent.getBounds().y + parent.getBounds().height / 2;


    // 子窗口的尺寸
    const width = params !== 'lifeCookie' ?  1050 : 1500
    const height = 900

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

    // globalShortcut.register('f12', () =>  win?.webContents.openDevTools({ mode: 'bottom' }))

    // 小红书本地生活号
    console.log('------------------------------>: ', params);

    // 直接关闭
    win.on('close', () => {
      resolve(undefined)
      win.webContents.session.clearStorageData()
    })

    // 普通账号
    if (params === 'cookie') {
      // 1. 登录小红书首页
      await loginIndex(win)
      // 2. 登录小红书创作中心
      const cookie = await loginCreator(win)
      // 3. 返回数据
      resolve({ cookie: cookie })

      win.close()
    }
    // 千帆后台
    else if (params === 'arkCookie') {
      // 2. 登录小红书创作中心
      await loginCreator(win)
      console.log('登录小红书创作中心 成功');
      
      // 3. 登录千帆后台
      await loginArk(win)
      console.log('登录千帆后台 成功');

      // 4. 登录小红书创作中心
      const cookie = await loginCreator(win)
      console.log('登录小红书创作中心 成功');
      // 5. 返回数据
      resolve({ cookie: cookie })

      win.close()
    } 
    // 本地生活号
    else if (params === 'lifeCookie') {
      const cookie = await loginLife(win)
      resolve({ cookie: cookie })
      win.close()
    } else {
      reject('不支持的参数：' + params)
    }
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
 * 千帆后台
 * 1. 在首页登陆
 * 2. 在千帆登陆
 */
const test2 = (win: BrowserWindow, resolve: any, reject: any) => {
  // 1. 打开登录页面
  win.webContents.loadURL('https://customer.xiaohongshu.com/login?service=https://ark.xiaohongshu.com/app-system/home?from=xhsweb');

  /**
   * 登录成功
   */
  win.webContents.on('will-navigate', async (e, url) => {
    console.log('will-navigate: ', url);
    
    // 不是跳转到首页的，忽略
    if (url != 'https://ark.xiaohongshu.com/api/edith/seller/info/v2') {
      return
    }

    e.preventDefault()
    // 获取 cookie
    const cookies = await win.webContents.session.cookies.get({ url: 'https://ark.xiaohongshu.com' })
    // 回调
    resolve({ cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')})
    // 关闭窗口
    win.close()

    console.log('-------------------------> 关闭了窗口：', url);
  })

  /**
   * 监听数据请求
   */
  win.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
    console.log('onBeforeRequest: ', details.method, details.url);

    callback({ cancel: false })
  })
}



/**
 * 登录首页
 */
const loginIndex = (win: BrowserWindow) => {
  return new Promise<string>((resolve, reject) => {
    // 1. 打开登陆页面
    win.webContents.loadURL('https://www.xiaohongshu.com/explore')

    // 2. 监听页面跳转
    win.webContents.on('will-navigate', async (e, url) => {
      console.log('loginIndex will-redirect: ', url)
    })

    // 3. 监听接口请求
    win.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
      console.log('loginIndex onBeforeRequest: ', details.method, details.url)

      // 1. 登录成功
      if (details.method !== 'POST' || details.url !== 'https://edith.xiaohongshu.com/api/sns/web/v1/homefeed') {
        callback({ cancel: false })
        return
      }

      const cookies = await win.webContents.session.cookies.get({ url: 'https://ark.xiaohongshu.com' })
      resolve(cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '))
    })
  })
}

/**
 * 登录创作中心
 */
const loginCreator = (win: BrowserWindow) => {
  return new Promise<string>((resolve, reject) => {
    // 1. 打开登陆页面
    win.webContents.loadURL('https://creator.xiaohongshu.com/login?source=official')

    // 2. 监听页面跳转(因为前面已经登录首页了，这里直接算登录成功)
    win.webContents.on('will-navigate', async (e, url) => {
      console.log('loginCreator will-redirect: ', url)
      const cookies = await win.webContents.session.cookies.get({ url: 'https://creator.xiaohongshu.com' })
      resolve(cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '))
    })

    // 3. 监听接口请求
    win.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
      console.log('loginCreator onBeforeRequest: ', details.method, details.url)
      callback({ cancel: false })
    })
  })
}

/**
 * 登录千帆后台
 */
const loginArk = (win: BrowserWindow) => {
  return new Promise<string>((resolve, reject) => {
    // 1. 打开登陆页面
    win.webContents.loadURL('https://customer.xiaohongshu.com/login?service=https://ark.xiaohongshu.com/app-system/home?from=xhsweb');

    // 2. 监听页面跳转(因为前面已经登录首页了，这里直接算登录成功)
    win.webContents.on('will-navigate', async (e, url) => {
      console.log('loginArk will-redirect: ', url)
    })

    // 3. 监听接口请求
    win.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
      console.log('loginArk onBeforeRequest: ', details.method, details.url)
      if (details.url !== 'https://ark.xiaohongshu.com/api/edith/seller/info/v2') {
        callback({ cancel: false })
        return
      }
      const cookies = await win.webContents.session.cookies.get({ url: 'https://ark.xiaohongshu.com' })
      resolve(cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '))
    })
  })
}

/**
 * 本地生活号

 */
const loginLife = (win: BrowserWindow) => {
  return new Promise<string>((resolve, reject) => {
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
      resolve(cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '))
    })
  })
}