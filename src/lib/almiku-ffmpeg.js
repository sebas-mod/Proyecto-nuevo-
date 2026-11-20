"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _os = require('os');
var _child_process = require('child_process');
var _almikuloggerjs = require('./almiku-logger.js');
const CONCURRENCY = Math.max(2, _os.cpus.call(void 0, ).length)
const TIMEOUT = 60000

let queue = []
let running = 0

function runNext() {
    while (running < CONCURRENCY && queue.length > 0) {
        const task = queue.shift()
        running++
        task.execute()
            .then(task.resolve)
            .catch(task.reject)
            .finally(() => {
                running--
                runNext()
            })
    }
}

function queueFFmpeg(command) {
    return new Promise((resolve, reject) => {
        const execute = () => new Promise((res, rej) => {
            const child = _child_process.exec.call(void 0, command, { maxBuffer: 50 * 1024 * 1024 })
            let timedOut = false
            let stderr = ''

            const timer = setTimeout(() => {
                timedOut = true
                child.kill('SIGKILL')
            }, TIMEOUT)

            _optionalChain([child, 'access', _ => _.stderr, 'optionalAccess', _2 => _2.on, 'call', _3 => _3('data', (chunk) => {
                stderr += chunk
                if (stderr.length > 2000) stderr = stderr.slice(-2000)
            })])

            child.on('close', (code) => {
                clearTimeout(timer)
                if (timedOut) return rej(new Error(`FFmpeg timeout (${TIMEOUT / 1000}s)`))
                if (code !== 0) return rej(new Error(`FFmpeg exit code ${code}: ${stderr.split('\n').pop()}`))
                res()
            })

            child.on('error', (err) => {
                clearTimeout(timer)
                rej(err)
            })
        })

        queue.push({ execute, resolve, reject })
        runNext()
    })
}

function getQueueStats() {
    return {
        running,
        queued: queue.length,
        concurrency: CONCURRENCY
    }
}

exports.queueFFmpeg = queueFFmpeg; exports.getQueueStats = getQueueStats; exports.CONCURRENCY = CONCURRENCY;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
