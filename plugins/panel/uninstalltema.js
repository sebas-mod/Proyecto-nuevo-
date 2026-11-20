"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ssh2 = require('ssh2');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: ['uinstalltema', 'uninstalltema', 'removetema', 'hapustema'],
    alias: [],
    category: 'panel',
    description: 'Uninstall tema Pterodactyl via SSH',
    usage: '.uinstalltema <ip>|<password>',
    example: '.uinstalltema 192.168.1.1|secretpass',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])
    
    if (!text) {
        return m.reply(
            `╭┈┈⬡「 🗑️ *ᴜɴɪɴsᴛᴀʟʟ ᴛᴇᴍᴀ* 」
┃ ㊗ ᴜsᴀɢᴇ: \`${m.prefix}uinstalltema <ip>|<password>\`
╰┈┈⬡

> \`Contoh: ${m.prefix}uinstalltema 192.168.1.1|secretpass\``
        )
    }
    
    const parts = text.split('|')
    if (parts.length < 2) {
        return m.reply(`❌ Formato incorrecto! Usa: \`* Contraseña*\``)
    }
    
    const ipvps = parts[0].trim()
    const passwd = parts[1].trim()
    
    global.installtema = { vps: ipvps, pwvps: passwd }
    
    const connSettings = {
        host: ipvps,
        port: 22,
        username: 'root',
        password: passwd
    }
    
    const command = `bash <(curl -s https://raw.githubusercontent.com/veryLinh/Theme-Autoinstaller/main/install.sh)`
    const ress = new (0, _ssh2.Client)()
    
    m.react('🕕')
    await m.reply(`🕕*ᴍᴇᴍᴘʀᴏSᴇSᴜɴɪɴSᴛᴀʟʟ ᴛᴇᴍᴀ...\n\n*Espera 1 - 10 minutos* *El proceso naranja está completo*`)
    
    ress.on('ready', () => {
        ress.exec(command, (err, stream) => {
            if (err) {
                m.react('☢')
                return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
            }
            
            stream.on('close', async () => {
                m.react('✅')
                await m.reply(
                    `╭┈┈⬡「 ✅ *ᴜɴɪɴsᴛᴀʟʟ ᴛᴇᴍᴀ* 」
┃ ㊗Sᴛᴀᴛᴜs: *Exito*
┃ ㊗ ɪᴘ: ${ipvps}
╰┈┈⬡

Tema desinstalado con éxito`
                )
                ress.end()
            }).on('data', (data) => {
                console.log('[UninstallTema]', data.toString())
                stream.write('skyzodev\n')
                stream.write('2\n')
                stream.write('y\n')
                stream.write('x\n')
            }).stderr.on('data', (data) => {
                console.log('[UninstallTema STDERR]', data.toString())
            })
        })
    }).on('error', (err) => {
        console.log('[SSH Error]', err)
        m.react('❌')
        m.reply(`❌Conexión fallido!\n\nAkeiP o Passard es inválido.`)
    }).connect(connSettings)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
