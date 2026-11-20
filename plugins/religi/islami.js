"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'islami',
    alias: [
        'asmaulhusna', 'niatsholat', 'niatshalat', 'surah', 'doa', 'berdoa', 
        'gislam'
    ],
    category: 'religi',
    description: 'Recoge la característica islamí ( Asmaul Husna, Niat Sholat, Surah, Doa, Artículo, Said Mutiara )',
    usage: '.islami <fitur>',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function fetchJson(url) {
    try {
        const response = await _axios2.default.get(url)
        return response.data
    } catch (e) {
        throw e
    }
}

async function handler(m, { sock }) {
    const command = m.command.toLowerCase()
    const text = m.text || ''

    try {
        switch (command) {
            case 'asmaulhusna': {
                let jir = await fetchJson('https://islamic-api-zhirrr.vercel.app/api/asmaulhusna')
                let ye = jir.data

                let tks = '☪️ *ASMAUL HUSNA*\n\n' + ye.map((item) => {
                    return `Urutan: ${item.index}\nLatin: ${item.latin}\nArab: ${item.arabic}\nTerjemahan ID: ${item.translation_id}\nTerjemahan EN: ${item.translation_en}\n`
                }).join('\n')
                m.reply(tks)
            }
            break

            case 'niatsholat': 
            case 'niatshalat': {
                let jir = await fetchJson('https://islamic-api-zhirrr.vercel.app/api/niatshalat')
                let niatSholat = jir

                if (!text) {
                    let daftarNiat = '📋 *DAFTAR NIAT SHOLAT*\n\n' + niatSholat.map((item) => `- ${item.name}`).join('\n')
                    daftarNiat += `\n\n📌Escribe\`${m.prefix}*Niatshoult* *di el nombre del grito*\`para ver las intenciones\nEjemplo:\`${m.prefix}niatsholat subuh\``
                    m.reply(daftarNiat)
                } else {
                    let hasil = niatSholat.find((item) => item.name.toLowerCase().includes(text.toLowerCase()))

                    if (hasil) {
                        let tks = `🕋 *${hasil.name.toUpperCase()}*\n\n` +
                            `📄 Arab: ${hasil.arabic}\n` +
                            `🔤 Latin: ${hasil.latin}\n` +
                            `🌍 Terjemahan: ${hasil.terjemahan}`
                        m.reply(tks)
                    } else {
                         m.reply('❌El shock que buscas no se encuentra.')
                    }
                }
            }
            break

            case 'surah': {
                if (!text) {
                    m.reply(`⚠¡A la cantidad mágica de ella!\nEjemplo:\`${m.prefix}Sura 1\`Toma el ayat de Al @-@ Fatihah`)
                    return
                }

                m.reply('🕕El menkat está diluido.')
                let response = await fetchJson(`https://api.siputzx.my.id/api/s/surah?no=${text}`)
                let data = response.data
                if (data && data.length > 0) {
                    let surahText = data.map((ayat, index) =>
                        `۝ Ayat ${ayat.no}:\n` +
                        `${ayat.arab}\n` +
                        `${ayat.latin}\n` +
                        `_${ayat.indo}_`
                    ).join('\n\n')

                    if (surahText.length > 60000) {
                         m.reply('❌Por favor, cuide de la sura específica o más corta.')
                    } else {
                        m.reply(surahText)
                    }
                } else {
                    m.reply('❌¡Nos vemos, revisamos el número mágico otra vez!')
                }
            }
            break

            case 'doa':
            case 'berdoa': {
                let jir = await fetchJson('https://doa-doa-api-ahmadramadhan.fly.dev/api')
                let daftarDoa = jir

                if (!text) {
                    let listDoa = '🤲 *DAFTAR DOA*\n\n' + daftarDoa.map((item) => `- ${item.doa}`).join('\n')
                     listDoa += `\n\n📌Escribe\`${m.prefix}*Oh, oh, oh, oh, oh, oh, oh *\`para ver doa\nEjemplo:\`${m.prefix}doa doa antes de duerme\``
                    m.reply(listDoa)
                } else {
                    let hasil = daftarDoa.find((item) => item.doa.toLowerCase().includes(text.toLowerCase()))

                    if (hasil) {
                        let tks = `🤲 *${hasil.doa.toUpperCase()}*\n\n` +
                            `📄 Ayat: ${hasil.ayat}\n` +
                            `🔤 Latin: ${hasil.latin}\n` +
                            `🌍 Artinya: ${hasil.artinya}`
                        m.reply(tks)
                    } else {
                         m.reply('❌No se encuentra la doa que busca.')
                    }
                }
            }
            break

            case 'gislam': {
                if (!text) return m.reply(`❓¿Qué estás buscando?\nEjemplo:\`${m.prefix}gislam puasa\``)
                
                try {
                    const response = await fetchJson(`https://artikel-islam.netlify.app/.netlify/functions/api/ms?page=1&s=${text}`)
                    if (response.success) {
                        const articles = response.data.data
                        if (!articles || articles.length === 0) return m.reply('❌Artículo no encontrado.')

                        let message = `📚*Resultado Búsqueda:${text.toUpperCase()}*\nTotal: ${articles.length}\n\n`
                        articles.forEach((article, index) => {
                            message += `${index + 1}. *${article.title}*\n🔗 ${article.url}\n\n`
                        })
                        return m.reply(message)
                    } else {
                        return m.reply('❌Gagalm tomó los datos del artículo.')
                    }
                } catch (error) {
                    return m.reply('❌Fue un error tomar los datos.')
                }
            }
            break
        }
    } catch (e) {
        console.error('Religi Plugin Error:', e)
        m.reply('❌Es un error en el sistema.')
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
