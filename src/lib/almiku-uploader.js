"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);

const termaiKey = 'AIzaBj7z2z3xBjsk'
const termaiDomain = 'https://c.termai.cc'

async function uploadToTermai(buffer, filename = 'image.jpg') {
  const form = new (0, _formdata2.default)()
  form.append('file', buffer, { filename })

  const response = await _axios2.default.post(`${termaiDomain}/api/upload?key=${termaiKey}`, form, {
    headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
    timeout: 60000
  })

  if (_optionalChain([response, 'access', _ => _.data, 'optionalAccess', _2 => _2.status]) && _optionalChain([response, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.path])) {
    return response.data.path
  }

  throw new Error('Termai upload failed')
}

 const uploadImage = uploadToTermai; exports.uploadImage = uploadImage
 const uploadToTelegraph = uploadToTermai; exports.uploadToTelegraph = uploadToTelegraph
 const uploadTo0x0 = uploadToTermai; exports.uploadTo0x0 = uploadTo0x0
 const uploadToCatbox = uploadToTermai; exports.uploadToCatbox = uploadToCatbox
 const uploadToTmpfiles = uploadToTermai; exports.uploadToTmpfiles = uploadToTmpfiles
 const uploadToUguu = uploadToTermai; exports.uploadToUguu = uploadToUguu

var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _nodeuploadimages = require('node-upload-images');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

var _almikuassetmanagerjs = require('./almiku-asset-manager.js');

 async function updateAssetUrl(assetKey, buffer, filename = 'image.jpg') {
  let localPath = _optionalChain([_configjs2.default, 'access', _5 => _5.assets, 'optionalAccess', _6 => _6[assetKey]]);

  if (!localPath || localPath.startsWith('http')) {
    let folder = 'image';
    if (filename.endsWith('.mp4')) folder = 'video';
    else if (filename.endsWith('.mp3')) folder = 'audio';

    localPath = `./assets/${folder}/${filename}`;

    if (!_configjs2.default.assets) _configjs2.default.assets = {};
    _configjs2.default.assets[assetKey] = localPath;

    const configPath = _path2.default.join(process.cwd(), 'config.js');
    let configContent = _fs2.default.readFileSync(configPath, 'utf8');

    const regex = new RegExp(`("${assetKey}"\\s*:\\s*)"([^"]+)"`);
    if (regex.test(configContent)) {
      configContent = configContent.replace(regex, `$1"${localPath}"`);
    } else {
      const assetsBlockRegex = /(assets\s*:\s*\{)([^}]*)(\})/;
      if (assetsBlockRegex.test(configContent)) {
        configContent = configContent.replace(assetsBlockRegex, (match, p1, p2, p3) => {
          let inner = p2.trim();
          if (inner.endsWith(',')) inner = inner.slice(0, -1);
          if (inner.length > 0) return `${p1}\n    ${inner},\n    "${assetKey}": "${localPath}"\n  ${p3}`;
          return `${p1}\n    "${assetKey}": "${localPath}"\n  ${p3}`;
        });
      }
    }
    _fs2.default.writeFileSync(configPath, configContent, 'utf8');
  }

  const fullPath = _path2.default.resolve(process.cwd(), localPath);
  const dir = _path2.default.dirname(fullPath);
  if (!_fs2.default.existsSync(dir)) _fs2.default.mkdirSync(dir, { recursive: true });

  _almikuassetmanagerjs.updateAssetAndSave.call(void 0, assetKey, buffer, localPath);

  return localPath;
} exports.updateAssetUrl = updateAssetUrl;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
