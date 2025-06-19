/**
 * Export du répertoire utils
 */

const { Result } = require('../types/result');

const tap = fn => adt => adt.tap(fn);
const map = fn => adt => adt.map(fn);
const chain = fn => adt => adt.chain(fn);

maybeToResult = maybe => maybe.match({ just: x => Result.ok(x), nothing: () => Result.error('Unexpected null or empty value')})

module.exports = { tap, map, chain, maybeToResult };
