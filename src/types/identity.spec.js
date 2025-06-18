/*
 *  Test du module Identity
 */

const { Identity } = require('./identity');

describe('Identity', () => {
    // Fonctionnalités de base du type Identity (Functor, Extend, Comonad, Apply, Chain, Applicative, Monade)
    test('doit être un functor et fournir une opération map', () => {
        const m1 = new Identity(1);

        expect(typeof m1.map).toBe('function');

        const m2 = m1.map(x => x + 1);
        expect(m2).toBeInstanceOf(Identity);
        expect(m2.extract()).toBe(2);
    });

    test("doit être un function et respecter la loi de l'identité", () => {
        const m1 = new Identity(1);

        const m2 = m1.map(x => x);
        expect(m2).toBeInstanceOf(Identity);
        expect(m2.extract()).toBe(1);
    });

    test('doit être un functor et respecter la loi de la composition', () => {
        const m1 = new Identity(1);
        const f = x => x + 1;
        const g = x => x * 2;

        const m2 = m1.map(f).map(g);
        const m3 = m1.map(x => g(f(x)));

        expect(m2.extract()).toBe(4);
        expect(m3.extract()).toBe(4);
    });

    test("doit être de type Extend et fournir une opération 'extend'", () => {
        const m1 = new Identity(1);

        expect(typeof m1.extend).toBe('function');

        const m2 = m1.extend(t => t.extract() + 1);

        expect(m2).toBeInstanceOf(Identity);
        expect(m2.extract()).toBe(2);
    });

    test("doit être de type Extend et respecter la loi de l'équivalence", () => {
        const m1 = new Identity(1);
        const f = x => x.extract() + 1;
        const g = x => x.extract() * 2;

        const m2 = m1.extend(g).extend(f);
        const m3 = m1.extend(t => f(t.extend(g)));

        expect(m2.extract()).toBe(3);
        expect(m3.extract()).toBe(3);
    });

    test("doit être un Comonad et fournir une opération 'extract'", () => {
        const m1 = new Identity(1);

        expect(typeof m1.extract).toBe('function');
        expect(m1.extract()).toBe(1);
    });

    test("doit être un Comonad et respecter la loi de l'identité à gauche", () => {
        const m1 = new Identity(1);

        const m2 = m1.extend(t => t.extract());
        expect(m2.extract()).toBe(1);
    });

    test("doit être un Comonad et respecter la loi de l'identité à droite", () => {
        const m1 = new Identity(1);
        const f = x => x.extract() + 1;

        const m2 = m1.extend(f).extract();
        const m3 = f(m1);
        expect(m2).toBe(m3);
    });

    test("doit être de type Apply et fournir une opération 'ap'", () => {
        const m1 = new Identity(1);

        expect(typeof m1.ap).toBe('function');

        const f = new Identity(x => x + 1);
        const m2 = m1.ap(f);

        expect(m2).toBeInstanceOf(Identity);
        expect(m2.extract()).toBe(2);
    });

    test('doit être de type Apply et respecter la loi de composition', () => {
        const m1 = new Identity(1);
        const f = x => x + 1;
        const g = x => x * 2;
        const af = new Identity(f);
        const ag = new Identity(g);

        const m2 = m1.ap(af.ap(ag.map(f => g => x => f(g(x)))));
        const m3 = m1.ap(af).ap(ag);

        expect(m2.extract()).toBe(4);
        expect(m3.extract()).toBe(4);
    });

    test("ap doit renvoyer une exception si l'argument n'est pas un Identity", () => {
        const m1 = new Identity(1);

        expect(() => m1.ap(x => x + 1)).toThrow();
    });

    test("ap doit renvoyer une exception si l'argument n'est pas un Identity d'une fonction", () => {
        const m1 = new Identity(1);

        expect(() => m1.ap(new Identity(0))).toThrow();
    });

    test("doit être de type Chain et fournir une opération 'chain'", () => {
        const m1 = new Identity(1);

        expect(typeof m1.chain).toBe('function');

        const f = x => new Identity(x + 1);
        const m2 = m1.chain(f);

        expect(m2).toBeInstanceOf(Identity);
        expect(m2.extract()).toBe(2);
    });

    test("doit être du type Chain et respecter la loi de l'associativité", () => {
        const m1 = new Identity(1);
        const f = x => new Identity(x + 1);
        const g = x => new Identity(x * 2);

        const m2 = m1.chain(f).chain(g);
        const m3 = m1.chain(x => f(x).chain(g));

        expect(m2.extract()).toBe(4);
        expect(m3.extract()).toBe(4);
    });

    test('chain doit retourner une exception si la fonction ne renvoie pas un Identity', () => {
        const m1 = new Identity(1);
        expect(() => m1.chain(x => x + 1)).toThrow();
    });

    test("doit être de type Applicative et fournir une opération 'of'", () => {
        expect(typeof Identity.of).toBe('function');

        const m1 = Identity.of(1);

        expect(m1).toBeInstanceOf(Identity);
        expect(m1.extract()).toBe(1);
    });

    test("doit être de type Applicative et respecter la loi de l'identité", () => {
        const m1 = Identity.of(1);

        const m2 = m1.chain(Identity.of);

        expect(m2.extract()).toBe(1);
    });

    test("doit être de type Applicative et respecter la loi de l'homomorphisme", () => {
        // A['fantasy-land/of'](x)['fantasy-land/ap'](A['fantasy-land/of'](f)) est équivalent à A['fantasy-land/of'](f(x))
        const f = x => x + 1;
        const m1 = Identity.of(1);
        const m2 = Identity.of(f);

        const m3 = m1.ap(m2);
        const m4 = Identity.of(f(m1.extract()));

        expect(m3.extract()).toBe(m4.extract());
    });

    test("doit être de type Applicative et respecter la loi de l'interchange", () => {
        // A['fantasy-land/of'](x)['fantasy-land/ap'](v) est équivalent à v['fantasy-land/ap'](A['fantasy-land/of'](f => f(x)))
        const f = x => x + 1;
        const m1 = Identity.of(1);
        const m2 = Identity.of(f);

        const m3 = m1.ap(m2);
        const m4 = m2.ap(Identity.of(f => f(m1.extract())));

        expect(m3.extract()).toBe(m4.extract());
    });

    test("doit être un Monade et respecter la loi de l'identité à gauche", () => {
        const m1 = Identity.of(1);
        const f = x => Identity.of(x + 1);

        const m2 = m1.chain(f);
        expect(m2.extract()).toBe(2);
    });

    test("doit être un Monade et respecter la loi de l'identité à droite", () => {
        const m1 = Identity.of(1);

        const m2 = m1.chain(Identity.of);
        expect(m2.extract()).toBe(1);
    });

    test('doit fournir une opération tap transparent', () => {
        const m1 = new Identity(1);
        const log = jest.fn();

        const result = m1.tap(log);

        expect(result).toBe(m1);
        expect(log).toHaveBeenCalledWith(1);
    });

    test('tap doit ignorer les exceptions', () => {
        const m1 = new Identity(1);
        const log = jest.fn().mockImplementation(() => {
            throw Error('erreur');
        });

        const result = m1.tap(log);

        expect(result).toBe(m1);
        expect(log).toHaveBeenCalledWith(1);
    });
});
