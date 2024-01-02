export interface Deferred<T> {
  resolve(value: T): void;
  reject(reason: Error): void;
  promise: Promise<T>;
}

export function defer<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject!: (reason?: any) => void;
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

export const hashString = (s: string): number =>
  s.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};
