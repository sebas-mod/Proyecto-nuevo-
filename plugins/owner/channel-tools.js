const pluginConfig = {
  name: 'channeltools',
  alias: ['followch', 'unfollowch', 'setnamech', 'createch'],
  category: 'owner',
  description: 'Manajemen WhatsApp Channel / Saluran resmi dari bot',
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
      if (!id) return m.reply(`Contoh: \`${p}followch 120363xxx@newsletter\``);
      if (typeof sock.newsletterFollow !== 'function') {
        return m.reply('❌ Fitur newsletterFollow belum tersedia pada socket bot saat ini.');
      }
      const jid = id.includes('@newsletter') ? id : `${id}@newsletter`;
      await sock.newsletterFollow(jid);
      return m.reply(`✅ Berhasil mem-follow saluran \`${jid}\``);
    }

    if (cmd === 'unfollowch') {
      const id = String(args[0] || '').trim();
      if (!id) return m.reply(`Contoh: \`${p}unfollowch 120363xxx@newsletter\``);
      if (typeof sock.newsletterUnfollow !== 'function') {
        return m.reply('❌ Fitur newsletterUnfollow belum tersedia pada socket bot saat ini.');
      }
      const jid = id.includes('@newsletter') ? id : `${id}@newsletter`;
      await sock.newsletterUnfollow(jid);
      return m.reply(`✅ Berhasil unfollow saluran \`${jid}\``);
    }

    if (cmd === 'setnamech') {
      const raw = String(args.join(' ') || '').trim();
      if (!raw) {
        return m.reply(
          `Gunakan format:\n` +
            `• \`${p}setnamech Nama Saluran Baru\` (jika dijalankan di saluran)\n` +
            `• \`${p}setnamech 120363xxx@newsletter|Nama Saluran Baru\``
        );
      }
      let channel = '';
      let name = raw;
      if (raw.includes('|')) {
        [channel, name] = raw.split('|', 2).map((v) => v.trim());
      }
      channel = channel || (m.chat?.endsWith('@newsletter') ? m.chat : null);
      if (!channel) {
        return m.reply('Masukkan ID saluran dengan format: `JID@newsletter|Nama Baru`');
      }
      if (typeof sock.newsletterUpdateName !== 'function') {
        return m.reply('❌ Fitur newsletterUpdateName belum tersedia pada socket bot.');
      }
      await sock.newsletterUpdateName(channel, name);
      return m.reply(`✅ Nama saluran berhasil diubah menjadi *${name}*`);
    }

    if (cmd === 'createch') {
      const chName = String(text || '').trim();
      if (!chName) return m.reply(`Contoh: \`${p}createch Saluran Resmi Ourin\``);
      if (typeof sock.newsletterCreate !== 'function') {
        return m.reply('❌ Fitur newsletterCreate belum tersedia pada socket bot.');
      }
      const result = await sock.newsletterCreate(chName, 'Official Channel created via Ourin 3.5');
      return m.reply(
        `🎉 *SALURAN BERHASIL DIBUAT!*\n\n` +
          `📢 *Nama:* ${chName}\n` +
          `🆔 *JID:* \`${result?.id || '-'}\`\n` +
          `🔗 *Invite:* ${result?.invite ? 'https://whatsapp.com/channel/' + result.invite : '-'}`
      );
    }
  } catch (err) {
    console.error(`[CHANNEL TOOLS ERROR]`, err.message);
    return m.reply(`❌ Gagal mengeksekusi ${p}${cmd}: ${err.message}`);
  }
}

module.exports = {
  config: pluginConfig,
  handler,
};
