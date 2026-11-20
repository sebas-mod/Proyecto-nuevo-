"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
async function dramaboxsearch(q){
  try{
    const r = await _axios2.default.get(`https://www.dramabox.com/search?searchValue=${encodeURIComponent(q)}`)

    const json = JSON.parse(
      r.data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]
    )
    const list = json.props.pageProps.bookList || []
    return {
      query: q,
      total: list.length,
      results: list.map(v => ({
        id: v.bookId,
        title: v.bookName,
        episodes: v.totalChapterNum,
        description: v.introduction,
        cover: v.coverCutWap || v.coverWap,
        play_url: `https://www.dramabox.com/video/${v.bookId}_${v.bookNameEn}/${v.chapterId}_Episode-1`
      }))
    }

  }catch(e){
    return { status:'eror', msg: e.message }
  }
}

exports. default = dramaboxsearch
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
