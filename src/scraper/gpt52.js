"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/***
  @ Base: https://chatgpt.com/
  @ Author: Shannz
@ Nota: Accesschatgnt sin login, softe chats continuos, streaming, búsquida web, y subiendo imágenes.
***/

var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);

let _fetch = globalThis.fetch;
if (!_fetch) {
  const { fetch } = _interopRequireWildcard(require("undici"));
  _fetch = fetch;
}

let _perf = globalThis.performance;
if (!_perf) {
  const { performance } = _interopRequireWildcard(require("perf_hooks"));
  _perf = performance;
}

 class ChatGPT {
  constructor(cfg = {}) {
    this.baseUrl = "https://chatgpt.com";
    this.userAgent =
      _nullishCoalesce(cfg.userAgent, () => (
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36"));
    this.oaiDid = _nullishCoalesce(cfg.did, () => ( _crypto2.default.randomUUID()));
    this.screenWidth = _nullishCoalesce(cfg.screenWidth, () => ( 423));
    this.screenHeight = _nullishCoalesce(cfg.screenHeight, () => ( 965));
    this.lang = _nullishCoalesce(cfg.lang, () => ( "id-ID"));
    this.buildNumber =
      _nullishCoalesce(cfg.buildNumber, () => ( "prod-69a06c53754594935887d6c16b844885964a78fc"));
    this.authToken = _nullishCoalesce(cfg.authToken, () => ( null));
  }

  async send(message, opts = {}) {
    if (!_optionalChain([message, 'optionalAccess', _ => _.trim, 'call', _2 => _2()])) throw new Error("Mensaje no puede estar vacío.");

    const {
      conversationId = null,
      parentMessageId = null,
      imagePath = null,
      webSearch = false,
      stream = false,
      onChunk,
    } = opts;

    const parentMsgId = _nullishCoalesce(parentMessageId, () => ( "client-created-root"));
    const msgId = _crypto2.default.randomUUID();

    let image = null;
    if (imagePath) {
      image = await this._uploadImage(imagePath, {
        conversationId,
        parentMsgId,
      });
    }

    const [tokens, conduitToken] = await Promise.all([
      this._generateSentinelTokens(),
      this._getConduitToken(message, msgId, {
        conversationId,
        parentMsgId,
        webSearch,
        image,
      }),
    ]);

    const body = this._buildMessageBody(message, msgId, {
      conversationId,
      parentMsgId,
      webSearch,
      image,
    });

    const res = await _fetch(`${this.baseUrl}/backend-anon/f/conversation`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: this._headers({
        accept: "text/event-stream",
        "OAI-Language": this.lang,
        "OpenAI-Sentinel-Chat-Requirements-Token": tokens.chatRequirementsToken,
        "OpenAI-Sentinel-Turnstile-Token": tokens.turnstile,
        "OpenAI-Sentinel-Proof-Token": tokens.pow,
        "X-Conduit-Token": conduitToken,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "(no body)");
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    return this._parseSSE(res.body, { stream, onChunk });
  }

  async _uploadImage(filePath, ctx = {}) {
    if (!_fs2.default.existsSync(filePath)) {
      throw new Error(`El archivo no se encuentra:${filePath}`);
    }

    const fileBuffer = _fs2.default.readFileSync(filePath);
    const fileName = _path2.default.basename(filePath);
    const mimeType = this._getMimeType(fileName);
    const sizeBytes = fileBuffer.length;
    const { width, height } = this._getImageDimensions(fileBuffer, mimeType);

    const registerRes = await _fetch(`${this.baseUrl}/backend-anon/files`, {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({
        file_name: fileName,
        file_size: sizeBytes,
        use_case: "multimodal",
        timezone_offset_min: new Date().getTimezoneOffset(),
        reset_rate_limits: false,
      }),
    }).then((r) => r.json());

    const { upload_url, file_id } = registerRes;
    if (!upload_url || !file_id) {
      throw new Error(`Stunner lista archivo:${JSON.stringify(registerRes)}`);
    }

    const uploadRes = await _fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
        "x-ms-blob-type": "BlockBlob",
        "x-ms-version": "2020-04-08",
      },
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      throw new Error(`La carga de bloques falló: HTTP${uploadRes.status}`);
    }

    const processBody = {
      file_id,
      use_case: "multimodal",
      index_for_retrieval: false,
      file_name: fileName,
    };

    if (ctx.conversationId || ctx.parentMsgId) {
      processBody.metadata = {
        library_file_info: {
          origination_message_id: _nullishCoalesce(ctx.parentMsgId, () => ( null)),
          origination_thread_id: _nullishCoalesce(ctx.conversationId, () => ( null)),
        },
      };
    }

    const processRes = await _fetch(
      `${this.baseUrl}/backend-anon/files/process_upload_stream`,
      {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify(processBody),
      },
    );

    const decoder = new TextDecoder();
    let buf = "";
    for await (const chunk of processRes.body) {
      buf += decoder.decode(chunk, { stream: true });
      if (buf.includes("file.processing.completed")) break;
    }

    return { fileId: file_id, fileName, mimeType, sizeBytes, width, height };
  }

  _headers(extra = {}) {
    return {
      "User-Agent": this.userAgent,
      accept: "*/*",
      "accept-language": `${this.lang},en-US;q=0.9,en;q=0.8`,
      "content-type": "application/json",
      "OAI-Device-Id": this.oaiDid,
      "sec-ch-ua": '"Chromium";v="144", "Not/A)Brand";v="24"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      origin: "https://chatgpt.com",
      referer: "https://chatgpt.com/",
      ...(this.authToken ? { authorization: `Bearer ${this.authToken}` } : {}),
      ...extra,
    };
  }

  _fnv1a(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    h ^= h >>> 16;
    h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16;
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  _encodeConfig(cfg) {
    return Buffer.from(JSON.stringify(cfg)).toString("base64");
  }

  _makeBrowserConfig() {
    return [
      this.screenWidth + this.screenHeight,
      String(new Date()),
      2172649472,
      0,
      this.userAgent,
      null,
      this.buildNumber,
      this.lang,
      `${this.lang},en`,
      0,
      "contacts\u2212[object ContactsManager]",
      "_reactListening",
      "User",
      _perf.now(),
      _crypto2.default.randomUUID(),
      "",
      8,
      _perf.timeOrigin,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ];
  }

  _computePow(seed, difficulty, cfg) {
    const start = _perf.now();
    for (let i = 0; i < 500000; i++) {
      cfg[3] = i;
      cfg[9] = Math.round(_perf.now() - start);
      const encoded = this._encodeConfig(cfg);
      if (
        this._fnv1a(seed + encoded).substring(0, difficulty.length) <=
        difficulty
      ) {
        return "gAAAAAB" + encoded + "~S";
      }
    }
    return "wQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4De";
  }

  async _generateSentinelTokens() {
    const initCfg = this._makeBrowserConfig();
    initCfg[3] = 1;
    initCfg[9] = 0;
    const initToken = "gAAAAAC" + this._encodeConfig(initCfg);

    const prepareRes = await _fetch(
      `${this.baseUrl}/backend-anon/sentinel/chat-requirements/prepare`,
      {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify({ p: initToken }),
      },
    ).then((r) => r.json());

    let pow = null;
    if (_optionalChain([prepareRes, 'access', _3 => _3.proofofwork, 'optionalAccess', _4 => _4.required])) {
      pow = this._computePow(
        prepareRes.proofofwork.seed,
        prepareRes.proofofwork.difficulty,
        this._makeBrowserConfig(),
      );
    }

    const turnstile = _crypto2.default
      .randomBytes(Math.floor((2256 / 4) * 3))
      .toString("base64")
      .slice(0, 2256);

    const finalizeBody = { prepare_token: _nullishCoalesce(prepareRes.prepare_token, () => ( "")) };
    if (pow) finalizeBody.proofofwork = pow;
    if (turnstile) finalizeBody.turnstile = turnstile;

    const finalizeRes = await _fetch(
      `${this.baseUrl}/backend-anon/sentinel/chat-requirements/finalize`,
      {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify(finalizeBody),
      },
    ).then((r) => r.json());

    return { pow, turnstile, chatRequirementsToken: _nullishCoalesce(finalizeRes.token, () => ( null)) };
  }

  async _getConduitToken(
    message,
    msgId,
    { conversationId, parentMsgId, webSearch, image },
  ) {
    const body = {
      action: "next",
      fork_from_shared_post: false,
      parent_message_id: parentMsgId,
      model: "auto",
      timezone_offset_min: new Date().getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      conversation_mode: { kind: "primary_assistant" },
      system_hints: webSearch ? ["search"] : [],
      supports_buffering: true,
      supported_encodings: ["v1"],
      partial_query: {
        id: msgId,
        author: { role: "user" },
        content: { content_type: "text", parts: [message] },
      },
      client_contextual_info: { app_name: "chatgpt.com" },
    };

    if (conversationId) body.conversation_id = conversationId;
    if (image) body.attachment_mime_types = [image.mimeType];

    const res = await _fetch(
      `${this.baseUrl}/backend-anon/f/conversation/prepare`,
      {
        method: "POST",
        headers: this._headers({ "X-Conduit-Token": "no-token" }),
        body: JSON.stringify(body),
      },
    );
    const data = await res.json();
    return _nullishCoalesce(data.token, () => ( data.conduit_token));
  }

  _buildMessageBody(
    message,
    msgId,
    { conversationId, parentMsgId, webSearch, image },
  ) {
    let content, msgMeta;

    if (image) {
      content = {
        content_type: "multimodal_text",
        parts: [
          {
            content_type: "image_asset_pointer",
            asset_pointer: `file-service://${image.fileId}`,
            size_bytes: image.sizeBytes,
            width: image.width,
            height: image.height,
          },
          message,
        ],
      };
      msgMeta = {
        attachments: [
          {
            id: image.fileId,
            size: image.sizeBytes,
            name: image.fileName,
            mime_type: image.mimeType,
            width: image.width,
            height: image.height,
            source: "local",
            is_big_paste: false,
          },
        ],
        selected_github_repos: [],
        selected_all_github_repos: false,
        serialization_metadata: { custom_symbol_offsets: [] },
      };
    } else {
      content = { content_type: "text", parts: [message] };
      msgMeta = {
        selected_github_repos: [],
        selected_all_github_repos: false,
        serialization_metadata: { custom_symbol_offsets: [] },
        ...(webSearch ? { system_hints: ["search"] } : {}),
      };
    }

    const body = {
      action: "next",
      messages: [
        {
          id: msgId,
          author: { role: "user" },
          create_time: Date.now() / 1000,
          content,
          metadata: msgMeta,
        },
      ],
      parent_message_id: parentMsgId,
      model: "auto",
      timezone_offset_min: new Date().getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      conversation_mode: { kind: "primary_assistant" },
      enable_message_followups: true,
      system_hints: webSearch ? ["search"] : [],
      supports_buffering: true,
      supported_encodings: ["v1"],
      client_contextual_info: {
        is_dark_mode: true,
        time_since_loaded: 10,
        page_height: 845,
        page_width: 423,
        pixel_ratio: 1.7,
        screen_height: this.screenHeight,
        screen_width: this.screenWidth,
        app_name: "chatgpt.com",
      },
      no_auth_ad_preferences: {
        personalization_enabled: true,
        history_enabled: true,
      },
      paragen_cot_summary_display_override: "allow",
      force_parallel_switch: "auto",
    };

    if (conversationId) body.conversation_id = conversationId;

    if (webSearch) {
      body.force_use_search = true;
      body.client_reported_search_source = "conversation_composer_web_icon";
    }

    return body;
  }

  async _parseSSE(body, { stream, onChunk }) {
    const decoder = new TextDecoder();
    let buf = "";
    let fullText = "";
    let title = null;
    let model = null;
    let convId = null;
    let assistantMsgId = null;

    for await (const chunk of body) {
      buf += decoder.decode(chunk, { stream: true });

      const lines = buf.split("\n");
      buf = _nullishCoalesce(lines.pop(), () => ( ""));

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;

        let json;
        try {
          json = JSON.parse(raw);
        } catch (e) {
          continue;
        }

        if (json.conversation_id) {
          convId = json.conversation_id;
        } else if (_optionalChain([json, 'access', _5 => _5.v, 'optionalAccess', _6 => _6.conversation_id])) {
          convId = json.v.conversation_id;
        }

        if (
          json.v &&
          !Array.isArray(json.v) &&
          _optionalChain([json, 'access', _7 => _7.v, 'access', _8 => _8.message, 'optionalAccess', _9 => _9.author, 'optionalAccess', _10 => _10.role]) === "assistant" &&
          _optionalChain([json, 'access', _11 => _11.v, 'access', _12 => _12.message, 'optionalAccess', _13 => _13.id])
        ) {
          assistantMsgId = json.v.message.id;
        }

        if (json.type === "title_generation") title = json.title;

        if (json.type === "server_ste_metadata")
          model = _nullishCoalesce(_optionalChain([json, 'access', _14 => _14.metadata, 'optionalAccess', _15 => _15.model_slug]), () => ( null));

        const patches = Array.isArray(json.v) ? json.v : [];
        for (const p of patches) {
          if (p.o === "append" && _optionalChain([p, 'access', _16 => _16.p, 'optionalAccess', _17 => _17.includes, 'call', _18 => _18("/message/content/parts/0")])) {
            fullText += p.v;
            if (stream && typeof onChunk === "function") onChunk(p.v);
          }
        }
      }
    }

    return {
      text: fullText,
      title,
      model,
      conversationId: convId,
      messageId: assistantMsgId,
    };
  }

  _getMimeType(fileName) {
    const ext = _path2.default.extname(fileName).toLowerCase();
    return (
      _nullishCoalesce({
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
      }[ext], () => ( "application/octet-stream"))
    );
  }

  _getImageDimensions(buffer, mimeType) {
    try {
      if (mimeType === "image/png") {
        return {
          width: buffer.readUInt32BE(16),
          height: buffer.readUInt32BE(20),
        };
      }
      if (mimeType === "image/jpeg") {
        let i = 2;
        while (i < buffer.length - 8) {
          if (buffer[i] !== 0xff) break;
          const marker = buffer[i + 1];
          const segLen = buffer.readUInt16BE(i + 2);
          if (marker >= 0xc0 && marker <= 0xc3) {
            return {
              height: buffer.readUInt16BE(i + 5),
              width: buffer.readUInt16BE(i + 7),
            };
          }
          i += 2 + segLen;
        }
      }
    } catch (e2) {}
    return { width: 0, height: 0 };
  }
} exports.ChatGPT = ChatGPT;
const client = new ChatGPT({ lang: "id-ID" });

function buildPrompt({ message, instruction = "", history = [] }) {
  const parts = [];

  if (_optionalChain([instruction, 'optionalAccess', _19 => _19.trim, 'call', _20 => _20()])) {
    parts.push(
      [
        "IKUTI INSTRUKSI SISTEM BERIKUT SECARA KETAT.",
        "No corto, no se ignoran, y no cambie la etiqueta de formulario solicitada.",
        "Si las instrucciones del sistema piden etiquetas como SnarACTION:.",
        "No envuelva la respuesta con la cerca de código de marcado a menos que el contenido del RICH: pidió CODE.",
        "No explique las reglas, el cielo está en consonancia con las instrucciones.",
        "",
        "SYSTEM INSTRUCTION:",
        instruction.trim(),
      ].join("\n"),
    );
  }

  if (Array.isArray(history) && history.length > 0) {
    const formattedHistory = history
      .slice(-10)
      .map((item) => {
        const role = _optionalChain([item, 'optionalAccess', _21 => _21.role]) === "assistant" ? "Assistant" : "User";
        const content = String(_optionalChain([item, 'optionalAccess', _22 => _22.content]) || "").trim();
        return content ? `${role}: ${content}` : "";
      })
      .filter(Boolean)
      .join("\n");

    if (formattedHistory) {
      parts.push(`Historial PERCAKAPAN:\n${formattedHistory}`);
    }
  }

  parts.push(
    [
      "SUSER cuando esto es:",
      String(message || "").trim(),
      "",
      "ATURAN OUTPUT:",
      "- Pertahankan format tag spesial secara persis bila dibutuhkan.",
      "- No lo convierta en otra variedad.",
      "- No trate de ser un marcador regular.",
      "- No pongas la valla de código.```Al principio o al final del día.",
    ].join("\n"),
  );

  return parts.filter(Boolean).join("\n\n");
}

function ensureTempDir() {
  const tempDir = _path2.default.join(process.cwd(), "temp");
  if (!_fs2.default.existsSync(tempDir)) {
    _fs2.default.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

function detectImageExtension(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return ".jpg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return ".png";
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return ".jpg";
  }

  if (
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  ) {
    return ".webp";
  }

  if (buffer.subarray(0, 3).toString() === "GIF") {
    return ".gif";
  }

  return ".jpg";
}

async function chat({
  message,
  instruction = "",
  imageBuffer = null,
  history = [],
} = {}) {
  if (!_optionalChain([message, 'optionalAccess', _23 => _23.trim, 'call', _24 => _24()])) {
    throw new Error("Message is required.");
  }

  const prompt = buildPrompt({ message, instruction, history });
  let tempFilePath = null;

  try {
    if (imageBuffer) {
      const tempDir = ensureTempDir();
      const ext = detectImageExtension(imageBuffer);
      tempFilePath = _path2.default.join(tempDir, `gpt52_${_crypto2.default.randomUUID()}${ext}`);
      _fs2.default.writeFileSync(tempFilePath, imageBuffer);
    }

    const result = await client.send(prompt, {
      imagePath: tempFilePath,
    });

    const text = String(_optionalChain([result, 'optionalAccess', _25 => _25.text]) || "")
      .replace(/\*\*(.+?)\*\*/g, "*$1*")
      .trim();

    return {
      text,
      raw: _optionalChain([result, 'optionalAccess', _26 => _26.text]) || text,
      model: _optionalChain([result, 'optionalAccess', _27 => _27.model]) || "gpt52",
      conversationId: _optionalChain([result, 'optionalAccess', _28 => _28.conversationId]) || null,
      messageId: _optionalChain([result, 'optionalAccess', _29 => _29.messageId]) || null,
    };
  } finally {
    if (tempFilePath && _fs2.default.existsSync(tempFilePath)) {
      _fs2.default.unlinkSync(tempFilePath);
    }
  }
}

exports.chat = chat;
exports. default = chat;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
