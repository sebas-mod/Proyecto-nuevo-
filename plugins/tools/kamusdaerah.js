const fs = require('fs');
const path = require('path');

let DATA = null;
try {
  const jsonPath = path.join(__dirname, '../../data/kamus.json');
  DATA = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (e) {
  DATA = {};
}

const KEYS = Object.keys(DATA);
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const pluginConfig = {
  name: 'kamusdaerah',
  alias: ['kamus', 'bahasadaerah', 'terjemahdaerah'],
  category: 'tools',
  description: 'Kamus terjemahan bahasa daerah Indonesia (Jawa, Sunda, Minang, Bali, dll)',
  usage: '.kamusdaerah <bahasa | kata>',
  example: '.kamusdaerah jawa mangan',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  limit: 0,
  isEnabled: true,
};

async function handler(m, context) {
  const { text, prefix, command } = context;
  const p = prefix || '.';
  const raw = norm(text);

  if (!raw) {
    const info = KEYS.map((k) => `• ${DATA[k]?.nama || k}: ${Object.keys(DATA[k]?.kata || {}).length} kata`).join('\n');
    return m.reply(
      `📖 *KAMUS BAHASA DAERAH INDONESIA*\n\n` +
        `*Contoh Penggunaan:*\n` +
        `• \`${p}${command} makan\` (Cari di semua bahasa)\n` +
        `• \`${p}${command} jawa terima kasih\` (Spesifik bahasa Jawa)\n` +
        `• \`${p}${command} sunda nuhun\` (Cari arti kata Sunda)\n` +
        `• \`${p}${command} list\` (Tampilkan daftar kata)\n\n` +
        `*Bahasa Tersedia:*\n${info}`
    );
  }

  if (raw === 'list') {
    const preview = KEYS.map((k) => `*${DATA[k].nama}*\n${Object.keys(DATA[k].kata).slice(0, 30).join(', ')}...`).join('\n\n');
    return m.reply(preview);
  }

  const parts = raw.split(' ');
  const first = parts[0];
  const only = KEYS.includes(first) ? first : null;
  const q = only ? parts.slice(1).join(' ').trim() : raw;

  if (!q) {
    return m.reply(`Tulis kata yang ingin dicari.\nContoh: \`${p}${command} ${only} makan\``);
  }

  const pool = only ? [only] : KEYS;
  const out = [];

  for (const k of pool) {
    const langObj = DATA[k];
    if (!langObj) continue;
    const kata = langObj.kata || {};
    const arah = Object.entries(kata).filter(([indo]) => norm(indo) === q);
    const balik = Object.entries(kata).filter(([indo, daerah]) =>
      String(daerah)
        .split(/[\/,]/)
        .some((x) => norm(x) === q)
    );

    for (const [indo, daerah] of arah) {
      out.push(`• *${langObj.nama}:* ${daerah} (dari bahasa Indonesia: "${indo}")`);
    }
    for (const [indo, daerah] of balik) {
      out.push(`• *${langObj.nama}:* ${daerah} ➔ Bahasa Indonesia: "${indo}"`);
    }
  }

  if (!out.length) {
    return m.reply(`❌ Kata *"${q}"* tidak ditemukan di kamus daerah. Coba kata dasar atau periksa ejaan.`);
  }

  return m.reply(`📚 *HASIL KAMUS BAHASA DAERAH:*\n\n${out.join('\n')}`);
}

module.exports = {
  config: pluginConfig,
  handler,
};
