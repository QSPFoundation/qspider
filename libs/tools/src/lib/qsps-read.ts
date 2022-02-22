import { QspLocation } from './contracts';

const QSP_STARTLOC = '#';
const QSP_ENDLOC = '---';
const QSP_STRSDELIM = '\r\n';
const QSP_QUOTS = ["'", '"'];
const QSP_LQUOT = '{';
const QSP_RQUOT = '}';

export function readQsps(content: string): QspLocation[] {
  const locations: QspLocation[] = [];

  let isInLoc = false;
  let curLoc: QspLocation | null = null;
  let locCode: string[] = [];
  const lines = content.split(QSP_STRSDELIM);
  let quot = '';
  let quotsCount = 0;
  for (const line of lines) {
    if (isInLoc) {
      if (!quot && !quotsCount) {
        if (line.startsWith(QSP_ENDLOC)) {
          isInLoc = false;
          if (curLoc) {
            curLoc.code = locCode.join(QSP_STRSDELIM);
            locCode = [];
            locations.push(curLoc);
            curLoc = null;
          }
          continue;
        }
      }
      locCode.push(line);
      const chars = line.split('');
      for (let i = 0; i < chars.length; ++i) {
        const char = chars[i];
        if (quot) {
          if (char == quot) {
            if (chars[i + 1] == quot) {
              i++;
            } else {
              quot = '';
            }
          }
        } else {
          if (char == QSP_LQUOT) ++quotsCount;
          else if (char == QSP_RQUOT) {
            if (quotsCount) --quotsCount;
          } else if (QSP_QUOTS.includes(char)) quot = char;
        }
      }
    } else {
      if (line.startsWith(QSP_STARTLOC)) {
        isInLoc = true;
        curLoc = {
          name: line.slice(QSP_STARTLOC.length).trim(),
          desc: '',
          code: '',
          actions: [],
        };
      }
    }
  }

  if (isInLoc && curLoc) {
    curLoc.code = locCode.join(QSP_STRSDELIM);
    locations.push(curLoc);
  }

  return locations;
}
