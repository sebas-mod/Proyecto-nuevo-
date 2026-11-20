"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuloggerjs = require('./almiku-logger.js');
const FLUSH_INTERVAL_MS = 5000;

const defaultUsers = {};
const defaultGroups = {};
const defaultSettings = { selfMode: false };
const defaultStats = {};
const defaultSewa = { enabled: false, groups: {} };

class Database {
  constructor(dbPath) {
    this.dbPath = dbPath || _path2.default.join(process.cwd(), "database");
    this.stores = {};
    this.dirty = {
      users: false,
      groups: false,
      settings: false,
      stats: false,
      sewa: false,
    };
    this.db = {
      data: {
        users: {},
        groups: {},
        settings: {},
        stats: {},
        sewa: { enabled: false, groups: {} },
      },
    };
    this.ready = false;
    this.flushTimer = null;
    this.ensureDir();
  }

  ensureDir() {
    if (!_fs2.default.existsSync(this.dbPath)) {
      _fs2.default.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  migrateFromOldPath() {
    const oldPath = _path2.default.join(process.cwd(), "src", "database");
    if (oldPath === this.dbPath) return;
    if (!_fs2.default.existsSync(oldPath)) return;

    const oldFiles = _fs2.default.readdirSync(oldPath).filter((f) => f.endsWith(".json"));
    if (oldFiles.length === 0) return;

    const newFiles = _fs2.default.existsSync(this.dbPath)
      ? _fs2.default.readdirSync(this.dbPath).filter((f) => f.endsWith(".json"))
      : [];
    if (newFiles.length > 0) return;

    _almikuloggerjs.logger.info(
      "database",
      `migrasi ${oldFiles.length}archivo de src / databage a${_path2.default.relative(process.cwd(), this.dbPath)}/`,
    );
    this.ensureDir();

    for (const file of oldFiles) {
      const src = _path2.default.join(oldPath, file);
      const dest = _path2.default.join(this.dbPath, file);
      try {
        _fs2.default.copyFileSync(src, dest);
      } catch (e) {
        _almikuloggerjs.logger.error("database", `fallido migrasi${file}: ${e.message}`);
      }
    }
    _almikuloggerjs.logger.success("database", "Migración de caminos completa");
  }

  async init() {
    try {
      const { LowSync } = await Promise.resolve().then(() => _interopRequireWildcard(require("lowdb")));
      const { JSONFileSync } = await Promise.resolve().then(() => _interopRequireWildcard(require("lowdb/node")));

      this.migrateFromOldPath();
      await this.migrateFromSingleFile();

      const fileMap = {
        users: { file: "users.json", defaults: defaultUsers },
        groups: { file: "groups.json", defaults: defaultGroups },
        settings: { file: "settings.json", defaults: defaultSettings },
        stats: { file: "stats.json", defaults: defaultStats },
        sewa: { file: "sewa.json", defaults: defaultSewa },
        premium: { file: "premium.json", defaults: [] },
        owner: { file: "owner.json", defaults: [] },
        partner: { file: "partner.json", defaults: [] },
      };

      for (const [key, { file, defaults }] of Object.entries(fileMap)) {
        const filePath = _path2.default.join(this.dbPath, file);
        this.validateJsonFile(filePath, defaults, file);
        const adapter = new JSONFileSync(filePath);
        const store = new LowSync(adapter, defaults);
        store.read();
        if (!store.data) store.data = defaults;
        if (Array.isArray(defaults)) {
          if (!Array.isArray(store.data)) store.data = defaults;
        } else {
          store.data = { ...defaults, ...store.data };
        }

        store.write();
        this.stores[key] = store;
      }

      this.db.data = {
        users: this.stores.users.data,
        groups: this.stores.groups.data,
        settings: this.stores.settings.data,
        stats: this.stores.stats.data,
        sewa: this.stores.sewa.data,
        premium: this.stores.premium.data,
        owner: this.stores.owner.data,
      };

      this.db.write = () => this.flushAll();
      this.db.read = () => this.readAll();

      this.startFlushTimer();
      this.registerShutdownHooks();

      const currentDefault = _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _ => _.energi, 'optionalAccess', _2 => _2.default]), () => ( 25));
      const currentPremium = _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _3 => _3.energi, 'optionalAccess', _4 => _4.premium]), () => ( 100));
      const lastDefault = this.db.data.settings._lastEnergiDefault;
      const lastPremium = this.db.data.settings._lastEnergiPremium;

      if (lastDefault !== currentDefault || lastPremium !== currentPremium) {
        const users = this.db.data.users;
        let synced = 0;
        for (const jid in users) {
          const u = users[jid];
          if (u.energi === -1) continue;
          if (u.isPremium) {
            u.energi = currentPremium;
          } else {
            u.energi = currentDefault;
          }
          synced++;
        }
        this.db.data.settings._lastEnergiDefault = currentDefault;
        this.db.data.settings._lastEnergiPremium = currentPremium;
        this.markDirty("users");
        this.markDirty("settings");
        if (synced > 0) {
          _almikuloggerjs.logger.info(
            "database",
            `energía sync${synced}usuario en --update ( predeterminado:${currentDefault}, estreno:${currentPremium})`,
          );
        }
      }

      this.ready = true;
      _almikuloggerjs.logger.success(
        "database",
        "Database siap dipakai (autosave 5s)",
      );
      return this;
    } catch (error) {
      _almikuloggerjs.logger.error("database", `fallido inisialisasi:${error.message}`);
      this.db = {
        data: {
          users: {},
          groups: {},
          settings: { selfMode: false },
          stats: {},
          sewa: { enabled: false, groups: {} },
        },
        write: () => { },
        read: () => { },
      };
      this.ready = true;
      return this;
    }
  }

  startFlushTimer() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => this.flushDirty(), FLUSH_INTERVAL_MS);
    if (this.flushTimer.unref) this.flushTimer.unref();
  }

  registerShutdownHooks() {
    const flush = () => {
      try {
        this.flushAll();
      } catch (e2) { }
    };
    process.on("exit", flush);
    process.on("beforeExit", flush);
  }

  markDirty(key) {
    this.dirty[key] = true;
  }

  flushDirty() {
    for (const key of Object.keys(this.dirty)) {
      if (this.dirty[key] && this.stores[key]) {
        this._asyncWrite(key).catch(() => { });
      }
    }
  }

  async _asyncWrite(key) {
    if (!this.stores[key]) return;
    if (_optionalChain([this, 'access', _5 => _5._writing, 'optionalAccess', _6 => _6.has, 'call', _7 => _7(key)])) {
      _optionalChain([this, 'access', _8 => _8._pendingWrite, 'optionalAccess', _9 => _9.add, 'call', _10 => _10(key)]);
      return;
    }
    if (!this._writing) this._writing = new Set();
    if (!this._pendingWrite) this._pendingWrite = new Set();
    this._writing.add(key);
    try {
      const filePath =
        _optionalChain([this, 'access', _11 => _11.stores, 'access', _12 => _12[key], 'access', _13 => _13.adapter, 'optionalAccess', _14 => _14.filename]) ||
        _path2.default.join(this.dbPath, `${key}.json`);
      const data = this.stores[key].data;
      const json = JSON.stringify(data, null, 2);
      const temp = filePath + ".tmp";
      await _fs2.default.promises.writeFile(temp, json, "utf-8");
      await _fs2.default.promises.rename(temp, filePath);
      this.dirty[key] = false;
    } catch (e3) { }
    this._writing.delete(key);
    if (this._pendingWrite.has(key)) {
      this._pendingWrite.delete(key);
      this._asyncWrite(key).catch(() => { });
    }
  }

  flushAll() {
    for (const key of Object.keys(this.stores)) {
      try {
        this.stores[key].write();
        this.dirty[key] = false;
      } catch (e4) { }
    }
  }

  readAll() {
    for (const store of Object.values(this.stores)) {
      try {
        store.read();
      } catch (e5) { }
    }
  }

  validateJsonFile(filePath, defaults, fileName) {
    if (_fs2.default.existsSync(filePath)) {
      const content = _fs2.default.readFileSync(filePath, "utf-8").trim();
      if (!content || content === "" || content === "{}") {
        _fs2.default.writeFileSync(filePath, JSON.stringify(defaults, null, 2), "utf-8");
      } else {
        try {
          JSON.parse(content);
        } catch (e6) {
          const backup = _path2.default.join(
            this.dbPath,
            `${fileName}.corrupted.${Date.now()}.bak`,
          );
          _fs2.default.copyFileSync(filePath, backup);
          _fs2.default.writeFileSync(
            filePath,
            JSON.stringify(defaults, null, 2),
            "utf-8",
          );
          _almikuloggerjs.logger.warn(
            "database",
            `${fileName}Corrupted, backfired save:${backup}`,
          );
        }
      }
    } else {
      _fs2.default.writeFileSync(filePath, JSON.stringify(defaults, null, 2), "utf-8");
    }
  }

  async migrateFromSingleFile() {
    const oldFile = _path2.default.join(this.dbPath, "energis.json");
    if (!_fs2.default.existsSync(oldFile)) return;

    try {
      const content = _fs2.default.readFileSync(oldFile, "utf-8").trim();
      if (!content) return;
      const data = JSON.parse(content);

      const files = {
        "users.json": data.users || {},
        "groups.json": data.groups || {},
        "settings.json": data.settings || { selfMode: false },
        "stats.json": data.stats || {},
        "sewa.json": data.sewa || { enabled: false, groups: {} },
      };

      for (const [file, fileData] of Object.entries(files)) {
        const target = _path2.default.join(this.dbPath, file);
        if (!_fs2.default.existsSync(target)) {
          _fs2.default.writeFileSync(target, JSON.stringify(fileData, null, 2), "utf-8");
        }
      }

      const backupPath = _path2.default.join(
        this.dbPath,
        `energis.json.migrated.${Date.now()}.bak`,
      );
      _fs2.default.renameSync(oldFile, backupPath);
      _almikuloggerjs.logger.success(
        "database",
        `migraciones de energía. json completado, backup:${_path2.default.basename(backupPath)}`,
      );
    } catch (e) {
      _almikuloggerjs.logger.error("database", `no migraña energía.${e.message}`);
    }
  }

  async save() {
    try {
      this.flushAll();
      return true;
    } catch (error) {
      _almikuloggerjs.logger.error("database", `no se pudo guardar:${error.message}`);
      return false;
    }
  }

  getUser(jid) {
    if (!jid) return null;
    const cleanJid = jid.replace(/@.+/g, "");
    if (cleanJid.length > 15 || cleanJid.startsWith("120")) return null;
    return this.db.data.users[cleanJid] || null;
  }

  setUser(jid, data = {}) {
    if (!jid) return null;
    const cleanJid = jid.replace(/@.+/g, "");
    if (cleanJid.length > 15 || cleanJid.startsWith("120")) return null;
    const existing = this.db.data.users[cleanJid] || {};

    const existingBalance =
      existing.balance !== undefined ? existing.balance : 0;
    if (existing.balance !== undefined) delete existing.balance;
    const existingLimit =
      existing.limit !== undefined
        ? existing.limit
        : _optionalChain([_configjs2.default, 'access', _15 => _15.energi, 'optionalAccess', _16 => _16.default]) || 25;
    if (existing.limit !== undefined) delete existing.limit;

    this.db.data.users[cleanJid] = {
      ...existing,
      ...data,
      jid: cleanJid,
      name: data.name || existing.name || "Unknown",
      number: cleanJid,
      energi: _nullishCoalesce(_nullishCoalesce(data.energi, () => ( existing.energi)), () => ( existingLimit)),
      isPremium: _nullishCoalesce(_nullishCoalesce(data.isPremium, () => ( existing.isPremium)), () => ( false)),
      isBanned: _nullishCoalesce(_nullishCoalesce(data.isBanned, () => ( existing.isBanned)), () => ( false)),
      exp: _nullishCoalesce(_nullishCoalesce(data.exp, () => ( existing.exp)), () => ( 0)),
      level: _nullishCoalesce(_nullishCoalesce(data.level, () => ( existing.level)), () => ( 1)),
      koin: _nullishCoalesce(_nullishCoalesce(data.koin, () => ( existing.koin)), () => ( existingBalance)),
      saldo: _nullishCoalesce(_nullishCoalesce(data.saldo, () => ( existing.saldo)), () => ( 0)),
      unlockedFeatures:
        _nullishCoalesce(_nullishCoalesce(data.unlockedFeatures, () => ( existing.unlockedFeatures)), () => ( [])),
      registeredAt: _nullishCoalesce(_nullishCoalesce(data.registeredAt, () => ( existing.registeredAt)), () => ( null)),
      lastRegisteredAt:
        _nullishCoalesce(_nullishCoalesce(data.lastRegisteredAt, () => ( existing.lastRegisteredAt)), () => ( null)),
      registrationCount:
        _nullishCoalesce(_nullishCoalesce(data.registrationCount, () => ( existing.registrationCount)), () => ( 0)),
      hasClaimedRegisterReward:
        _nullishCoalesce(_nullishCoalesce(data.hasClaimedRegisterReward, () => (
        existing.hasClaimedRegisterReward)), () => (
        false)),
      unregisteredAt: _nullishCoalesce(_nullishCoalesce(data.unregisteredAt, () => ( existing.unregisteredAt)), () => ( null)),
      lastSeen: new Date().toISOString(),
      cooldowns: _nullishCoalesce(_nullishCoalesce(data.cooldowns, () => ( existing.cooldowns)), () => ( {})),
      clanId: _nullishCoalesce(_nullishCoalesce(data.clanId, () => ( existing.clanId)), () => ( null)),
      isRegistered: _nullishCoalesce(_nullishCoalesce(data.isRegistered, () => ( existing.isRegistered)), () => ( false)),
      regName: _nullishCoalesce(_nullishCoalesce(data.regName, () => ( existing.regName)), () => ( null)),
      regAge: _nullishCoalesce(_nullishCoalesce(data.regAge, () => ( existing.regAge)), () => ( null)),
      regGender: _nullishCoalesce(_nullishCoalesce(data.regGender, () => ( existing.regGender)), () => ( null)),
      rpg: { ...(existing.rpg || {}), ...(data.rpg || {}) },
      inventory: { ...(existing.inventory || {}), ...(data.inventory || {}) },
      access: data.access || existing.access || [],
    };

    this.markDirty("users");
    return this.db.data.users[cleanJid];
  }

  deleteUser(jid) {
    if (!jid) return false;
    const cleanJid = jid.replace(/@.+/g, "");
    if (this.db.data.users[cleanJid]) {
      delete this.db.data.users[cleanJid];
      this.markDirty("users");
      return true;
    }
    return false;
  }

  getAllUsers() {
    return this.db.data.users || {};
  }

  getUserCount() {
    return Object.keys(this.db.data.users || {}).length;
  }

  updateEnergi(jid, amount) {
    const user = this.getUser(jid) || this.setUser(jid);
    if (!user) return 0;
    if (user.energi === -1) return -1;

    try {
      const ownerEnergi = _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _17 => _17.energi, 'optionalAccess', _18 => _18.owner]), () => ( -1));
      const premiumEnergi = _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _19 => _19.energi, 'optionalAccess', _20 => _20.premium]), () => ( -1));
      const isOwnerUser = _configjs2.default.isOwner(jid);
      const isPremiumUser = _configjs2.default.isPremium(jid);
      if (isOwnerUser && ownerEnergi === -1) return -1;
      if (isPremiumUser && premiumEnergi === -1) return -1;
    } catch (e7) { }

    user.energi = Math.max(0, (_nullishCoalesce(user.energi, () => ( 0))) + amount);
    this.setUser(jid, user);
    return user.energi;
  }

  updateKoin(jid, amount) {
    const user = this.getUser(jid) || this.setUser(jid);
    if (!user) return 0;
    if (user.koin === -1) return -1;
    const MAX_KOIN = 9000000000000;
    user.koin = Math.max(0, Math.min(MAX_KOIN, (_nullishCoalesce(user.koin, () => ( 0))) + amount));
    this.setUser(jid, user);
    return user.koin;
  }

  updateSaldo(jid, amount) {
    const user = this.getUser(jid) || this.setUser(jid);
    if (!user) return 0;
    user.saldo = Math.max(0, (_nullishCoalesce(user.saldo, () => ( 0))) + amount);
    this.setUser(jid, user);
    return user.saldo;
  }

  updateExp(jid, amount) {
    const user = this.getUser(jid) || this.setUser(jid);
    if (!user) return 0;
    if (user.exp === -1) return -1;
    const MAX_EXP = 9000000000;
    user.exp = Math.max(0, Math.min(MAX_EXP, (_nullishCoalesce(user.exp, () => ( 0))) + amount));
    this.setUser(jid, user);
    return user.exp;
  }

  getTopUsers(field, limit = 10) {
    const users = Object.values(this.db.data.users || {});
    return users
      .filter((u) => (u[field] || 0) > 0)
      .sort((a, b) => (b[field] || 0) - (a[field] || 0))
      .slice(0, limit);
  }

  checkCooldown(jid, command, seconds) {
    let user = this.getUser(jid);
    if (!user) {
      this.setUser(jid);
      user = this.getUser(jid);
    }
    if (!user) return false;
    if (!user.cooldowns || typeof user.cooldowns !== "object") {
      user.cooldowns = {};
      this.setUser(jid, { cooldowns: {} });
    }
    const now = Date.now();
    const cooldownEnd = user.cooldowns[command] || 0;
    if (now < cooldownEnd) {
      return Math.ceil((cooldownEnd - now) / 1000);
    }
    return false;
  }

  setCooldown(jid, command, seconds) {
    let user = this.getUser(jid);
    if (!user) user = this.setUser(jid, { cooldowns: {} });
    if (!user) return;
    if (!user.cooldowns || typeof user.cooldowns !== "object")
      user.cooldowns = {};
    user.cooldowns[command] = Date.now() + seconds * 1000;
    this.setUser(jid, { cooldowns: user.cooldowns });
  }

  getGroup(jid) {
    if (!jid) return null;
    return this.db.data.groups[jid] || null;
  }

  setGroup(jid, data = {}) {
    if (!jid) return null;
    const existing = this.db.data.groups[jid] || {};

    let cfg;
    cfg = _configjs2.default;
    const welcomeDefault = _nullishCoalesce(_optionalChain([cfg, 'access', _21 => _21.welcome, 'optionalAccess', _22 => _22.defaultEnabled]), () => ( false));
    const goodbyeDefault = _nullishCoalesce(_optionalChain([cfg, 'access', _23 => _23.goodbye, 'optionalAccess', _24 => _24.defaultEnabled]), () => ( false));

    this.db.data.groups[jid] = {
      ...existing,
      ...data,
      jid,
      name: data.name || existing.name || "Unknown Group",
      welcome: _nullishCoalesce(_nullishCoalesce(data.welcome, () => ( existing.welcome)), () => ( welcomeDefault)),
      leave: _nullishCoalesce(_nullishCoalesce(data.leave, () => ( existing.leave)), () => ( goodbyeDefault)),
      goodbye: _nullishCoalesce(_nullishCoalesce(data.goodbye, () => ( existing.goodbye)), () => ( goodbyeDefault)),
      antilink: _nullishCoalesce(_nullishCoalesce(data.antilink, () => ( existing.antilink)), () => ( false)),
      antitoxic: _nullishCoalesce(_nullishCoalesce(data.antitoxic, () => ( existing.antitoxic)), () => ( false)),
      mute: _nullishCoalesce(_nullishCoalesce(data.mute, () => ( existing.mute)), () => ( false)),
      game: _nullishCoalesce(_nullishCoalesce(data.game, () => ( existing.game)), () => ( true)),
      rpg: _nullishCoalesce(_nullishCoalesce(data.rpg, () => ( existing.rpg)), () => ( true)),
      warnings: _nullishCoalesce(_nullishCoalesce(data.warnings, () => ( existing.warnings)), () => ( [])),
      welcomeMsg: _nullishCoalesce(data.welcomeMsg, () => ( existing.welcomeMsg)),
      goodbyeMsg: _nullishCoalesce(data.goodbyeMsg, () => ( existing.goodbyeMsg)),
      intro: _nullishCoalesce(data.intro, () => ( existing.intro)),
      chat: _nullishCoalesce(existing.chat, () => ( {})),
    };

    this.markDirty("groups");
    return this.db.data.groups[jid];
  }

  getAllGroups() {
    return this.db.data.groups || {};
  }

  setting(key, value = undefined) {
    if (value !== undefined) {
      this.db.data.settings[key] = value;
      this.markDirty("settings");
    }
    return this.db.data.settings[key];
  }

  getSettings() {
    return this.db.data.settings || {};
  }

  incrementStat(key, increment = 1) {
    if (!this.db.data.stats[key]) this.db.data.stats[key] = 0;
    this.db.data.stats[key] += increment;
    this.markDirty("stats");
    return this.db.data.stats[key];
  }

  getStats(key) {
    if (key) return this.db.data.stats[key] || 0;
    return this.db.data.stats || {};
  }

  resetAllEnergi(defaultEnergi = 25, premiumEnergi = -1) {
    let count = 0;
    for (const jid of Object.keys(this.db.data.users)) {
      const user = this.db.data.users[jid];
      user.energi = user.isPremium ? premiumEnergi : defaultEnergi;
      count++;
    }
    this.markDirty("users");
    return count;
  }

  resetToDefaults() {
    this.flushAll();

    const backupDir = _path2.default.join(this.dbPath, "backups");
    if (!_fs2.default.existsSync(backupDir)) _fs2.default.mkdirSync(backupDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFolder = _path2.default.join(backupDir, `pre-restablecer-${ts}`);
    _fs2.default.mkdirSync(backupFolder, { recursive: true });

    const fileMap = {
      users: { file: "users.json", defaults: defaultUsers },
      groups: { file: "groups.json", defaults: defaultGroups },
      settings: { file: "settings.json", defaults: defaultSettings },
      stats: { file: "stats.json", defaults: defaultStats },
      sewa: { file: "sewa.json", defaults: defaultSewa },
      premium: { file: "premium.json", defaults: [] },
      owner: { file: "owner.json", defaults: [] },
      partner: { file: "partner.json", defaults: [] },
    };

    let resetCount = 0;
    for (const [key, { file, defaults }] of Object.entries(fileMap)) {
      const filePath = _path2.default.join(this.dbPath, file);
      if (!_fs2.default.existsSync(filePath)) continue;
      try {
        _fs2.default.copyFileSync(filePath, _path2.default.join(backupFolder, file));
      } catch (e8) { }
      try {
        _fs2.default.writeFileSync(filePath, JSON.stringify(defaults, null, 2), "utf-8");
        resetCount++;
      } catch (e9) { }
    }

    for (const [key, { defaults }] of Object.entries(fileMap)) {
      if (!this.stores[key]) continue;
      this.stores[key].read();
      if (!this.stores[key].data) this.stores[key].data = defaults;
      if (Array.isArray(defaults)) {
        if (!Array.isArray(this.stores[key].data))
          this.stores[key].data = defaults;
      } else {
        this.stores[key].data = { ...defaults, ...this.stores[key].data };
      }
      this.stores[key].write();
    }

    this.db.data = {
      users: this.stores.users.data,
      groups: this.stores.groups.data,
      settings: this.stores.settings.data,
      stats: this.stores.stats.data,
      sewa: this.stores.sewa.data,
      premium: this.stores.premium.data,
      owner: this.stores.owner.data,
    };

    if (this.stores.partner) {
      this.db.data.partner = this.stores.partner.data;
    }

    this.dirty = {
      users: false,
      groups: false,
      settings: false,
      stats: false,
      sewa: false,
    };

    return {
      resetCount,
      total: Object.keys(fileMap).length,
      backupFolder: `backups/pre-restablecer-${ts}`,
    };
  }

  backup() {
    this.flushAll();
    const backupDir = _path2.default.join(this.dbPath, "backups");
    if (!_fs2.default.existsSync(backupDir)) _fs2.default.mkdirSync(backupDir, { recursive: true });

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const combined = {
      users: this.db.data.users,
      groups: this.db.data.groups,
      settings: this.db.data.settings,
      stats: this.db.data.stats,
      sewa: this.db.data.sewa,
      premium: this.db.data.premium,
      owner: this.db.data.owner,
    };
    const backupPath = _path2.default.join(backupDir, `backup-${ts}.json`);
    _fs2.default.writeFileSync(backupPath, JSON.stringify(combined, null, 2), "utf-8");
    return backupPath;
  }
  get users() {
    return this.db.data.users;
  }
  get groups() {
    return this.db.data.groups;
  }
  get settings() {
    return this.db.data.settings;
  }
  get stats() {
    return this.db.data.stats;
  }
  get sewa() {
    return this.db.data.sewa;
  }
  get premium() {
    return this.db.data.premium;
  }
  get owner() {
    return this.db.data.owner;
  }
  get partner() {
    return this.db.data.partner;
  }

  get data() {
    return this.db.data;
  }

  set data(val) {
    this.db.data = val;
  }
}

let dbInstance = null;

async function initDatabase(dbPath) {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    await dbInstance.init();
  }
  return dbInstance;
}

function getDatabase() {
  if (!dbInstance) {
    throw new Error(
      "Databage no inicializado. Llamar en la primera entradaDatabase.",
    );
  }
  return dbInstance;
}

exports.Database = Database; exports.initDatabase = initDatabase; exports.getDatabase = getDatabase;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
