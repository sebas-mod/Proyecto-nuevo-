"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourin = require('ourin');

const pluginConfig = {
  name: ["gachawaifu", "waifuaction", "tinggalinwaifu", "waifuku", "istriku"],
  alias: ["gachaistri"],
  category: "fun",
  description: "Gacha waifu su sueño, así que sus sentimientos, y así es su compañero!",
  usage: ".gachawaifu | .waifuku | .tinggalinwaifu",
  example: ".gachawaifu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 2,
  isEnabled: true,
};

//¡Esto es tan emocionante!

const waifuPool = [
  // Common (50% weight)
  { name: "Sakura Haruno", age: 16, height: "161 cm", weight: "45 kg", tier: "Common", keyword: "Sakura Haruno aesthetic icon", weightChance: 50 },
  { name: "Hinata Hyuga", age: 16, height: "160 cm", weight: "45 kg", tier: "Common", keyword: "Hinata Hyuga aesthetic anime", weightChance: 50 },
  { name: "Asuna Yuuki", age: 17, height: "168 cm", weight: "55 kg", tier: "Common", keyword: "Asuna Yuuki icon", weightChance: 50 },
  { name: "Ochako Uraraka", age: 15, height: "156 cm", weight: "43 kg", tier: "Common", keyword: "Ochako Uraraka aesthetic", weightChance: 50 },
  { name: "Nobara Kugisaki", age: 16, height: "160 cm", weight: "45 kg", tier: "Common", keyword: "Nobara Kugisaki anime icon", weightChance: 50 },
  { name: "Nami", age: 20, height: "170 cm", weight: "50 kg", tier: "Common", keyword: "Nami one piece aesthetic", weightChance: 50 },
  { name: "Nico Robin", age: 30, height: "188 cm", weight: "60 kg", tier: "Common", keyword: "Nico Robin aesthetic", weightChance: 50 },
  { name: "Rukia Kuchiki", age: 15, height: "144 cm", weight: "33 kg", tier: "Common", keyword: "Rukia Kuchiki icon", weightChance: 50 },
  { name: "Chizuru Mizuhara", age: 20, height: "162 cm", weight: "48 kg", tier: "Common", keyword: "Chizuru Mizuhara aesthetic", weightChance: 50 },
  { name: "Ruka Sarashina", age: 18, height: "153 cm", weight: "43 kg", tier: "Common", keyword: "Ruka Sarashina icon", weightChance: 50 },
  { name: "Lucy Heartfilia", age: 17, height: "165 cm", weight: "47 kg", tier: "Common", keyword: "Lucy Heartfilia aesthetic icon", weightChance: 50 },
  { name: "Erza Scarlet", age: 19, height: "169 cm", weight: "50 kg", tier: "Common", keyword: "Erza Scarlet aesthetic icon", weightChance: 50 },

  // Rare (30% weight)
  { name: "Miku Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Miku Nakano aesthetic icon", weightChance: 30 },
  { name: "Nino Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Nino Nakano aesthetic icon", weightChance: 30 },
  { name: "Yotsuba Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Yotsuba Nakano icon", weightChance: 30 },
  { name: "Itsuki Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Itsuki Nakano icon", weightChance: 30 },
  { name: "Ichika Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Ichika Nakano icon", weightChance: 30 },
  { name: "Rem", age: 17, height: "154 cm", weight: "45 kg", tier: "Rare", keyword: "Rem ReZero aesthetic", weightChance: 30 },
  { name: "Ram", age: 17, height: "154 cm", weight: "45 kg", tier: "Rare", keyword: "Ram ReZero aesthetic", weightChance: 30 },
  { name: "Shinobu Kocho", age: 18, height: "151 cm", weight: "37 kg", tier: "Rare", keyword: "Shinobu Kocho aesthetic", weightChance: 30 },
  { name: "Mitsuri Kanroji", age: 19, height: "167 cm", weight: "56 kg", tier: "Rare", keyword: "Mitsuri Kanroji aesthetic", weightChance: 30 },
  { name: "Nezuko Kamado", age: 14, height: "153 cm", weight: "45 kg", tier: "Rare", keyword: "Nezuko Kamado aesthetic", weightChance: 30 },
  { name: "Kaguya Shinomiya", age: 17, height: "158 cm", weight: "46 kg", tier: "Rare", keyword: "Kaguya Shinomiya aesthetic", weightChance: 30 },

  // Epic (15% weight)
  { name: "Elaina", age: 18, height: "155 cm", weight: "45 kg", tier: "Epic", keyword: "Elaina wandering witch aesthetic icon", weightChance: 15 },
  { name: "Yor Forger", age: 27, height: "170 cm", weight: "55 kg", tier: "Epic", keyword: "Yor Forger aesthetic icon", weightChance: 15 },
  { name: "Makima", age: 24, height: "173 cm", weight: "58 kg", tier: "Epic", keyword: "Makima aesthetic icon", weightChance: 15 },
  { name: "Power", age: 17, height: "170 cm", weight: "52 kg", tier: "Epic", keyword: "Power chainsaw man aesthetic", weightChance: 15 },
  { name: "Aqua", age: 17, height: "158 cm", weight: "47 kg", tier: "Epic", keyword: "Aqua konosuba aesthetic", weightChance: 15 },
  { name: "Hu Tao", age: 18, height: "155 cm", weight: "46 kg", tier: "Epic", keyword: "Hu Tao aesthetic icon", weightChance: 15 },
  { name: "Raiden Shogun", age: 500, height: "170 cm", weight: "55 kg", tier: "Epic", keyword: "Raiden Shogun aesthetic icon", weightChance: 15 },
  { name: "Furina", age: 500, height: "155 cm", weight: "45 kg", tier: "Epic", keyword: "Furina aesthetic icon", weightChance: 15 },
  { name: "Ganyu", age: 3000, height: "158 cm", weight: "48 kg", tier: "Epic", keyword: "Ganyu aesthetic icon", weightChance: 15 },
  { name: "Kafka", age: 25, height: "170 cm", weight: "55 kg", tier: "Epic", keyword: "Kafka honkai star rail aesthetic", weightChance: 15 },
  { name: "Firefly", age: 20, height: "158 cm", weight: "47 kg", tier: "Epic", keyword: "Firefly honkai star rail aesthetic", weightChance: 15 },

  // Legendary (5% weight)
  { name: "Zero Two", age: 16, height: "170 cm", weight: "55 kg", tier: "Legendary", keyword: "Zero Two aesthetic icon", weightChance: 5 },
  { name: "Kurumi Tokisaki", age: 17, height: "157 cm", weight: "46 kg", tier: "Legendary", keyword: "Kurumi Tokisaki aesthetic", weightChance: 5 },
  { name: "Saber (Artoria)", age: 24, height: "154 cm", weight: "42 kg", tier: "Legendary", keyword: "Saber Artoria Pendragon icon", weightChance: 5 },
  { name: "Frieren", age: 1000, height: "152 cm", weight: "40 kg", tier: "Legendary", keyword: "Frieren aesthetic icon", weightChance: 5 },
  { name: "Hoshino Ai", age: 20, height: "151 cm", weight: "42 kg", tier: "Legendary", keyword: "Hoshino Ai aesthetic icon", weightChance: 5 },
  { name: "Eula", age: 22, height: "172 cm", weight: "53 kg", tier: "Legendary", keyword: "Eula aesthetic icon", weightChance: 5 },
  { name: "Rias Gremory", age: 18, height: "172 cm", weight: "58 kg", tier: "Legendary", keyword: "Rias Gremory aesthetic icon", weightChance: 5 },
  { name: "Akeno Himejima", age: 18, height: "168 cm", weight: "54 kg", tier: "Legendary", keyword: "Akeno Himejima aesthetic icon", weightChance: 5 },
  { name: "Esdeath", age: 20, height: "170 cm", weight: "56 kg", tier: "Legendary", keyword: "Esdeath aesthetic icon", weightChance: 5 },
];

async function getWaifuImage(keyword) {
  try {
    const res = await _axios2.default.get(`https://api.cuki.biz.id/api/search/pinterest?apikey=cuki-x&query=${encodeURIComponent(keyword)}&type=image`);
    const results = _optionalChain([res, 'access', _ => _.data, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.results]);
    if (results && results.length > 0) {
      const validImages = results.filter((item) => item.image_url);
      if (validImages.length > 0) {
        const limit = Math.min(15, validImages.length);
        return validImages[Math.floor(Math.random() * limit)].image_url;
      }
    }
  } catch (e) {
    console.error("[GachaWaifu] Pinterest API error:", e.message);
  }
  return "https://i.pinimg.com/736x/8f/3e/2a/8f3e2a77ec65cdbcfad4ff3bc17e825f.jpg";
}

async function getBuffer(url) {
  try {
    const res = await _axios2.default.get(url, { responseType: "arraybuffer", timeout: 15000 });
    return Buffer.from(res.data);
  } catch (e2) {
    return null;
  }
}

function rollWaifu() {
  const totalWeight = waifuPool.reduce((acc, w) => acc + w.weightChance, 0);
  let random = Math.random() * totalWeight;
  for (const waifu of waifuPool) {
    random -= waifu.weightChance;
    if (random <= 0) return waifu;
  }
  return waifuPool[waifuPool.length - 1];
}

async function sendWaifuMessage(m, sock, waifu, textContent, customButtons = null) {
  let imgBuffer = null;
  if (waifu.imageUrl) {
    imgBuffer = await getBuffer(waifu.imageUrl);
  }
  if (!imgBuffer) {
    const newUrl = await getWaifuImage(waifu.keyword);
    waifu.imageUrl = newUrl;
    imgBuffer = await getBuffer(newUrl) || Buffer.alloc(0);
  }

  const media = await _ourin.prepareWAMessageMedia.call(void 0, 
    { image: imgBuffer },
    { upload: sock.waUploadToServer }
  );

  let buttons = customButtons;
  if (!buttons) {
    if (waifu.affection < 80) {
      buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚶‍♂️ Jalan-jalan", id: `${m.prefix}waifuaction jalanjalan` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☕ Ke Kafe", id: `${m.prefix}waifuaction kafe` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎬 Nonton Bioskop", id: `${m.prefix}waifuaction bioskop` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛍️ Belanja", id: `${m.prefix}waifuaction belanja` }) },
      ];
    } else if (waifu.affection < 100) {
      buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🫂 Peluk", id: `${m.prefix}waifuaction peluk` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💋 Cium", id: `${m.prefix}waifuaction cium` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛏️ Tidur Bareng", id: `${m.prefix}waifuaction tidur` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛁 Mandi Bareng", id: `${m.prefix}waifuaction mandi` }) },
      ];
    } else {
      if (!waifu.married) {
        buttons = [
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💍 Nikahi Dia", id: `${m.prefix}waifuaction nikah` }) },
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💝 Minta Hadiah", id: `${m.prefix}waifuaction hadiah` }) },
        ];
      } else {
        buttons = [
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👨‍👩‍👦 Bermesraan", id: `${m.prefix}waifuaction mesra` }) },
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💌 Rayu Istrimu", id: `${m.prefix}waifuaction rayu` }) },
        ];
      }
    }
  }

  let footerText = "❤️ Jaga terus perasaannya ya!";
  if (customButtons) footerText = "💭Espera su respuesta.";
  else if (waifu.married) footerText = "❤¡Te casaste con ella!";

  const msg = _ourin.generateWAMessageFromContent.call(void 0, m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
        },
        interactiveMessage: {
          body: { text: textContent },
          footer: { text: footerText },
          header: {
            title: `🌟 *${waifu.tier.toUpperCase()} TIER WAIFU* 🌟`,
            subtitle: waifu.name,
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          },
          nativeFlowMessage: { buttons }
        }
      }
    }
  }, { quoted: m });

  await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  if (!user) return;

  const cmd = m.command.toLowerCase();
  if (cmd === "waifuku" || cmd === "istriku") {
    if (!user.waifu) {
      return m.reply(`⚠️ *¡Todavía no tienes un waifu!*\nEscribe *${m.prefix}gachawaifu* para empezar.`);
    }
    m.react("🕕");
    const waifu = user.waifu;
    let statusPernikahan = waifu.married ? "Telah Menikah 💍" : "Pendekatan 💖";
    const textContent = `📸* SU ESTADO DE WAIFU *📸\n\n` +
      `💖*Nombre Lengkap:*${waifu.name}\n` +
      `🎂*Edad:*${waifu.age} tahun\n` +
      `💎 *Tier:* ${waifu.tier}\n` +
      `💞 *Affection:* ${waifu.affection}/100\n` +
      `💍 *Status:* ${statusPernikahan}\n\n` +
      `Continuar las interacciones eligiendo una de las acciones @-@ weenie en este swab!`;

    m.react("✅");
    return await sendWaifuMessage(m, sock, waifu, textContent, null);
  }
  if (cmd === "tinggalinwaifu") {
    if (!user.waifu) {
      return m.reply(`⚠¡Ni siquiera tienes un waifu!`);
    }

    const waifuName = user.waifu.name;
    const waifuJid = 'waifu_' + waifuName.replace(/\s+/g, '') + '@s.whatsapp.net';
    if (user.waifu.married) {
      if (user.fun && user.fun.pasangan === waifuJid) {
        user.fun.pasangan = "";
      }
      db.setUser(waifuJid, { fun: { pasangan: "" } });
    }

    delete user.waifu;
    db.setUser(m.sender, user);

    m.react("💔");
    return m.reply(
      `💔*Descubriste irte*${waifuName.toUpperCase()}!*\n\n` +
      `Has empaquetado tus cosas y le dijiste que está relación había terminado.` +
      `Él gritó y le rogó que se quedara, pero su corazón me cortó.\n\n` +
      `Está oficialmente separado.`
    );
  }
  if (cmd === "gachawaifu" || cmd === "gachaistri") {
    if (user.waifu) {
      m.react("😡");
      let pesanStatus = user.waifu.married ? "¡Ella ya es tu esposa!" : "¡Ella te ama mucho!";
      return m.reply(
        `⚠- * ¡Ya tienes un waifu!\n\n` +
        `Nombre: *${user.waifu.name}*\n` +
        `Tier: *${user.waifu.tier}*\n` +
        `Affection: *${user.waifu.affection}/100*\n\n` +
        `¡No seas avaricioso! Cuida al waifu que ya tienes. ${pesanStatus} Escribe *${m.prefix}waifuku* para interactuar con ella.`
      );
    }

    const sub = (m.args[0] || "").toLowerCase();

    if (sub !== "start") {
      const panduan = `💕 SISTEMA GACHA WAIFU 💕\n\n` +
        `Las simulaciones interactivas de la cancana virtual consiguen waifu de tus sueños, cerca de su hatini, y se casan con él!\n\n` +
        `*Uso Comando:*\n` +
        `• *${m.prefix}gachawaifu* — Abre este menú de guía\n` +
        `• *${m.prefix}waifuku* — Abre el panel de interacción con tu waifu\n` +
        `• *${m.prefix}tinggalinwaifu* — Abandona a tu waifu y reinicia su estado\n\n` +
        `✨ HISTORIA COMPLETA:\n` +
        `1. Consigue tu primer waifu.\n` +
        `2. Atraviesa las 3 fases del amor\n` +
        `3. Interactúa, cuida y sube su afecto.\n` +
        `4. Cásate con tu waifu y forma una familia.\n` +
        `5. ¡Disfruta del viaje!`;

      const msg = _ourin.generateWAMessageFromContent.call(void 0, m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: { text: panduan },
              footer: { text: "¡El botón cae en la olla para iniciar la búsqueda de tu alma gemela!" },
              nativeFlowMessage: {
                buttons: [
                  { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎲¡Starai Gacha ahora!", id: `${m.prefix}gachawaifu start` }) }
                ]
              }
            }
          }
        }
      }, { quoted: m });
      return await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    m.react("🕕");
    try {
      const waifuData = rollWaifu();
      const waifu = {
        ...waifuData,
        affection: 50,
        married: false,
        imageUrl: await getWaifuImage(waifuData.keyword)
      };

      user.waifu = waifu;
      db.setUser(m.sender, user);

      const textContent = `🎉Felicitaciones, ¡tienes nuevo paseo!🎉\n\n` +
        `💖*Nombre Lengkap:*${waifu.name}\n` +
        `🎂*Edad:*${waifu.age} tahun\n` +
        `📏*Alto Badan:*${waifu.height}\n` +
        `⚖Pesado Badan:${waifu.weight}\n` +
        `💎 *Tier:* ${waifu.tier}\n` +
        `💞 *Affection:* ${waifu.affection}/100\n\n` +
        `Por favor seleccione interacciones en está cáscara para cantar el PDKT y levantar los puntos cintanya.`;

      m.react("✅");
      await sendWaifuMessage(m, sock, waifu, textContent, null);
    } catch (err) {
      console.error(err);
      m.react("☢");
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
    return;
  }
  if (cmd === "waifuaction") {
    if (!user.waifu) {
      m.react("❌");
      return m.reply(`¡Todavía no tienes un waifu! Escribe *${m.prefix}gachawaifu* para conseguir tu primer waifu.`);
    }

    const action = (m.args[0] || "").toLowerCase();
    let waifu = user.waifu;
    let responseText = "";
    let affectionChange = 0;
    if (action === "jalanjalan") {
      return sendWaifuMessage(m, sock, waifu, `Estás preguntando${waifu.name}¿Quieres salir contigo hoy?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🌳 Ke Taman", id: `${m.prefix}waifuaction kencan_taman` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🏢 Ke Mall", id: `${m.prefix}waifuaction kencan_mall` }) }
      ]);
    }
    if (action === "kafe") {
      return sendWaifuMessage(m, sock, waifu, `Ayaal café que está golpeando la ciudad.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☕ Kopi Pahit", id: `${m.prefix}waifuaction kencan_kopi` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🍵 Matcha Latte", id: `${m.prefix}waifuaction kencan_matcha` }) }
      ]);
    }
    if (action === "bioskop") {
      return sendWaifuMessage(m, sock, waifu, `Usted está de pie delante del vestuario del bioscopio.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💞 Romantis", id: `${m.prefix}waifuaction kencan_romantis` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👻 Horor", id: `${m.prefix}waifuaction kencan_horor` }) }
      ]);
    }
    if (action === "belanja") {
      return sendWaifuMessage(m, sock, waifu, `Ustedes están vagando por el centro de un centro comercial de élite.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👗 Baju Lucu", id: `${m.prefix}waifuaction kencan_baju` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💎 Perhiasan", id: `${m.prefix}waifuaction kencan_perhiasan` }) }
      ]);
    }
    const rejectIntimate = async () => {
      waifu.affection -= (Math.floor(Math.random() * 30) + 30);
      if (waifu.affection < 0) waifu.affection = 0;
      let outText = `💢Intentas limpiar el fume hasta${waifu.name}*, pero él siente que no has estado tan cerca, que te está abofeteando con un duro y te regaña!`;
      await processAffection(outText, waifu.affection);
    };

    if (["peluk", "cium", "tidur", "mandi"].includes(action) && waifu.affection < 80) {
      return await rejectIntimate();
    }

    if (action === "peluk") {
      return sendWaifuMessage(m, sock, waifu, `Estás mirando *${waifu.name}¿Cómo te sientes con eso?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🤗De Belakang", id: `${m.prefix}waifuaction intim_belakang` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💑 Berhadapan", id: `${m.prefix}waifuaction intim_depan` }) }
      ]);
    }
    if (action === "cium") {
      return sendWaifuMessage(m, sock, waifu, `Cara ustedes amora muy untaut, su aliento se siente en su cara.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "😚 Kening", id: `${m.prefix}waifuaction intim_kening` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💋 Bibir", id: `${m.prefix}waifuaction intim_bibir` }) }
      ]);
    }
    if (action === "tidur") {
      return sendWaifuMessage(m, sock, waifu, `Estás tumbado en una cama que ha acolchado.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🫂 Peluk Pulas", id: `${m.prefix}waifuaction intim_kelon` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🔥 Pemanasan", id: `${m.prefix}waifuaction intim_panas` }) }
      ]);
    }
    if (action === "mandi") {
      return sendWaifuMessage(m, sock, waifu, `*${waifu.name}* ¿Vienes ahí, quieres frotar algunos agujeros en el fondo?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛁 Punggung", id: `${m.prefix}waifuaction intim_punggung` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🧼 Bahu Depan", id: `${m.prefix}waifuaction intim_bahu` }) }
      ]);
    }
    if (action === "kencan_taman") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🌳* El aspecto sin costura es tan fuerte. *${waifu.name}* Tanto para la vista y él esmiró al borde y tomó sus brazos!`;
    }
    else if (action === "kencan_mall") {
      affectionChange = Math.floor(Math.random() * 5) + 5;
      responseText = `🏢Usted está dando vueltas, viendo cosas, pero tiene mucho respeto por su tiempo.`;
    }
    else if (action === "kencan_kopi") {
      affectionChange = -(Math.floor(Math.random() * 10) + 5);
      responseText = `☕ Ups, *${waifu.name}Su cuello está ganando mientras lo bebe.`;
    }
    else if (action === "kencan_matcha") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `🍵 *${waifu.name}Estaba muy feliz y seguía sonriendo a ti.`;
    }
    else if (action === "kencan_romantis") {
      affectionChange = Math.floor(Math.random() * 15) + 5;
      responseText = `💞Mirando peelículas mañanas hace que sus corazones se derriten, todo el camino a través de la película, él silente afinaba su cabeza en su lingsillo.`;
    }
    else if (action === "kencan_horor") {
      affectionChange = Math.floor(Math.random() * 10) + 15;
      responseText = `👻Por miedo,${waifu.name}¡Te estás acercando!`;
    }
    else if (action === "kencan_baju") {
      affectionChange = Math.floor(Math.random() * 15) + 5;
      responseText = `👗Le compraste un vestido muy bonito, ella era muy delgada, con su ropa y aplaudarlas en usted con una mejilla merona!`;
    }
    else if (action === "kencan_perhiasan") {
      affectionChange = Math.floor(Math.random() * 20) + 10;
      responseText = `💎¡Le compraste su joyero!`;
    }
    else if (action === "intim_belakang") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🤗You 're hard @-@ pressed from behind. *${waifu.name}* Un poco sorprendido, pero se sentía seguro y cómodo estando a tu alrededor.`;
    }
    else if (action === "intim_depan") {
      affectionChange = Math.floor(Math.random() * 15) + 5;
      responseText = `💑Usted está tirando de la cintura con un @-@ en duro y usted está mirando al amor @-@ vendedor amoroso.`;
    }
    else if (action === "intim_kening") {
      affectionChange = Math.floor(Math.random() * 10) + 5;
      responseText = `😚Usted ronca su frente con mucha suavidad, es un beso puro y le hace sentir muy bien @-@ le gustó.`;
    }
    else if (action === "intim_bibir") {
      affectionChange = Math.floor(Math.random() * 15) + 15;
      responseText = `💋Te derrites con suave y lleno de gloria, y te da de vuelta tu beso con un poco de rugido, y la noche es larga.`;
    }
    else if (action === "intim_kelon") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🫂Acabas de bajarlo y dejarlo y se quedó dormido en una isla, una sonrisa pacífica pintada en su cara bonita.`;
    }
    else if (action === "intim_panas") {
      affectionChange = Math.floor(Math.random() * 20) + 15;
      responseText = `🔥You 're sing soft @-@ bobbing, besos her mouth, and making her face red, she 's susuring, " Hold her tonight. "`;
    }
    else if (action === "intim_punggung") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🛁You 're gaping at her soft @-@ mouthed lips, she 's sounding soft because she 's feeling relaxed after a long day.`;
    }
    else if (action === "intim_bahu") {
      affectionChange = Math.floor(Math.random() * 15) + 15;
      responseText = `🧼Usted está frotando sus hombros y su área sensible. *${waifu.name}* Empieza lento, sintiéndote tímido pero disfrutado de tu toque en agua tibia.`;
    }
    else if (action === "nikah") {
      if (waifu.affection < 100) return m.reply(`⚠¡No se apresure a proponer!`);
      if (waifu.married) return m.reply(`⚠¡Estás casado!`);

      waifu.married = true;
      user.limit = (user.limit || 0) + 5000;
      user.koin = (user.koin || 0) + 100000;

      if (!user.fun) user.fun = {};
      const waifuJid = 'waifu_' + waifu.name.replace(/\s+/g, '') + '@s.whatsapp.net';
      user.fun.pasangan = waifuJid;
      db.setUser(waifuJid, { fun: { pasangan: m.sender }, name: waifu.name });

      responseText = `💍* You 're Oficial TO LIVE with${waifu.name.toUpperCase()}*💍\n\nSiéntese en las estrellas y déles un anillo de diamante, grita y dice que sí, ¡quiero ser tuyo para siempre!\n\nComo regalo de boda, usted consigue:\n-⚡5000 Límite/Energía\n-💰100, 000 Saldo / Kain\n\nSus giras están en la función.\`Mira al novio.\`¡El par oficial con él!`;
      affectionChange = 0;
    }
    else if (action === "hadiah") {
      if (waifu.affection < 100) return m.reply(`⚠¡No te ha amado lo suficiente para darte un regalo!`);
      affectionChange = 0;
      user.limit = (user.limit || 0) + 500;
      responseText = `💝 *${waifu.name}* Con una sonrisa feliz te trae un pequeño amor agradable!\nTu obteniendo⚡500 Límite/Energía!`;
    }
    else if (["mesra", "rayu"].includes(action)) {
      if (!waifu.married) return m.reply(`¡Este truco es para marido y mujer!`);
      affectionChange = 0;
      responseText = `👨‍👩‍👦Ustedes dos disfrutan de los días dulce pacíficos como pareja casada, su amor por ustedes durará para siempre!`;
    }
    else {
      m.react("❓");
      return m.reply(`" Unplayed action. " Please use interaction on a Waifu putool.`);
    }

    async function processAffection(customResponseText, currentAffectionVal) {
      let finalResponseText = customResponseText || responseText;
      waifu.affection += affectionChange;
      if (waifu.affection > 100) waifu.affection = 100;
      if (waifu.affection < 0) waifu.affection = 0;

      let sign = affectionChange > 0 ? "+" : "";
      let affectionText = `💞 *Affection berubah:* ${sign}${affectionChange} (Total: ${waifu.affection}/100)`;
      if (waifu.affection === 100) affectionText = `💞 *Affection MAKSIMAL! (100/100)*`;
      if (affectionChange === 0) affectionText = `💞 *Affection:* ${waifu.affection}/100`;

      if (waifu.affection <= 0) {
        const leavingText = `💔 *${waifu.name.toUpperCase()}" ¡Perdiste tu vida! "💔\n\n${finalResponseText}\n\n${affectionText}\n\n¡Porque su amor por ti se ha ido y perdido su waifu!\n*(Escribe${m.prefix}gachawaifu para reiniciar`;

        if (waifu.married) {
          const waifuJid = 'waifu_' + waifu.name.replace(/\s+/g, '') + '@s.whatsapp.net';
          if (user.fun && user.fun.pasangan === waifuJid) user.fun.pasangan = "";
          db.setUser(waifuJid, { fun: { pasangan: "" } });
        }

        delete user.waifu;
        db.setUser(m.sender, user);

        m.react("💔");
        return m.reply(leavingText);
      }

      user.waifu = waifu;
      db.setUser(m.sender, user);

      const updatedText = `${finalResponseText}\n\n${affectionText}`;
      m.react(waifu.affection === 100 ? "💍" : "✨");
      await sendWaifuMessage(m, sock, waifu, updatedText, null);
    }

    await processAffection();
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
