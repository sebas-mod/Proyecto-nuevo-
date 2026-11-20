const axios = require('axios');

const BASE = 'https://data.bmkg.go.id/DataMKG/TEWS';
const SHAKEMAP = 'https://static.bmkg.go.id';

const LISTS = {
  m5: { file: 'gempaterkini.json', title: 'GEMPA M 5.0+ (15 TERAKHIR)' },
  dirasakan: { file: 'gempadirasakan.json', title: 'GEMPA DIRASAKAN (15 TERAKHIR)' },
};

const show = (v, fallback = '-') =>
  v === undefined || v === null || String(v).trim() === '' ? fallback : String(v).trim();

const pluginConfig = {
  name: 'cekgempa',
  alias: ['infogempa', 'gempa'],
  category: 'search',
  description: 'Información de la fiesta sobre el Bumi actual de BMKG con shakemouth',
  usage: '.cekgempa [m5 | dirasakan]',
  example: '.cekgempa',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  limit: 0,
  isEnabled: true,
};

async function handler(m, context) {
  const { sock, text, prefix, command } = context;
  const p = prefix || '.';
  const arg = String(text || '').trim().toLowerCase();

  try {
    if (arg) {
      const key = arg.replace(/\s+/g, '');
      const list = LISTS[key === 'm5.0' || key === 'm5+' ? 'm5' : key];
      if (!list) {
        return m.reply(
          `Elección desconocida.\n\n*Formato Uso:*\n` +
            `• \`${p}${command}\`(Scents más recientes + peta shakefire )\n` +
            `• \`${p}${command}m5\` (15 gempa M 5.0+ terbaru)\n` +
            `• \`${p}${command} dirasakan\` (15 gempa dirasakan terbaru)`
        );
      }

      const res = await axios.get(`${BASE}/${list.file}`, { timeout: 15000 });
      const data = res.data?.Infogempa?.gempa;
      const items = Array.isArray(data) ? data : data ? [data] : [];
      if (!items.length) {
        return m.reply('Las gestas todavía no están disponibles en el servidor BMKG.');
      }

      const lines = items.slice(0, 15).map(
        (g, i) =>
          `*${i + 1}. M ${show(g.Magnitude)}* | ${show(g.Tanggal)} ${show(g.Jam)}\n` +
          `   📍Region:${show(g.Wilayah)}\n` +
          `   🌊 Kedalaman: ${show(g.Kedalaman)}`
      );

      return m.reply(`🌋 *${list.title}*\n\n${lines.join('\n\n')}\n\nSumber: BMKG ( Badan Meteorology, Clicatology, y Geophysics ) _`);
    }

    const res = await axios.get(`${BASE}/autogempa.json`, { timeout: 15000 });
    const g = res.data?.Infogempa?.gempa;
    if (!g || typeof g !== 'object') {
      return m.reply('Los datos más recientes aún no han sido disponibles en el BMKG.');
    }

    const caption =
      `🌋* Nueva información sobre los miembros (BMKG) *\n\n` +
      `📅*Tiempo:*${show(g.Tanggal)} ${show(g.Jam)}\n` +
      `💥 *Magnitudo:* ${show(g.Magnitude)}\n` +
      `🌊 *Kedalaman:* ${show(g.Kedalaman)}\n` +
      `📍*Ubicación:*${show(g.Wilayah)}\n` +
      `🧭 *Koordinat:* ${show(g.Lintang)}, ${show(g.Bujur)}\n` +
      `⚠️ *Potensi:* ${show(g.Potensi)}\n` +
      `📢 *Dirasakan:* ${show(g.Dirasakan)}\n\n` +
      `_Sumber: BMKG Indonesia_`;

    const shakemap = show(g.Shakemap, '');
    if (shakemap) {
      try {
        await sock.sendMessage(
          m.chat,
          {
            image: { url: `${SHAKEMAP}/${shakemap}` },
            caption,
          },
          { quoted: m }
        );
        return;
      } catch (imgErr) {
        // Fallback to text caption if image download fails
      }
    }

    return m.reply(caption);
  } catch (err) {
    console.error('[CEKGEMPA ERROR]', err.message);
    return m.reply(`❌Stempeg recogió los datos de BMKG grandes:${err.message}`);
  }
}

module.exports = {
  config: pluginConfig,
  handler,
};
