const { getDatabase } = require('../../src/lib/ourin-database.js');

const MIN_BET = 100;
const MAX_BET = 500000;
const MAX_PLAYERS = 6;
const TURN_MS = 60000;
const LOBBY_MS = 5 * 60000;

const games = new Map();

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const newShoe = () =>
  shuffle(Array.from({ length: 4 }, () => RANKS.flatMap((r) => SUITS.map((s) => ({ r, s })))).flat());

const label = (c) => `${c.r}${c.s}`;

function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.r === 'A') {
      aces++;
      total += 11;
    } else if (['J', 'Q', 'K'].includes(c.r)) {
      total += 10;
    } else {
      total += Number(c.r);
    }
  }
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return total;
}

const isNatural = (cards) => cards.length === 2 && handValue(cards) === 21;

const num = (jid) => String(jid || '').split('@')[0];

const say = (game, text, mentions = []) =>
  game.sock.sendMessage(game.jid, { text, mentions: mentions.length ? mentions : undefined }).catch(() => null);

function playerRow(p, now) {
  const v = handValue(p.cards);
  const tag =
    p.state === 'bust'
      ? ' 💥 BUST'
      : p.state === 'bj'
        ? ' 🌟 BLACKJACK'
        : p.state === 'stand'
          ? ' ✋ STAND'
          : '';
  return `${now ? '▸' : '•'} @${num(p.jid)} : ${p.cards.map(label).join(' ')} = ${v}${tag}${p.doubled ? ' (x2)' : ''}`;
}

function tableText(game, revealDealer = false) {
  const d = game.dealer;
  const dealerLine = revealDealer ? `${d.map(label).join(' ')} = ${handValue(d)}` : `${label(d[0])} 🂠`;
  const cur = game.players[game.turn];
  return [
    `╭─「 ♠ *BLACKJACK TABLE* ♥ 」`,
    `│ 💰 Taruhan : ${(game.bet).toLocaleString('id-ID')} Koin`,
    `│ 🃏 Dealer  : ${dealerLine}`,
    `│`,
    ...game.players.map((p) => `│ ${playerRow(p, !revealDealer && p === cur && p.state === 'play')}`),
    `╰─────────────────────────`,
  ].join('\n');
}

const mentionsOf = (game) => game.players.map((p) => p.jid);

const drop = (game) => {
  if (game.timer) clearTimeout(game.timer);
  if (game.lobbyTimer) clearTimeout(game.lobbyTimer);
  if (games.get(game.jid) === game) games.delete(game.jid);
};

const canDouble = (game, p) => p.cards.length === 2 && !p.doubled && p.state === 'play';

async function next(game) {
  if (game.timer) clearTimeout(game.timer);
  const idx = game.players.findIndex((p) => p.state === 'play');
  if (idx === -1) return finish(game);

  game.turn = idx;
  const p = game.players[idx];
  const opts = canDouble(game, p) ? '*.bj hit*, *.bj stand*, *.bj double*' : '*.bj hit*, *.bj stand*';
  await say(
    game,
    `${tableText(game)}\n\n👉 Giliran @${num(p.jid)} — Ketik: ${opts} (Waktu: ${TURN_MS / 1000}s)`,
    mentionsOf(game)
  );

  game.timer = setTimeout(async () => {
    if (games.get(game.jid) !== game || game.turn !== idx || p.state !== 'play') return;
    p.state = 'stand';
    await say(game, `⏰ @${num(p.jid)} kehabisan waktu, otomatis *STAND*.`, [p.jid]);
    next(game).catch(() => null);
  }, TURN_MS);
  if (game.timer.unref) game.timer.unref();
}

async function finish(game) {
  if (game.timer) clearTimeout(game.timer);
  if (game.players.some((p) => p.state !== 'bust') && !isNatural(game.dealer)) {
    while (handValue(game.dealer) < 17) game.dealer.push(game.shoe.pop());
  }
  const dv = handValue(game.dealer);
  const dNat = isNatural(game.dealer);
  const dBust = dv > 21;

  const db = getDatabase();
  const lines = [];

  for (const p of game.players) {
    const pv = handValue(p.cards);
    let result;
    if (p.state === 'bust') result = 'lose';
    else if (p.state === 'bj') result = dNat ? 'push' : 'bj';
    else if (dNat) result = 'lose';
    else if (dBust || pv > dv) result = 'win';
    else if (pv === dv) result = 'push';
    else result = 'lose';

    const user = db.getUser ? db.getUser(p.jid) : (db.data.users[p.jid] ||= {});
    let delta = 0;
    if (result === 'bj') delta = Math.floor(p.bet * 1.5);
    else if (result === 'win') delta = p.bet;
    else if (result === 'lose') delta = -p.bet;

    user.koin = Math.max(0, (user.koin || 0) + delta);

    const txt = {
      bj: '🌟 Blackjack!',
      win: '✅ Menang',
      push: '🤝 Seri',
      lose: p.state === 'bust' ? '💥 Bust' : '❌ Kalah',
    }[result];

    lines.push(`${txt} @${num(p.jid)} : ${delta > 0 ? '+' : ''}${delta.toLocaleString('id-ID')} Koin`);
  }

  const text = [
    tableText(game, true),
    '',
    dNat ? '🃏 Dealer Blackjack!' : dBust ? '🃏 Dealer Bust (Lewat 21)!' : `🃏 Dealer berhenti di nilai ${dv}`,
    ...lines,
    '',
    '_Main lagi: .bj <taruhan>_',
  ].join('\n');

  drop(game);
  return say(game, text, game.players.map((p) => p.jid));
}

async function startRound(game) {
  const db = getDatabase();
  const keep = [];
  for (const p of game.players) {
    const user = db.getUser ? db.getUser(p.jid) : (db.data.users[p.jid] ||= {});
    if ((user.koin || 0) >= game.bet) {
      keep.push(p);
    } else {
      await say(game, `@${num(p.jid)} koinnya tidak mencukupi, dikeluarkan dari meja.`, [p.jid]);
    }
  }

  if (!keep.length) {
    drop(game);
    return say(game, 'Semua pemain tidak memiliki cukup koin, meja dibatalkan.');
  }

  game.players = keep;
  if (game.lobbyTimer) clearTimeout(game.lobbyTimer);
  game.status = 'play';
  game.shoe = newShoe();
  game.dealer = [game.shoe.pop(), game.shoe.pop()];
  for (const p of game.players) {
    p.cards = [game.shoe.pop(), game.shoe.pop()];
    p.state = isNatural(p.cards) ? 'bj' : 'play';
  }

  if (isNatural(game.dealer)) {
    for (const p of game.players) if (p.state === 'play') p.state = 'stand';
    return finish(game);
  }

  return next(game);
}

const pluginConfig = {
  name: 'blackjack',
  alias: ['bj', 'bj-hit', 'bj-stand', 'bj-double', 'bj-join', 'bj-start', 'bj-stop', 'bj-help'],
  category: 'game',
  description: 'Permainan kartu kasino Blackjack multiplayer bersama bandar bot',
  usage: '.bj <taruhan> | .bj join | .bj start | .bj hit | .bj stand | .bj double | .bj stop',
  example: '.bj 1000',
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 2,
  limit: 0,
  isEnabled: true,
};

async function handler(m, context) {
  const { sock, args, command, prefix } = context;
  const p = prefix || '.';
  const jid = m.chat;
  const db = getDatabase();

  let sub = (args[0] || '').toLowerCase();
  let cmd = command.toLowerCase();

  if (cmd.startsWith('bj-')) {
    sub = cmd.replace('bj-', '');
  }

  const game = games.get(jid);
  const canManage = (g) => m.isAdmin || m.isOwner || g.host === m.sender;

  if (sub === 'help') {
    return m.reply(
      `♠ *BLACKJACK MULTIPLAYER* ♥\n\n` +
        `Kalahkan kartu dealer (bot) dengan nilai sedekat mungkin ke 21 tanpa melebihi 21.\n` +
        `• Kartu As = 1 atau 11\n` +
        `• J, Q, K = 10\n` +
        `• Kartu 2-10 = Sesuai angka\n\n` +
        `*Daftar Perintah:*\n` +
        `• \`${p}bj <taruhan>\` — Buka meja baru (maks 6 pemain)\n` +
        `• \`${p}bj join\` — Ikut meja\n` +
        `• \`${p}bj start\` — Mulai ronde (oleh host/admin)\n` +
        `• \`${p}bj hit\` — Ambil 1 kartu tambahan\n` +
        `• \`${p}bj stand\` — Pertahankan kartu saat ini\n` +
        `• \`${p}bj double\` — Lipatgandakan taruhan + ambil 1 kartu terakhir\n` +
        `• \`${p}bj stop\` — Batalkan meja\n\n` +
        `Taruhan: ${MIN_BET.toLocaleString('id-ID')} - ${MAX_BET.toLocaleString('id-ID')} Koin.`
    );
  }

  if (!sub || (!['join', 'start', 'hit', 'stand', 'double', 'stop'].includes(sub) && !isNaN(parseInt(sub)))) {
    if (game) {
      return m.reply(
        `Meja Blackjack sedang aktif di grup ini!\n` +
          `Status: *${game.status.toUpperCase()}*\n` +
          `Ikut: \`${p}bj join\` | Mulai: \`${p}bj start\``
      );
    }

    const bet = parseInt((sub || args[0] || '').replace(/[^\d]/g, ''), 10);
    if (!bet || bet < MIN_BET || bet > MAX_BET) {
      return m.reply(
        `Format: \`${p}bj <jumlah_koin>\`\n` +
          `Contoh: \`${p}bj 5000\`\n` +
          `Taruhan antara ${MIN_BET.toLocaleString('id-ID')} s/d ${MAX_BET.toLocaleString('id-ID')} Koin.`
      );
    }

    const user = db.getUser ? db.getUser(m.sender) : (db.data.users[m.sender] ||= {});
    if ((user.koin || 0) < bet) {
      return m.reply(`Koin kamu tidak cukup! Sisa koinmu: ${(user.koin || 0).toLocaleString('id-ID')} Koin.`);
    }

    const g = {
      jid,
      sock,
      bet,
      host: m.sender,
      status: 'lobby',
      turn: 0,
      dealer: [],
      shoe: [],
      players: [
        {
          jid: m.sender,
          name: m.pushName || num(m.sender),
          cards: [],
          bet,
          state: 'play',
          doubled: false,
        },
      ],
    };

    g.lobbyTimer = setTimeout(() => {
      if (games.get(jid) !== g || g.status !== 'lobby') return;
      drop(g);
      say(g, '⏰ Meja Blackjack dibatalkan otomatis karena tidak dimulai dalam 5 menit.');
    }, LOBBY_MS);
    if (g.lobbyTimer.unref) g.lobbyTimer.unref();

    games.set(jid, g);
    return sock.sendMessage(
      jid,
      {
        text:
          `♠ *MEJA BLACKJACK DIBUKA!* ♥\n\n` +
          `👤 *Host:* @${num(m.sender)}\n` +
          `💰 *Taruhan:* ${bet.toLocaleString('id-ID')} Koin / orang\n\n` +
          `👉 Ketik \`${p}bj join\` untuk bergabung (Maks ${MAX_PLAYERS} pemain)\n` +
          `👉 Ketik \`${p}bj start\` untuk memulai ronde`,
        mentions: [m.sender],
      },
      { quoted: m }
    );
  }

  if (!game) return m.reply(`Belum ada meja Blackjack di grup ini. Ketik \`${p}bj <taruhan>\` untuk membuka meja!`);

  if (sub === 'stop') {
    if (!canManage(game)) return m.reply('Hanya pembuat meja atau admin grup yang dapat membatalkan meja.');
    drop(game);
    return m.reply('🛑 Meja Blackjack dibatalkan.');
  }

  if (sub === 'join') {
    if (game.status !== 'lobby') return m.reply('Ronde sudah berjalan, silakan tunggu ronde berikutnya selesai.');
    if (game.players.some((p) => p.jid === m.sender)) return m.reply('Kamu sudah bergabung di meja ini.');
    if (game.players.length >= MAX_PLAYERS) return m.reply(`Meja sudah penuh (maksimal ${MAX_PLAYERS} pemain).`);

    const user = db.getUser ? db.getUser(m.sender) : (db.data.users[m.sender] ||= {});
    if ((user.koin || 0) < game.bet) {
      return m.reply(`Koin kamu tidak cukup untuk taruhan ${game.bet.toLocaleString('id-ID')} Koin.`);
    }

    game.players.push({
      jid: m.sender,
      name: m.pushName || num(m.sender),
      cards: [],
      bet: game.bet,
      state: 'play',
      doubled: false,
    });

    return sock.sendMessage(
      jid,
      {
        text: `✅ @${num(m.sender)} bergabung ke meja. Total Pemain: ${game.players.length}/${MAX_PLAYERS}`,
        mentions: [m.sender],
      },
      { quoted: m }
    );
  }

  if (sub === 'start') {
    if (game.status !== 'lobby') return m.reply('Ronde sudah sedang berjalan.');
    if (!canManage(game)) return m.reply('Hanya pembuat meja atau admin yang dapat memulai game.');
    game.status = 'starting';
    try {
      return await startRound(game);
    } catch (e) {
      drop(game);
      return m.reply(`Terjadi kesalahan: ${e.message}`);
    }
  }

  if (['hit', 'stand', 'double'].includes(sub)) {
    if (game.status !== 'play') return m.reply('Ronde belum dimulai.');
    const pPlayer = game.players[game.turn];
    if (!pPlayer || pPlayer.jid !== m.sender) {
      const isParticipant = game.players.some((x) => x.jid === m.sender);
      return m.reply(isParticipant ? 'Belum giliranmu!' : 'Kamu tidak terdaftar di meja ini.');
    }
    if (pPlayer.state !== 'play') return m.reply('Kamu sudah selesai di ronde ini.');

    if (sub === 'double') {
      if (!canDouble(game, pPlayer)) return m.reply('Double hanya bisa dilakukan pada 2 kartu pertama!');
      const user = db.getUser ? db.getUser(m.sender) : (db.data.users[m.sender] ||= {});
      if ((user.koin || 0) < pPlayer.bet * 2) return m.reply('Koinmu tidak cukup untuk Double taruhan!');
      pPlayer.bet *= 2;
      pPlayer.doubled = true;
    }

    if (sub === 'hit' || sub === 'double') {
      pPlayer.cards.push(game.shoe.pop());
      const v = handValue(pPlayer.cards);
      if (v > 21) pPlayer.state = 'bust';
      else if (v === 21 || sub === 'double') pPlayer.state = 'stand';
    } else {
      pPlayer.state = 'stand';
    }

    if (game.timer) clearTimeout(game.timer);
    return next(game);
  }
}

module.exports = {
  config: pluginConfig,
  handler,
};
