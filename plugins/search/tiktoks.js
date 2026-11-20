const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const pluginConfig = {
  name: 'tiktoks',
  alias: ['ttsearch', 'tiktoksearch', 'caritiktok'],
  category: 'search',
  description: 'Cari video TikTok berdasarkan kata kunci dan unduh tanpa watermark',
  usage: '.tiktoks <kata kunci>',
  example: '.tiktoks jedag jedug preset',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  limit: 1,
  isEnabled: true,
};

async function searchTikwm(query) {
  const form = new URLSearchParams({
    keywords: query,
    count: '10',
    cursor: '0',
    web: '1',
  });

  const res = await axios.post('https://www.tikwm.com/api/feed/search', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      Origin: 'https://www.tikwm.com',
      Referer: 'https://www.tikwm.com/',
      'User-Agent': UA,
    },
    timeout: 20000,
  });

  return res.data?.data?.videos || [];
}

async function handler(m, context) {
  const { sock, text, command, prefix } = context;
  const p = prefix || '.';

  if (!text) {
    return m.reply(`Masukkan kata kunci pencarian TikTok!\nContoh: \`${p}${command} anime edit amv\``);
  }

  try {
    await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  } catch {}

  try {
    const videos = await searchTikwm(text);
    if (!videos || !videos.length) {
      try {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      } catch {}
      return m.reply(`❌ Tidak ditemukan video TikTok untuk kata kunci: *"${text}"*`);
    }

    const video = videos[Math.floor(Math.random() * videos.length)];
    const playPath = video.play || video.wmplay;
    if (!playPath) throw new Error('Tautan video tidak tersedia dari server TikWM.');

    const videoUrl = playPath.startsWith('http') ? playPath : `https://www.tikwm.com${playPath}`;

    const caption =
      `📱 *TIKTOK SEARCH RESULTS*\n\n` +
      `🎬 *Judul:* ${video.title || '-'}\n` +
      `👤 *Kreator:* ${video.author?.nickname || '-'} (@${video.author?.unique_id || '-'})\n` +
      `⏱️ *Durasi:* ${video.duration || 0} detik\n` +
      `❤️ *Likes:* ${Number(video.digg_count || 0).toLocaleString('id-ID')}\n` +
      `💬 *Komentar:* ${Number(video.comment_count || 0).toLocaleString('id-ID')}\n` +
      `🔁 *Shares:* ${Number(video.share_count || 0).toLocaleString('id-ID')}\n` +
      `👀 *Tayangan:* ${Number(video.play_count || 0).toLocaleString('id-ID')}\n\n` +
      `_Diunduh tanpa watermark via Ourin 3.5_`;

    await sock.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
      },
      { quoted: m }
    );

    try {
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch {}
  } catch (err) {
    console.error('[TIKTOK SEARCH ERROR]', err.message);
    try {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    } catch {}
    return m.reply(`❌ Gagal mencari video TikTok: ${err.message}`);
  }
}

module.exports = {
  config: pluginConfig,
  handler,
  searchTikwm,
};
