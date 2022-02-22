import { QspLocation } from './contracts';
import { QspByteStream, QSP_GAMEID } from './qsp-byte-stream';

function readNewFormat(stream: QspByteStream): QspLocation[] {
  stream.readLine(false); // tool version
  stream.readLine(); // password
  const locCount = parseInt(stream.readLine());

  const locations = [];

  for (let i = 0; i < locCount; i++) {
    const name = stream.readLine();
    const desc = stream.readLine();
    const code = stream.readLine();

    const actsCount = parseInt(stream.readLine());
    const actions = [];
    for (let j = 0; j < actsCount; ++j) {
      const image = stream.readLine();
      const action_name = stream.readLine();
      const action_code = stream.readLine();
      actions.push({ image, action_name, action_code });
    }
    locations.push({ name, desc, code, actions });
  }
  return locations;
}

export function readQsp(buffer: ArrayBuffer): QspLocation[] {
  const stream = new QspByteStream(buffer);
  const header = stream.readLine(false);
  if (header === QSP_GAMEID) {
    return readNewFormat(stream);
  }
  throw new Error('old format is not supported');
}
