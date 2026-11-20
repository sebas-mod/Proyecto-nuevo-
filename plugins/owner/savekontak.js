"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: "savekontak",
    alias: ["sv", "svkontak"],
    category: "owner",
    description: "Configuración de los contactos del archivo grupo a VCF",
    usage: ".savekontak <nama>",
    example: ".savekontak Fulan",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
};

async function handler(m, { sock, args }) {
    if (args[0] === "get") {
        const target = args[1];
        const baseName = args.slice(2).join(" ") || "User";

        const chats = await sock.groupFetchAllParticipating();
        let groups = [];
        if (target === "all") {
            groups = Object.values(chats);
        } else {
            if (chats[target]) {
                groups.push(chats[target]);
            } else {
                return m.reply("❌Grup no fue encontrado.");
            }
        }

        if (groups.length === 0) {
            return m.reply("❌No en el grupo en ningún lado.");
        }

        m.reply(`⏳El rango extrae el contacto desde${groups.length}grupo...`);

        let vcards = "";
        let count = 0;
        let index = 1;
        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const contactArray = [];

        for (const group of groups) {
            for (const participant of group.participants) {
                if (participant.id === botId) continue;

                const number = participant.id.split("@")[0];
                const name = `${baseName} ${index}`;
                const singleVcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;

                vcards += singleVcard + "\n";
                contactArray.push({ vcard: singleVcard });
                count++;
                index++;
            }
        }

        if (count === 0) {
            return m.reply("❌No hay contacto que se pueda extraer.");
        }

        await sock.sendMessage(m.chat, {
            document: Buffer.from(vcards, "utf8"),
            fileName: `${baseName}_${count}- Sí, Contak.`,
            mimetype: "text/vcard",
            caption: `✅*Exito mengekstrak${count}contacto con VCF. *`
        }, { quoted: m });

        await sock.sendMessage(m.chat, {
            contacts: {
                displayName: `${count}Contacto`,
                contacts: contactArray
            }
        }, { quoted: m });

        return;
    }

    const baseName = args.join(" ") || "User";
    const chats = await sock.groupFetchAllParticipating();
    const groupList = Object.values(chats);

    if (groupList.length === 0) {
        return m.reply("❌No en el grupo en ningún lado.");
    }

    const sections = [
        {
            title: "Registrate Grupo",
            rows: groupList.map(g => ({
                header: "",
                title: g.subject,
                description: `Miembro:${_optionalChain([g, 'access', _ => _.participants, 'optionalAccess', _2 => _2.length]) || 0}`,
                id: `${m.prefix}savekontak get ${g.id} ${baseName}`
            }))
        }
    ];

    await sock.sendMessage(m.chat, {
        text: `📇* SISTEM SAVE CONTAK ( VCF) *\n\n` +
            `The exacerbate system of the roup that the bot 's following.\n` +
            `Nombre de la base: *${baseName}*\n\n` +
            `*Uso:*\n` +
            `• *${m.prefix || "."}savekontak<nama>*—Contener con el nombre personalizado\n` +
            `• *${m.prefix || "."}savekontak *—Contener con el nombre predeterminado\n\n` +
            `*Explicación ALUR Uso:*\n` +
            `1. Elija las minificiones del grupo de la cúanga * Elija Grupo * en los crumps, o klick * todos grupo * para exTraigan los contrats globales.\n` +
            `Dos, la primera persona que se pierda el primer orden de la primera ronda será la primera que perder.\n` +
            `3. El documento será enviado con un archivo ( *. vcf * ) junto con una lista de { tp Ag se puede perder.`,
        footer: "Powered by ReviewBot",
        interactiveButtons: [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Elige Grupo",
                    sections
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Todo Grupo",
                    id: `${m.prefix}savekontak get all ${baseName}`
                })
            }
        ]
    }, { quoted: m });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
