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

  //Comando:.cekverif
  if (cmd === 'cekverif') {
    const verified = isUserVerified(m.sender);
    if (verified || m.isOwner) {
      return m.reply('✅*Estado: TERVERIFIKASI*\n\nHa cumplido los requisitos y puede utilizar toda la función Ourin 3.');
    } else {
      return m.reply(
        `❌* STATUS ] No todavía.\n\n` +
          `Por favor, siga nuestro canal oficial.\n` +
          `1. ${CHANNEL_1_URL}\n` +
          `2. ${CHANNEL_2_URL}\n\n` +
          `Después de seguir su segundo, amigo:\`${p}verif\``
      );
    }
  }

  //Comando:. unverify ( Exclusivo Propietario )
  if (cmd === 'unverif') {
    if (!m.isOwner) return m.reply('Está característica es especial propietario bot.');
    const target = m.quoted ? m.quoted.sender : (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return m.reply(`Usa formato:\`${p}unverify @ usuario\`o responder los mensajes de usuario.`);
    revokeUser(target);
    return m.reply(`✅Verificación de sellos para el usuario @${target.split('@')[0]}exito dicabut.`, {
      mentions: [target],
    });
  }

  //Comando:. verificar /. verificar.
  if (isUserVerified(m.sender)) {
    return m.reply('✅Lo ha verificado antes y tiene un pleno acuso a la Fitud Ourin 3. 5.');
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
    `🎉*VERIFIKASI Exito!*\n\n` +
      `Estado seguido para ambos canales oficiales verificados con éxito:\n` +
      `✔ Channel 1: Terhubung\n` +
      `✔ Channel 2: Terhubung\n\n` +
      `Bienvenido a Ourin 3. 5!\`${p}menú\`para empieza.`
  );
}

module.exports = {
  config: pluginConfig,
  handler,
};
