"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "pddikti",
  alias: ["dikti", "carimahasiswa"],
  category: "search",
  description: "Datos de Busca dhakapan, Dosen, PT, y Prodi de PDDDDlCTI",
  usage: ".pddikti <mode> <query>",
  example: ".pddikti all Gibran Khalil\n.pddikti detail <id_mahasiswa>",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

const CORS_PROXY = "https://cors.rifkyshre.biz.id/";
const API_BASE = "https://api-pddikti.kemdiktisaintek.go.id";
const FRONTEND_ORIGIN = "https://pddikti.kemdiktisaintek.go.id";

async function pddiktiGet(path) {
  const res = await _axios2.default.get(`${CORS_PROXY}${API_BASE}${path}`, {
    timeout: 30000,
    validateStatus: () => true,
    headers: {
      Accept: "application/json",
      "X-Cors-Spoof-Origin": FRONTEND_ORIGIN,
    },
  });
  if (res.status !== 200) {
    throw new Error(`PDDIKTI HTTP ${res.status}: ${JSON.stringify(res.data).slice(0, 150)}`);
  }
  return res.data;
}

async function pddikti(input) {
  try {
    const mode = (_nullishCoalesce(_optionalChain([input, 'optionalAccess', _ => _.mode]), () => ( "all"))).toLowerCase();
    const query = typeof _optionalChain([input, 'optionalAccess', _2 => _2.query]) === "string" ? input.query.trim() : "";

    if (mode === "detail") {
      const mhsId = typeof _optionalChain([input, 'optionalAccess', _3 => _3.mahasiswaId]) === "string" ? input.mahasiswaId.trim() : "";
      if (!mhsId) {
        return { Status: false, Code: 400, Input: input, Result: null,
          Error: "Tomar de los resultados de los mhs (campo megid )." };
      }
      const data = await pddiktiGet(`/detail/mhs/${encodeURIComponent(mhsId)}`);
      const message = _optionalChain([data, 'optionalAccess', _4 => _4.nama])
        ? `🎓 ${data.nama} — ${data.nim} | ${data.prodi} @ ${data.nama_pt}`
        : "🎓 Detail mahasiswa";
      return {
        Status: true, Code: 200, Input: input,
        Result: {
          message,
          nama: data.nama,
          nim: data.nim,
          jenisKelamin: data.jenis_kelamin === "L" ? "Laki-laki" : data.jenis_kelamin === "P" ? "Perempuan" : null,
          jenjang: data.jenjang,
          prodi: data.prodi,
          kodeProdi: data.kode_prodi,
          namaPt: data.nama_pt,
          kodePt: _optionalChain([data, 'access', _5 => _5.kode_pt, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()]),
          tanggalMasuk: data.tanggal_masuk,
          jenisDaftar: data.jenis_daftar,
          statusSaatIni: data.status_saat_ini,
          idPt: data.id_pt,
          idProdi: data.id_sms,
          raw: data,
        },
      };
    }

    if (!query) {
      return { Status: false, Code: 400, Input: input, Result: null,
        Error: "Palabras clave requieren (nombre, NIM, NIDN, dll )." };
    }
    if (query.length < 3) {
      return { Status: false, Code: 400, Input: input, Result: null,
        Error: "Query terlalu pendek (min 3 karakter)." };
    }

    let path;
    switch (mode) {
      case "all":   path = `/pencarian/all/${encodeURIComponent(query)}`; break;
      case "mhs":
      case "mahasiswa":
        path = `/pencarian/mhs/${encodeURIComponent(query)}`; break;
      case "dosen": path = `/pencarian/dosen/${encodeURIComponent(query)}`; break;
      case "pt":    path = `/pencarian/pt/${encodeURIComponent(query)}`; break;
      case "prodi": path = `/pencarian/prodi/${encodeURIComponent(query)}`; break;
      default:
        return { Status: false, Code: 400, Input: input, Result: null,
          Error: `Unknown mode '${mode}'. Usar: all | mhs | dosen | pt | prodi | detail` };
    }

    const data = await pddiktiGet(path);

    if (mode === "all" && data && typeof data === "object" && !Array.isArray(data)) {
      const mhs = Array.isArray(data.mahasiswa) ? data.mahasiswa : [];
      const dosen = Array.isArray(data.dosen) ? data.dosen : [];
      const pt = Array.isArray(data.pt) ? data.pt : [];
      const prodi = Array.isArray(data.prodi) ? data.prodi : [];
      const total = mhs.length + dosen.length + pt.length + prodi.length;
      return {
        Status: true, Code: 200, Input: input,
        Result: {
          message: `🔍 ${total}el resultado del odio${query}" (${mhs.length} mhs, ${dosen.length} dosen, ${pt.length} pt, ${prodi.length} prodi)`,
          query,
          totalCount: total,
          mahasiswa: mhs,
          dosen,
          pt,
          prodi,
        },
      };
    }

    const items = Array.isArray(data) ? data : [];
    return {
      Status: true, Code: 200, Input: input,
      Result: {
        message: items.length > 0
          ? `🔍 ${items.length}resultado${mode}para "${query}"`
          : `🔍No tiene resultados${mode}para "${query}"`,
        query,
        mode,
        count: items.length,
        results: items,
      },
    };
  } catch (e) {
    return {
      Status: false,
      Code: _nullishCoalesce(_optionalChain([e, 'access', _8 => _8.response, 'optionalAccess', _9 => _9.status]), () => ( 500)),
      Input: input,
      Result: null,
      Error: _nullishCoalesce(e.message, () => ( String(e))),
    };
  }
}

async function handler(m, { args }) {
  if (args.length === 0) {
    return m.reply(
      `🎓 *PDDIKTI SEARCH*\n\n` +
      `* Búsqueda en modo:*\n` +
      `- \`.pddikti all <query>\`\n` +
      `- \`.pddikti mhs <nama/NIM>\`\n` +
      `- \`.pddikti dosen <nama/NIDN>\`\n` +
      `- \`.pddikti pt <nama_kampus>\`\n` +
      `- \`.pddikti prodi <nama_prodi>\`\n` +
      `- \`.pddikti detail <id_mahasiswa>\`\n\n` +
      `*Ejemplo:*\`.pddikti mhs Gibran Rakabuming\``
    );
  }

  m.react("🕕");

  try {
    const mode = args[0].toLowerCase();
    
    if (mode === "detail") {
      if (args.length < 2) return m.reply("❌ Masukkan ID Mahasiswa!");
      const mhsId = args[1];
      const res = await pddikti({ mode: "detail", mahasiswaId: mhsId });
      
      if (!res.Status) {
        m.react("❌");
        return m.reply(`❌ ${res.Error}`);
      }
      
      const r = res.Result;
      let txt = `🎓 *DETAIL MAHASISWA*\n\n`;
      txt += `-📝Nombre: *${r.nama}*\n`;
      txt += `- 🆔 NIM           : *${r.nim}*\n`;
      txt += `- 👤 Jenis Kelamin : *${_nullishCoalesce(r.jenisKelamin, () => ( "-"))}*\n`;
      txt += `- 🎓 Jenjang       : *${r.jenjang}*\n`;
      txt += `- 📚 Prodi         : *${r.prodi}*\n`;
      txt += `- 🏛️ Perguruan T.  : *${r.namaPt}*\n`;
      txt += `-📅Mapsuk Tgl: *${r.tanggalMasuk}*\n`;
      txt += `- 📊 Status        : *${r.statusSaatIni}*\n`;
      txt += `-💼Lista de genios: *${r.jenisDaftar}*\n`;
      
      m.react("✅");
      return m.reply(txt);
    }
    
    // For other modes
    const query = args.slice(1).join(" ");
    if (!query) return m.reply("❌ Masukkan kata kunci pencarian!");
    
    const res = await pddikti({ mode, query });
    if (!res.Status) {
      m.react("❌");
      return m.reply(`❌ ${res.Error}`);
    }
    
    const r = res.Result;
    let txt = `*${r.message}*\n\n`;
    
    if (mode === "all") {
      const mh = r.mahasiswa.slice(0, 3);
      const ds = r.dosen.slice(0, 3);
      const pt = r.pt.slice(0, 3);
      const pr = r.prodi.slice(0, 3);
      
      if (mh.length) {
        txt += `👨🎓 *MAHASISWA (top 3):*\n`;
        for (const m of mh) txt += `- ${m.nama} [${m.nim}] — ${m.nama_prodi}, ${m.nama_pt}\n`;
        txt += `\n`;
      }
      if (ds.length) {
        txt += `👨🏫 *DOSEN (top 3):*\n`;
        for (const d of ds) txt += `- ${d.nama} [NIDN ${d.nidn}] — ${d.nama_prodi}, ${d.nama_pt}\n`;
        txt += `\n`;
      }
      if (pt.length) {
        txt += `🏛(Altísimo @-@ PITCHED ):\n`;
        for (const p of pt) txt += `- ${p.nama} (${_nullishCoalesce(_nullishCoalesce(p.nama_singkat, () => ( p.sinkatan_pt)), () => ( "-"))})\n`;
        txt += `\n`;
      }
      if (pr.length) {
        txt += `📚 *PRODI (top 3):*\n`;
        for (const p of pr) txt += `- ${p.nama} @ ${_nullishCoalesce(p.nama_pt, () => ( "-"))}\n`;
        txt += `\n`;
      }
    } else {
      const top = r.results.slice(0, 10);
      for (const [i, item] of top.entries()) {
        if (mode === "mhs" || mode === "mahasiswa") {
          txt += `*#${i + 1} ${item.nama} [NIM ${item.nim}]*\n`;
          txt += `- 📚 ${item.nama_prodi} @ ${item.nama_pt} (${item.sinkatan_pt || "-"})\n`;
          txt += `- 🆔 ID: \`${item.id}\`\n\n`;
        } else if (mode === "dosen") {
          txt += `*#${i + 1} ${item.nama} [NIDN ${item.nidn}]*\n`;
          txt += `- 📚 ${item.nama_prodi} @ ${item.nama_pt}\n\n`;
        } else if (mode === "pt") {
          txt += `*#${i + 1} ${item.nama} (${_nullishCoalesce(item.nama_singkat, () => ( "-"))})*\n`;
          txt += `- Código:${_nullishCoalesce(item.kode, () => ( "-"))}\n\n`;
        } else if (mode === "prodi") {
          txt += `*#${i + 1} ${item.nama}*\n`;
          txt += `- @ ${_nullishCoalesce(item.nama_pt, () => ( "-"))}\n\n`;
        }
      }
      if (r.count > 10) txt += `> ... +${r.count - 10}resultado otros.\n`;
    }
    
    m.react("✅");
    return m.reply(txt.trim());
    
  } catch (err) {
    console.error("[PDDIKTI]", err.message);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
