# OURIN 3.5 — ULTIMATE EDITION (COMMONJS)

<div align="center">

```
          ██████╗ ██╗   ██╗██████╗ ██╗███╗   ██╗
         ██╔═══██╗██║   ██║██╔══██╗██║████╗  ██║
         ██║   ██║██║   ██║██████╔╝██║██╔██╗ ██║
         ██║   ██║██║   ██║██╔══██╗██║██║╚██╗██║
         ╚██████╔╝╚██████╔╝██║  ██║██║██║ ╚████║
          ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
```

**Next-Generation Multi-Device WhatsApp Bot**  
*Full CommonJS (CJS) • Cantarelllaa Baileys Core • Enhanced Feature Set • Security Channel Protection*

</div>

---

## 🌟 Ringkasan Rilis v3.5

Ourin 3.5 adalah versi pembaruan menyeluruh yang mengintegrasikan fitur-fitur pilihan dari multi-arsitektur ke dalam satu kesatuan native Ourin yang stabil, cepat, dan terorganisir.

### 🔑 Sorotan Utama:
1. **Full CommonJS Architecture (CJS)**:
   - 100% source code menggunakan syntax standar CommonJS (`require` / `module.exports`).
   - Tidak ada ketergantungan rapuh pada experimental ESM loaders.
   - Kompatibilitas tinggi dengan ekosistem Node.js v22+.
2. **WhatsApp Core: `cantarelllaa` (v1.1.18)**:
   - Dukungan penuh untuk fitur modern WhatsApp: newsletter/channel reactions, community groups, ephemeral messages, dan interactive buttons.
3. **Fitur Prioritas Termigrasi & Teruji**:
   - **Alight Motion Premium (`.amprem`)**: Generate link aktivasi dan auto-claim magic link Alight Motion Premium.
   - **React WhatsApp Channel (`.rch` / `.reactch`)**: Kirim reaksi emoji ke pesan WhatsApp Channel menggunakan socket native cantarelllaa dengan failover Cloud API.
   - **Viu Premium (`.viuprem`)**: Pembuatan akun Viu Premium gratis terikat hardware Device ID.
4. **Keamanan Sentral: Wajib Follow 2 Saluran WhatsApp**:
   - Middleware terpusat yang memverifikasi keanggotaan pengguna di 2 channel resmi Ourin sebelum memberikan akses ke seluruh perintah bot.
   - Fail-closed security architecture dengan mekanisme verifikasi resmi `.verif` dan pengecualian otomatis untuk Owner & Admin.
5. **Koleksi Fitur Baru**:
   - **Blackjack Casino Multiplayer (`.bj`)**: Meja kasino blackjack multipemain lengkap dengan dealer otomatis, hit, stand, dan double.
   - **Peringatan & Radar Gempa BMKG (`.cekgempa`)**: Data gempa real-time M5.0+, gempa dirasakan, dan peta shakemap langsung dari BMKG.
   - **Kamus Bahasa Daerah Indonesia (`.kamusdaerah`)**: Terjemahan bahasa daerah (Jawa, Sunda, Minang, Bali, dsb.) dua arah.
   - **Kalkulator Zakat Syariah (`.zakat`)**: Zakat penghasilan, maal, emas, dan fitrah sesuai ketentuan BAZNAS.
   - **Timer Produktivitas Pomodoro (`.pomodoro`)**: Manajemen waktu belajar/kerja 4 siklus fokus dan istirahat otomatis.
   - **Anti Virtex & Crash Group (`.antivirtex`)**: Deteksi dan penghapusan otomatis karakter crash/virtex.
   - **Audio Bass Booster (`.bass`)**: Equalizer bass boost via ffmpeg untuk voice note & audio.
   - **TikTok Video Search (`.tiktoks`)**: Pencarian dan pengunduhan video TikTok tanpa watermark.

---

## 📂 Struktur Direktori

Struktur bawaan Ourin 3.5 dipertahankan 100% tanpa mengubah arsitektur aslinya:

```
OURIN 3.5/
├── assets/                  # Asset visual, font, audio, dan gambar bot
├── case/                    # Handler case command utama (case/ourin.js)
├── config.js                # Konfigurasi bot, owner, session, dan pairing
├── data/                    # Dataset pendukung (kamus, json, dsb.)
├── database/                # Penyimpanan lokal (lowdb / JSON storage)
├── index.js                 # Entry point bot
├── package.json             # Manifest dependency (CommonJS)
├── plugins/                 # 770+ Plugin modular terbagi dalam 37 kategori
│   ├── ai/                  # AI & LLM chat (GPT, Gemini, CharacterAI)
│   ├── anime/               # Fitur informasi & gambar anime
│   ├── asupan/              # Konten media asupan
│   ├── cek/                 # Fitur cek/tes & fun validator
│   ├── clan/                # Sistem clan & guild
│   ├── convert/             # Media converter (stiker, audio, bass boost)
│   ├── download/            # Media downloader (YT, TT, IG, FB, Pin)
│   ├── fun/                 # Game teks & hiburan
│   ├── game/                # Game interaktif (Blackjack, Tebak, Werewolf)
│   ├── group/               # Manajemen grup & proteksi (antivirtex, antilink)
│   ├── islamic/             # Fitur religi Islam (Adzan, Doa, Zakat)
│   ├── main/                # Menu utama, help, ping, dan informasi bot
│   ├── owner/               # Perintah khusus owner & channel tools
│   ├── panel/               # Manajemen panel Pterodactyl
│   ├── rpg/                 # Sistem game RPG terintegrasi
│   ├── search/              # Pencarian web, lagu, video, BMKG gempa
│   ├── tools/               # Alat bantu (amprem, viuprem, reactch, pomodoro)
│   └── user/                # Verifikasi, profil, dan level user
└── src/                     # Core engine
    ├── connection.js        # WhatsApp socket connection (cantarelllaa)
    ├── handler.js           # Central message dispatcher & middleware
    └── lib/                 # Modul internal pendukung
```

---

## 🚀 Panduan Instalasi & Pengoperasian

### 1. Persyaratan Sistem
- **Node.js**: Versi 20.x atau 22.x (Rekomendasi: Node.js v22+)
- **FFmpeg**: Terpasang di sistem (`ffmpeg -version`)
- **Git** & **Internet Connection**

### 2. Instalasi Dependensi
Jalankan perintah berikut di root folder project:
```bash
npm install --legacy-peer-deps
```

### 3. Konfigurasi Bot (`config.js`)
Buka file `config.js` dan sesuaikan pengaturan dasar:
```javascript
module.exports = {
  owner: {
    name: "Nama Anda",
    number: ["6281234567890"], // Nomor WhatsApp owner (tanpa + atau 0)
  },
  session: {
    pairingNumber: "6281234567890", // Nomor bot untuk Pairing Code
    usePairingCode: true,           // true = Pairing Code, false = QR Code
  },
  bot: {
    name: "OURIN 3.5 DELUXE",
    version: "3.5",
    developer: "Your Name",
  },
  // ...
};
```

### 4. Menjalankan Bot
```bash
# Menjalankan langsung:
npm start

# Atau dengan node langsung:
node index.js
```

---

## 🔒 Sistem Keamanan: Saluran WhatsApp

Untuk menjaga integritas komunitas resmi, bot dilengkapi middleware pemeriksaan saluran resmi:
- **Channel 1:** `https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D`
- **Channel 2:** `https://whatsapp.com/channel/0029Vb8xSqi0AgWJaiZ9Qm16`

Pengguna baru yang belum terverifikasi akan dibatasi hingga mereka mengikuti kedua saluran dan mengetik `.verif`. Owner dan admin grup memiliki hak pengecualian otomatis (bypass).

---

## 📄 Lisensi & Hak Cipta
Project Ourin 3.5 dikembangkan untuk keperluan otomasi pesan WhatsApp berbasis CommonJS berkinerja tinggi.
