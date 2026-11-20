"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);

const pluginConfig = {
    name: 'spekhp',
    alias: ['spek', 'spesifikasi'],
    category: 'search',
    description: 'Buscando un smartphone completo del Caribe.',
    usage: '.spekhp <nama hp>',
    example: '.spekhp oppo a3s',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
};

async function request(url) {
    const { data } = await _axios2.default.get(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    return data;
}

async function search(keyword) {
    const html = await request(`https://carisinyal.com/?s=${encodeURIComponent(keyword)}`);
    const $ = cheerio.load(html);
    const result = [];

    $(".oxy-post").each((_, el) => {
        const title = $(el).find(".oxy-post-title").text().trim();
        if (!title) return;

        result.push({
            title,
            type: $(el).find(".oxy-post-meta").text().trim(),
            url: $(el).find(".oxy-post-title").attr("href")
        });
    });

    return result;
}

async function detail(url) {
    const html = await request(url);
    const $ = cheerio.load(html);
    const specs = {};

    $("table.box-info tr.box-baris").each((_, el) => {
        const key = $(el).find("td.kolom-satu").text().trim();
        const value = $(el).find("td.kolom-dua").text().trim();
        if (key && value) specs[key] = value;
    });

    const get = (...keys) => {
        for (const key of keys) if (specs[key]) return specs[key];
        return null;
    };

    return {
        status: true,
        title: $("h1").first().text().trim(),
        image: $('meta[property="og:image"]').attr("content") || null,
        description: $('meta[name="description"]').attr("content") || "",
        release: get("Rilis"),
        network: get("Jaringan"),
        display: {
            type: get("Jenis"),
            size: get("Ukuran"),
            resolution: get("Resolusi"),
            refreshRate: get("Refresh Rate"),
            ratio: get("Rasio"),
            density: get("Kerapatan"),
            protection: get("Proteksi")
        },
        performance: {
            chipset: get("Chipset"),
            cpu: get("CPU"),
            gpu: get("GPU"),
            ram: get("RAM"),
            ramType: get("Jenis RAM"),
            storage: get("Memori Internal"),
            storageType: get("Jenis Memori"),
            external: get("Memori Eksternal")
        },
        battery: {
            capacity: get("Kapasitas"),
            charging: get("Daya Pengisian"),
            wireless: get("Wireless Charging"),
            reverse: get("Reverse Charging"),
            reverseWireless: get("Reverse Wireless Charging"),
            bypass: get("Bypass Charging")
        },
        camera: {
            total: get("Jumlah Kamera"),
            configuration: get("Konfigurasi"),
            features: get("Función"),
            video: get("Resolusi Video")
        },
        connectivity: {
            wlan: get("WLAN"),
            bluetooth: get("Bluetooth"),
            infrared: get("Infrared"),
            nfc: get("NFC"),
            gps: get("GPS"),
            usb: get("USB")
        },
        system: {
            os: get("OS (Saat Rilis)"),
            update: get("Jaminan Update")
        },
        body: {
            dimensions: get("Dimensi"),
            weight: get("Berat"),
            resistance: get("Ketahanan"),
            sim: get("SIM Card"),
            esim: get("eSIM"),
            colors: get("Warna")
        },
        sensors: get("Sensor"),
        audio: {
            jack: get("Jack 3.5mm"),
            features: get("Función Otros")
        },
        specs
    };
}

async function handler(m, { sock, text }) {
    if (!text) {
        return m.reply(
            `📱* FUTURO DE LA ESPECIACIÓN DE HP *\n\n` +
            `Está función le ayuda a buscar las especificaciones completas de un smartphone.\n\n` +
            `*Como usarlo:*\n` +
            `- Escribe\`${m.prefix}spekhp <nama hp>\`\n` +
            `- Ejemplo:\`${m.prefix}spekhp oppo a3s\`\n\n` +
            `Systema buscar los teléfonos más ados con la palabra kumimus y mostrar los detalles de las cáfifies completas con la imagen!`
        );
    }

    try {
        await m.react('🕕');
        const results = await search(text);

        if (!results || results.length === 0) {
            await m.react('❌');
            return m.reply(`❌*No encontrado*\n\nLo siento, el sistema no pudo encontrar un mango con una palabra clave *${text}* Cobabah utiliza un nombre de marca o una serie más específica.`);
        }

        const phone = results.find(r => (r.type || "").toLowerCase().includes("ponsel")) || results[0];

        const data = await detail(phone.url);

        let caption = `📱 *SPESIFIKASI ${data.title.toUpperCase()}*\n\n`;
        if (data.release) caption += `📅 *Rilis:* ${data.release}\n`;
        if (data.network) caption += `📶 *Red:* ${data.network}\n`;
        caption += `\n`;

        caption += `🖥️ *Pantalla*\n`;
        if (data.display.type) caption += `- *Tipe:* ${data.display.type}\n`;
        if (data.display.size) caption += `- *Ukuran:* ${data.display.size}\n`;
        if (data.display.resolution) caption += `- *Resolusi:* ${data.display.resolution}\n`;
        if (data.display.refreshRate) caption += `- *Refresh Rate:* ${data.display.refreshRate}\n`;
        caption += `\n`;

        caption += `⚙️ *PERFORMA & MEMORI*\n`;
        if (data.performance.chipset) caption += `- *Chipset:* ${data.performance.chipset}\n`;
        if (data.performance.cpu) caption += `- *CPU:* ${data.performance.cpu}\n`;
        if (data.performance.gpu) caption += `- *GPU:* ${data.performance.gpu}\n`;
        if (data.performance.ram) caption += `- *RAM:* ${data.performance.ram}\n`;
        if (data.performance.storage) caption += `- *Storage:* ${data.performance.storage}\n`;
        caption += `\n`;

        caption += `📸* MACHINE CHATTER ]\n`;
        if (data.camera.total) caption += `- *Cantidad:*${data.camera.total}\n`;
        if (data.camera.configuration) caption += `- *Configuración:*${data.camera.configuration}\n`;
        if (data.camera.video) caption += `- *Video:* ${data.camera.video}\n`;
        caption += `\n`;

        caption += `🔋*Batería*\n`;
        if (data.battery.capacity) caption += `- *Kapasitas:* ${data.battery.capacity}\n`;
        if (data.battery.charging) caption += `- *Charging:* ${data.battery.charging}\n`;
        caption += `\n`;

        caption += `📡* CONETTIVITY FOR ANOTHER *\n`;
        if (data.system.os) caption += `* OS Cuando Rilis: *${data.system.os}\n`;
        if (data.connectivity.nfc) caption += `- *NFC:* ${data.connectivity.nfc}\n`;
        if (data.audio.jack) caption += `- *Audio Jack:* ${data.audio.jack}\n`;
        if (data.sensors) caption += `- *Sensor:* ${data.sensors}\n`;

        caption += `\n🔗 *Sumber:* Carisinyal`;

        if (data.image) {
            await sock.sendMessage(m.chat, { image: { url: data.image }, caption: caption }, { quoted: m });
        } else {
            await m.reply(caption);
        }
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`❌* DATOS DE TAKE Fallido*\n\nLo sentimos, el erosá experimentando interferencia mientras intenta recuperar datos del * Carisinal *. Por favor, inténtelo de nuevo más tarde.`);
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
