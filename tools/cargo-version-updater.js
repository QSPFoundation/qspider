import { stringify, parse } from 'iarna-toml-esm';

module.exports.readVersion = function (contents) {
  return parse(contents).package.version;
};

module.exports.writeVersion = function (contents, version) {
  const json = parse(contents);
  json.package.version = version;
  return stringify(json);
};
