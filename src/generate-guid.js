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


// 1. 读取package.json文件
const electronJson = JSON.parse(fs.readFileSync("electron-builder.json"));

// 2. 生成新的GUID(处理window安装bug)
// electronJson.nsis.guid = guid();

// 3. 动态修改应用名称
const productName = process.env.APP_NAME || 'unkonw_app'
console.log('productName: ', productName);

electronJson.productName = productName;
// 在 github windows-laestest 环境中不能读取带空格的文件路径，所以直接修改安装包名字 -> talkai Setup 1.0.0.exe
// electronJson.win.artifactName = productName + '.exe'
// electronJson.artifactName = productName;

// 4. 重新写入文件
fs.writeFileSync("electron-builder.json", JSON.stringify(electronJson, null, 2));

