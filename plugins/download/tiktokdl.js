"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

async function tiktokDl(url) {
  function formatNumber(integer) {
    let numb = parseInt(integer);
    return Number(numb).toLocaleString().replace(/,/g, ".");
  }

  function formatDate(n, locale = "en") {
    let d = new Date(n);
    return d.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  }

  let data = [];
  const domain = "https://www.tikwm.com/api/";
  const res = (
    await _axios2.default.post(
      domain,
      {},
      {
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "https://www.tikwm.com",
          Referer: "https://www.tikwm.com/",
          "Sec-Ch-Ua": '"Not)A;Brand" ;v="24" , "Chromium" ;v="116"',
          "Sec-Ch-Ua-Mobile": "?1",
          "Sec-Ch-Ua-Platform": "Android",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
        params: { url, count: 12, cursor: 0, web: 1, hd: 1 },
      },
    )
  ).data.data;

  if (_optionalChain([res, 'optionalAccess', _ => _.duration]) == 0) {
    res.images.forEach((v) => data.push({ type: "photo", url: v }));
  } else {
    data.push(
      {
        type: "watermark",
        url: "https://www.tikwm.com" + _optionalChain([res, 'optionalAccess', _2 => _2.wmplay]) || "/undefined",
      },
      {
        type: "nowatermark",
        url: "https://www.tikwm.com" + _optionalChain([res, 'optionalAccess', _3 => _3.play]) || "/undefined",
      },
      {
        type: "nowatermark_hd",
        url: "https://www.tikwm.com" + _optionalChain([res, 'optionalAccess', _4 => _4.hdplay]) || "/undefined",
      },
    );
  }

  return {
    status: true,
    title: res.title,
    taken_at: formatDate(res.create_time).replace("1970", ""),
    region: res.region,
    id: res.id,
    durations: res.duration,
    duration: res.duration + " Seconds",
    cover: "https://www.tikwm.com" + res.cover,
    size_wm: res.wm_size,
    size_nowm: res.size,
    size_nowm_hd: res.hd_size,
    data,
    music_info: {
      id: res.music_info.id,
      title: res.music_info.title,
      author: res.music_info.author,
      album: res.music_info.album || null,
      url: "https://www.tikwm.com" + res.music || res.music_info.play,
    },
    stats: {
      views: formatNumber(res.play_count),
      likes: formatNumber(res.digg_count),
      comment: formatNumber(res.comment_count),
      share: formatNumber(res.share_count),
      download: formatNumber(res.download_count),
    },
    author: {
      id: res.author.id,
      fullname: res.author.unique_id,
      nickname: res.author.nickname,
      avatar: "https://www.tikwm.com" + res.author.avatar,
    },
  };
}

const pluginConfig = {
  name: ["tiktok", "tt", "ttmp4"],
  alias: ["tiktokdl", "ttdown"],
  category: "download",
  description: "Download video/slide TikTok tanpa watermark",
  usage: ".tiktok <url>",
  example: ".tiktok https://vt.tiktok.com/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _5 => _5.text, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()]);
  const prefix = m.prefix;
  const command = _optionalChain([m, 'optionalAccess', _8 => _8.command]);
  if (!text) {
    m.react("❌");
    return m.reply(
      `📌Ejemplo: *${prefix + command} https://vt.tiktok.com/...*`,
    );
  }
  m.react("🕕");
  try {
    const result = await tiktokDl(text);

    const musicButton = {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "🎵 Ambil Music",
        id: `${prefix}ttmp3 ${text}`,
      }),
    };

    if (result.durations > 0 && result.duration !== "0 Seconds") {
      const videoItem = result.data.find(
        (e) => e.type === "nowatermark_hd" || e.type === "nowatermark",
      ) || result.data[0];

      const caption =
        `🎵 *𝗧 𝗜 𝗞 𝗧 𝗢 𝗞  -  𝗗 𝗢 𝗪 𝗡 𝗟 𝗢 𝗔 𝗗 𝗘 𝗥*\n\n` +
        `- Author: *${result.author.nickname}* (${result.author.fullname})\n` +
        `- Caption: ${result.title || "-"}\n` +
        `- Music: ${result.music_info.title} - ${result.music_info.author}\n` +
        `- Duration: ${result.duration}\n` +
        `- Uploaded: ${result.taken_at}\n` +
        `- Region: ${result.region}\n\n` +
        `* Estadísticas de vídeo:\n` +
        `- Views: *${result.stats.views}*\n` +
        `- Likes: *${result.stats.likes}*\n` +
        `- Comments: *${result.stats.comment}*\n` +
        `- Shares: *${result.stats.share}*\n` +
        `- Downloads: *${result.stats.download}*`;

      await sock.sendButton(m.chat, videoItem.url, caption, m, {
        type: "video",
        buttons: [musicButton],
      });
    } else {
      const caption =
        `📸 *𝗧 𝗜 𝗞 𝗧 𝗢 𝗞  -  𝗗 𝗢 𝗪 𝗡 𝗟 𝗢 𝗔 𝗗 𝗘 𝗥*\n\n` +
        `- Author: *${result.author.nickname}* (${result.author.fullname})\n` +
        `- Caption: ${result.title || "-"}\n` +
        `- Music: ${result.music_info.title} - ${result.music_info.author}\n` +
        `- Uploaded: ${result.taken_at}\n` +
        `- Region: ${result.region}\n\n` +
        `* Contenido de la estadística: *\n` +
        `- Views: *${result.stats.views}*\n` +
        `- Likes: *${result.stats.likes}*\n` +
        `- Comments: *${result.stats.comment}*\n` +
        `- Shares: *${result.stats.share}*\n` +
        `- Downloads: *${result.stats.download}*`;

      const slides = _optionalChain([result, 'access', _9 => _9.data, 'optionalAccess', _10 => _10.map, 'call', _11 => _11((zan, idx) => ({
        image: { url: zan.url },
        caption: idx === 0 ? caption : "",
      }))]) || [];
      await sock.sendMessage(
        m.chat,
        {
          albumMessage: slides,
        },
        { quoted: m },
      );

      await sock.sendButton(m.chat, null, `📸Slide successfully delivered!\nEl botón cae en la burbuja para la temporada.`, m, {
        buttons: [musicButton],
      });
    }
    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("❌");
    m.reply("Inténtalo de nuevo más tarde, o podemos intentarlo." + m.prefix + "tt2");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
