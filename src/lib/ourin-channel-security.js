/**
* @ fill src / lib / ourin - canal - seguridad.
* @ description Centralized Security Middleware— Obligatorio Follow Dos Saluran WhatsApp Oficial
 *
 * Channel 1: https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D
 * Channel 2: https://whatsapp.com/channel/0029Vb8xSqi0AgWJaiZ9Qm16
 */

const CHANNEL_1_URL = 'https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D';
const CHANNEL_2_URL = 'https://whatsapp.com/channel/0029Vb8xSqi0AgWJaiZ9Qm16';
const CHANNEL_1_CODE = '0029VaBOlsv002TEjlntTE2D';
const CHANNEL_2_CODE = '0029Vb8xSqi0AgWJaiZ9Qm16';

const ACCESS_DENIED_MESSAGE = `ACCESS DENIED — FOLLOW REQUIRED

Para utilizar toda la función Ourin 3. 5, usted es requerido para seguir nuestro canal oficial.

CHANNEL 1:
${CHANNEL_1_URL}

CHANNEL 2:
${CHANNEL_2_URL}

Por favor siga el segundo curso más directo.

Las acciones se otorgarán después de que se verifique con éxito el siguiente estado.`;

//En @-@ conjunto de memoria para sesión verificada activada (fall - cerrado por defecto )
const verifiedUsers = new Map();

/**
* TECHNICAL AMAZIT LIMITATONS ( WhatsApp Baileys / cmarellaAPI ):
 *
 * WhatsApp newsletter protocol does NOT expose subscriber lists to standard client sockets
 * for privacy protection. Only newsletter creators/admins can see subscribers who have their
 * phone number saved in their address book. There is no query in WhatsApp Web protocol to
 * request whether an arbitrary JID is currently following a newsletter.
 *
 * Therefore, as required by Section 12 guidelines:
 * 1. We do not manufacture fake unfollow detection or false verified claims.
 * 2. We use fail-closed verification: users must execute verification workflow.
* 3.
La oferta puede revocar o olvidar el estado en cualquier momento.
 */

function isUserVerified(sender) {
  if (!sender) return false;
  const cleanId = String(sender).split('@')[0];
  const record = verifiedUsers.get(cleanId);
  if (!record) return false;
  // Expire verification after 7 days to require periodic re-verification
  if (Date.now() - record.verifiedAt > 7 * 24 * 60 * 60 * 1000) {
    verifiedUsers.delete(cleanId);
    return false;
  }
  return true;
}

function verifyUser(sender, verifiedBy = 'system') {
  if (!sender) return false;
  const cleanId = String(sender).split('@')[0];
  verifiedUsers.set(cleanId, {
    verifiedAt: Date.now(),
    verifiedBy,
    channel1: true,
    channel2: true,
  });
  return true;
}

function revokeUser(sender) {
  if (!sender) return false;
  const cleanId = String(sender).split('@')[0];
  return verifiedUsers.delete(cleanId);
}

function getVerifiedCount() {
  return verifiedUsers.size;
}

/**
 * Centralized security check middleware.
* Debe ser llamado a cada comando entrante.
 *
 * @param {Object} m - Serialized message
 * @param {Object} sock - WhatsApp socket connection
* @ param{Object}db - instancia de la base de datos
* @ param{Object}config - configuración de spa
 * @returns {Promise<boolean>} - true if access granted, false if blocked
 */
async function checkChannelSecurity(m, sock, db, config) {
  //Propietario de Admin Bypass.
  if (m.isOwner || m.isPartner) {
    return true;
  }

  //2.
  if (m.isGroup && m.isAdmin) {
    return true;
  }

  const cmd = String(m.command || '').toLowerCase();

  // 3. Allow verification commands to pass through
  if (cmd === 'verif' || cmd === 'verify' || cmd === 'cekverif' || cmd === 'unverif') {
    return true;
  }

  // 4. Check if user is already verified
  if (isUserVerified(m.sender)) {
    return true;
  }

  // 5. Fail-Closed: Block comando and send mandatory message
  try {
    await m.reply(ACCESS_DENIED_MESSAGE);
  } catch (err) {
    console.error('[SECURITY] Failed to send follow required message:', err.message);
  }

  return false;
}

module.exports = {
  CHANNEL_1_URL,
  CHANNEL_2_URL,
  CHANNEL_1_CODE,
  CHANNEL_2_CODE,
  ACCESS_DENIED_MESSAGE,
  checkChannelSecurity,
  isUserVerified,
  verifyUser,
  revokeUser,
  getVerifiedCount,
};
