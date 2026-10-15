/**
 * Copyright (c) 2017, Daniel Imms (MIT License).
 * Copyright (c) 2018, Microsoft Corporation (MIT License).
 */

import { UnixTerminal } from './unixTerminal';
import * as assert from 'assert';
import * as path from 'path';

const pty = require(path.join('..', 'build', 'Release', 'pty.node'));
const helperPath = path.join(__dirname, '..', 'build', 'Release', 'spawn-helper');

function throwingAt(values: any[], index: number): any[] {
  const args = values.slice();
  Object.defineProperty(args, index, {
    get: () => { throw new TypeError('element getter'); },
    enumerable: true,
    configurable: true
  });
  return args;
}

function fork(args: any, env: any): any {
  return pty.fork('/bin/true', args, env, process.cwd(), 80, 30, -1, -1, true, helperPath, () => {});
}

if (process.platform !== 'win32') {
  describe('argument types', () => {
    it('rejects a non-string argument', () => {
      assert.throws(() => new UnixTerminal('/bin/echo', [Symbol('arg') as any], {}));
    });

    it('rejects an argument whose getter throws', () => {
      assert.throws(() => new UnixTerminal('/bin/true', throwingAt(['ok'], 0), {}));
    });

    it('rejects a late argument whose getter throws', () => {
      assert.throws(() => new UnixTerminal('/bin/true', throwingAt(['a', 'b', 'c', 'd'], 2), {}));
    });

    it('rejects a non-string environment entry', () => {
      assert.throws(() => fork(['arg'], [Symbol('pair')]));
    });

    it('rejects an environment entry whose getter throws', () => {
      assert.throws(() => fork(['arg'], throwingAt(['A=1', 'B=2', 'C=3', 'D=4'], 2)));
    });
  });
}
