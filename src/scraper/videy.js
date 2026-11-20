"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
async function videy(file){
    try{
        if(!file) throw new Error('input required')
        if(!_fs2.default.existsSync(file)) throw new Error('file not found')

        const form = new (0, _formdata2.default)()
        form.append(
            'file',
            _fs2.default.createReadStream(file),
            {
                filename: _path2.default.basename(file),
                contentType: 'video/mp4'
            }
        )

        const r = await _axios2.default.post(
            'https://videy.co/api/upload?visitorId=' + _crypto2.default.randomUUID(),
            form,
            {
                headers:{
                    ...form.getHeaders(),
                    'User-Agent':'Mozilla/5.0 (Linux; Android 10)',
                    origin:'https://videy.co',
                    referer:'https://videy.co/',
                    accept:'application/json'
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        )

        return {
            output:r.data
        }

    }catch(e){
        return { status:'error', msg:e.message }
    }
}

exports. default = videy
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
