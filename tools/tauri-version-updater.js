const stringifyPackage = require('stringify-package');

module.exports.readVersion = function (contents) {
  return JSON.parse(contents).package.version;
};

module.exports.writeVersion = function (contents, version) {
  const json = JSON.parse(contents);
  json.package.version = version;
  return stringifyPackage(json, 2, '\r\n');
};
