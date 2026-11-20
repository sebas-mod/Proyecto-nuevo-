const { getDatabase } = require('../../src/lib/ourin-database.js');

const DEFAULT_EMOJIS = ['👋', '🎉', '✨', '🔥', '🌸', '🚀'];

function getConf(jid) {
  const db = getDatabase();
  const group = (db.data && db.data.groups && db.data.groups[jid]) || {};
  const chat = group.chat || {};
  if (!chat.reactevent) {
    chat.reactevent = { enabled: false, emojis: [...DEFAULT_EMOJIS] };
    if (db.setGroup) db.setGroup(jid, { chat });
  }
  return chat.reactevent;
}

function saveConf(jid, conf) {
  const db = getDatabase();
  const group = (db.data && db.data.groups && db.data.groups[jid]) || {};
  const chat = group.chat || {};
  chat.reactevent = conf;
  if (db.setGroup) db.setGroup(jid, { chat });
}

const pluginConfig = {
  name: 'reactevent',
  alias: ['revent', 'autoreactevent'],
  category: 'owner',
  description: 'Atur auto react untuk event grup (member masuk/keluar/update)',
  usage: '.reactevent <on|off|add|del|list> [emoji]',
  example: '.reactevent on',
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  limit: 0,
  isEnabled: true,
};

async function handler(m, context) {
  const { args, prefix } = context;
  const p = prefix || '.';
  const sub = (args[0] || '').toLowerCase();
  const emoji = args[1];
  const jid = m.chat;
  const conf = getConf(jid);

  if (!sub) {
    return m.reply(
      `📦 *AUTO REACT EVENT GRUP*\n\n` +
        `> Status di grup ini: ${conf.enabled ? 'ON ✅' : 'OFF ❌'}\n` +
        `> Daftar Emoji: ${conf.emojis.join(' ')}\n\n` +
        `*PERINTAH:*\n` +
        `> \`${p}reactevent on\`\n` +
        `> \`${p}reactevent off\`\n` +
        `> \`${p}reactevent add <emoji>\`\n` +
        `> \`${p}reactevent del <emoji>\`\n` +
        `> \`${p}reactevent list\``
    );
  }

  switch (sub) {
    case 'on':
      conf.enabled = true;
      saveConf(jid, conf);
      return m.reply('✅ Auto react event grup telah diaktifkan untuk grup ini.');

    case 'off':
      conf.enabled = false;
      saveConf(jid, conf);
      return m.reply('❌ Auto react event grup telah dinonaktifkan untuk grup ini.');

    case 'add':
      if (!emoji) return m.reply(`> Penggunaan: \`${p}reactevent add <emoji>\``);
      if (conf.emojis.includes(emoji)) return m.reply('⚠️ Emoji tersebut sudah terdaftar di list.');
      conf.emojis.push(emoji);
      saveConf(jid, conf);
      return m.reply(`✅ Emoji ${emoji} berhasil ditambahkan ke daftar react event.`);

    case 'del': {
      if (!emoji) return m.reply(`> Penggunaan: \`${p}reactevent del <emoji>\``);
      const idx = conf.emojis.indexOf(emoji);
      if (idx === -1) return m.reply('⚠️ Emoji tersebut tidak ada dalam daftar.');
      if (conf.emojis.length <= 1) return m.reply('⚠️ Minimal harus ada 1 emoji dalam daftar.');
      conf.emojis.splice(idx, 1);
      saveConf(jid, conf);
      return m.reply(`✅ Emoji ${emoji} berhasil dihapus dari daftar.`);
    }

    case 'list':
      return m.reply(`📋 *Daftar Emoji React Event:*\n${conf.emojis.join(' ')}`);

    default:
      return m.reply(`Perintah tidak dikenal. Pilihan: on, off, add, del, list.`);
  }
}

module.exports = {
  config: pluginConfig,
  handler,
  getConf,
  saveConf,
};
