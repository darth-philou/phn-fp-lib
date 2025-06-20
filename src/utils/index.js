/**
 * Export du répertoire utils
 */

const { Result } = require('../types/result');
const { Task } = require('../types/task');

const tap = fn => adt => adt.tap(fn);
const map = fn => adt => adt.map(fn);
const chain = fn => adt => adt.chain(fn);

maybeToResult = maybe =>
    maybe.match({ just: x => Result.ok(x), nothing: () => Result.error(TypeError('Unexpected null or empty value')) });

maybeToTask = maybe =>
    maybe.match({ just: x => Task.of(x), nothing: () => Task.rejected(TypeError('Unexpected null or empty value')) });

module.exports = { tap, map, chain, maybeToResult, maybeToTask };
