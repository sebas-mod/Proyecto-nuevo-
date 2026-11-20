const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const pluginConfig = {
  name: 'bass',
  alias: ['bassboost', 'boostbass'],
  category: 'convert',
  description: 'Meningkatkan frekuensi bass pada audio / voice note',
  usage: '.bass (reply audio/vn)',
  example: '.bass',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  limit: 1,
  isEnabled: true,
};

async function handler(m, context) {
  const { sock, prefix, command } = context;
  const p = prefix || '.';

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mimetype || '';

  if (!/audio/.test(mime)) {
    return m.reply(`Balas (reply) pesan audio atau Voice Note dengan perintah: \`${p}${command}\``);
  }

  const tmpDir = path.join(process.cwd(), 'database', 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const inputPath = path.join(tmpDir, `in_${id}.mp3`);
  const outputPath = path.join(tmpDir, `out_${id}.mp3`);

  let mediaBuffer = null;
  try {
    if (typeof q.download === 'function') {
      mediaBuffer = await q.download();
    } else if (m.quoted && typeof m.quoted.download === 'function') {
      mediaBuffer = await m.quoted.download();
    }
  } catch (dlErr) {
    return m.reply('❌ Gagal mengunduh audio. Pastikan audio masih dapat diputar.');
  }

  if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
    return m.reply('❌ Gagal memproses buffer audio dari pesan yang di-reply.');
  }

  fs.writeFileSync(inputPath, mediaBuffer);

  try {
    await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  } catch {}

  const ffmpegFilter = '-af equalizer=f=94:width_type=o:width=2:g=18';
  exec(`ffmpeg -hide_banner -loglevel error -y -i "${inputPath}" ${ffmpegFilter} "${outputPath}"`, async (err) => {
    try {
      try {
        fs.unlinkSync(inputPath);
      } catch {}
      if (err) {
        return m.reply('❌ Gagal mengaplikasikan efek bass boost pada audio.');
      }

      const buff = fs.readFileSync(outputPath);
      await sock.sendMessage(
        m.chat,
        {
          audio: buff,
          mimetype: 'audio/mpeg',
          ptt: false,
        },
        { quoted: m }
      );

      try {
        fs.unlinkSync(outputPath);
      } catch {}

      try {
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch {}
    } catch (sendErr) {
      console.error('[BASS ERROR]', sendErr.message);
      return m.reply('❌ Terjadi kesalahan saat mengirim hasil audio.');
    }
  });
}

module.exports = {
  config: pluginConfig,
  handler,
};
