const stringifyPackage = require('stringify-package');

module.exports.readVersion = function (contents) {
  return JSON.parse(contents).name;
};

module.exports.writeVersion = function (contents, version) {
  const json = JSON.parse(contents);
  json.name = version;
  json.pub_date = new Date().toISOString();
  json.platforms.darwin.url = `https://github.com/QSPFoundation/qspider/releases/download/v${version}/qSpider.app.tar.gz`;
  json.platforms.linux.url = `https://github.com/QSPFoundation/qspider/releases/download/v${version}/q-spider_${version}_amd64.AppImage.tar.gz`;
  json.platforms.win64.url = `https://github.com/QSPFoundation/qspider/releases/download/v${version}/qSpider_${version}_x64_en-US.msi.zip`;
  return stringifyPackage(json, 2, '\r\n');
};
