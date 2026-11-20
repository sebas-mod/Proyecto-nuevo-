"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuloggerjs = require('./almiku-logger.js');
/**
 * @typedef {Object} PluginConfig
* @ proprie{string}nombre - Nombre del comando (sin prefix)
- Array alias para el comando
* @ proprie{string}categoría - enchufe de categoría (propietario, principal, utilidad, diversión, dll )
* @ proprie{string}descripción - Decryption short comando
* @ proprie{string}Uage - Mando de uso de cara
* @ proprie{string}examp - comando de uso de la palabra usuario
* @ proprie{boolean}iisOwner - Es un dueño especial del Comando
* @ proprie{boolean}isPremium - Es el usuario de estreno de las especies de comandos
* @ proprie{boolean}- ¿La brújula es sólo para grupo?
* Perfil{boolean}inavate - es compez sólo para el chat primate
* @ proprie{boolean}isadmin - ¿El comando necesita grupo de administración
* @ proprie{boolean}IsBotAdmin - ¿Tiene que ser un administrador
* @ proprie{number}Enfriamiento - Enfriamiento en segundos
* @ proprie{number}- Contar el límite utilizado por ejecución
* @ proprie{boolean}isEnabled - Es los plugins activos
 */

/**
 * @typedef {Object} Plugin
* @ proprie{PluginConfig}config - Configurar plugins
 * @property {PluginHandler} handler - Fungsi handler plugin
 */

/**
 * @callback PluginHandler
 * @param {Object} m - Serialized message object
* @ param{Object}Params-- Parámetros adicionales
 * @param {Object} params.sock - Socket connection Baileys
 * @param {Object} params.store - Data store
* @ param{Object}param. config - configuración de spa
 * @param {Object} params.plugins - All loaded plugins
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} PluginStore
* @ propriety { Carpeta<string, Plugin>comandos - Nombre del comando Carpeta al plug
* @ propriety { Carpeta<string, string>Aliases - Carpeta alias para el nombre de comando
 * @property {Map<string, Plugin[]>} categories - Map category ke array plugins
 */

/**
* Colección para almacenar todos los plugins
 * @type {PluginStore}
 */
const pluginStore = {
  commands: new Map(),
  aliases: new Map(),
  categories: new Map(),
};

/**
* Config predeterminado para plugins
 * @type {PluginConfig}
 */
const defaultConfig = {
  name: "",
  alias: [],
  category: "uncategorized",
  description: "No description",
  usage: "",
  example: "",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  isBotAdmin: false,
  cooldown: 3,
  limit: 1,
  isEnabled: true,
};

const normalizePluginNames = (name) => {
  const values = Array.isArray(name) ? name : [name];
  return values
    .map((item) =>
      String(item || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
};

const normalizePluginAliases = (alias) => {
  const values = Array.isArray(alias) ? alias : alias ? [alias] : [];
  return values
    .map((item) =>
      String(item || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
};

const findRegisteredPluginByFilePath = (filePath) => {
  if (!filePath) {
    return null;
  }
  const resolvedFilePath = _path2.default.resolve(filePath);
  for (const plugin of new Set(pluginStore.commands.values())) {
    if (
      _optionalChain([plugin, 'optionalAccess', _ => _.filePath]) &&
      _path2.default.resolve(plugin.filePath) === resolvedFilePath
    ) {
      return plugin;
    }
  }
  return null;
};

const removePluginFromStore = (plugin) => {
  if (!_optionalChain([plugin, 'optionalAccess', _2 => _2.config])) {
    return false;
  }
  const names = normalizePluginNames(plugin.config.name);
  const aliases = normalizePluginAliases(plugin.config.alias);
  const category = String(plugin.config.category || "").toLowerCase();
  for (const name of names) {
    pluginStore.commands.delete(name);
  }
  for (const alias of aliases) {
    pluginStore.aliases.delete(alias);
  }
  const categoryPlugins = pluginStore.categories.get(category);
  if (categoryPlugins) {
    const index = categoryPlugins.findIndex((item) => item === plugin);
    if (index !== -1) {
      categoryPlugins.splice(index, 1);
    }
  }
  return true;
};

/**
* Makin ' a plugin from a archivo
* @ param{string}FilePath--Paths to plusin archivo
* @ turn { Plugin Spanish } Objeto de plugin o nul si falló
 * @example
* plugin de const = comenzar la cargaPlugin ( yup. / plugins / juego / ping. js megler );
 */
var _url = require('url');

async function loadPlugin(filePath, bustCache = false) {
  try {
    const resolved = _path2.default.resolve(filePath);
    if (bustCache && require.cache[resolved]) {
      delete require.cache[resolved];
    }
    let raw = require(resolved);
    let plugin = (raw && raw.default) ? raw.default : raw;

    let config = plugin ? plugin.config : null;
    let handler = plugin ? plugin.handler : null;

    if (!config && typeof plugin === "function") {
      handler = plugin;
      config = {
        name: plugin.command ? (Array.isArray(plugin.command) ? plugin.command[0] : plugin.command) : _path2.default.basename(filePath, _path2.default.extname(filePath)),
        alias: plugin.command && Array.isArray(plugin.command) ? plugin.command.slice(1) : [],
        category: plugin.tags ? (Array.isArray(plugin.tags) ? plugin.tags[0] : plugin.tags) : "tools",
        description: plugin.help ? (Array.isArray(plugin.help) ? plugin.help.join(", ") : plugin.help) : "",
        isOwner: Boolean(plugin.rowner || plugin.owner),
        isPremium: Boolean(plugin.premium),
        isGroup: Boolean(plugin.group),
        isPrivate: Boolean(plugin.private),
        isAdmin: Boolean(plugin.admin),
        isBotAdmin: Boolean(plugin.botAdmin),
        limit: plugin.limit ? 1 : 0
      };
    } else if (!config && plugin && plugin.name && typeof plugin.handler === "function") {
      config = plugin;
      handler = plugin.handler;
    }

    if (!config || typeof handler !== "function") {
      return null;
    }

    let pInfo = {
      config: { ...defaultConfig, ...config },
      handler: handler,
      filePath: filePath,
    };

    if (!pInfo.config.name) {
      pInfo.config.name = _path2.default.basename(filePath, _path2.default.extname(filePath));
    }

    return pInfo;
  } catch (error) {
    const fileName = _path2.default.basename(filePath);
    if (process.env.DEBUG_PLUGINS === "true" || true) {
      _almikuloggerjs.logger.error("plugin", "failed " + fileName + " - " + error.message);
    }
    return null;
  }
}

/**
 * Mendaftarkan plugin ke store
* @ param{Plugin}Plugin - Plugin para lista
* @ devuelves{boolean}Verdadero si exitoso
 */
function registerPlugin(plugin) {
  if (!plugin || !plugin.config || !plugin.config.name) {
    return false;
  }

  const { name, alias, category } = plugin.config;

  const names = normalizePluginNames(name);
  const aliases = normalizePluginAliases(alias);
  const primaryName = names[0];
  if (!primaryName) {
    return false;
  }

  for (const n of names) {
    pluginStore.commands.set(n, plugin);
  }

  for (const a of aliases) {
    pluginStore.aliases.set(a, primaryName);
  }

  const categoryLower = String(
    category || defaultConfig.category,
  ).toLowerCase();
  if (!pluginStore.categories.has(categoryLower)) {
    pluginStore.categories.set(categoryLower, []);
  }
  pluginStore.categories.get(categoryLower).push(plugin);

  return true;
}

function printPluginTable(plugins) {
  if (plugins.length === 0) return;

  const safeStr = (str) => {
    if (Array.isArray(str)) return str[0] || "";
    return String(str || "");
  };

  const grouped = {};
  plugins.forEach((p) => {
    const cat = safeStr(p.category);
    if (!grouped[cat]) grouped[cat] = 0;
    grouped[cat]++;
  });

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const catCount = sorted.length;
  const TOP = 8;
  const top = sorted.slice(0, TOP);
  const rest = sorted.slice(TOP);
  const restTotal = rest.reduce((s, [, c]) => s + c, 0);

  const COL_W = 25;
  const pad = (cat, count, index) => {
    const label = String(cat).padEnd(12);
    return `${_almikuloggerjs.theme.colorizeCategory(label, index)} ${_almikuloggerjs.theme.pill(String(count), "accent")}`.padEnd(
      COL_W + 12,
    );
  };

  console.log("");
  console.log(
    `  ${_almikuloggerjs.theme.pill("plugins", "primary")} ${_almikuloggerjs.theme.rainbow(String(plugins.length))} ${_almikuloggerjs.theme.dim("total")} ${_almikuloggerjs.theme.border("│")} ${_almikuloggerjs.chalk.whiteBright(`${catCount} kategori`)}`,
  );
  console.log(`  ${_almikuloggerjs.theme.borderFx("─".repeat(58))}`);

  for (let i = 0; i < top.length; i += 2) {
    const left = pad(top[i][0], top[i][1], i);
    const right =
      i + 1 < top.length ? pad(top[i + 1][0], top[i + 1][1], i + 1) : "";
    console.log(`  ${left}  ${_almikuloggerjs.theme.border("│")}  ${right}`);
  }

  if (rest.length > 0) {
    console.log(
      `  ${_almikuloggerjs.theme.dim(`+${rest.length} lainnya`.padEnd(14))}${_almikuloggerjs.theme.pill(String(restTotal), "system")}`,
    );
  }

  console.log("");
}

/**
* Realizar todos los plugins del directorio
 * @param {string} pluginsDir - Path ke directory plugins
* @ devuelves{number}plugins Cantidad que se cargan con éxito
 * @example
 * const count = loadPlugins('./almiku-plugins');
 * console.log(`Loaded ${count} plugins`);
 */
async function loadPlugins(pluginsDir) {
  pluginStore.commands.clear();
  pluginStore.aliases.clear();
  pluginStore.categories.clear();

  let loadedCount = 0;
  const loadedPlugins = [];

  if (!_fs2.default.existsSync(pluginsDir)) {
    _almikuloggerjs.logger.warn("plugin", `directory not found: ${pluginsDir}`);
    return 0;
  }

  const categories = _fs2.default.readdirSync(pluginsDir);

  for (const category of categories) {
    const categoryPath = _path2.default.join(pluginsDir, category);

    if (!_fs2.default.statSync(categoryPath).isDirectory()) {
      if (category.endsWith(".js") && category !== "_index.js") {
        const plugin = await loadPlugin(categoryPath);
        if (plugin && registerPlugin(plugin)) {
          loadedCount++;
          loadedPlugins.push({
            name: plugin.config.name,
            category: "uncategorized",
          });
        }
      }
      continue;
    }

    const files = _fs2.default.readdirSync(categoryPath);

    for (const file of files) {
      if (!file.endsWith(".js") || file.startsWith("_")) continue;

      const filePath = _path2.default.join(categoryPath, file);
      const plugin = await loadPlugin(filePath);

      if (plugin) {
        if (
          !plugin.config.category ||
          plugin.config.category === "uncategorized"
        ) {
          plugin.config.category = category;
        }

        if (registerPlugin(plugin)) {
          loadedCount++;
          loadedPlugins.push({
            name: plugin.config.name,
            category: plugin.config.category,
          });
        }
      }
    }
  }

  printPluginTable(loadedPlugins);
  return loadedCount;
}

/**
* Obtener el nombre basado en plugins o alias
* @ param{string}nombre - Nombre del comando o alias
* @ devuelve { Plugin Spanish } Objeto de plugin o nul si no se encuentra
 * @example
* plugins de const = getPlugin ( menú xenomous );
 * if (plugin) {
 *   await plugin.handler(m, { sock, config });
 * }
 */
function getPlugin(name) {
  if (!name) return null;

  const nameLower = name.toLowerCase();

  if (pluginStore.commands.has(nameLower)) {
    return pluginStore.commands.get(nameLower);
  }

  if (pluginStore.aliases.has(nameLower)) {
    const commandName = pluginStore.aliases.get(nameLower);
    return pluginStore.commands.get(commandName);
  }

  return null;
}

/**
* Consiguió todos los plugins en la categoría absoluta
* @ param{string}categoría - Categoría Nombre
* @ devuelve *
 * @example
* const ownerPlugins = getPlugins ByCategory (Hezowner 's friend );
 */
function getPluginsByCategory(category) {
  if (!category) return [];
  return pluginStore.categories.get(category.toLowerCase()) || [];
}

/**
* Tengo todas las catequerías allí
* @ returns * * string * Array 's name is caegori *
* @ returns * * string * Array 's name is caegori *
 */
function getCategories() {
  return Array.from(pluginStore.categories.keys());
}

/**
* Consigue todos los plugins
 * @returns {Plugin[]} Array todo plugins
 */
function getAllPlugins() {
  return Array.from(pluginStore.commands.values());
}

/**
* Obtener los totales de plugins saltados
 * @returns {number} Total plugins
 */
function getPluginCount() {
  return pluginStore.commands.size;
}

/**
* Tengo todo el comandante y alias como array ( Cached )
 * @returns {string[]}
 */
function getAllCommandNames() {
  return [...pluginStore.commands.keys(), ...pluginStore.aliases.keys()];
}

/**
* Lista de comandos por caegori para el menú
* @ devuelve { Obtexto<string, string[]>Obtexto con clave cathemori y nombres de comandos de array de valor
 */
function getCommandsByCategory() {
  const result = {};

  for (const [category, plugins] of pluginStore.categories.entries()) {
    result[category] = [];
    for (const p of plugins) {
      if (!p.config.isEnabled) continue;
      const names = Array.isArray(p.config.name)
        ? p.config.name
        : [p.config.name];
      result[category].push(...names);
    }
  }

  return result;
}

/**
* Obtener el plug ingo para ayuda
* @ param{string}nombre - Nombre del comando
* @ de regreso { Objetos Escucha nul } Info plugins o nul
 */
function getPluginInfo(name) {
  const plugin = getPlugin(name);
  if (!plugin) return null;

  const { config } = plugin;

  return {
    name: config.name,
    alias: config.alias,
    category: config.category,
    description: config.description,
    usage: config.usage,
    example: config.example,
    isOwner: config.isOwner,
    isPremium: config.isPremium,
    cooldown: config.cooldown,
  };
}

/**
 * Reload single plugin
* @ param{string}nombre - Nombre del comando para la recarga
* @ devuelves{boolean}Verdadero si exitoso
 */
function reloadPlugin(name) {
  const plugin = getPlugin(name);
  if (!plugin || !plugin.filePath) return false;

  const category = plugin.config.category;

  pluginStore.commands.delete(name.toLowerCase());

  for (const alias of plugin.config.alias || []) {
    pluginStore.aliases.delete(alias.toLowerCase());
  }

  const categoryPlugins = pluginStore.categories.get(category.toLowerCase());
  if (categoryPlugins) {
    const index = categoryPlugins.findIndex((p) => p.config.name === name);
    if (index !== -1) {
      categoryPlugins.splice(index, 1);
    }
  }

  const newPlugin = loadPlugin(plugin.filePath);
  if (newPlugin && registerPlugin(newPlugin)) {
    _almikuloggerjs.logger.success("plugin", `reloaded: ${name}`);
    return true;
  }

  return false;
}

/**
 * Disable plugin
* @ param{string}nombre - Nombre del comando para deshabilitación
* @ devuelves{boolean}Verdadero si exitoso
 */
function disablePlugin(name) {
  const plugin = getPlugin(name);
  if (!plugin) return false;

  plugin.config.isEnabled = false;
  return true;
}

/**
 * Enable plugin
* @ param{string}nombre - Nombre del comando para habilitar
* @ devuelves{boolean}Verdadero si exitoso
 */
function enablePlugin(name) {
  const plugin = getPlugin(name);
  if (!plugin) return false;

  plugin.config.isEnabled = true;
  return true;
}

/**
* Comprobar si los plugins están activos
* @ param{string}nombre - Nombre del comando
* @ devuelves{boolean}Es verdad si los plugins están activos
 */
function isPluginEnabled(name) {
  const plugin = getPlugin(name);
  return plugin ? plugin.config.isEnabled : false;
}

async function hotReloadPlugin(filePath) {
  let primaryName = "";
  try {
    const plugin = await loadPlugin(filePath, true);
    if (!plugin) {
      return { success: false, error: "Failed to load plugin" };
    }

    const names = normalizePluginNames(plugin.config.name);
    primaryName = names[0] || "";

    const existingPlugin =
      findRegisteredPluginByFilePath(filePath) ||
      (primaryName ? pluginStore.commands.get(primaryName) : null);
    if (existingPlugin) {
      removePluginFromStore(existingPlugin);
    }

    if (registerPlugin(plugin)) {
      _almikuloggerjs.logger.success("plugin", `hot reloaded: ${primaryName}`);
      return { success: true, name: primaryName };
    }

    return { success: false, error: "Failed to register plugin" };
  } catch (error) {
    _almikuloggerjs.logger.error("plugin", `hot reload error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function unloadPlugin(name) {
  try {
    const nameLower = name.toLowerCase();
    let plugin = pluginStore.commands.get(nameLower);

    if (!plugin) {
      const commandName = pluginStore.aliases.get(nameLower);
      if (commandName) {
        plugin = pluginStore.commands.get(commandName);
      }
    }

    if (!plugin && /[\\/]/.test(name)) {
      plugin = findRegisteredPluginByFilePath(name);
    }

    if (!plugin) {
      return { success: false, error: "Plugin not found" };
    }

    const names = normalizePluginNames(plugin.config.name);
    const primaryName = names[0] || nameLower;

    removePluginFromStore(plugin);

    if (plugin.filePath) {
      try {
        // require.cache removed
      } catch (e) {}
    }

    _almikuloggerjs.logger.warn("plugin", `unloaded: ${primaryName}`);
    return { success: true, name: primaryName };
  } catch (error) {
    _almikuloggerjs.logger.error("plugin", `unload error: ${error.message}`);
    return { success: false, error: error.message };
  }
}





















exports.loadPlugin = loadPlugin; exports.loadPlugins = loadPlugins; exports.registerPlugin = registerPlugin; exports.getPlugin = getPlugin; exports.getPluginsByCategory = getPluginsByCategory; exports.getCategories = getCategories; exports.getAllPlugins = getAllPlugins; exports.getPluginCount = getPluginCount; exports.getCommandsByCategory = getCommandsByCategory; exports.getPluginInfo = getPluginInfo; exports.reloadPlugin = reloadPlugin; exports.disablePlugin = disablePlugin; exports.enablePlugin = enablePlugin; exports.isPluginEnabled = isPluginEnabled; exports.hotReloadPlugin = hotReloadPlugin; exports.unloadPlugin = unloadPlugin; exports.pluginStore = pluginStore; exports.defaultConfig = defaultConfig; exports.getAllCommandNames = getAllCommandNames;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
