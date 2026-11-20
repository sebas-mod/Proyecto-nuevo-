"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'githubdl',
    alias: ['gitdl', 'gitclone', 'repodownload'],
    category: 'download',
    description: 'Download repository GitHub sebagai ZIP',
    usage: '.githubdl <user> <repo> <branch>',
    example: '.githubdl niceplugin NiceBot main',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    let username, repo, branch
    
    if (_optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.includes, 'call', _3 => _3('github.com')])) {
        const urlMatch = args[0].match(/github\.com\/([^\/]+)\/([^\/]+)/i)
        if (urlMatch) {
            username = urlMatch[1]
            repo = urlMatch[2].replace(/\.git$/, '')
            branch = args[1] || 'main'
        }
    } else {
        username = args[0]
        repo = args[1]
        branch = args[2] || 'main'
    }
    
    if (!username) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}githubdl <user> <repo> <branch>\`\n\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}githubdl niceplugin NiceBot main\`\n` +
            `> \`${m.prefix}githubdl https://github.com/user/repo\``
        )
    }
    
    if (!repo) {
        return m.reply(`❌ *ʀᴇᴘᴏ ᴅɪʙᴜᴛᴜʜᴋᴀɴ*\n\n> Masukkan nama repository`)
    }
    
    await m.react('🕕')

    try {
        const repoInfo = await fetch(`https://api.github.com/repos/${username}/${repo}`)
        
        if (!repoInfo.ok) {
            await m.react('❌')
            return m.reply(`❌ *ʀᴇᴘᴏ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n> \`${username}/${repo}\` tidak ada`)
        }
        
        const repoData = await repoInfo.json()
        const defaultBranch = repoData.default_branch || 'main'
        branch = branch || defaultBranch
        
        const zipUrl = `https://github.com/${username}/${repo}/archive/refs/heads/${branch}.zip`
        
        const checkRes = await fetch(zipUrl, { method: 'HEAD' })
        if (!checkRes.ok) {
            await m.react('❌')
            return m.reply(`❌ *ʙʀᴀɴᴄʜ ᴛɪᴅᴀᴋ ᴀᴅᴀ*\n\n> Branch \`${branch}\` tidak ditemukan\n> Default: \`${defaultBranch}\``)
        }
        
        await sock.sendMedia(m.chat, zipUrl, null, m, {
            type: 'document',
            fileName: `${repo} - Branch: ${branch}.zip`,
            mimetype: 'application/zip',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })
        
        await m.react('✅')
        
    } catch (e) {
        await m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
