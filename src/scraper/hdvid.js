"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);

const API_URL = "https://fgsi.dpdns.org/api/tools/enchantVideo";
const DEFAULT_API_KEY = "fgsiapi-20c1605c-6d";
const PENDING_STATUSES = new Set([
  "pending",
  "processing",
  "queued",
  "running",
]);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createEnhanceTask(filePath, apiKey = DEFAULT_API_KEY) {
  if (!_fs2.default.existsSync(filePath)) throw new Error("file not found");

  const form = new (0, _formdata2.default)();
  form.append("file", _fs2.default.createReadStream(filePath), _path2.default.basename(filePath));

  const response = await _axios2.default.post(API_URL, form, {
    headers: {
      ...form.getHeaders(),
      "Content-Type": "multipart/form-data",
      apikey: apiKey,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000,
  });

  const payload = response.data;

  if (!_optionalChain([payload, 'optionalAccess', _ => _.status]) || !_optionalChain([payload, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.pollUrl])) {
    throw new Error(_optionalChain([payload, 'optionalAccess', _4 => _4.message]) || "Stunner creó la tarea de vídeo DD");
  }

  return {
    taskId: payload.data.taskId,
    createdAt: payload.data.createdAt,
    pollUrl: payload.data.pollUrl,
  };
}

async function pollEnhanceTask(
  pollUrl,
  {
    apiKey = DEFAULT_API_KEY,
    pollIntervalMs = 3000,
    timeoutMs = 10 * 60 * 1000,
    maxTransientErrors = 5,
  } = {},
) {
  const startedAt = Date.now();
  let transientErrors = 0;
  let lastPayload = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await _axios2.default.get(pollUrl, {
        headers: { apikey: apiKey },
        timeout: 30000,
      });

      const payload = response.data;
      const status = String(_optionalChain([payload, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.status]) || "").trim();
      const normalizedStatus = status.toLowerCase();
      lastPayload = payload;
      transientErrors = 0;

      if (normalizedStatus === "success") {
        const result = _optionalChain([payload, 'optionalAccess', _7 => _7.data, 'optionalAccess', _8 => _8.result]);
        if (!_optionalChain([result, 'optionalAccess', _9 => _9.res_url])) {
          throw new Error("HD vídeo completado pero resultado url no encontrado");
        }

        return {
          taskId: _optionalChain([payload, 'optionalAccess', _10 => _10.data, 'optionalAccess', _11 => _11.taskId]),
          createdAt: _optionalChain([payload, 'optionalAccess', _12 => _12.data, 'optionalAccess', _13 => _13.createdAt]),
          ...result,
        };
      }

      if (
        ["failed", "error", "cancelled", "canceled"].includes(normalizedStatus)
      ) {
        const terminalError = new Error(
          _optionalChain([payload, 'optionalAccess', _14 => _14.message]) ||
            _optionalChain([payload, 'optionalAccess', _15 => _15.data, 'optionalAccess', _16 => _16.message]) ||
            `Video HD falló con el estado${status}`,
        );
        terminalError.isTerminal = true;
        throw terminalError;
      }

      if (!_optionalChain([payload, 'optionalAccess', _17 => _17.status]) && !PENDING_STATUSES.has(normalizedStatus)) {
        const terminalError = new Error(
          _optionalChain([payload, 'optionalAccess', _18 => _18.message]) || "Votar vídeo HD falló",
        );
        terminalError.isTerminal = true;
        throw terminalError;
      }
    } catch (error) {
      if (_optionalChain([error, 'optionalAccess', _19 => _19.isTerminal])) {
        throw error;
      }
      transientErrors += 1;
      if (transientErrors >= maxTransientErrors) {
        throw new Error(
          _optionalChain([error, 'optionalAccess', _20 => _20.response, 'optionalAccess', _21 => _21.data, 'optionalAccess', _22 => _22.message]) ||
            _optionalChain([error, 'optionalAccess', _23 => _23.message]) ||
            "Votar vídeo HD falló",
        );
      }
    }

    await delay(pollIntervalMs);
  }

  throw new Error(_optionalChain([lastPayload, 'optionalAccess', _24 => _24.message]) || "Timeout espera el resultado de un video HD");
}

async function videoenhancer(
  video,
  {
    filename,
    apiKey = DEFAULT_API_KEY,
    pollIntervalMs = 3000,
    timeoutMs = 10 * 60 * 1000,
  } = {},
) {
  if (!video) throw new Error("video is required");

  const safeName =
    filename ||
    `hdvid-${_optionalChain([_crypto2.default, 'access', _25 => _25.randomUUID, 'optionalCall', _26 => _26()]) || _crypto2.default.randomBytes(16).toString("hex")}.mp4`;
  const filePath = Buffer.isBuffer(video)
    ? _path2.default.join(_os2.default.tmpdir(), safeName)
    : video;
  const shouldCleanup = Buffer.isBuffer(video);

  if (shouldCleanup) {
    await _fs2.default.promises.writeFile(filePath, video);
  }

  try {
    const task = await createEnhanceTask(filePath, apiKey);
    const result = await pollEnhanceTask(task.pollUrl, {
      apiKey,
      pollIntervalMs,
      timeoutMs,
    });

    return {
      taskId: task.taskId,
      pollUrl: task.pollUrl,
      createdAt: task.createdAt,
      ...result,
      resultUrl: result.res_url,
    };
  } finally {
    if (shouldCleanup) {
      try {
        await _fs2.default.promises.unlink(filePath);
      } catch (e) {}
    }
  }
}

exports. default = videoenhancer;
exports.createEnhanceTask = createEnhanceTask; exports.pollEnhanceTask = pollEnhanceTask;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
