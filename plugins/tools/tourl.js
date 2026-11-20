"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _nodefetch = require('node-fetch'); var _nodefetch2 = _interopRequireDefault(_nodefetch);
var _mimetypes = require('mime-types'); var _mimetypes2 = _interopRequireDefault(_mimetypes);
var _filetype = require('file-type');
var _almiku = require('almiku');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _imgdropjs = require('../../src/scraper/imgdrop.js'); var _imgdropjs2 = _interopRequireDefault(_imgdropjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "tourl",
  alias: ["upload", "catbox", "url"],
  category: "tools",
  description: "Subir los medios a múltiples host y obtener URL",
  usage: ".tourl (reply/kirim media)",
  example: ".tourl",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const termaiKey = "AIzaBj7z2z3xBjsk";
const termaiDomain = "https://c.termai.cc";

async function detectExt(buffer, fallback = "bin") {
  try {
    const type = await _filetype.fileTypeFromBuffer.call(void 0, buffer);
    return _optionalChain([type, 'optionalAccess', _ => _.ext]) || fallback;
  } catch (e2) {
    return fallback;
  }
}

async function uploadToCatbox(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });

  const res = await _nodefetch2.default.call(void 0, "https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 30000,
  });

  if (!res.ok) throw new Error("Catboxfallido");
  const url = await res.text();
  if (!url.startsWith("http")) throw new Error("Invalid response");
  return { host: "Catbox", url, expires: "Permanent" };
}

async function uploadToLitterbox(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("reqtype", "fileupload");
  form.append("time", "72h");
  form.append("fileToUpload", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });

  const res = await _nodefetch2.default.call(void 0, 
    "https://litterbox.catbox.moe/resources/internals/api.php",
    {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
      timeout: 30000,
    },
  );

  if (!res.ok) throw new Error("Litterboxfallido");
  const url = await res.text();
  if (!url.startsWith("http")) throw new Error("Invalid response");
  return { host: "Litterbox", url, expires: "72 jam" };
}

async function uploadTo0x0_alt(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("file", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });

  const res = await _nodefetch2.default.call(void 0, "https://0x0.st", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 30000,
  });

  if (!res.ok) throw new Error("Uguu fallido");
  const data = await res.json();
  if (!_optionalChain([data, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.url])) throw new Error("Invalid response");

  return { host: "Uguu", url: data.files[0].url, expires: "60 menit" };
}

async function uploadToImgDrop(buffer, filename) {
  const data = await _imgdropjs2.default.call(void 0, buffer, filename);
  if (!data.status || !data.url) throw new Error("ImgDrop fallido");
  return { host: "ImgDrop", url: data.url, expires: "Unknown" };
}

async function uploadToQuax(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("file", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });

  const res = await _nodefetch2.default.call(void 0, "https://qu.ax/upload.php", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 60000,
  });

  if (!res.ok) throw new Error("Qu.xfallido");
  const data = await res.json();

  if (!_optionalChain([data, 'optionalAccess', _4 => _4.success]) || !Array.isArray(data.files) || !_optionalChain([data, 'access', _5 => _5.files, 'access', _6 => _6[0], 'optionalAccess', _7 => _7.url])) {
    throw new Error("Invalid response");
  }

  return { host: "Qu.ax", url: data.files[0].url, expires: "Permanent" };
}

async function uploadToTermai(buffer) {
  const ext = await detectExt(buffer, "bin");
  const form = new (0, _formdata2.default)();
  form.append("file", buffer, { filename: `archivo.${ext}` });

  const res = await _nodefetch2.default.call(void 0, `${termaiDomain}/api/upload?key=${termaiKey}`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 120000,
  });

  if (!res.ok) throw new Error("Termai fallido");
  const data = await res.json();

  if (!_optionalChain([data, 'optionalAccess', _8 => _8.status]) || !_optionalChain([data, 'optionalAccess', _9 => _9.path])) {
    throw new Error("Invalid response");
  }

  return { host: "Termai", url: data.path, expires: "Unknown" };
}

async function uploadToPone(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("files[]", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });

  const res = await _nodefetch2.default.call(void 0, "https://pone.rs/upload.php", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
      "accept": "*/*",
      "origin": "https://pone.rs",
      "referer": "https://pone.rs/",
    },
    timeout: 60000,
  });

  if (!res.ok) throw new Error("Pone fallido");
  const data = await res.json();
  const url = _optionalChain([data, 'optionalAccess', _10 => _10.files, 'optionalAccess', _11 => _11[0], 'optionalAccess', _12 => _12.url, 'optionalAccess', _13 => _13.replaceAll, 'call', _14 => _14("\\/", "/")]) || null;
  if (!_optionalChain([data, 'optionalAccess', _15 => _15.success]) || !url) throw new Error("Invalid response");
  return { host: "Pone", url, expires: "Permanent" };
}

async function uploadToKappa(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("file", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });

  const res = await _nodefetch2.default.call(void 0, "https://kappa.lol/api/upload", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
      "Accept": "*/*",
      "Origin": "https://kappa.lol",
      "Referer": "https://kappa.lol/",
    },
    timeout: 60000,
  });

  if (!res.ok) throw new Error("Kappa fallido");
  const raw = await res.text();
  const data = JSON.parse(raw);
  const url = _optionalChain([data, 'optionalAccess', _16 => _16.link]) || null;
  if (!url) throw new Error("Invalid response");
  return { host: "Kappa", url, expires: "Permanent" };
}

async function uploadToUploadEe(buffer, filename) {
  const ext = (filename.match(/\.([^.]+)$/) || [])[1] || "bin";
  const imageExts = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "avif"];
  const isImage = imageExts.includes(ext.toLowerCase());
  const category = isImage ? "cat_picture" : "cat_file";

  const initRes = await _nodefetch2.default.call(void 0, "https://www.upload.ee/?", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    },
    timeout: 30000,
  });

  const rnd = Date.now();
  const idRes = await _nodefetch2.default.call(void 0, `https://www.upload.ee/ubr_link_upload.php?rnd_id=${rnd}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
      "Referer": "https://www.upload.ee/?",
    },
    timeout: 30000,
  });

  const idBody = await idRes.text();
  const idMatch = idBody.match(/startUpload\("([^"]+)"/);
  if (!idMatch) throw new Error("Uplad id no encontrado");
  const uploadId = idMatch[1];

  const form = new (0, _formdata2.default)();
  form.append("upfile_0", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });
  form.append("link", "");
  form.append("email", "");
  form.append("category", category);
  form.append("big_resize", "none");
  form.append("small_resize", "120x90");

  const uploadUrl = `https://www.upload.ee/cgi-bin/ubr_upload.pl?X-Progress-ID=${uploadId}&upload_id=${uploadId}`;
  await _nodefetch2.default.call(void 0, uploadUrl, {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
      "Origin": "https://www.upload.ee",
      "Referer": "https://www.upload.ee/?",
    },
    timeout: 120000,
  });

  const finishedRes = await _nodefetch2.default.call(void 0, `https://www.upload.ee/?page=finished&upload_id=${uploadId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
      "Referer": uploadUrl,
    },
    timeout: 30000,
  });

  const html = await finishedRes.text();
  const srcMatch = html.match(/id=["']file_src["'][^>]*value=["']([^"']+)["']/i);
  const viewMatch = html.match(/View file:\s*<br\s*\/?>\s*<a href=["']?([^"'>\s]+)["']?/i);
  const rawUrl = _optionalChain([srcMatch, 'optionalAccess', _17 => _17[1]]) || _optionalChain([viewMatch, 'optionalAccess', _18 => _18[1]]) || null;
  if (!rawUrl) throw new Error("Upload.ee fallido");

  let resultUrl = rawUrl.replaceAll("&amp;", "&").replaceAll("&quot;", '"');
  if (isImage) resultUrl = resultUrl.replace("/files/", "/image/").replace(/\.html$/, "");

  return { host: "Upload.ee", url: resultUrl, expires: "Permanent" };
}

async function uploadToLeopard(buffer, filename) {
  const uploadPage = "https://leopard.hosting.pecon.us/upload.php";

  await _nodefetch2.default.call(void 0, uploadPage, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    },
    timeout: 30000,
  });

  const form = new (0, _formdata2.default)();
  form.append("uploadContent", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });
  form.append("password", "");
  form.append("showname", "yes");

  const res = await _nodefetch2.default.call(void 0, uploadPage, {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
      "Origin": "https://leopard.hosting.pecon.us",
      "Referer": uploadPage,
    },
    timeout: 120000,
  });

  const html = await res.text();
  const match = html.match(/Download link:\s*<a href=([^>\s]+)>/i);
  const url = _optionalChain([match, 'optionalAccess', _19 => _19[1]]) || null;
  if (!url) throw new Error("Leopard fallido");
  return { host: "Leopard", url, expires: "Permanent" };
}

async function uploadToUguu(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("files[]", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });

  const res = await _nodefetch2.default.call(void 0, "https://uguu.se/upload.php", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "accept": "*/*",
      "origin": "https://uguu.se",
      "referer": "https://uguu.se/",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    },
    timeout: 120000,
  });

  if (!res.ok) throw new Error("Uguu fallido");
  const data = await res.json();
  const url = _optionalChain([data, 'optionalAccess', _20 => _20.files, 'optionalAccess', _21 => _21[0], 'optionalAccess', _22 => _22.url]) || null;
  if (!_optionalChain([data, 'optionalAccess', _23 => _23.success]) || !url) throw new Error("Invalid response");
  return { host: "Uguu", url, expires: "48 jam" };
}

async function uploadTo8upload(buffer, filename) {
  const initRes = await _nodefetch2.default.call(void 0, "https://8upload.com/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    },
    timeout: 30000,
  });

  const form = new (0, _formdata2.default)();
  form.append("images[]", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });

  const res = await _nodefetch2.default.call(void 0, "https://8upload.com/upload/mt/", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "accept": "application/json, text/javascript, */*; q=0.01",
      "origin": "https://8upload.com",
      "referer": "https://8upload.com/",
      "x-requested-with": "XMLHttpRequest",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    },
    timeout: 120000,
  });

  let html = await res.text();
  const uploadPath = (typeof html === "string" && html.trim().startsWith("/uploads/"))
    ? html.trim()
    : (html.match(/\/uploads\/[a-zA-Z0-9]+/) || [])[0] || null;

  if (uploadPath) {
    const previewRes = await _nodefetch2.default.call(void 0, `https://8upload.com${uploadPath}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "Referer": "https://8upload.com/",
      },
      timeout: 30000,
    });
    html = await previewRes.text();
  }

  const urlMatch = (html || "").match(/https:\/\/i\.8upload\.com\/image\/[^'"<>\s]+/);
  const url = _optionalChain([urlMatch, 'optionalAccess', _24 => _24[0]]) || null;
  if (!url) throw new Error("8upload fallido");
  return { host: "8upload", url, expires: "Permanent" };
}

async function uploadToTop4top(buffer, filename) {
  const initRes = await _nodefetch2.default.call(void 0, "https://top4top.io/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    },
    timeout: 30000,
  });

  const initHtml = await initRes.text();
  const sidMatch = initHtml.match(/name=["']sid["'][^>]*value=["']([^"']+)["']/i);
  const sid = _optionalChain([sidMatch, 'optionalAccess', _25 => _25[1]]) || "";

  const form = new (0, _formdata2.default)();
  if (sid) form.append("sid", sid);
  form.append("file_0_", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });
  for (let i = 1; i <= 9; i++) form.append(`_ Archivos${i}_`, "");
  form.append("submitr", "[ رفع الملفات ]");
  for (let i = 0; i <= 9; i++) form.append(`_ Archivos${i}_`, "");

  const res = await _nodefetch2.default.call(void 0, "https://top4top.io/index.php", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "origin": "https://top4top.io",
      "referer": "https://top4top.io/",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    },
    timeout: 120000,
  });

  const html = await res.text();
  const urlMatch = html.match(/https:\/\/[^'"<>\s]*\/p_[^'"<>\s]*/);
  const inputMatch = html.match(/value=["'](https:\/\/[^'"]*\/p_[^'"]*)['"]/i);
  const url = _optionalChain([inputMatch, 'optionalAccess', _26 => _26[1]]) || _optionalChain([urlMatch, 'optionalAccess', _27 => _27[0]]) || null;
  if (!url) throw new Error("Top4top fallido");
  return { host: "Top4top", url, expires: "Permanent" };
}

async function uploadToTmpFiles(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("file", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });
  form.append("expire", "21600");

  const res = await _nodefetch2.default.call(void 0, "https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "accept": "application/json",
      "user-agent": "Mozilla/5.0",
    },
    timeout: 120000,
  });

  if (!res.ok) throw new Error("TmpFiles fallido");
  const data = await res.json();
  const url = _optionalChain([data, 'optionalAccess', _28 => _28.data, 'optionalAccess', _29 => _29.url]) || null;
  if (_optionalChain([data, 'optionalAccess', _30 => _30.status]) !== "success" || !url) throw new Error("Invalid response");
  return { host: "TmpFiles", url, expires: "6 jam" };
}

async function uploadToNekohime(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("file", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });
  const res = await _nodefetch2.default.call(void 0, "https://cdn.nekohime.site/upload", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 120000,
  });
  if (!res.ok) throw new Error("Nekohime fallido");
  const data = await res.json();
  const url = _optionalChain([data, 'optionalAccess', _31 => _31.files, 'optionalAccess', _32 => _32[0], 'optionalAccess', _33 => _33.url]) || _optionalChain([data, 'optionalAccess', _34 => _34.files, 'optionalAccess', _35 => _35.url]) || (Array.isArray(_optionalChain([data, 'optionalAccess', _36 => _36.files])) ? _optionalChain([data, 'optionalAccess', _37 => _37.files, 'access', _38 => _38[0]]) : _optionalChain([data, 'optionalAccess', _39 => _39.files]));
  if (!url) throw new Error("Nekohime fallido");
  return { host: "Nekohime", url, expires: "Permanent" };
}

async function uploadToFaddlaninco(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("file", buffer, {
    filename,
    contentType: _mimetypes2.default.lookup(filename) || "application/octet-stream",
  });
  const res = await _nodefetch2.default.call(void 0, "https://cdn.faddlaninco.dev/api/upload", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 120000,
  });
  if (!res.ok) throw new Error("Faddlaninco fallido");
  const data = await res.json();
  if (!data.success || !data.url) throw new Error(data.error || "Faddlaninco fallido");
  return { host: "Faddlaninco", url: data.url, expires: "Permanent" };
}

async function uploadToUnggah(buffer, filename) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomPart = "";
  for (let i = 0; i < 16; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const boundary = `WebKitFormBoundary${randomPart}`;

  const contentType = _mimetypes2.default.lookup(filename) || "application/octet-stream";
  const head = Buffer.from(
    `------${boundary}\r\n` +
    `Contenido - Disposición: forma - datos; nombre = Spenfield Ec; nombre de archivo =${filename}"\r\n` +
    `Content-Type: ${contentType}\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n------${boundary}--\r\n`);

  const body = Buffer.concat([head, buffer, tail]);

  const res = await _nodefetch2.default.call(void 0, "https://unggah.web.id/api/unggah", {
    method: "POST",
    headers: {
      "content-type": `multipart/form-data; boundary=----${boundary}`,
      "accept": "*/*",
      "origin": "https://unggah.web.id",
      "referer": "https://unggah.web.id/pengunggah",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"
    },
    body,
    timeout: 120000
  });

  if (!res.ok) throw new Error("Sube fallido");
  const data = await res.json();
  if (!_optionalChain([data, 'optionalAccess', _40 => _40.url])) throw new Error("Invalid response");
  
  return { host: "Unggah", url: data.url, expires: "Permanent" };
}

const UPLOADERS = [
  { name: "ImgDrop", fn: uploadToImgDrop },
  { name: "Catbox", fn: uploadToCatbox },
  { name: "Litterbox", fn: uploadToLitterbox },
  { name: "Pone", fn: uploadToPone },
  { name: "Kappa", fn: uploadToKappa },
  { name: "Uguu", fn: uploadToUguu },
  { name: "TmpFiles", fn: uploadToTmpFiles },
  { name: "Upload.ee", fn: uploadToUploadEe },
  { name: "8upload", fn: uploadTo8upload },
  { name: "Top4top", fn: uploadToTop4top },
  { name: "Leopard", fn: uploadToLeopard },
  { name: "0x0_Backup", fn: uploadTo0x0_alt },
  { name: "Qu.ax", fn: uploadToQuax },
  { name: "Termai", fn: uploadToTermai },
  { name: "Nekohime", fn: uploadToNekohime },
  { name: "Faddlaninco", fn: uploadToFaddlaninco },
  { name: "Unggah", fn: uploadToUnggah },
];

function getFileExtension(mimetype) {
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/3gpp": "3gp",
    "video/quicktime": "mov",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/mp4": "m4a",
    "application/pdf": "pdf",
    "application/zip": "zip",
  };
  return mimeMap[mimetype] || "bin";
}

async function handler(m, { sock }) {
  let media = null;
  let mimetype = null;
  let filename = "file";

  if (_optionalChain([m, 'access', _41 => _41.quoted, 'optionalAccess', _42 => _42.message])) {
    const type = _almiku.getContentType.call(void 0, m.quoted.message);
    if (!type || type === "conversation" || type === "extendedTextMessage") {
      return m.reply("⚠Por favor, responda al archivo.");
    }

    try {
      media = await _almiku.downloadMediaMessage.call(void 0, 
        { key: m.quoted.key, message: m.quoted.message },
        "buffer",
        {},
      );
      const content = m.quoted.message[type];
      mimetype = _optionalChain([content, 'optionalAccess', _43 => _43.mimetype]) || "application/octet-stream";
      filename = _optionalChain([content, 'optionalAccess', _44 => _44.fileName]) || `archivo.${getFileExtension(mimetype)}`;
    } catch (e) {
      return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  } else if (m.message) {
    const type = _almiku.getContentType.call(void 0, m.message);
    if (!type || type === "conversation" || type === "extendedTextMessage") {
      let txt = `📤 *MEDIA UPLOADER* 📤\n\n`;
      txt += `¡Hola hermano!\n\n`;
      txt += `*Como usarlo:*\n`;
      txt += `👉Ksenmedia con caption\`${m.prefix}tourl\`\n`;
      txt += `👉O réplica media que ya está con\`${m.prefix}tourl\``;
      return m.reply(txt);
    }

    try {
      media = await _almiku.downloadMediaMessage.call(void 0, 
        { key: m.key, message: m.message },
        "buffer",
        {},
      );
      const content = m.message[type];
      mimetype = _optionalChain([content, 'optionalAccess', _45 => _45.mimetype]) || "application/octet-stream";
      filename = _optionalChain([content, 'optionalAccess', _46 => _46.fileName]) || `archivo.${getFileExtension(mimetype)}`;
    } catch (e) {
      return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }

  if (!media || media.length === 0) {
    return m.reply("❌ Waduh kak, medianya nggak kebaca. Coba kirim ulang deh!");
  }

  await m.react("🕕");

  const results = [];
  const failed = [];

  for (const uploader of UPLOADERS) {
    try {
      const result = await uploader.fn(media, filename);
      results.push(result);
    } catch (e) {
      failed.push(uploader.name);
    }
  }

  if (results.length === 0) {
    await m.react("❌");
    return m.reply(`❌¡Ouch hermano, todo en los errores pas upead!\n\n# Crawling in the servatory:${failed.join(", ")}`);
  }

  let text = `🚀*UPLOAD Exito!*🚀\n\n`;
  text += `Sí, ha hecho bien en el servador nube, por favor selecciona el enlacce y cohaklas tecis de la olla.✨\n\n`;

  let contentTxt = "";
  results.forEach((r, i) => {
    const status = r.expires === "Permanent" ? "∞ Permanen" : r.expires;
    contentTxt += `☁Servidor${r.host}\n`;
    contentTxt += `⏳ *Expired :* ${status}\n`;
    contentTxt += `🔗*Enlace:*\n`;
    contentTxt += `${r.url}`;
    if (i < results.length - 1) contentTxt += `\n\n`;
  });

  text += contentTxt.split("\n").map(line => `${line}`).join("\n");

  if (failed.length > 0) {
    text += `\n\n⚠*Fyi hermana, someone 's failing in the servidor:${failed.join(", ")}_`;
  }

  try {
    let headerMedia = null;
    if (mimetype.startsWith('image') || mimetype.startsWith('video')) {
      const preMsg = await _almiku.generateWAMessage.call(void 0, m.chat, { 
        [mimetype.startsWith('image') ? 'image' : 'video']: media 
      }, { userJid: sock.user.id });
      headerMedia = mimetype.startsWith('image') ? 
        { imageMessage: preMsg.message.imageMessage } : 
        { videoMessage: preMsg.message.videoMessage };
    }

    const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: _almiku.proto.Message.InteractiveMessage.create({
            body: _almiku.proto.Message.InteractiveMessage.Body.create({ text: text }),
            footer: _almiku.proto.Message.InteractiveMessage.Footer.create({ text: _configjs2.default.bot.name }),
            header: _almiku.proto.Message.InteractiveMessage.Header.create({
              title: "T O U R L",
              hasMediaAttachment: !!headerMedia,
              ...headerMedia
            }),
            nativeFlowMessage: _almiku.proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: results.slice(0, 5).map((r, i) => ({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: `📋Copia Enlace${r.host}`,
                  id: `copy_${i}`,
                  copy_code: r.url
                })
              }))
            })
          })
        }
      }
    }, { quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (err) {
    await m.reply(text);
  }

  await m.react("✅");
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
