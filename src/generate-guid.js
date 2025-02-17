function guid() { // 这是在网上找的guid生成算法
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const fs = require("fs");

// 生成新的GUID
const newGuid = guid();

// 读取package.json文件
const electronJson = JSON.parse(fs.readFileSync("electron-builder.json"));

// 将新的GUID写入package.json文件
electronJson.nsis.guid = newGuid;
fs.writeFileSync(
  "electron-builder.json",
  JSON.stringify(electronJson, null, 2)
);

