# LAPORAN KEAMANAN — SISTEM WAJIB FOLLOW SALURAN WHATSAPP
# OURIN 3.5 ULTIMATE EDITION

Tanggal: 19 November 2026

---

## 1. Spesifikasi Saluran Resmi

Sistem keamanan Ourin 3.5 mewajibkan seluruh pengguna untuk mengikuti dua saluran resmi:

1. **CHANNEL 1:**
   `https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D`
   Kode Saluran: `0029VaBOlsv002TEjlntTE2D`

2. **CHANNEL 2:**
   `https://whatsapp.com/channel/0029Vb8xSqi0AgWJaiZ9Qm16`
   Kode Saluran: `0029Vb8xSqi0AgWJaiZ9Qm16`

Kedua URL dipertahankan secara utuh dalam source code (`src/lib/ourin-channel-security.js`).

---

## 2. Pesan Akses Ditolak (Access Denied)

Setiap pengguna yang belum diverifikasi dan mencoba menjalankan perintah akan langsung diblokir dan menerima pesan resmi berikut:

```text
ACCESS DENIED — FOLLOW REQUIRED

Untuk menggunakan seluruh fitur Ourin 3.5, kamu wajib mengikuti kedua saluran resmi kami.

CHANNEL 1:
https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D

CHANNEL 2:
https://whatsapp.com/channel/0029Vb8xSqi0AgWJaiZ9Qm16

Silakan ikuti kedua saluran terlebih dahulu.

Akses akan diberikan setelah status follow berhasil diverifikasi.
```

---

## 3. Analisis Teknis & Keterbatasan Protokol WhatsApp

Sesuai ketentuan Bagian 12:
- **Audit Protokol WhatsApp Newsletter:**
  - Protokol WhatsApp Web/Multi-Device yang digunakan oleh pustaka Baileys maupun fork `cantarelllaa` **tidak menyediakan node query untuk mengecek daftar subscriber saluran secara publik**.
  - WhatsApp menerapkan pembatasan privasi ketat: pemilik saluran sekalipun hanya dapat melihat kontak yang nomor teleponnya tersimpan di buku telepon masing-masing.
  - Baileys/cantarelllaa hanya dapat mengambil metadata publik saluran (`subscribers_count`, `name`, `description`, `verification`) melalui fungsi `newsletterMetadata('invite', code)`.
- **Integritas Sistem (Anti-Fake Claims):**
  - Bot **tidak mengklaim deteksi real-time unfollow palsu** yang tidak didukung oleh protokol WhatsApp.
  - Bot menerapkan prinsip **Fail-Closed Security**: akses secara default ditutup untuk seluruh pengguna non-owner sampai verifikasi dilakukan.
  - Setiap verifikasi dicatat dengan masa kedaluwarsa berkala (7 hari) untuk memastikan pengguna tetap aktif di saluran resmi.

---

## 4. Mekanisme Kerja Middleware Terpusat

1. **Penyaringan Perintah:**
   - Ditempatkan di entry point handler perintah (`src/handler.js`) sebelum eksekusi case maupun plugin.
2. **Pengecualian Otomatis (Bypass Permissions):**
   - **Bot Owner & Partner:** Selalu memiliki akses penuh tanpa pemblokiran.
   - **Admin Grup:** Diberikan hak akses di dalam grup yang dikelolanya.
   - **Perintah Verifikasi:** Perintah `.verif`, `.verify`, `.cekverif`, dan `.unverif` selalu diizinkan lewat agar pengguna dapat memproses verifikasinya.
3. **Alur Verifikasi Pengguna:**
   - Pengguna mengikuti kedua saluran melalui tautan resmi.
   - Pengguna mengirim perintah `.verif`.
   - Bot melakukan query status integritas saluran via `sock.newsletterMetadata`.
   - Status verifikasi dicatat ke cache/database sentral.
   - Hak akses seluruh perintah Ourin 3.5 langsung terbuka.
4. **Alur Pencabutan Akses (Revoke):**
   - Owner dapat mencabut akses pengguna bermasalah kapan saja menggunakan perintah `.unverif @user`.
