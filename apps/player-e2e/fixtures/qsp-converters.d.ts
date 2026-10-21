// @qsp/converters ships types its package.json "exports" hides from "bundler" module resolution
// (TS7016), which these configs use. Declares only what the fixture builder calls.
declare module '@qsp/converters' {
  export interface QspLocation {
    name: string;
  }
  export function readQsps(text: string): QspLocation[];
  export function readQsp(buffer: ArrayBuffer): QspLocation[];
  export function writeQsp(locations: QspLocation[]): ArrayBuffer;
}
