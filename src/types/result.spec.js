/*
 *  Test du module Result
 */

const { Result } = require('./result');

describe('Result', () => {
    // Fonctionnalités de base du type Result (Functor, Extend, Comonad, Apply, Chain, Applicative, Monade)
    test('doit être un functor et fournir une opération map', () => {
        const m1 = new Result(1);

        expect(typeof m1.map).toBe('function');
        expect(m1.isOk).toBeTruthy();
        expect(m1.isError).toBeFalsy();

        const m2 = m1.map(x => x + 1);
        expect(m2).toBeInstanceOf(Result);
        expect(m2.extract()).toBe(2);
    });

    test("doit être un function et respecter la loi de l'identité", () => {
        const m1 = new Result(1);

        const m2 = m1.map(x => x);
        expect(m2).toBeInstanceOf(Result);
        expect(m2.extract()).toBe(1);
    });

    test('doit être un functor et respecter la loi de la composition', () => {
        const m1 = new Result(1);
        const f = x => x + 1;
        const g = x => x * 2;

        const m2 = m1.map(f).map(g);
        const m3 = m1.map(x => g(f(x)));

        expect(m2.extract()).toBe(4);
        expect(m3.extract()).toBe(4);
    });

    test('map doit retourner le même objet si Result est de type Error', () => {
        const m1 = Result.error('erreur');
        const result = m1.map(x => x + 1);
        expect(result).toBe(m1);
    });

    test("doit être de type Extend et fournir une opération 'extend'", () => {
        const m1 = new Result(1);

        expect(typeof m1.extend).toBe('function');

        const m2 = m1.extend(t => t.extract() + 1);

        expect(m2).toBeInstanceOf(Result);
        expect(m2.extract()).toBe(2);
    });

    test("doit être de type Extend et respecter la loi de l'équivalence", () => {
        const m1 = new Result(1);
        const f = x => x.extract() + 1;
        const g = x => x.extract() * 2;

        const m2 = m1.extend(g).extend(f);
        const m3 = m1.extend(t => f(t.extend(g)));

        expect(m2.extract()).toBe(3);
        expect(m3.extract()).toBe(3);
    });

    test("doit être un Comonad et fournir une opération 'extract'", () => {
        const m1 = new Result(1);

        expect(typeof m1.extract).toBe('function');
        expect(m1.extract()).toBe(1);
    });

    test("doit être un Comonad et respecter la loi de l'identité à gauche", () => {
        const m1 = new Result(1);

        const m2 = m1.extend(t => t.extract());
        expect(m2.extract()).toBe(1);
    });

    test("doit être un Comonad et respecter la loi de l'identité à droite", () => {
        const m1 = new Result(1);
        const f = x => x.extract() + 1;

        const m2 = m1.extend(f).extract();
        const m3 = f(m1);
        expect(m2).toBe(m3);
    });

    test("doit être de type Apply et fournir une opération 'ap'", () => {
        const m1 = new Result(1);

        expect(typeof m1.ap).toBe('function');

        const f = new Result(x => x + 1);
        const m2 = m1.ap(f);

        expect(m2).toBeInstanceOf(Result);
        expect(m2.extract()).toBe(2);
    });

    test('doit être de type Apply et respecter la loi de composition', () => {
        const m1 = new Result(1);
        const f = x => x + 1;
        const g = x => x * 2;
        const af = new Result(f);
        const ag = new Result(g);

        const m2 = m1.ap(af.ap(ag.map(f => g => x => f(g(x)))));
        const m3 = m1.ap(af).ap(ag);

        expect(m2.extract()).toBe(4);
        expect(m3.extract()).toBe(4);
    });

    test("ap doit renvoyer une exception si l'argument n'est pas un Result", () => {
        const m1 = new Result(1);

        expect(() => m1.ap(x => x + 1)).toThrow();
    });

    test("ap doit renvoyer une exception si l'argument n'est pas un Result d'une fonction", () => {
        const m1 = new Result(1);

        expect(() => m1.ap(new Result(0))).toThrow();
    });

    test("ap doit renvoyer une exception si l'argument est Error", () => {
        const m1 = new Result(1);

        expect(() => m1.ap(Result.error())).toThrow();
    });

    test('ap doit retourner le même objet si Result est de type Error', () => {
        const m1 = Result.error('erreur');
        const result = m1.ap(new Result(x => x + 1));
        expect(result).toBe(m1);
    });

    test("doit être de type Chain et fournir une opération 'chain'", () => {
        const m1 = new Result(1);

        expect(typeof m1.chain).toBe('function');

        const f = x => new Result(x + 1);
        const m2 = m1.chain(f);

        expect(m2).toBeInstanceOf(Result);
        expect(m2.extract()).toBe(2);
    });

    test("doit être du type Chain et respecter la loi de l'associativité", () => {
        const m1 = new Result(1);
        const f = x => new Result(x + 1);
        const g = x => new Result(x * 2);

        const m2 = m1.chain(f).chain(g);
        const m3 = m1.chain(x => f(x).chain(g));

        expect(m2.extract()).toBe(4);
        expect(m3.extract()).toBe(4);
    });

    test('chain doit retourner le même objet si Result est de type Noting', () => {
        const m1 = Result.error('erreur');
        const result = m1.chain(x => Result(x + 1));
        expect(result).toBe(m1);
    });

    test('chain doit retourner une exception si la fonction ne renvoie pas un Result', () => {
        const m1 = new Result(1);
        expect(() => m1.chain(x => x + 1)).toThrow();
    });

    test("doit être de type Applicative et fournir une opération 'of'", () => {
        expect(typeof Result.of).toBe('function');

        const m1 = Result.of(1);

        expect(m1).toBeInstanceOf(Result);
        expect(m1.extract()).toBe(1);
    });

    test("doit être de type Applicative et respecter la loi de l'identité", () => {
        const m1 = Result.of(1);

        const m2 = m1.chain(Result.of);

        expect(m2.extract()).toBe(1);
    });

    test("doit être de type Applicative et respecter la loi de l'homomorphisme", () => {
        // A['fantasy-land/of'](x)['fantasy-land/ap'](A['fantasy-land/of'](f)) est équivalent à A['fantasy-land/of'](f(x))
        const f = x => x + 1;
        const m1 = Result.of(1);
        const m2 = Result.of(f);

        const m3 = m1.ap(m2);
        const m4 = Result.of(f(m1.extract()));

        expect(m3.extract()).toBe(m4.extract());
    });

    test("doit être de type Applicative et respecter la loi de l'interchange", () => {
        // A['fantasy-land/of'](x)['fantasy-land/ap'](v) est équivalent à v['fantasy-land/ap'](A['fantasy-land/of'](f => f(x)))
        const f = x => x + 1;
        const m1 = Result.of(1);
        const m2 = Result.of(f);

        const m3 = m1.ap(m2);
        const m4 = m2.ap(Result.of(f => f(m1.extract())));

        expect(m3.extract()).toBe(m4.extract());
    });

    test('doit fournir une factory pour un résultat ok', () => {
        const m1 = Result.ok(1);
        expect(m1.extract()).toBe(1);
        expect(m1.isOk).toBeTruthy();
    });

    test('doit fournir une factory pour un type Erreur', () => {
        const m1 = Result.error('erreur');
        expect(m1.isError).toBeTruthy();
    });

    test('doit fournir une factory pour une valeur potentiellement nulle', () => {
        expect(Result.fromNullable(null).isError).toBeTruthy();
        expect(Result.fromNullable(undefined).isError).toBeTruthy();
        expect(Result.fromNullable({}).isError).toBeFalsy();
        expect(Result.fromNullable([]).isError).toBeFalsy();
        expect(Result.fromNullable("").isError).toBeFalsy();
        expect(Result.fromNullable(0).isError).toBeFalsy();
        expect(Result.fromNullable(false).isError).toBeFalsy();
    });

    test('doit fournir une factory pour une valeur potentiellement vide', () => {
        expect(Result.fromPossiblyEmpty(null).isError).toBeFalsy();
        expect(Result.fromPossiblyEmpty(undefined).isError).toBeFalsy();
        expect(Result.fromPossiblyEmpty({}).isError).toBeTruthy();
        expect(Result.fromPossiblyEmpty([]).isError).toBeTruthy();
        expect(Result.fromPossiblyEmpty("").isError).toBeTruthy();
        expect(Result.fromPossiblyEmpty(0).isError).toBeFalsy();
        expect(Result.fromPossiblyEmpty(false).isError).toBeFalsy();
    });

    test('doit fournir une factory pour une valeur potentiellement vide ou nulle', () => {
        expect(Result.fromNullableOrEmpty(null).isError).toBeTruthy();
        expect(Result.fromNullableOrEmpty(undefined).isError).toBeTruthy();
        expect(Result.fromNullableOrEmpty({}).isError).toBeTruthy();
        expect(Result.fromNullableOrEmpty([]).isError).toBeTruthy();
        expect(Result.fromNullableOrEmpty("").isError).toBeTruthy();
        expect(Result.fromNullableOrEmpty(0).isError).toBeFalsy();
        expect(Result.fromNullableOrEmpty(false).isError).toBeFalsy();
    });

    test('doit fournir une factory pour une fonction non sure', () => {
        const fn1 = jest.fn().mockImplementation(() => 1);
        const r1 = Result.tryCatch(fn1);
        expect(r1.isOk).toBeTruthy();
        expect(r1.extract()).toBe(1);

        const fn2 = jest.fn().mockImplementation(() => { throw 'erreur'});
        const r2 = Result.tryCatch(fn2);
        expect(r2.isError).toBeTruthy();
        expect(r2.extract()).toBe('erreur');
    });

    test("doit être un Monade et respecter la loi de l'identité à gauche", () => {
        const m1 = Result.of(1);
        const f = x => Result.of(x + 1);

        const m2 = m1.chain(f);
        expect(m2.extract()).toBe(2);
    });

    test("doit être un Monade et respecter la loi de l'identité à droite", () => {
        const m1 = Result.of(1);

        const m2 = m1.chain(Result.of);
        expect(m2.extract()).toBe(1);
    });

    test('doit fournir une opération pour supporter une valeur par défaut', () => {
        expect(Result.ok(1).extractOrElse(42)).toBe(1);
        expect(Result.error().extractOrElse(42)).toBe(42);
    });

    test('doit fournir une opération tap transparent', () => {
        const m1 = new Result(1);
        const log = jest.fn();

        const result = m1.tap(log);

        expect(result).toBe(m1);
        expect(log).toHaveBeenCalledWith(1);
    });

    test('tap doit ignorer les exceptions', () => {
        const m1 = new Result(1);
        const log = jest.fn().mockImplementation(() => {
            throw Error('erreur');
        });

        const result = m1.tap(log);

        expect(result).toBe(m1);
        expect(log).toHaveBeenCalledWith(1);
    });
});
