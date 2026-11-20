"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinapimanagerjs = require('../../src/lib/ourin-apimanager.js'); var _ourinapimanagerjs2 = _interopRequireDefault(_ourinapimanagerjs);
const pluginConfig = {
  name: "brat",
  alias: ["bratmenu", "bratimg", "brattext"],
  category: "sticker",
  description: "Fresco de la variante de la med y hematoma de la pegatina del generador",
  usage: ".brat | .bratimg <text>",
  example: ".bratimg Hai semua",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const BRAT_VARIANTS = [
  {
    title: "Brat Default",
    description: "Sticker brat versi biasa",
    command: "bratimg",
  },
  {
    title: "Brat Green",
    description: "Variant brat warna hijau",
    command: "bratgreen",
  },
  {
    title: "Brat Cewek",
    description: "Variant brat cewek",
    command: "bratcewek",
  },
  {
    title: "Brat Vermeil",
    description: "Variant brat Vermeil",
    command: "bratvermeil",
  },
  { title: "Brat HD", description: "Variant brat HD", command: "brathd" },
  {
    title: "Brat Video",
    description: "Sticker brat animated",
    command: "bratvid",
  },
  {
    title: "Brat Video V2",
    description: "Sticker brat video v2",
    command: "bratvid2",
  },
  {
    title: "Brat Vermeil Video",
    description: "Variant brat Vermeil video",
    command: "bratvermeilvid",
  },
  {
    title: "Brat Gojo",
    description: "Variant brat Gojo",
    command: "bratgojo",
  },
  {
    title: "Brat Gojo Video",
    description: "Variant brat Gojo video",
    command: "bratgojovid",
  },
];

function buildVariantRows(prefix, text) {
  return BRAT_VARIANTS.map((item) => ({
    title: item.title,
    description: `${item.description} • .${item.command} <text>`,
    id: `${prefix}${item.command} ${text}`,
  }));
}

async function sendBratMenu(m, sock, text) {
  const caption =
    "🌿* Quieres hacer una mocosa de yak, adelante y elegir una variedad de cejas y buffel brat en la capucha *";
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌾 Pilih Variant Brat",
        sections: [
          {
            title: "Variant Brat",
            rows: buildVariantRows(m.prefix, text),
          },
        ],
      }),
    },
  ];

  await sock.sendButton(
    m.chat,
    _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin"),
    caption,
    m,
    {
      buttons,
      footer: "Elija su variedad favorita de mocos.",
    },
  );
}

async function handler(m, { sock }) {
  const text = m.text;
  const command = String(m.command || "").toLowerCase();

  if (command === "brat") {
    await sendBratMenu(m, sock, text);
    return;
  }

  if (!text) {
    return m.reply(
      `🖼♪ʙʀᴀᴛ ɪᴍᴀɢᴇ*\n\n*Pon los mensajes*\n\n\`Ejemplo:${m.prefix}bratimg Hola a todos\``,
    );
  }

  m.react("🕕");

  try {
    await sock.sendImageAsSticker(m.chat, `https://api.nexray.eu.cc/maker/brat?text=${encodeURIComponent(text)}`, m, {
      packname: _configjs2.default.sticker.packname,
      author: _configjs2.default.sticker.author,
    });

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
