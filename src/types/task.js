/**
 * @file effect.js
 * @description Définition d'un type de données algébrique pour encapsuler un effet asynchrone
 * Philippe Herlin
 * 17 juin 2025
 */

const { compose, identity } = require('ramda');

const fork = Symbol('fork');

class Task {
    // Constuit à partir d'une fonction dont la signature est (reject, resolve, finally) -> Promise
    constructor(fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('Task constructor requires a function');
        }

        this[fork] = fn;
    }

    // Functor fantasy-land/map https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landmap-method
    map(fn) {
        return new Task(({ reject, resolve }) => this[fork]({ reject, resolve: compose(resolve, fn) }));
    }

    // Apply fantasy-land/ap https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landap-method
    ap(effect) {
        if (!(effect instanceof Task)) {
            throw new TypeError('ap argument must be an Task object encapsulating a function');
        }

        return new Task(({ reject, resolve }) =>
            effect[fork]({ reject, resolve: fn => this[fork]({ reject, resolve: compose(resolve, fn) }) })
        );
    }

    // Chain fantasy-land/chain https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landchain-method
    // fn doit être une fonction qui retourne une instance de Task
    chain(fn) {
        return new Task(({ reject, resolve }) => this[fork]({ reject, resolve: x => fn(x)[fork]({ reject, resolve }) }));
    }

    // Applicative  fantasy-land/of https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landof-method
    static of(value) {
        return new Task(({ resolve = identity }) => resolve(value));
    }

    // == Spécificité du type ==

    // Applicative pour un rejet
    static rejected(value) {
        return new Task(({ reject = identity }) => reject(value));
    }

    // A exécuter quoi qu'il arrive
    finally(cleanup) {
        return new Task(({ reject, resolve }) =>
            this[fork]({
                reject: err => Promise.resolve(cleanup()).then(() => reject(err)),
                resolve: val => Promise.resolve(cleanup()).then(() => resolve(val))
            })
        );
    }

    // Exécution différée
    run() {
        return new Promise((resolve, reject) => {
            this[fork]({
                resolve: value => resolve(value),
                reject: error => reject(error)
            });
        });
    }
}

module.exports = { Task };
