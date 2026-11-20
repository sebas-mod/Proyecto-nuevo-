"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _admzip = require('adm-zip'); var _admzip2 = _interopRequireDefault(_admzip);

const pluginConfig = {
    name: 'deploy',
    alias: ['vercel'],
    category: 'owner',
    description: 'Deploy HTML atau file ZIP ke Vercel',
    usage: '.deploy <namawebsite>',
    example: '.deploy mysite',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const name = m.args[0]

    if (!name || !m.quoted) {
        return m.reply(
            `ℹ️ *INFORMASI PENGGUNAAN*\n\n` +
            `Fitur ini digunakan untuk melakukan *deploy* (hosting) kode HTML atau file proyek lengkap (ZIP) secara langsung ke Vercel.\n\n` +
            `*CONTOH PENGGUNAAN:*\n` +
            `• Reply teks/kode HTML dengan perintah: \`${m.prefix}deploy namasitus\`\n` +
            `• Reply file \`.html\` atau \`.zip\` dengan perintah: \`${m.prefix}deploy namasitus\``
        )
    }

    const token = _optionalChain([_configjs2.default, 'access', _ => _.vercel, 'optionalAccess', _2 => _2.token])
    if (!token) {
        return m.reply(`❌ *TOKEN BELUM DIATUR*\n\nToken Vercel belum dikonfigurasi di pengaturan sistem. Silakan atur \`config.vercel.token\` terlebih dahulu.`)
    }

    m.react('🕕')

    let filesPayload = []
    let isZip = false

    try {
        if (m.quoted.mimetype === 'application/zip' || (m.quoted.filename && m.quoted.filename.endsWith('.zip'))) {
            isZip = true
            const buffer = await m.quoted.download()
            const zip = new (0, _admzip2.default)(buffer)
            const zipEntries = zip.getEntries()

            for (const entry of zipEntries) {
                if (entry.isDirectory) continue
                if (entry.entryName.includes('__MACOSX')) continue

                filesPayload.push({
                    file: entry.entryName,
                    data: entry.getData().toString('base64'),
                    encoding: 'base64'
                })
            }

            if (filesPayload.length === 0) {
                m.react('❌')
                return m.reply(`❌ *FILE ZIP KOSONG*\n\nFile ZIP yang Anda unggah tidak berisi file apapun. Pastikan file ZIP tersebut berisi proyek HTML/Web statis.`)
            }
        } else if (
            m.quoted.mimetype === 'text/html' ||
            (m.quoted.filename && (m.quoted.filename.endsWith('.html') || m.quoted.filename.endsWith('.htm')))
        ) {
            const buffer = await m.quoted.download()
            filesPayload.push({
                file: 'index.html',
                data: buffer.toString('utf-8')
            })
        } else if (m.quoted.text || m.quoted.body) {
            let htmlContent = m.quoted.text || m.quoted.body
            if (!/<html|<!doctype html|<head|<body/i.test(htmlContent)) {
                htmlContent = `<!DOCTYPE html>\n<html lang="id">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${name}</title>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`
            }

            filesPayload.push({
                file: 'index.html',
                data: htmlContent
            })
        } else {
            m.react('❌')
            return m.reply(
                `❌ *FORMAT TIDAK DIDUKUNG*\n\n` +
                `Sistem hanya mendukung deploy dari format berikut:\n` +
                `• Teks kode HTML\n` +
                `• Dokumen \`.html\`\n` +
                `• Dokumen arsip \`.zip\``
            )
        }

        const payload = {
            name,
            project: name,
            target: 'production',
            files: filesPayload,
            projectSettings: {
                framework: null
            }
        }

        await _axios2.default.post(
            'https://api.vercel.com/v13/deployments',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        )

        let domain = `${name}.vercel.app`

        try {
            const domainsRes = await _axios2.default.get(
                `https://api.vercel.com/v9/projects/${name}/domains`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000
                }
            )

            const domains = domainsRes.data.domains || []

            domain =
                _optionalChain([domains, 'access', _3 => _3.find, 'call', _4 => _4(d => !d.name.endsWith('.vercel.app')), 'optionalAccess', _5 => _5.name]) ||
                _optionalChain([domains, 'access', _6 => _6.find, 'call', _7 => _7(d => d.name.endsWith('.vercel.app')), 'optionalAccess', _8 => _8.name]) ||
                domain
        } catch (e) {
            // fallback ke default domain jika gagal mengambil data domain
        }

        m.react('✅')

        await m.reply(
            `✅ *DEPLOY BERHASIL*\n\n` +
            `Proyek Anda telah berhasil diunggah ke Vercel dan saat ini sedang dalam proses penyebaran (building). Anda dapat segera mengaksesnya melalui tautan berikut.\n\n` +
            `*RINCIAN DEPLOY:*\n` +
            `• Nama Proyek: *${name}*\n` +
            `• Tipe Proyek: *${isZip ? 'ZIP Archive (Banyak File)' : 'Static HTML (File Tunggal)'}*\n` +
            `• Tautan: https://${domain}`
        )

    } catch (error) {
        m.react('❌')

        const err =
            _optionalChain([error, 'access', _9 => _9.response, 'optionalAccess', _10 => _10.data, 'optionalAccess', _11 => _11.error, 'optionalAccess', _12 => _12.message]) ||
            _optionalChain([error, 'access', _13 => _13.response, 'optionalAccess', _14 => _14.data, 'optionalAccess', _15 => _15.message]) ||
            error.message

        m.reply(`❌ *DEPLOY GAGAL*\n\nTerjadi kesalahan saat mencoba mengunggah proyek ke Vercel.\n\n*Penyebab Error:*\n> ${err}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
