"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

















var _ourinminecraftjs = require('../../src/lib/ourin-minecraft.js');














var _ourinminecraftdatajs = require('../../src/lib/ourin-minecraft-data.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);

const MC = 15;
const rc = (r) => _ourinminecraftdatajs.RARITY_EMOJI[r] || "⬜";
const encCost = (r) =>
  ({
    common: 60000,
    rare: 600000,
    epic: 6e6,
    legendary: 6e7,
    mythic: 6e8,
    godly: 6e9,
    secret: 6e10,
  })[r] || 60000;

let thumbMC = null;
try {
  const p = _path2.default.join(process.cwd(), "assets", "images", "ourin-minecraft.jpg");
  if (_fs2.default.existsSync(p)) thumbMC = _fs2.default.readFileSync(p);
} catch (e) {}

function ctx() {
  const sId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
  const sName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";
  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: sId,
      newsletterName: sName,
      serverMessageId: 127,
    },
  };
}

function send(sock, m, text, title, body) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${_configjs2.default.info.website} ${text}`,
      url: `${_configjs2.default.info.website}`,
      title: `𝗠𝗜𝗡𝗘𝗖𝗥𝗔𝗙𝗧 𝗚𝗔𝗠𝗘𝗦`,
      description: `⛏A la mina,🛠♪ Artesanía, y ♪⚔*Al modo en el mundo* * Minecraft*`,
      jpegThumbnail: thumbMC,
      previewType: 0,
    },
    { quoted: m },
  );
  return { key: { id: msgId, remoteJid: m.chat, fromMe: true } };
}

const pluginConfig = {
  name: "mct",
  alias: ["minecraft"],
  category: "game",
  description: "Minecraft - Mining & Crafting Game",
  usage: ".mct <command>",
  example: ".mct help",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const cmd = m.command || _optionalChain([m, 'access', _7 => _7.body, 'optionalAccess', _8 => _8.split, 'call', _9 => _9(" "), 'access', _10 => _10[0], 'optionalAccess', _11 => _11.slice, 'call', _12 => _12(1), 'optionalAccess', _13 => _13.toLowerCase, 'call', _14 => _14()]) || "";
  const args = m.args || _optionalChain([m, 'access', _15 => _15.body, 'optionalAccess', _16 => _16.split, 'call', _17 => _17(" "), 'access', _18 => _18.slice, 'call', _19 => _19(1)]) || [];
  const sub = _optionalChain([args, 'access', _20 => _20[0], 'optionalAccess', _21 => _21.toLowerCase, 'call', _22 => _22()]) || "";
  const sa = args.slice(1);

  if (cmd === "minecraft") {
    if (!sub || sub === "on" || sub === "off") {
      if (!m.isGroup) return m.reply("Toggle está en grupo.");
      if (!m.isOwner && !m.isAdmin) return m.reply("_Hanya administrador/owner_");
      const gd = db.getGroup(m.chat) || {};
      if (sub === "on") {
        gd.minecraftEnabled = true;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*🧱MINECRAFT ENABLED *\n\n🎮Todas las fotos de vídeo son para jugar Minecraft!\n🪧Escribe\`- Sr. Ayuda.\`para empieza`,
          "🧱 Minecraft ON",
          "✅ Aktif",
        );
      }
      if (sub === "off") {
        gd.minecraftEnabled = false;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*🧱 MINECRAFT DISABLED*`,
          "🧱 Minecraft OFF",
          "❌ Nonaktif",
        );
      }
      return m.reply(
        `*🧱 Minecraft:* ${gd.minecraftEnabled ? "✅ ON" : "❌ OFF"}\n\`.minecraft on/off\``,
      );
    }
  }

  if (cmd !== "mct" && cmd !== "minecraft") return;

  if (!sub || sub === "help" || sub === "menu") {
    return send(
      sock,
      m,
      `*🧱MINECRAFT juego\n¿Q¿Ué?⛏️ Sistem pertambangan & 🛠Acultima complejo elaboración\n\n` +
        `*⛏*Minificación*\n\`- Mct Mine.\`¿Qué?⛏Para empezar la mía\n\`. mct recoger.\`¿Qué?📦_ Tomar los resultados\n\`- Mct vende.\`¿Qué?💸Vende ore_\n\`- Mct orebook.\`¿Qué?📚_ Colección\n\`. mct superior\`¿Qué?🏆Líder _ bordo\n\n` +
        `*⚔# Vamos #\n\`- Muy ajustado.\`¿Qué?👹Registrate mob_\n\`- Muy ajustado.<mob>\`¿Qué?⚔️ Oponente mob_\n\`- Es una buena idea.\`¿Qué?❤️ Sembuhkan HP_\n\`personal de la mct.\`¿Qué?📊_ Detalles de los estantes\n\n` +
        `*👤PROPILE\n\`- Está bien.\`¿Q¿Ué?🪪 Perfil kamu_\n\`mct diario.\`¿Q¿Ué?🎁Recompensa de la láctea_\n\n` +
        `*🗺*A Blue* *para espigar*\n\`- Es un viaje.\`¿Qué?🗺️ Registrate biome_\n\`- Es un viaje.<biome>\`¿Qué?🚪 Pindah biome_\n\`. mct Shop.\`¿Qué?🛒Tienda pickaxe_\n\`Comprar.<pick>\`¿Qué?💰Compra pickaxe_\n\`- Es una emergencia.<pick>\`¿Qué?🪓Instala pickaxe_\n\`- La mct elige.\`¿Qué?🎒Colección Pickaxe_\n\`- Mct encantada.<key>\`¿Qué?✨Enchanté pickaxe_\n\`- Mct encantada.\`¿Qué?📜Registrate enchant_\n\`- Recogiendo mct.\`¿Qué?⬆* Mejora picka*xe_\n\n` +
        `*🔥A la mierda con la sensación\n\`- Es una buena idea.\`¿Qué?🔥Es fundir todo ore_\n\`. grieta de mct.\`¿Qué?🛠️ Registrate resep_\n\`. grieta de mct.<id>\`¿Qué?🧪Artesanía _ it\n\`- Mct inv.\`¿Qué?🎒Inventario_\n\n` +
        `*👑PRESTIGE *\n\`. prestigio mct.\`¿Q¿Ué?👑Prestige_ Info\n\`- Fichas de mct.\`¿Q¿Ué?🪙_ Tienda Token..\n\`mct mejora.\`¿Q¿Ué?📈Mejora _ estados\n\`- Melt Gacha.\`¿Q¿Ué?🎰Gacha_\n\`Entrada de la mct gacha.\`¿Q¿Ué?🎟Gacha usó un boleto\n\n` +
        `*🎰JACKPOT *\n\`- El Bot Melt.\`¿Q¿¿Ué?🎰Regisomebody jackpot _\n\`- El Bot Melt.<tier>\`¿Q¿¿Ué?💎Juega jackpot _\n¿Q¿¿Ué?🎁Jackpot puede ser amado por Premium _, los socios, la energía, el Límite _, incluyen UNLIMITEDE _!`,
      "🧱 Minecraft Game",
      "⛏️ Mining & 🛠️ Crafting",
    );
  }

  if (sub === "mine") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (mc.miningPending && mc.miningPending.length > 0)
      return m.reply(`¿Qué?📦¡También hay un resultado mío!\`. mct recoger.\`- Sí, sí.`);
    const now = Date.now();
    if (mc.lastMineTime && now - mc.lastMineTime < MC * 1000)
      return m.reply(
        `¿Qué?⏳Espera *${Math.ceil((MC * 1000 - (now - mc.lastMineTime)) / 1000)}* segundos*`,
      );
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`¿Qué?🪓Pickaxe habilitado no existe! _\`- La mct elige.\``);
    const bk = mc.currentBiome || "plains";
    const st = _ourinminecraftjs.getUpgradedStats.call(void 0, mc, pick);
    const ePick = {
      ...pick,
      luck: st.luck,
      speed: st.speed,
      fortuneBonus: st.fortune,
      sellMultiplier: st.sellMultiplier,
    };
    const ores = [];
    let tv = 0;
    for (let i = 0; i < (pick.comboOre || 1); i++) {
      const ore = _ourinminecraftjs.getRandomOre.call(void 0, ePick, bk);
      if (ore) {
        ore.price = Math.round(ore.price * _ourinminecraftjs.getStreakBonus.call(void 0, mc.streak || 0).mult);
        ores.push(ore);
        tv += ore.price;
      }
    }
    mc.miningPending = ores;
    mc.lastMineTime = now;
    mc.streak = (mc.streak || 0) + 1;
    await send(
      sock,
      m,
      `*_⛏️ Menambang di ${_optionalChain([_ourinminecraftdatajs.biomes, 'access', _23 => _23[bk], 'optionalAccess', _24 => _24.name]) || bk}..._*\n_🪓 Pick: ${pick.name} | 🍀 Luck: ${(st.luck * 100).toFixed(1)}%_`,
      "⛏️ Menambang...",
      _optionalChain([_ourinminecraftdatajs.biomes, 'access', _25 => _25[bk], 'optionalAccess', _26 => _26.name]) || "",
    );
    await new Promise((r) =>
      setTimeout(
        r,
        Math.min(Math.max(2000, 5000 - (pick.speed || 0) * 3000), 4000),
      ),
    );
    let txt = `*⛏️ Resultado MENAMBANG!*\n\n`;
    for (const o of ores) {
      txt += `${rc(o.rarity)} *${o.name}*\n   _💰 ${_ourinminecraftjs.formatMoney.call(void 0, o.price)} | 📦 x${o.stack}_\n`;
    }
    txt += `\n*💰 Total: ${_ourinminecraftjs.formatMoney.call(void 0, tv)}*`;
    if (mc.streak >= 3) txt += `\n_🔥 Streak: ${mc.streak}x_`;
    txt += `\n\n\`. mct recoger.\`para📦obteniendo!`;
    db.markDirty("users");
    return send(sock, m, txt, "⛏️ Hasil Menambang!", `💰 ${_ourinminecraftjs.formatMoney.call(void 0, tv)}`);
  }

  if (sub === "collect") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (!mc.miningPending || mc.miningPending.length === 0)
      return m.reply(`¿Qué?📭No hay resultados _\`- Mct Mine.\`- ¡Lo siento!`);
    const ores = mc.miningPending;
    let tv = 0,
      te = 0,
      nf = [];
    for (const ore of ores) {
      tv += ore.price;
      te += Math.max(10, Math.floor(ore.price / 50));
      const cn = ore.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (!mc.oreFound.includes(cn)) {
        mc.oreFound.push(cn);
        nf.push(cn);
      }
    }
    mc.money = (mc.money || 0) + tv;
    mc.blocksMined =
      (mc.blocksMined || 0) + ores.reduce((a, o) => a + (o.stack || 1), 0);
    mc.totalEarned = (mc.totalEarned || 0) + tv;
    mc.inventory = [...(mc.inventory || []), ...ores];
    const rlu = _ourinminecraftjs.addPickExp.call(void 0, mc, mc.usedPickaxe || "woodpick", te);
    const plu = _ourinminecraftjs.addPlayerExp.call(void 0, mc, te);
    mc.miningPending = [];
    let txt = `*📦Resultado Tomado!*\n\n💰+${_ourinminecraftjs.formatMoney.call(void 0, tv)}\n⭐ +${te} EXP\n🧱 +${ores.length} ore\n`;
    if (nf.length > 0) txt += `\n*🆕Ore Nuevo:*${nf.join(", ")}`;
    if (rlu) txt += `\n\n${rlu}`;
    if (plu) txt += `\n*⬆️ LEVEL UP! Level ${mc.level}*`;
    db.markDirty("users");
    return send(sock, m, txt, "📦 Hasil Diambil!", `💰 +${_ourinminecraftjs.formatMoney.call(void 0, tv)}`);
  }

  if (sub === "sell") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (!mc.inventory || mc.inventory.length === 0)
      return m.reply(`¿Qué?🎒Inventory vacio!_\`- Mct Mine.\`- Sí, sí.`);
    let tv = 0;
    for (const item of mc.inventory) tv += item.price || 0;
    const sb = _ourinminecraftdatajs.UPGRADES.fortune.effect(mc.fortuneUpgrade || 0);
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    const rsm = pick ? pick.sellMultiplier || 0 : 0;
    const fv = Math.round(tv * (1 + sb + rsm));
    const fc2 = mc.inventory.length;
    mc.money = (mc.money || 0) + fv;
    mc.totalEarned = (mc.totalEarned || 0) + fv;
    mc.inventory = [];
    db.markDirty("users");
    return send(
      sock,
      m,
      `*💸 ORE TERJUAL!*\n\n📦Cantidad:${fc2}\n💰 Total: ${_ourinminecraftjs.formatMoney.call(void 0, fv)}\n🏦Saldo:${_ourinminecraftjs.formatMoney.call(void 0, mc.money)}`,
      "💸 Ore Terjual!",
      `💰 ${_ourinminecraftjs.formatMoney.call(void 0, fv)}`,
    );
  }

  if (sub === "me") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    return send(
      sock,
      m,
      `*👤Perfil PENAMBANG*\n\n*⬆️ Nivel:*${mc.level} _(${mc.exp}/${mc.expToNextLevel}EXPERIENCIA\n*💰Dinero:*${_ourinminecraftjs.formatMoney.call(void 0, mc.money)}\n*❤️ HP:* ${mc.hp}/${mc.maxHp}\n*⚔️ ATK:* ${mc.atk}\n*🧱 Blocks:* ${mc.blocksMined}\n*🪓 Pick:* ${pick ? pick.name : "🪵 Wooden Pickaxe"} _(Lv.${pick ? pick.level : 1})_\n*🗺️ Biome:* ${_ourinminecraftdatajs.biomes[mc.currentBiome] ? _ourinminecraftdatajs.biomes[mc.currentBiome].name : mc.currentBiome}\n*🔥 Streak:* ${mc.streak || 0}\n*⚔️ Combat:* ${mc.combatWins || 0}W/${mc.combatLosses || 0}L\n*👑 Prestige:* ${mc.prestige || 0}\n*🪙 Tokens:* ${mc.prestigeTokens || 0}\n*🎟️ Tickets:* ${mc.gachaTickets || 0}\n*📚 OreBook:* ${mc.oreFound ? mc.oreFound.length : 0}\n*📈 Upgrades:*\n  _🍀 Luck: Lv.${mc.luckUpgrade || 0}_\n  _⚡ Speed: Lv.${mc.speedUpgrade || 0}_\n  _💎 Fortune: Lv.${mc.fortuneUpgrade || 0}_\n  _⚔️ Combat: Lv.${mc.combatUpgrade || 0}_`,
      "👤 Profil",
      `⬆️ Level ${mc.level}`,
    );
  }

  if (sub === "stats") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    const st = _ourinminecraftjs.getUpgradedStats.call(void 0, mc, pick);
    let txt = `*📊 STATS DETAIL*\n\n*🪓 Pick: ${pick ? pick.name : "Tidak Ada"}*\n  _⬆️ Lv.${pick ? pick.level : 1}/${pick ? pick.maxLevel : 5} | ⭐ EXP ${pick ? pick.exp : 0}/${pick ? pick.expToNextLevel : 100}_\n  _🍀 Luck: ${(st.luck * 100).toFixed(1)}% | ⚡ Speed: ${(st.speed * 100).toFixed(1)}%_\n  _💎 Fortune: +${(st.fortune * 100).toFixed(1)}% | 💰 Sell: +${(st.sellMultiplier * 100).toFixed(1)}%_\n`;
    if (pick && pick.enchant) {
      const e = _ourinminecraftdatajs.pickEnchants[pick.enchant];
      txt += `  _✨ Enchant: ${e ? e.name : pick.enchant} (${e ? e.rarity : "?"})_\n`;
    }
    txt += `\n*⚔️ Combat*\n  _⚔️ ATK: ${mc.atk} | ❤️ HP: ${mc.hp}/${mc.maxHp}¿Qué?\n¿Qué?🔥Bono de combate: +${(_ourinminecraftdatajs.UPGRADES.combat.effect(mc.combatUpgrade || 0) * 100).toFixed(1)}%_\n  _🏆 Wins: ${mc.combatWins || 0} | 💀 Losses: ${mc.combatLosses || 0}_\n`;
    txt += `\n*📈 Upgrades*\n  _🍀 Luck: Lv.${mc.luckUpgrade || 0} (+${(_ourinminecraftdatajs.UPGRADES.luck.effect(mc.luckUpgrade || 0) * 100).toFixed(1)}%)_\n  _⚡ Speed: Lv.${mc.speedUpgrade || 0} (+${(_ourinminecraftdatajs.UPGRADES.speed.effect(mc.speedUpgrade || 0) * 100).toFixed(1)}%)_\n  _💎 Fortune: Lv.${mc.fortuneUpgrade || 0} (+${(_ourinminecraftdatajs.UPGRADES.fortune.effect(mc.fortuneUpgrade || 0) * 100).toFixed(1)}%)_\n  _⚔️ Combat: Lv.${mc.combatUpgrade || 0} (+${(_ourinminecraftdatajs.UPGRADES.combat.effect(mc.combatUpgrade || 0) * 100).toFixed(1)}%)_`;
    return send(sock, m, txt, "📊 Stats Detail", pick ? pick.name : "");
  }

  if (sub === "orebook") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const found = user.minecraft.oreFound || [];
    if (found.length === 0)
      return m.reply(`¿Qué?📚 Ore Book vacio!_ \`- Mct Mine.\`¿Qué?`);
    let txt = `*📚 ORE BOOK* _(${found.length} ore)_\n\n`;
    for (const [k, b] of Object.entries(_ourinminecraftdatajs.biomes)) {
      const fl = b.listOre.filter((o) =>
        found.includes(o.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim()),
      );
      if (fl.length > 0) {
        txt += `*${b.name}*\n`;
        for (const o of fl) txt += `  ${rc(o.rarity)} ${o.name}\n`;
        txt += `\n`;
      }
    }
    return send(sock, m, txt.trim(), "📚 Ore Book", `🧱 ${found.length} ore`);
  }

  if (sub === "travel") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🗺Para los días del BIOME *\n\n`;
      for (const [k, b] of Object.entries(_ourinminecraftdatajs.biomes)) {
        const req = _ourinminecraftdatajs.travelRequirements[k];
        const ok = (mc.travelFound || []).includes(k);
        txt += `${ok ? "✅" : "🔒"} *${b.name}*${mc.currentBiome === k ? " _< Now_" : ""}\n`;
        txt += req
          ? `   _💰 ${_ourinminecraftjs.formatMoney.call(void 0, req.money)} | 🧱 ${req.blocks} blocks_\n`
          : `   _🆓 Free_\n`;
      }
      return send(
        sock,
        m,
        txt + `\n\`.mct travel <biome>\``,
        "🗺️ Daftar Biome",
        _optionalChain([_ourinminecraftdatajs.biomes, 'access', _27 => _27[mc.currentBiome || "plains"], 'optionalAccess', _28 => _28.name]) || "",
      );
    }
    const tk = sa[0].toLowerCase();
    if (!_ourinminecraftdatajs.biomes[tk]) return m.reply(`¿Qué?🗺¡La bioma no existe!\`- Es un viaje.\``);
    if (mc.currentBiome === tk)
      return m.reply(`¿Qué?📍Ya di${_ourinminecraftdatajs.biomes[tk].name}!_`);
    const req = _ourinminecraftdatajs.travelRequirements[tk];
    if (req) {
      if ((mc.money || 0) < req.money)
        return m.reply(`¿Qué?💸Dinero al @-@ Dinero!${_ourinminecraftjs.formatMoney.call(void 0, req.money)}_`);
      if ((mc.blocksMined || 0) < req.blocks)
        return m.reply(`¿Qué?🧱¡Bloqueos en una zanja!${req.blocks}_`);
      mc.money -= req.money;
    }
    if (!(mc.travelFound || []).includes(tk))
      mc.travelFound = [...(mc.travelFound || []), tk];
    mc.currentBiome = tk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🚪¡PINDAH azul!\n\n📍Ahora, en...${_ourinminecraftdatajs.biomes[tk].name}*\n🧱 ${_ourinminecraftdatajs.biomes[tk].listOre.length}gene está disponible`,
      "🚪 Travel!",
      _ourinminecraftdatajs.biomes[tk].name,
    );
  }

  if (sub === "shop") {
    let txt = `*🛒Tienda PICKAXE*\n\n`;
    for (const [k, pick] of Object.entries(_ourinminecraftdatajs.pickaxes)) {
      if (pick.price > 0)
        txt += `*${pick.name}*\n   _💰 ${_ourinminecraftjs.formatMoney.call(void 0, pick.price)}_\n   _🍀 Luck +${(pick.luck * 100).toFixed(0)}% | ⚡ Speed +${(pick.speed * 100).toFixed(0)}% | 📦 Combo: ${pick.comboOre}_\n   _${pick.description}_\n\n`;
    }
    return send(
      sock,
      m,
      txt + `\`.mct buy <pick>\``,
      "🛒 Toko Pickaxe",
      "🪓 Pilih pickaxe terbaik",
    );
  }

  if (sub === "buy") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const pk = sa[0] ? sa[0].toLowerCase() : "";
    if (!pk) return m.reply(`_🪓 Tentukan pickaxe!_ \`.mct shop\``);
    if (!_ourinminecraftdatajs.pickaxes[pk]) return m.reply(`¿Qué?🪓Pickaxe no existe! _\`. mct Shop.\``);
    if (mc.pickaxes[pk])
      return m.reply(`¿Q¿Ué?✅Si tener${_ourinminecraftdatajs.pickaxes[pk].name}!_`);
    if (_ourinminecraftdatajs.pickaxes[pk].price === 0)
      return m.reply(`¿Q¿¿Ué?🪙Pickax¡Este es de Token / Prestige!`);
    if ((mc.money || 0) < _ourinminecraftdatajs.pickaxes[pk].price)
      return m.reply(
        `¿Qué?💸Dinero al @-@ Dinero!${_ourinminecraftjs.formatMoney.call(void 0, _ourinminecraftdatajs.pickaxes[pk].price)}_`,
      );
    mc.money -= _ourinminecraftdatajs.pickaxes[pk].price;
    mc.pickaxes[pk] = { ..._ourinminecraftdatajs.pickaxes[pk] };
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🛍# PICKAXE Compra #\n\n*${_ourinminecraftdatajs.pickaxes[pk].name}*\n¿Qué?🪓Tipo\`- Es una emergencia.${pk}\`Lo siento por el par.`,
      "🪓 Pickaxe Baru!",
      _ourinminecraftdatajs.pickaxes[pk].name,
    );
  }

  if (sub === "equip") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const pk = sa[0] ? sa[0].toLowerCase() : "";
    if (!pk) return m.reply(`_🪓 Tentukan pickaxe!_ \`.mct picks\``);
    if (!mc.pickaxes[pk])
      return m.reply(`¿Qué?📭No pickaxe este!_\`- La mct elige.\``);
    mc.usedPickaxe = pk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🪓PICKAXE Instalado!*\n\n*${mc.pickaxes[pk].name}*✅amora _ activo`,
      "🪓 Equip Pickaxe!",
      mc.pickaxes[pk].name,
    );
  }

  if (sub === "picks") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const pks = mc.pickaxes || {};
    if (Object.keys(pks).length === 0)
      return m.reply(`¿Qué?📭No pickax¡E!`);
    let txt = `*🎒 KOLEKSI PICKAXE*\n\n`;
    for (const [k, pick] of Object.entries(pks)) {
      txt += `*${pick.name}*${mc.usedPickaxe === k ? " _✅ AKTIF_" : ""}\n  _⬆️ Lv.${pick.level || 1}/${pick.maxLevel} | 🍀 Luck ${(pick.luck * 100).toFixed(0)}% | ⚡ Speed ${(pick.speed * 100).toFixed(0)}%_\n`;
      if (pick.enchant)
        txt += `  _✨ Enchant: ${_ourinminecraftdatajs.pickEnchants[pick.enchant] ? _ourinminecraftdatajs.pickEnchants[pick.enchant].name : pick.enchant}_\n`;
    }
    return send(
      sock,
      m,
      txt + `\n\`.mct equip <pick>\``,
      "🎒 Koleksi Pickaxe",
      `🪓 ${Object.keys(pks).length} pickaxe`,
    );
  }

  if (sub === "enchant") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`¿Qué?🪓Pickaxe habilitado no existe! _`);
    const ek = sa[0] ? sa[0].toLowerCase() : "";
    if (!ek) {
      if (pick.enchant) {
        const e = _ourinminecraftdatajs.pickEnchants[pick.enchant];
        return m.reply(
          `¿Qué?✨Enchanté actual: *${e ? e.name : pick.enchant}* (${e ? e.rarity : "?"}- ¿Qué?\n\`- Mct encantada.<key>\`para cambia`,
        );
      }
      return m.reply(`_✨ Tentukan enchant!_ \`.mct enchants\``);
    }
    if (!_ourinminecraftdatajs.pickEnchants[ek])
      return m.reply(`¿Qué?✨¡El encantamiento no existe! _\`- Mct encantada.\``);
    const ench = _ourinminecraftdatajs.pickEnchants[ek];
    const cost = encCost(ench.rarity);
    if ((mc.money || 0) < cost)
      return m.reply(`¿Qué?💸Dinero al @-@ Dinero!${_ourinminecraftjs.formatMoney.call(void 0, cost)}_`);
    mc.money -= cost;
    pick.enchant = ek;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*✨ENCHANT Instalado!*\n\n*${ench.name}* _(${ench.rarity})_ ke *${pick.name}*\n_${ench.desc}¿Qué?\n¿Qué?💰Coste:${_ourinminecraftjs.formatMoney.call(void 0, cost)}_`,
      "✨ Enchant!",
      ench.name,
    );
  }

  if (sub === "enchants") {
    const byR = {};
    for (const [k, e] of Object.entries(_ourinminecraftdatajs.pickEnchants)) {
      if (!byR[e.rarity]) byR[e.rarity] = [];
      byR[e.rarity].push({ key: k, name: e.name, desc: e.desc });
    }
    let txt = `*📜Registrate ENCHANTMENT*\n\n`;
    for (const r of [
      "common",
      "rare",
      "epic",
      "legendary",
      "mythic",
      "godly",
      "secret",
    ]) {
      const list = byR[r];
      if (!list) continue;
      txt += `${rc(r)} *${r.toUpperCase()}* _${_ourinminecraftjs.formatMoney.call(void 0, encCost(r))}_\n`;
      for (const e of list) txt += `  \`${e.key}\`: ${e.name} _${e.desc}_\n`;
      txt += `\n`;
    }
    return send(
      sock,
      m,
      txt.trim() + `\n\`.mct enchant <key>\``,
      "📜 Enchantments",
      "✨ Pilih enchant",
    );
  }

  if (sub === "pickup") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`¿Qué?🪓Pickaxe habilitado no existe! _`);
    if (pick.level >= pick.maxLevel)
      return m.reply(`¿Qué?⬆PickaxHe terminado.xnivel!_`);
    const cost =
      Math.floor(pick.price * 0.1 * pick.level) || 12000 * pick.level;
    if ((mc.money || 0) < cost)
      return m.reply(`¿Qué?💸Dinero al @-@ Dinero!${_ourinminecraftjs.formatMoney.call(void 0, cost)}_`);
    mc.money -= cost;
    const res = _ourinminecraftjs.addPickExp.call(void 0, mc, pk, Math.floor(pick.expToNextLevel * 0.5));
    db.markDirty("users");
    return send(
      sock,
      m,
      res
        ? `*⬆️ PICKAXE UPGRADED!*\n\n${res}\n¿Qué?💰Coste:${_ourinminecraftjs.formatMoney.call(void 0, cost)}_`
        : `*⭐ PICKAXE EXP UP!*\n\n⭐ +${Math.floor(pick.expToNextLevel * 0.5)}EXP\n¿Qué?💰Coste:${_ourinminecraftjs.formatMoney.call(void 0, cost)}_`,
      "⬆️ Pickaxe Upgrade!",
      pick.name,
    );
  }

  if (sub === "fight") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      const mobs = _ourinminecraftjs.getAvailableMobs.call(void 0, mc);
      if (mobs.length === 0)
        return m.reply(`¿Qué?👹No hay mafrías disponibles! Levantar el nivel primero. _`);
      let txt = `*👹Registrate MOB*\n\n¿Qué?❤HP:${mc.hp}/${mc.maxHp} | ⚔️ ATK: ${mc.atk}_\n\n`;
      for (const mob of mobs) {
        txt += `${rc(mob.rarity)} *${mob.name}*\n  _❤️ HP: ${mob.hp} | ⚔️ ATK: ${mob.atk} | ⬆️ Lv.${mob.minLevel}+_  \n`;
      }
      txt += `\n\`- Muy ajustado.<mob>\`para⚔️ atacando!`;
      return send(sock, m, txt, "👹 Daftar Mob", `👾 ${mobs.length} mob`);
    }
    const mk = sa[0].toLowerCase();
    if (!_ourinminecraftdatajs.mobData[mk]) return m.reply(`¿Qué?👹¡La mafia no existe!\`- Muy ajustado.\``);
    const result = _ourinminecraftjs.doCombat.call(void 0, mc, mk);
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    if (result.won) {
      let txt = `*🏆Tu Ganaste!*\n\n⚔Memenwan${result.mobName}*\n\n`;
      for (const line of result.log) txt += `${line}\n`;
      txt += `\n*⭐ EXP:* +${result.expGain}`;
      if (result.drops.length > 0) {
        txt += `\n*🎁 Drops:*`;
        for (const d of result.drops)
          txt += `\n  ${d.name} _💰 ${_ourinminecraftjs.formatMoney.call(void 0, d.value)}_`;
      }
      return send(sock, m, txt, "🏆 Menang!", result.mobName);
    } else {
      let txt = `*💀Tu Perdiste!*\n\n⚔Memenwan${result.mobName}*\n\n`;
      for (const line of result.log) txt += `${line}\n`;
      txt += `\n¿Q¿Ué?❤️ HP tersisa: ${mc.hp}/${mc.maxHp}¿Qué?\n\`- Es una buena idea.\`para❤*Oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh`;
      return send(sock, m, txt, "💀 Kalah!", result.mobName);
    }
  }

  if (sub === "heal") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const result = _ourinminecraftjs.healPlayer.call(void 0, mc);
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    return send(
      sock,
      m,
      `*❤️ HEAL!*\n\n❤️ HP: ${result.hp}/${mc.maxHp}\n¿Qué?💰Coste:${_ourinminecraftjs.formatMoney.call(void 0, result.cost)}_`,
      "❤️ Heal!",
      `❤️ ${result.hp}`,
    );
  }

  if (sub === "smelt") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const result = _ourinminecraftjs.doSmelt.call(void 0, mc);
    if (result.count === 0)
      return m.reply(`¿Qué?🔥¡No hay ores que puedan ser fundidas!`);
    mc.money = (mc.money || 0) + result.totalValue;
    mc.totalEarned = (mc.totalEarned || 0) + result.totalValue;
    let txt = `*🔥SMELTING Terminado!*\n\n`;
    for (const s of result.smelted)
      txt += `${s.from} → ${s.to} _💰 ${_ourinminecraftjs.formatMoney.call(void 0, s.value)}_\n`;
    txt += `\n*💰 Total: ${_ourinminecraftjs.formatMoney.call(void 0, result.totalValue)}*\n*🏦Saldo:${_ourinminecraftjs.formatMoney.call(void 0, mc.money)}*`;
    db.markDirty("users");
    return send(
      sock,
      m,
      txt,
      "🔥 Smelting!",
      `💰 ${_ourinminecraftjs.formatMoney.call(void 0, result.totalValue)}`,
    );
  }

  if (sub === "craft") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🛠️ Registrate CRAFTING*\n\n`;
      for (const [k, r] of Object.entries(_ourinminecraftdatajs.CRAFT_RECIPES)) {
        const canCraft = (mc.level || 1) >= r.requiredLevel;
        txt += `${canCraft ? "✅" : "🔒"} *${r.name}* _\`${k}\`_\n  _💰 Value: ${_ourinminecraftjs.formatMoney.call(void 0, r.value)} | ⬆️ Lv.${r.requiredLevel}+_\n  _🧪 Bahan:_\n`;
        for (const [ing, cnt] of Object.entries(r.ingredients))
          txt += `    _${ing} x${cnt}_\n`;
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.mct craft <id>\``,
        "🛠️ Crafting",
        "🧪 Pilih resep",
      );
    }
    const result = _ourinminecraftjs.doCraft.call(void 0, mc, sa[0].toLowerCase());
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🛠- (Risas) - (Risas)\n\n*${result.item}*\n_💰 Value: ${_ourinminecraftjs.formatMoney.call(void 0, result.value)}_`,
      "🛠️ Crafted!",
      result.item,
    );
  }

  if (sub === "inv" || sub === "inventory") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (!mc.inventory || mc.inventory.length === 0)
      return m.reply(`¿Qué?🎒Inventory vacio!_`);
    const grouped = {};
    for (const item of mc.inventory) {
      const key = item.name;
      if (!grouped[key]) grouped[key] = { name: item.name, count: 0, value: 0 };
      grouped[key].count++;
      grouped[key].value += item.price || 0;
    }
    let txt = `*🎒 INVENTORY*\n\n`;
    let totalV = 0;
    for (const g of Object.values(grouped)) {
      txt += `${g.name} _📦 x${g.count} | 💰 ${_ourinminecraftjs.formatMoney.call(void 0, g.value)}_\n`;
      totalV += g.value;
    }
    txt += `\n*💰 Total Value: ${_ourinminecraftjs.formatMoney.call(void 0, totalV)}*`;
    return send(
      sock,
      m,
      txt,
      "🎒 Inventory",
      `📦 ${mc.inventory.length} items`,
    );
  }

  if (sub === "daily") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const now = new Date();
    if (mc.lastDaily) {
      const diff = now.getTime() - new Date(mc.lastDaily).getTime();
      if (diff < 86400000)
        return m.reply(
          `¿Qué?🎁¡Darry 's been taken!${Math.ceil((86400000 - diff) / 3600000)}* hora._`,
        );
    }
    const ld = mc.lastDaily ? new Date(mc.lastDaily) : null;
    mc.dailyStreak =
      ld && now.getTime() - ld.getTime() < 172800000
        ? (mc.dailyStreak || 0) + 1
        : 1;
    let rw = _ourinminecraftdatajs.DAILY_REWARDS[0];
    for (const r of _ourinminecraftdatajs.DAILY_REWARDS) {
      if (mc.dailyStreak >= r.streak) rw = r;
    }
    mc.money = (mc.money || 0) + rw.money;
    mc.gachaTickets = (mc.gachaTickets || 0) + rw.tickets;
    mc.lastDaily = now.toISOString();
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🎁 DAILY REWARD!*\n\n*🔥 Streak:* ${mc.dailyStreak} hari\n💰 +${_ourinminecraftjs.formatMoney.call(void 0, rw.money)}\n🎟️ +${rw.tickets}Billete de Gacha\n*🏦Saldo: *${_ourinminecraftjs.formatMoney.call(void 0, mc.money)}`,
      "🎁 Daily Reward!",
      `🔥 Streak ${mc.dailyStreak}`,
    );
  }

  if (sub === "gacha") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const useT = sa[0] && sa[0].toLowerCase() === "ticket";
    if (useT) {
      if ((mc.gachaTickets || 0) < 1)
        return m.reply(`¿Qué?🎟*Pasa de entradas!${mc.gachaTickets || 0}_`);
      mc.gachaTickets -= 1;
    } else {
      if ((mc.money || 0) < _ourinminecraftdatajs.GACHA_COST_COINS)
        return m.reply(
          `¿Qué?💸Dinero al @-@ Dinero!${_ourinminecraftjs.formatMoney.call(void 0, _ourinminecraftdatajs.GACHA_COST_COINS)}_`,
        );
      mc.money -= _ourinminecraftdatajs.GACHA_COST_COINS;
    }
    const result = _ourinminecraftjs.doGachaPull.call(void 0, mc);
    const item = result.item;
    let txt = `*🎰 GACHA RESULT!*\n\n`;
    switch (item.type) {
      case "pickaxe":
        if (_ourinminecraftdatajs.pickaxes[item.value] && !mc.pickaxes[item.value]) {
          mc.pickaxes[item.value] = { ..._ourinminecraftdatajs.pickaxes[item.value] };
          txt += `🪓¿Pueden pinchar?${item.label}*\n`;
        } else if (mc.pickaxes[item.value]) {
          const ref = Math.floor(
            (_ourinminecraftdatajs.pickaxes[item.value] ? _ourinminecraftdatajs.pickaxes[item.value].price : 0) * 0.3 ||
              120000,
          );
          mc.money = (mc.money || 0) + ref;
          txt += `♻️ Duplikat: *${item.label}* _💰 +${_ourinminecraftjs.formatMoney.call(void 0, ref)}_\n`;
        }
        break;
      case "tickets":
        mc.gachaTickets = (mc.gachaTickets || 0) + item.value;
        txt += `🎟️ +${item.value} Tiket\n`;
        break;
      case "tokens":
        mc.prestigeTokens = (mc.prestigeTokens || 0) + item.value;
        txt += `🪙 +${item.value} Tokens\n`;
        break;
      case "coins":
        mc.money = (mc.money || 0) + item.value;
        txt += `💰 +${_ourinminecraftjs.formatMoney.call(void 0, item.value)}\n`;
        break;
      case "enchant_scroll": {
        const avail = Object.entries(_ourinminecraftdatajs.pickEnchants).filter(
          ([, v]) => v.rarity === item.value,
        );
        if (avail.length > 0) {
          const [ek2, ed] = avail[Math.floor(Math.random() * avail.length)];
          const pk2 = mc.usedPickaxe || "woodpick";
          if (mc.pickaxes[pk2]) {
            mc.pickaxes[pk2].enchant = ek2;
            txt += `✨ Enchant: *${ed.name}* _(${item.value})_ ke pickaxe!\n`;
          }
        }
        break;
      }
      case "xp_boost":
        mc.exp = (mc.exp || 0) + Math.floor(mc.expToNextLevel * 0.5);
        txt += `⭐ XP Boost x${item.value}!\n`;
        break;
      default:
        txt += `${item.label}\n`;
    }
    if (result.isSSR) txt += `\n*🌈 SSR PULL!*`;
    if (result.pity) txt += `\n*🔥 Pity Activated!*`;
    txt += `\n\n_🔥 Pity: ${mc.gachaPity}/${_ourinminecraftdatajs.GACHA_PITY_LIMIT}¿Qué?\n¿Qué?🏦Saldo:${_ourinminecraftjs.formatMoney.call(void 0, mc.money)} | 🎟️ Tiket: ${mc.gachaTickets}_`;
    db.markDirty("users");
    return send(
      sock,
      m,
      txt,
      "🎰 Gacha!",
      result.isSSR ? "🌈 SSR PULL!" : "🎁 Result",
    );
  }

  if (sub === "upgrade") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const type = sa[0] ? sa[0].toLowerCase() : "";
    if (!type || !_ourinminecraftdatajs.UPGRADES[type]) {
      let txt = `*📈Mejora SHOP*\n\n`;
      for (const [k, u] of Object.entries(_ourinminecraftdatajs.UPGRADES)) {
        const lv = mc[k + "Upgrade"] || 0;
        txt += `*${u.name}* _(Lv.${lv}/${u.maxLevel})_\n  _${u.desc}_\n  ${lv >= u.maxLevel ? "_✅ MAXED_" : `_💰 Next: ${_ourinminecraftjs.formatMoney.call(void 0, u.getCost(lv))}_`}\n\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.mct mejora<luck/speed/fortune/combat>\``,
        "📈 Upgrade Shop",
        "⬆️ Tingkatkan stats",
      );
    }
    const upg = _ourinminecraftdatajs.UPGRADES[type];
    const lv = mc[type + "Upgrade"] || 0;
    if (lv >= upg.maxLevel) return m.reply(`¿Qué?✅Ya max!`);
    const cost = upg.getCost(lv);
    if ((mc.money || 0) < cost)
      return m.reply(`¿Qué?💸Dinero al @-@ Dinero!${_ourinminecraftjs.formatMoney.call(void 0, cost)}_`);
    mc.money -= cost;
    mc[type + "Upgrade"] = lv + 1;
    if (type === "combat")
      mc.atk = 4 + Math.floor(mc.level * 0.5) + (lv + 1) * 3;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*⬆️ ${upg.name} LEVEL UP!*\n\n_⬆️ Level ${lv + 1}¿Qué?\n¿Qué?💰Coste:${_ourinminecraftjs.formatMoney.call(void 0, cost)}_\n_${upg.desc}_`,
      "📈 Upgrade!",
      `${upg.name} Lv.${lv + 1}`,
    );
  }

  if (sub === "prestige") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    const cp = mc.prestige || 0;
    if (sa[0] && sa[0].toLowerCase() === "confirm") {
      const reqs = [
        { blocks: 500, money: 2e10 },
        { blocks: 1500, money: 2e12 },
        { blocks: 4000, money: 2e14 },
        { blocks: 10000, money: 2e19 },
        { blocks: 25000, money: 2e22 },
      ];
      const req = reqs[cp];
      if (!req) return m.reply(`¿Qué?👑Ya maxprestigio!`);
      if ((mc.blocksMined || 0) < req.blocks)
        return m.reply(`¿Qué?🧱¡Bloqueos en una zanja!${req.blocks}_`);
      if ((mc.money || 0) < req.money)
        return m.reply(`¿Qué?💸Dinero al @-@ Dinero!${_ourinminecraftjs.formatMoney.call(void 0, req.money)}_`);
      mc.prestige = cp + 1;
      mc.money = Math.floor(mc.money * 0.1);
      mc.blocksMined = 0;
      mc.streak = 0;
      mc.prestigeTokens =
        (mc.prestigeTokens || 0) + [60, 180, 600, 1200, 6000][cp];
      const titles = [
        "Penambang Baru",
        "Veteran",
        "Master Miner",
        "Legend",
        "Transcendent",
        "God of Mining",
      ];
      if (cp === 0 && !mc.pickaxes.prestigepick)
        mc.pickaxes.prestigepick = { ..._ourinminecraftdatajs.pickaxes.prestigepick };
      if (cp === 2 && !mc.pickaxes.cosmicpick)
        mc.pickaxes.cosmicpick = { ..._ourinminecraftdatajs.pickaxes.cosmicpick };
      db.markDirty("users");
      return send(
        sock,
        m,
        `*👑 PRESTIGE UP!*\n\n*🏷️ Title:* ${titles[mc.prestige]}\n*🪙 Tokens:* ${mc.prestigeTokens}\n\n¿Q¿Ué?💸Dinero - 90 %,🧱bloques con restablecer _`,
        "👑 PRESTIGE!",
        titles[mc.prestige],
      );
    }
    let txt = `*👑 PRESTIGE SYSTEM*\n\n*👑 Prestige:* ${cp}\n*🪙 Tokens:* ${mc.prestigeTokens || 0}\n\n`;
    const allReqs = [
      { lv: 1, blocks: 500, money: 2e10, rw: "Prestige Pickaxe + 60 tokens" },
      { lv: 2, blocks: 1500, money: 2e12, rw: "Luck +20% + 180 tokens" },
      { lv: 3, blocks: 4000, money: 2e14, rw: "Cosmic Pickaxe + 600 tokens" },
      { lv: 4, blocks: 10000, money: 2e19, rw: "2x EXP + 1200 tokens" },
      { lv: 5, blocks: 25000, money: 2e22, rw: "Omega Pickaxe + 6000 tokens" },
    ];
    for (const r of allReqs)
      txt += `${cp >= r.lv ? "✅" : "🔒"} *P${r.lv}*: _🧱 ${r.blocks} blocks | 💰 ${_ourinminecraftjs.formatMoney.call(void 0, r.money)}_\n  _${r.rw}_\n\n`;
    return send(
      sock,
      m,
      txt + `\`. prestigio st confimar.\` _(hati-hati!)_`,
      "👑 Prestige",
      `P${cp}`,
    );
  }

  if (sub === "tokens") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🪙Token STORE *\n\n*🪙Tokens: *${mc.prestigeTokens || 0}\n\n`;
      for (const item of _ourinminecraftdatajs.TOKEN_SHOP)
        txt += `*${item.name}* _🪙 ${item.cost} tokens_\n`;
      return send(
        sock,
        m,
        txt + `\n\`.mct tokens <id>\``,
        "🪙 Token Store",
        `🪙 ${mc.prestigeTokens || 0} tokens`,
      );
    }
    const iid = sa[0].toLowerCase();
    const item = _ourinminecraftdatajs.TOKEN_SHOP.find((i) => i.id === iid);
    if (!item) return m.reply(`¿Qué?🛒El artículo no existe! _\`. fichas de mct.\``);
    if ((mc.prestigeTokens || 0) < item.cost)
      return m.reply(`¿Qué?🪙 Tokens menos! Necesito ${item.cost}_`);
    mc.prestigeTokens -= item.cost;
    switch (item.type) {
      case "pickaxe":
        if (_ourinminecraftdatajs.pickaxes[item.value] && !mc.pickaxes[item.value]) {
          mc.pickaxes[item.value] = { ..._ourinminecraftdatajs.pickaxes[item.value] };
        } else {
          mc.prestigeTokens += item.cost;
          return m.reply(`¿Qué?✅Ya tengo un pickaxe este!_`);
        }
        break;
      case "tickets":
        mc.gachaTickets = (mc.gachaTickets || 0) + item.value;
        break;
      case "coins":
        mc.money = (mc.money || 0) + item.value;
        break;
    }
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🛍*Es un regalo*\n\n*${item.name}* _seharga 🪙 ${item.cost} tokens_`,
      "🪙 Token Store!",
      item.name,
    );
  }

  if (sub === "jackpot") {
    const user = _ourinminecraftjs.getOrCreateMCUser.call(void 0, db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🎰SISTEMA DE JACKPOT\n\n¿Q¿¿Ué?💎El hada de jackpot con un regalo super grande!\n¿Q¿¿Ué?🎁La specificia puede ser para Premium _, para socio _, para la energía, el límite _, incluyen el UNLIMITEDE _!\n\n`;
      for (const pool of _ourinminecraftjs.JACKPOT_POOLS) {
        txt += `*${pool.name}*\n¿Qué?💰Coste:${_ourinminecraftjs.formatMoney.call(void 0, pool.cost)}_\n  _🎯 Rate: ${pool.weight}%_\n  _🎁 Rewards:_\n`;
        for (const rw of pool.rewards) {
          const label =
            {
              coins: "Koin",
              energi: "Energi",
              limit: "Limit",
              tickets: "Gacha Tickets",
              tokens: "Prestige Tokens",
              exp_boost: "EXP Boost",
              premium_7d: "Premium 7 Días",
              premium_30d: "Premium 30 días",
              partner_7d: "7 Days Partners",
              partner_30d: "Asociados 30 días",
              unlimited_energi: "UNLIMITED Energi",
              unlimited_limit: "UNLIMITED Limit",
              owner_reward: "Propietario REWARD",
            }[rw.type] || rw.type;
          txt += `    _${label}: ${rw.min === rw.max ? rw.min : `${rw.min}-${rw.max}`} (${rw.weight}%)_\n`;
        }
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.mct jackpot <iron/gold/diamond/netherite/dragon>\``,
        "🎰 Jackpot!",
        "💎 Hadiah Super Besar",
      );
    }
    const poolId = sa[0].toLowerCase();
    const pool = _ourinminecraftjs.JACKPOT_POOLS.find((p) => p.id === poolId);
    if (!pool) return m.reply(`¿Qué?🎰¡Tier no existe!\`- El bote Mct.\``);
    if ((mc.money || 0) < pool.cost)
      return m.reply(`¿Qué?💸Dinero al @-@ Dinero!${_ourinminecraftjs.formatMoney.call(void 0, pool.cost)}_`);
    mc.money -= pool.cost;
    const result = _ourinminecraftjs.doJackpotPull.call(void 0, mc, poolId);
    if (!result) return m.reply(`¿Qué?❌¡Fierce!`);
    const applied = _ourinminecraftjs.applyJackpotReward.call(void 0, db, mc, m.sender, result);
    db.markDirty("users");
    let txt = `*🎰 ${pool.name.toUpperCase()}!*\n\n`;
    const isBig = [
      "premium_7d",
      "premium_30d",
      "partner_7d",
      "partner_30d",
      "unlimited_energi",
      "unlimited_limit",
      "owner_reward",
    ].includes(result.reward.type);
    if (isBig) txt += `*💥JACKPOT Grande!*\n\n`;
    txt += `${applied.desc}\n\n¿Qué?💰Coste:${_ourinminecraftjs.formatMoney.call(void 0, pool.cost)}¿Qué?\n¿Qué?🏦Saldo:${_ourinminecraftjs.formatMoney.call(void 0, mc.money)}_`;
    return send(
      sock,
      m,
      txt,
      isBig ? "💥 JACKPOT BESAR!" : `🎰 ${pool.name}`,
      applied.desc,
    );
  }

  if (sub === "top") {
    const users = db.db.data.users || {};
    const rankings = [];
    for (const [jid, ud] of Object.entries(users)) {
      if (ud.minecraft)
        rankings.push({
          jid,
          blocksMined: ud.minecraft.blocksMined || 0,
          money: ud.minecraft.money || 0,
          level: ud.minecraft.level || 1,
          prestige: ud.minecraft.prestige || 0,
        });
    }
    if (rankings.length === 0) return m.reply(`¿Qué?👤¡No hay ningún jugador!`);
    rankings.sort((a, b) => {
      if (b.prestige !== a.prestige) return b.prestige - a.prestige;
      if (b.blocksMined !== a.blocksMined) return b.blocksMined - a.blocksMined;
      return b.money - a.money;
    });
    let txt = `*🏆 LEADERBOARD MINECRAFT*\n\n`;
    const top = rankings.slice(0, 10);
    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      const medal =
        i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      txt += `${medal} @${p.jid}\n  _👑 P${p.prestige} | 🧱 ${p.blocksMined} blocks | 💰 ${_ourinminecraftjs.formatMoney.call(void 0, p.money)}_\n`;
    }
    return send(sock, m, txt.trim(), "🏆 Leaderboard", "👑 Top Pemain");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
