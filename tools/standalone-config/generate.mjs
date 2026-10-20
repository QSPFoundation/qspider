// Generates a Tauri 2 config overlay (RFC 7396 merge patch over src-tauri/tauri.conf.json)
// from a game author's qspider.desktop.json.

const REQUIRED = ['productName', 'version', 'identifier', 'publisher'];

export function validate(cfg) {
  const errors = [];
  if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) return ['config must be an object'];
  for (const key of REQUIRED) {
    if (typeof cfg[key] !== 'string' || cfg[key].trim() === '') errors.push(`"${key}" is required`);
  }
  if (typeof cfg.window?.title !== 'string' || cfg.window.title.trim() === '') {
    errors.push('"window.title" is required');
  }
  if (cfg.schemaVersion !== undefined && cfg.schemaVersion !== 1) {
    errors.push(`unsupported "schemaVersion": ${cfg.schemaVersion}`);
  }
  return errors;
}

export function generateTauriConfig(cfg) {
  const warnings = [];
  const win = cfg.window ?? {};
  const up = cfg.updater ?? {};

  let updaterEnabled = Boolean(up.enabled);
  if (updaterEnabled && (!up.endpoint || !up.pubkey)) {
    warnings.push('updater.enabled is true but endpoint or pubkey is empty; the updater is disabled');
    updaterEnabled = false;
  }

  const config = {
    productName: cfg.productName,
    version: cfg.version,
    identifier: cfg.identifier,
    build: {
      frontendDist: '../dist/apps/player-standalone',
      beforeBuildCommand: 'pnpm run build:standalone-desktop',
    },
    bundle: {
      targets: 'all',
      publisher: cfg.publisher,
      copyright: cfg.copyright ?? '',
      category: cfg.category ?? 'Game',
      shortDescription: cfg.shortDescription ?? '',
      longDescription: cfg.longDescription ?? '',
      // never v1Compatible: standalone games have no v1 updater lineage
      createUpdaterArtifacts: updaterEnabled,
    },
    app: {
      windows: [
        {
          title: win.title,
          width: win.width ?? 1024,
          height: win.height ?? 768,
          center: win.center ?? true,
          resizable: win.resizable ?? true,
          fullscreen: win.fullscreen ?? false,
          visible: false,
          useHttpsScheme: true,
        },
      ],
    },
    plugins: {
      // null deletes the key from the base config (merge patch); cli is left untouched
      updater: updaterEnabled ? { endpoints: [up.endpoint], pubkey: up.pubkey } : null,
    },
  };
  return { config, warnings };
}

const V1_KNOWN = new Set([
  'package.productName',
  'package.version',
  'tauri.bundle.identifier',
  'tauri.bundle.publisher',
  'tauri.bundle.copyright',
  'tauri.bundle.category',
  'tauri.bundle.shortDescription',
  'tauri.bundle.longDescription',
  'tauri.windows[0].title',
  'tauri.windows[0].width',
  'tauri.windows[0].height',
  'tauri.windows[0].resizable',
  'tauri.windows[0].fullscreen',
  'tauri.windows[0].center',
  'tauri.updater.active',
  'tauri.updater.endpoints[0]',
  'tauri.updater.pubkey',
]);

function leafPaths(value, path, out) {
  if (Array.isArray(value)) {
    if (value.length === 0) out.push(path);
    value.forEach((v, i) => leafPaths(v, `${path}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0 && path) out.push(path);
    for (const k of keys) leafPaths(value[k], path ? `${path}.${k}` : k, out);
  } else {
    out.push(path);
  }
  return out;
}

export function convertFromV1(v1) {
  const pkg = v1.package ?? {};
  const bundle = v1.tauri?.bundle ?? {};
  const upd = v1.tauri?.updater ?? {};
  const win = v1.tauri?.windows?.[0] ?? {};
  const endpoint = upd.endpoints?.[0] ?? '';
  const pubkey = upd.pubkey ?? '';

  const config = {
    schemaVersion: 1,
    productName: pkg.productName ?? '',
    version: pkg.version ?? '',
    identifier: bundle.identifier ?? '',
    publisher: bundle.publisher ?? '',
    copyright: bundle.copyright ?? '',
    category: bundle.category ?? 'Game',
    shortDescription: bundle.shortDescription ?? '',
    longDescription: bundle.longDescription ?? '',
    window: {
      title: win.title ?? '',
      width: win.width ?? 1024,
      height: win.height ?? 768,
      resizable: win.resizable ?? true,
      fullscreen: win.fullscreen ?? false,
      center: win.center ?? true,
    },
    updater: {
      enabled: Boolean(upd.active) && endpoint !== '' && pubkey !== '',
      endpoint,
      pubkey,
    },
  };

  // build.* is expected to differ (paths are generated). Everything else unmapped is reported,
  // including v1 keys with no v2 meaning (bundle.active, updater.dialog, windows[0].visible),
  // since an author may have set them deliberately.
  const dropped = leafPaths(v1, '', []).filter((p) => !V1_KNOWN.has(p) && !p.startsWith('build.'));
  return { config, dropped };
}
