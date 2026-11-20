"use strict";Object.defineProperty(exports, "__esModule", {value: true});function cekfemboy(nama) {
    try {
        if (!nama) throw new Error('¡Pon tu nombre primero!');
        
        const percent = Math.floor(Math.random() * 101);
        let desc = '';
        let imgUrl = '';
        
        if (percent < 20) {
            desc = 'Cowok banget! 😎';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/normal.gif';
        } else if (percent < 40) {
            desc = 'Ada aura lembutnya dikit~ 🌸';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/dibwh40.gif';
        } else if (percent < 60) {
            desc = 'Lumayan femboy 😘';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/dibwh60.gif';
        } else if (percent < 80) {
            desc = 'Femboy sejati 💅✨';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/dibwh80.gif';
        } else {
            desc = 'FEMBOY DEWA 🔥💖';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/femboyyyy.gif';
        }
        
        return {
            hasil: `${nama}, tu${percent}% femboy!, ${desc}`,
            gif: imgUrl
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

exports. default = cekfemboy
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
