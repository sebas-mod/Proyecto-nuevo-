"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
/**
* Generar cadena aleatoria con cierta longitud
* @ param{number}longitud - Long string deseado
* @ param{string} [charset='alphanumeric'] - Tipe caracter ('alphanumeric', 'numeric', 'alpha', 'hex( GASPS )
 * @returns {string} Random string
 * @example
 * randomString(8); // "aB3dE7fG"
 * randomString(6, 'numeric'); // "472839"
 */
function randomString(length, charset = 'alphanumeric') {
    const charsets = {
        alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        numeric: '0123456789',
        alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        hex: '0123456789abcdef'
    };
    
    const chars = charsets[charset] || charsets.alphanumeric;
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

/**
* Generar entero entero entre min y max(incluido)
* @ param{number} min - Valor minimum
* @ param{number}max- Valor maximum
 * @returns {number} Random integer
 * @example
 * randomInt(1, 10); // 7
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
* Elijalo al azar desde Array
* @ param{Array}array - Array para seleccionar
* @ devuelve { * } Artículo aleatorio de array
 * @example
 * randomPick(['a', 'b', 'c']); // 'b'
 */
function randomPick(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

/**
* Ejecución de demoras por duración absoluta
* @ param{number}ms - DÍA Duración en milisegundos
* @ devuelve { Promesa<void>Promesa que resuelve después de la demora
 * @example
* espera retraso ( 1000 ); / / / espera 1 segundo
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
* Comprobar si el punto es una URL válida
* @ param{string}# Estring to intercept #
* @ devuelves{boolean}Es verdad si URL válida
 * @example
 * isUrl('https://google.com'); // true
 * isUrl('not a url'); // false
 */
function isUrl(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

/**
* Comprobar si el punto es el número del teléfono válido
* @ param{string}# Estring to intercept #
* @ devuelves{boolean}Es verdad si el número uno de las llamadas de teléfono válidas
 * @example
 * isPhoneNumber('6281234567890'); // true
 */
function isPhoneNumber(str) {
    return /^[0-9]{10,15}$/.test(str.replace(/[^0-9]/g, ''));
}

/**
* Comprobar si la cadena es un correo válido
* @ param{string}# Estring to intercept #
* @ devuelves{boolean}Es verdad si el correo electrónico es válido
 */
function isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/**
* Mención de parálisis de texn
* @ param{string}texT @-@ Texn que contiene mención
* @ devuelve *
 * @example
 * parseMention('@6281234567890 hello'); // ['6281234567890']
 */
function parseMention(text) {
    if (!text) return [];
    const matches = text.match(/@([0-9]+)/g);
    if (!matches) return [];
    return matches.map(m => m.replace('@', ''));
}

/**
* Escape especial carácter regex
* @ param{string}- Cantad a la... Escax.
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Deep clone object
* @ param{Object}*Obtexto a @-@ clone*
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge deep objects
 * @param {Object} objetivo - Objetivo object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    
    return result;
}

/**
* Búfer de búsqueda de URL
* @ param{string}url @-@ URL para embrague
 * @param {Object} [options={}] - Axios options
* @ devuelve { Promesa<Buffer>Buffer of the family
 * @example
 * const buffer = await fetchBuffer('https://example.com/image.png');
 */
async function fetchBuffer(url, options = {}) {
    try {
        const response = await _axios2.default.get(url, {
            responseType: 'arraybuffer',
            ...options
        });
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error(`Failed to fetch buffer: ${error.message}`);
    }
}

/**
* Buscar JSON desde URL
* @ param{string}url @-@ URL para embrague
 * @param {Object} [options={}] - Axios options
 * @returns {Promise<Object>} JSON response
 * @example
 * const data = await fetchJson('https://api.example.com/data');
 */
async function fetchJson(url, options = {}) {
    try {
        const response = await _axios2.default.get(url, {
            responseType: 'json',
            ...options
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch JSON: ${error.message}`);
    }
}

/**
* Fetch text de URL
* @ param{string}url @-@ URL para embrague
 * @param {Object} [options={}] - Axios options
 * @returns {Promise<string>} Text response
 */
async function fetchText(url, options = {}) {
    try {
        const response = await _axios2.default.get(url, {
            responseType: 'text',
            ...options
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch text: ${error.message}`);
    }
}

/**
* Descarga de archivo de URL y guardar a la ruta
* @ param{string}url @-@ archivo URL para descargas
* @ param{string}Posh - Archivo de ruta para cargar el archivo
* @ devuelve { Promesa<string>archivo Path guardado
 */
async function downloadFile(url, filePath) {
    try {
        const buffer = await fetchBuffer(url);
        const dir = _path2.default.dirname(filePath);
        
        if (!_fs2.default.existsSync(dir)) {
            _fs2.default.mkdirSync(dir, { recursive: true });
        }
        
        _fs2.default.writeFileSync(filePath, buffer);
        return filePath;
    } catch (error) {
        throw new Error(`Failed to downloads archivo:${error.message}`);
    }
}

/**
* Generar hash MD5 de la cadena
* @ param{string}# String to the hash #
 * @returns {string} MD5 hash
 */
function md5(str) {
    return _crypto2.default.createHash('md5').update(str).digest('hex');
}

/**
* Generar hash SHA256 de la cuerda
* @ param{string}# String to the hash #
 * @returns {string} SHA256 hash
 */
function sha256(str) {
    return _crypto2.default.createHash('sha256').update(str).digest('hex');
}

/**
 * Encode string ke Base64
* @ param{string}*Canta a la @-@ codificación*
 * @returns {string} Base64 encoded string
 */
function toBase64(str) {
    return Buffer.from(str).toString('base64');
}

/**
 * Decode Base64 ke string
* @ param{string}*Base64 * cuerda a la decodificación*
 * @returns {string} Decoded string
 */
function fromBase64(str) {
    return Buffer.from(str, 'base64').toString('utf-8');
}

/**
* Comproba si el deber es un archivo
* @ param{string}Posh @-@ Send to Intern
* @ devuelves{boolean}Es verdad si llenasxists y es archivo
 */
function isFile(filePath) {
    try {
        return _fs2.default.statSync(filePath).isFile();
    } catch (e2) {
        return false;
    }
}

/**
* Compruebe si los caminos son directorio
* @ param{string}- Camino para interceptar.
* @ devuelves{boolean}Verdadero si camino exists y es directorio
 */
function isDirectory(dirPath) {
    try {
        return _fs2.default.statSync(dirPath).isDirectory();
    } catch (e3) {
        return false;
    }
}

/**
* Directorio de Crea si aún no existe
 * @param {string} dirPath - Path directory
* @ devuelves{boolean}Verdadero si exitoso
 */
function ensureDir(dirPath) {
    if (!_fs2.default.existsSync(dirPath)) {
        _fs2.default.mkdirSync(dirPath, { recursive: true });
    }
    return true;
}

/**
* Lea archivos JSON con seguridad
* @ param{string} filePath - Path archivo JSON
*Param* *DefaultValue*{}- Valor predeterminado si no hay archivo
* @ devuelves{Object}Parsed JSON o valor predeterminado
 */
function readJsonFile(filePath, defaultValue = {}) {
    try {
        if (!_fs2.default.existsSync(filePath)) return defaultValue;
        const content = _fs2.default.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (e4) {
        return defaultValue;
    }
}

/**
* Turlis objeto a json archivo
* @ param{string} filePath - Path archivo JSON
* @ param{Object}datos - Datos para escribir
* @ param{boolean}♪ Es formación ♪
* @ devuelves{boolean}Verdadero si exitoso
 */
function writeJsonFile(filePath, data, pretty = true) {
    try {
        const dir = _path2.default.dirname(filePath);
        ensureDir(dir);
        
        const content = pretty 
            ? JSON.stringify(data, null, 2) 
            : JSON.stringify(data);
        _fs2.default.writeFileSync(filePath, content, 'utf-8');
        return true;
    } catch (e5) {
        return false;
    }
}

/**
* Obtener tipo MIME del búfer
* @ param{Buffer}búfer - búfer para interceptar
 * @returns {string} MIME type
 */
function getMimeType(buffer) {
    const signatures = {
        'ffd8ff': 'image/jpeg',
        '89504e47': 'image/png',
        '47494638': 'image/gif',
        '52494646': 'image/webp',
        '00000020': 'video/mp4',
        '00000018': 'video/mp4',
        '00000014': 'video/mp4',
        '1a45dfa3': 'video/webm',
        '4f676753': 'audio/ogg',
        'fff3': 'audio/mpeg',
        'fff2': 'audio/mpeg',
        'fffb': 'audio/mpeg',
        '494433': 'audio/mpeg',
        '25504446': 'application/pdf'
    };
    
    const hex = buffer.slice(0, 4).toString('hex');
    
    for (const [sig, mime] of Object.entries(signatures)) {
        if (hex.startsWith(sig)) {
            return mime;
        }
    }
    
    return 'application/octet-stream';
}

/**
* Obtener el archivo de extensión del tipo MIME
 * @param {string} mimeType - MIME type
* @ devuelves{string}Archivo extensión (sin puntos)
 */
function getExtension(mimeType) {
    const extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'audio/mpeg': 'mp3',
        'audio/ogg': 'ogg',
        'audio/opus': 'opus',
        'application/pdf': 'pdf'
    };
    
    return extensions[mimeType] || 'bin';
}

/**
* Dormir con retraso aleatorio
 * @param {number} minMs - Minimum delay
 * @param {number} maxMs - Maximum delay
 * @returns {Promise<void>}
 */
async function randomDelay(minMs, maxMs) {
    const ms = randomInt(minMs, maxMs);
    return delay(ms);
}

/**
* Función de reingreso con exretroceso inicial
* @ param{Function}Fencing to retry-
 * @param {number} [maxRetries=3] - Maksimum retry
* @ param{number}*Si me das el tiempo* *te daré el tiempo*
* @ devuelve { Promesa } Resultado de la función
 */
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await delay(baseDelay * Math.pow(2, i));
            }
        }
    }
    
    throw lastError;
}

/**
* El array de la hucha se convierte en array de arrays con absoluto seis
* @ param{Array}array - Array to --chunk
* @ param{number}tamaño - árido cada pedazo
 * @returns {Array<Array>} Array of chunks
 * @example
 * chunk([1,2,3,4,5], 2); // [[1,2], [3,4], [5]]
 */
function chunk(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

/**
 * Flatten nested array
 * @param {Array} array - Nested array
 * @param {number} [depth=1] - Kedalaman flatten
 * @returns {Array} Flattened array
 */
function flatten(array, depth = 1) {
    return array.flat(depth);
}

/**
* Retirado duplicado de matriz
* @ param{Array}array - Array con posibilidades duplicadas
* @ devuelves{Array}Array sin duplicar
 */
function unique(array) {
    return [...new Set(array)];
}

/**
 * Group array by key
 * @param {Array<Object>} array - Array of objects
* @ param{string}llave @-@ clave para agrupar
 * @returns {Object} Grouped object
 */
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

/**
 * Sort array of objects by key
 * @param {Array<Object>} array - Array of objects
* @ param{string}llave @-@ para clasificar
* @ param{string}Orden
 * @returns {Array<Object>} Sorted array
 */
function sortBy(array, key, order = 'asc') {
    const multiplier = order === 'desc' ? -1 : 1;
    return [...array].sort((a, b) => {
        if (a[key] < b[key]) return -1 * multiplier;
        if (a[key] > b[key]) return 1 * multiplier;
        return 0;
    });
}

exports.randomString = randomString; exports.randomInt = randomInt; exports.randomPick = randomPick; exports.delay = delay; exports.isUrl = isUrl; exports.isPhoneNumber = isPhoneNumber; exports.isEmail = isEmail; exports.parseMention = parseMention; exports.escapeRegex = escapeRegex; exports.deepClone = deepClone; exports.deepMerge = deepMerge; exports.fetchBuffer = fetchBuffer; exports.fetchJson = fetchJson; exports.fetchText = fetchText; exports.downloadFile = downloadFile; exports.md5 = md5; exports.sha256 = sha256; exports.toBase64 = toBase64; exports.fromBase64 = fromBase64; exports.isFile = isFile; exports.isDirectory = isDirectory; exports.ensureDir = ensureDir; exports.readJsonFile = readJsonFile; exports.writeJsonFile = writeJsonFile; exports.getMimeType = getMimeType; exports.getExtension = getExtension; exports.randomDelay = randomDelay; exports.retry = retry; exports.chunk = chunk; exports.flatten = flatten; exports.unique = unique; exports.groupBy = groupBy; exports.sortBy = sortBy;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
