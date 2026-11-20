"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "invoicemaker",
  alias: ["invoice", "faktur", "nota"],
  category: "maker",
  description: "Membuat invoice/nota penjualan",
  usage: ".invoicemaker <toko>|<invoice>|<tanggal>|<status>|<items>|<total>",
  example:
    ".invoicemaker TokoKu|INV001|15/01/2026|paid|Nasi Goreng:1x:15000,Es Teh:2x:6000|21000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

async function handler(m, { sock }) {
  const args = m.args || [];
  const text = args.join(" ");

  if (!text || !text.includes("|")) {
    return m.reply(
      `🧾 *ɪɴᴠᴏɪᴄᴇ ᴍᴀᴋᴇʀ*\n\n` +
        `╭┈┈⬡「 📋 *ꜰᴏʀᴍᴀᴛ* 」\n` +
        `┃ \`${m.prefix}invoicemaker <toko>|<invoice>|<tanggal>|<status>|<items>|<total>\`\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 📝 *ᴘᴀʀᴀᴍᴇᴛᴇʀ* 」\n` +
        `┃ •tienda: Nombre de la tienda\n` +
        `┃ •factura: Número de factura\n` +
        `┃ • fecha: Formato DD/MM/YYYY\n` +
        `┃ • status: paid/unpaid\n` +
        `┃ •items: nombre: cantidad: precio (separados por coma)\n` +
        `┃ •total: precio total\n` +
        `╰┈┈⬡\n\n` +
        `> Ejemplo:\n` +
        `\`${m.prefix}invoicemaker TokoKu|INV001|15/01/2026|paid|Arroz Goreng:1x:15000,Es Te:2x6000\``,
    );
  }

  const parts = text.split("|").map((p) => p.trim());

  if (parts.length < 6) {
    return m.reply(
      `❌¡El formal es incompleto!`,
    );
  }

  const [store, invoice, date, status, itemsRaw, totalRaw] = parts;

  if (!["paid", "unpaid"].includes(status.toLowerCase())) {
    return m.reply(`❌¡El estado debe perdonar, odiar o odiar!`);
  }

  const itemsArr = itemsRaw.split(",").map((item) => {
    const [name, unit, price] = item.split(":").map((i) => i.trim());
    return {
      name: name || "Item",
      unit: unit || "1x",
      price: parseInt(price) || 0,
    };
  });

  if (itemsArr.length === 0 || itemsArr.some((i) => !i.name)) {
    return m.reply(
      `❌Formatos incorrectos! Uso: Nombre: unidad: precio ( romper coma para múltiples )`,
    );
  }

  const total =
    parseInt(totalRaw) || itemsArr.reduce((sum, i) => sum + i.price, 0);

  m.react("🧾");

  try {
    const qrImage = "https://i.ibb.co.com/kt5fyrg/qr.jpg";

    const url =
      `https://api.neoxr.eu/api/invoice-maker?` +
      `store=${encodeURIComponent(store)}` +
      `&invoice=${encodeURIComponent(invoice)}` +
      `&date=${encodeURIComponent(date)}` +
      `&status=${status.toLowerCase()}` +
      `&image=${encodeURIComponent(qrImage)}` +
      `&items=${encodeURIComponent(JSON.stringify(itemsArr))}` +
      `&total=${total}` +
      `&apikey=${NEOXR_APIKEY}`;

    const response = await _axios2.default.get(url, { timeout: 60000 });

    if (!_optionalChain([response, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.status]) || !_optionalChain([response, 'access', _5 => _5.data, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.image, 'optionalAccess', _8 => _8.url])) {
      throw new Error("API no devolvió datos válidos");
    }

    const imageUrl = response.data.data.image.url;
    const data = response.data.data;

    const saluranId = _optionalChain([_configjs2.default, 'access', _9 => _9.saluran, 'optionalAccess', _10 => _10.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _11 => _11.saluran, 'optionalAccess', _12 => _12.name]) || _optionalChain([_configjs2.default, 'access', _13 => _13.bot, 'optionalAccess', _14 => _14.name]) || "Ourin-AI";

    let caption = `🧾 *ɪɴᴠᴏɪᴄᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ*\n\n`;
    caption += `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n`;
    caption += `┃ 🏪Tienda: *${data.store}*\n`;
    caption += `┃ 🔢 Invoice: *${data.invoice}*\n`;
    caption += `┃ 📅 Fecha: *${data.date}*\n`;
    caption += `┃ 📌 Status: *${data.status === "paid" ? "✅ LUNAS" : "❌ BELUM LUNAS"}*\n`;
    caption += `╰┈┈⬡\n\n`;

    caption += `╭┈┈⬡「 🛒 *ɪᴛᴇᴍs* 」\n`;
    data.items.forEach((item, i) => {
      caption += `┃ ${i + 1}. ${item.name} (${item.unit}) - Rp${item.price.toLocaleString("es-AR")}\n`;
    });
    caption += `╰┈┈⬡\n\n`;

    caption += `> 💰 Total: *Rp${data.total.toLocaleString("es-AR")}*`;

    await sock.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      },
      { quoted: m },
    );

    m.react("✅");
  } catch (err) {
    m.react("☢");
    return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
