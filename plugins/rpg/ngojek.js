"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "ngojek",
  alias: ["ojek", "gojek", "ojol"],
  category: "rpg",
  description: "Hablar para conseguir dinero",
  usage: ".ngojek",
  example: ".ngojek",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const staminaCost = 15;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`El motor de Mesin es un hermano caliente mucho, que se descansó antes!🥵🏍♪💨\n\nHabar mierda${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}Ve a hablar con ella.☕`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🏍️");

  const orders = [
    { type: "🍔 GoFood", distance: "2km", min: 5000, max: 15000 },
    { type: "👤 GoRide", distance: "5km", min: 10000, max: 25000 },
    { type: "📦 GoSend", distance: "3km", min: 8000, max: 20000 },
    { type: "🛒 GoMart", distance: "4km", min: 12000, max: 30000 },
    { type: "👥 GoRide Plus", distance: "10km", min: 20000, max: 50000 },
  ];

  const order = orders[Math.floor(Math.random() * orders.length)];
  const earning = Math.floor(Math.random() * (order.max - order.min + 1)) + order.min;
  const tips = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) + 1000 : 0;
  const totalEarning = earning + tips;

  await m.reply(`Motores de potencia, niveles de gas, pasajeros de búsqueda.🏍♪💨\nHay orden${order.type}* sejauh *${order.distance}* aquí, Gasss!🗺♪`);
  await new Promise((r) => setTimeout(r, 3000));

  user.koin = (user.koin || 0) + totalEarning;

  const expGain = Math.floor(totalEarning / 20);
  const levelResult = await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  db.save();

  await m.react("✅");

  let txt = `ALHAMDULILLAH ORDERAN KELAR! 🏍️✨\n\n`;
  txt += `El detalle de hoy en espiral:\n`;
  txt += `📱 Tipe: *${order.type}*\n`;
  txt += `💵 Tarif: *+Rp ${earning.toLocaleString("id-ID")}*\n`;
  if (tips > 0) {
    txt += `🎁 Tips Customer: *+Rp ${tips.toLocaleString("id-ID")}*\n`;
  }
  txt += `📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Stamina: *-${staminaCost}*\n\n`;
  txt += `Lumayan crea nambah-nambahin jajan hermano! Semangat narik otra vez luego! 🔥💪`;

  m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
