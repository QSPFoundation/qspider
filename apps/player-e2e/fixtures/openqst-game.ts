// The OPENQST game (openqst/, packed as ARCHIVES.openqstZip): first.qsps opens second.qsps in game with OPENQST,
// and second.qsps sets FCOLOR. Its action labels, the texts it writes and the CSS value FCOLOR must produce.
// Keep this module free of test-framework imports: both runners load it.

export const OPENQST_GAME = {
  action: { openSecond: 'Open second', setColour: 'Set colour' },
  text: { first: 'OPENQST FIRST', second: 'OPENQST SECOND', colourSet: 'COLOUR SET' },
  /** `--code-color` on the root once FCOLOR = -13426159 is set: the same value as LOOK_CLASSIC_TABLE['--code-color'] (look-game.ts). */
  expectedCodeColor: 'rgba(17,34,51,1)',
} as const;
