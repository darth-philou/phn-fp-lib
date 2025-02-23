/*
 * try.js
 * Définition d'un type de données algébrique pour encapsuler une structure try catch finally
 * Philippe Herlin
 * 23 février 2025
 */

const VALUE = Symbol("value");

class Try {
    constructor(value) {
        this.VALUE = value;
    }

    // Functor fantasy-land/map https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landmap-method
    map(f) {
        return Try.of(f(this.VALUE));
    }

    // Extend fantasy-land/extend https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landextend-method
    extend(f) {
        return Try.of(f(this));
    }

    // Comonad fantasy-land/extract https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landextract-method
    extract() {
        return this.VALUE;
    }

    // Apply fantasy-land/ap https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landap-method
    ap(fa) {
        if (!(fa instanceof Try)) {
            throw new TypeError("Try.ap: parameter must be an instance of Try");
        }
        if (typeof fa.VALUE !== "function") {
            throw new TypeError("Try.ap: parameter must be an instance of Try with a function as VALUE");
        }
        return Try.of(fa.VALUE(this.VALUE));
    }

    // Chain fantasy-land/chain https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landchain-method
    chain(f) {
        const result = f(this.VALUE);
        if (!(result instanceof Try)) {
            throw new TypeError("Try.chain: parameter must be a function returning an instance of Try");
        }
        return result.VALUE instanceof Try ? result.VALUE : result;
    }

    // Applicative  fantasy-land/of https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landof-method
    static of(value) {
        return new Try(value);
    }

    // --- Fonctionnalité du type Try
    // Exécution d'une opération tardivement de façon sécurisée
    runSafely() {
        try {
            if (typeof this.VALUE !== "function") {
                throw new TypeError("Try.runSafely: VALUE must be a function");
            }
            return this.VALUE();
        } catch (e) {
            return e;
        }
    }

    // Catch stocke une fonction de traitement d'erreur
    catch(f) {
        return Try.of(() => {
            try {
                return this.VALUE();
            } catch (e) {
                return f(e);
            }
        });
    }

    // Finally stocke une fonction de traitement de finalisation
    finally(f) {
        return Try.of(() => {
            try {
                const result = this.VALUE();
                return result;
            } catch (e) {
                return e;
            } finally {
                f();
            }
        });
    }
}

module.exports = { Try };
