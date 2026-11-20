"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);

const mimeTypes = {
  "7z": "application/x-7z-compressed",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  apk: "application/vnd.android.package-archive",
  exe: "application/x-msdownload",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  txt: "text/plain",
  json: "application/json",
  js: "application/javascript",
  html: "text/html",
  css: "text/css",
};

function getMimeTypeFromUrl(url) {
  if (!url) return "application/octet-stream";

  const fileName = _optionalChain([url, 'access', _ => _.split, 'call', _2 => _2("/"), 'access', _3 => _3.pop, 'call', _4 => _4(), 'optionalAccess', _5 => _5.split, 'call', _6 => _6("?"), 'access', _7 => _7[0]]) || "";
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";

  return mimeTypes[extension] || "application/octet-stream";
}

 async function mediafire(url) {
  const { data: html } = await _axios2.default.get(url, {
    timeout: 60000,
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  const $ = cheerio.load(html);
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    "MediaFire File";
  const images = $('meta[property="og:image"]').attr("content") || "";
  const description =
    $('meta[property="og:description"]').attr("content") ||
    "not found description.";
  const link_download =
    $("#downloadButton").attr("href") ||
    $('a[aria-label="Download file"]').attr("href") ||
    "";
  const sizes = $("#downloadButton").text().trim();
  const sizeMatch = sizes.match(/\(([^)]+)\)/);
  const size = _optionalChain([sizeMatch, 'optionalAccess', _8 => _8[1], 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()]) || "";
  const mimetype = getMimeTypeFromUrl(link_download);

  if (!link_download) {
    throw new Error("MediaFire download link not found");
  }

  return {
    meta: {
      title,
      images,
      description,
    },
    download: {
      link_download,
      size,
      mimetype,
    },
  };
} exports.default = mediafire;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
