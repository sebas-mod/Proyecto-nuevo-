const runs = new Map();

const clamp = (n, lo, hi, d) =>
  Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : d;

const left = (r) => {
  const s = Math.max(0, Math.round((r.ends - Date.now()) / 1000));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}d`;
};

const pluginConfig = {
  name: 'pomodoro',
  alias: ['pomo', 'fokus', 'stoppomodoro'],
  category: 'tools',
  description: 'Timer produktivitas Pomodoro: fokus, istirahat, dan pengingat otomatis',
  usage: '.pomodoro [menit_fokus] [menit_istirahat] | .pomodoro status | .pomodoro stop',
  example: '.pomodoro 25 5',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  limit: 0,
  isEnabled: true,
};

async function handler(m, context) {
  const { sock, args, command, prefix } = context;
  const p = prefix || '.';
  const key = m.chat + '|' + m.sender;
  const a = (args[0] || '').toLowerCase();
  const cur = runs.get(key);

  const stop = () => {
    if (cur) {
      clearTimeout(cur.timer);
      runs.delete(key);
    }
  };

  if (command === 'stoppomodoro' || ['stop', 'berhenti', 'batal'].includes(a)) {
    if (!cur) return m.reply('⚠️ Tidak ada sesi Pomodoro yang sedang berjalan.');
    stop();
    return m.reply('🛑 *Sesi Pomodoro dihentikan.* Istirahat yang cukup dan semangat kembali nanti!');
  }

  if (['status', 'cek'].includes(a)) {
    return m.reply(
      cur
        ? `🍅 *STATUS POMODORO*\n\n` +
            `┣ 📌 Fase: *${cur.phase.toUpperCase()}*\n` +
            `┣ 🔄 Sesi: *${cur.cycle}/4*\n` +
            `┗ ⏳ Sisa Waktu: *${left(cur)}*`
        : '⚠️ Tidak ada sesi Pomodoro yang sedang berjalan.'
    );
  }

  if (cur) {
    return m.reply(
      `⚠️ Sesi Pomodoro kamu masih berjalan!\n` +
        `• Fase: *${cur.phase}* (sisa ${left(cur)})\n` +
        `• Hentikan dengan: \`${p}pomodoro stop\``
    );
  }

  const focus = clamp(parseInt(args[0], 10), 5, 90, 25);
  const brk = clamp(parseInt(args[1], 10), 1, 30, 5);

  const r = {
    phase: 'fokus',
    cycle: 1,
    focus,
    brk,
    ends: 0,
    timer: null,
  };
  runs.set(key, r);

  const tag = '@' + m.sender.split('@')[0];
  const say = (t) =>
    sock.sendMessage(m.chat, { text: t, mentions: [m.sender] }, { quoted: m }).catch(() => {});

  const go = (phase, min) => {
    r.phase = phase;
    r.ends = Date.now() + min * 60000;
    r.timer = setTimeout(() => {
      if (phase === 'fokus') {
        if (r.cycle >= 4) {
          runs.delete(key);
          return say(`🍅 ${tag} 🎉 *Luar Biasa! 4 Sesi Pomodoro Selesai!*\nAmbil istirahat panjang 15-30 menit untuk merefresh pikiran.`);
        }
        say(`🍅 ${tag} ⏰ *Waktu Fokus Selesai!*\nSilakan istirahat *${r.brk} menit* — regangkan tubuh dan minum air.`);
        go('istirahat', r.brk);
      } else {
        r.cycle++;
        say(`🍅 ${tag} 🔔 *Waktu Istirahat Habis!*\nMasuk ke *Sesi ${r.cycle}/4*: Fokus *${r.focus} menit*, mulai sekarang!`);
        go('fokus', r.focus);
      }
    }, min * 60000);
    if (r.timer.unref) r.timer.unref();
  };

  go('fokus', focus);

  return m.reply(
    `🍅 *POMODORO TIMER DIMULAI!*\n\n` +
      `┣ 🎯 Fokus : *${focus} menit*\n` +
      `┣ ☕ Istirahat : *${brk} menit*\n` +
      `┣ 🔄 Total : 4 Siklus\n` +
      `┗ 🔔 Notifikasi akan dikirim otomatis ke chat ini.\n\n` +
      `_Perintah: \`${p}pomodoro status\` • \`${p}pomodoro stop\`_`
  );
}

module.exports = {
  config: pluginConfig,
  handler,
};
