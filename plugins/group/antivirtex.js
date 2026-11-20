const { getDatabase } = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: 'antivirtex',
  alias: ['antivirtexgc', 'antivtxt', 'antitxtv'],
  category: 'group',
  description: 'Quitar el mensje de automatización que lleva virtex/ personajes de choque en grupo',
  usage: '.antivirtex on/off',
  example: '.antivirtex on',
  isAdmin: true,
  isBotAdmin: true,
  isGroup: true,
  isOwner: false,
  isPremium: false,
  isPrivate: false,
  cooldown: 3,
  limit: 0,
  isEnabled: true,
};

function isVirtex(text) {
  if (!text || typeof text !== 'string') return false;

  const virtexPatterns = [
    /[\x00-\x1F\x7F]/g,
    /[\u200B-\u200D\uFEFF]/g,
    /[\uD800-\uDFFF]{2,}/g,
    /[^\x20-\x7E\x0A\x0D\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/g,
    /(.)\1{25,}/g,
    /.{1500,}/g,
    /[\u2000-\u200F\uFEFF\u00AD-\uFFFF]/g,
    /[\u0300-\u036F]{5,}/g,
  ];

  for (const pattern of virtexPatterns) {
    if (pattern.test(text)) return true;
  }

  let unicodeCount = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0x7f && code < 0x0600) unicodeCount++;
    if (code > 0x06ff && code < 0x4e00) unicodeCount++;
    if (code > 0x9fff && code < 0x3040) unicodeCount++;
    if (code > 0x30ff && code < 0x1100) unicodeCount++;
  }
  if (unicodeCount > text.length * 0.7 && text.length > 50) return true;

  return false;
}

async function handler(m, context) {
  const { args, prefix } = context;
  const db = getDatabase();
  const mode = (args[0] || '').toLowerCase();
  const p = prefix || '.';

  const groupData = (db.data && db.data.groups && db.data.groups[m.chat]) || {};
  const currentStatus = groupData.antivirtex === true;

  if (mode === 'on') {
    if (currentStatus) {
      return m.reply(
        `⚠*Antiviro* *Golpéalo*\n\n` +
          `> Status: *✅ ON*\n` +
          `*Proyecciones de anti @-@ virte*xYa está funcionando en este grupo.`
      );
    }
    if (db.setGroup) db.setGroup(m.chat, { antivirtex: true });
    return m.reply(
      `✅*ANTIVIRTEX Activado*\n\n` +
        `El mensaje detestable está embarazada de virtex- El carácter carpintería de la automatización está siendo remolcado por las botas.\n` +
        `> Usa \`${p}antivistaxapagado\`para desactivando.`
    );
  }

  if (mode === 'off') {
    if (!currentStatus) {
      return m.reply(
        `⚠*Antíviro* *Te quiero, nena*\n\n` +
          `> Status: *❌ OFF*\n` +
          `*Proyecciones de anti @-@ virte*xFuera de la red.`
      );
    }
    if (db.setGroup) db.setGroup(m.chat, { antivirtex: false });
    return m.reply(`❌*ANTIVIRTEX Desactivado*\n\nNunca olvidaré un mensaje virtoxotra vez.`);
  }

  const status = currentStatus ? '✅ AKTIF' : '❌ NONAKTIF';

  return m.reply(
    `🛡️ *PROTEKSI ANTI VIRTEX*\n\n` +
      `╭┈┈⬡「 📋 *STATUS* 」\n` +
      `┃ 🔔 Status: ${status}\n` +
      `╰┈┈⬡\n\n` +
      `> *Guia:*\n` +
      `> \`${p}antivistaxon\` —Activa proteksi\n` +
      `> \`${p}antivistaxapagado\` —Desactiva proteksi`
  );
}

module.exports = {
  config: pluginConfig,
  handler,
  isVirtex,
};
