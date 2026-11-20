"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _nodecrypto = require('node:crypto'); var _nodecrypto2 = _interopRequireDefault(_nodecrypto);
var _nodefs = require('node:fs'); var _nodefs2 = _interopRequireDefault(_nodefs);
var _promises = require('node:fs/promises'); var _promises2 = _interopRequireDefault(_promises);
var _nodeos = require('node:os'); var _nodeos2 = _interopRequireDefault(_nodeos);
var _nodepath = require('node:path'); var _nodepath2 = _interopRequireDefault(_nodepath);

const API = "https://api.unwatermark.ai";
const WEB = "https://unblurimage.ai";

const RESOLUTION = "2k";
const IS_PREVIEW = "false";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function randomProductSerial() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";

  for (let i = 0; i < 6; i++) {
    out += chars[_nodecrypto2.default.randomInt(chars.length)];
  }

  return out;
}

function extToMime(file) {
  const ext = _nodepath2.default.extname(file).toLowerCase();

  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mkv") return "video/x-matroska";

  return "application/octet-stream";
}

function baseHeaders(extra = {}) {
  return {
    accept: "*/*",
    origin: WEB,
    referer: `${WEB}/`,
    "user-agent": UA,
    "product-code": "067003",
    "product-serial": randomProductSerial(),
    "x-request-id": _nodecrypto2.default.randomUUID(),
    "sec-ch-ua-platform": '"Android"',
    "sec-ch-ua":
      '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
    "sec-ch-ua-mobile": "?1",
    ...extra,
  };
}

async function postForm(endpoint, fields) {
  const form = new (0, _formdata2.default)();

  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }

  const res = await _axios2.default.post(`${API}${endpoint}`, form, {
    headers: baseHeaders(form.getHeaders()),
    validateStatus: () => true,
  });

  return {
    status: res.status,
    data: res.data,
  };
}

async function getJson(endpoint) {
  const res = await _axios2.default.get(`${API}${endpoint}`, {
    headers: baseHeaders({
      "content-type": "application/json; charset=UTF-8",
    }),
    validateStatus: () => true,
  });

  return {
    status: res.status,
    data: res.data,
  };
}

async function putFileToSignedUrl(uploadUrl, filePath) {
  const stat = await _promises2.default.stat(filePath);
  const mime = extToMime(filePath);

  const res = await _axios2.default.put(uploadUrl, _nodefs2.default.createReadStream(filePath), {
    headers: {
      "content-type": mime,
      "content-length": stat.size,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
  });

  return {
    status: res.status,
    data: res.data,
  };
}

function cleanPublicUrl(url) {
  return String(url || "").split("?")[0];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createUploadUrl(filePath) {
  const videoFileName = _nodepath2.default.basename(filePath);

  const result = await postForm("/api/web/common/upload/video", {
    video_file_name: videoFileName,
  });

  if (result.status >= 400 || _optionalChain([result, 'access', _ => _.data, 'optionalAccess', _2 => _2.code]) !== 100000) {
    throw new Error(`UI de carga ambished:${JSON.stringify(result.data)}`);
  }

  return result.data.result;
}

async function createJob(originalVideoUrl) {
  const result = await postForm(
    "/api/web/unblurimage/v1/video-enhancer/create-job",
    {
      original_video_url: originalVideoUrl,
      resolution: RESOLUTION,
      is_preview: IS_PREVIEW,
    },
  );

  if (result.status >= 400 || !_optionalChain([result, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.result, 'optionalAccess', _5 => _5.job_id])) {
    throw new Error(`Stealth crea jjust:${JSON.stringify(result.data)}`);
  }

  return result.data.result;
}

async function getJob(jobId) {
  return await getJson(
    `/ fuego / web / unblurimage / v1 / video - potencial${jobId}`,
  );
}

async function waitJob(jobId, maxTry = 80, delayMs = 5000) {
  let last = null;

  for (let i = 1; i <= maxTry; i++) {
    const result = await getJob(jobId);
    last = result.data;

    const status = _optionalChain([result, 'access', _6 => _6.data, 'optionalAccess', _7 => _7.result, 'optionalAccess', _8 => _8.status]);
    const outputUrl = _optionalChain([result, 'access', _9 => _9.data, 'optionalAccess', _10 => _10.result, 'optionalAccess', _11 => _11.output_url]);

    if (Array.isArray(outputUrl) && outputUrl.length > 0) {
      return result.data;
    }

    if (status === 1) {
      return result.data;
    }

    await sleep(delayMs);
  }

  throw new Error(`Job no se ha hecho todavía:${JSON.stringify(last)}`);
}

async function videoEnhancer(video, { filename } = {}) {
  if (!video) throw new Error("video is required");

  const safeName = filename || `hdvid2-${_nodecrypto2.default.randomUUID()}.mp4`;
  const filePath = Buffer.isBuffer(video)
    ? _nodepath2.default.join(_nodeos2.default.tmpdir(), safeName)
    : video;
  const shouldCleanup = Buffer.isBuffer(video);

  if (shouldCleanup) {
    await _promises2.default.writeFile(filePath, video);
  }

  if (!_nodefs2.default.existsSync(filePath)) {
    throw new Error(`El archivo no se encuentra:${filePath}`);
  }

  try {
    const upload = await createUploadUrl(filePath);
    const signedUrl = upload.url;
    const publicUrl = cleanPublicUrl(upload.url);

    const put = await putFileToSignedUrl(signedUrl, filePath);

    if (put.status >= 400) {
      throw new Error(
        `HTTP falló${put.status}: ${typeof put.data === "string" ? put.data : JSON.stringify(put.data)}`,
      );
    }

    const job = await createJob(publicUrl);
    const done = await waitJob(job.job_id);

    const resultUrl = _optionalChain([done, 'access', _12 => _12.result, 'optionalAccess', _13 => _13.output_url, 'optionalAccess', _14 => _14[0]]) || "";

    return {
      jobId: job.job_id,
      resultUrl,
    };
  } finally {
    if (shouldCleanup) {
      try {
        await _promises2.default.unlink(filePath);
      } catch (e) {}
    }
  }
}

exports. default = videoEnhancer;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
