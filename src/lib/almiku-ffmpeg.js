"use strict";
/**
 * src/lib/almiku-ffmpeg.js
 * Devuelve la ruta de ffmpeg.
 *
 * El paquete @ffmpeg-installer/ffmpeg trae un binario por plataforma, pero no
 * existe build para Android/Termux: al requerirlo lanza "Unsupported
 * platform/architecture: android-arm64" y tumbaba el bot sin mensaje.
 * Aquí se intenta el binario empaquetado y, si no hay, se usa el ffmpeg del
 * sistema (en Termux: pkg install ffmpeg).
 */

let ffmpegPath = "ffmpeg";
let ffmpegVersion = "system";

try {
  const installer = require("@ffmpeg-installer/ffmpeg");
  if (installer && installer.path) {
    ffmpegPath = installer.path;
    ffmpegVersion = installer.version || "installer";
  }
} catch (err) {
  // Plataforma sin binario empaquetado: se usa el ffmpeg del sistema.
}

module.exports = { path: ffmpegPath, version: ffmpegVersion };
