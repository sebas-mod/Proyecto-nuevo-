"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
async function likee(url){
    try{
        if(!/likee\.video|likee\.com|likee\.video/.test(url)) throw new Error('Invalid url')

        const res = await _axios2.default.post(
            'https://likeedownloader.com/process',
            new URLSearchParams({ id:url, locale:'en' }),
            {
                headers:{
                    'User-Agent':'Mozilla/5.0 (Linux; Android 10)',
                    'Accept':'application/json,text/javascript,*/*',
                    'x-requested-with':'XMLHttpRequest',
                    'Content-Type':'application/x-www-form-urlencoded',
                    origin:'https://likeedownloader.com',
                    referer:'https://likeedownloader.com/en'
                }
            }
        )

        const html = res.data && res.data.template ? res.data.template : null
        if(!html) throw new Error('Fetch failed')

        function pick(re){
            const m = html.match(re)
            return m ? m[1] : null
        }

        return {
            thumbnail : pick(/<img[^>]+src="([^"]+)"/),
            with_watermark : pick(/with_watermark[^>]+href="([^"]+)"/),
            without_watermark : pick(/without_watermark[^>]+href="([^"]+)"/),
            stats : pick(/(\d{1,2}\.\d{1,2}K[^<]+)/)
        }

    }catch(e){
        throw new Error(e.message)
    }
}

exports. default = likee
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
