/**
 * src/lib/almiku-channel-security.js
 * Middleware de seguridad de canales — SIN CANDADO.
 *
 * El bot ya no exige seguir ningún canal de WhatsApp: dueños, admins y
 * usuarios normales pueden usar todos los comandos sin verificar nada.
 */

/**
 * Devuelve siempre true, así que ningún comando queda bloqueado.
 *
 * @param {Object} m - Mensaje serializado
 * @param {Object} sock - Socket de WhatsApp
 * @param {Object} db - Instancia de la base de datos
 * @param {Object} config - Configuración del bot
 * @returns {Promise<boolean>} - true (acceso concedido)
 */
async function checkChannelSecurity(m, sock, db, config) {
  return true;
}

module.exports = {
  checkChannelSecurity,
};
