const NISAB = 85; // Nisab 85 gram emas
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
  description: 'Kalkulator zakat: penghasilan, maal (harta), emas, dan fitrah',
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
    `*Format Penggunaan:*\n` +
    `• \`${p}${command} penghasilan <gaji/bln> <harga_emas/gram>\`\n` +
    `  _Contoh: \`${p}${command} penghasilan 8jt 1500000\`_\n\n` +
    `• \`${p}${command} maal <total_harta> <harga_emas/gram>\`\n` +
    `  _Contoh: \`${p}${command} maal 200jt 1500000\`_\n\n` +
    `• \`${p}${command} emas <gram_emas> <harga_emas/gram>\`\n` +
    `  _Contoh: \`${p}${command} emas 100 1500000\`_\n\n` +
    `• \`${p}${command} fitrah <jumlah_jiwa> <harga_beras/kg>\`\n` +
    `  _Contoh: \`${p}${command} fitrah 4 15000\`\n\n` +
    `_Catatan: Nisab emas adalah 85 gram dengan kadar zakat 2,5%._`;

  if (!jenis) return m.reply(help);

  const note = `\n\n_Perhitungan berdasar ketentuan fiqih umum (nisab 85 gr emas, kadar 2,5%). Untuk kepastian konsultasikan ke BAZNAS / LAZ setempat._`;

  if (jenis === 'fitrah') {
    const jiwa = parseInt(args[1], 10);
    const harga = parseNominal(args[2]);
    if (!(jiwa >= 1) || !(harga > 0)) return m.reply(help);
    return m.reply(
      `🕌 *ZAKAT FITRAH*\n\n` +
        `👥 *Jumlah Jiwa:* ${jiwa}\n` +
        `🌾 *Kadar per Jiwa:* 2,5 kg beras\n\n` +
        `┣ Total Beras : *${jiwa * 2.5} kg*\n` +
        `┣ Setara Uang : *${rupiah(jiwa * 2.5 * harga)}* (@ ${rupiah(harga)}/kg)\n` +
        `┗ Per Jiwa : ${rupiah(2.5 * harga)}\n\n` +
        `_Ketentuan 2,5 kg beras sesuai ketetapan BAZNAS._`
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
        `💵 *Penghasilan/Bulan:* ${rupiah(x)}\n` +
        `⚖️ *Nisab/Bulan:* ${rupiah(nb)} (85 gr emas ÷ 12 @ ${rupiah(emas)})\n\n` +
        (wajib
          ? `✅ *Sudah Mencapai Nisab (Wajib Zakat)*\n` +
            `┣ Zakat per Bulan : *${rupiah(x * RATE)}*\n` +
            `┗ Estimasi per Tahun : *${rupiah(x * RATE * 12)}*`
          : `❌ *Belum Mencapai Nisab*\n` +
            `Belum diwajibkan zakat (kurang ${rupiah(nb - x)}). Tetap dianjurkan bersedekah / infak seikhlasnya.`) +
        note
    );
  }

  if (jenis === 'maal') {
    const wajib = x >= nisab;
    return m.reply(
      `🕌 *ZAKAT MAAL (HARTA SIMPANAN)*\n\n` +
        `💰 *Total Harta:* ${rupiah(x)}\n` +
        `⚖️ *Nisab:* ${rupiah(nisab)} (85 gr emas @ ${rupiah(emas)})\n\n` +
        (wajib
          ? `✅ *Mencapai Nisab (Wajib Zakat jika haul 1 tahun)*\n` +
            `┗ Zakat yang dikeluarkan : *${rupiah(x * RATE)}*`
          : `❌ *Belum Mencapai Nisab*\n` + `Kurang ${rupiah(nisab - x)} untuk mencapai nisab harta.`) +
        note
    );
  }

  if (jenis === 'emas') {
    const gram = parseFloat(args[1]);
    const wajib = gram >= NISAB;
    const totalNilai = gram * emas;
    return m.reply(
      `🕌 *ZAKAT LOGAM MULIA (EMAS)*\n\n` +
        `🪙 *Berat Emas:* ${gram} gram\n` +
        `⚖️ *Nisab:* 85 gram emas\n` +
        `💵 *Total Nilai:* ${rupiah(totalNilai)} (@ ${rupiah(emas)}/gram)\n\n` +
        (wajib
          ? `✅ *Mencapai Nisab (Wajib Zakat)*\n` +
            `┣ Dalam bentuk gram : *${(gram * RATE).toFixed(2)} gram emas*\n` +
            `┗ Dalam bentuk uang : *${rupiah(totalNilai * RATE)}*`
          : `❌ *Belum Mencapai Nisab*\n` + `Kurang ${(NISAB - gram).toFixed(2)} gram emas.`) +
        note
    );
  }
}

module.exports = {
  config: pluginConfig,
  handler,
};
