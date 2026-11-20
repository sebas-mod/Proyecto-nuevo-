"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const EXP_PER_LEVEL = 10000;

function calculateLevel(exp) {
  return Math.floor(exp / EXP_PER_LEVEL) + 1;
}

function expForLevel(level) {
  return (level - 1) * EXP_PER_LEVEL;
}

function getRole(level) {
  if (level >= 100) return "🐉 Mythic";
  if (level >= 80) return "⚔️ Legend";
  if (level >= 60) return "💜 Epic";
  if (level >= 40) return "💪 Grandmaster";
  if (level >= 20) return "🎖️ Master";
  if (level >= 10) return "⭐ Elite";
  return "🛡️ Warrior";
}

async function checkAndNotifyLevelUp(sock, m, db, user, oldExp, newExp) {
  const { createCanvas, loadImage, GlobalFonts } =
    await Promise.resolve().then(() => _interopRequireWildcard(require("@napi-rs/canvas")));
  /**
* Fungi para hacer un Anime temático Nivel Subir imagen
   * @param {Object} data - Data user
* @ param{string}datos. Nombre - nombre del usuario
* @ param{number}datos.
* @ param{number}datos. ActualXp - XP current
* @ param{number}datos. requeridosXp - XP totals
* @ param{string} datos.avatarUrl - URL foto perfil user
* @ param{string}data. backgroundUrl - URL imagen fondo anime
   */
  async function generateLevelUpCard(data) {
    const width = 800;
    const height = 280;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(10, 10, width - 20, height - 20, 30);
    ctx.clip();
    try {
      const background = await loadImage(
        data.backgroundUrl ||
          "https://images.wallpapersden.com/image/download/anime-night-sky-scenery_bWlsZ26UmZqaraWkpJRmbmdlrWZnZWU.jpg",
      );
      const ratio = Math.max(
        width / background.width,
        height / background.height,
      );
      const x = (width - background.width * ratio) / 2;
      const y = (height - background.height * ratio) / 2;
      ctx.drawImage(
        background,
        x,
        y,
        background.width * ratio,
        background.height * ratio,
      );
    } catch (err) {
      ctx.fillStyle = "#1e1e2f";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    try {
      const avatar = await loadImage(data.avatarUrl).catch(() => null);
      if (avatar) {
        ctx.shadowColor = "#00f2ff";
        ctx.shadowBlur = 20;
        ctx.save();
        ctx.beginPath();
        ctx.arc(120, height / 2, 85, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, 35, height / 2 - 85, 170, 170);
        ctx.restore();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#00f2ff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(120, height / 2, 85, 0, Math.PI * 2);
        ctx.stroke();
      }
    } catch (e) {}
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("LEVEL UP!", 230, 85);
    ctx.fillStyle = "#00f2ff";
    ctx.font = "italic 25px sans-serif";
    ctx.fillText(`Congratulations, ${data.name}!`, 230, 125);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic bold 90px sans-serif";
    ctx.fillText(`${data.level}`, width - 50, 120);
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("LEVEL", width - 55, 45);
    ctx.textAlign = "left";
    const barX = 230;
    const barY = 185;
    const barWidth = 520;
    const barHeight = 30;
    const progress = Math.min(data.currentXp / data.requiredXp, 1);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 15);
    ctx.fill();
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    barGrad.addColorStop(0, "#ff00cc");
    barGrad.addColorStop(1, "#3333ff");
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * progress, barHeight, 15);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    const xpInfo = `${data.currentXp.toLocaleString()} / ${data.requiredXp.toLocaleString()} XP`;
    ctx.fillText(xpInfo, barX + 15, barY + 21);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "12px sans-serif";
    ctx.fillText(_configjs2.default.bot.name, 230, 245);
    return canvas.toBuffer("image/png");
  }
  const oldLevel = calculateLevel(oldExp);
  const newLevel = calculateLevel(newExp);

  if (newLevel > oldLevel) {
    user.rpg.level = newLevel;
    user.rpg.maxHealth = 100 + (newLevel - 1) * 10;
    user.rpg.maxMana = 100 + (newLevel - 1) * 5;
    user.rpg.maxStamina = 100 + (newLevel - 1) * 5;
    user.rpg.health = user.rpg.maxHealth;
    user.rpg.mana = user.rpg.maxMana;
    user.rpg.stamina = user.rpg.maxStamina;

    db.save();

    if (_optionalChain([user, 'access', _ => _.settings, 'optionalAccess', _2 => _2.levelupNotif]) === false) {
      return { leveledUp: true, notified: false, oldLevel, newLevel };
    }

    const role = getRole(newLevel);
    const botName = _optionalChain([_configjs2.default, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.name]) || "Al Miku-AI";
    const saluranId = _optionalChain([_configjs2.default, 'access', _5 => _5.saluran, 'optionalAccess', _6 => _6.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _7 => _7.saluran, 'optionalAccess', _8 => _8.name]) || botName;

    let ppBuffer = null;
    try {
      ppBuffer = await sock.profilePictureUrl(m.sender, "image");
    } catch (e2) {}

    const txt = `🎊*Felicidades @${m.sender.split("@")[0]}!*

Nivel que está creciendo${newLevel - oldLevel}
🥗Nivel que ahora *${newLevel}*

Ahora estás en el rango *${role}*

¿Quieres comprobar los detalles del nivel?${m.prefix}level_

¡Acostúmbrate a interactuar con tus botas de nivel de para que creciendo!`;

    const contextInfo = {
      mentionedJid: [m.sender],
      forwardingScore: 999,
      isForwarded: true,
    };

    const fakeQuoted = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
      },
      message: {
        contactMessage: {
          displayName: `✅ ${botName}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${botName}\nORG:Verified Bot\nEND:VCARD`,
        },
      },
    };
    await sock.sendMedia(
      m.chat,
      await generateLevelUpCard({
        name: m.pushName || "User",
        level: newLevel,
        currentXp: newExp,
        requiredXp: expForLevel(newLevel),
        avatarUrl:
          ppBuffer ||
          "https://ui-avatars.com/api/?name=K&background=00f2ff&color=fff&size=256",
        backgroundUrl:
          "https://images.wallpapersden.com/image/download/anime-night-sky-scenery_bWlsZ26UmZqaraWkpJRmbmdlrWZnZWU.jpg",
      }),
      txt,
      m,
      {
        type: "image",
        contextInfo,
      },
    );

    return { leveledUp: true, notified: true, oldLevel, newLevel };
  }

  return { leveledUp: false, notified: false, oldLevel, newLevel: oldLevel };
}

async function addExpWithLevelCheck(sock, m, db, user, expAmount) {
  if (!user)
    return { leveledUp: false, notified: false, oldLevel: 1, newLevel: 1 };
  if (!user.rpg) user.rpg = {};

  const oldExp = user.exp || 0;
  const newExp = db.updateExp(m.sender, expAmount);
  user.exp = newExp;

  const result = await checkAndNotifyLevelUp(sock, m, db, user, oldExp, newExp);

  db.setUser(m.sender, { rpg: user.rpg });

  return result;
}







exports.calculateLevel = calculateLevel; exports.expForLevel = expForLevel; exports.getRole = getRole; exports.checkAndNotifyLevelUp = checkAndNotifyLevelUp; exports.addExpWithLevelCheck = addExpWithLevelCheck;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
