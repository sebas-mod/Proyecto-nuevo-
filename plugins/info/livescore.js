"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const pluginConfig = {
    name: 'livescore',
    alias: ['skorbola', 'livebola', 'skor'],
    category: 'info',
    description: 'Asistir a un juego de puntuación en vivo de fútbol de Goal.',
    usage: '.livescore',
    example: '.livescore',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
};

const _headerGacor = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
};

async function ambilLivescore(edisi = 'id') {
  try {
    const url = edisi === 'id' ? 'https://www.goal.com/id/livescore' : `https://www.goal.com/${edisi}/live-scores`;
    const res = await _axios2.default.get(url, { headers: _headerGacor, timeout: 15000 });
    const cocok = res.data.match(/__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!cocok) throw new Error('Gagalt encontró los datos de registro');
    const json = JSON.parse(cocok[1]);
    const liveScores = _optionalChain([json, 'optionalAccess', _ => _.props, 'optionalAccess', _2 => _2.pageProps, 'optionalAccess', _3 => _3.content, 'optionalAccess', _4 => _4.liveScores]);
    if (!liveScores) throw new Error('Data liveScores kosong');
    return liveScores;
  } catch (error) {
    throw new Error(error.message);
  }
}

function _statusIndo(status) {
  const map = {
    FIXTURE: 'Aún no Empieza',
    LIVE: 'Berlangsung',
    FINISHED: 'Terminado',
    POSTPONED: 'Ditunda',
    CANCELLED: 'Dibatalkan',
    HALF_TIME: 'Turun Minum'
  };
  return map[status] || status;
}

function _rapikanPertandingan(dataMentah) {
  return dataMentah.map(grup => ({
    kompetisi: _optionalChain([grup, 'access', _5 => _5.competition, 'optionalAccess', _6 => _6.name]) || '-',
    pertandingan: (grup.matches || []).map(m => ({
      status: _statusIndo(m.status),
      waktu: m.startDate,
      tuanRumah: _optionalChain([m, 'access', _7 => _7.teamA, 'optionalAccess', _8 => _8.name]),
      tandang: _optionalChain([m, 'access', _9 => _9.teamB, 'optionalAccess', _10 => _10.name]),
      skorTuanRumah: (typeof _optionalChain([m, 'access', _11 => _11.score, 'optionalAccess', _12 => _12.teamA]) === 'object' && _optionalChain([m, 'access', _13 => _13.score, 'optionalAccess', _14 => _14.teamA]) !== null) ? (_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(m.score.teamA.current, () => ( m.score.teamA.normalTime)), () => ( m.score.teamA.score)), () => ( '-'))) : (_nullishCoalesce(_optionalChain([m, 'access', _15 => _15.score, 'optionalAccess', _16 => _16.teamA]), () => ( '-'))),
      skorTandang: (typeof _optionalChain([m, 'access', _17 => _17.score, 'optionalAccess', _18 => _18.teamB]) === 'object' && _optionalChain([m, 'access', _19 => _19.score, 'optionalAccess', _20 => _20.teamB]) !== null) ? (_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(m.score.teamB.current, () => ( m.score.teamB.normalTime)), () => ( m.score.teamB.score)), () => ( '-'))) : (_nullishCoalesce(_optionalChain([m, 'access', _21 => _21.score, 'optionalAccess', _22 => _22.teamB]), () => ( '-'))),
      kartuMerahTuanRumah: _nullishCoalesce(_optionalChain([m, 'access', _23 => _23.redCards, 'optionalAccess', _24 => _24.teamA]), () => ( 0)),
      kartuMerahTandang: _nullishCoalesce(_optionalChain([m, 'access', _25 => _25.redCards, 'optionalAccess', _26 => _26.teamB]), () => ( 0)),
      periode: (typeof m.period === 'object' && m.period !== null) ? (_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(m.period.name, () => ( m.period.short)), () => ( m.period.long)), () => ( '-'))) : (m.period || '')
    }))
  }));
}

async function handler(m, { text }) {
    try {
        await m.react('🕕');
        const data = await ambilLivescore('id');
        const rapi = _rapikanPertandingan(data);
        
        if (!rapi || rapi.length === 0) {
            await m.react('❌');
            return m.reply(`⚽* LIVESSCORE BOLA*⚽\n\nActualmente no hay juego ni se está programando.`);
        }
        
        let caption = `⚽* LIVE SCORE BOLA Hoy *⚽\n\n`;
        
        let count = 0;
        for (const grup of rapi) {
            if (count >= 15) break; 
            if (grup.pertandingan.length === 0) continue;
            
            caption += `🏆 *${grup.kompetisi.toUpperCase()}*\n`;
            
            for (const p of grup.pertandingan) {
                const skorA = p.skorTuanRumah;
                const skorB = p.skorTandang;
                
                let kmA = p.kartuMerahTuanRumah > 0 ? ` 🟥${p.kartuMerahTuanRumah}` : '';
                let kmB = p.kartuMerahTandang > 0 ? ` 🟥${p.kartuMerahTandang}` : '';
                
                caption += `▪️ ${p.tuanRumah}${kmA} *[ ${skorA} - ${skorB} ]* ${p.tandang}${kmB}\n`;
                caption += `   └ ⏳ _Status: ${p.status}_`;
                if (p.periode) caption += ` | ⏱️ _${p.periode}_`;
                caption += `\n`;
            }
            caption += `\n`;
            count++;
        }
        
        caption += `_Sumber: Goal.com_`;
        
        await m.reply(caption.trim());
        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`❌* Fallido TAKE PUNACION *\n\nLo sentimos, el nei pudo recperar los datos de la pendiación en vivo actual.${e.message}_`);
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
