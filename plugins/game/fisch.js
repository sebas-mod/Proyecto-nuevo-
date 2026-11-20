"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');












var _ourinfischjs = require('../../src/lib/ourin-fisch.js');












var _ourinfischdatajs = require('../../src/lib/ourin-fisch-data.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);

const FC = 15;
const rc = (r) => _ourinfischdatajs.RARITY_EMOJI[r] || "W";
const encCost = (r) =>
  ({
    common: 50000,
    rare: 500000,
    epic: 5e6,
    legendary: 5e7,
    mythic: 5e8,
    godly: 5e9,
    secret: 5e10,
  })[r] || 50000;

let thumbFish = null;
try {
  const p = _path2.default.join(process.cwd(), "assets", "images", "ourin-fishit.jpg");
  if (_fs2.default.existsSync(p)) thumbFish = _fs2.default.readFileSync(p);
} catch (e) {}

function ctx(title, body) {
  const sId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
  const sName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";
  const c = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: sId,
      newsletterName: sName,
      serverMessageId: 127,
    },
  };
  return c;
}

function send(sock, m, text, title, body) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${_configjs2.default.info.website} ${text}`,
      url: `${_configjs2.default.info.website}`,
      title: `𝗙𝗜𝗦𝗛 𝗜𝗧 𝗚𝗔𝗠𝗘𝗦`,
      description: `Obtenga las recompensas y las diferencias de los resultados de la pesca.`,
      jpegThumbnail: thumbFish,
      previewType: 0,
    },
    { quoted: m },
  );
  return { key: { id: msgId, remoteJid: m.chat, fromMe: true } };
}

const pluginConfig = {
  name: "fisht",
  alias: ["fishit"],
  category: "game",
  description: "Fishit - Fishing Rod Game",
  usage: ".fisht <command>",
  example: ".fisht help",
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

  if (cmd === "fishit") {
    if (!sub || sub === "on" || sub === "off") {
      if (!m.isGroup) return m.reply("Toggle está en grupo.");
      if (!m.isOwner && !m.isAdmin) return m.reply("_Hanya administrador/owner_");
      const gd = db.getGroup(m.chat) || {};
      if (sub === "on") {
        gd.fishitEnabled = true;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `* FISHIT ENABLED *\n\n¡Todos los clientes están para jugar a Fishhit!\nEscribe\`- Ayuda de pescado.\`para empieza`,
          "Fishit ON",
          "Aktifkan",
        );
      }
      if (sub === "off") {
        gd.fishitEnabled = false;
        db.setGroup(m.chat, gd);
        return send(sock, m, `*FISHIT DISABLED*`, "Fishit OFF", "Nonaktifkan");
      }
      return m.reply(
        `*Fishit:* ${gd.fishitEnabled ? "ON" : "OFF"}\n\`.fishit on/off\``,
      );
    }
  }

  if (cmd !== "fisht" && cmd !== "fishit") return;

  if (!sub || sub === "help" || sub === "menu") {
    return send(
      sock,
      m,
      `* Juego de FISHIT *\n* El sistema completo de pesca del juego\n\n` +
        `* FISHING*\n\`.fisht mancing\`* La pesca activa *\n\`Vista de pesca.\`Toma asiento.\n\`- Bellado pescado.\` _Jual ikan_\n\`- Cuaderno de pesca.\`_ Recaudación de fondos\n\`.fisht mutbook\` _Koleksi mutasi_\n\`. top de pescado.\`Líder Board\n\n` +
        `* PROFILE *\n\`# Me pescaron #\` _Profil kamu_\n\`Estadísticas de pesca.\` _Stats detail_\n\`- pescado diario.\`* Recompensa de los Dairy *\n\n` +
        `* FLEURY ROD *\n\`Viajes de pesca.\`Lista de islas\n\`Viajes de pesca.<pulau>\` _Pindah pulau_\n\`Tienda de pescados.\`Tienda rod_\n\`- pescado comprar.<rod>\`Comprar un barra\n\`. equahs pescados.<rod>\` _Pasang rod_\n\`- Varillas de pesca.\`_ Recaudación de fondos\n\`- Fisht encantada.<key>\`# Enchantend rod_\n\`Pescado encantado.\` _Daftar enchant_\n\`- Pescado de la barra.\`# Mejora rod_\n\n` +
        `* PRESTIGE *\n\`- Prestigio pescado.\`# Info prestigio _\n\`-Fives de pesca.\`*Torra de token*\n\`- Pescado mejora.\` _Upgrade stats_\n\`- Gacha pescadora.\` _Gacha_\n\`- Vamos a pescarkoot.\`Gacha usó un boleto\n\n` +
        `JACKPOT\n\`. bote de pescado.\`# Estoy tan feliz # # Oh, estoy tan feliz #\n\`. bote de pescado.<tier>\`♪\n* Jackpot puede amar * * Premium, * * socio, compañero, límite, include UNLIMITED *`,
      "Fishit Game",
      "Fishing Rod Game",
    );
  }
  if (sub === "mancing" || sub === "fish") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    if (f.fishingPending && f.fishingPending.length > 0)
      return m.reply(`* 91 * Homre en radio* *93*\`Vista de pesca.\`- Sí, sí.`);
    const now = Date.now();
    if (f.lastFishTime && now - f.lastFishTime < FC * 1000)
      return m.reply(
        `Espera.${Math.ceil((FC * 1000 - (now - f.lastFishTime)) / 1000)}* segundos*`,
      );
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`¡No hay Rod activo!\`- Varillas de pesca.\``);
    const ik = f.currentIsland || "mousewood";
    const st = _ourinfischjs.getUpgradedStats.call(void 0, f, rod);
    const eRod = {
      ...rod,
      luck: st.luck,
      speed: st.speed,
      sellMultiplier: st.sellMultiplier,
    };
    const catches = [];
    let tv = 0;
    for (let i = 0; i < (rod.comboFish || 1); i++) {
      const fish = _ourinfischjs.getRandomFish.call(void 0, eRod, ik);
      if (fish) {
        fish.price = Math.round(
          fish.price * _ourinfischjs.getStreakBonus.call(void 0, f.streak || 0).mult,
        );
        catches.push(fish);
        tv += fish.price;
      }
    }
    f.fishingPending = catches;
    f.lastFishTime = now;
    f.streak = (f.streak || 0) + 1;
    await send(
      sock,
      m,
      `*_Memancing di ${_optionalChain([_ourinfischdatajs.islands, 'access', _23 => _23[ik], 'optionalAccess', _24 => _24.name]) || ik}..._*\n_Rod: ${rod.name} | Luck: ${(st.luck * 100).toFixed(1)}%_`,
      "Memancing...",
      _optionalChain([_ourinfischdatajs.islands, 'access', _25 => _25[ik], 'optionalAccess', _26 => _26.name]) || "",
    );
    await new Promise((r) =>
      setTimeout(
        r,
        Math.min(Math.max(2000, 5000 - (rod.speed || 0) * 3000), 4000),
      ),
    );
    let txt = `*Resultado MANCING!*\n\n`;
    for (const c of catches) {
      txt += `${rc(c.rarity)} *${c.name}*\n   _${_ourinfischjs.formatMoney.call(void 0, c.price)} | ${c.kg}kg_\n`;
      if (c.isMutated)
        txt += `   _Mutasi: ${c.mutations.filter((x) => x !== "Normal").join(", ")}_\n`;
    }
    txt += `\n*Total: ${_ourinfischjs.formatMoney.call(void 0, tv)}*`;
    if (f.streak >= 3) txt += `\n_Streak: ${f.streak}x_`;
    txt += `\n\n\`Vista de pesca.\`para obteniendo!`;
    db.markDirty("users");
    return send(sock, m, txt, "Hasil Mancing!", _ourinfischjs.formatMoney.call(void 0, tv));
  }

  if (sub === "view") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    if (!f.fishingPending || f.fishingPending.length === 0)
      return m.reply(`_Tidak ada tangkapan._ \`.fisht mancing\`-¡¡Lo siento!`);
    const catches = f.fishingPending;
    let tv = 0,
      te = 0,
      nf = [],
      nm = [];
    for (const fish of catches) {
      tv += fish.price;
      te += Math.max(10, Math.floor(fish.price / 50));
      const cn = fish.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (!f.fishFound.includes(cn)) {
        f.fishFound.push(cn);
        nf.push(cn);
      }
      if (fish.isMutated)
        for (const mut of fish.mutations) {
          if (mut !== "Normal" && !f.mutationFound.includes(mut)) {
            f.mutationFound.push(mut);
            nm.push(mut);
          }
        }
    }
    f.money = (f.money || 0) + tv;
    f.fishCaught = (f.fishCaught || 0) + catches.length;
    f.totalEarned = (f.totalEarned || 0) + tv;
    f.inventory = [...(f.inventory || []), ...catches];
    const rlu = _ourinfischjs.addRodExp.call(void 0, f, f.usedFishingRod || "basicrod", te);
    const plu = _ourinfischjs.addPlayerExp.call(void 0, f, te);
    f.fishingPending = [];
    let txt = `*TANGKAPAN Tomado!*\n\n+${_ourinfischjs.formatMoney.call(void 0, tv)}\n+${te} EXP\n+${catches.length} ikan\n`;
    if (nf.length > 0) txt += `\n*Pez Nuevo:*${nf.join(", ")}`;
    if (nm.length > 0) txt += `\n*Mutasi Nuevo:*${nm.join(", ")}`;
    if (rlu) txt += `\n\n${rlu}`;
    if (plu) txt += `\n*LEVEL UP! Level ${f.level}*`;
    db.markDirty("users");
    return send(sock, m, txt, "Tangkapan Diambil!", `+${_ourinfischjs.formatMoney.call(void 0, tv)}`);
  }

  if (sub === "sell") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    if (!f.inventory || f.inventory.length === 0)
      return m.reply(`_Inventory vacio!_\`.fisht mancing\`- Sí, sí.`);
    let tv = 0;
    for (const fish of f.inventory) tv += fish.price || 0;
    const sb = _ourinfischdatajs.UPGRADES.sell.effect(f.sellUpgrade || 0);
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    const rsm = rod ? rod.sellMultiplier || 0 : 0;
    const fv = Math.round(tv * (1 + sb + rsm));
    const fc2 = f.inventory.length;
    f.money = (f.money || 0) + fv;
    f.totalEarned = (f.totalEarned || 0) + fv;
    f.inventory = [];
    db.markDirty("users");
    return send(
      sock,
      m,
      `*Pez TERJUAL!*\n\nCantidad:${fc2}\nTotal: ${_ourinfischjs.formatMoney.call(void 0, fv)}\nSaldo: ${_ourinfischjs.formatMoney.call(void 0, f.money)}`,
      "Ikan Terjual!",
      _ourinfischjs.formatMoney.call(void 0, fv),
    );
  }

  if (sub === "me") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    return send(
      sock,
      m,
      `*Perfil PEMANCING*\n\n*Nivel:*${f.level} _(${f.exp}/${f.expToNextLevel}EXPERIENCIA\n*Dinero:*${_ourinfischjs.formatMoney.call(void 0, f.money)}\n*Pez:*${f.fishCaught}\n*Rod:* ${rod ? rod.name : "Basic"} _(Lv.${rod ? rod.level : 1}- ¿Qué?\n*Isla:*${_ourinfischdatajs.islands[f.currentIsland] ? _ourinfischdatajs.islands[f.currentIsland].name : f.currentIsland}\n*Streak:* ${f.streak || 0}\n*Prestige:* ${f.prestige || 0}\n*Tokens:* ${f.prestigeTokens || 0}\n*Tickets:* ${f.gachaTickets || 0}\n*FishBook:* ${f.fishFound ? f.fishFound.length : 0}\n*Mutasi:* ${f.mutationFound ? f.mutationFound.length : 0}\n*Upgrades:*\n  _Luck: Lv.${f.luckUpgrade || 0}_\n  _Speed: Lv.${f.speedUpgrade || 0}_\n  _Sell: Lv.${f.sellUpgrade || 0}_`,
      "Profil",
      `Level ${f.level}`,
    );
  }

  if (sub === "stats") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    const st = _ourinfischjs.getUpgradedStats.call(void 0, f, rod);
    let txt = `*STATS DETAIL*\n\n*Rod: ${rod ? rod.name : "None"}*\n  _Lv.${rod ? rod.level : 1}/${rod ? rod.maxLevel : 5} | EXP ${rod ? rod.exp : 0}/${rod ? rod.expToNextLevel : 100}_\n  _Luck: ${(st.luck * 100).toFixed(1)}% | Speed: ${(st.speed * 100).toFixed(1)}%_\n  _Sell: +${(st.sellMultiplier * 100).toFixed(1)}% | Combo: ${rod ? rod.comboFish : 1}_\n`;
    if (rod && rod.enchant) {
      const e = _ourinfischdatajs.rodEnchants[rod.enchant];
      txt += `  _Enchant: ${e ? e.name : rod.enchant} (${e ? e.rarity : "?"})_\n`;
    }
    txt += `\n*Upgrades*\n  _Luck: Lv.${f.luckUpgrade || 0} (+${(_ourinfischdatajs.UPGRADES.luck.effect(f.luckUpgrade || 0) * 100).toFixed(1)}%)_\n  _Speed: Lv.${f.speedUpgrade || 0} (+${(_ourinfischdatajs.UPGRADES.speed.effect(f.speedUpgrade || 0) * 100).toFixed(1)}%)_\n  _Sell: Lv.${f.sellUpgrade || 0} (+${(_ourinfischdatajs.UPGRADES.sell.effect(f.sellUpgrade || 0) * 100).toFixed(1)}%)_`;
    return send(sock, m, txt, "Stats Detail", rod ? rod.name : "");
  }
  if (sub === "fishbook") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const found = user.fisch.fishFound || [];
    if (found.length === 0)
      return m.reply(`- ¡Pez Book vacio!\`.fisht mancing\`¿Qué?`);
    let txt = `*FISH BOOK* _(${found.length} spesies)_\n\n`;
    for (const [k, isle] of Object.entries(_ourinfischdatajs.islands)) {
      const fl = isle.listFish.filter((f) => found.includes(f.name));
      if (fl.length > 0) {
        txt += `*${isle.name}*\n`;
        for (const f of fl) txt += `  ${rc(f.rarity)} ${f.name}\n`;
        txt += `\n`;
      }
    }
    return send(sock, m, txt.trim(), "Fish Book", `${found.length} spesies`);
  }

  if (sub === "mutbook") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const found = user.fisch.mutationFound || [];
    if (found.length === 0) return m.reply(`*Mutation Book vacio!`);
    let txt = `*MUTATION BOOK* _(${found.length})_\n\n`;
    for (const mut of found) {
      const d = _ourinfischdatajs.mutations[mut];
      if (d) txt += `*${mut}* _x${d.multiplier}_\n`;
    }
    return send(sock, m, txt.trim(), "Mutation Book", `${found.length} mutasi`);
  }

  if (sub === "travel") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*Registrate Isla*\n\n`;
      for (const [k, isle] of Object.entries(_ourinfischdatajs.islands)) {
        const req = _ourinfischdatajs.travelRequirements[k];
        const ok = (f.travelFound || []).includes(k);
        txt += `${ok ? "[OK]" : "[LOCK]"} *${isle.name}*${f.currentIsland === k ? " _< Now_" : ""}\n`;
        txt += req
          ? `   _${_ourinfischjs.formatMoney.call(void 0, req.money)} | ${req.fish} fish_\n`
          : `   _Free_\n`;
      }
      return send(
        sock,
        m,
        txt + `\n\`.fisht travel <pulau>\``,
        "Daftar Pulau",
        _optionalChain([_ourinfischdatajs.islands, 'access', _27 => _27[f.currentIsland || "mousewood"], 'optionalAccess', _28 => _28.name]) || "",
      );
    }
    const tk = sa[0].toLowerCase();
    if (!_ourinfischdatajs.islands[tk]) return m.reply(`-¡No Isla!\`Viajes de pesca.\``);
    if (f.currentIsland === tk)
      return m.reply(`_Sudah en ${_ourinfischdatajs.islands[tk].name}!_`);
    const req = _ourinfischdatajs.travelRequirements[tk];
    if (req) {
      if ((f.money || 0) < req.money)
        return m.reply(`Uma, Uma, Uma, Uma, Uma, Uma, Uma${_ourinfischjs.formatMoney.call(void 0, req.money)}_`);
      if ((f.fishCaught || 0) < req.fish)
        return m.reply(`_Ikan menos! Necesito ${req.fish}_`);
      f.money -= req.money;
    }
    if (!(f.travelFound || []).includes(tk))
      f.travelFound = [...(f.travelFound || []), tk];
    f.currentIsland = tk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*PINDAH Isla!*\n\nAhora en *${_ourinfischdatajs.islands[tk].name}*\n${_ourinfischdatajs.islands[tk].listFish.length}El derrame cerebral de los peces se suspende`,
      "Travel!",
      _ourinfischdatajs.islands[tk].name,
    );
  }

  if (sub === "shop") {
    let txt = `* Tienda FISHING ROD *\n\n`;
    for (const [k, rod] of Object.entries(_ourinfischdatajs.fishingRod)) {
      if (rod.price > 0)
        txt += `*${rod.name}*\n   _${_ourinfischjs.formatMoney.call(void 0, rod.price)}_\n   _Luck +${(rod.luck * 100).toFixed(0)}% | Speed +${(rod.speed * 100).toFixed(0)}% | Combo: ${rod.comboFish}_\n   _${rod.description}_\n\n`;
    }
    return send(
      sock,
      m,
      txt + `\`.fisht buy <rod>\``,
      "Toko Rod",
      "Pilih rod terbaik",
    );
  }

  if (sub === "buy") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const rk = sa[0] ? sa[0].toLowerCase() : "";
    if (!rk) return m.reply(`_Tentukan rod!_ \`.fisht shop\``);
    if (!_ourinfischdatajs.fishingRod[rk]) return m.reply(`¡Rod no existe!\`Tienda de pescados.\``);
    if (f.fishingRods[rk])
      return m.reply(`*Para estar listo*${_ourinfischdatajs.fishingRod[rk].name}!_`);
    if (_ourinfischdatajs.fishingRod[rk].price === 0)
      return m.reply(`¡Este varilla es de Token / Prestige!`);
    if ((f.money || 0) < _ourinfischdatajs.fishingRod[rk].price)
      return m.reply(
        `Uma, Uma, Uma, Uma, Uma, Uma, Uma${_ourinfischjs.formatMoney.call(void 0, _ourinfischdatajs.fishingRod[rk].price)}_`,
      );
    f.money -= _ourinfischdatajs.fishingRod[rk].price;
    f.fishingRods[rk] = { ..._ourinfischdatajs.fishingRod[rk] };
    db.markDirty("users");
    return send(
      sock,
      m,
      `*ROD Comprado!*\n\n*${_ourinfischdatajs.fishingRod[rk].name}*\nSobre eso.\`. equahs pescados.${rk}\`Lo siento por el par.`,
      "Rod Baru!",
      _ourinfischdatajs.fishingRod[rk].name,
    );
  }

  if (sub === "equip") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const rk = sa[0] ? sa[0].toLowerCase() : "";
    if (!rk) return m.reply(`_Tentukan rod!_ \`.fisht rods\``);
    if (!f.fishingRods[rk])
      return m.reply(`¡No tenga está vara!\`- Varillas de pesca.\``);
    f.usedFishingRod = rk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*ROD Instalado!*\n\n*${f.fishingRods[rk].name}* Ahora está en marcha _`,
      "Equip Rod!",
      f.fishingRods[rk].name,
    );
  }

  if (sub === "rods") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const rods = f.fishingRods || {};
    if (Object.keys(rods).length === 0) return m.reply(`# No tener vara!`);
    let txt = `*KOLEKSI ROD*\n\n`;
    for (const [k, rod] of Object.entries(rods)) {
      txt += `*${rod.name}*${f.usedFishingRod === k ? " _AKTIF_" : ""}\n  _Lv.${rod.level || 1}/${rod.maxLevel} | Luck ${(rod.luck * 100).toFixed(0)}% | Speed ${(rod.speed * 100).toFixed(0)}%_\n`;
      if (rod.enchant)
        txt += `  _Enchant: ${_ourinfischdatajs.rodEnchants[rod.enchant] ? _ourinfischdatajs.rodEnchants[rod.enchant].name : rod.enchant}_\n`;
    }
    return send(
      sock,
      m,
      txt + `\n\`.fisht equip <rod>\``,
      "Koleksi Rod",
      `${Object.keys(rods).length} rod`,
    );
  }
  if (sub === "enchant") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`¡No hay Rod activo!`);
    const ek = sa[0] ? sa[0].toLowerCase() : "";
    if (!ek) {
      if (rod.enchant) {
        const e = _ourinfischdatajs.rodEnchants[rod.enchant];
        return m.reply(
          `*Actividad encantadora*${e ? e.name : rod.enchant}* (${e ? e.rarity : "?"}- ¿Qué?\n\`- Fisht encantada.<key>\`para cambia`,
        );
      }
      return m.reply(`_Tentukan enchant!_ \`.fisht enchants\``);
    }
    if (!_ourinfischdatajs.rodEnchants[ek])
      return m.reply(`*¡El encantamiento no existe!\`Pescado encantado.\``);
    const ench = _ourinfischdatajs.rodEnchants[ek];
    const cost = encCost(ench.rarity);
    if ((f.money || 0) < cost)
      return m.reply(`Uma, Uma, Uma, Uma, Uma, Uma, Uma${_ourinfischjs.formatMoney.call(void 0, cost)}_`);
    f.money -= cost;
    rod.enchant = ek;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*ENCHANT Instalado!*\n\n*${ench.name}* _(${ench.rarity})_ ke *${rod.name}*\n_${ench.desc}¿Qué?\n> 91; Aplausos > 93;${_ourinfischjs.formatMoney.call(void 0, cost)}_`,
      "Enchant!",
      ench.name,
    );
  }

  if (sub === "enchants") {
    const byR = {};
    for (const [k, e] of Object.entries(_ourinfischdatajs.rodEnchants)) {
      if (!byR[e.rarity]) byR[e.rarity] = [];
      byR[e.rarity].push({ key: k, name: e.name, desc: e.desc });
    }
    let txt = `*Registrate ENCHANTMENT*\n\n`;
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
      txt += `${rc(r)} *${r.toUpperCase()}* _${_ourinfischjs.formatMoney.call(void 0, encCost(r))}_\n`;
      for (const e of list) txt += `  \`${e.key}\`: ${e.name} _${e.desc}_\n`;
      txt += `\n`;
    }
    return send(
      sock,
      m,
      txt.trim() + `\n\`.fisht enchant <key>\``,
      "Enchantments",
      "Pilih enchant",
    );
  }

  if (sub === "rodup") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`¡No hay Rod activo!`);
    if (rod.level >= rod.maxLevel) return m.reply(`*Rod 's a @-@ a @-@ ma*xnivel!_`);
    const cost = Math.floor(rod.price * 0.1 * rod.level) || 10000 * rod.level;
    if ((f.money || 0) < cost)
      return m.reply(`Uma, Uma, Uma, Uma, Uma, Uma, Uma${_ourinfischjs.formatMoney.call(void 0, cost)}_`);
    f.money -= cost;
    const res = _ourinfischjs.addRodExp.call(void 0, f, rk, Math.floor(rod.expToNextLevel * 0.5));
    db.markDirty("users");
    return send(
      sock,
      m,
      res
        ? `*ROD UPGRADED!*\n\n${res}\n> 91; Aplausos > 93;${_ourinfischjs.formatMoney.call(void 0, cost)}_`
        : `*ROD EXP UP!*\n\n+${Math.floor(rod.expToNextLevel * 0.5)}EXP\n> 91; Aplausos > 93;${_ourinfischjs.formatMoney.call(void 0, cost)}_`,
      "Rod Upgrade!",
      rod.name,
    );
  }

  if (sub === "daily") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const now = new Date();
    if (f.lastDaily) {
      const diff = now.getTime() - new Date(f.lastDaily).getTime();
      if (diff < 86400000)
        return m.reply(
          `- ¡Hola Dairy 's ha sido tomada!${Math.ceil((86400000 - diff) / 3600000)}* hora._`,
        );
    }
    const ld = f.lastDaily ? new Date(f.lastDaily) : null;
    f.dailyStreak =
      ld && now.getTime() - ld.getTime() < 172800000
        ? (f.dailyStreak || 0) + 1
        : 1;
    let rw = _ourinfischdatajs.DAILY_REWARDS[0];
    for (const r of _ourinfischdatajs.DAILY_REWARDS) {
      if (f.dailyStreak >= r.streak) rw = r;
    }
    f.money = (f.money || 0) + rw.money;
    f.gachaTickets = (f.gachaTickets || 0) + rw.tickets;
    f.lastDaily = now.toISOString();
    db.markDirty("users");
    return send(
      sock,
      m,
      `*DAILY REWARD!*\n\n*Streak:* ${f.dailyStreak} hari\n+${_ourinfischjs.formatMoney.call(void 0, rw.money)}\n+${rw.tickets}Billete de Gacha\n* Saldo: *${_ourinfischjs.formatMoney.call(void 0, f.money)}`,
      "Daily Reward!",
      `Streak ${f.dailyStreak}`,
    );
  }

  if (sub === "gacha") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const useT = sa[0] && sa[0].toLowerCase() === "ticket";
    if (useT) {
      if ((f.gachaTickets || 0) < 1)
        return m.reply(`*Pasa de entradas!${f.gachaTickets || 0}_`);
      f.gachaTickets -= 1;
    } else {
      if ((f.money || 0) < _ourinfischdatajs.GACHA_COST_COINS)
        return m.reply(`Uma, Uma, Uma, Uma, Uma, Uma, Uma${_ourinfischjs.formatMoney.call(void 0, _ourinfischdatajs.GACHA_COST_COINS)}_`);
      f.money -= _ourinfischdatajs.GACHA_COST_COINS;
    }
    const result = _ourinfischjs.doGachaPull.call(void 0, f);
    const item = result.item;
    let txt = `*GACHA RESULT!*\n\n`;
    switch (item.type) {
      case "rod":
        if (_ourinfischdatajs.fishingRod[item.value] && !f.fishingRods[item.value]) {
          f.fishingRods[item.value] = { ..._ourinfischdatajs.fishingRod[item.value] };
          txt += `¿Pueden ROD?${item.label}*\n`;
        } else if (f.fishingRods[item.value]) {
          const ref = Math.floor(
            (_ourinfischdatajs.fishingRod[item.value] ? _ourinfischdatajs.fishingRod[item.value].price : 0) * 0.3 ||
              100000,
          );
          f.money = (f.money || 0) + ref;
          txt += `Duplikat: *${item.label}* _+${_ourinfischjs.formatMoney.call(void 0, ref)}_\n`;
        }
        break;
      case "tickets":
        f.gachaTickets = (f.gachaTickets || 0) + item.value;
        txt += `+${item.value} Tiket\n`;
        break;
      case "tokens":
        f.prestigeTokens = (f.prestigeTokens || 0) + item.value;
        txt += `+${item.value} Tokens\n`;
        break;
      case "coins":
        f.money = (f.money || 0) + item.value;
        txt += `+${_ourinfischjs.formatMoney.call(void 0, item.value)}\n`;
        break;
      case "enchant_scroll":
        {
          const avail = Object.entries(_ourinfischdatajs.rodEnchants).filter(
            ([, v]) => v.rarity === item.value,
          );
          if (avail.length > 0) {
            const [ek2, ed] = avail[Math.floor(Math.random() * avail.length)];
            const rk2 = f.usedFishingRod || "basicrod";
            if (f.fishingRods[rk2]) {
              f.fishingRods[rk2].enchant = ek2;
              txt += `Enchant: *${ed.name}* _(${item.value})_ ke rod!\n`;
            }
          }
        }
        break;
      case "xp_boost":
        f.exp = (f.exp || 0) + Math.floor(f.expToNextLevel * 0.5);
        txt += `XP Boost x${item.value}!\n`;
        break;
      default:
        txt += `${item.label}\n`;
    }
    if (result.isSSR) txt += `\n*SSR PULL!*`;
    if (result.pity) txt += `\n*Pity Activated!*`;
    txt += `\n\n_Pity: ${f.gachaPity}/${_ourinfischdatajs.GACHA_PITY_LIMIT}_\n_Saldo: ${_ourinfischjs.formatMoney.call(void 0, f.money)} | Tiket: ${f.gachaTickets}_`;
    db.markDirty("users");
    return send(sock, m, txt, "Gacha!", result.isSSR ? "SSR PULL!" : "Result");
  }
  if (sub === "upgrade") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const type = sa[0] ? sa[0].toLowerCase() : "";
    if (!type || !_ourinfischdatajs.UPGRADES[type]) {
      let txt = `*Mejora SHOP*\n\n`;
      for (const [k, u] of Object.entries(_ourinfischdatajs.UPGRADES)) {
        const lv = f[k + "Upgrade"] || 0;
        txt += `*${u.name}* _(Lv.${lv}/${u.maxLevel})_\n  _${u.desc}_\n  ${lv >= u.maxLevel ? "_MAXED_" : `_Next: ${_ourinfischjs.formatMoney.call(void 0, u.getCost(lv))}_`}\n\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.fisht mejora<luck/speed/sell>\``,
        "Upgrade Shop",
        "Tingkatkan stats",
      );
    }
    const upg = _ourinfischdatajs.UPGRADES[type];
    const lv = f[type + "Upgrade"] || 0;
    if (lv >= upg.maxLevel) return m.reply(`*Mi corazón está corriendo*x!`);
    const cost = upg.getCost(lv);
    if ((f.money || 0) < cost)
      return m.reply(`Uma, Uma, Uma, Uma, Uma, Uma, Uma${_ourinfischjs.formatMoney.call(void 0, cost)}_`);
    f.money -= cost;
    f[type + "Upgrade"] = lv + 1;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*${upg.name} LEVEL UP!*\n\n_Level ${lv + 1}¿Qué?\n> 91; Aplausos > 93;${_ourinfischjs.formatMoney.call(void 0, cost)}_\n_${upg.desc}_`,
      "Upgrade!",
      `${upg.name} Lv.${lv + 1}`,
    );
  }

  if (sub === "prestige") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    const cp = f.prestige || 0;
    if (sa[0] && sa[0].toLowerCase() === "confirm") {
      const reqs = [
        { fish: 500, money: 1e10 },
        { fish: 1500, money: 1e12 },
        { fish: 4000, money: 1e14 },
        { fish: 10000, money: 1e19 },
        { fish: 25000, money: 1e22 },
      ];
      const req = reqs[cp];
      if (!req) return m.reply(`*Mi corazón está corriendo*xprestigio!`);
      if ((f.fishCaught || 0) < req.fish)
        return m.reply(`_Ikan menos! Necesito ${req.fish}_`);
      if ((f.money || 0) < req.money)
        return m.reply(`Uma, Uma, Uma, Uma, Uma, Uma, Uma${_ourinfischjs.formatMoney.call(void 0, req.money)}_`);
      f.prestige = cp + 1;
      f.money = Math.floor(f.money * 0.1);
      f.fishCaught = 0;
      f.streak = 0;
      f.prestigeTokens =
        (f.prestigeTokens || 0) + [50, 150, 500, 1000, 5000][cp];
      const titles = [
        "Pemancing Baru",
        "Veteran",
        "Master Angler",
        "Legend",
        "Transcendent",
        "God of Fishing",
      ];
      if (cp === 0 && !f.fishingRods.prestigerod)
        f.fishingRods.prestigerod = { ..._ourinfischdatajs.fishingRod.prestigerod };
      if (cp === 2 && !f.fishingRods.cosmicrod)
        f.fishingRods.cosmicrod = { ..._ourinfischdatajs.fishingRod.cosmicrod };
      db.markDirty("users");
      return send(
        sock,
        m,
        `*PRESTIGE UP!*\n\n*Title:* ${titles[f.prestige]}\n*Tokens:* ${f.prestigeTokens}\n\n- 90 %, recuento de pescado reajuste_`,
        "PRESTIGE!",
        titles[f.prestige],
      );
    }
    let txt = `*PRESTIGE SYSTEM*\n\n*Prestige:* ${cp}\n*Tokens:* ${f.prestigeTokens || 0}\n\n`;
    const allReqs = [
      { lv: 1, fish: 500, money: 1e10, rw: "Prestige Rod + 50 tokens" },
      { lv: 2, fish: 1500, money: 1e12, rw: "Luck +20% + 150 tokens" },
      { lv: 3, fish: 4000, money: 1e14, rw: "Cosmic Rod + 500 tokens" },
      { lv: 4, fish: 10000, money: 1e19, rw: "2x EXP + 1000 tokens" },
      { lv: 5, fish: 25000, money: 1e22, rw: "Eternity Rod + 5000 tokens" },
    ];
    for (const r of allReqs)
      txt += `${cp >= r.lv ? "[OK]" : "[LOCK]"} *P${r.lv}*: _${r.fish} fish | ${_ourinfischjs.formatMoney.call(void 0, r.money)}_\n  _${r.rw}_\n\n`;
    return send(
      sock,
      m,
      txt + `\`. prestigio pescaguot confirm.\` _(hati-hati!)_`,
      "Prestige",
      `P${cp}`,
    );
  }

  if (sub === "tokens") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `* Nivel de fichas *\n\n* Tokens: *${f.prestigeTokens || 0}\n\n`;
      for (const item of _ourinfischdatajs.TOKEN_SHOP)
        txt += `*${item.name}* _${item.cost} tokens_\n`;
      return send(
        sock,
        m,
        txt + `\n\`.fisht tokens <id>\``,
        "Token Store",
        `${f.prestigeTokens || 0} tokens`,
      );
    }
    const iid = sa[0].toLowerCase();
    const item = _ourinfischdatajs.TOKEN_SHOP.find((i) => i.id === iid);
    if (!item) return m.reply(`¡Aquí no hay ningún artículo!\`. fichas de pesca.\``);
    if ((f.prestigeTokens || 0) < item.cost)
      return m.reply(`_Tokens menos! Necesito ${item.cost}_`);
    f.prestigeTokens -= item.cost;
    switch (item.type) {
      case "rod":
        if (_ourinfischdatajs.fishingRod[item.value] && !f.fishingRods[item.value]) {
          f.fishingRods[item.value] = { ..._ourinfischdatajs.fishingRod[item.value] };
        } else {
          f.prestigeTokens += item.cost;
          return m.reply(`- Sí, sí, sí, sí, sí, sí.`);
        }
        break;
      case "tickets":
        f.gachaTickets = (f.gachaTickets || 0) + item.value;
        break;
      case "coins":
        f.money = (f.money || 0) + item.value;
        break;
    }
    db.markDirty("users");
    return send(
      sock,
      m,
      `*Objeto Comprado!*\n\n*${item.name}* _seharga ${item.cost} tokens_`,
      "Token Store!",
      item.name,
    );
  }

  if (sub === "jackpot") {
    const user = _ourinfischjs.getOrCreateFischUser.call(void 0, db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `(SINGING 91 ) SISTEMA DE JACKPOT\n\nEl tiempo que tuvo un gran regalo\nSocio socio de Socios de Socios de Puede ser Premium\n\n`;
      for (const pool of _ourinfischjs.JACKPOT_POOLS) {
        txt += `*${pool.name}*\n> 91; Aplausos > 93;${_ourinfischjs.formatMoney.call(void 0, pool.cost)}_\n  _Rate: ${pool.weight}%_\n  _Rewards:_\n`;
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
            }[rw.type] || rw.type;
          txt += `    _${label}: ${rw.min === rw.max ? rw.min : `${rw.min}-${rw.max}`} (${rw.weight}%)_\n`;
        }
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.fisht jackpot <mini/mega/ultra/legend>\``,
        "Jackpot!",
        "Hadiah Besar",
      );
    }
    const poolId = sa[0].toLowerCase();
    const pool = _ourinfischjs.JACKPOT_POOLS.find((p) => p.id === poolId);
    if (!pool) return m.reply(`¡No estoy en la casa de Tier!\`. bote de pescado.\``);
    if ((f.money || 0) < pool.cost)
      return m.reply(`Uma, Uma, Uma, Uma, Uma, Uma, Uma${_ourinfischjs.formatMoney.call(void 0, pool.cost)}_`);
    f.money -= pool.cost;
    const result = _ourinfischjs.doJackpotPull.call(void 0, f, poolId);
    if (!result) return m.reply(`_Gagal! Intentalo de nuevo._`);
    const applied = _ourinfischjs.applyJackpotReward.call(void 0, db, f, m.sender, result);
    db.markDirty("users");
    let txt = `*${pool.name.toUpperCase()}!*\n\n`;
    const isBig = [
      "premium_7d",
      "premium_30d",
      "partner_7d",
      "partner_30d",
      "unlimited_energi",
      "unlimited_limit",
    ].includes(result.reward.type);
    if (isBig) txt += `*JACKPOT Grande!*\n\n`;
    txt += `${applied.desc}\n\n> 91; Aplausos > 93;${_ourinfischjs.formatMoney.call(void 0, pool.cost)}_\n_Saldo: ${_ourinfischjs.formatMoney.call(void 0, f.money)}_`;
    return send(
      sock,
      m,
      txt,
      isBig ? "JACKPOT BESAR!" : pool.name,
      applied.desc,
    );
  }

  if (sub === "top") {
    const users = db.db.data.users || {};
    const rankings = [];
    for (const [jid, ud] of Object.entries(users)) {
      if (ud.fisch)
        rankings.push({
          jid,
          fishCaught: ud.fisch.fishCaught || 0,
          money: ud.fisch.money || 0,
          level: ud.fisch.level || 1,
          prestige: ud.fisch.prestige || 0,
        });
    }
    if (rankings.length === 0) return m.reply(`¡Para ver a los jugadores!`);
    rankings.sort((a, b) => {
      if (b.prestige !== a.prestige) return b.prestige - a.prestige;
      if (b.fishCaught !== a.fishCaught) return b.fishCaught - a.fishCaught;
      return b.money - a.money;
    });
    let txt = `*LEADERBOARD FISCHIT*\n\n`;
    const top = rankings.slice(0, 10);
    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      const medal =
        i === 0 ? "1." : i === 1 ? "2." : i === 2 ? "3." : `${i + 1}.`;
      txt += `${medal} @${p.jid}\n  _P${p.prestige} | ${p.fishCaught} fish | ${_ourinfischjs.formatMoney.call(void 0, p.money)}_\n`;
    }
    return send(sock, m, txt.trim(), "Leaderboard", "Top Pemain");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
