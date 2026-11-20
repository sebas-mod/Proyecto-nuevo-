"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almiku = require('almiku');

const pluginConfig = {
  name: ["gachahusbu", "husbuaction", "tinggalinhusbu", "husbuku", "suamiku"],
  alias: ["gachasuami"],
  category: "fun",
  description: "Gacha husbando de tus sueños: conquista su corazón y cásate con él.",
  usage: ".gachahusbu | .husbuku | .tinggalinhusbu",
  example: ".gachahusbu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 2,
  isEnabled: true,
};

const husbuPool = [
  // Common (50% weight)
  { name: "Yuji Itadori", age: 16, height: "173 cm", weight: "80 kg", tier: "Common", keyword: "Yuji Itadori aesthetic icon", weightChance: 50 },
  { name: "Denji", age: 17, height: "173 cm", weight: "65 kg", tier: "Common", keyword: "Denji aesthetic icon", weightChance: 50 },
  { name: "Loid Forger", age: 28, height: "187 cm", weight: "75 kg", tier: "Common", keyword: "Loid Forger aesthetic", weightChance: 50 },
  { name: "Tanjiro Kamado", age: 15, height: "165 cm", weight: "61 kg", tier: "Common", keyword: "Tanjiro Kamado icon", weightChance: 50 },
  { name: "Zenitsu Agatsuma", age: 16, height: "164.5 cm", weight: "58 kg", tier: "Common", keyword: "Zenitsu Agatsuma aesthetic", weightChance: 50 },
  { name: "Izuku Midoriya", age: 16, height: "166 cm", weight: "60 kg", tier: "Common", keyword: "Izuku Midoriya anime icon", weightChance: 50 },
  { name: "Katsuki Bakugo", age: 16, height: "172 cm", weight: "63 kg", tier: "Common", keyword: "Katsuki Bakugo aesthetic", weightChance: 50 },
  { name: "Tobio Kageyama", age: 16, height: "181 cm", weight: "66 kg", tier: "Common", keyword: "Tobio Kageyama icon", weightChance: 50 },
  { name: "Asta", age: 16, height: "155 cm", weight: "55 kg", tier: "Common", keyword: "Asta Black Clover aesthetic", weightChance: 50 },
  { name: "Toge Inumaki", age: 17, height: "164 cm", weight: "58 kg", tier: "Common", keyword: "Toge Inumaki aesthetic icon", weightChance: 50 },

  // Rare (30% weight)
  { name: "Megumi Fushiguro", age: 15, height: "175 cm", weight: "60 kg", tier: "Rare", keyword: "Megumi Fushiguro aesthetic icon", weightChance: 30 },
  { name: "Shoto Todoroki", age: 16, height: "176 cm", weight: "62 kg", tier: "Rare", keyword: "Shoto Todoroki aesthetic", weightChance: 30 },
  { name: "Giyuu Tomioka", age: 21, height: "176 cm", weight: "69 kg", tier: "Rare", keyword: "Giyuu Tomioka aesthetic icon", weightChance: 30 },
  { name: "Sanji", age: 21, height: "180 cm", weight: "66 kg", tier: "Rare", keyword: "Sanji one piece aesthetic", weightChance: 30 },
  { name: "Roronoa Zoro", age: 21, height: "181 cm", weight: "71 kg", tier: "Rare", keyword: "Roronoa Zoro aesthetic", weightChance: 30 },
  { name: "Diluc", age: 22, height: "185 cm", weight: "72 kg", tier: "Rare", keyword: "Diluc aesthetic icon", weightChance: 30 },
  { name: "Kamisato Ayato", age: 24, height: "188 cm", weight: "75 kg", tier: "Rare", keyword: "Kamisato Ayato aesthetic icon", weightChance: 30 },
  { name: "Tenguzui Uzui", age: 23, height: "198 cm", weight: "95 kg", tier: "Rare", keyword: "Tengen Uzui aesthetic", weightChance: 30 },
  { name: "Kyojuro Rengoku", age: 20, height: "177 cm", weight: "72 kg", tier: "Rare", keyword: "Kyojuro Rengoku aesthetic", weightChance: 30 },

  // Epic (15% weight)
  { name: "Levi Ackerman", age: 30, height: "160 cm", weight: "65 kg", tier: "Epic", keyword: "Levi Ackerman aesthetic icon", weightChance: 15 },
  { name: "Itachi Uchiha", age: 21, height: "178 cm", weight: "58 kg", tier: "Epic", keyword: "Itachi Uchiha aesthetic icon", weightChance: 15 },
  { name: "Kakashi Hatake", age: 30, height: "181 cm", weight: "67 kg", tier: "Epic", keyword: "Kakashi Hatake aesthetic", weightChance: 15 },
  { name: "Zhongli", age: 6000, height: "190 cm", weight: "80 kg", tier: "Epic", keyword: "Zhongli aesthetic icon", weightChance: 15 },
  { name: "Tartaglia (Childe)", age: 21, height: "185 cm", weight: "74 kg", tier: "Epic", keyword: "Tartaglia Genshin aesthetic", weightChance: 15 },
  { name: "Neuvillette", age: 500, height: "188 cm", weight: "75 kg", tier: "Epic", keyword: "Neuvillette aesthetic icon", weightChance: 15 },
  { name: "Jing Yuan", age: 700, height: "185 cm", weight: "75 kg", tier: "Epic", keyword: "Jing Yuan honkai star rail aesthetic", weightChance: 15 },
  { name: "Dan Heng", age: 25, height: "180 cm", weight: "70 kg", tier: "Epic", keyword: "Y el icono estético Heng IL", weightChance: 15 },
  { name: "Aventurine", age: 22, height: "183 cm", weight: "73 kg", tier: "Epic", keyword: "Aventurine honkai star rail aesthetic", weightChance: 15 },
  { name: "Kaeluc (Kaeya)", age: 22, height: "186 cm", weight: "75 kg", tier: "Epic", keyword: "Kaeya Genshin aesthetic", weightChance: 15 },

  // Legendary (5% weight)
  { name: "Gojo Satoru", age: 28, height: "190 cm", weight: "85 kg", tier: "Legendary", keyword: "Gojo Satoru aesthetic icon", weightChance: 5 },
  { name: "Ryomen Sukuna", age: 1000, height: "173 cm", weight: "80 kg", tier: "Legendary", keyword: "Sukuna aesthetic icon", weightChance: 5 },
  { name: "Toji Fushiguro", age: 30, height: "185 cm", weight: "90 kg", tier: "Legendary", keyword: "Toji Fushiguro aesthetic", weightChance: 5 },
  { name: "Gilgamesh", age: 3000, height: "182 cm", weight: "68 kg", tier: "Legendary", keyword: "Gilgamesh Fate aesthetic", weightChance: 5 },
  { name: "Sesshomaru", age: 900, height: "185 cm", weight: "75 kg", tier: "Legendary", keyword: "Sesshomaru aesthetic icon", weightChance: 5 },
  { name: "Alhaitham", age: 25, height: "188 cm", weight: "76 kg", tier: "Legendary", keyword: "Alhaitham aesthetic icon", weightChance: 5 },
  { name: "Dazai Osamu", age: 22, height: "181 cm", weight: "67 kg", tier: "Legendary", keyword: "Dazai Osamu aesthetic", weightChance: 5 },
];

async function getHusbuImage(keyword) {
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
    console.error("[GachaHusbu] Pinterest API error:", e.message);
  }
  return "https://i.pinimg.com/736x/8f/3e/2a/8f3e2a77ec65cdbcfad4ff3bc17e825f.jpg"; // Placeholder fall-back
}

async function getBuffer(url) {
  try {
    const res = await _axios2.default.get(url, { responseType: "arraybuffer", timeout: 15000 });
    return Buffer.from(res.data);
  } catch (e2) {
    return null;
  }
}

function rollHusbu() {
  const totalWeight = husbuPool.reduce((acc, h) => acc + h.weightChance, 0);
  let random = Math.random() * totalWeight;
  for (const husbu of husbuPool) {
    random -= husbu.weightChance;
    if (random <= 0) return husbu;
  }
  return husbuPool[husbuPool.length - 1];
}

async function sendHusbuMessage(m, sock, husbu, textContent, customButtons = null) {
  let imgBuffer = null;
  if (husbu.imageUrl) {
    imgBuffer = await getBuffer(husbu.imageUrl);
  }
  if (!imgBuffer) {
    const newUrl = await getHusbuImage(husbu.keyword);
    husbu.imageUrl = newUrl;
    imgBuffer = await getBuffer(newUrl) || Buffer.alloc(0);
  }

  const media = await _almiku.prepareWAMessageMedia.call(void 0, 
    { image: imgBuffer },
    { upload: sock.waUploadToServer }
  );

  let buttons = customButtons;
  if (!buttons) {
    if (husbu.affection < 80) {
      buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚶‍♀️ Jalan-jalan", id: `${m.prefix}husbuaction jalanjalan` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☕ Nongkrong di Kafe", id: `${m.prefix}husbuaction kafe` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎬 Nonton Bioskop", id: `${m.prefix}husbuaction bioskop` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛍️ Beli Baju", id: `${m.prefix}husbuaction belanja` }) },
      ];
    } else if (husbu.affection < 100) {
      buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🫂 Peluk Punggungnya", id: `${m.prefix}husbuaction peluk` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💋 Cium Pipinya", id: `${m.prefix}husbuaction cium` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛏️ Tidur Bareng", id: `${m.prefix}husbuaction duerme` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛁 Mandi Bareng", id: `${m.prefix}husbuaction mandi` }) },
      ];
    } else {
      if (!husbu.married) {
        buttons = [
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💍 Terima Lamarannya", id: `${m.prefix}husbuaction nikah` }) },
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💝Compras Dinero Inga", id: `${m.prefix}husbuaction premio` }) },
        ];
      } else {
        buttons = [
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👨‍👩‍👦Pasa tiempo con", id: `${m.prefix}husbuaction mesra` }) },
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💌 Goda Suamimu", id: `${m.prefix}husbuaction rayu` }) },
        ];
      }
    }
  }

  let footerText = "❤¡Para golpearlo sucio y enamorarse de ti!";
  if (customButtons) footerText = "💭Espera su respuesta.";
  else if (husbu.married) footerText = "❤¡A ti es la esposa de los vivos!";

  const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
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
            title: `🌟 *${husbu.tier.toUpperCase()} TIER HUSBANDO* 🌟`,
            subtitle: husbu.name,
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
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  if (!user) return;

  const cmd = m.command.toLowerCase();
  if (cmd === "husbuku" || cmd === "suamiku") {
    if (!user.husbu) {
      return m.reply(`⚠️ *¡Todavía no tienes un husbu!*\nEscribe *${m.prefix}gachahusbu* para empezar.`);
    }
    m.react("🕕");
    const husbu = user.husbu;
    let statusPernikahan = husbu.married ? "Telah Menikah 💍" : "Pendekatan 💖";
    const textContent = `📸* STATUS HUSHAND YOU *📸\n\n` +
      `💖*Nombre Lengkap:*${husbu.name}\n` +
      `🎂*Edad:*${husbu.age} tahun\n` +
      `💎 *Tier:* ${husbu.tier}\n` +
      `💞 *Affection:* ${husbu.affection}/100\n` +
      `💍 *Status:* ${statusPernikahan}\n\n` +
      `Continuar las interacciones eligiendo una de las acciones weenie en este swab!`;

    m.react("✅");
    return await sendHusbuMessage(m, sock, husbu, textContent, null);
  }
  if (cmd === "tinggalinhusbu") {
    if (!user.husbu) {
      return m.reply(`⚠¡Ni siquiera tienes marido todavía!`);
    }

    const husbuName = user.husbu.name;
    const husbuJid = 'husbu_' + husbuName.replace(/\s+/g, '') + '@s.whatsapp.net';
    if (user.husbu.married) {
      if (user.fun && user.fun.pasangan === husbuJid) {
        user.fun.pasangan = "";
      }
      db.setUser(husbuJid, { fun: { pasangan: "" } });
    }

    delete user.husbu;
    db.setUser(m.sender, user);

    m.react("💔");
    return m.reply(
      `💔*Tu MENCAMPAKKAN${husbuName.toUpperCase()}!*\n\n` +
      `Le devuelves sus cosas y le pides que se vaya.` +
      `Te mira con un ojo profundo, gira sin una palabra, y luego desaparece en el medio de los hujani.\n\n` +
      `Está oficialmente separado.`
    );
  }
  if (cmd === "gachahusbu" || cmd === "gachasuami") {
    if (user.husbu) {
      m.react("😡");
      let pesanStatus = user.husbu.married ? "¡Él ya es tu esposo!" : "¡Está tratando de derretir tu corazón!";
      return m.reply(
        `⚠- * ¡Ya tienes a Husbu!\n\n` +
        `Nombre: *${user.husbu.name}*\n` +
        `Tier: *${user.husbu.tier}*\n` +
        `Affection: *${user.husbu.affection}/100*\n\n` +
        `¡No seas avariciosa! Cuida al husbu que ya tienes. ${pesanStatus} Escribe *${m.prefix}husbuku* para interactuar con él.`
      );
    }

    const sub = (m.args[0] || "").toLowerCase();

    if (sub !== "start") {
      const panduan = `💕 SISTEMA GACHA HUSBANDO 💕\n\n` +
        `Las simulaciones de kencan alienígenas son interactivas para conseguir su anime masculino!\n\n` +
        `*Uso Comando:*\n` +
        `• *${m.prefix}gachahusbu* — Abre este menú de guía\n` +
        `• *${m.prefix}husbuku* — Abre el panel de interacción con tu husbu\n` +
        `• *${m.prefix}tinggalinhusbu* — Abandona a tu husbu y reinicia su estado\n\n` +
        `✨ HISTORIA COMPLETA:\n` +
        `1. Consigue tu primer husbu.\n` +
        `2. Atraviesa las 3 fases del amor\n` +
        `3. Interactúa, cuida y sube su afecto.\n` +
        `4. Cásate con tu husbu y forma una familia.\n` +
        `5. ¡Disfruta del viaje!`;

      const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: { text: panduan },
              footer: { text: "Peel puffle in the bayou to call your soul mate 's clone!" },
              nativeFlowMessage: {
                buttons: [
                  { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎲¡Llama a Husbando ahora!", id: `${m.prefix}gachahusbu start` }) }
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
      const husbuData = rollHusbu();
      const husbu = {
        ...husbuData,
        affection: 50,
        married: false,
        imageUrl: await getHusbuImage(husbuData.keyword)
      };

      user.husbu = husbu;
      db.setUser(m.sender, user);

      const textContent = `🎉¡Tienes un nuevo hitbando!🎉\n\n` +
        `💖*Nombre Lengkap:*${husbu.name}\n` +
        `🎂*Edad:*${husbu.age} tahun\n` +
        `📏*Alto Badan:*${husbu.height}\n` +
        `⚖Pesado Badan:${husbu.weight}\n` +
        `💎 *Tier:* ${husbu.tier}\n` +
        `💞 *Affection:* ${husbu.affection}/100\n\n` +
        `Por favor seleccione interacciones en está bañera para honrar el GDKT.`;

      m.react("✅");
      await sendHusbuMessage(m, sock, husbu, textContent, null);
    } catch (err) {
      console.error(err);
      m.react("☢");
      return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
    return;
  }
  if (cmd === "husbuaction") {
    if (!user.husbu) {
      m.react("❌");
      return m.reply(`¡Todavía no tienes un husbu! Escribe *${m.prefix}gachahusbu* para conseguir tu primer husbu.`);
    }

    const action = (m.args[0] || "").toLowerCase();
    let husbu = user.husbu;
    let responseText = "";
    let affectionChange = 0;
    if (action === "jalanjalan") {
      return sendHusbuMessage(m, sock, husbu, `Tú y...${husbu.name}He 's been looking bored.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🌳 Ke Taman Piknik", id: `${m.prefix}husbuaction kencan_taman` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎢 Ke Taman Bermain", id: `${m.prefix}husbuaction kencan_mall` }) }
      ]);
    }
    if (action === "kafe") {
      return sendHusbuMessage(m, sock, husbu, `*${husbu.name}* mentraktirmu en kafe favoritnya. Cuando memesan cafe, el menanyakan selera minumanmu.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☕ Kopi Pahit", id: `${m.prefix}husbuaction kencan_kopi` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🍓 Strawberry Milk", id: `${m.prefix}husbuaction kencan_matcha` }) }
      ]);
    }
    if (action === "bioskop") {
      return sendHusbuMessage(m, sock, husbu, `Bioscopio egual, él recoge su peícula.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💥 Film Action", id: `${m.prefix}husbuaction kencan_romantis` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👻 Film Horor", id: `${m.prefix}husbuaction kencan_horor` }) }
      ]);
    }
    if (action === "belanja") {
      return sendHusbuMessage(m, sock, husbu, `Ustedes vayan al centro comercial.${husbu.name}* Ofrézcale algo.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👕 Jaket Keren Pasangan", id: `${m.prefix}husbuaction kencan_baju` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💍 Cincin Mewah", id: `${m.prefix}husbuaction kencan_perhiasan` }) }
      ]);
    }
    const rejectIntimate = async () => {
      husbu.affection -= (Math.floor(Math.random() * 30) + 30);
      if (husbu.affection < 0) husbu.affection = 0;
      let outText = `💢¡Estás actuando agresivo cuando sus sentimientos siguen siendo samar!${husbu.name}" Ponga sus manos en sus brazos con la cara y la boca en su pecho ".`;
      await processAffection(outText, husbu.affection);
    };

    if (["peluk", "cium", "tidur", "mandi"].includes(action) && husbu.affection < 80) {
      return await rejectIntimate();
    }

    if (action === "peluk") {
      return sendHusbuMessage(m, sock, husbu, `Miras la espalda grande${husbu.name}* Buena oportunidad, ¡lo estás tocando!`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🤗 Peluk Pinggangnya", id: `${m.prefix}husbuaction intim_belakang` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💪 Pegang Tangannya Erat", id: `${m.prefix}husbuaction intim_depan` }) }
      ]);
    }
    if (action === "cium") {
      return sendHusbuMessage(m, sock, husbu, `Está tan cerca de mirarte con ojos tan agudos.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "😚 Cium Pipinya", id: `${m.prefix}husbuaction intim_kening` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💋 Cium Bibirnya", id: `${m.prefix}husbuaction intim_bibir` }) }
      ]);
    }
    if (action === "tidur") {
      return sendHusbuMessage(m, sock, husbu, `El malamstanc, usted está en la misma habitación, que le está tirando en sus brazos.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🫂 Senderan di Dadanya", id: `${m.prefix}husbuaction intim_kelon` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🔥Responde con Gairah", id: `${m.prefix}husbuaction intim_panas` }) }
      ]);
    }
    if (action === "mandi") {
      return sendHusbuMessage(m, sock, husbu, `*${husbu.name}" Tirándote al baño con ella, su cuerpo esmiró. " ¿Qué estás haciendo?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛁 Membasuh Punggungnya", id: `${m.prefix}husbuaction intim_punggung` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🧼Ukup Dadya 's Field", id: `${m.prefix}husbuaction intim_bahu` }) }
      ]);
    }

    if (action === "kencan_taman") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🌳 *${husbu.name}* tanto como el viento llenado y mercado tiempo durmiendo en su vuelta en el escenario.`;
    }
    else if (action === "kencan_mall") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `🎢Jugar en taman jugar ternata muy: caroling para su culo!${husbu.name}* Gana una muñeca grande y dáselo.`;
    }
    else if (action === "kencan_kopi") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `☕Ustedes toman un sorbo de la olla de patty, se ve muy cómodo hablando con usted.`;
    }
    else if (action === "kencan_matcha") {
      affectionChange = -(Math.floor(Math.random() * 10) + 5);
      responseText = `🍓Te compró una menta, pero eres un poco menos bellied, y parece aburrido y simplemente no dice nada.`;
    }
    else if (action === "kencan_romantis") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `💥¡La peelícula es lo que más le gusta!`;
    }
    else if (action === "kencan_horor") {
      affectionChange = Math.floor(Math.random() * 5) + 5;
      responseText = `👻Se ríe un poco, pero luego se acerca a ti para protegerte del miedo.`;
    }
    else if (action === "kencan_baju") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `👕¡Te compró un par de gatos muy lindos!`;
    }
    else if (action === "kencan_perhiasan") {
      affectionChange = -(Math.floor(Math.random() * 10) + 10);
      responseText = `💍Lo compró y sintió que eras demasiado materialista.`;
    }
    else if (action === "intim_belakang") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🤗Se sorprendió cuando le tocó la cintura de atrás, y su marido estaba muriendo, y él tomó su mano y la sacó de su boca.`;
    }
    else if (action === "intim_depan") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `💪Usted sostiene su mano fuerte, ella sonríe suavemente y luego ella agarra su mano mientras mira a sus ojos.`;
    }
    else if (action === "intim_kening") {
      affectionChange = Math.floor(Math.random() * 10) + 5;
      responseText = `😚Estás besando sus mejillas, me ama y te está dando una taza caliente de tu frente.`;
    }
    else if (action === "intim_bibir") {
      affectionChange = Math.floor(Math.random() * 20) + 10;
      responseText = `💋Hueles la garganta tan baja, que perderá sus matans un segundo antes de que te arroje en la cintura y la responda en ferviente.`;
    }
    else if (action === "intim_kelon") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `🫂Estás rompiendo la cabeza en un jardín loco, te está agarrando el pelo mientras hablas de cómo te sientes.`;
    }
    else if (action === "intim_panas") {
      affectionChange = Math.floor(Math.random() * 20) + 15;
      responseText = `🔥Usted mira sus ojos con un gran corazón, ella ataca a sus propinas, usted le pide que la ame con una voz alta, sexy antes de que ella te golpee.`;
    }
    else if (action === "intim_punggung") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🛁La lavas lentamente, el toque de tu mano lo hace regar y sopla el aliento de la lega sapil a través de los ojos.`;
    }
    else if (action === "intim_bahu") {
      affectionChange = Math.floor(Math.random() * 15) + 15;
      responseText = `🧼Cuando usted tiene las manos desnudas, respira profundamente y sacude la mano.`;
    }
    else if (action === "nikah") {
      if (husbu.affection < 100) return m.reply(`⚠¡Espera a que te lo haya propuesto!`);
      if (husbu.married) return m.reply(`⚠¡Estás casado!`);

      husbu.married = true;
      user.limit = (user.limit || 0) + 5000;
      user.koin = (user.koin || 0) + 100000;

      if (!user.fun) user.fun = {};
      const husbuJid = 'husbu_' + husbu.name.replace(/\s+/g, '') + '@s.whatsapp.net';
      user.fun.pasangan = husbuJid;
      db.setUser(husbuJid, { fun: { pasangan: m.sender }, name: husbu.name });

      responseText = `💍 *¡ACEPTASTE LA PROPUESTA DE ${husbu.name.toUpperCase()}!* 💍\n\nTe mira mientras te entrega un anillo de diamantes y te pregunta si serás su esposa para siempre.\n\nComo regalo de boda recibes:\n- ⚡ 5000 de límite/energía\n- 💰 100.000 de saldo/koin\n\n¡Ahora son pareja oficial!`;
      affectionChange = 0;
    }
    else if (action === "hadiah") {
      if (husbu.affection < 100) return m.reply(`⚠ Todavía no te quiere lo suficiente para darte un regalo.`);
      affectionChange = 0;
      user.koin = (user.koin || 0) + 5000;
      responseText = `💝 *${husbu.name}* te da una tarjeta y sonríe: \"Toma todo lo que quieras\".\n¡Has recibido 💰 5000 monedas de tu esposo!`;
    }
    else if (["mesra", "rayu"].includes(action)) {
      if (!husbu.married) return m.reply(`¡Este truco es para marido y mujer!`);
      affectionChange = 0;
      responseText = `👨‍👩‍👦Ustedes dos disfrutan de una cena romántica pacífica, un aspecto de amor nunca vuelve.`;
    }
    else {
      m.react("❓");
      return m.reply(`Acciones sin jugar, por favor utilice la interacción en el puffle.`);
    }

    async function processAffection(customResponseText, currentAffectionVal) {
      let finalResponseText = customResponseText || responseText;
      husbu.affection += affectionChange;
      if (husbu.affection > 100) husbu.affection = 100;
      if (husbu.affection < 0) husbu.affection = 0;

      let sign = affectionChange > 0 ? "+" : "";
      let affectionText = `💞 *Affection berubah:* ${sign}${affectionChange} (Total: ${husbu.affection}/100)`;
      if (husbu.affection === 100) affectionText = `💞 *Affection MAKSIMAL! (100/100)*`;
      if (affectionChange === 0) affectionText = `💞 *Affection:* ${husbu.affection}/100`;

      if (husbu.affection <= 0) {
        const leavingText = `💔 *${husbu.name.toUpperCase()} MENINGGALKANMU SELAMANYA!* 💔\n\n${finalResponseText}\n\n${affectionText}\n\nDebido a que su amor por usted ha desaparecido completamente, ha estado empaquetando sus bolsas, cuando usted está tratando de retenerlo, él tiene la mano.\n*(Escribe${m.prefix}* Gachahushbu para reiniciar *`;

        if (husbu.married) {
          const husbuJid = 'husbu_' + husbu.name.replace(/\s+/g, '') + '@s.whatsapp.net';
          if (user.fun && user.fun.pasangan === husbuJid) user.fun.pasangan = "";
          db.setUser(husbuJid, { fun: { pasangan: "" } });
        }

        delete user.husbu;
        db.setUser(m.sender, user);

        m.react("💔");
        return m.reply(leavingText);
      }

      user.husbu = husbu;
      db.setUser(m.sender, user);

      const updatedText = `${finalResponseText}\n\n${affectionText}`;
      m.react(husbu.affection === 100 ? "💍" : "✨");
      await sendHusbuMessage(m, sock, husbu, updatedText, null);
    }

    await processAffection();
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
