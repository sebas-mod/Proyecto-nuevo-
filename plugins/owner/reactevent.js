const { getDatabase } = require('../../src/lib/almiku-database.js');

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
  description: 'Configure auto reacciona para el evento grupo ( photo en / out / actualización )',
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
      `📦* AUTO REACT EVENT Grupo *\n\n` +
        `*Estado en este grupo:*${conf.enabled ? 'ON ✅' : 'OFF ❌'}\n` +
        `Lista Emoji:${conf.emojis.join(' ')}\n\n` +
        `*Comando:*\n` +
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
      return m.reply('✅El evento de reacción automática grupo ha sido activado para ègrupo.');

    case 'off':
      conf.enabled = false;
      saveConf(jid, conf);
      return m.reply('❌El evento de reacción automática grupo ha sido desactivado para ègrupo.');

    case 'add':
      if (!emoji) return m.reply(`> Uso: \`${p}reactevent add <emoji>\``);
      if (conf.emojis.includes(emoji)) return m.reply('⚠La lista de Emoji ya está en la lista.');
      conf.emojis.push(emoji);
      saveConf(jid, conf);
      return m.reply(`✅ Emoji ${emoji}Exterminado exitosamente a la lista de eventos récord.`);

    case 'del': {
      if (!emoji) return m.reply(`> Uso: \`${p}reactevent del <emoji>\``);
      const idx = conf.emojis.indexOf(emoji);
      if (idx === -1) return m.reply('⚠El Emoji no está en la lista.');
      if (conf.emojis.length <= 1) return m.reply('⚠Al menos un emoji debería estar en la lista.');
      conf.emojis.splice(idx, 1);
      saveConf(jid, conf);
      return m.reply(`✅ Emoji ${emoji}Lo tengo fuera de la lista.`);
    }

    case 'list':
      return m.reply(`📋* Lista Emoji React Event: *\n${conf.emojis.join(' ')}`);

    default:
      return m.reply(`Orden desconocido. Opciones: en, apagado, añadir, del, lista.`);
  }
}

module.exports = {
  config: pluginConfig,
  handler,
  getConf,
  saveConf,
};
