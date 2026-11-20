"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

async function downloadSpotify(spotifyUrl) {
  try {
    const response = await _axios2.default.post(
      "https://spotyloader.com/api/spotify/track",
      { url: spotifyUrl },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://spotyloader.com/",
          Origin: "https://spotyloader.com",
        },
      },
    );

    const data = response.data;
    if (data.downloadLink) {
      console.log(
        `Judul  : ${data.post.name}\nArtis  : ${data.post.artist}\nFormat : ${data.post.mime}\nLink   : ${data.downloadLink}`,
      );
    } else {
      console.log("[!] Gagal mendapatkan link:", data);
    }
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
  }
}

downloadSpotify(
  process.argv[2] || "https://open.spotify.com/track/1XabvPK1VQEH4YqzDovs46",
);

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
