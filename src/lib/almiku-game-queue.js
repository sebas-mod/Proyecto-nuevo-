"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const gameQueue = new Map()
const QUEUE_DELAY = 500
const BATCH_WINDOW = 1000

function getQueueKey(chatId, command) {
    return `${chatId}_${command}`
}

function addToQueue(chatId, command, sender, timestamp) {
    const key = getQueueKey(chatId, command)
    if (!gameQueue.has(key)) {
        gameQueue.set(key, {
            requests: [],
            processing: false,
            lastProcess: 0
        })
    }
    
    const queue = gameQueue.get(key)
    queue.requests.push({ sender, timestamp })
    
    return queue
}

function shouldBatch(chatId, command) {
    const key = getQueueKey(chatId, command)
    const queue = gameQueue.get(key)
    if (!queue) return false
    
    if (queue.requests.length >= 3) return true
    
    const now = Date.now()
    const recentRequests = queue.requests.filter(r => now - r.timestamp < BATCH_WINDOW)
    return recentRequests.length >= 3
}

function getQueuePosition(chatId, command, sender) {
    const key = getQueueKey(chatId, command)
    const queue = gameQueue.get(key)
    if (!queue) return 0
    
    const index = queue.requests.findIndex(r => r.sender === sender)
    return index + 1
}

function clearQueue(chatId, command) {
    const key = getQueueKey(chatId, command)
    gameQueue.delete(key)
}

function isQueueProcessing(chatId, command) {
    const key = getQueueKey(chatId, command)
    const queue = gameQueue.get(key)
    return _optionalChain([queue, 'optionalAccess', _ => _.processing]) || false
}

function setQueueProcessing(chatId, command, processing) {
    const key = getQueueKey(chatId, command)
    const queue = gameQueue.get(key)
    if (queue) {
        queue.processing = processing
        if (processing) queue.lastProcess = Date.now()
    }
}

function getWaitTime(chatId, command) {
    const key = getQueueKey(chatId, command)
    const queue = gameQueue.get(key)
    if (!queue) return 0
    
    return Math.max(0, queue.requests.length * QUEUE_DELAY)
}

async function processWithSmartQueue(chatId, command, sender, callback) {
    const queue = addToQueue(chatId, command, sender, Date.now())
    
    if (shouldBatch(chatId, command) && !queue.processing) {
        setQueueProcessing(chatId, command, true)
        
        const waitTime = getWaitTime(chatId, command)
        if (waitTime > 0) {
            await new Promise(r => setTimeout(r, waitTime))
        }
        
        try {
            const result = await callback()
            return result
        } finally {
            setQueueProcessing(chatId, command, false)
            queue.requests = queue.requests.filter(r => r.sender !== sender)
        }
    } else {
        const position = getQueuePosition(chatId, command, sender)
        const delay = position * QUEUE_DELAY
        
        if (delay > 0) {
            await new Promise(r => setTimeout(r, delay))
        }
        
        try {
            const result = await callback()
            return result
        } finally {
            queue.requests = queue.requests.filter(r => r.sender !== sender)
        }
    }
}

function getActiveGamesCount(chatId) {
    let count = 0
    for (const [key] of gameQueue) {
        if (key.startsWith(chatId)) {
            count++
        }
    }
    return count
}

exports.addToQueue = addToQueue; exports.shouldBatch = shouldBatch; exports.getQueuePosition = getQueuePosition; exports.clearQueue = clearQueue; exports.isQueueProcessing = isQueueProcessing; exports.setQueueProcessing = setQueueProcessing; exports.getWaitTime = getWaitTime; exports.processWithSmartQueue = processWithSmartQueue; exports.getActiveGamesCount = getActiveGamesCount; exports.QUEUE_DELAY = QUEUE_DELAY; exports.BATCH_WINDOW = BATCH_WINDOW;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
