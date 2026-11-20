"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _nodecrypto = require('node:crypto'); var _nodecrypto2 = _interopRequireDefault(_nodecrypto);
var _nodefs = require('node:fs'); var _nodefs2 = _interopRequireDefault(_nodefs);
var _promises = require('node:fs/promises'); var _promises2 = _interopRequireDefault(_promises);
var _nodeos = require('node:os'); var _nodeos2 = _interopRequireDefault(_nodeos);
var _nodepath = require('node:path'); var _nodepath2 = _interopRequireDefault(_nodepath);
var _toughcookie = require('tough-cookie');
var _axioscookiejarsupport = require('axios-cookiejar-support');

const BASE_URL = "https://wink.ai";
const STRATEGY_URL = "https://strategy.app.meitudata.com";

const CLIENT_ID = "1189857605";
const VERSION = "5.1.2";
const COUNTRY_CODE = "ID";
const CLIENT_LANGUAGE = "en_US";
const CLIENT_TIMEZONE = "Asia/Jakarta";

const TASK_TYPE = "11";
const CONTENT_TYPE = "2";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

let _api = null;

async function getApi() {
  if (_api) return _api;

  const gnum = _nodecrypto2.default.randomUUID();
  const jar = new (0, _toughcookie.CookieJar)();

  await jar.setCookie(`_sm=${gnum}; Path=/; Domain=wink.ai`, BASE_URL);
  await jar.setCookie(
    `meitustat=${encodeURIComponent(JSON.stringify({ wgid: gnum }))}; Path=/; Domain=wink.ai`,
    BASE_URL,
  );

  _api = {
    client: _axioscookiejarsupport.wrapper.call(void 0, 
      _axios2.default.create({
        baseURL: BASE_URL,
        jar,
        withCredentials: true,
        validateStatus: () => true,
        headers: {
          accept: "*/*",
          origin: BASE_URL,
          referer: `${BASE_URL}/video-enhancer/upload`,
          "user-agent": UA,
          "sec-ch-ua":
            '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          ab_info: JSON.stringify({
            ab_codes: [],
            version: "1.4.4",
          }),
        },
      }),
    ),
    gnum,
  };

  return _api;
}

function extToMime(file) {
  const ext = _nodepath2.default.extname(file).toLowerCase();

  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mkv") return "video/x-matroska";

  return "application/octet-stream";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeTrace() {
  return `${_nodecrypto2.default.randomBytes(16).toString("hex")}-${_nodecrypto2.default.randomBytes(8).toString("hex")}-1`;
}

function traceHeaders() {
  const trace = makeTrace();

  return {
    "sentry-trace": trace,
    baggage: [
      "sentry-environment=release",
      "sentry-release=5.1.2%20(b60d25c477f43c6dfac4107810f26d442320f4f1)",
      "sentry-public_key=e1bf914f3448d9bc8a10c7e499d17d54",
      `sentry-trace_id=${trace.split("-")[0]}`,
      "sentry-sampled=true",
      "sentry-sample_rate=0.75",
    ].join(","),
  };
}

async function baseParams(extra = {}) {
  const { gnum } = await getApi();
  return new URLSearchParams({
    client_id: CLIENT_ID,
    version: VERSION,
    country_code: COUNTRY_CODE,
    gnum,
    client_language: CLIENT_LANGUAGE,
    client_channel_id: "",
    client_timezone: CLIENT_TIMEZONE,
    ...extra,
  });
}

async function getMaatSign() {
  const { client: api } = await getApi();
  const params = await baseParams({
    suffix: ".mp4",
    type: "temp",
    count: "1",
  });

  const res = await api.get(
    `/api/file/get_maat_sign.json?${params.toString()}`,
    {
      headers: traceHeaders(),
    },
  );

  if (res.status >= 400 || _optionalChain([res, 'access', _ => _.data, 'optionalAccess', _2 => _2.code]) !== 0) {
    throw new Error(`get_maat_sign gagal: ${JSON.stringify(res.data)}`);
  }

  return res.data.data;
}

async function getUploadPolicy(sign) {
  const params = new URLSearchParams({
    app: sign.app,
    count: String(sign.count),
    sig: sign.sig,
    sigTime: sign.sig_time,
    sigVersion: sign.sig_version,
    suffix: sign.suffix,
    type: sign.type,
  });

  const res = await _axios2.default.get(
    `${STRATEGY_URL}/upload/policy?${params.toString()}`,
    {
      headers: {
        accept: "*/*",
        origin: BASE_URL,
        referer: `${BASE_URL}/`,
        "user-agent": UA,
        "sec-ch-ua":
          '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
      },
      validateStatus: () => true,
    },
  );

  if (res.status >= 400 || !Array.isArray(res.data) || !_optionalChain([res, 'access', _3 => _3.data, 'access', _4 => _4[0], 'optionalAccess', _5 => _5.qiniu])) {
    throw new Error(`upload policy gagal: ${JSON.stringify(res.data)}`);
  }

  return res.data[0].qiniu;
}

async function uploadToQiniu(policy, filePath) {
  const form = new (0, _formdata2.default)();

  form.append("file", _nodefs2.default.createReadStream(filePath), {
    filename: _nodepath2.default.basename(filePath),
    contentType: extToMime(filePath),
  });

  form.append("token", policy.token);
  form.append("key", policy.key);
  form.append("fname", _nodepath2.default.basename(filePath));

  const res = await _axios2.default.post(policy.url, form, {
    headers: form.getHeaders({
      origin: BASE_URL,
      referer: `${BASE_URL}/`,
      "user-agent": UA,
      accept: "*/*",
    }),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    throw new Error(
      `upload qiniu gagal HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`,
    );
  }

  if (!_optionalChain([res, 'access', _6 => _6.data, 'optionalAccess', _7 => _7.url]) && !_optionalChain([res, 'access', _8 => _8.data, 'optionalAccess', _9 => _9.data])) {
    throw new Error(
      `upload qiniu response tidak valid: ${JSON.stringify(res.data)}`,
    );
  }

  return {
    file_key: policy.key,
    source_url: res.data.url || res.data.data || policy.data,
    raw_url: res.data.data || policy.data,
    raw: res.data,
  };
}

async function getVideoInfo(fileKey) {
  const { client: api } = await getApi();
  const body = await baseParams({
    file_key: fileKey,
  });

  const res = await api.post(
    "/api/file/video_cover_and_display_info_ext.json",
    body.toString(),
    {
      headers: {
        ...traceHeaders(),
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    },
  );

  if (res.status >= 400 || _optionalChain([res, 'access', _10 => _10.data, 'optionalAccess', _11 => _11.code]) !== 0) {
    throw new Error(`video info gagal: ${JSON.stringify(res.data)}`);
  }

  return res.data.data;
}

async function startTranscode(fileKey) {
  const { client: api } = await getApi();
  const body = await baseParams({
    file_key: fileKey,
  });

  const res = await api.post(
    "/api/file/video_trans_start.json",
    body.toString(),
    {
      headers: {
        ...traceHeaders(),
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    },
  );

  if (res.status >= 400 || _optionalChain([res, 'access', _12 => _12.data, 'optionalAccess', _13 => _13.code]) !== 0 || !_optionalChain([res, 'access', _14 => _14.data, 'optionalAccess', _15 => _15.data, 'optionalAccess', _16 => _16.id])) {
    throw new Error(`transcode start gagal: ${JSON.stringify(res.data)}`);
  }

  return res.data.data.id;
}

async function queryTranscode(id) {
  const { client: api } = await getApi();
  const params = await baseParams({
    id,
  });

  const res = await api.get(
    `/api/file/video_trans_query.json?${params.toString()}`,
    {
      headers: traceHeaders(),
    },
  );

  if (res.status >= 400 || _optionalChain([res, 'access', _17 => _17.data, 'optionalAccess', _18 => _18.code]) !== 0) {
    throw new Error(`transcode query gagal: ${JSON.stringify(res.data)}`);
  }

  return res.data.data;
}

async function waitTranscode(
  id,
  fallbackSourceUrl,
  maxTry = 80,
  delayMs = 3000,
) {
  let last = null;

  for (let i = 1; i <= maxTry; i++) {
    const data = await queryTranscode(id);
    last = data;

    const video = _optionalChain([data, 'optionalAccess', _19 => _19.video]) || _optionalChain([data, 'optionalAccess', _20 => _20.url]) || _optionalChain([data, 'optionalAccess', _21 => _21.source_url]) || "";
    const videoTranscoded =
      _optionalChain([data, 'optionalAccess', _22 => _22.video_transcoded]) ||
      _optionalChain([data, 'optionalAccess', _23 => _23.transcoded_video]) ||
      _optionalChain([data, 'optionalAccess', _24 => _24.transcoded_url]) ||
      _optionalChain([data, 'optionalAccess', _25 => _25.video_url]) ||
      "";

    if (videoTranscoded) {
      return {
        source_url: video || fallbackSourceUrl,
        video_transcoded: videoTranscoded,
        raw: data,
      };
    }

    await sleep(delayMs);
  }

  return {
    source_url: fallbackSourceUrl,
    video_transcoded: fallbackSourceUrl,
    raw: last,
  };
}

async function delivery(sourceUrl, videoTranscoded, taskName) {
  const { client: api } = await getApi();
  const body = await baseParams({
    type: TASK_TYPE,
    content_type: CONTENT_TYPE,
    source_url: sourceUrl,
    type_params: JSON.stringify({
      is_mirror: 0,
      orientation_tag: 1,
      j_420_trans: "1",
      return_ext: "2",
    }),
    right_detail: JSON.stringify({
      source: "1",
      touch_type: "4",
      function_id: "630",
      material_id: "63011",
      url: "https://wink.ai/video-enhancer/upload",
    }),
    ext_params: JSON.stringify({
      task_name: taskName,
      records: TASK_TYPE,
      video_transcoded: videoTranscoded,
    }),
    with_prepare: "1",
  });

  const res = await api.post("/api/meitu_ai/delivery.json", body.toString(), {
    headers: {
      ...traceHeaders(),
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  });

  if (res.status >= 400 || _optionalChain([res, 'access', _26 => _26.data, 'optionalAccess', _27 => _27.code]) !== 0) {
    throw new Error(`delivery gagal: ${JSON.stringify(res.data)}`);
  }

  const data = res.data.data || {};

  return {
    msg_id: data.msg_id || "",
    prepare_msg_id: data.prepare_msg_id || "",
    raw: data,
  };
}

async function queryBatch(msgId) {
  const { client: api } = await getApi();
  const params = await baseParams({
    msg_ids: msgId,
  });

  const res = await api.get(
    `/api/meitu_ai/query_batch.json?${params.toString()}`,
    {
      headers: {
        ...traceHeaders(),
        referer: `${BASE_URL}/video-enhancer/upload`,
      },
    },
  );

  if (res.status >= 400 || _optionalChain([res, 'access', _28 => _28.data, 'optionalAccess', _29 => _29.code]) !== 0) {
    throw new Error(`query batch gagal: ${JSON.stringify(res.data)}`);
  }

  return res.data.data;
}

function extractResultUrl(data) {
  const item = _optionalChain([data, 'optionalAccess', _30 => _30.item_list, 'optionalAccess', _31 => _31[0]]);
  const media = _optionalChain([item, 'optionalAccess', _32 => _32.result, 'optionalAccess', _33 => _33.media_info_list, 'optionalAccess', _34 => _34[0]]);

  return (
    _optionalChain([media, 'optionalAccess', _35 => _35.media_data]) ||
    _optionalChain([item, 'optionalAccess', _36 => _36.result, 'optionalAccess', _37 => _37.result_url]) ||
    _optionalChain([item, 'optionalAccess', _38 => _38.result, 'optionalAccess', _39 => _39.url]) ||
    _optionalChain([item, 'optionalAccess', _40 => _40.client_ext_params, 'optionalAccess', _41 => _41.video_transcoded]) ||
    ""
  );
}

function extractNextMsgId(data, currentMsgId) {
  const item = _optionalChain([data, 'optionalAccess', _42 => _42.item_list, 'optionalAccess', _43 => _43[0]]);
  const resultValue = _optionalChain([item, 'optionalAccess', _44 => _44.result, 'optionalAccess', _45 => _45.result]) || "";
  const realMsgId = _optionalChain([item, 'optionalAccess', _46 => _46.result, 'optionalAccess', _47 => _47.msg_id]) || _optionalChain([item, 'optionalAccess', _48 => _48.msg_id]) || "";

  if (
    resultValue &&
    resultValue !== currentMsgId &&
    !resultValue.startsWith("http") &&
    !resultValue.startsWith("https")
  ) {
    return resultValue;
  }

  if (
    realMsgId &&
    realMsgId !== currentMsgId &&
    !realMsgId.startsWith("wpr_")
  ) {
    return realMsgId;
  }

  return "";
}

async function waitResult(firstMsgId, maxTry = 120, delayMs = 5000) {
  let msgId = firstMsgId;
  let last = null;

  for (let i = 1; i <= maxTry; i++) {
    const data = await queryBatch(msgId);
    last = data;

    const nextMsgId = extractNextMsgId(data, msgId);

    if (nextMsgId) {
      msgId = nextMsgId;
      await sleep(1000);
      continue;
    }

    const url = extractResultUrl(data);
    const errorCode = _optionalChain([data, 'optionalAccess', _49 => _49.item_list, 'optionalAccess', _50 => _50[0], 'optionalAccess', _51 => _51.result, 'optionalAccess', _52 => _52.error_code]);
    const errorMsg = _optionalChain([data, 'optionalAccess', _53 => _53.item_list, 'optionalAccess', _54 => _54[0], 'optionalAccess', _55 => _55.result, 'optionalAccess', _56 => _56.error_msg]);

    if (url && url.startsWith("http") && errorCode === 0) {
      return url;
    }

    if (errorCode && errorCode !== 29901 && errorCode !== 0) {
      throw new Error(`task gagal: ${errorCode} ${errorMsg || ""}`);
    }

    await sleep(delayMs);
  }

  throw new Error(`result belum selesai: ${JSON.stringify(last)}`);
}

async function winkEnhance(video, { filename } = {}) {
  if (!video) throw new Error("video is required");

  const safeName = filename || `wink-${_nodecrypto2.default.randomUUID()}.mp4`;
  const filePath = Buffer.isBuffer(video)
    ? _nodepath2.default.join(_nodeos2.default.tmpdir(), safeName)
    : video;
  const shouldCleanup = Buffer.isBuffer(video);

  if (shouldCleanup) {
    await _promises2.default.writeFile(filePath, video);
  }

  if (!_nodefs2.default.existsSync(filePath)) {
    throw new Error(`File tidak ditemukan: ${filePath}`);
  }

  try {
    const taskName = `Enhancer-Ultra HD-${_nodepath2.default.parse(filePath).name}`;

    const sign = await getMaatSign();
    const policy = await getUploadPolicy(sign);
    const uploaded = await uploadToQiniu(policy, filePath);

    await getVideoInfo(uploaded.file_key);

    const transcodeId = await startTranscode(uploaded.file_key);
    const transcode = await waitTranscode(transcodeId, uploaded.source_url);

    const task = await delivery(
      transcode.source_url,
      transcode.video_transcoded,
      taskName,
    );
    const firstMsgId = task.msg_id || task.prepare_msg_id;

    if (!firstMsgId) {
      throw new Error(
        `delivery tidak mengembalikan msg_id: ${JSON.stringify(task.raw)}`,
      );
    }

    const resultUrl = await waitResult(firstMsgId);

    return {
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

exports. default = winkEnhance;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
