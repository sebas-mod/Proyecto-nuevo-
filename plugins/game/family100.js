"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }











var _ouringamedatajs = require('../../src/lib/ourin-game-data.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "family100",
  alias: ["f100", "survei"],
  category: "game",
  description: "Survey says! Tebak jawaban teratas survei",
  usage: ".family100",
  example: ".family100",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (_ouringamedatajs.hasActiveSession.call(void 0, chatId)) {
    const session = _ouringamedatajs.getSession.call(void 0, chatId);
    if (session && session.gameType === "family100") {
      const remaining = _ouringamedatajs.getRemainingTime.call(void 0, chatId);
      const answered = session.answered || [];
      const total = session.question.jawaban.length;

      let text = `Bueno, la sección de la familia 100 sigue, hermano!😱✨\n\n`;
      text += `*${session.question.soal}*\n\n`;
      text += `Terjawab: *${answered.length}de${total}*\n`;
      answered.forEach((ans, i) => {
        text += `${i + 1}. ✅ ${ans}\n`;
      });
      for (let i = answered.length; i < total; i++) {
        text += `${i + 1}. ❓ ???\n`;
      }
      text += `\nTiempo de ahorro: *${_ouringamedatajs.formatRemainingTime.call(void 0, remaining)}* ⏳\n`;
      text += `El lanzamiento en el - mensaje de respuesta para la respuesta!🔥`;
      await m.reply(text);
      return;
    }
  }

  const question = _ouringamedatajs.getRandomItem.call(void 0, "family100.json");
  if (!question) {
    await m.reply("Sí, hermano, porque el juego está en la ciudad😭💔");
    return;
  }

  const total = question.jawaban.length;

  let text = `¡Hora de jugar " famILY 100 "!🎉✨\n\n`;
  text += `*Pregunta:*${question.soal}\n\n`;
  text += `Top Akaban: *${total}* 📝\n`;
  for (let i = 0; i < total; i++) {
    text += `${i + 1}. ❓ ???\n`;
  }
  text += `\n¡Estuviste a sólo cien y veinte segundos!⏱♪\n`;
  text += `Hadiahnya? Random *EXP* & *Monedas* crea cada respuesta bener! 🎁💸\n\n`;
  text += `Cara principal: langsung * responder este mensaje * con su respuesta, o responder con la palabra * yadu ya ya pudah🏳♪😂`;

  const sentMsg = await m.reply(text);

  const session = _ouringamedatajs.createSession.call(void 0, 
    chatId,
    "family100",
    question,
    sentMsg.key,
    120000,
  );
  session.answered = [];
  session.answeredBy = {};

  _ouringamedatajs.setSessionTimer.call(void 0, chatId, async () => {
    const sess = _ouringamedatajs.getSession.call(void 0, chatId);
    const answered = _optionalChain([sess, 'optionalAccess', _ => _.answered]) || [];
    const remaining = question.jawaban.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let timeoutText = `Bueno, me temo que hemos terminado por!😭😭⏱♪\n\n`;
    timeoutText += `Ustedes tienen razón.${answered.length}* of *${question.jawaban.length}* respuesta!✨\n\n`;
    if (remaining.length > 0) {
      timeoutText += `Está es una respuesta rara:\n`;
      remaining.forEach((ans) => {
        timeoutText += `• ${ans}\n`;
      });
    }
    timeoutText += `\nGracias por jugar, espera a la próxima sesión!💖🎉`;

    _ouringamedatajs.endSession.call(void 0, chatId);
    await sock.sendMessage(chatId, { text: timeoutText }, { quoted: sentMsg });
  });
}

async function family100AnswerHandler(m, sock) {
  const chatId = m.chat;
  const session = _ouringamedatajs.getSession.call(void 0, chatId);

  if (!session || session.gameType !== "family100") return false;
  if (!m.body || m.isCommand) return false;

  const userAnswer = m.body.toLowerCase().trim();
  if (!userAnswer) return false;

  const isQuotingGame = _ouringamedatajs.isReplyToGame.call(void 0, m, session);

  if (_ouringamedatajs.isSurrender.call(void 0, userAnswer)) {
    const answered = session.answered || [];
    const remaining = session.question.jawaban.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let text = `Walahh en nyerah aquí ceritanya? 🥺🏳♪\n\n`;
    text += `En las noticias de lo obvio${answered.length}* of *${session.question.jawaban.length}* lho! 👏\n\n`;
    if (remaining.length > 0) {
      text += `Aquí yo amor tau respuesta sisanya:\n`;
      remaining.forEach((ans) => {
        text += `• ${ans}\n`;
      });
    }
    text += `\n¿Qué pasa, ne?x¡El tiempo suti puede sonreír!💖✨`;

    _ouringamedatajs.endSession.call(void 0, chatId);
    await m.reply(text);
    return true;
  }

  const correctAnswers = session.question.jawaban.map((j) => j.toLowerCase());
  const answered = session.answered || [];

  if (answered.includes(userAnswer)) {
    if (isQuotingGame) {
      await m.react("⚠️");
      await m.reply(`Hao lho, angran${userAnswer}Voy a conseguir otro.😂✨`);
      return true;
    }
    return false;
  }

  const matchIndex = correctAnswers.findIndex((ans) => {
    const similarity = getSimilarity(ans, userAnswer);
    return (
      similarity >= 0.8 || ans.includes(userAnswer) || userAnswer.includes(ans)
    );
  });

  if (matchIndex !== -1) {
    const originalAnswer = session.question.jawaban[matchIndex];

    if (!answered.includes(originalAnswer.toLowerCase())) {
      session.answered.push(originalAnswer.toLowerCase());
      session.answeredBy[originalAnswer.toLowerCase()] = m.sender;

      const db = _ourindatabasejs.getDatabase.call(void 0, );
      const user = db.getUser(m.sender);

      const answerReward = _ouringamedatajs.getRandomReward.call(void 0, );
      if (!user.rpg) user.rpg = {};
      await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, answerReward.exp);
      db.updateKoin(m.sender, answerReward.koin);
      db.save();

      if (session.answered.length === correctAnswers.length) {
        _ouringamedatajs.endSession.call(void 0, chatId);

        const participants = Object.values(session.answeredBy);
        const uniqueParticipants = [...new Set(participants)];

        let text = `WOAAHH Genial Mucho! Todo respuesta ketebak! 🎉🔥✨\n\n`;
        text += `*Pregunta:*${session.question.soal}\n\n`;
        session.question.jawaban.forEach((ans, i) => {
          const who = session.answeredBy[ans.toLowerCase()];
          text += `${i + 1}. ✅ ${ans} - @${_optionalChain([who, 'optionalAccess', _2 => _2.split, 'call', _3 => _3("@"), 'access', _4 => _4[0]]) || "?"}\n`;
        });
        text += `\n🎊¡Quiero que lo pienses!🧠💯`;

        await m.reply(text, { mentions: uniqueParticipants });
        return true;
      }

      const total = session.question.jawaban.length;
      let text = `Benerrr mucho!✅🎉\n@${m.sender.split("@")[0]} dapet *+${answerReward.exp} EXP* & *+${answerReward.koin}Monedas* aquí!💸✨\n\n`;
      text += `*Pregunta:*${session.question.soal}\n\n`;
      session.question.jawaban.forEach((ans, i) => {
        const isAnswered = session.answered.includes(ans.toLowerCase());
        if (isAnswered) {
          text += `${i + 1}. ✅ ${ans}\n`;
        } else {
          text += `${i + 1}. ❓ ???\n`;
        }
      });
      text += `\nVen a gas restante *${total - session.answered.length}* Otra respuesta, hermano!🔥⏱♪`;

      await m.reply(text, { mentions: [m.sender] });
      return true;
    }
  }

  if (isQuotingGame) {
    await m.react("❌");
    await m.reply(`¡Tett!❌Hermano, he estado pensando en esto por un tiempo.😂🧠`);
    return true;
  }

  await m.react("❌");
  return false;
}

function getSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (longer.length - costs[shorter.length]) / longer.length;
}

exports.config = pluginConfig; exports.handler = handler; exports.family100AnswerHandler = family100AnswerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
