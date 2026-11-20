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
    `│ 💰 Taruhan : ${(game.bet).toLocaleString('id-ID')}Monedas`,
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
    `${tableText(game)}\n\n👉 Giliran @${num(p.jid)} —Escribe:${opts}(Tiempo:${TURN_MS / 1000}s)`,
    mentionsOf(game)
  );

  game.timer = setTimeout(async () => {
    if (games.get(game.jid) !== game || game.turn !== idx || p.state !== 'play') return;
    p.state = 'stand';
    await say(game, `⏰ @${num(p.jid)}Halicidad del tiempo, automática.`, [p.jid]);
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

    lines.push(`${txt} @${num(p.jid)} : ${delta > 0 ? '+' : ''}${delta.toLocaleString('id-ID')}Monedas`);
  }

  const text = [
    tableText(game, true),
    '',
    dNat ? '🃏 Dealer Blackjack!' : dBust ? '🃏 Dealer Bust (Lewat 21)!' : `🃏El concesionario se detuvo en la casa de campo.${dv}`,
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
      await say(game, `@${num(p.jid)}La moneda no cubre, está fuera de las principales.`, [p.jid]);
    }
  }

  if (!keep.length) {
    drop(game);
    return say(game, 'Todos los jugadores no tienen suficientes monedas, se cancelan.');
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
  description: 'Blackjack multijugador cartu dibujos animados con botaduras',
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
        `Derrotar el cartucho del crupier con el próximo número posible a 21 sin un 21.\n` +
        `•Kartu As = 1 o 11\n` +
        `• J, Q, K = 10\n` +
        `•Kartu 2 - 10 = Algunos números\n\n` +
        `*Lista de comandos:*\n` +
        `• \`${p}bj<taruhan>\` —Nuevos mace ( hace 6 jugadores )\n` +
        `• \`${p}bj join\` — Ikut meja\n` +
        `• \`${p}bj start\` —Starai ronda ( por host / administrador )\n` +
        `• \`${p}Bj hit\` —Toma 1 cartuto extra\n` +
        `• \`${p}bj stand\` —Mantenga la tarjeta actual\n` +
        `• \`${p}bj doble\` —Doble la apuesta + tomar 1 último cartuto\n` +
        `• \`${p}bj stop\` —Cancela mesa\n\n` +
        `Taruhan: ${MIN_BET.toLocaleString('id-ID')} - ${MAX_BET.toLocaleString('id-ID')}Monedas.`
    );
  }

  if (!sub || (!['join', 'start', 'hit', 'stand', 'double', 'stop'].includes(sub) && !isNaN(parseInt(sub)))) {
    if (game) {
      return m.reply(
        `Blackjack Mesa está activo en ègrupo!\n` +
          `Status: *${game.status.toUpperCase()}*\n` +
          `Ikut: \`${p}" Mi corazón está corriendo ".\`| Empieza:\`${p}bj start\``
      );
    }

    const bet = parseInt((sub || args[0] || '').replace(/[^\d]/g, ''), 10);
    if (!bet || bet < MIN_BET || bet > MAX_BET) {
      return m.reply(
        `Formato:\`${p}bj <jumlah_koin>\`\n` +
          `Ejemplo:\`${p}bj 5000\`\n` +
          `Taruhan entre${MIN_BET.toLocaleString('id-ID')} s/d ${MAX_BET.toLocaleString('id-ID')}Monedas.`
      );
    }

    const user = db.getUser ? db.getUser(m.sender) : (db.data.users[m.sender] ||= {});
    if ((user.koin || 0) < bet) {
      return m.reply(`¡No eres suficiente!${(user.koin || 0).toLocaleString('id-ID')}Monedas.`);
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
      say(g, '⏰El hechizo de Blackjack se acorta por automatización por no comenzar en cinco minutos.');
    }, LOBBY_MS);
    if (g.lobbyTimer.unref) g.lobbyTimer.unref();

    games.set(jid, g);
    return sock.sendMessage(
      jid,
      {
        text:
          `♠* Significa que se abre la puerta!♥\n\n` +
          `👤 *Host:* @${num(m.sender)}\n` +
          `💰 *Taruhan:* ${bet.toLocaleString('id-ID')} Monedas / persona\n\n` +
          `👉Escribe\`${p}" Mi corazón está corriendo ".\`para el uso del mace ( MAS)${MAX_PLAYERS}jugador)\n` +
          `👉Escribe\`${p}bj start\`Los honradores a la ronda.`,
        mentions: [m.sender],
      },
      { quoted: m }
    );
  }

  if (!game) return m.reply(`Hay un Blackjack en este grupo.\`${p}bj<taruhan>\`¡Para abrir la casa!`);

  if (sub === 'stop') {
    if (!canManage(game)) return m.reply('Sólo un fabricante o un administrador grupo puede revelur una malla.');
    drop(game);
    return m.reply('🛑 Meja Blackjack dibatalkan.');
  }

  if (sub === 'join') {
    if (game.status !== 'lobby') return m.reply('Ronde está en camino, por favor espere a que la siguiente ronde sea completado.');
    if (game.players.some((p) => p.jid === m.sender)) return m.reply('Ya estás en está habitación.');
    if (game.players.length >= MAX_PLAYERS) return m.reply(`El Mesa está lleno ( máx¡No!${MAX_PLAYERS}jugador).`);

    const user = db.getUser ? db.getUser(m.sender) : (db.data.users[m.sender] ||= {});
    if ((user.koin || 0) < game.bet) {
      return m.reply(`Tela no eres suficiente para positar${game.bet.toLocaleString('id-ID')}Monedas.`);
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
        text: `✅ @${num(m.sender)}Voy a ir al hotel, y voy a ir a la sala de drama.${game.players.length}/${MAX_PLAYERS}`,
        mentions: [m.sender],
      },
      { quoted: m }
    );
  }

  if (sub === 'start') {
    if (game.status !== 'lobby') return m.reply('Ronde ya está en camino.');
    if (!canManage(game)) return m.reply('Sólo el fabricante del méjé o administrador puede cantar el juego.');
    game.status = 'starting';
    try {
      return await startRound(game);
    } catch (e) {
      drop(game);
      return m.reply(`Se produjo un error:${e.message}`);
    }
  }

  if (['hit', 'stand', 'double'].includes(sub)) {
    if (game.status !== 'play') return m.reply('Ronde no ha sido cartografiado todavía.');
    const pPlayer = game.players[game.turn];
    if (!pPlayer || pPlayer.jid !== m.sender) {
      const isParticipant = game.players.some((x) => x.jid === m.sender);
      return m.reply(isParticipant ? 'Belum giliranmu!' : 'No está en está mesa.');
    }
    if (pPlayer.state !== 'play') return m.reply('Usted ha terminado aquí en la ronde.');

    if (sub === 'double') {
      if (!canDouble(game, pPlayer)) return m.reply('¡El doble solo puede hacerse en las dos primeras cartas!');
      const user = db.getUser ? db.getUser(m.sender) : (db.data.users[m.sender] ||= {});
      if ((user.koin || 0) < pPlayer.bet * 2) return m.reply('¡Tu moneda no es suficiente para una apuesta doble!');
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
