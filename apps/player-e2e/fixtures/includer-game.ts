// The includer game (includer/, packed as ARCHIVES.includerZip): main.qsps pulls in included.qsps through inclib,
// and its 'Include missing' action names a file the archive lacks. Its action labels and the texts it writes.
// Keep this module free of test-framework imports: both runners load it.

export const INCLUDER_GAME = {
  /** Named by the 'Include missing' action's inclib; not in the archive. */
  missingFile: 'missing.qsps',
  action: { includeMissing: 'Include missing', goOn: 'Go on' },
  text: {
    /** Written by the 'Include missing' action after its inclib: only if the statement went on. */
    afterMissing: 'AFTER MISSING',
    wentOn: 'WENT ON',
  },
} as const;
