"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: "dungeon",
    alias: ["dg", "explore", "labirin"],
    category: "game",
    description: "Examine la mazmorra y el lado del buster en modo interactivo.",
    usage: ".dungeon",
    example: ".dungeon",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
};

const DUNGEONS = [
    {
        id: 1,
        name: "🌲 Hutan Gelap",
        levelReq: 1,
        monsters: [
            "Goblin Liar",
            "Slime Raksasa",
            "Serigala Malam",
            "Bandit Hutan",
        ],
        minReward: 100,
        maxReward: 300,
        dropChance: 40,
    },
    {
        id: 2,
        name: "🍄 Rawa Beracun",
        levelReq: 5,
        monsters: [
            "Kodok Mutan",
            "Pohon Berjalan",
            "Laba-laba Racun",
            "Viper Rawa",
        ],
        minReward: 250,
        maxReward: 500,
        dropChance: 45,
    },
    {
        id: 3,
        name: "🏰 Kastil Tua",
        levelReq: 10,
        monsters: [
            "Prajurit Tengkorak",
            "Zombie Kelaparan",
            "Hantu Penasaran",
            "Gargoyle Batu",
        ],
        minReward: 400,
        maxReward: 800,
        dropChance: 50,
    },
    {
        id: 4,
        name: "🏜️ Padang Pasir Kematian",
        levelReq: 15,
        monsters: [
            "Kalajengking Raksasa",
            "Mummy Bangkit",
            "Worm Gurun",
            "Jin Jahat",
        ],
        minReward: 600,
        maxReward: 1200,
        dropChance: 55,
    },
    {
        id: 5,
        name: "🌋 Gunung Api",
        levelReq: 20,
        monsters: ["Elemental Api", "Golem Magma", "Naga Kecil", "Hellhound"],
        minReward: 900,
        maxReward: 1700,
        dropChance: 60,
    },
    {
        id: 6,
        name: "🧊 Gua Es Abadi",
        levelReq: 25,
        monsters: ["Golem Es", "Raksasa Frost", "Yeti Ganas", "Serigala Salju"],
        minReward: 1300,
        maxReward: 2400,
        dropChance: 65,
    },
    {
        id: 7,
        name: "☁️ Reruntuhan Langit",
        levelReq: 30,
        monsters: ["Harpy Petir", "Griffin Liar", "Valkyrie Jatuh", "Golem Angin"],
        minReward: 1800,
        maxReward: 3300,
        dropChance: 70,
    },
    {
        id: 8,
        name: "🌊 Lautan Bayangan",
        levelReq: 35,
        monsters: ["Kraken Bayi", "Siren Pemikat", "Hiu Hantu", "Leviathan Merah"],
        minReward: 2500,
        maxReward: 4500,
        dropChance: 75,
    },
    {
        id: 9,
        name: "🕳️ Jurang Ketiadaan",
        levelReq: 40,
        monsters: ["Malaikat Kematian", "Void Walker", "Shadow Fiend", "Behemoth"],
        minReward: 3500,
        maxReward: 6000,
        dropChance: 80,
    },
    {
        id: 10,
        name: "👹 Neraka Terdalam",
        levelReq: 50,
        monsters: ["Iblis Merah", "Succubus Mematikan", "Cerberus", "Raja Iblis"],
        minReward: 5000,
        maxReward: 10000,
        dropChance: 90,
    },
];

const LOOT_TABLE = [
    { item: "iron", chance: 40, qty: [1, 5], icon: "⛏️" },
    { item: "gold", chance: 20, qty: [1, 3], icon: "🪙" },
    { item: "diamond", chance: 5, qty: [1, 2], icon: "💎" },
    { item: "potion", chance: 30, qty: [1, 3], icon: "🧪" },
    { item: "herb", chance: 25, qty: [2, 6], icon: "🌿" },
    { item: "leather", chance: 35, qty: [2, 5], icon: "👞" },
    { item: "mysterybox", chance: 3, qty: [1, 1], icon: "📦" },
];

async function handler(m, { sock }) {
    try {
        const db = _ourindatabasejs.getDatabase.call(void 0, );
        const user = db.getUser(m.sender);

        if (!user.rpg) user.rpg = {};
        if (!user.rpg.attack) user.rpg.attack = 10;
        if (!user.rpg.health) user.rpg.health = 100;
        if (!user.rpg.maxHealth) user.rpg.maxHealth = 100;
        if (!user.rpg.stamina) user.rpg.stamina = 100;
        if (!user.rpg.maxStamina) user.rpg.maxStamina = 100;
        if (!user.inventory) user.inventory = {};

        const session = user.rpg.dungeon_session || null;
        const userLevel = user.level || 1;

        if (session) {
            const SESSION_TIMEOUT = 5 * 60 * 1000;
            if (Date.now() - session.time > SESSION_TIMEOUT) {
                delete user.rpg.dungeon_session;
                db.save();
            } else {
                return m.reply(
                    `⚔*El período de sesiones de DUNGEON hace un esfuerzo*\n\n` +
                    `¡Está en medio de una exploración!\n` +
                    `# La última vez que nos fuimos #\`cancelar\`) o continuar la acción ( axila\`ataca\`/\`correr\`).`,
                );
            }
        }

        const available = DUNGEONS.filter((d) => userLevel >= d.levelReq);
        if (available.length === 0) {
            return m.reply(
                `❌* LEVEL LATE Bajo *\n\nDejarte ahora es...${userLevel}Necesitas un mínimo de nivel para entrar en la mazmorra más barata.`,
            );
        }

        user.rpg.dungeon_session = {
            stage: "lobi",
            time: Date.now(),
        };
        db.save();

        let txt = `🏰 *LOBI DUNGEON*\n\n`;
        txt += `📊* Estadísticas Tu: *\n`;
        txt += `> Level: *${userLevel}*\n`;
        txt += `> Stamina: *${_nullishCoalesce(user.rpg.stamina, () => ( 100))}/100*\n\n`;
        txt += `Seleccione la ubicación que desea explicar:\n\n`;

        for (const d of DUNGEONS) {
            if (userLevel >= d.levelReq) {
                txt += `🔓 *${d.id}.* ${d.name} (Lv ${d.levelReq}+)\n`;
            } else {
                txt += `> 🔒 *${d.id}.* ${d.name}(Necesito Lv${d.levelReq})\n`;
            }
        }
        txt += `\n♪💡Replay este mensaje con el * número * ubicación🔓(ejemplo:\`1\`) o Tyk\`cancelar\`para salir.`;

        return m.reply(txt);
    } catch (error) {
        console.error(error);
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

async function dungeonAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const user = db.getUser(m.sender);

    if (!user || !user.rpg || !user.rpg.dungeon_session) return false;

    const session = user.rpg.dungeon_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;
    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.rpg.dungeon_session;
        db.save();
        await m.reply(
            `⏰* DUNGEON SESSION OF THE WARRANTS *\n\nHa estado colgado en el sesi de mazmorra durante cinco minutos.`,
        );
        return true;
    }

    const text = m.body.trim().toLowerCase();
    const userLevel = user.level || 1;

    if (text === "batal" || text === "cancel" || text === "keluar") {
        delete user.rpg.dungeon_session;
        db.save();
        await m.reply(`🚪Te las arreglaste para salir de Dungeon Lobby con seguridad.`);
        return true;
    }

    if (session.stage === "lobi") {
        const choiceId = parseInt(text);
        if (isNaN(choiceId)) return false;

        const dungeon = DUNGEONS.find((d) => d.id === choiceId);

        if (!dungeon) {
            await m.reply(
                `❌* OPCIÓN DEL PROBLEMA VALIDO*\n\n*Número de Dungeon*${choiceId}no encontrado.`,
            );
            return true;
        }

        if (userLevel < dungeon.levelReq) {
            await m.reply(
                `🔒*DUNGEON Bloqueado*\n\n*Tu nivel*${userLevel}No es suficiente para encajar${dungeon.name}*.\n*Necesitas un poco de Lv*${dungeon.levelReq}*.`,
            );
            return true;
        }

        const staminaCost = 30;
        user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

        if (user.rpg.stamina < staminaCost) {
            await m.reply(
                `⚡¿Qué?\n\n` +
                `Necesitas al menos${staminaCost}La resistencia.\n` +
                `Su resistencia presente es tan buena como su presente.${user.rpg.stamina}*.\n\n` +
                `♪💡* Consejos: * Usar el comando\`- Quítate.\`O cancelarlo primero.\`cancelar\`).`,
            );
            return true;
        }

        user.rpg.stamina -= staminaCost;
        const monster =
            dungeon.monsters[Math.floor(Math.random() * dungeon.monsters.length)];
        const monsterPower = dungeon.levelReq * 10 + Math.floor(Math.random() * 30);

        user.rpg.dungeon_session = {
            stage: "encounter",
            dungeonId: dungeon.id,
            dungeonName: dungeon.name,
            levelReq: dungeon.levelReq,
            monster: monster,
            monsterPower: monsterPower,
            maxReward: dungeon.maxReward,
            minReward: dungeon.minReward,
            dropChance: dungeon.dropChance,
            time: Date.now(),
        };

        db.save();

        await m.react("🚪");
        let txt = `🚪 *MEMASUKI DUNGEON*\n\n`;
        txt += `Te metiste en ello.${dungeon.name}*...\n`;
        txt += `♪⚡Stamina 's delgada *${staminaCost}*\n\n`;
        txt += `- Llegar - Muy bien, Seekor👹 ${monster}* para salir de la oscuridad y bloquear su camino!\n\n`;
        txt += `*⚔¿Te acuerdas?\n`;
        txt += `*Para escribir este mensaje con\`ataca\`para melawan\n`;
        txt += `*Para escribir este mensaje con\`correr\`para soar ( sikawo )`;

        await m.reply(txt);
        return true;
    }

    if (session.stage === "encounter") {
        if (text === "serang" || text === "attack" || text === "lawan") {
            const userPower =
                (user.rpg.attack || 10) +
                userLevel * 4 +
                Math.floor(Math.random() * 20);
            const isWin = userPower >= session.monsterPower || Math.random() > 0.4;

            let reportText = "";

            if (isWin) {
                const expReward =
                    150 * (session.levelReq / 2) + Math.floor(Math.random() * 200);
                const goldReward =
                    Math.floor(Math.random() * (session.maxReward - session.minReward)) +
                    session.minReward;

                const droppedItems = [];
                for (const loot of LOOT_TABLE) {
                    if (Math.random() * 100 < loot.chance * (session.dropChance / 50)) {
                        const qty =
                            Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) +
                            loot.qty[0];
                        user.inventory[loot.item] = (user.inventory[loot.item] || 0) + qty;
                        droppedItems.push(`${loot.icon} ${loot.item} (x${qty})`);
                    }
                }

                user.koin = (user.koin || 0) + goldReward;
                await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expReward);

                reportText += `🎉 *KEMENANGAN GEMILANG!*\n\n`;
                reportText += `Con un ataque detenido, usted logró cortar *${session.monster}*!\n\n`;
                reportText += `*🎁AUDIENCIA JANG ACCESO: *\n`;
                reportText += `> ✨ EXP: *+${Math.floor(expReward)}*\n`;
                reportText += `♪💰Monedas: *+${goldReward.toLocaleString()}*\n`;

                if (droppedItems.length > 0) {
                    reportText += `\n*📦 Articulo JARAHAN (LOOT):*\n`;
                    reportText += `> ${droppedItems.join("\n> ")}\n`;
                }

                await m.react("🏆");
            } else {
                const goldLoss = Math.floor((user.koin || 0) * 0.15);
                user.koin = Math.max(0, (user.koin || 0) - goldLoss);
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - 40);

                reportText += `💀 *KEKALAHAN TRAGIS!*\n\n`;
                reportText += `¡Tu fuerza aún no está rota!${session.monster}* te golpeó con un rígido.\n`;
                reportText += `Te las arreglaste para arrastrarte con una herida de cuerpo.\n\n`;
                reportText += `*💔Perdida:*\n`;
                reportText += `♪💸Dinero cayó: * -${goldLoss.toLocaleString()}Monedas*\n`;
                reportText += `♪❤Ya 's lowering: 40 hps\n\n`;
                reportText += `♪💡* Consejos: * ¡Levanten sus niveles, coman las pociones, o la pelea de armas!`;

                await m.react("💀");
            }

            delete user.rpg.dungeon_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else if (text === "lari" || text === "kabur" || text === "run") {
            const escapeChance = Math.random() > 0.5;
            let reportText = "";

            if (escapeChance) {
                reportText += `🏃‍♂(Sumperando)\n\n`;
                reportText += `Estás caminando y corriendo un sésamo de diez elementos. *${session.monster}* kehilangan jejakmu!\n`;
                reportText += `Sobreviviste sin lesión, pero está aventura no es nada.`;
                await m.react("💨");
            } else {
                const hpLoss = 25;
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - hpLoss);
                reportText += `💥*Fallido KABUR!*\n\n`;
                reportText += `Kakimu tersandung bebatuan! *${session.monster}* ¡Ve tras ti y aterriza las garras en tu cuerpo!\n\n`;
                reportText += `*💔Perdida:*\n`;
                reportText += `♪❤Ya 's lowering:${hpLoss} HP*`;
                await m.react("🩸");
            }

            delete user.rpg.dungeon_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else {
            await m.reply(
                `❓OPCIÓN DEL PROBLEMA CONOCIDO\n\n` +
                `# Responde con\`ataca\`Para luchar contra los monstruos.\n` +
                `# Responde con\`correr\`para kabur.\n` +
                `# Responde con\`cancelar\`Si es realmente violento.`,
            );
            return true;
        }
    }

    return false;
}

exports.config = pluginConfig; exports.handler = handler; exports.dungeonAnswerHandler = dungeonAnswerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
