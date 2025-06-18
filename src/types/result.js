/**
 * @file result.js
 * @description Implémentation d'un type algébrique Result
 */

const { isEmpty, isNil, either } = require('ramda');

const VALUE = Symbol('value');

class Result {
    constructor(value) {
        this[VALUE] = value;
        this.isOk = true;
        this.isError = false;
    }

    // Functor fantasy-land/map https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landmap-method
    map(fn) {
        return this.isError ? this : new Result(fn(this[VALUE]));
    }

    // Apply fantasy-land/ap https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landap-method
    ap(result) {
        if (!(result instanceof Result)) throw new TypeError('ap function argument must be of type Result');
        if (result.isError) throw new TypeError('ap argument must be a Ok Result');
        return this.isError ? this : new Result(result[VALUE](this[VALUE]));
    }

    // Chain fantasy-land/chain https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landchain-method
    // fn doit être une fonction qui retourne une instance de Result
    chain(fn) {
        if (this.isOk) {
            const result = fn(this[VALUE]);
            if (!(result instanceof Result)) throw new TypeError('chain argument must be a function that returns a Result');
            return result;
        } else {
            return this;
        }
    }

    // Applicative  fantasy-land/of https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landof-method
    static of(value) {
        return new Result(value);
    }

    // Extend fantasy-land/extend https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landextend-method
    extend(f) {
        return Result.of(f(this));
    }

    // Comonad fantasy-land/extract https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landextract-method
    extract() {
        return this[VALUE];
    }

    // == Spécificité du type ==

    // Applicative pour une valeur non nulle
    static ok(value) {
        return Result.of(value);
    }

    // Applicative pour une valeur nulle
    static error(value) {
        const error = new Result(value);
        error.isOk = false;
        error.isError = true;

        return error;
    }

    // Extraction avec valeur par défaut
    extractOrElse(def) {
        return this.isError ? def : this[VALUE];
    }

    // Opération tap
    tap(fn) {
        try {
            fn(this[VALUE]);
        } catch (error) {
            console.warn('Result.tap catched an unexpected exception:', error);
        }

        return this;
    }

    // Construction à partir d'une valeur peut-être nulle
    static fromNullable(value, error = 'Null or undefined value') {
        return isNil(value) ? Result.error(error) : Result.ok(value);
    }

    // Construction à partir d'une valeur peut-être vide
    static fromPossiblyEmpty(value, error = 'Empty value') {
        return isEmpty(value) ? Result.error(error) : Result.ok(value);
    }

    // Construction à partir d'une valeur peut-être nulle ou vide
    static fromNullableOrEmpty(value, error = 'Empty, null or undefined value') {
        return either(isNil, isEmpty)(value) ? Result.error(error) : Result.ok(value);
    }

    // Construction à partir de l'exécution d'une fonction (synchrone)
    static tryCatch(fn) {
        try {
            return Result.ok(fn());
        } catch (error) {
            return Result.error(error);
        }
    }
}

module.exports = { Result };
