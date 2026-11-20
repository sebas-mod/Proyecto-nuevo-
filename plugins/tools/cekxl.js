"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: "cekxl",
    alias: ["checkxl", "xlcheck", "xlcek"],
    category: "tools",
    description: "Compruebe la información del paquete y los números de kuotta XL / Axse detalla",
    usage: ".cekxl <nomor>",
    example: ".cekxl 083150850721",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function cleanNumber(phoneNumber) {
    let num = phoneNumber.replace(/\D/g, "")
    if (num.startsWith("0")) num = "62" + num.substring(1)
    if (!num.startsWith("62")) num = "62" + num
    return num
}

function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return "0 B"
    const units = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + units[i]
}

async function handler(m, { sock }) {
    const input = m.args[0] || _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!input) {
        return m.reply(
            `📱*Comprueba XL/AXIS*\n\n` +
            `Está característica se utiliza para comprobar la información del paquete y la cuota disponible en números XL o Ax¿Es que está completamente y detallado?\n\n` +
            `*Como usarlo:*\n` +
            `> \`${m.prefix}cekxl <nomor hp>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}cekxl 083150850721\`\n` +
            `> \`${m.prefix}cekxl 6281234567890\`\n\n` +
            `*Los números de formato pueden usar 08*xx, 628xx, o sin un prefijo _`
        )
    }

    const cleanNum = cleanNumber(input)

    if (cleanNum.length < 10 || cleanNum.length > 15) {
        return m.reply(`❌El número que ingresó es inválido, así que asegúrese de que el número es XL o A.xes verdad que sí`)
    }

    m.react("🕕")

    try {
        const { data } = await _axios2.default.get(
            `https://xl-ku.my.id/end.php?check=package&number=${cleanNum}&version=2`,
            { timeout: 30000 }
        )

        if (!data || data.error || data.status === false) {
            m.react("❌")
            return m.reply(`❌No se puede comprobar los números *${cleanNum}*, asegúrese de que el número es XL o Axactivo`)
        }

        let txt = `📱*Información XL/AXIS*\n\n`
        txt += `📞Número: *${cleanNum}*\n`

        if (data.msisdn) txt += `🆔 MSISDN: *${data.msisdn}*\n`
        if (data.status) txt += `📊 Status: *${data.status}*\n`
        if (data.activeDate) txt += `📅Activo avanzado: *${data.activeDate}*\n`
        if (data.expireDate) txt += `⏰Tiempo activo: *${data.expireDate}*\n`
        if (data.graceDate) txt += `⚠️ Masa Tenggang: *${data.graceDate}*\n`

        if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
            txt += `\n📦 *Registrate Paquete Activo*\n\n`
            for (const pkg of data.packages) {
                txt += `- *${pkg.name || pkg.packageName || "Paket"}*\n`
                if (pkg.quota || pkg.remainingQuota) txt += `Ayasa Kuotta: *${pkg.remainingQuota || pkg.quota}*\n`
                if (pkg.totalQuota) txt += `Total Kuotta:${pkg.totalQuota}*\n`
                if (pkg.expireDate || pkg.validUntil) txt += `# Ve a tu lugar de trabajo #${pkg.expireDate || pkg.validUntil}*\n`
                if (pkg.type) txt += `  > Tipe: *${pkg.type}*\n`
                txt += `\n`
            }
        }

        if (data.balance || data.pulsa) {
            txt += `💰* Saldo ]\n`
            txt += `Pulso:${data.balance || data.pulsa}*\n\n`
        }

        if (data.result && typeof data.result === "object") {
            const r = data.result
            if (r.name) txt += `👤Nombre del parche: *${r.name}*\n`
            if (r.quota) txt += `📊Datos moviles: *${r.quota}*\n`
            if (r.masa_aktif) txt += `📅Tiempo activo: *${r.masa_aktif}*\n`
            if (r.status) txt += `📊 Status: *${r.status}*\n`
        }

        if (typeof data === "object" && !data.packages && !data.result) {
            const skipKeys = ["error", "status", "msisdn", "activeDate", "expireDate", "graceDate", "balance", "pulsa"]
            const extraKeys = Object.keys(data).filter(k => !skipKeys.includes(k))
            if (extraKeys.length > 0) {
                txt += `\n📋*DETAIL Otros*\n\n`
                for (const key of extraKeys) {
                    const val = data[key]
                    if (typeof val === "string" || typeof val === "number") {
                        txt += `- ${key}: *${val}*\n`
                    }
                }
            }
        }

        m.react("✅")
        await m.reply(txt.trim())

    } catch (error) {
        m.react("☢")
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
