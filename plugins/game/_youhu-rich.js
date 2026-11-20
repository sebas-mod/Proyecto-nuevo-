"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/** Shared adapter: Youhu HTML mini-games -> Ourin plugin API. */
 async function sendYouhuGame(m, sock, reply, game) {
  const certificateUrl = "https://raw.githubusercontent.com/noxXza/data/refs/heads/main/certificate.json";
  const payloadUrl = `https://raw.githubusercontent.com/noxXza/data/refs/heads/main/${game.file}.html`;

  try {
    const [certificateRes, payloadRes] = await Promise.all([
      fetch(certificateUrl),
      fetch(payloadUrl),
    ]);
    if (!certificateRes.ok) throw new Error(`certificate HTTP ${certificateRes.status}`);
    if (!payloadRes.ok) throw new Error(`payload HTTP ${payloadRes.status}`);

    const certChain = await certificateRes.json();
    const htmlPayload = await payloadRes.text();
    if (!htmlPayload.trim()) throw new Error("payload game kosong");

    const responseData = {
      response_id: "4db57b2c-8393-484d-8b9a-8e6d1a14b349",
      sections: [{
        view_model: {
          primitive: {
            __typename: "GenAIaeacdsnwHtmlPrimitive",
            payload: htmlPayload,
            trusted_sources: game.trustedSources,
          },
          __typename: "GenAISingleLayoutViewModel",
        },
      }],
    };

    const dataBase64 = Buffer.from(JSON.stringify(responseData, null, 2)).toString("base64");
    const messageType = _nullishCoalesce(game.messageType, () => ( "AI_RICH_RESPONSE_TYPE_STANDARD"));
    const submessageType = _nullishCoalesce(game.submessageType, () => ( "AI_RICH_RESPONSE_TEXT"));
    const contextInfo = {
      ...(game.contextInfo || {}),
      forwardingScore: _nullishCoalesce(_optionalChain([game, 'access', _ => _.contextInfo, 'optionalAccess', _2 => _2.forwardingScore]), () => ( 1)),
      isForwarded: _nullishCoalesce(_optionalChain([game, 'access', _3 => _3.contextInfo, 'optionalAccess', _4 => _4.isForwarded]), () => ( true)),
      forwardedAiBotMessageInfo: {
        botJid: "867051314767696@bot",
        ...(_optionalChain([game, 'access', _5 => _5.contextInfo, 'optionalAccess', _6 => _6.forwardedAiBotMessageInfo]) || {}),
      },
      forwardOrigin: _nullishCoalesce(game.forwardOrigin, () => ( "META_AI")),
    };

    await sock.relayMessage(m.chat, {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: "",
          botResponseId: "b2e40280-433c-45d8-9c1a-270bec558860",
          verificationMetadata: {
            proofs: [{
              version: 1,
              useCase: game.useCase,
              signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
              certificateChain: certChain,
            }],
          },
        },
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType,
            submessages: [{ messageType: submessageType, messageText: game.title }],
            unifiedResponse: { data: dataBase64 },
            contextInfo,
          },
        },
      },
    }, {});
  } catch (error) {
    console.error(`[Youhu Game] ${game.name}:`, error);
    await reply(`❌ Gagal memuat *${game.name}*\n> ${error.message}`);
  }
} exports.sendYouhuGame = sendYouhuGame;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
