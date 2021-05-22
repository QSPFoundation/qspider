export interface Defered<T> {
  resolve(value: T): void;
  reject(reason: Error): void;
  promise: Promise<T>;
}

export function defer<T>(): Defered<T> {
  let resolve;
  let reject;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    resolve,
    reject,
    promise,
  };
}

export function resolvePath(inPathA: string, inPathB: string): string {
  //  ‘a’     => ['a']
  //  'a/b'   => ['a', 'b']
  //  '/a/b'  => ['', 'a', 'b']
  //  '/a/b/' => ['', 'a', 'b', '']
  const pathB = inPathB.split('/');
  if (pathB[0] === '') {
    return pathB.join('/');
  }
  const pathA = inPathA.split('/');
  const aLastIndex = pathA.length - 1;
  if (pathA[aLastIndex] !== '') {
    // remove filename
    pathA[aLastIndex] = '';
  }

  let part;
  let i = 0;
  while (typeof (part = pathB[i]) === 'string') {
    switch (part) {
      case '..':
        pathA.pop();
        pathA.pop();
        pathA.push('');
        break;
      case '.':
        break;
      default:
        pathA.pop();
        pathA.push(part);
        pathA.push('');
        break;
    }
    i++;
  }
  if (pathB[pathB.length - 1] !== '') {
    pathA.pop();
  }
  return pathA.join('/');
}