/**
 * @file maybe.js
 * @description Implémentation d'un type algébrique Maybe
 */

const { isEmpty, isNil, either } = require('ramda');

const VALUE = Symbol('value');

class Maybe {
    constructor(value) {
        this[VALUE] = value;
        this.isNothing = either(isNil, isEmpty)(value);
        this.isJust = !this.isNothing;
    }

    // Functor fantasy-land/map https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landmap-method
    map(fn) {
        return this.isNothing ? this : new Maybe(fn(this[VALUE]));
    }

    // Apply fantasy-land/ap https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landap-method
    ap(maybe) {
        if (!(maybe instanceof Maybe)) throw new TypeError('ap function argument must be of type Maybe');
        if (maybe.isNothing) throw new TypeError('ap argument must be a Just Maybe');
        return this.isNothing ? this : new Maybe(maybe[VALUE](this[VALUE]));
    }

    // Chain fantasy-land/chain https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landchain-method
    // fn doit être une fonction qui retourne une instance de Maybe
    chain(fn) {
        if (this.isJust) {
            const result = fn(this[VALUE]);
            if (!(result instanceof Maybe)) throw new TypeError('chain argument must be a function that returns a Maybe');
            return result;
        } else {
            return this;
        }
    }

    // Applicative  fantasy-land/of https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landof-method
    static of(value) {
        return new Maybe(value);
    }

    // Extend fantasy-land/extend https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landextend-method
    extend(f) {
        return Maybe.of(f(this));
    }

    // Comonad fantasy-land/extract https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landextract-method
    extract() {
        return this[VALUE];
    }

    // == Spécificité du type ==

    // Applicative pour une valeur non nulle
    static just(value) {
        return Maybe.of(value);
    }

    // Applicative pour une valeur nulle
    static nothing() {
        return Maybe.of();
    }

    // Extraction avec valeur par défaut
    extractOrElse(def) {
        return this.isNothing ? def : this[VALUE];
    }

    // Opération tap
    tap(fn) {
        try {
            fn(this[VALUE]);
        } catch (error) {
            console.warn('Maybe.tap catched an unexpected exception:', error);
        }

        return this;
    }

    // Matching
    match({ just, nothing}) {
        if (this.isJust) {
            return just(this[VALUE]);
        } else {
            return nothing();
        }
    }
}

module.exports = { Maybe };
