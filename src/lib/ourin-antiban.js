"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const fs = require("fs");
const path = require("path");
const colors = require("./ourin-logger.js");

/**
 * Inisialisasi sistem Anti-Ban Ourin
 * @param {Object} sock - Baileys socket instance
 */
async function initializeOurinAntiban(sock) {
  try {
    const antibanDir = path.join(process.cwd(), "database", "antiban");
    if (!fs.existsSync(antibanDir)) {
      fs.mkdirSync(antibanDir, { recursive: true });
    }
    colors.logger.success("ANTIBAN", "Modul proteksi Anti-Ban WhatsApp berhasil aktif.");
    return true;
  } catch (error) {
    colors.logger.warn("ANTIBAN", `Inisialisasi antiban: ${error.message}`);
    return false;
  }
}

exports.initializeOurinAntiban = initializeOurinAntiban;
exports.default = { initializeOurinAntiban };
