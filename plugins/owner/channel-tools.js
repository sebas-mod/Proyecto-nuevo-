const pluginConfig = {
  name: 'channeltools',
  alias: ['followch', 'unfollowch', 'setnamech', 'createch'],
  category: 'owner',
  description: 'Mannemen WhatsApp Canal / Oficial Saluran del bot',
  usage: '.followch <JID> | .unfollowch <JID> | .setnamech <JID|Nama> | .createch <Nama>',
  example: '.followch 120363xxx@newsletter',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  limit: 0,
  isEnabled: true,
};

async function handler(m, context) {
  const { sock, command, text, args, prefix } = context;
  const cmd = String(command || '').toLowerCase();
  const p = prefix || '.';

  try {
    if (cmd === 'followch') {
      const id = String(args[0] || '').trim();
      if (!id) return m.reply(`Ejemplo:\`${p}followch 120363xxx@newsletter\``);
      if (typeof sock.newsletterFollow !== 'function') {
        return m.reply('❌El boletín Sigue las características todavía no están disponibles en el bot de toma actual.');
      }
      const jid = id.includes('@newsletter') ? id : `${id}@newsletter`;
      await sock.newsletterFollow(jid);
      return m.reply(`✅Resultado sigue canal\`${jid}\``);
    }

    if (cmd === 'unfollowch') {
      const id = String(args[0] || '').trim();
      if (!id) return m.reply(`Ejemplo:\`${p}unfollowch 120363xxx@newsletter\``);
      if (typeof sock.newsletterUnfollow !== 'function') {
        return m.reply('❌El embudo de newsletter todavía no está disponible en el bot de toma actual.');
      }
      const jid = id.includes('@newsletter') ? id : `${id}@newsletter`;
      await sock.newsletterUnfollow(jid);
      return m.reply(`✅Resultado del canal sin seguimiento\`${jid}\``);
    }

    if (cmd === 'setnamech') {
      const raw = String(args.join(' ') || '').trim();
      if (!raw) {
        return m.reply(
          `Usa formato:\n` +
            `• \`${p}nombre del set Nombre Saluran Nuevo\`(si se ejecuta en el canal )\n` +
            `• \`${p}setnamech 120363xxx@ newsletter Nombre de Nuevo Saluran\``
        );
      }
      let channel = '';
      let name = raw;
      if (raw.includes('|')) {
        [channel, name] = raw.split('|', 2).map((v) => v.trim());
      }
      channel = channel || (m.chat?.endsWith('@newsletter') ? m.chat : null);
      if (!channel) {
        return m.reply('Insertar el canal de identificación con forte:`JID@newsletter|Nombre Nuevo`');
      }
      if (typeof sock.newsletterUpdateName !== 'function') {
        return m.reply('❌El boletín informativo UpdateName no ha estado disponible en el bot de socket.');
      }
      await sock.newsletterUpdateName(channel, name);
      return m.reply(`✅Nombre del canal convertido a *${name}*`);
    }

    if (cmd === 'createch') {
      const chName = String(text || '').trim();
      if (!chName) return m.reply(`Ejemplo:\`${p}El Saluran Saluran Oficial Ourin\``);
      if (typeof sock.newsletterCreate !== 'function') {
        return m.reply('❌El boletínCreate no está disponible todavía en el bot de socket.');
      }
      const result = await sock.newsletterCreate(chName, 'Official Channel created via Ourin 3.5');
      return m.reply(
        `🎉* COOING EXPLOSIONS *\n\n` +
          `📢*Nombre:*${chName}\n` +
          `🆔 *JID:* \`${result?.id || '-'}\`\n` +
          `🔗 *Invite:* ${result?.invite ? 'https://whatsapp.com/channel/' + result.invite : '-'}`
      );
    }
  } catch (err) {
    console.error(`[CHANNEL TOOLS ERROR]`, err.message);
    return m.reply(`❌Fallido mengeksekusi${p}${cmd}: ${err.message}`);
  }
}

module.exports = {
  config: pluginConfig,
  handler,
};
