"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

var _ourin = require('ourin');
var _ourinserializejs = require('./lib/ourin-serialize.js');
var _ourincontextjs = require('./lib/ourin-context.js');






var _ourinpluginsjs = require('./lib/ourin-plugins.js');



var _ourinsimilarityjs = require('./lib/ourin-similarity.js');
var _ourindatabasejs = require('./lib/ourin-database.js');




var _ourinformatterjs = require('./lib/ourin-formatter.js');
var _connectionjs = require('./connection.js');
var _ourinloggerjs = require('./lib/ourin-logger.js');









var _ourinlidjs = require('./lib/ourin-lid.js');
var _ouringamedatajs = require('./lib/ourin-game-data.js');





var _ourinmiddlewarejs = require('./lib/ourin-middleware.js');












var _ouringroupprotectionjs = require('./lib/ourin-group-protection.js');





var _ourinperformancejs = require('./lib/ourin-performance.js');




var _ourinjadibotdatabasejs = require('./lib/ourin-jadibot-database.js');
var _ourinjadibotmanagerjs = require('./lib/ourin-jadibot-manager.js');
var _ourinjs = require('../case/ourin.js');
var _ratelimiterflexible = require('rate-limiter-flexible');
var _ouringamesjs = require('./lib/ourin-games.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _child_process = require('child_process');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourintimejs = require('./lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _sharp = require('sharp'); var _sharp2 = _interopRequireDefault(_sharp);
const safe = (fn) => {
  try {
    return fn();
  } catch (e2) {
    return null;
  }
};

let FormData,
  levelHelper,
  handleBuyerDone,
  registrationAnswerHandler,
  dungeonAnswerHandler,
  kyubigameAnswerHandler,
  family100AnswerHandler,
  pushkontakAnswerHandler,
  anticustomReplyHandler,
  dafontAnswerHandler,
  gantiAssetAnswerHandler,
  srtAnswerHandler,
  checkAfk,
  isMuted,
  detectBot,
  autoStickerHandler,
  autoMediaHandler,
  checkAntidocument,
  checkAntisticker,
  checkAntimedia,
  ytmp4Plugin,
  confessPlugin,
  sulapPlugin,
  handleAutoAI,
  handleAutoDownload,
  checkStickerCommand,
  handleStickerReply,
  sendWelcomeMessage,
  sendGoodbyeMessage,
  autoJoinDetector,
  isMutedMember,
  isMutegc,
  resepAnswerHandler,
  stickerlyAnswerHandler,
  caiAnswerHandler,
  caiChatHandler,
  comparationAnswerHandler;

try {
  FormData = (_interopRequireWildcard(require("form-data"))).default || (_interopRequireWildcard(require("form-data")));
} catch (e3) { }
try {
  levelHelper = _interopRequireWildcard(require("./lib/ourin-level.js"));
} catch (e4) { }
try {
  handleBuyerDone = (_interopRequireWildcard(require("../plugins/store/done.js"))).handleBuyerDone;
} catch (e5) { }
try {
  registrationAnswerHandler = (_interopRequireWildcard(require("../plugins/user/daftar.js")))
    .registrationAnswerHandler;
} catch (e6) { }
try {
  dungeonAnswerHandler = (_interopRequireWildcard(require("../plugins/game/dungeon.js")))
    .dungeonAnswerHandler;
} catch (e7) { }
try {
  kyubigameAnswerHandler = (_interopRequireWildcard(require("../plugins/game/kyubigame.js")))
    .kyubigameAnswerHandler;
} catch (e8) { }
try {
  family100AnswerHandler = (_interopRequireWildcard(require("../plugins/game/family100.js")))
    .family100AnswerHandler;
} catch (e9) { }
try {
  pushkontakAnswerHandler = (
    _interopRequireWildcard(require("../plugins/pushkontak/pushkontak.js"))
  ).pushkontakAnswerHandler;
} catch (e10) { }
try {
  anticustomReplyHandler = (_interopRequireWildcard(require("../plugins/group/anticustom.js")))
    .replyHandler;
} catch (e11) { }
try {
  dafontAnswerHandler = (_interopRequireWildcard(require("../plugins/tools/dafont.js")))
    .dafontAnswerHandler;
} catch (e12) { }
try {
  gantiAssetAnswerHandler = (_interopRequireWildcard(require("../plugins/owner/ganti-asset.js")))
    .gantiAssetAnswerHandler;
  srtAnswerHandler = (_interopRequireWildcard(require("../plugins/owner/srt.js")))
    .srtAnswerHandler;
} catch (e) { }
try {
  resepAnswerHandler = (_interopRequireWildcard(require("../plugins/search/resep.js")))
    .resepAnswerHandler;
} catch (e13) { }
try {
  stickerlyAnswerHandler = (_interopRequireWildcard(require("../plugins/sticker/stickerly.js")))
    .stickerlyAnswerHandler;
} catch (e14) { }
try {
  const caiPlugin = _interopRequireWildcard(require("../plugins/ai/characterai.js"));
  caiAnswerHandler = caiPlugin.caiAnswerHandler;
  caiChatHandler = caiPlugin.caiChatHandler;
} catch (e15) { }
try {
  comparationAnswerHandler = (_interopRequireWildcard(require("../plugins/search/comparation.js")))
    .comparationAnswerHandler;
} catch (e16) { }
try {
  checkAfk = (_interopRequireWildcard(require("../plugins/group/afk.js"))).checkAfk;
} catch (e17) { }
try {
  isMuted = (_interopRequireWildcard(require("../plugins/group/mute.js"))).isMuted;
} catch (e18) { }
try {
  isMutedMember = (_interopRequireWildcard(require("../plugins/group/mutemember.js")))
    .isMutedMember;
} catch (e19) { }
try {
  isMutegc = (_interopRequireWildcard(require("../plugins/group/mutegc.js"))).isMutegc;
} catch (e20) { }
try {
  detectBot = (_interopRequireWildcard(require("../plugins/group/antibot.js"))).detectBot;
} catch (e21) { }
try {
  autoStickerHandler = (_interopRequireWildcard(require("../plugins/group/autosticker.js")))
    .autoStickerHandler;
} catch (e22) { }
try {
  autoMediaHandler = (_interopRequireWildcard(require("../plugins/group/automedia.js")))
    .autoMediaHandler;
} catch (e23) { }
try {
  checkAntidocument = (_interopRequireWildcard(require("../plugins/group/antidocument.js")))
    .checkAntidocument;
} catch (e24) { }
try {
  checkAntisticker = (_interopRequireWildcard(require("../plugins/group/antisticker.js")))
    .checkAntisticker;
} catch (e25) { }
try {
  checkAntimedia = (_interopRequireWildcard(require("../plugins/group/antimedia.js")))
    .checkAntimedia;
} catch (e26) { }
try {
  ytmp4Plugin = _interopRequireWildcard(require("../plugins/download/ytmp4.js"));
} catch (e27) { }
try {
  confessPlugin = _interopRequireWildcard(require("../plugins/fun/confess.js"));
} catch (e28) { }
try {
  sulapPlugin = _interopRequireWildcard(require("../plugins/fun/sulap.js"));
} catch (e29) { }
try {
  handleAutoAI = (_interopRequireWildcard(require("./lib/ourin-auto-ai.js"))).handleAutoAI;
} catch (e30) { }
try {
  handleAutoDownload = (_interopRequireWildcard(require("./lib/ourin-auto-download.js")))
    .handleAutoDownload;
} catch (e31) { }
try {
  checkStickerCommand = (_interopRequireWildcard(require("./lib/ourin-sticker-command.js")))
    .checkStickerCommand;
} catch (e32) { }
try {
  handleStickerReply = (_interopRequireWildcard(require("./lib/ourin-sticker-reply.js")))
    .handleStickerReply;
} catch (e33) { }
try {
  sendWelcomeMessage = (_interopRequireWildcard(require("../plugins/group/welcome.js")))
    .sendWelcomeMessage;
} catch (e34) { }
try {
  sendGoodbyeMessage = (_interopRequireWildcard(require("../plugins/group/goodbye.js")))
    .sendGoodbyeMessage;
} catch (e35) { }
try {
  autoJoinDetector = (_interopRequireWildcard(require("../plugins/owner/autojoingc.js")))
    .autoJoinDetector;
} catch (e36) { }

let checkSpam = null,
  handleSpamAction = null;
try {
  const m = _interopRequireWildcard(require("../plugins/group/antispam.js"));
  checkSpam = m.checkSpam;
  handleSpamAction = m.handleSpamAction;
} catch (e37) { }

let checkSlowmode = null,
  incrementChatCount = null;
try {
  checkSlowmode = (_interopRequireWildcard(require("../plugins/group/slowmode.js"))).checkSlowmode;
} catch (e38) { }
try {
  incrementChatCount = (_interopRequireWildcard(require("../plugins/group/topchat.js")))
    .incrementChatCount;
} catch (e39) { }

let isToxic = null,
  handleToxicMessage = null;
try {
  const m = _interopRequireWildcard(require("../plugins/group/antitoxic.js"));
  isToxic = m.isToxic;
  handleToxicMessage = m.handleToxicMessage;
} catch (e40) { }

const spamDelayTracker = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of spamDelayTracker) {
    if (now - v > 15000) spamDelayTracker.delete(k);
  }
}, 30000);

let _smartTriggerThumb = undefined;
async function getSmartTriggerThumb() {
  if (_smartTriggerThumb !== undefined) return _smartTriggerThumb;
  try {
    const url = _configjs2.default.assets["ourin2"];
    if (url) {
      _smartTriggerThumb = _fs2.default.readFileSync(url)
    } else {
      _smartTriggerThumb = null;
    }
  } catch (e41) {
    _smartTriggerThumb = null;
  }
  return _smartTriggerThumb;
}

const globalRateLimiter = new (0, _ratelimiterflexible.RateLimiterMemory)({
  points: 8,
  duration: 3,
  blockDuration: 2,
});

const cachedGamePlugins = new Map();

try {
  const gameDir = _path2.default.join(process.cwd(), "plugins", "game");
  const gameFiles = _fs2.default
    .readdirSync(gameDir)
    .filter((f) => f.endsWith(".js") && !f.startsWith("_"));
  for (const file of gameFiles) {
    try {
      const plugin = _interopRequireWildcard(require(`. / plugins / juego /${file}`));
      const name = file.replace(".js", "");
      if (plugin.answerHandler) cachedGamePlugins.set(name, plugin);
    } catch (e42) { }
  }
} catch (e43) { }

async function handleGameAnswer(m, sock) {
  try {
    if (_optionalChain([sulapPlugin, 'optionalAccess', _ => _.answerHandler])) {
      const handled = await sulapPlugin.answerHandler(m, sock);
      if (handled) return true;
    }

    const utPlugin = cachedGamePlugins.get('ulartangga');
    if (_optionalChain([utPlugin, 'optionalAccess', _2 => _2.answerHandler])) {
      if (await utPlugin.answerHandler(m, sock)) return true;
    }

    const tttPlugin = cachedGamePlugins.get('tictactoe');
    if (_optionalChain([tttPlugin, 'optionalAccess', _3 => _3.answerHandler])) {
      if (await tttPlugin.answerHandler(m, sock)) return true;
    }

    const suitPlugin = cachedGamePlugins.get('suitpvp');
    if (_optionalChain([suitPlugin, 'optionalAccess', _4 => _4.answerHandler])) {
      if (await suitPlugin.answerHandler(m, sock)) return true;
    }

    if (!_ouringamedatajs.hasActiveSession.call(void 0, m.chat)) return false;

    const session = _ouringamedatajs.getSession.call(void 0, m.chat);
    if (!session) return false;

    const targeted = cachedGamePlugins.get(session.gameType);
    if (targeted) {
      const handled = await targeted.answerHandler(m, sock);
      if (handled) return true;
    }
  } catch (e44) { }
  return false;
}

async function handleSmartTriggers(m, sock, db) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();

  const firstWord = text.split(" ")[0];
  if (
    /^[\.\/\!\#\-]?(autoreply|ar|smarttrigger|smarttriggers)$/.test(firstWord)
  ) {
    return false;
  }

  if (text === "done") {
    const sessions = db.setting("transactionSessions") || {};
    if (sessions[m.sender]) {
      try {
        if (handleBuyerDone) {
          const session = sessions[m.sender];
          await handleBuyerDone(m, sock, session);
          delete sessions[m.sender];
          db.setting("transactionSessions", sessions);
          await db.save();
          return true;
        }
      } catch (e) {
        console.error("[Handler] Done trigger error:", e.message);
      }
    }
  }

  const globalSmartTriggers =
    _nullishCoalesce(_nullishCoalesce(db.setting("smartTriggers"), () => ( _optionalChain([_configjs2.default, 'access', _5 => _5.features, 'optionalAccess', _6 => _6.smartTriggers]))), () => ( false));

  try {
    const saluranId = _optionalChain([_configjs2.default, 'access', _7 => _7.saluran, 'optionalAccess', _8 => _8.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _9 => _9.saluran, 'optionalAccess', _10 => _10.name]) || _optionalChain([_configjs2.default, 'access', _11 => _11.bot, 'optionalAccess', _12 => _12.name]) || "Ourin-AI";
    const botName = _optionalChain([_configjs2.default, 'access', _13 => _13.bot, 'optionalAccess', _14 => _14.name]) || "Ourin-AI";

    let isAutoreplyEnabled = globalSmartTriggers;

    const processCustomReply = async (replyItem) => {
      let replyText = (replyItem.reply || "")
        .replace(/{name}/g, m.pushName || "User")
        .replace(/{tag}/g, `@${m.sender.split("@")[0]}`)
        .replace(/{sender}/g, m.sender.split("@")[0])
        .replace(/{botname}/g, _optionalChain([_configjs2.default, 'access', _15 => _15.bot, 'optionalAccess', _16 => _16.name]) || "♪")
        .replace(/{time}/g, timeHelper.formatTime("HH:mm:ss"))
        .replace(/{date}/g, timeHelper.formatDate("DD MMMM YYYY"));

      const mentions = replyText.includes(`@${m.sender.split("@")[0]}`)
        ? [m.sender]
        : [];

      if (replyItem.image && _fs2.default.existsSync(replyItem.image)) {
        const imageBuffer = _fs2.default.readFileSync(replyItem.image);
        await sock.sendMedia(m.chat, imageBuffer, replyText, m, {
          mentions: mentions,
          type: "image",
        });
      } else {
        await m.reply(replyText, { mentions: mentions });
      }
      return true;
    };

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      isAutoreplyEnabled = _nullishCoalesce(groupData.autoreply, () => ( globalSmartTriggers));

      if (isAutoreplyEnabled) {
        let customReplies = groupData.customReplies || [];
        if (!Array.isArray(customReplies)) {
          customReplies = [];
          db.setGroup(m.chat, { customReplies });
        }
        for (const replyItem of customReplies) {
          if (!_optionalChain([replyItem, 'optionalAccess', _17 => _17.trigger])) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }

        const globalCustomReplies = db.setting("globalCustomReplies") || [];
        for (const replyItem of globalCustomReplies) {
          if (!_optionalChain([replyItem, 'optionalAccess', _18 => _18.trigger])) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }
      }
    } else {
      const privateAutoreply = _nullishCoalesce(db.setting("autoreplyPrivate"), () => ( false));
      if (!privateAutoreply && !globalSmartTriggers) return false;
      isAutoreplyEnabled = privateAutoreply || globalSmartTriggers;

      if (isAutoreplyEnabled) {
        const globalCustomReplies = db.setting("globalCustomReplies") || [];
        for (const replyItem of globalCustomReplies) {
          if (!_optionalChain([replyItem, 'optionalAccess', _19 => _19.trigger])) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }
      }
    }

    if (!isAutoreplyEnabled) return false;

    const botJid = _optionalChain([sock, 'access', _20 => _20.user, 'optionalAccess', _21 => _21.id]);
    const isMentioned = _optionalChain([m, 'access', _22 => _22.mentionedJid, 'optionalAccess', _23 => _23.some, 'call', _24 => _24(
      (jid) => jid === botJid || _optionalChain([jid, 'optionalAccess', _25 => _25.includes, 'call', _26 => _26(_optionalChain([sock, 'access', _27 => _27.user, 'optionalAccess', _28 => _28.id, 'optionalAccess', _29 => _29.split, 'call', _30 => _30(":"), 'access', _31 => _31[0]]))]),
    )]);

    const thumbBuffer = await getSmartTriggerThumb();

    const contextInfos = _ourincontextjs.saluranCtx.call(void 0, );

    if (isMentioned) {
      await m.reply(
        `Hay algo llamado${botName}?
        
What 's wrong with my name @${m.sender.split("@")[0]}?`,
        { mentions: [m.sender] },
      );
      return true;
    }

    if (_optionalChain([text, 'optionalAccess', _32 => _32.toLowerCase, 'call', _33 => _33()]) === "p") {
      await m.reply(
        `Hola @${m.sender.split("@")[0]}fontcolor = " # FFFF00 ", forfirmeatSalam fontcolor = " # FFFF00 " yaahh`,
        { mentions: [m.sender] },
      );
      return true;
    }

    if (_optionalChain([text, 'optionalAccess', _34 => _34.toLowerCase, 'call', _35 => _35()]) === "bot") {
      await m.reply(`Hola @${m.sender.split("@")[0]}, ${botName}Activo✅`, {
        mentions: [m.sender],
      });
      return true;
    }

    if (_optionalChain([text, 'optionalAccess', _36 => _36.toLowerCase, 'call', _37 => _37(), 'optionalAccess', _38 => _38.includes, 'call', _39 => _39("assalamualaikum")])) {
      await m.reply(`Waaalaikumssalam @${m.sender.split("@")[0]}`, {
        mentions: [m.sender],
      });
      return true;
    }

    if (_optionalChain([text, 'optionalAccess', _40 => _40.toLowerCase, 'call', _41 => _41(), 'optionalAccess', _42 => _42.includes, 'call', _43 => _43("hallo")])) {
      await m.reply(`Hola también hermano @${m.sender.split("@")[0]}`, {
        mentions: [m.sender],
      });
      return true;
    }
  } catch (error) {
    console.error("[SmartTriggers] Error:", error.message);
  }

  return false;
}

/**
* Comprobar si el usuario está siendo spam
 * @param {string} jid - JID user
* @ devolver{boolean}Cierto cuando se trata de spam
 */
async function isSpamming(jid) {
  if (!_optionalChain([_configjs2.default, 'access', _44 => _44.features, 'optionalAccess', _45 => _45.antiSpam])) return false;

  try {
    await globalRateLimiter.consume(jid);
    return false;
  } catch (e45) {
    return true;
  }
}

/**
* Manejador principal para procesar mensajes
* @ param{Object}msg - Mensaje bruto de Baileys
 * @param {Object} sock - Socket connection
 * @returns {Promise<void>}
 * @example
 * sock.ev.on('messages.upsert', async ({ messages }) => {
 *   await messageHandler(messages[0], sock);
 * });
 */
async function messageHandler(msg, sock, options = {}) {
  const isJadibot = options.isJadibot || false;
  try {
    let m;
    try {
      m = await _ourinserializejs.serialize.call(void 0, sock, msg);
    } catch (serializeErr) {
      return;
    }

    if (!m) return;
    if (!m.message) return;
    if (!m.sender) m.sender = m.chat || "";

    if (_optionalChain([global, 'access', _46 => _46.giveawaySessions, 'optionalAccess', _47 => _47.has, 'call', _48 => _48(m.sender)])) {
      try {
        const { handleSession: gaHandler } =
          _interopRequireWildcard(require("../plugins/group/giveaway.js"));
        const gaHandled = await gaHandler(m, sock);
        if (gaHandled) return;
      } catch (e) { }
    }

    if (_optionalChain([m, 'access', _49 => _49.message, 'optionalAccess', _50 => _50.stickerPackMessage]) && sock.saveStickerPack) {
      try {
        const packMsg = m.message.stickerPackMessage;
        const packId = packMsg.stickerPackId || m.id;
        const packName = packMsg.name || "Unknown Pack";
        sock.saveStickerPack(packId, { stickerPackMessage: packMsg }, packName);
      } catch (e) { }
    }

    const db = _ourindatabasejs.getDatabase.call(void 0, );
    if (!_optionalChain([db, 'optionalAccess', _51 => _51.ready])) {
      return;
    }

    if (!m.isBot && m.sender && m.isGroup) {
      let contacts = db.setting("contacts") || {};
      const currentName = m.pushName;
      if (currentName && currentName !== "User" && currentName !== "Unknown" && currentName !== "~ User") {
        if (!contacts[m.sender] || contacts[m.sender].name !== currentName) {
          contacts[m.sender] = {
            jid: m.sender,
            name: currentName
          };
          db.setting("contacts", contacts);
        }
      }

      const ownerNumbers = (global.owner || []).map(o => typeof o === "string" ? o.replace(/[^0-9]/g, "") : String(o));
      const senderNumber = m.sender.replace(/[^0-9]/g, "");
      const isOwnerUser = m.isOwner || ownerNumbers.includes(senderNumber);

      if (isOwnerUser) {
        const groupData = db.getGroup(m.chat);
        if (groupData && groupData.autoSambut && groupData.autoSambut.enabled) {
          const ownerId = m.sender;
          const lastChat = _optionalChain([groupData, 'access', _52 => _52.autoSambut, 'access', _53 => _53.lastChats, 'optionalAccess', _54 => _54[ownerId]]) || 0;
          const delayMs = groupData.autoSambut.delayMs || (groupData.autoSambut.delay ? groupData.autoSambut.delay * 3600000 : 7200000);
          const now = Date.now();

          if (lastChat > 0 && (now - lastChat >= delayMs)) {
            if (groupData.autoSambut.pesan !== undefined && !groupData.autoSambut.pesanList) {
              groupData.autoSambut.pesanList = [groupData.autoSambut.pesan];
            }

            const pList = groupData.autoSambut.pesanList || ["Hola{user}¡Bienvenido!🙇‍♂♪"];
            const randomMsg = pList[Math.floor(Math.random() * pList.length)];

            let sambutan = randomMsg
              .replace(/{name}/gi, m.pushName || "Propietario")
              .replace(/{user}/gi, `@${ownerId.split('@')[0]}`);

            m.reply(sambutan, { mentions: [ownerId] }).catch(() => { });
          }

          if (!groupData.autoSambut.lastChats) groupData.autoSambut.lastChats = {};
          groupData.autoSambut.lastChats[ownerId] = now;
          db.setGroup(m.chat, { autoSambut: groupData.autoSambut });
        }
      }
    }

    const jadibotId = options.jadibotId || null;
    if (isJadibot && jadibotId) {
      const botJid = _optionalChain([sock, 'access', _55 => _55.user, 'optionalAccess', _56 => _56.id, 'optionalAccess', _57 => _57.split, 'call', _58 => _58(":"), 'access', _59 => _59[0]]) + "@s.whatsapp.net";
      const senderNum = _optionalChain([m, 'access', _60 => _60.sender, 'optionalAccess', _61 => _61.replace, 'call', _62 => _62(/[^0-9]/g, "")]) || "";
      const botNum = botJid.replace(/[^0-9]/g, "");
      m.isOwner = _ourinjadibotdatabasejs.isJadibotOwner.call(void 0, jadibotId, m.sender) || senderNum === botNum;
      m.isPremium = _ourinjadibotdatabasejs.isJadibotPremium.call(void 0, jadibotId, m.sender) || m.isOwner;
    }

    if (_optionalChain([_configjs2.default, 'access', _63 => _63.features, 'optionalAccess', _64 => _64.logMessage])) {
      let groupName = "PRIVATE";
      if (m.isGroup) {
        const groupData = db.getGroup(m.chat);
        groupName = _optionalChain([groupData, 'optionalAccess', _65 => _65.name]) || "Unknown Group";
        if (groupName === "Unknown Group" || groupName === "Unknown") {
          sock
            .groupMetadata(m.chat)
            .then((meta) => {
              if (_optionalChain([meta, 'optionalAccess', _66 => _66.subject])) db.setGroup(m.chat, { name: meta.subject });
            })
            .catch(() => { });
        }
      }

      if (!isJadibot) {
        const deviceHint =
          _optionalChain([m, 'access', _67 => _67.key, 'optionalAccess', _68 => _68.id, 'optionalAccess', _69 => _69.length]) > 22
            ? "Android"
            : _optionalChain([m, 'access', _70 => _70.key, 'optionalAccess', _71 => _71.id, 'optionalAccess', _72 => _72.startsWith, 'call', _73 => _73("3EB0")])
              ? "iPhone"
              : _optionalChain([m, 'access', _74 => _74.key, 'optionalAccess', _75 => _75.id, 'optionalAccess', _76 => _76.startsWith, 'call', _77 => _77("BAE5")])
                ? "Web"
                : null;
        _ourinloggerjs.logMessage.call(void 0, {
          chatType: m.isNewsletter
            ? "newsletter"
            : m.isGroup
              ? "group"
              : "private",
          groupName: m.isNewsletter ? "Channel" : groupName,
          pushName: m.pushName,
          sender: m.sender,
          message: m.body,
          messageType: m.type,
          device: deviceHint || "Unknown",
          isForwarded: _optionalChain([m, 'access', _78 => _78.message, 'optionalAccess', _79 => _79[m.type], 'optionalAccess', _80 => _80.contextInfo, 'optionalAccess', _81 => _81.isForwarded]) || false,
          isNewsletter:
            m.isNewsletter ||
            !!_optionalChain([m, 'access', _82 => _82.message, 'optionalAccess', _83 => _83[m.type], 'optionalAccess', _84 => _84.contextInfo, 'optionalAccess', _85 => _85.forwardedNewsletterMessageInfo]),
          isOwner: m.isOwner,
          isPremium: m.isPremium,
          isPartner: m.isPartner,
          isAdmin: m.isAdmin,
          device: deviceHint,
        });
      }
    }

    if (checkAfk) {
      checkAfk(m, sock).catch(() => { });
    }

    if (m.isGroup && !m.isNewsletter) {
      _ouringroupprotectionjs.cacheMessageForAntiRemove.call(void 0, m, sock, db);

      const antiJudolTriggered = await _ouringroupprotectionjs.handleAntiJudol.call(void 0, m, sock, db);
      if (antiJudolTriggered) return;

      const antiPhisingTriggered = await _ouringroupprotectionjs.handleAntiPhising.call(void 0, m, sock, db);
      if (antiPhisingTriggered) return;

      const antiCustomTriggered = await _ouringroupprotectionjs.handleAntiCustom.call(void 0, m, sock, db);
      if (antiCustomTriggered) return;

      const antilinkTriggered = await _ouringroupprotectionjs.handleAntilink.call(void 0, m, sock, db);
      if (antilinkTriggered) return;

      const antilinkGcTriggered = await _ouringroupprotectionjs.handleAntilinkGc.call(void 0, m, sock, db);
      if (antilinkGcTriggered) return;

      const antilinkAllTriggered = await _ouringroupprotectionjs.handleAntilinkAll.call(void 0, m, sock, db);
      if (antilinkAllTriggered) return;

      const antiHidetagTriggered = await _ouringroupprotectionjs.handleAntiHidetag.call(void 0, m, sock, db);
      if (antiHidetagTriggered) return;

      const antiSwGcTriggered = await _ouringroupprotectionjs.handleAntiSwGc.call(void 0, m, sock, db);
      if (antiSwGcTriggered) return;

      if (checkAntidocument) {
        const isAntidocument = await checkAntidocument(m, sock, db);
        if (isAntidocument) return;
      }

      if (detectBot && !m.isOwner && !m.isAdmin) {
        try {
          const botDetected = await detectBot(m, sock);
          if (botDetected) return;
        } catch (e) { }
      }

      if (isMuted && !m.isAdmin && !m.isOwner) {
        try {
          if (isMuted(m.chat, db)) {
            if (m.isBotAdmin) await sock.sendMessage(m.chat, { delete: m.key });
            return;
          }
        } catch (e) { }
      }

      if (isMutedMember && !m.isAdmin && !m.isOwner) {
        try {
          if (isMutedMember(m.chat, m.sender, db)) {
            if (m.isBotAdmin) await sock.sendMessage(m.chat, { delete: m.key });
            return;
          }
        } catch (e) { }
      }

      if (isMutegc && !m.isAdmin && !m.isOwner && !m.isPartner) {
        try {
          if (isMutegc(m.chat, db)) return;
        } catch (e) { }
      }

      if (checkSpam && handleSpamAction && !m.isAdmin) {
        try {
          const isSpam = await checkSpam(m, sock, db);
          if (isSpam) {
            const delayKey = `${m.chat}_${m.sender}`;
            spamDelayTracker.set(delayKey, Date.now());
            await handleSpamAction(m, sock, db);
          }
        } catch (e) { }
      }

      if (checkSlowmode && !m.isAdmin && !m.isOwner) {
        try {
          const slowResult = checkSlowmode(m, sock, db);
          if (slowResult) {
            if (slowResult.mode === "onlycommand") {
              if (m.isCommand) return;
            } else {
              await sock.sendMessage(m.chat, { delete: m.key });
              return;
            }
          }
        } catch (e) { }
      }

      if (isToxic && handleToxicMessage) {
        try {
          const groupData = db.getGroup(m.chat) || {};
          if (groupData.antitoxic && !m.isAdmin && !m.isOwner) {
            const toxicWords = groupData.toxicWords || [];
            const result = isToxic(m.body, toxicWords);
            if (result.toxic) {
              await handleToxicMessage(m, sock, db, result.word);
              return;
            }
          }
        } catch (e) { }
      }
    }

    if (m.isGroup && incrementChatCount) {
      try {
        incrementChatCount(m.chat, m.sender, db, m.pushName);
      } catch (e) { }
    }

    const modeCheck = _ourinmiddlewarejs.checkMode.call(void 0, m, _ourinjadibotmanagerjs.getActiveJadibots);
    if (!modeCheck.allowed) {
      if (modeCheck.isAfk && m.isCommand) {
        await m.reply(modeCheck.afkMessage);
      } else if (modeCheck.hasJadibots && m.isCommand && !isJadibot) {
        await sock.sendMessage(
          m.chat,
          {
            text: modeCheck.jadibotMessage,
            contextInfo: {
              ..._ourincontextjs.saluranCtx.call(void 0, ),
              mentionedJid: modeCheck.jadibotMentions,
            },
          },
          { quoted: m },
        );
      } else if (modeCheck.isOnlyThisGroup && m.isCommand) {
        await m.reply(modeCheck.onlyThisGroupMessage);
      }
      return;
    }

    if (m.isBanned) {
      if (m.isCommand) {
        await m
          .reply(
            _optionalChain([_configjs2.default, 'access', _86 => _86.messages, 'optionalAccess', _87 => _87.banned]) ||
            "🚫* Eres beligerante de usar estas botas. *",
          )
          .catch(() => { });
      }
      _ourinloggerjs.logger.warn("Banned user", m.sender);
      return;
    }

    if (m.isGroup && m.isCommand && !m.isOwner) {
      const groupData = db.getGroup(m.chat) || {};
      if (groupData.isBanned) {
        //¿Quieres comer?xt también ok hermano, mse respuesta o enviarMessage
        return;
      }
    }

    const botId = _optionalChain([sock, 'access', _88 => _88.user, 'optionalAccess', _89 => _89.id, 'optionalAccess', _90 => _90.split, 'call', _91 => _91(":"), 'access', _92 => _92[0]]) || "unknown";
    const msgKey = `${botId}_${m.chat}_${m.sender}_${m.id}`;
    if (_ourinperformancejs.debounceMessage.call(void 0, msgKey)) {
      return;
    }

    if (_nullishCoalesce(db.setting("autoRead"), () => ( _optionalChain([_configjs2.default, 'access', _93 => _93.features, 'optionalAccess', _94 => _94.autoRead])))) {
      sock.readMessages([m.key]).catch(() => { });
    }
    if (!m.pushName || m.pushName === "Unknown" || m.pushName.trim() === "") {
      if (!m.isCommand && !m.isBot && !m.fromMe && !m.isNewsletter) {
        return;
      }
      m.pushName = m.isNewsletter
        ? "Channel"
        : _optionalChain([m, 'access', _95 => _95.sender, 'optionalAccess', _96 => _96.split, 'call', _97 => _97("@"), 'access', _98 => _98[0]]) || "User";
    }

    const registrationNameRequired =
      _nullishCoalesce(_nullishCoalesce(db.setting("registrationRequired"), () => (
      _optionalChain([_configjs2.default, 'access', _99 => _99.registration, 'optionalAccess', _100 => _100.enabled]))), () => (
      false));
    const registrationNameUser = db.getUser(m.sender);
    if (
      registrationNameRequired &&
      _optionalChain([registrationNameUser, 'optionalAccess', _101 => _101.isRegistered]) &&
      _optionalChain([registrationNameUser, 'optionalAccess', _102 => _102.regName])
    ) {
      m.originalPushName = m.pushName;
      m.pushName = registrationNameUser.regName;
    }

    if (m.isCommand) {
      db.setUser(m.sender, {
        name: m.originalPushName || m.pushName,
        lastSeen: new Date().toISOString(),
      });
    }

    const cmdVnEnabled = db.setting("cmdVn") || false;
    if (
      cmdVnEnabled &&
      m.type === "audioMessage" &&
      !m.isCommand &&
      _optionalChain([_configjs2.default, 'access', _103 => _103.APIkey, 'optionalAccess', _104 => _104.groq])
    ) {
      let inputFile = null;
      let wavFile = null;
      const cleanupCmdVnFiles = () => {
        [inputFile, wavFile].forEach((filePath) => {
          if (!filePath) return;
          try {
            if (_fs2.default.existsSync(filePath)) _fs2.default.unlinkSync(filePath);
          } catch (e46) { }
        });
      };
      try {
        const audioMsg = _optionalChain([m, 'access', _105 => _105.message, 'optionalAccess', _106 => _106.audioMessage]);
        const maxSize = 500 * 1024;
        if (
          audioMsg &&
          (!audioMsg.fileLength || audioMsg.fileLength <= maxSize)
        ) {
          const buffer = await m.download();
          if (buffer && buffer.length > 1000) {
            const tmpDir = _path2.default.join(process.cwd(), "tmp");
            if (!_fs2.default.existsSync(tmpDir))
              _fs2.default.mkdirSync(tmpDir, { recursive: true });

            inputFile = _path2.default.join(tmpDir, `vncmd_${Date.now()}.ogg`);
            wavFile = _path2.default.join(tmpDir, `vncmd_${Date.now()}.wav`);

            _fs2.default.writeFileSync(inputFile, buffer);

            await new Promise((resolve, reject) => {
              _child_process.exec.call(void 0, 
                `ffmpeg -y -i "${inputFile}" -ar 16000 -ac 1 -f wav "${wavFile}"`,
                { timeout: 15000 },
                (err) => (err ? reject(err) : resolve()),
              );
            });

            const wavBuffer = _fs2.default.readFileSync(wavFile);
            const form = new FormData();
            form.append("file", wavBuffer, {
              filename: "audio.wav",
              contentType: "audio/wav",
            });
            form.append("model", "whisper-large-v3");
            form.append("language", "id");
            form.append("response_format", "json");

            const { data } = await _axios2.default.post(
              "https://api.groq.com/openai/v1/audio/transcriptions",
              form,
              {
                headers: {
                  ...form.getHeaders(),
                  Authorization: `Bearer ${_configjs2.default.APIkey.groq}`,
                },
                timeout: 30000,
                maxContentLength: Infinity,
              },
            );

            cleanupCmdVnFiles();
            inputFile = null;
            wavFile = null;

            const transcript = (data.text || "")
              .trim()
              .toLowerCase()
              .replace(/[.,!?;:'"]/g, "")
              .trim();

            if (transcript) {
              const words = transcript.split(/\s+/);
              const rawWord = words[0];
              const prefix = _optionalChain([_configjs2.default, 'access', _107 => _107.command, 'optionalAccess', _108 => _108.prefix]) || ".";

              const allPlugins = _ourinpluginsjs.getAllPlugins.call(void 0, );
              const allNames = [];
              for (const p of allPlugins) {
                if (_optionalChain([p, 'access', _109 => _109.config, 'optionalAccess', _110 => _110.name]) && typeof p.config.name === "string")
                  allNames.push(p.config.name.toLowerCase());
                if (Array.isArray(_optionalChain([p, 'access', _111 => _111.config, 'optionalAccess', _112 => _112.alias]))) {
                  for (const a of p.config.alias) {
                    if (a && typeof a === "string")
                      allNames.push(a.toLowerCase());
                  }
                }
              }

              let bestMatch = null;
              let bestScore = Infinity;

              for (const cmd of allNames) {
                if (cmd === rawWord) {
                  bestMatch = cmd;
                  bestScore = 0;
                  break;
                }
                if (rawWord.startsWith(cmd) && cmd.length >= 3) {
                  const score = rawWord.length - cmd.length;
                  if (score < bestScore) {
                    bestScore = score;
                    bestMatch = cmd;
                  }
                }
                const dist = _ourinmiddlewarejs.levenshtein.call(void 0, rawWord, cmd);
                if (dist <= 3 && dist < bestScore) {
                  bestScore = dist;
                  bestMatch = cmd;
                }
              }

              if (bestMatch) {
                const commandArgs = words.slice(1).join(" ");
                m.body = `${prefix}${bestMatch}${commandArgs ? " " + commandArgs : ""}`;
                const { parseCommand } =
                  _interopRequireWildcard(require("./lib/ourin-serialize.js"));
                const parsed = parseCommand(m.body, prefix);
                m.isCommand = parsed.isCommand;
                m.command = parsed.command;
                m.args = parsed.args;
                m.prefix = parsed.prefix;
                m.isVnCommand = true;
              }
            }
          }
        }
      } catch (e) {
        cleanupCmdVnFiles();
        console.error("[CMD VN] Error:", e.message);
      }
    }

    if (m.body) {
      try {
        const userObj = db.getUser(m.sender) || db.setUser(m.sender);

        if (levelHelper && levelHelper.addExpWithLevelCheck) {
          await levelHelper.addExpWithLevelCheck(sock, m, db, userObj, 15);
        }
      } catch (e) {
        console.error("[Level System] Error:", e.message);
      }
    }

    if (handleAutoAI && m.isGroup && !m.isCommand) {
      try {
        const aiHandled = await handleAutoAI(m, sock);
        if (aiHandled) return;
      } catch (e) { }
    }

    if (caiChatHandler && !m.isCommand && m.body) {
      try {
        const caiHandled = await caiChatHandler(m, sock);
        if (caiHandled) return;
      } catch (e) { }
    }

    if (handleAutoDownload && m.body) {
      try {
        handleAutoDownload(m, sock, m.body);
      } catch (e) { }
    }

    if (autoJoinDetector && m.body) {
      try {
        const joined = await autoJoinDetector(m, sock);
        if (joined) return;
      } catch (e) { }
    }

    if (_optionalChain([m, 'access', _113 => _113.body, 'optionalAccess', _114 => _114.startsWith, 'call', _115 => _115(">>")]) && m.isOwner) {
      const code = m.body.slice(2).trim();
      if (!code) return;

      try {
        const AsyncFunction = Object.getPrototypeOf(
          async function () { },
        ).constructor;

        const execCode = new AsyncFunction(
          "m",
          "sock",
          "db",
          "config",
          "getDatabase",
          "console",
          `
const { predeterminado: ax- Espera a importar.xios dhakum )
const { defoult: fs } = aghult importa ( spans )
{ defoust: path } = aghut import ( xenpath )
{ defoust: os } = aqaut important ( xenos }
          const { promisify } = await import('util')
          const { generateWAMessage, getBuffer, generateWAMessageFromContent, proto, generateMessageID } = await import('ourin')
          const { exec: childExec } = await import('child_process')
          const { VERSION, Button, ButtonV2, Carousel, AIRich, } = await import('./lib/ourin-builder.js')
          const exec = promisify(childExec)
          
          ${code}
          `,
        );

        const result = await execCode(
          m,
          sock,
          db,
          _configjs2.default,
          _ourindatabasejs.getDatabase,
          console,
        );

        if (result !== undefined && result !== null) {
          const output =
            typeof result === "object"
              ? JSON.stringify(result, null, 2)
              : String(result);

          if (output.length > 0) {
            await m.reply(
              `✅ *ᴇxᴇᴄ ʀᴇsᴜʟᴛ*\n\n\`\`\`\n${output.substring(0, 4000)}\n\`\`\``,
            );
          }
        }
      } catch (execError) {
        await m.reply(
          `❌ *ᴇxᴇᴄ ᴇʀʀᴏʀ*\n\n\`\`\`\n${execError.message}\n\nStack:\n${_optionalChain([execError, 'access', _116 => _116.stack, 'optionalAccess', _117 => _117.substring, 'call', _118 => _118(0, 1000)]) || "N/A"}\n\`\`\``,
        );
      }
      return;
    }

    if (_optionalChain([m, 'access', _119 => _119.body, 'optionalAccess', _120 => _120.startsWith, 'call', _121 => _121("!!")]) && m.isOwner) {
      const expr = m.body.slice(2).trim();
      if (!expr) return;

      try {
        const AsyncFunction = Object.getPrototypeOf(
          async function () { },
        ).constructor;

        const inspectCode = new AsyncFunction(
          "m",
          "sock",
          "db",
          "config",
          "getDatabase",
          "console",
          `
          const util = await import('util')
const { predeterminado: ax- Espera a importar.xios dhakum )
const { defoult: fs } = aghult importa ( spans )
{ defoust: path } = aghut import ( xenpath )
{ defoust: os } = aqaut important ( xenos }
          const { generateWAMessage, getBuffer, generateWAMessageFromContent, proto, generateMessageID } = await import('ourin')

          const result = await ${expr}
          if (result === undefined) return 'undefined'
          if (result === null) return 'null'
          if (typeof result === 'string') return result
          try {
 return util.inspect.predeterminado(result, { depth: 4, maxARRAYLLTH: 30, maxStringLength: 300, breakLength: 60, compacto: falso } )
          } catch {
            try { return JSON.stringify(result, null, 2) } catch { return String(result) }
          }
          `,
        );

        const output = await inspectCode(
          m,
          sock,
          db,
          _configjs2.default,
          _ourindatabasejs.getDatabase,
          console,
        );

        if (output && String(output).length > 0) {
          const str = String(output);
          await m.reply(
            `${str}`,
          );
        }
      } catch (inspectError) {
        await m.reply(
          `${inspectError.message}\n\`\`\``,
        );
      }
      return;
    }

    const hasSuitGame =
      global.suitGames &&
      Object.values(global.suitGames).some(
        (r) =>
          (r.chat === m.chat || !m.isGroup) && [r.p, r.p2].includes(m.sender),
      );

    const hasTTTGame =
      global.tictactoeGames &&
      Object.values(global.tictactoeGames).some(
        (r) =>
          r.state === "PLAYING" &&
          r.chat === m.chat &&
          [r.game.playerX, r.game.playerO].filter(Boolean).includes(m.sender),
      );

    const hasUTGame = _optionalChain([global, 'access', _122 => _122.ulartanggaGames, 'optionalAccess', _123 => _123[m.chat], 'optionalAccess', _124 => _124.status]) === "PLAYING";

    let gameEvaluated = false;
    if (
      (_ouringamedatajs.hasActiveSession.call(void 0, m.chat) && m.quoted) ||
      hasSuitGame ||
      hasTTTGame ||
      hasUTGame
    ) {
      gameEvaluated = true;
      const gameHandled = await handleGameAnswer(m, sock);
      if (gameHandled) return;
    }

    try {
      if (registrationAnswerHandler) {
        const handled = await registrationAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Registration answer error:", e.message);
    }

    try {
      if (dungeonAnswerHandler) {
        const handled = await dungeonAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Dungeon answer error:", e.message);
    }

    try {
      if (resepAnswerHandler) {
        const handled = await resepAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Resep answer error:", e.message);
    }

    try {
      if (stickerlyAnswerHandler) {
        const handled = await stickerlyAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Stickerly answer error:", e.message);
    }

    try {
      if (caiAnswerHandler) {
        const handled = await caiAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] CAI answer error:", e.message);
    }

    try {
      if (comparationAnswerHandler) {
        const handled = await comparationAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Comparation answer error:", e.message);
    }

    try {
      if (kyubigameAnswerHandler) {
        const handled = await kyubigameAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Kyubigame answer error:", e.message);
    }

    try {
      if (family100AnswerHandler) {
        const handled = await family100AnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Family100 answer error:", e.message);
    }

    try {
      if (pushkontakAnswerHandler) {
        const handled = await pushkontakAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Pushkontak answer error:", e.message);
    }

    try {
      if (dafontAnswerHandler) {
        const handled = await dafontAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Dafont answer error:", e.message);
    }

    try {
      if (gantiAssetAnswerHandler) {
        const handled = await gantiAssetAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] GantiAsset answer error:", e.message);
    }

    try {
      if (srtAnswerHandler) {
        const handled = await srtAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] SRT answer error:", e.message);
    }

    if (!m.isCommand) {
      if (_ouringamedatajs.hasActiveSession.call(void 0, m.chat) && !gameEvaluated) {
        gameEvaluated = true;
        const gameHandled = await handleGameAnswer(m, sock);
        if (gameHandled) return;
      }

      const smartHandled = await handleSmartTriggers(m, sock, db);
      if (smartHandled) return;

      if (_optionalChain([m, 'access', _125 => _125.quoted, 'optionalAccess', _126 => _126.id]) || _optionalChain([m, 'access', _127 => _127.quoted, 'optionalAccess', _128 => _128.key, 'optionalAccess', _129 => _129.id])) {
        try {
          if (anticustomReplyHandler) {
            const handled = await anticustomReplyHandler(m, { sock });
            if (handled) return;
          }
          if (
            _optionalChain([global, 'access', _130 => _130.confessData, 'optionalAccess', _131 => _131.has, 'call', _132 => _132(m.quoted.id)]) &&
            _optionalChain([confessPlugin, 'optionalAccess', _133 => _133.replyHandler])
          ) {
            const handled = await confessPlugin.replyHandler(m, { sock });
            if (handled) return;
          }
          if (
            _optionalChain([global, 'access', _134 => _134.sulapSessions, 'optionalAccess', _135 => _135.has, 'call', _136 => _136(m.quoted.id)]) &&
            _optionalChain([sulapPlugin, 'optionalAccess', _137 => _137.replyHandler])
          ) {
            const handled = await sulapPlugin.replyHandler(m, sock);
            if (handled) return;
          }
        } catch (e47) { }
      }

      if (autoStickerHandler && m.isGroup) {
        autoStickerHandler(m, sock).catch(() => { });
      }

      if (autoMediaHandler && m.isGroup) {
        autoMediaHandler(m, sock).catch(() => { });
      }

      if (checkAntisticker && m.isGroup) {
        const stickerHandled = await checkAntisticker(m, sock, db);
        if (stickerHandled) return;
      }

      if (checkAntimedia && m.isGroup) {
        const mediaHandled = await checkAntimedia(m, sock, db);
        if (mediaHandled) return;
      }

      if (handleStickerReply && m.isGroup) {
        const stickerReplyHandled = await handleStickerReply(m, sock);
        if (stickerReplyHandled) return;
      }

      if (checkStickerCommand) {
        try {
          const stickerCmd = checkStickerCommand(m);
          if (stickerCmd) {
            const prefix = m.prefix || _optionalChain([_configjs2.default, 'access', _138 => _138.command, 'optionalAccess', _139 => _139.prefix]) || ".";
            m.body = `${prefix}${stickerCmd}`;
            const { parseCommand } = _interopRequireWildcard(require("./lib/ourin-serialize.js"));
            const parsed = parseCommand(m.body, prefix);
            m.isCommand = parsed.isCommand;
            m.command = parsed.command;
            m.args = parsed.args;
            m.prefix = parsed.prefix;
          }
        } catch (e) {
          console.error("[Handler] Sticker command error:", e.message);
        }
      }

      if (!m.isCommand) return;
    }

    const delayKey = `${m.chat}_${m.sender}`;
    if (!m.isOwner && !m.isPremium) {
      const lastSpamDetect = spamDelayTracker.get(delayKey);
      if (lastSpamDetect) {
        const elapsed = Date.now() - lastSpamDetect;
        if (elapsed < 10000) {
          await new Promise((r) => setTimeout(r, 500));
        } else {
          spamDelayTracker.delete(delayKey);
        }
      }
    }

    const spamKey = `${botId}_${m.sender}`;
    if (!m.isOwner && !m.isPremium && (await isSpamming(spamKey))) {
      return;
    }

    const storeData = db.setting("storeList") || {};
    const storeCommand = storeData[m.command.toLowerCase()];

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      const botMode = groupData.botMode || "all";

      if (botMode === "store" && storeCommand) {
        storeData[m.command.toLowerCase()].views =
          (storeCommand.views || 0) + 1;
        db.setting("storeList", storeData);

        const caption =
          `📦 *${m.command.toUpperCase()}*\n\n` +
          `${storeCommand.content}\n\n` +
          `───────────────\n` +
          `> 👁️ Views: ${storeData[m.command.toLowerCase()].views}\n` +
          `♪💳Escribe\`${m.prefix}pago\`para pagar`;

        if (storeCommand.hasImage && storeCommand.imagePath) {
          try {
            const imageBuffer = await _ourinserializejs.getCachedThumb.call(void 0, storeCommand.imagePath);
            if (imageBuffer) {
              await sock.sendMessage(
                m.chat,
                {
                  image: imageBuffer,
                  caption: caption,
                },
                { quoted: m },
              );
              return;
            }
          } catch (e) {
            console.error("Tienda de imágenes de carga sin engranajes:", e.message);
          }
        }

        await m.reply(caption);
        return;
      }
    }

    //Control de seguridad de canal de WhatsApp centralizado ( Obligatorio Seguir 2 Canales )
    const { checkChannelSecurity } = require("./lib/ourin-channel-security.js");
    const channelSecurityPassed = await checkChannelSecurity(m, sock, db, _configjs2.default);
    if (!channelSecurityPassed) {
      return;
    }

    try {
      const caseResult = await _ourinjs.handleCommand.call(void 0, m, sock);
      if (caseResult && caseResult.handled) {
        if (_optionalChain([_configjs2.default, 'access', _140 => _140.dev, 'optionalAccess', _141 => _141.debugLog])) {
          _ourinloggerjs.logger.success("Case", `Handled: ${m.command}`);
        }
        return;
      }
    } catch (caseError) {
      _ourinloggerjs.logger.error("Case System", caseError.message);
      if (_optionalChain([_configjs2.default, 'access', _142 => _142.dev, 'optionalAccess', _143 => _143.debugLog])) {
        console.error("[CaseSystem] Stack:", caseError.stack);
      }
    }

    let plugin = _ourinpluginsjs.getPlugin.call(void 0, m.command);

    if (!plugin) {
      if (storeCommand) {
        storeData[m.command.toLowerCase()].views =
          (storeCommand.views || 0) + 1;
        db.setting("storeList", storeData);

        const caption =
          `📦 *${m.command.toUpperCase()}*\n\n` +
          `${storeCommand.content}\n\n` +
          `───────────────\n` +
          `> 👁️ Views: ${storeData[m.command.toLowerCase()].views}\n` +
          `♪💳Escribe\`${m.prefix}pago\`para pagar`;

        if (storeCommand.hasImage && storeCommand.imagePath) {
          try {
            const imageBuffer = await _ourinserializejs.getCachedThumb.call(void 0, storeCommand.imagePath);
            if (imageBuffer) {
              await sock.sendMessage(
                m.chat,
                {
                  image: imageBuffer,
                  caption: caption,
                },
                { quoted: m },
              );
              return;
            }
          } catch (e) {
            console.error("Tienda de imágenes de carga sin engranajes:", e.message);
          }
        }

        await m.reply(caption);
        return;
      }

      const storeCommands = Object.keys(storeData);
      const allCommands = [..._ourinpluginsjs.getAllCommandNames.call(void 0, ), ...storeCommands];

      const similarityEnabled = db.setting("similarity") !== false;

      if (similarityEnabled) {
        const suggestions = _ourinsimilarityjs.findSimilarCommands.call(void 0, m.command, allCommands, {
          maxResults: 1,
          minSimilarity: 0.8,
          maxDistance: 2,
        });

        if (suggestions.length > 0) {
          const suggestedCommand = m.prefix + suggestions[0].command;
          const simpleMessage = `Odio la pena, pero no tengo ese comando: (\n\n¿Se refiere a este comando?\n⇒*${suggestedCommand}*`;

          try {
            await sock.sendPreview(
              m.chat,
              {
                caption: _configjs2.default.info.website + "\n" + simpleMessage,
                url: _configjs2.default.info.website,
                title: "Command not found",
                description: `Sugiere el Comando${_configjs2.default.bot.name}`,
                jpegThumbnail: await _sharp2.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["ourin2"])).resize(300, 300).toBuffer(),
                previewType: 1,
              },
              { quoted: m }
            );
          } catch (err) {
            console.error("* Similares* *Me desperdician una vista previa de similitud*", err.message);
          }
        }
      }

      return;
    }

    if (!plugin.config.isEnabled) {
      return;
    }

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      let botMode = groupData.botMode || "all";
      const pluginCategory = _optionalChain([plugin, 'access', _144 => _144.config, 'access', _145 => _145.category, 'optionalAccess', _146 => _146.toLowerCase, 'call', _147 => _147()]);
      const baseAllowed = ["main", "group", "sticker", "owner"];

      if (isJadibot) {
        botMode = "all";

        const jadibotBlockedCategories = [
          "owner",
          "sewa",
          "panel",
          "store",
          "pushkontak",
        ];
        const jadibotBlockedCommands = [
          "sewa",
          "sewabot",
          "sewalist",
          "listsewa",
          "addsewa",
          "delsewa",
          "extendsewa",
          "checksewa",
          "sewainfo",
          "sewagroup",
          "stopsewa",
          "jadibot",
          "listjadibot",
          "addowner",
          "delowner",
          "ownerlist",
          "listowner",
          "self",
          "public",
          "botmode",
          "restart",
          "shutdown",
        ];

        if (
          jadibotBlockedCategories.includes(pluginCategory) ||
          jadibotBlockedCommands.includes(m.command.toLowerCase())
        ) {
          return m.reply(
            `⚠️ *ᴀᴋsᴇs ᴛᴇʀʙᴀᴛᴀs*\n\n` +
            `Está característica sólo está sentado en el bot principal.\n` +
            `Así que el bot no puede acceder a está característica.\n\n` +
            `Humuki propietario bot principal para más información.`,
          );
        }
      }

      const modeConfig = {
        all: { allowed: null, excluded: null, name: "All Features" },
        md: {
          allowed: null,
          excluded: ["pushkontak", "store", "panel", "otp"],
          name: "Multi Device",
        },
        cpanel: { allowed: [...baseAllowed, "tools", "panel"], name: "CPanel" },
        pushkontak: {
          allowed: [...baseAllowed, "pushkontak"],
          name: "Push Kontak",
        },
        store: { allowed: [...baseAllowed, "store"], name: "Store" },
        otp: { allowed: [...baseAllowed, "otp"], name: "OTP" },
      };

      const categoryModeMap = {
        download: "md",
        search: "md",
        ai: "md",
        fun: "md",
        game: "md",
        media: "md",
        utility: "md",
        tools: "md",
        ephoto: "md",
        religi: "md",
        info: "md",
        panel: "cpanel",
        pushkontak: "pushkontak",
        store: "store",
        otp: "otp",
        jpm: "md",
      };

      const currentConfig = modeConfig[botMode] || modeConfig.all;

      if (
        m.command !== "botmode" &&
        m.command !== "menu" &&
        m.command !== "menucat"
      ) {
        let isBlocked = false;

        if (
          currentConfig.allowed &&
          !currentConfig.allowed.includes(pluginCategory)
        ) {
          isBlocked = true;
        }
        if (
          currentConfig.excluded &&
          currentConfig.excluded.includes(pluginCategory)
        ) {
          isBlocked = true;
        }

        if (isBlocked) {
          const suggestedMode = categoryModeMap[pluginCategory] || "all";
          const suggestedModeName =
            _optionalChain([modeConfig, 'access', _148 => _148[suggestedMode], 'optionalAccess', _149 => _149.name]) || "Multi Device";

          await m.reply(
            `🔒 *ᴄᴏᴍᴍᴀɴᴅ ᴛɪᴅᴀᴋ ᴛᴇʀsᴇᴅɪᴀ*\n\n` +
            `*Estoy en un modo*${currentConfig.name}*\n` +
            `> Comando\`${m.prefix}${m.command}\`disponible en modo *${suggestedModeName}*\n\n` +
            `💡Llamar a un administrador grupo para reemblazar el modo:\n` +
            `\`${m.prefix}botmode ${suggestedMode}\``,
          );
          return;
        }
      }

      if (!m.isAdmin && !m.isOwner) {
        const pluginCat = _optionalChain([plugin, 'access', _150 => _150.config, 'access', _151 => _151.category, 'optionalAccess', _152 => _152.toLowerCase, 'call', _153 => _153()]);
        const grpData = db.getGroup(m.chat) || {};

        if (pluginCat === "game" && grpData.game === false) {
          await m.reply(
            `🎮* Juego de imágenes NOCIVAS*\n\nLa función de juego está siendo desactivada en este grupo por admin.\nSolicitud de administrador para reactivar con comandos *${m.prefix}juego en *`
          );
          return;
        }

        if (pluginCat === "rpg" && grpData.rpg === false) {
          await m.reply(
            `⚔♪\n\nLa función RPG está siendo desactivada en este grupo por admin.\nSolicitud de administrador para reactivar con comandos *${m.prefix}rpg on*`
          );
          return;
        }
      }
    }

    const permission = _ourinmiddlewarejs.checkPermission.call(void 0, m, plugin.config);
    if (!permission.allowed) {
      await m.reply(permission.reason);
      return;
    }

    const registrationRequired =
      _nullishCoalesce(_nullishCoalesce(db.setting("registrationRequired"), () => (
      _optionalChain([_configjs2.default, 'access', _154 => _154.registration, 'optionalAccess', _155 => _155.enabled]))), () => (
      false));
    if (registrationRequired && !plugin.config.skipRegistration) {
      const user = db.getUser(m.sender);
      if (!m.isOwner && !m.isPartner && !m.isPremium && !_optionalChain([user, 'optionalAccess', _156 => _156.isRegistered])) {
        await m.reply(
          `📝 *ᴡᴀᴊɪʙ ᴅᴀꜰᴛᴀʀ*\n\n` +
          `¡Tienes que listarlo primero!\n\n` +
          `> Escribe:\`${m.prefix}daftar\`\n\n` +
          `* Responder a la pregunta del bot ' s al final *`,
        );
        return;
      }
    }

    const user = db.getUser(m.sender);

    if (!m.isOwner && !m.isPartner && plugin.config.cooldown > 0) {
      const cooldownRemaining = db.checkCooldown(
        m.sender,
        m.command,
        plugin.config.cooldown,
      );
      if (cooldownRemaining) {
        m.react("⏱️").catch(() => { });
        return;
      }
    }

    const energiEnabled =
      db.setting("energi") !== undefined
        ? db.setting("energi")
        : _optionalChain([_configjs2.default, 'access', _157 => _157.energi, 'optionalAccess', _158 => _158.enabled]) !== false;

    const capEnergiOverrides = db.setting("capenergi") || {};
    const pluginEnergiCost = capEnergiOverrides[plugin.config.name] !== undefined ? capEnergiOverrides[plugin.config.name] : (plugin.config.energi || 0);

    if (energiEnabled && pluginEnergiCost > 0) {
      const ownerEnergi = _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _159 => _159.energi, 'optionalAccess', _160 => _160.owner]), () => ( -1));
      const premiumEnergi = _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _161 => _161.energi, 'optionalAccess', _162 => _162.premium]), () => ( -1));
      const defaultEnergi = _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _163 => _163.energi, 'optionalAccess', _164 => _164.default]), () => ( 0));

      let currentEnergi;
      if (
        (m.isOwner || m.isPartner) &&
        (ownerEnergi === -1 || _optionalChain([user, 'optionalAccess', _165 => _165.energi]) === -1)
      ) {
      } else if (m.isPremium && (premiumEnergi === -1 || _optionalChain([user, 'optionalAccess', _166 => _166.energi]) === -1)) {
      } else {
        currentEnergi =
          _nullishCoalesce(_optionalChain([user, 'optionalAccess', _167 => _167.energi]), () => (
          (m.isOwner || m.isPartner
            ? ownerEnergi
            : m.isPremium
              ? premiumEnergi
              : defaultEnergi)));
        if (currentEnergi < pluginEnergiCost) {
          await m.reply(_optionalChain([_configjs2.default, 'access', _168 => _168.messages, 'optionalAccess', _169 => _169.energiExceeded]) || "⚡ Energi habis!");
          return;
        }
        db.updateEnergi(m.sender, -pluginEnergiCost);

        if (db.setting("notiflimit")) {
          let limitMsg = _optionalChain([_configjs2.default, 'access', _170 => _170.messages, 'optionalAccess', _171 => _171.limitDeducted]) || "🔋Limita que eres tan corto como{amount}- SUSH TIMITS:{sisa}";
          limitMsg = limitMsg.replace("{amount}", pluginEnergiCost.toString()).replace("{sisa}", (currentEnergi - pluginEnergiCost).toString());
          await m.reply(limitMsg);
        }
      }
    }

    if (_nullishCoalesce(db.setting("autoTyping"), () => ( _optionalChain([_configjs2.default, 'access', _172 => _172.features, 'optionalAccess', _173 => _173.autoTyping])))) {
      sock.sendPresenceUpdate("composing", m.chat).catch(() => { });
    }

    const context = {
      sock,
      m,
      args: m.args || [],
      text: m.text || "",
      command: m.command || "",
      prefix: m.prefix || _optionalChain([_configjs2.default, 'access', _174 => _174.command, 'optionalAccess', _175 => _175.prefix]) || ".",
      config: _configjs2.default,
      db,
      uptime: _connectionjs.getUptime.call(void 0, ),
      plugins: {
        count: _ourinpluginsjs.getPluginCount.call(void 0, ),
      },
      jadibotId: jadibotId,
      isJadibot: isJadibot,
      reply: (t, o) => m.reply(t, o),
      conn: sock,
      isOwner: m.isOwner,
      isPremium: m.isPremium,
      isAdmin: m.isAdmin,
      isBotAdmin: m.isBotAdmin,
    };

    await plugin.handler(m, context);

    if (!m.isOwner && !m.isPartner && plugin.config.cooldown > 0) {
      db.setCooldown(m.sender, m.command, plugin.config.cooldown);
    }

    db.incrementStat("commandsExecuted");
    db.incrementStat(`Comando.${m.command}`);

    if (user) {
      const todayStr = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
      if (user.lastActiveDate !== todayStr) {
        const newActiveDays = (user.activeDays || 0) + 1;
        db.setUser(m.sender, { lastActiveDate: todayStr, activeDays: newActiveDays });
      }
    }

    if (_nullishCoalesce(db.setting("autoTyping"), () => ( _optionalChain([_configjs2.default, 'access', _176 => _176.features, 'optionalAccess', _177 => _177.autoTyping])))) {
      sock.sendPresenceUpdate("paused", m.chat).catch(() => { });
    }
  } catch (error) {
    _ourinloggerjs.logger.error("handler", `${error.message}`);
    console.error("[Handler Stack]", error.stack);

    try {
      const db = _ourindatabasejs.getDatabase.call(void 0, );
      if (db) {
        db.incrementStat("commandErrors");
        const errorLog = db.setting("errorLog") || [];
        errorLog.unshift({
          cmd: "unknown",
          err: _optionalChain([error, 'access', _178 => _178.message, 'optionalAccess', _179 => _179.substring, 'call', _180 => _180(0, 200)]),
          at: Date.now(),
        });
        if (errorLog.length > 50) errorLog.splice(50);
        db.setting("errorLog", errorLog);
      }
    } catch (e48) { }

    try {
      const m = await _ourinserializejs.serialize.call(void 0, sock, msg);
      if (m) {
        await m.reply(`Parece que hay un monstruo de control, que llama al dueño.`);
      }
    } catch (e49) {
      _ourinloggerjs.logger.error("Failed to send error message");
    }
  }
}

/**
* Handler para los participantes del grupo de actualización
 * @param {Object} update - Update data
 * @param {Object} sock - Socket connection
 * @returns {Promise<void>}
 */
async function groupHandler(update, sock) {
  try {
    if (global.sewaLeaving) return;

    const { id: groupJid, participants, action } = update;

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return;
    }

    const db = _ourindatabasejs.getDatabase.call(void 0, );

    let groupData = db.getGroup(groupJid);
    if (!groupData) {
      db.setGroup(groupJid, {
        welcome: _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _181 => _181.welcome, 'optionalAccess', _182 => _182.defaultEnabled]), () => ( true)),
        goodbye: _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _183 => _183.goodbye, 'optionalAccess', _184 => _184.defaultEnabled]), () => ( true)),
        leave: _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _185 => _185.goodbye, 'optionalAccess', _186 => _186.defaultEnabled]), () => ( true)),
      });
      groupData = db.getGroup(groupJid);
    }

    let groupMeta;
    try {
      const cached = _optionalChain([global, 'access', _187 => _187.groupMetadataCache, 'optionalAccess', _188 => _188.get, 'call', _189 => _189(groupJid)]);
      if (cached && Date.now() - (cached._ts || 0) < 30000) {
        groupMeta = cached;
      } else {
        groupMeta = await sock.groupMetadata(groupJid);
        if (global.groupMetadataCache) {
          groupMeta._ts = Date.now();
          global.groupMetadataCache.set(groupJid, groupMeta);
        }
      }

      if (_optionalChain([groupMeta, 'optionalAccess', _190 => _190.participants])) {
        _ourinlidjs.cacheParticipantLids.call(void 0, groupMeta.participants);
      }
    } catch (e) {
      if (
        _optionalChain([e, 'access', _191 => _191.message, 'optionalAccess', _192 => _192.includes, 'call', _193 => _193("forbidden")]) ||
        _optionalChain([e, 'access', _194 => _194.message, 'optionalAccess', _195 => _195.includes, 'call', _196 => _196("401")]) ||
        _optionalChain([e, 'access', _197 => _197.message, 'optionalAccess', _198 => _198.includes, 'call', _199 => _199("403")])
      ) {
        return;
      }
      if (
        _optionalChain([e, 'access', _200 => _200.message, 'optionalAccess', _201 => _201.includes, 'call', _202 => _202("rate-overlimit")]) ||
        _optionalChain([e, 'optionalAccess', _203 => _203.output, 'optionalAccess', _204 => _204.statusCode]) === 429
      ) {
        _ourinloggerjs.logger.warn("GroupHandler", "rate-limited, skipping event");
        return;
      }
      throw e;
    }

    for (let participant of participants) {
      let participantJid;

      if (typeof participant === "object" && participant !== null) {
        participantJid =
          participant.jid || participant.id || participant.lid || "";
      } else {
        participantJid = participant;
      }

      if (!participantJid || typeof participantJid !== "string") continue;

      if (_ourinlidjs.isLid.call(void 0, participantJid) || _ourinlidjs.isLidConverted.call(void 0, participantJid)) {
        const found = _optionalChain([groupMeta, 'access', _205 => _205.participants, 'optionalAccess', _206 => _206.find, 'call', _207 => _207(
          (p) =>
            p.id === participantJid ||
            p.lid === participantJid ||
            p.lid === participantJid.replace("@s.whatsapp.net", "@lid"),
        )]);
        if (found) {
          participantJid =
            found.jid &&
              !found.jid.endsWith("@lid") &&
              !_ourinlidjs.isLidConverted.call(void 0, found.jid)
              ? found.jid
              : found.id &&
                !found.id.endsWith("@lid") &&
                !_ourinlidjs.isLidConverted.call(void 0, found.id)
                ? found.id
                : _ourinlidjs.lidToJid.call(void 0, participantJid);
        } else {
          participantJid = _ourinlidjs.lidToJid.call(void 0, participantJid);
        }
      }

      participant = participantJid;

      if (action === "add" && sendWelcomeMessage) {
        await sendWelcomeMessage(sock, groupJid, participant, groupMeta);
      }

      if (action === "remove" && sendGoodbyeMessage) {
        await sendGoodbyeMessage(sock, groupJid, participant, groupMeta);
      }

      const saluranId = _optionalChain([_configjs2.default, 'access', _208 => _208.saluran, 'optionalAccess', _209 => _209.id]) || "120363400911374213@newsletter";
      const saluranName =
        _optionalChain([_configjs2.default, 'access', _210 => _210.saluran, 'optionalAccess', _211 => _211.name]) || _optionalChain([_configjs2.default, 'access', _212 => _212.bot, 'optionalAccess', _213 => _213.name]) || "Ourin-AI";

      let groupPpUrl = null;
      try {
        groupPpUrl = await sock.profilePictureUrl(groupJid, "image");
      } catch (e50) { }

      const rankActions = {
        promote: {
          notifKey: "notifPromote",
          imgKey: "_promoteImg",
          imgPath: _configjs2.default.assets["ourin-promote"],
          emoji: "🎉",
          label: "PROMOTE",
          text: (p, a) =>
            `🌿 @${p}Ahora es un nuevo administrador.💕\nPromovido por:${a}`,
        },
        demote: {
          notifKey: "notifDemote",
          imgKey: "_demoteImg",
          imgPath: _configjs2.default.assets["ourin-demote"],
          emoji: "📉",
          label: "DEMOTE",
          text: (p, a) =>
            `🌿 @${p}Ya no es administrador.\nDemoted by: @${a}`,
        },
      };

      const rankCfg = rankActions[action];
      if (rankCfg && groupData[rankCfg.notifKey] === true) {
        const author = update.author || null;
        if (!groupHandler[rankCfg.imgKey]) {
          try {
            groupHandler[rankCfg.imgKey] = _fs2.default.readFileSync(rankCfg.imgPath);
          } catch (e51) {
            groupHandler[rankCfg.imgKey] = null;
          }
        }
        if (groupHandler[rankCfg.imgKey]) {
          const pNum = participant.split("@")[0];
          const aNum = _optionalChain([author, 'optionalAccess', _214 => _214.split, 'call', _215 => _215("@"), 'access', _216 => _216[0]]) || "Unknown";
          const mentions = author ? [participant, author] : [participant];

          const fakeQuoted = {
            key: {
              fromMe: false,
              participant: participant,
              remoteJid: participant
            },
            message: {
              conversation: action === "promote"
                ? `Hola a todos. Estoy aquí ahora.`
                : `Bueno, ya no soy un administrador.😔`
            }
          };

          const media4 = await _ourin.prepareWAMessageMedia.call(void 0, { image: groupHandler[rankCfg.imgKey] }, { upload: sock.waUploadToServer });

          const promoteButtons = [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🍙Cara se convierte en administrador",
                url: "https://www.whatsapp.com/communities/learning/beingagoodadmin?lang=id",
                merchant_url: "https://www.whatsapp.com/communities/learning/beingagoodadmin?lang=id"
              })
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🖐Nuevo hola de administración",
                id: ""
              })
            }
          ];

          const demoteButtons = [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "Tetap semangat ya! 💪",
                id: ""
              })
            }
          ];

          const msg4 = _ourin.generateWAMessageFromContent.call(void 0, groupJid, {
            viewOnceMessage: {
              message: {
                messageContextInfo: {},
                interactiveMessage: {
                  header: { title: "", subtitle: "", hasMediaAttachment: true, imageMessage: media4.imageMessage },
                  footer: { text: _optionalChain([_configjs2.default, 'access', _217 => _217.bot, 'optionalAccess', _218 => _218.name]) || "Ourin-AI" },
                  body: { text: rankCfg.text(pNum, aNum) },
                  contextInfo: {
                    mentionedJid: mentions,
                    isForwarded: true,
                    forwardingScore: 9999,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: _optionalChain([_configjs2.default, 'access', _219 => _219.saluran, 'optionalAccess', _220 => _220.id]) || "120363400911374213@newsletter",
                      newsletterName: _optionalChain([_configjs2.default, 'access', _221 => _221.saluran, 'optionalAccess', _222 => _222.name]) || _optionalChain([_configjs2.default, 'access', _223 => _223.bot, 'optionalAccess', _224 => _224.name]) || "Ourin-AI",
                      serverMessageId: 127,
                    },
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: action === "promote" ? `Felicidades yahh🎉` : `Tetap Semangat 📉`,
                        url: "Hai",
                        expiration_time: Date.now() + 1000000
                      },
                      bottom_sheet: { in_thread_buttons_limit: 2, divider_indices: [1, 2], list_title: "Opsi", button_title: "🍙 Lihat Opsi" },
                      tap_target_configuration: { title: " X ", description: "bomboclard", canonical_url: "https://ourin.site", domain: "shop.example.com", button_index: 0 },
                    }),
                    buttons: action === "promote" ? promoteButtons : demoteButtons
                  }
                }
              }
            }
          }, { quoted: fakeQuoted, userJid: sock.user.jid });

          await sock.relayMessage(groupJid, msg4.message, { messageId: msg4.key.id });
        }
      }
    }
  } catch (error) {
    console.error("[GroupHandler] Error:", error.message);
  }
}

async function messageUpdateHandler(updates, sock) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );

  for (const update of updates) {
    try {
      await _ouringroupprotectionjs.handleAntiRemove.call(void 0, update, sock, db);
    } catch (error) {
      continue;
    }

    try {
      const editedMsg = _optionalChain([update, 'access', _225 => _225.update, 'optionalAccess', _226 => _226.message, 'optionalAccess', _227 => _227.editedMessage, 'optionalAccess', _228 => _228.message]);
      const regularMsg = _optionalChain([update, 'access', _229 => _229.update, 'optionalAccess', _230 => _230.message]);

      const resolvedMessage =
        editedMsg ||
        (regularMsg && !regularMsg.protocolMessage ? regularMsg : null);

      if (!resolvedMessage) continue;

      const newMsg = {
        key: update.key,
        message: editedMsg ? { ...resolvedMessage } : regularMsg,
        messageTimestamp:
          update.messageTimestamp || Math.floor(Date.now() / 1000),
        pushName: update.pushName || "User",
      };

      await messageHandler(newMsg, sock);
    } catch (error) {
      console.error("[MsgUpdate] Error:", error.message);
    }
  }
}

/**
* Cache para almacenar el último lote
* Formal: { groupId: { anonymous: boolean, restore: boolean, lastUpdate: timestup }
 */
const groupSettingsCache = new Map();

/**
* Debounce refresca para prevenir el spam ( en ms )
 */
const GROUP_SETTINGS_COOLDOWN = 1000;

async function groupSettingsHandler(update, sock) {
  try {
    if (global.sewaLeaving) return;
    if (global.isFetchingGroups) return;

    const groupId = update.id;
    if (!groupId || !groupId.endsWith("@g.us")) return;

    if (update.announce === undefined && update.restrict === undefined) {
      return;
    }

    const cached = groupSettingsCache.get(groupId) || {};
    const now = Date.now();

    if (
      cached.lastUpdate &&
      now - cached.lastUpdate < GROUP_SETTINGS_COOLDOWN
    ) {
      return;
    }

    let hasRealChange = false;

    let groupName = groupId;
    let groupPpUrl = null;
    try {
      const meta = await sock.groupMetadata(groupId);
      groupName = _optionalChain([meta, 'optionalAccess', _231 => _231.subject]) || groupId;
    } catch (e52) { }
    try {
      groupPpUrl = await sock.profilePictureUrl(groupId, "image");
    } catch (e53) { }

    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const groupData = db.getGroup(groupId) || {};

    const zannContext = {
      contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
    };

    if (update.announce !== undefined) {
      if (cached.announce === undefined) {
        cached.announce = update.announce;
      } else if (cached.announce !== update.announce) {
        hasRealChange = true;

        if (update.announce === true && groupData.notifCloseGroup === true) {
          await sock.sendText(
            groupId,
            `🥗Grupo *${groupName}* en la capucha por admin`,
            null,
            zannContext,
          );
        }

        if (update.announce === false && groupData.notifOpenGroup === true) {
          await sock.sendText(
            groupId,
            `🎃Grupo *${groupName}* ha sido reabierto por admin`,
            null,
            zannContext,
          );
        }

        cached.announce = update.announce;
      }
    }

    if (update.restrict !== undefined) {
      if (cached.restrict === undefined) {
        cached.restrict = update.restrict;
      } else if (cached.restrict !== update.restrict) {
        hasRealChange = true;

        if (update.restrict === true) {
          await sock.sendText(
            groupId,
            `🥗Info Grupo *${groupName}* Tapped!\nSólo administración puede editar grupo`,
            null,
            zannContext,
          );
        } else {
          await sock.sendText(
            groupId,
            `🥗Info Grupo *${groupName}*¡Abre!\nTodas las fotos a puedenditar grupo`,
            null,
            zannContext,
          );
        }
        cached.restrict = update.restrict;
      }
    }
    if (hasRealChange) {
      cached.lastUpdate = now;
    }
    if (cached.announce !== undefined || cached.restrict !== undefined) {
      groupSettingsCache.set(groupId, cached);
    }
  } catch (error) {
    console.error("[GroupSettings] Error:", error.message);
  }
}










exports.messageHandler = messageHandler; exports.groupHandler = groupHandler; exports.messageUpdateHandler = messageUpdateHandler; exports.groupSettingsHandler = groupSettingsHandler; exports.checkPermission = _ourinmiddlewarejs.checkPermission; exports.checkMode = _ourinmiddlewarejs.checkMode; exports.isSpamming = isSpamming; exports.handleAntiRemoveFromUpsert = _ouringroupprotectionjs.handleAntiRemoveFromUpsert;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
