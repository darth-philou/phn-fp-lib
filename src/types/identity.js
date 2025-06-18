/**
 * @file identity.js
 * @description Implémentation d'un type algébrique Indentity (simple container)
 */

const VALUE = Symbol('value');

class Identity {
    constructor(value) {
        this[VALUE] = value;
    }

    // Functor fantasy-land/map https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landmap-method
    map(fn) {
        return new Identity(fn(this[VALUE]));
    }

    // Apply fantasy-land/ap https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landap-method
    ap(id) {
        if (!(id instanceof Identity)) throw new TypeError('ap function argument must be of type Identity');
        return new Identity(id[VALUE](this[VALUE]));
    }

    // Chain fantasy-land/chain https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landchain-method
    // fn doit être une fonction qui retourne une instance de Identity
    chain(fn) {
        const result = fn(this[VALUE]);
        if (!(result instanceof Identity)) throw new TypeError('chain argument must be a function that returns a Identity');
        return result;
    }

    // Applicative  fantasy-land/of https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landof-method
    static of(value) {
        return new Identity(value);
    }

    // Extend fantasy-land/extend https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landextend-method
    extend(f) {
        return Identity.of(f(this));
    }

    // Comonad fantasy-land/extract https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landextract-method
    extract() {
        return this[VALUE];
    }

    // == Spécificité du type ==

    // Opération tap
    tap(fn) {
        try {
            fn(this[VALUE]);
        } catch (error) {
            console.warn('Identity.tap catched an unexpected exception:', error);
        }

        return this;
    }
}

module.exports = { Identity };
