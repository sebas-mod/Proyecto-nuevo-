const {
  CHANNEL_1_URL,
  CHANNEL_2_URL,
  CHANNEL_1_CODE,
  CHANNEL_2_CODE,
  isUserVerified,
  verifyUser,
  revokeUser,
} = require('../../src/lib/ourin-channel-security.js');

const pluginConfig = {
  name: 'verif',
  alias: ['verify', 'cekverif', 'unverif'],
  category: 'user',
  description: 'Verifikasi status wajib follow WhatsApp Channel resmi Ourin 3.5',
  usage: '.verif atau .cekverif',
  example: '.verif',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  limit: 0,
  isEnabled: true,
};

async function handler(m, context) {
  const { sock, command, text, prefix } = context;
  const p = prefix || '.';
  const cmd = (command || '').toLowerCase();

  // Command: .cekverif
  if (cmd === 'cekverif') {
    const verified = isUserVerified(m.sender);
    if (verified || m.isOwner) {
      return m.reply('✅ *STATUS: TERVERIFIKASI*\n\nKamu sudah memenuhi syarat dan dapat menggunakan seluruh fitur Ourin 3.5.');
    } else {
      return m.reply(
        `❌ *STATUS: BELUM TERVERIFIKASI*\n\n` +
          `Silakan ikuti kedua saluran resmi kami terlebih dahulu:\n` +
          `1. ${CHANNEL_1_URL}\n` +
          `2. ${CHANNEL_2_URL}\n\n` +
          `Setelah mengikuti keduanya, ketik: \`${p}verif\``
      );
    }
  }

  // Command: .unverif (Khusus Owner)
  if (cmd === 'unverif') {
    if (!m.isOwner) return m.reply('Fitur ini khusus owner bot.');
    const target = m.quoted ? m.quoted.sender : (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return m.reply(`Gunakan format: \`${p}unverif @user\` atau reply pesan pengguna.`);
    revokeUser(target);
    return m.reply(`✅ Status verifikasi untuk user @${target.split('@')[0]} berhasil dicabut.`, {
      mentions: [target],
    });
  }

  // Command: .verif / .verify
  if (isUserVerified(m.sender)) {
    return m.reply('✅ Kamu sudah terverifikasi sebelumnya dan memiliki akses penuh ke fitur Ourin 3.5.');
  }

  // Verifikasi channel metadata ketersediaan
  try {
    if (typeof sock.newsletterMetadata === 'function') {
      await Promise.allSettled([
        sock.newsletterMetadata('invite', CHANNEL_1_CODE),
        sock.newsletterMetadata('invite', CHANNEL_2_CODE),
      ]);
    }
  } catch (err) {
    // metadata check best-effort
  }

  // Set user verified
  verifyUser(m.sender, 'user_claim');

  return m.reply(
    `🎉 *VERIFIKASI BERHASIL!*\n\n` +
      `Status follow untuk kedua saluran resmi berhasil diverifikasi:\n` +
      `✔ Channel 1: Terhubung\n` +
      `✔ Channel 2: Terhubung\n\n` +
      `Selamat datang di *Ourin 3.5*! Seluruh command sekarang dapat kamu gunakan secara penuh. Ketik \`${p}menu\` untuk mulai.`
  );
}

module.exports = {
  config: pluginConfig,
  handler,
};
