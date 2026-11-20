"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _axioscookiejarsupport = require('axios-cookiejar-support');
var _toughcookie = require('tough-cookie');
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _mimetypes = require('mime-types'); var _mimetypes2 = _interopRequireDefault(_mimetypes);
const jar = new (0, _toughcookie.CookieJar)();
const client = _axioscookiejarsupport.wrapper.call(void 0, _axios2.default.create({
    jar,
    withCredentials: true,
    timeout: 60000
}));

const CONFIG = {
    BASE_URL: "https://mconverter.eu",
    API: {
        HOME: "https://mconverter.eu/",
        UPLOAD: "/cf_nocache/ajax/upload.php",
        PROGRESS: "/cf_nocache/ajax/check_progress.php",
        GET_TARGETS: "/cf_nocache/ajax/get_targets.php",
        DOWNLOAD: "/cf_nocache/ajax/download.php"
    },
    HEADERS: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Origin": "https://mconverter.eu",
        "Referer": "https://mconverter.eu/",
        "X-Requested-With": "XMLHttpRequest"
    },
    SUPPORTED_SOURCES: [
        "3g2","3gp","3gp2","3gpp","7z","aac","ac3","ai","aif","aiff","amv","apk","arw","avi","avif","azw","azw3",
        "bmp","bz2","cab","cbr","cbz","cr2","cr3","cso","csv","deskthemepack","dng","doc","docx","drawio","eps",
        "epub","fb2","flac","flv","gif","gz","heic","htm","html","ico","ipynb","iso","jar","jpeg","jpg","json",
        "jxl","m4a","markdown","mcaddon","mcpack","mctemplate","mcworld","md","mid","mkv","mobi","mov","mp3",
        "mp4","mpeg","mpg","mpo","mxf","nef","odp","ods","odt","ogg","opus","pdf","png","ppm","pps","ppsx","ppt",
        "pptx","psd","raf","rar","rtf","rw2","sami","smi","srt","sub","svg","tab","tar","tbz2","tgz","themepack",
        "tif","tiff","tini","tsv","txt","txz","vob","wav","webm","webp","wma","wmv","xcf","xls","xlsx","xz","zip"
    ]
};

let sessionInitialized = false;

const initSession = async () => {
    if (sessionInitialized) return;
    try {
        await client.get(CONFIG.API.HOME, {
            headers: {
                ...CONFIG.HEADERS,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Sec-Fetch-Mode": "navigate",
                "X-Requested-With": undefined
            }
        });
        sessionInitialized = true;
    } catch (e) {
        console.log("⚠Gwal en su sesión, intenta continuar.");
    }
};

const mconverter = {

    getAvailableTargets: async (filename) => {
        await initSession();
        const ext = filename.split('.').pop().toLowerCase();

        const form = new (0, _formdata2.default)();
        form.append('extensions', ext);

        try {
            const res = await client.post(CONFIG.BASE_URL + CONFIG.API.GET_TARGETS, form, {
                headers: { ...CONFIG.HEADERS, ...form.getHeaders() }
            });

            const allTargets = [];

            const extractTargets = (obj) => {
                if (Array.isArray(obj)) {
                    obj.forEach(item => extractTargets(item));
                } else if (typeof obj === 'object' && obj !== null) {
                    if (obj.name && obj.mime) {
                        allTargets.push(obj);
                    }
                    Object.values(obj).forEach(val => extractTargets(val));
                }
            };

            if (res.data && res.data.formats) {
                extractTargets(res.data.formats);
            }

            const uniqueTargets = [...new Map(allTargets.map(item => [item.name, item])).values()];
            return uniqueTargets.sort((a, b) => a.name.localeCompare(b.name));

        } catch (e) {
            console.error("Error fetching targets:", e.message);
            return [];
        }
    },

    convert: async (inputPath, targetFormat) => {
        await initSession();

        if (!_fs2.default.existsSync(inputPath)) return { error: 'El archivo no existe' };

        const filename = _path2.default.basename(inputPath);
        const fileSize = _fs2.default.statSync(inputPath).size;
        const mimeType = _mimetypes2.default.lookup(inputPath) || 'application/octet-stream';

        try {
            const chunk0 = _fs2.default.createReadStream(inputPath, { start: 0, end: 0 });

            const paramsInit = new URLSearchParams({
                target_format: targetFormat,
                total_size: fileSize,
                source_mime: mimeType,
                filename: filename,
                abd: 'false',
                captcha: ''
            });

            const formInit = new (0, _formdata2.default)();
            formInit.append('file', chunk0);

            const resInit = await client.post(
                `${CONFIG.BASE_URL}${CONFIG.API.UPLOAD}?${paramsInit.toString()}`,
                formInit,
                { headers: { ...CONFIG.HEADERS, ...formInit.getHeaders() } }
            );

            if (resInit.data.error) throw new Error(resInit.data.error.message);
            const token = resInit.data.token;
            if (!token) throw new Error("Stempem dapet token subida");

            let startByte = 1;
            const CHUNK_SIZE = 10 * 1024 * 1024;

            while (startByte < fileSize) {
                let endByte = Math.min(startByte + CHUNK_SIZE, fileSize);
                const chunk = _fs2.default.createReadStream(inputPath, { start: startByte, end: endByte - 1 });

                const params = new URLSearchParams({ token, start_byte: startByte });
                const form = new (0, _formdata2.default)();
                form.append('file', chunk);

                const resChunk = await client.post(
                    `${CONFIG.BASE_URL}${CONFIG.API.UPLOAD}?${params.toString()}`,
                    form,
                    {
                        headers: { ...CONFIG.HEADERS, ...form.getHeaders() },
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                );

                if (resChunk.data.error) throw new Error(resChunk.data.error.message);
                if (!resChunk.data.awaiting_chunks) break;

                startByte = endByte;
            }

            let status = 'processing';
            let attempts = 0;
            process.stdout.write(`   🕕 Convert (${targetFormat})... `);

            while (status !== 'finished' && attempts < 100) {
                attempts++;
                await new Promise(r => setTimeout(r, 2000));

                const resPoll = await client.get(
                    `${CONFIG.BASE_URL}${CONFIG.API.PROGRESS}# Token =${token}`,
                    { headers: CONFIG.HEADERS }
                );

                const data = resPoll.data;
                status = _optionalChain([data, 'access', _ => _.conversion_data, 'optionalAccess', _2 => _2.status]);

                if (status === 'error') {
                    throw new Error(_optionalChain([data, 'access', _3 => _3.error_data, 'optionalAccess', _4 => _4.error_reason]) || 'Unknown error');
                }

                if (status === 'finished') {
                    process.stdout.write('✅Terminado!\n');

                    const dlParams = new URLSearchParams({
                        token: token,
                        file_idx: 1,
                        no_idx_in_name: 1,
                        orig_names: 'checked'
                    });

                    const downloadUrl = `${CONFIG.BASE_URL}${CONFIG.API.DOWNLOAD}?${dlParams.toString()}`;
                    return { success: true, url: downloadUrl };
                }
            }

            return { error: 'Timeout waiting for conversion' };

        } catch (e) {
            process.stdout.write('❌\n');
            return { error: e.message };
        }
    }
};

exports.mconverter = mconverter;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
