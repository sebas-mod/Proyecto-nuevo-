"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "gag2",
  alias: ["growagarden2"],
  category: "info",
  description: "Comprobación",
  usage: ".gag2 [watch] [item]",
  example: ".gag2 watch seed",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

const API = "https://api.rifkyshre.biz.id";
const ROUTE = "/scrape/gag2-stock";

async function gag2Fetch() {
  const res = await _axios2.default.get(`${API}${ROUTE}`, {
    timeout: 30000,
    validateStatus: () => true,
    headers: {
      Accept: "application/json",
      Origin: "https://code.rifkyshre.biz.id",
      Referer: "https://code.rifkyshre.biz.id/",
    },
  });
  if (!_optionalChain([res, 'access', _ => _.data, 'optionalAccess', _2 => _2.status])) {
    return {
      ok: false,
      error: _nullishCoalesce(_optionalChain([res, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.error]), () => ( `HTTP ${res.status}`)),
    };
  }
  return { ok: true, data: res.data.data };
}

function emojiForItem(name) {
  const n = name.toLowerCase();
  if (n.includes("seed")) return "🌱";
  if (n.includes("watering") || n.includes("hose") || n.includes("sprinkler")) return "💧";
  if (n.includes("crate") || n.includes("box")) return "📦";
  if (n.includes("egg")) return "🥚";
  return "•";
}

function formatStock(d) {
  const lines = [];
  lines.push(`*${d.message}*`);
  lines.push("");
  lines.push(`- ⏰ Restock in : *${d.restockInLabel}*`);
  lines.push(`- 🔄 Rotation   : *${d.rotationId} (cycle ${d.cycleSeconds}s)*`);
  lines.push(`- 📊 Status     : *${d.status} (${d.staleness})*`);
  lines.push(`- 💾 Cache      : *${d.cache.servedFromCache ? "HIT" : "MISS"} (age ${d.cache.ageSec}s/${d.cache.ttlSec}s)*`);
  lines.push("");
  if (_optionalChain([d, 'access', _5 => _5.weather, 'optionalAccess', _6 => _6.active])) {
    lines.push(`- ⛅ *WEATHER: ${d.weather.type.toUpperCase()}*`);
    if (Array.isArray(d.weather.effects)) {
      for (const eff of d.weather.effects) lines.push(`   - ✨ ${eff}`);
    }
    lines.push("");
  }
  if (_optionalChain([d, 'access', _7 => _7.seeds, 'optionalAccess', _8 => _8.length])) {
    lines.push(`- 🌱 *SEEDS (${d.seeds.length}):*`);
    for (const s of d.seeds) lines.push(`   - ${s.name} × ${s.quantity}`);
    lines.push("");
  }
  if (_optionalChain([d, 'access', _9 => _9.gear, 'optionalAccess', _10 => _10.length])) {
    lines.push(`- ⚙️ *GEAR (${d.gear.length}):*`);
    for (const g of d.gear) lines.push(`   - ${g.name} × ${g.quantity}`);
    lines.push("");
  }
  if (_optionalChain([d, 'access', _11 => _11.crates, 'optionalAccess', _12 => _12.length])) {
    lines.push(`- 📦 *CRATES (${d.crates.length}):*`);
    for (const c of d.crates) lines.push(`   - ${c.name} × ${c.quantity}`);
  }
  return lines.join("\n");
}

async function modeStock(m) {
  const r = await gag2Fetch();
  if (!r.ok) {
    return m.reply(`❌ ${r.error}`);
  }
  return m.reply(formatStock(r.data));
}

async function modeWatch(watchItems, m, sock) {
  const wants = watchItems.map((w) => w.toLowerCase());
  await m.reply(`👀 *Watching for:* ${watchItems.join(", ")}\n- Max5 iteraciones ( ~ 2. 5 minutos ). Re ejecutar para exTiende.`);

  for (let i = 1; i <= 5; i++) {
    const r = await gag2Fetch();
    if (!r.ok) {
      await new Promise((res) => setTimeout(res, 30000));
      continue;
    }
    const d = r.data;
    const allItems = [...(_nullishCoalesce(d.seeds, () => ( []))), ...(_nullishCoalesce(d.gear, () => ( []))), ...(_nullishCoalesce(d.crates, () => ( [])))];
    const hits = allItems.filter((item) =>
      wants.some((w) => item.name.toLowerCase().includes(w)),
    );

    if (hits.length > 0) {
      let msg = `🎯 *[iter ${i}] FOUND ${hits.length}watched objeto(s)!*\n\n`;
      for (const h of hits) {
        msg += `- ${emojiForItem(h.name)} *${h.name} × ${h.quantity}*\n`;
      }
      msg += `\n` + formatStock(d);
      await sock.sendMessage(m.chat, { text: msg }, { quoted: m });
      return;
    }

    if (i < 5) await new Promise((res) => setTimeout(res, 30000));
  }
  
  await sock.sendMessage(m.chat, { text: `⏱Cinco italiaciones, sin coincidencia.` }, { quoted: m });
}

async function handler(m, { sock, args }) {
  m.react("🕕");
  try {
    const isWatch = _optionalChain([args, 'access', _13 => _13[0], 'optionalAccess', _14 => _14.toLowerCase, 'call', _15 => _15()]) === "watch";
    if (isWatch) {
      const items = args.slice(1);
      if (items.length === 0) {
        return m.reply("❌Ponga en el nombre del artículo que desea subir en.`. g2 ver la semilla manzana`");
      }
      m.react("✅");
      await modeWatch(items, m, sock);
    } else {
      await modeStock(m);
      m.react("✅");
    }
  } catch (err) {
    console.error("[Gag2]", err.message);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
