"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _url = require('url');
var _path = require('path'); var _path2 = _interopRequireDefault(_path);

// __filename provided by CJS
// __dirname provided by CJS

const pluginConfig = {
    name: 'cjstoesm',
    alias: ['cjs2esm', 'cjsconvert'],
    category: 'tools',
    description: 'Convert CommonJS ke ESM (ES Modules)',
    usage: '.cjstoesm <reply kode>',
    example: '.cjstoesm',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

function convertCjsToEsm(code) {
    let result = code

    result = result.replace(/(?:const|let|var)\s*\{\s*([^}]+)\s*\}\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;?/g, (match, imports, path) => {
        const items = imports.split(',').map(i => {
            const parts = i.trim().split(/\s*:\s*/)
            if (parts.length === 2) return `${parts[0].trim()} as ${parts[1].trim()}`
            return parts[0].trim()
        })
        return `import { ${items.join(', ')} } from '${path}';`
    })

    result = result.replace(/(?:const|let|var)\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)\.(\w+)\s*;?/g, (match, name, path, prop) => {
        if (name === prop) return `import { ${prop} } from '${path}';`
        return `import { ${prop} as ${name} } from '${path}';`
    })

    result = result.replace(/(?:const|let|var)\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)\.default\s*;?/g, (match, name, path) => {
        return `import ${name} from '${path}';`
    })

    result = result.replace(/(?:const|let|var)\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;?/g, (match, name, path) => {
        return `import ${name} from '${path}';`
    })

    result = result.replace(/^require\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;?$/gm, (match, path) => {
        return `import '${path}';`
    })

    result = result.replace(/module\.exports\s*=\s*\{([^}]+)\}\s*;?/g, (match, exports) => {
        const items = exports.split(',').map(i => {
            const parts = i.trim().split(/\s*:\s*/)
            if (parts.length === 2) return `${parts[1].trim()} as ${parts[0].trim()}`
            return parts[0].trim()
        })
        return `export { ${items.join(', ')} };`
    })

    result = result.replace(/module\.exports\s*=\s*(async\s+)?(function|class)\s*(\w*)\s*(\([^)]*\))?\s*\{/g, (match, async, type, name, params) => {
        if (name) return `export predeterminado${async || ''}${type} ${name}${params || ''} {`
        return `export predeterminado${async || ''}${type}${params || ''} {`
    })

    result = result.replace(/module\.exports\s*=\s*(async\s+)?\(([^)]*)\)\s*=>/g, (match, async, params) => {
        return `export predeterminado${async || ''}(${params}) =>`
    })

    result = result.replace(/module\.exports\s*=\s*([^;\n]+)\s*;?/g, (match, value) => {
        return `export predeterminado${value};`
    })

    result = result.replace(/exports\.(\w+)\s*=\s*(async\s+)?function\s*(\w*)\s*(\([^)]*\))?\s*\{/g, (match, exportName, async, name, params) => {
        return `export ${async || ''}function ${exportName}${params || ''} {`
    })

    result = result.replace(/exports\.(\w+)\s*=\s*(async\s+)?\(([^)]*)\)\s*=>\s*\{/g, (match, exportName, async, params) => {
        return `export const ${exportName} = ${async || ''}(${params}) => {`
    })

    result = result.replace(/exports\.(\w+)\s*=\s*(\w+)\s*;?/g, (match, key, value) => {
        if (key === value) return `export { ${key} };`
        return `export { ${value} as ${key} };`
    })

    result = result.replace(/exports\.(\w+)\s*=\s*([^;\n]+)\s*;?/g, (match, key, value) => {
        if (/^(async|function|\(|class)/.test(value.trim())) return match
        return `export const ${key} = ${value};`
    })

    result = result.replace(/module\.exports\.(\w+)\s*=\s*(\w+)\s*;?/g, (match, key, value) => {
        if (key === value) return `export { ${key} };`
        return `export { ${value} as ${key} };`
    })

    result = result.replace(/Object\.assign\s*\(\s*module\.exports\s*,\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)\s*;?/g, (match, path) => {
        return `export * from '${path}';`
    })

    if ((result.includes('__dirname') || result.includes('__filename')) && !result.includes('fileURLToPath')) {
        const helperCode = `import { fileURLToPath } from 'url';\nimport { dirname } from 'path';\n// __filename provided by CJS\nconst __dirname = dirname(__filename);\n\n`
        result = helperCode + result
    }

    result = result.replace(/\n{3,}/g, '\n\n')

    return result.trim()
}

async function handler(m, { sock }) {
    let code = m.quotedBody || _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!code) {
        return m.reply(
            `🔄 *ᴄᴊs ᴛᴏ ᴇsᴍ ᴄᴏɴᴠᴇʀᴛᴇʀ*\n\n` +
            `> Convert CommonJS ke ES Modules\n\n` +
            `*Oh, oh, oh, oh, oh *\n` +
            `* Responder código CJS con${m.prefix}cjstoesm\n\n` +
            `* Laughter *\n` +
            `> \`const axios = require('axios')\`\n` +
            `> \`module.exports = handler\``
        )
    }

    try {
        const converted = await convertCjsToEsm(code)
        await sock.sendCodeBlock(m.chat, converted, m)
    } catch (error) {
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
