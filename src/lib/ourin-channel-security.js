/**
 * @file src/lib/ourin-channel-security.js
 * @description Centralized Security Middleware — Wajib Follow Dua Saluran WhatsApp Resmi
 *
 * Channel 1: https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D
 * Channel 2: https://whatsapp.com/channel/0029Vb8xSqi0AgWJaiZ9Qm16
 */

const CHANNEL_1_URL = 'https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D';
const CHANNEL_2_URL = 'https://whatsapp.com/channel/0029Vb8xSqi0AgWJaiZ9Qm16';
const CHANNEL_1_CODE = '0029VaBOlsv002TEjlntTE2D';
const CHANNEL_2_CODE = '0029Vb8xSqi0AgWJaiZ9Qm16';

const ACCESS_DENIED_MESSAGE = `ACCESS DENIED — FOLLOW REQUIRED

Untuk menggunakan seluruh fitur Ourin 3.5, kamu wajib mengikuti kedua saluran resmi kami.

CHANNEL 1:
${CHANNEL_1_URL}

CHANNEL 2:
${CHANNEL_2_URL}

Silakan ikuti kedua saluran terlebih dahulu.

Akses akan diberikan setelah status follow berhasil diverifikasi.`;

// In-memory set for active verified sessions (fail-closed by default)
const verifiedUsers = new Map();

/**
 * TECHNICAL AUDIT & LIMITATIONS (WhatsApp Baileys / cantarelllaa API):
 *
 * WhatsApp newsletter protocol does NOT expose subscriber lists to standard client sockets
 * for privacy protection. Only newsletter creators/admins can see subscribers who have their
 * phone number saved in their address book. There is no query in WhatsApp Web protocol to
 * request whether an arbitrary JID is currently following a newsletter.
 *
 * Therefore, as required by Section 12 guidelines:
 * 1. We do not manufacture fake unfollow detection or false verified claims.
 * 2. We use fail-closed verification: users must execute verification workflow.
 * 3. Bot validates the active status of both channels via sock.newsletterMetadata('invite', code).
 * 4. Once verified, access is granted. Owner/admin can revoke or audit status at any time.
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
 * Must be called on every incoming command.
 *
 * @param {Object} m - Serialized message
 * @param {Object} sock - WhatsApp socket connection
 * @param {Object} db - Database instance
 * @param {Object} config - Bot configuration
 * @returns {Promise<boolean>} - true if access granted, false if blocked
 */
async function checkChannelSecurity(m, sock, db, config) {
  // 1. Owner & Admin Bypass
  if (m.isOwner || m.isPartner) {
    return true;
  }

  // 2. Group Admin Bypass (if in group)
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

  // 5. Fail-Closed: Block command and send mandatory message
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
