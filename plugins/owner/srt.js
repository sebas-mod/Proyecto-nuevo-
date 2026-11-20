"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourin = require('ourin');

const pluginConfig = {
    name: 'srt',
    alias: ['shufflereplythumb', 'shufflereply'],
    category: 'owner',
    description: 'Sistem Shuffle Reply Thumb (SRT) untuk reply random image interaktif',
    usage: '.srt on',
    example: '.srt on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
};

if (!global.srtSession) {
    global.srtSession = {};
}

const SHUFFLE_DIR = _path2.default.join(process.cwd(), 'assets', 'image', 'shuffle');

function countShuffleImages() {
    if (!_fs2.default.existsSync(SHUFFLE_DIR)) return 0;
    const files = _fs2.default.readdirSync(SHUFFLE_DIR);
    return files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')).length;
}

async function handler(m, { sock, args }) {
    try {
        const db = _ourindatabasejs.getDatabase.call(void 0, );
        const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

        if (!action) {
            return m.reply(`🛠️ *SISTEM SHUFFLE REPLY THUMB (SRT)*\n\nSelamat datang di menu pengelolaan gambar balasan otomatis. Sistem ini memungkinkan bot untuk membalas dengan gambar *thumbnail* yang diacak secara otomatis dari koleksi yang kamu simpan.\n\nBerikut adalah daftar perintah yang tersedia:\n- *.srt on* : Mengaktifkan fitur shuffle secara global.\n- *.srt off* : Menonaktifkan fitur shuffle dan kembali ke pengaturan awal.\n- *.srt c* : Membuka sesi tangkapan gambar untuk menambahkan koleksi baru ke dalam database.\n- *.srt d* : Menutup sesi tangkapan gambar.\n- *.srt list* : Menampilkan seluruh koleksi gambar yang telah tersimpan di dalam database bot.\n- *.srt del* : Menghapus gambar dari database (Gunakan *.srt list* terlebih dahulu untuk memunculkan gambarnya, lalu *reply* salah satu gambar tersebut dengan perintah ini).`);
        }

        if (action === 'on') {
            db.setting('srtEnabled', true);
            await m.reply('✅ *FITUR SRT BERHASIL DIAKTIFKAN*\n\nFitur ini telah menyala secara global. Setiap balasan bot yang mendukung *thumbnail* sekarang akan menampilkan gambar secara acak dari dalam folder shuffle yang telah dikumpulkan.');
        } 
        else if (action === 'off') {
            db.setting('srtEnabled', false);
            await m.reply('❌ *FITUR SRT BERHASIL DINONAKTIFKAN*\n\nPenggunaan *thumbnail* acak telah dimatikan. Semua balasan bot akan kembali menggunakan gambar *default* bawaan sistem.');
        } 
        else if (action === 'c' || action === 'capture') {
            global.srtSession[m.chat] = { sender: m.sender, count: 0 };
            const totalImages = countShuffleImages();
            await m.reply(`📸 *SESI TANGKAPAN GAMBAR DIMULAI*\n\nSilakan kirimkan gambar satu per satu secara terus menerus ke dalam obrolan ini. Bot akan membaca setiap gambar tersebut dan langsung menyimpannya secara otomatis ke dalam sistem *database shuffle*.\n\n- Total gambar tersimpan saat ini: *${totalImages}*\n- Jika semua gambar sudah selesai dikirimkan, hentikan sesi dengan perintah \`${m.prefix}srt d\`.`);
        } 
        else if (action === 'd' || action === 'done') {
            if (!global.srtSession[m.chat] || global.srtSession[m.chat].sender !== m.sender) {
                return m.reply('❌ Kamu sedang tidak berada di dalam sesi penangkapan gambar aktif untuk saat ini.');
            }
            const count = global.srtSession[m.chat].count;
            delete global.srtSession[m.chat];
            const totalImages = countShuffleImages();
            await m.reply(`✅ *SESI TANGKAPAN GAMBAR SELESAI*\n\nSesi telah dihentikan dan seluruh gambar telah diproses.\n- Total gambar baru yang ditambahkan: *${count}*\n- Total keseluruhan gambar di sistem: *${totalImages}*`);
        } 
        else if (action === 'list') {
            if (!_fs2.default.existsSync(SHUFFLE_DIR)) return m.reply('❌ Belum ada satu pun gambar yang tersimpan di dalam direktori *shuffle*. Silakan lakukan penangkapan gambar terlebih dahulu.');
            const files = _fs2.default.readdirSync(SHUFFLE_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
            if (files.length === 0) return m.reply('❌ Direktori *shuffle* masih kosong. Silakan gunakan perintah tangkapan gambar untuk mulai menambahkan.');
            
            await m.reply(`📂 *DAFTAR GAMBAR SHUFFLE*\n\nSistem menemukan *${files.length}* gambar yang tersimpan. Sedang memproses dan merangkai album untuk ditampilkan, harap tunggu sebentar.`);
            
            try {
                const opener = _ourin.generateWAMessageFromContent.call(void 0, 
                    m.chat,
                    {
                        messageContextInfo: { messageSecret: _crypto2.default.randomBytes(32) },
                        albumMessage: {
                            expectedImageCount: files.length,
                            expectedVideoCount: 0,
                        },
                    },
                    {
                        userJid: _ourin.jidNormalizedUser.call(void 0, sock.user.id),
                        quoted: m,
                        upload: sock.waUploadToServer,
                    }
                );

                await sock.relayMessage(opener.key.remoteJid, opener.message, {
                    messageId: opener.key.id,
                });

                for (let i = 0; i < files.length; i++) {
                    const imgPath = _path2.default.join(SHUFFLE_DIR, files[i]);
                    const imgBuffer = _fs2.default.readFileSync(imgPath);

                    const msg = await _ourin.generateWAMessage.call(void 0, opener.key.remoteJid, { image: imgBuffer }, {
                        upload: sock.waUploadToServer,
                    });

                    msg.message.messageContextInfo = {
                        messageSecret: _crypto2.default.randomBytes(32),
                        messageAssociation: {
                            associationType: 1,
                            parentMessageKey: opener.key,
                        },
                    };

                    await sock.relayMessage(msg.key.remoteJid, msg.message, {
                        messageId: msg.key.id,
                    });
                }
            } catch (albumErr) {
                console.error('Album Error:', albumErr);
                return m.reply('❌ Terjadi kesalahan saat membuat album gambar.');
            }
        } 
        else if (action === 'del' || action === 'delete') {
            const isImage = m.isImage || (m.quoted && m.quoted.isImage);
            if (!isImage) {
                return m.reply('❌ *CARA MENGHAPUS GAMBAR:*\n\n1. Ketik `.srt list` untuk menampilkan seluruh koleksi gambar.\n2. Balas (*reply*) salah satu gambar yang muncul dari album tersebut dengan perintah `.srt del`.');
            }
            
            await m.react('🕕');
            let buffer;
            try {
                if (m.quoted && m.quoted.isImage) {
                    buffer = await m.quoted.download();
                } else if (m.isImage) {
                    buffer = await m.download();
                }
            } catch (e) {
                return m.reply('❌ Gagal mendownload gambar untuk dihapus.');
            }

            if (buffer) {
                const hash = _crypto2.default.createHash('md5').update(buffer).digest('hex').substring(0, 10);
                const filename = `srt_${hash}.jpg`;
                const filepath = _path2.default.join(SHUFFLE_DIR, filename);

                if (_fs2.default.existsSync(filepath)) {
                    _fs2.default.unlinkSync(filepath);
                    await m.reply(`✅ *GAMBAR BERHASIL DIHAPUS*\n\nGambar berhasil dihapus dari database shuffle.`);
                } else {
                    await m.reply('❌ *GAMBAR TIDAK DITEMUKAN*\n\nGambar ini tidak cocok dengan yang ada di dalam database shuffle (atau sudah dihapus sebelumnya).');
                }
            }
            await m.react('✅');
        }
        else {
            await m.reply(`❌ Perintah lanjutan "${action}" tidak dapat dikenali oleh sistem.`);
        }
        
    } catch (error) {
        console.error('SRT List Error:', error);
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

async function srtAnswerHandler(m, sock) {
    if (!global.srtSession) return false;
    const session = global.srtSession[m.chat];
    if (!session || session.sender !== m.sender) return false;

    if (m.isCommand) return false;

    const isImage = m.isImage || (m.quoted && m.quoted.isImage);
    if (!isImage) return false;

    try {
        await m.react('🕕');
        let buffer;
        if (m.quoted && m.quoted.isImage) {
            buffer = await m.quoted.download();
        } else if (m.isImage) {
            buffer = await m.download();
        }

        if (buffer) {
            if (!_fs2.default.existsSync(SHUFFLE_DIR)) _fs2.default.mkdirSync(SHUFFLE_DIR, { recursive: true });
            
            const hash = _crypto2.default.createHash('md5').update(buffer).digest('hex').substring(0, 10);
            const ext = '.jpg';
            const filename = `srt_${hash}${ext}`;
            const filepath = _path2.default.join(SHUFFLE_DIR, filename);

            if (_fs2.default.existsSync(filepath)) {
                await m.reply('⚠️ Gambar yang sama terdeteksi telah tersimpan di dalam database.');
            } else {
                _fs2.default.writeFileSync(filepath, buffer);
                session.count++;
                await m.reply(`✅ *GAMBAR BERHASIL DISIMPAN*\n\nGambar telah diamankan ke dalam penyimpanan lokal bot.\n- Total gambar ditambahkan pada sesi ini: *${session.count}*`);
            }
        }
        await m.react('✅');
        return true;
    } catch (e) {
        await m.react('❌');
        await m.reply('❌ Terjadi kesalahan fatal saat mencoba mengunduh dan menyimpan gambar tersebut.');
        return true;
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.srtAnswerHandler = srtAnswerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
