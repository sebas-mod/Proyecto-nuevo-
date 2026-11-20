"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');

const pluginConfig = {
    name: "rulesgrup",
    alias: ["grouprules", "aturangrup", "grules"],
    category: "group",
    description: "Participar plenamente en las reglas y reglas del Grupo",
    usage: ".rulesgrup",
    example: ".rulesgrup",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

const DEFAULT_GROUP_RULES = `📜*Reglas del grupo*

¡Bienvenido al grupo!

🔹 *ETIKA BERKOMUNIKASI*

No hay tolerancia para las palabras o palabras de odio.
- Haciendo un mensapje @ spam @ spam @ repetitive, spam @ stickos connetados, imágenes, y las voces notan de una manera que dosh sobc @ - @ hecho.
- Discutir la SARA, pornográfico, y la negación de cualquier cosa.
- No insultes, ni acosas ni avergüences al otro grupo.

🔹* 91 * * KonakI Y Enlace 93*

- Promocional, servicios o cuentas de redes sociales sin permiso para administrador del grupo.
- Discutir enlaces sin ofertas de administración, entrar en otro grupo de WhatsApp.
- Difundir los esparcimientosx* o información no verificada de su veracidad.
- Envió documentos o archivos que eran virus potenciales de embarazo.

🔹> 91; UTILIZACIÓN DE BOT > 93;

- Use suffcientes tarjitas, don 't spam comando over and over again.
- * Patuhi administrador instruction * grupo place.
- Si hay un problema, mételo al administrador, no al grupo.

🔹 *KONSEKUENSI*

- Una advertencia rara de admin.
- El peso o el rectificado estará en - * patada * del grupo
- Admin tiene derecho a liberar a un cliente sin previo aviso.

Se supone que sigues todas las reglas de aquí.`

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const groupData = db.getGroup(m.chat) || {}
    const customRules = groupData.groupRules
    const rulesText = customRules || DEFAULT_GROUP_RULES

    const imageBuffer = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-rules")

    if (imageBuffer) {
        await sock.sendMessage(m.chat, {
            image: imageBuffer,
            caption: rulesText,
        }, { quoted: m })
    } else {
        await m.reply(rulesText)
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.DEFAULT_GROUP_RULES = DEFAULT_GROUP_RULES;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
