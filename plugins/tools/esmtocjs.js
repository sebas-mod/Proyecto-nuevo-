"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
    name: 'esmtocjs',
    alias: ['esm2cjs', 'esmconvert'],
    category: 'tools',
    description: 'Convert ESM (ES Modules) ke CommonJS',
    usage: '.esmtocjs <reply kode>',
    example: '.esmtocjs',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

function convertEsmToCjs(code) {
    let result = code
    const exportedItems = []
    let hasDefaultExport = false
    let defaultExportValue = null

    result = result.replace(/import\s+(\w+)\s*,\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"]\s*;?/g, (m, def, named, path) => {
        const items = named.split(',').map(i => i.trim()).join(', ')
        return `const ${def} = require('${path}')\nconst { ${items} } = require('${path}')`
    })

    result = result.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g, (m, name, path) => {
        return `const ${name} = require('${path}')`
    })

    result = result.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"]\s*;?/g, (m, imports, path) => {
        const items = imports.split(',').map(i => {
            const parts = i.trim().split(/\s+as\s+/)
            if (parts.length === 2) return `${parts[0]}: ${parts[1]}`
            return parts[0]
        })
        return `const { ${items.join(', ')} } = require('${path}')`
    })

    result = result.replace(/import\s*\*\s*as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g, (m, name, path) => {
        return `const ${name} = require('${path}')`
    })

    result = result.replace(/import\s+['"]([^'"]+)['"]\s*;?/g, (m, path) => {
        return `require('${path}')`
    })

    result = result.replace(/export\s+default\s+(\w+)\s*;?/g, (m, name) => {
        hasDefaultExport = true
        defaultExportValue = name
        return ''
    })

    result = result.replace(/export\s+default\s+(function|class|async\s+function)\s*(\w*)\s*(\([^)]*\))?\s*\{/g, (m, type, name, params) => {
        hasDefaultExport = true
        if (name) {
            defaultExportValue = name
            return `${type} ${name}${params || ''} {`
        }
        defaultExportValue = '__default__'
        return `const __default__ = ${type}${params || ''} {`
    })

    result = result.replace(/export\s+default\s+(\{[\s\S]*?\})\s*;?/g, (m, obj) => {
        hasDefaultExport = true
        defaultExportValue = obj
        return ''
    })

    result = result.replace(/export\s*\{\s*([^}]+)\s*\}\s*;?/g, (m, exports) => {
        exports.split(',').forEach(i => {
            const parts = i.trim().split(/\s+as\s+/)
            if (parts.length === 2) {
                exportedItems.push({ name: parts[0], alias: parts[1] })
            } else {
                exportedItems.push({ name: parts[0], alias: null })
            }
        })
        return ''
    })

    result = result.replace(/export\s+(const|let|var)\s+(\w+)\s*=/g, (m, type, name) => {
        exportedItems.push({ name, alias: null })
        return `${type} ${name} =`
    })

    result = result.replace(/export\s+(async\s+)?function\s+(\w+)/g, (m, async, name) => {
        exportedItems.push({ name, alias: null })
        return `${async || ''}function ${name}`
    })

    result = result.replace(/export\s+class\s+(\w+)/g, (m, name) => {
        exportedItems.push({ name, alias: null })
        return `class ${name}`
    })

    result = result.replace(/export\s*\*\s*from\s+['"]([^'"]+)['"]\s*;?/g, (m, path) => {
        return `Object.assign(module.exports, require('${path}'))`
    })

    let exportCode = ''

    if (hasDefaultExport) {
        exportCode += `\nmodule.exports = ${defaultExportValue}`
    }

    if (exportedItems.length > 0) {
        const items = exportedItems.map(e => e.alias ? `${e.alias}: ${e.name}` : e.name).join(', ')
        exportCode += hasDefaultExport
            ? `\nmodule.exports = { ...module.exports, ${items} }`
            : `\nmodule.exports = { ${items} }`
    }

    result = result.trim() + exportCode
    result = result.replace(/\n{3,}/g, '\n\n')

    return result
}

async function handler(m, { sock }) {
    let code = m.quotedBody || _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!code) {
        return m.reply(
            `🔄 *ᴇsᴍ ᴛᴏ ᴄᴊs ᴄᴏɴᴠᴇʀᴛᴇʀ*\n\n` +
            `> Convert ES Modules ke CommonJS\n\n` +
            `*Oh, oh, oh, oh, oh *\n` +
            `# Responder code ESM with${m.prefix}esmtocjs\n\n` +
            `> *Ejemplo ESM:*\n` +
            `> \`import axios from 'axios'\`\n` +
            `♪\`exfunción por defecto del puerto ( ){}\``
        )
    }

    try {
        await sock.sendCodeBlock(m.chat, convertEsmToCjs(code), m)
    } catch (error) {
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
