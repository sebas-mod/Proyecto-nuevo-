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
  description: 'Temporizador de productividad Pomodoro: enfoque, descanso, y auto @-@ recordatorio',
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
    if (!cur) return m.reply('⚠No hay pomdoro sesi caminando por ahí.');
    stop();
    return m.reply('🛑* Sesi Pomodoro es detenido.');
  }

  if (['status', 'cek'].includes(a)) {
    return m.reply(
      cur
        ? `🍅 *STATUS POMODORO*\n\n` +
            `┣ 📌 Fase: *${cur.phase.toUpperCase()}*\n` +
            `┣ 🔄 Sesi: *${cur.cycle}/4*\n` +
            `┗ ⏳SUSA SEKtu: *${left(cur)}*`
        : '⚠No hay pomdoro sesi caminando por ahí.'
    );
  }

  if (cur) {
    return m.reply(
      `⚠¡A Sesi Pomodoro sigue caminando!\n` +
        `• Fase: *${cur.phase}* (restante${left(cur)})\n` +
        `•Hentikan con:\`${p}pomodoro stop\``
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
          return say(`🍅 ${tag} 🎉" N.o 91; N.o.: " El Gran Año del Año ".\nTome un descanso de 15 @-@ 30 @-@ minuto para refrescar su mente.`);
        }
        say(`🍅 ${tag} ⏰>#91; ¡El tiempo de enfoque se ha acabado!\nPor favor, descansa.${r.brk}minuto*—Estira tu cuerpo y bebe agua.`);
        go('istirahat', r.brk);
      } else {
        r.cycle++;
        say(`🍅 ${tag} 🔔> 91; Tiempo para el resto de Agotado! &#93;\nVe al Sesi${r.cycle}/4*: Fokus *${r.focus}¡Minito, empieza ahora!`);
        go('fokus', r.focus);
      }
    }, min * 60000);
    if (r.timer.unref) r.timer.unref();
  };

  go('fokus', focus);

  return m.reply(
    `🍅 *POMODORO TIMER Comenzó!*\n\n` +
      `┣ 🎯 Fokus : *${focus}minuto*\n` +
      `┣ ☕ Descanso: *${brk}minuto*\n` +
      `┣ 🔄 Total : 4 Siklus\n` +
      `┗ 🔔Las notificaciones serán enviadas a este gráfico.\n\n` +
      `Comando:\`${p}pomodoro status\` • \`${p}pomodoro stop\`_`
  );
}

module.exports = {
  config: pluginConfig,
  handler,
};
