const fs = require("fs");

/**
 * guid生成算法
 */
const guid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const  generateVersion = () => {
  const date = new Date()
  const year = date.getFullYear().toString(); // 获取年份的最后两位
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // 获取月份，并确保是两位数
  const day = ('0' + date.getDate()).slice(-2); // 获取日期，并确保是两位数
  const hours = ('0' + date.getHours()).slice(-2); // 获取小时，并确保是两位数
  const minutes = ('0' + date.getMinutes()).slice(-2); // 获取分钟，确保两位数
  const seconds = ('0' + date.getSeconds()).slice(-2); // 获取秒数，确保两位数

  return `1.0.${year}${month}${day}${hours}${minutes}${seconds}`;
}

// 0. 生成版本号
// const packageJSON = JSON.parse(fs.readFileSync("package.json"));
// packageJSON.version = generateVersion()
// fs.writeFileSync("package.json", JSON.stringify(packageJSON, null, 2));


// 1. 读取配置文件
const electronJson = JSON.parse(fs.readFileSync("electron-builder.json"));

// 2. 生成新的GUID(处理window安装bug)
electronJson.nsis.guid = guid();

// 3. 动态修改应用名称
const APP_NAME = process.env.APP_NAME || 'unkonw_app'
electronJson.productName = APP_NAME;

// 4. 写入主页 (写入配置文件，然后在运行时候读取配置文件)
const HOME_PAGE = process.env.HOME_PAGE || 'unkonw_app'
electronJson.extraMetadata.HOME_PAGE = HOME_PAGE;


// 4. 重新写入文件
fs.writeFileSync("electron-builder.json", JSON.stringify(electronJson, null, 2));

