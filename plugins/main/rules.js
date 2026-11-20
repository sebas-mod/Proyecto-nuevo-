"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuassetmanagerjs = require('../../src/lib/almiku-asset-manager.js');

const pluginConfig = {
    name: "rules",
    alias: ["aturanbot", "botrules", "peraturanbot"],
    category: "main",
    description: "Asistir reglas y configuración completa del uso de arranque",
    usage: ".rules",
    example: ".rules",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

function buildDefaultRules(botName, prefix) {
    return `📜 *Normas ${botName.toUpperCase()}*

Si no ha utilizado todas las características disponibles, debe comprender y obedecer las reglas siguientes.

🔹*Reglas General*

- El commando de spam emexepetivo en poco tiempo.
- Usa todas las botas con sabio y responsable.
- Usaba las botas para difundir el contenido de SARA, las historias de odio, o el contenido ilegal en cualquier snap.
- * El respeto por el uso de las botas, no utilice la función de interferir, ser redondo o desatar otro uso.
- No envíe un contenido de la NSFW en un grupo sin su primer acuerdo de grupo de administradores.

🔹* Cátedra de la UUACIÓN DE LA FUTURA *

- Cualquier uso del comando requiere energía.
- Premium sólo puede ser manejado por un uso prolgado.${prefix}Benefitpremium para información completa.
- Si encuentras un zumbido o error, reporta inmediatamente al propietario de la bota a través de.${prefix}- No me malinterpretes.
- Hizo una función de solicitud no sensorial o utilizó al propietario para agregar una característica específica.

🔹*KONSEKUENSI Infraccion*

- Advertencia de mala calidad de administrador o propietario
- La corrupción o la repetición se puede esperar * prohibido permanen * del uso del bot
- El titular tiene derecho a decidir sin su aviso previo.

Con estas botas puestas, se supone que debe leer y leer todas las reglas en la parte superior.`
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const botName = _optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || "Al Miku-AI"
    const customRules = db.setting("botRules")

    let rulesText
    if (customRules && typeof customRules === "string" && customRules.trim().length > 0) {
        rulesText = customRules
    } else if (Array.isArray(customRules) && customRules.length > 0) {
        rulesText = `📜 *Normas ${botName.toUpperCase()}*\n\n`
        customRules.forEach((rule, i) => {
            rulesText += `${i + 1}. ${rule}\n`
        })
    } else {
        rulesText = buildDefaultRules(botName, m.prefix)
    }

    const imageBuffer = _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku-rules")

    if (imageBuffer) {
        await sock.sendMessage(m.chat, {
            image: imageBuffer,
            caption: rulesText,
        }, { quoted: m })
    } else {
        await m.reply(rulesText)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
