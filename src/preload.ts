import { contextBridge, ipcRenderer } from "electron";

console.log('preload...', process.version);

/**
 * 暴露给渲染进程
 */
contextBridge.exposeInMainWorld('myAPI', {
  name: 'zhangsan',

  /**
   * 获取cookie
   * @param typ    类型
   * @param params 传递的其它参数
   */
  getCookie: (type: 'weibo' | 'xiaohongshu', params?: any): Promise<Record<string, string>> => {
    return ipcRenderer.invoke('getCookie', type, params)
  }
})