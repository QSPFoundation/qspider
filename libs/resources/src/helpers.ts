import { unzip, Unzipped } from 'fflate';

export const isExternalSource = (path: string): boolean => path.startsWith('http://') || path.startsWith('https://');

export const isZip = (buffer: ArrayBuffer): boolean => {
  const data = new Uint8Array(buffer);
  return (
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    (data[2] === 0x03 || data[2] === 0x05 || data[2] === 0x07) &&
    (data[3] === 0x04 || data[3] === 0x06 || data[3] === 0x08)
  );
};

export const readZip = (buffer: ArrayBuffer): Promise<Unzipped> => {
  return new Promise((resolve, reject) => {
    unzip(new Uint8Array(buffer), (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

export function cleanPath(path: string): string {
  return path.replace(/\\/g, '/');
}
