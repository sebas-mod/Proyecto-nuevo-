"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }














var _almikugamedatajs = require('./almiku-game-data.js');
var _almikudatabasejs = require('./almiku-database.js');
var _almikuleveljs = require('./almiku-level.js');




var _almikucontextjs = require('./almiku-context.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _sharp = require('./almiku-image.js'); var _sharp2 = _interopRequireDefault(_sharp);
let fetchBuffer;
try {
  fetchBuffer = require("./almiku-utils.js").fetchBuffer;
} catch (e) { }

const WIN_MESSAGES = [
  "🌟 *GG WP! Otakmu encer!*",
  "✨ *KEREN ABIS! Lu emang pinter!*",
  "🎉 *MANTAPPPP! Jawaban sempurna!*",
  "💫 *EPIC! Gak ada lawan lu!*",
  "🏆 *NGERI! Otak lu kayak Google!*",
  "🔥 *LEGEND! Jawab kek gak ada beban!*",
];

const TIMEOUT_MESSAGES = [
  "⏱¡Sí, el tiempo se acabó!",
  "⏱(Truenos tiempos)",
  "⏱*Demasiado tarde hermano, el tiempo se acaba!*",
];

const SURRENDER_MESSAGES = [
  "🏳️ *Yahhh nyerah deh...*",
  "🏳️ *MENYERAH!*",
  "🏳️ *Yah sayang banget nyerah...*",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

class AlMikuGames {
  constructor() {
    this.registry = new Map();
  }

  register(gameType, cfg) {
    const defaults = {
      dataFile: `${gameType}.json`,
      questionField: "soal",
      answerField: "jawaban",
      emoji: "🎮",
      title: gameType.toUpperCase(),
      description: `Juego${gameType}`,
      timeout: 60000,
      cooldown: 5,
      hasImage: false,
      imageField: "img",
      alias: [],
      hintCount: 2,
    };
    this.registry.set(gameType, { ...defaults, ...cfg, gameType });
  }

  get(gameType) {
    return this.registry.get(gameType);
  }

  createHandler(gameType) {
    const cfg = this.registry.get(gameType);
    if (!cfg) throw new Error(`Juego${gameType}" not registered`);

    const handler = async (m, { sock }) => {
      const chatId = m.chat;

      if (_almikugamedatajs.hasActiveSession.call(void 0, chatId)) {
        const session = _almikugamedatajs.getSession.call(void 0, chatId);
        if (session && session.gameType === gameType) {
          const remaining = _almikugamedatajs.getRemainingTime.call(void 0, chatId);
          const answer = session.question[cfg.answerField];
          let text = `⚠*Ahí juego calle aquí, conteste! *\n\n`;
          if (cfg.questionField && session.question[cfg.questionField]) {
            text += `\`\`\`${session.question[cfg.questionField]}\`\`\`\n\n`;
          }
          text += `💡 Hint: *${_almikugamedatajs.getHint.call(void 0, answer, cfg.hintCount)}*\n`;
          text += `⏱Restante: *${_almikugamedatajs.formatRemainingTime.call(void 0, remaining)}*\n\n`;
          text += `# Tan largo o cuando es difícil #\nCada mal, las pistas crecerán`;
          await sock.sendPreview(
            m.chat,
            {
              caption: `${_configjs2.default.info.website}\n\n${text}`,
              url: `${_configjs2.default.info.website}`,
              title: cfg.title,
              description: cfg.description,
              jpegThumbnail: await _sharp2.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["almiku2"])).resize(300, 300).toBuffer(),
              previewType: 0,
            },
          );
          return;
        }
      }

      const question = _almikugamedatajs.getRandomItem.call(void 0, cfg.dataFile);
      if (!question) {
        await m.reply(
          "❌*ᴅᴀᴛᴀ ᴛɪᴅᴀᴋ ᴛᴇʀSᴇᴅɪᴀ*\n\nEl juego de datos no está disponible!",
        );
        return;
      }

      const answer = question[cfg.answerField];
      let sentMsg;

      if (cfg.hasImage && fetchBuffer) {
        let imageBuffer;
        try {
          imageBuffer = await fetchBuffer(question[cfg.imageField]);
        } catch (e2) {
          await m.reply("❌ *ɢᴀɢᴀʟ ᴍᴇᴍᴜᴀᴛ ɢᴀᴍʙᴀʀ*\n\n> Coba lagi nanti!");
          return;
        }

        let caption = `${cfg.emoji} *${cfg.title}*\n\n`;
        if (cfg.questionField && question[cfg.questionField]) {
          caption += `> ${question[cfg.questionField]}\n`;
        }
        caption += `💡 Hint: *${_almikugamedatajs.getHint.call(void 0, answer, cfg.hintCount)}*\n`;
        caption += `⏱*Tiempo*${cfg.timeout / 1000}segundo*\n`;
        caption += `🎁Hyatt: * Límite, Tela, EXP ( aleatorio ) *\n\n`;
        caption += `# Tan largo o cuando es difícil #\nCada mal, las pistas crecerán`;

        sentMsg = await sock.sendMessage(
          chatId,
          {
            image: imageBuffer,
            caption,
            contextInfo: _almikucontextjs.getGameContextInfo.call(void 0, ),
          },
          { quoted: m },
        );
      } else {
        let text = `${cfg.emoji} *${cfg.title}*\n\n`;
        if (cfg.questionField && question[cfg.questionField]) {
          text += `\`\`\`${question[cfg.questionField]}\`\`\`\n\n`;
        }
        text += `💡 Hint: *${_almikugamedatajs.getHint.call(void 0, answer, cfg.hintCount)}*\n`;
        text += `⏱*Tiempo*${cfg.timeout / 1000}segundo*\n`;
        text += `🎁Hyatt: * Límite, Tela, EXP ( aleatorio ) *\n\n`;
        text += `# Tan largo o cuando es difícil #\nCada mal, las pistas crecerán`;

        sentMsg = await _almikucontextjs.sendGamePreview.call(void 0, 
          sock,
          chatId,
          text,
          `${cfg.emoji} ${cfg.title}`,
          "Jawab pertanyaan!",
          { quoted: m },
        );
      }

      _almikugamedatajs.createSession.call(void 0, chatId, gameType, question, sentMsg.key, cfg.timeout);

      _almikugamedatajs.setSessionTimer.call(void 0, chatId, async () => {
        let text = `${pick(TIMEOUT_MESSAGES)}\n\n`;
        text += `Respuesta: *${answer}*\n\n`;
        text += `Estoy seguro de que cualquiera puede responder a eso.`;
        await m.reply(text);
      });
    };

    const answerHandler = async (m, sock) => {
      const chatId = m.chat;
      const session = _almikugamedatajs.getSession.call(void 0, chatId);

      if (!session || session.gameType !== gameType) return false;

      const userAnswer = (m.body || "").trim();
      if (!userAnswer || userAnswer.startsWith(".")) return false;

      if (_almikugamedatajs.isSurrender.call(void 0, userAnswer)) {
        _almikugamedatajs.endSession.call(void 0, chatId);
        const answer = session.question[cfg.answerField];
        let text = `${pick(SURRENDER_MESSAGES)}\n\n`;
        text += `Respuesta: *${answer}*\n\n`;
        text += `_@${m.sender.split("@")[0]}Rendirse`;
        await m.reply(text, { mentions: [m.sender] });
        return true;
      }

      if (!_almikugamedatajs.isReplyToGame.call(void 0, m, session)) return false;

      session.attempts++;

      const answer = session.question[cfg.answerField];
      const result = _almikugamedatajs.checkAnswerAdvanced.call(void 0, answer, userAnswer);

      if (result.status === "correct") {
        _almikugamedatajs.endSession.call(void 0, chatId);

        const db = _almikudatabasejs.getDatabase.call(void 0, );
        const user = db.getUser(m.sender);

        let totalLimit = 0;
        let totalBalance = 0;
        let totalExp = 0;

        if (cfg.rewards === false || cfg.rewards === null) {
          //Lo siento mucho menos que eso.
        } else if (cfg.rewards) {
          totalLimit = cfg.rewards.limit || cfg.rewards.energi || 0;
          totalBalance = cfg.rewards.koin || cfg.rewards.balance || 0;
          totalExp = cfg.rewards.exp || 0;
        } else {
          const reward = _almikugamedatajs.getRandomReward.call(void 0, );
          totalLimit = reward.limit;
          totalBalance = reward.koin;
          totalExp = reward.exp;
        }

        let bonusText = "";

        const fastResult = _almikucontextjs.checkFastAnswer.call(void 0, session);
        if (
          fastResult.isFast &&
          cfg.rewards !== false &&
          cfg.rewards !== null
        ) {
          totalLimit += fastResult.bonus.limit;
          totalBalance += fastResult.bonus.koin;
          totalExp += fastResult.bonus.exp;
          bonusText = `\n\n${fastResult.praise}\n⚡* Bono KILIT: * +${fastResult.bonus.limit}Límite, +${fastResult.bonus.koin}Monedas\n⏱*Tiempo*${(fastResult.elapsed / 1000).toFixed(1)}s*`;
        }

        if (totalLimit > 0) db.updateEnergi(m.sender, totalLimit);
        if (totalBalance > 0) db.updateKoin(m.sender, totalBalance);

        if (totalExp > 0) {
          if (!user.rpg) user.rpg = {};
          await _almikuleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, totalExp);
        }
        db.save();

        let text = `${pick(WIN_MESSAGES)}\n\n`;
        text += `Respuesta: *${answer}*\n`;
        text += `Ganador: *@${m.sender.split("@")[0]}*\n`;
        text += `Intento: *${session.attempts}x*\n\n`;

        if (totalLimit > 0 || totalBalance > 0 || totalExp > 0) {
          let parts = [];
          if (totalLimit > 0) parts.push(`+${totalLimit}Límite`);
          if (totalBalance > 0) parts.push(`+${totalBalance}Monedas`);
          if (totalExp > 0) parts.push(`+${totalExp} EXP`);
          text += `🎁 ${parts.join(", ")}`;
        }
        text += bonusText;

        await m.reply(text, { mentions: [m.sender] });
        return true;
      }

      if (result.status === "close") {
        const remaining = _almikugamedatajs.getRemainingTime.call(void 0, chatId);
        const percent = Math.round(result.similarity * 100);
        await m.react("🔥");
        await m.reply(
          `🔥 *Casi!* Jawabanmu *${percent}% * similar!\n*Tiempo de sosa*${_almikugamedatajs.formatRemainingTime.call(void 0, remaining)}*_`,
        );
        return false;
      }

      const remaining = _almikugamedatajs.getRemainingTime.call(void 0, chatId);
      if (remaining > 0 && session.attempts < 10) {
        await m.react("❌");
        const hint = _almikugamedatajs.getProgressiveHint.call(void 0, answer, session.attempts);
        await m.reply(
          `❌¡Eel bier!${hint}*\nRestante: *${_almikugamedatajs.formatRemainingTime.call(void 0, remaining)}*_`,
        );
      }

      return false;
    };

    return { handler, answerHandler };
  }

  createPlugin(gameType, overrides = {}) {
    const cfg = this.registry.get(gameType);
    if (!cfg) throw new Error(`Juego${gameType}" not registered`);

    const { handler, answerHandler } = this.createHandler(gameType);

    return {
      config: {
        name: gameType,
        alias: cfg.alias,
        category: "game",
        description: cfg.description,
        usage: `.${gameType}`,
        example: `.${gameType}`,
        isOwner: false,
        isPremium: false,
        isGroup: false,
        isPrivate: false,
        cooldown: cfg.cooldown,
        energi: 0,
        isEnabled: true,
        ...overrides,
      },
      handler,
      answerHandler,
    };
  }
}

const games = new AlMikuGames();

exports.AlMikuGames = AlMikuGames; exports.games = games;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
