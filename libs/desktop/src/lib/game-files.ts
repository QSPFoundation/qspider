/** Desktop reads game files through the qsp:// protocol, which is there from the start: nothing to wait for. */
export async function whenGameFilesReady(_baseUrl: string): Promise<void> {
  // no-op on desktop
}
