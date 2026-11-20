const NISAB = 85; //Nisab 85 gramos de emasa
const RATE = 0.025; // 2.5%

function parseNominal(str) {
  if (!str) return 0;
  const s = String(str).toLowerCase().trim().replace(/,/g, '.');
  let mult = 1;
  if (s.endsWith('jt') || s.endsWith('juta')) mult = 1000000;
  else if (s.endsWith('k') || s.endsWith('rb') || s.endsWith('ribu')) mult = 1000;
  else if (s.endsWith('m') || s.endsWith('miliar') || s.endsWith('milyar')) mult = 1000000000;
  const num = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num * mult;
}

function rupiah(num) {
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

const pluginConfig = {
  name: 'zakat',
  alias: ['hitungzakat', 'kalkulatorzakat'],
  category: 'islamic',
  description: 'Calculadora zap: ingresos, maal, emas y grasas',
  usage: '.zakat <penghasilan | maal | emas | fitrah> <nominal> <harga_emas/beras>',
  example: '.zakat penghasilan 8jt 1500000',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  limit: 0,
  isEnabled: true,
};

async function handler(m, context) {
  const { args, prefix, command } = context;
  const p = prefix || '.';
  const jenis = (args[0] || '').toLowerCase();

  const help =
    `🕌 *KALKULATOR ZAKAT ISLAMI*\n\n` +
    `*Formato Uso:*\n` +
    `• \`${p}${command} penghasilan <gaji/bln> <harga_emas/gram>\`\n` +
    `> 91; Aplausos > 93;\`${p}${command} penghasilan 8jt 1500000\`_\n\n` +
    `• \`${p}${command} maal <total_harta> <harga_emas/gram>\`\n` +
    `> 91; Aplausos > 93;\`${p}${command} maal 200jt 1500000\`_\n\n` +
    `• \`${p}${command}oro<gram_emas> <harga_emas/gram>\`\n` +
    `> 91; Aplausos > 93;\`${p}${command}oro 100 1500000\`¿Qué?\n\n` +
    `• \`${p}${command} fitrah <jumlah_jiwa> <harga_beras/kg>\`\n` +
    `> 91; Aplausos > 93;\`${p}${command} fitrah 4 15000\`\n\n` +
    `La emasa Nisab es de 85 gramos con una tasa de 2, 5 % acat.`;

  if (!jenis) return m.reply(help);

  const note = `\n\nPara confirmar la distribución a BAZNAS / LAZ`;

  if (jenis === 'fitrah') {
    const jiwa = parseInt(args[1], 10);
    const harga = parseNominal(args[2]);
    if (!(jiwa >= 1) || !(harga > 0)) return m.reply(help);
    return m.reply(
      `🕌 *ZAKAT FITRAH*\n\n` +
        `👥*Cantidad Jiwa:*${jiwa}\n` +
        `🌾 *Kadar per Jiwa:* 2,5 kg beras\n\n` +
        `┣ Total Beras : *${jiwa * 2.5} kg*\n` +
        `┣Dinero igual: *${rupiah(jiwa * 2.5 * harga)}* (@ ${rupiah(harga)}/kg)\n` +
        `┗ Per Jiwa : ${rupiah(2.5 * harga)}\n\n` +
        `" Vivir en un estado de 2, 5 km por tamaño ",`
    );
  }

  const x = parseNominal(args[1]);
  const emas = parseNominal(args[2]);
  if (!(x > 0) || !(emas > 0) || !['penghasilan', 'maal', 'emas'].includes(jenis)) return m.reply(help);

  const nisab = NISAB * emas;

  if (jenis === 'penghasilan') {
    const nb = nisab / 12;
    const wajib = x >= nb;
    return m.reply(
      `🕌 *ZAKAT PENGHASILAN (PROFESI)*\n\n` +
        `💵*Penghasilan/Mes:*${rupiah(x)}\n` +
        `⚖️ *Nisab/Mes:*${rupiah(nb)}( 85 grs de oro÷12${rupiah(emas)})\n\n` +
        (wajib
          ? `✅* Si Apali Nisab ( Obligatorio Zakat) *\n` +
            `┣Zakat por mes: *${rupiah(x * RATE)}*\n` +
            `┗Estimaciones por año: *${rupiah(x * RATE * 12)}*`
          : `❌* Aún no Capai Nisab *\n` +
            `Aún no es requerido por zap${rupiah(nb - x)}). Tetap dianjurkan bersedekah / infak seikhlasnya.`) +
        note
    );
  }

  if (jenis === 'maal') {
    const wajib = x >= nisab;
    return m.reply(
      `🕌 *ZAKAT MAAL (HARTA SIMPANAN)*\n\n` +
        `💰 *Total Harta:* ${rupiah(x)}\n` +
        `⚖️ *Nisab:* ${rupiah(nisab)}( 85 grs de oro @${rupiah(emas)})\n\n` +
        (wajib
          ? `✅* Nasab dhaskCapki ( Obligatorio Zakat si haul 1 yar) *\n` +
            `┗Emitido Zakat: *${rupiah(x * RATE)}*`
          : `❌* Aún no Capai Nisab *\n` + `Menos${rupiah(nisab - x)}Para llegar a la harta de nisab.`) +
        note
    );
  }

  if (jenis === 'emas') {
    const gram = parseFloat(args[1]);
    const wajib = gram >= NISAB;
    const totalNilai = gram * emas;
    return m.reply(
      `🕌> 91; ROCK LOGAM MULIE ( GOLD ) &#93;\n\n` +
        `🪙*Pesado Oro:*${gram} gram\n` +
        `⚖️ *Nisab:* 85 gram emas\n` +
        `💵*Total Valor:*${rupiah(totalNilai)} (@ ${rupiah(emas)}/gram)\n\n` +
        (wajib
          ? `✅* CaPai Nisab ( Obligatorio Zakat) *\n` +
            `┣En el gramo de curvatura: *${(gram * RATE).toFixed(2)}gram oro*\n` +
            `┗En el abismo del dinero: *${rupiah(totalNilai * RATE)}*`
          : `❌* Aún no Capai Nisab *\n` + `Menos${(NISAB - gram).toFixed(2)}gram oro.`) +
        note
    );
  }
}

module.exports = {
  config: pluginConfig,
  handler,
};
