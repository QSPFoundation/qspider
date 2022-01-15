const TOMLparse = require('@iarna/toml/parse-string');
const TOMLstringify = require('@iarna/toml/stringify');

module.exports.readVersion = function (contents) {
  return TOMLparse(contents).package.version;
};

module.exports.writeVersion = function (contents, version) {
  const json = TOMLparse(contents);
  json.package.version = version;
  return TOMLstringify(json);
};
