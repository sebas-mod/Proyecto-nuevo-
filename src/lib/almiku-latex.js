"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
let _sharp = null;
async function getSharp() {
  if (!_sharp) _sharp = (await Promise.resolve().then(() => _interopRequireWildcard(require("./almiku-image.js")))).default;
  return _sharp;
}

const LATEX_BG = "#1a1a2e";
const LATEX_FG = "#ffffff";
const LATEX_PADDING = 20;
const LATEX_DPI = 200;

const renderLatexToPng = async (latex, options = {}) => {
  const { bgColor = LATEX_BG, dpi = LATEX_DPI } = options;

  const url = `https://latex.codecogs.com/png.image?\\dpi{${dpi}}\\bg{${bgColor.replace("#", "")}} ${encodeURIComponent(latex)}`;

  const res = await _axios2.default.get(url, { responseType: "arraybuffer" });

  const buffer = Buffer.from(res.data);
  const metadata = await (await getSharp())(buffer).metadata();

  return {
    buffer,
    width: metadata.width || 500,
    height: metadata.height || 150,
  };
};

const createMediaUploadFn = async (sock) => {
  const { prepareWAMessageMedia } = await Promise.resolve().then(() => _interopRequireWildcard(require("almiku")));
  return async (imageBuffer, mediaType) => {
    const media = await prepareWAMessageMedia(
      { image: imageBuffer },
      { upload: sock.waUploadToServer },
    );
    const imgMsg = _optionalChain([media, 'optionalAccess', _ => _.imageMessage]);
    const url = _optionalChain([imgMsg, 'optionalAccess', _2 => _2.url]) || "";
    const directPath = _optionalChain([imgMsg, 'optionalAccess', _3 => _3.directPath]) || "";
    return { url, directPath };
  };
};








exports.renderLatexToPng = renderLatexToPng; exports.createMediaUploadFn = createMediaUploadFn; exports.LATEX_BG = LATEX_BG; exports.LATEX_FG = LATEX_FG; exports.LATEX_PADDING = LATEX_PADDING; exports.LATEX_DPI = LATEX_DPI;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
