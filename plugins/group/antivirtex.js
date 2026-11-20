const { getDatabase } = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: 'antivirtex',
  alias: ['antivirtexgc', 'antivtxt', 'antitxtv'],
  category: 'group',
  description: 'Hapus otomatis pesan yang mengandung virtex / karakter crash di grup',
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
        `⚠️ *ANTIVIRTEX SUDAH AKTIF*\n\n` +
          `> Status: *✅ ON*\n` +
          `> Proteksi anti virtex sudah berjalan di grup ini.`
      );
    }
    if (db.setGroup) db.setGroup(m.chat, { antivirtex: true });
    return m.reply(
      `✅ *ANTIVIRTEX DIAKTIFKAN*\n\n` +
        `> Pesan yang terdeteksi mengandung virtex / karakter perusak akan otomatis dihapus oleh bot.\n` +
        `> Gunakan \`${p}antivirtex off\` untuk menonaktifkan.`
    );
  }

  if (mode === 'off') {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ANTIVIRTEX SUDAH NONAKTIF*\n\n` +
          `> Status: *❌ OFF*\n` +
          `> Proteksi anti virtex tidak aktif di grup ini.`
      );
    }
    if (db.setGroup) db.setGroup(m.chat, { antivirtex: false });
    return m.reply(`❌ *ANTIVIRTEX DINONAKTIFKAN*\n\n> Bot tidak akan menghapus pesan virtex lagi.`);
  }

  const status = currentStatus ? '✅ AKTIF' : '❌ NONAKTIF';

  return m.reply(
    `🛡️ *PROTEKSI ANTI VIRTEX*\n\n` +
      `╭┈┈⬡「 📋 *STATUS* 」\n` +
      `┃ 🔔 Status: ${status}\n` +
      `╰┈┈⬡\n\n` +
      `> *Panduan:*\n` +
      `> \`${p}antivirtex on\` — Aktifkan proteksi\n` +
      `> \`${p}antivirtex off\` — Nonaktifkan proteksi`
  );
}

module.exports = {
  config: pluginConfig,
  handler,
  isVirtex,
};
