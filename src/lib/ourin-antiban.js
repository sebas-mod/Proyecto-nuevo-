"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const fs = require("fs");
const path = require("path");
const colors = require("./ourin-logger.js");

/**
* Inicialización de Anti Ban Ourin System
 * @param {Object} sock - Baileys socket instance
 */
async function initializeOurinAntiban(sock) {
  try {
    const antibanDir = path.join(process.cwd(), "database", "antiban");
    if (!fs.existsSync(antibanDir)) {
      fs.mkdirSync(antibanDir, { recursive: true });
    }
    colors.logger.success("ANTIBAN", "Anti Ban Processing Modul está activo.");
    return true;
  } catch (error) {
    colors.logger.warn("ANTIBAN", `Inisialisasi antiban: ${error.message}`);
    return false;
  }
}

exports.initializeOurinAntiban = initializeOurinAntiban;
exports.default = { initializeOurinAntiban };
