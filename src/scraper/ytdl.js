"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _child_process = require('child_process');
var _util = require('util');

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
const run = _util.promisify.call(void 0, _child_process.exec);

function extractVideoId(url) {
  return _optionalChain([String, 'call', _2 => _2(url || ""), 'access', _3 => _3.match, 'call', _4 => _4(YOUTUBE_ID_REGEX), 'optionalAccess', _5 => _5[1]]) || null;
}

async function fallbackToMp3Buffer(url) {
  const tempDir = _path2.default.join(process.cwd(), "temp");
  if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });

  const id = _crypto2.default.randomBytes(6).toString("hex");
  const inputPath = _path2.default.join(tempDir, `ytfb_${id}.bin`);
  const outputPath = _path2.default.join(tempDir, `ytfb_${id}.mp3`);

  try {
    const { data } = await _axios2.default.get(url, {
      responseType: "arraybuffer",
      timeout: 60000,
    });

    const buffer = Buffer.from(data);
    if (!buffer.length) {
      throw new Error("Audio fallback kosong");
    }

    _fs2.default.writeFileSync(inputPath, buffer);

    await run(
      `ffmpeg -y -i "${inputPath}" -vn -map_metadata -1 -ac 2 -ar 44100 -c:a libmp3lame -b:a 192k "${outputPath}"`,
      { timeout: 120000 },
    );

    const mp3Buffer = _fs2.default.readFileSync(outputPath);
    if (!mp3Buffer.length) {
      throw new Error("Konversi fallback ke MP3 gagal");
    }

    return mp3Buffer;
  } finally {
    try {
      if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath);
    } catch (e2) {}
    try {
      if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath);
    } catch (e3) {}
  }
}

async function ytdl(url, format = "mp3") {
  try {
    const videoId = extractVideoId(url);

    if (!videoId) {
      return {
        status: false,
        mess: "Format URL tidak dikenali atau bukan link YouTube yang valid.",
      };
    }

    const normalizedFormat =
      String(format || "mp3").toLowerCase() === "mp4" ? "mp4" : "mp3";

    const client = _axios2.default.create({
      timeout: 60000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 16; NX729J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7271.123 Mobile Safari/537.36",
        Referer: "https://id.ytmp3.mobi/",
      },
    });

    const { data: init } = await client.get("https://d.ymcdn.org/api/v1/init", {
      params: {
        p: "y",
        23: "1llum1n471",
        _: Math.random(),
      },
    });

    if (!_optionalChain([init, 'optionalAccess', _6 => _6.convertURL])) {
      return {
        status: false,
        mess: "Gagal menginisialisasi server (Init failed).",
      };
    }

    const { data: convert } = await client.get(init.convertURL, {
      params: {
        v: videoId,
        f: normalizedFormat,
        _: Math.random(),
      },
    });

    if (!_optionalChain([convert, 'optionalAccess', _7 => _7.progressURL]) || !_optionalChain([convert, 'optionalAccess', _8 => _8.downloadURL])) {
      return {
        status: false,
        mess: "Gagal mendapatkan data konversi.",
      };
    }

    let progress = 0;
    let title = convert.title || "";
    let attempts = 0;
    const maxAttempts = 20;

    while (progress < 3 && attempts < maxAttempts) {
      const { data } = await client.get(convert.progressURL);

      if ((_optionalChain([data, 'optionalAccess', _9 => _9.error]) || 0) > 0) {
        return {
          status: false,
          mess: `Error dari server: ${data.error}`,
        };
      }

      progress = Number(_optionalChain([data, 'optionalAccess', _10 => _10.progress]) || 0);
      title = _optionalChain([data, 'optionalAccess', _11 => _11.title]) || title;

      if (progress < 3) {
        attempts += 1;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    if (attempts >= maxAttempts && progress < 3) {
      return {
        status: false,
        mess: "Request timeout (proses terlalu lama).",
      };
    }

    return { status: true, title, dl: convert.downloadURL };
  } catch (e) {
    return { status: false, mess: `System Error: ${e.message}` };
  }
}

class Youtube {
  constructor() {
    this.CREATED_BY = "Ditzzy";
    this.NOTE = "Thank you for using this scrape";
  }

  wrapResponse(data) {
    return {
      created_by: this.CREATED_BY,
      note: this.NOTE,
      results: data,
    };
  }

  async download(url, format = "audio") {
    const outputFormat = ["video", "mp4"].includes(
      String(format || "audio").toLowerCase(),
    )
      ? "mp4"
      : "mp3";
    const result = await ytdl(url, outputFormat);

    if (!_optionalChain([result, 'optionalAccess', _12 => _12.status]) || !_optionalChain([result, 'optionalAccess', _13 => _13.dl])) {
      throw new Error(_optionalChain([result, 'optionalAccess', _14 => _14.mess]) || "Gagal mengunduh konten YouTube");
    }

    return this.wrapResponse({
      title: result.title,
      download: result.dl,
      url: result.dl,
      format: outputFormat,
    });
  }
}

exports.ytdl = ytdl; exports.Youtube = Youtube; exports.fallbackToMp3Buffer = fallbackToMp3Buffer;
exports. default = ytdl;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
