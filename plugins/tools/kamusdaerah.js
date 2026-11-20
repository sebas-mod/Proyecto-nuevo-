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
      `📖 *KAMUS BAHASA Zona INDONESIA*\n\n` +
        `*Ejemplo de uso:*\n` +
        `• \`${p}${command}come\`( Busca en todos los idiomas )\n` +
        `• \`${p}${command}# Muchas gracias #\`(Espaciamiento especial del suelo )\n` +
        `• \`${p}${command}sunda nuhun\`( Busca que significa palabra Sunda )\n` +
        `• \`${p}${command}lista\`( Mostrar lista de palabras )\n\n` +
        `*Bahasa Disponible:*\n${info}`
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
    return m.reply(`La palabra es pura.\nEjemplo:\`${p}${command} ${only} makan\``);
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
      out.push(`• *${langObj.nama}:* ${daerah}(de Indonesia:${indo}")`);
    }
    for (const [indo, daerah] of balik) {
      out.push(`• *${langObj.nama}:* ${daerah} ➔ Bahasa Indonesia: "${indo}"`);
    }
  }

  if (!out.length) {
    return m.reply(`❌ Kata *"${q}No puede encontrarlo en la zona.`);
  }

  return m.reply(`📚 *Resultado KAMUS BAHASA Zona:*\n\n${out.join('\n')}`);
}

module.exports = {
  config: pluginConfig,
  handler,
};
