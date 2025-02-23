/*
 *  Test du module Try
 */

const { Try } = require('./try');

describe('Try', () => {

    // Fonctionnalités de base du type Try (Functor, Extend, Comonad, Apply, Chain, Applicative, Monade)
    test('doit être un functor et fournir une opération map', () => {
        const try1 = new Try(1);

        expect(typeof try1.map).toBe('function');

        const try2 = try1.map(x => x + 1);
        expect(try2).toBeInstanceOf(Try);
        expect(try2.extract()).toBe(2);
    });

    test("doit être un function et respecter la loi de l'identité", () => {
        const try1 = new Try(1);

        const try2 = try1.map(x => x);
        expect(try2).toBeInstanceOf(Try);
        expect(try2.extract()).toBe(1);
    });

    test('doit être un functor et respecter la loi de la composition', () => {
        const try1 = new Try(1);
        const f = x => x + 1;
        const g = x => x * 2;

        const try2 = try1.map(f).map(g);
        const try3 = try1.map(x => g(f(x)));

        expect(try2.extract()).toBe(4);
        expect(try3.extract()).toBe(4);
    });

    test("doit être de type Extend et fournir une opération 'extend'", () => {
        const try1 = new Try(1);

        expect(typeof try1.extend).toBe('function');

        const try2 = try1.extend(t => t.extract() + 1);

        expect(try2).toBeInstanceOf(Try);
        expect(try2.extract()).toBe(2);
    });

    test("doit être de type Extend et respecter la loi de l'équivalence", () => {
        const try1 = new Try(1);
        const f = x => x.extract() + 1;
        const g = x => x.extract() * 2;

        const try2 = try1.extend(g).extend(f);
        const try3 = try1.extend(t => f(t.extend(g)));

        expect(try2.extract()).toBe(3);
        expect(try3.extract()).toBe(3);
    });

    test("doit être un Comonad et fournir une opération 'extract'", () => {
        const try1 = new Try(1);

        expect(typeof try1.extract).toBe('function');
        expect(try1.extract()).toBe(1);
    });

    test("doit être un Comonad et respecter la loi de l'identité à gauche", () => {
        const try1 = new Try(1);

        const try2 = try1.extend(t => t.extract());
        expect(try2.extract()).toBe(1);
    });

    test("doit être un Comonad et respecter la loi de l'identité à droite", () => {
        const try1 = new Try(1);
        const f = x => x.extract() + 1;

        const try2 = try1.extend(f).extract();
        const try3 = f(try1);
        expect(try2).toBe(try3);
    });

    test("doit être de type Apply et fournir une opération 'ap'", () => {
        const try1 = new Try(1);
 
        expect(typeof try1.ap).toBe('function');

        const f = new Try(x => x + 1);
        const try2 = try1.ap(f);

        expect(try2).toBeInstanceOf(Try);
        expect(try2.extract()).toBe(2);
    });

    test("doit être de type Apply et respecter la loi de composition", () => {
        const try1 = new Try(1);
        const f = x => x + 1;
        const g = x => x * 2;
        const af = new Try(f);
        const ag = new Try(g);

        const try2 = try1.ap(af.ap(ag.map(f => g => x => f(g(x)))));
        const try3 = try1.ap(af).ap(ag);

        expect(try2.extract()).toBe(4);
        expect(try3.extract()).toBe(4);
    });

    test("doit être de type Chain et fournir une opération 'chain'", () => {
        const try1 = new Try(1);

        expect(typeof try1.chain).toBe('function');

        const f = x => new Try(x + 1);
        const try2 = try1.chain(f);

        expect(try2).toBeInstanceOf(Try);
        expect(try2.extract()).toBe(2);
    });

    test("doit être du type Chain et respecter la loi de l'associativité", () => {      
        const try1 = new Try(1);
        const f = x => new Try(x + 1);
        const g = x => new Try(x * 2);

        const try2 = try1.chain(f).chain(g);
        const try3 = try1.chain(x => f(x).chain(g));

        expect(try2.extract()).toBe(4);
        expect(try3.extract()).toBe(4);
    });

    test("doit être de type Applicative et fournir une opération 'of'", () => {
        expect(typeof Try.of).toBe('function');

        const try1 = Try.of(1);

        expect(try1).toBeInstanceOf(Try);
        expect(try1.extract()).toBe(1);
    });

    test("doit être de type Applicative et respecter la loi de l'identité", () => {
        const try1 = Try.of(1);

        const try2 = try1.chain(Try.of);

        expect(try2.extract()).toBe(1);
    });

    test("doit être de type Applicative et respecter la loi de l'homomorphisme", () => {
        // A['fantasy-land/of'](x)['fantasy-land/ap'](A['fantasy-land/of'](f)) est équivalent à A['fantasy-land/of'](f(x))
        const f = x => x + 1;
        const try1 = Try.of(1);
        const try2 = Try.of(f); 

        const try3 = try1.ap(try2);
        const try4 = Try.of(f(try1.extract()));

        expect(try3.extract()).toBe(try4.extract());        

    });

    test("doit être de type Applicative et respecter la loi de l'interchange", () => {
        // A['fantasy-land/of'](x)['fantasy-land/ap'](v) est équivalent à v['fantasy-land/ap'](A['fantasy-land/of'](f => f(x)))
        const f = x => x + 1;
        const try1 = Try.of(1);
        const try2 = Try.of(f);

        const try3 = try1.ap(try2);
        const try4 = try2.ap(Try.of(f => f(try1.extract())));

        expect(try3.extract()).toBe(try4.extract());
    });

    test("doit être un Monade et respecter la loi de l'identité à gauche", () => {
        const try1 = Try.of(1);
        const f = x => Try.of(x + 1);

        const try2 = try1.chain(f);
        expect(try2.extract()).toBe(2);
    });

    test("doit être un Monade et respecter la loi de l'identité à droite", () => {
        const try1 = Try.of(1);

        const try2 = try1.chain(Try.of);
        expect(try2.extract()).toBe(1);
    });

    // Fonctionnalités supplémentaires du type Try
    test("doit permettre d'exécuter une fonction tardivement en toute sécurité, cas standard", () => {
        const try1 = new Try(() => 1);

        const result = try1.runSafely();
        expect(result).toBe(1);
    });

    test("doit permettre d'exécuter une fonction tardivement en toute sécurité, cas d'erreur", () => {
        const try1 = new Try(() => {
            throw new Error("Erreur");
        });

        const catched = jest.fn().mockReturnValueOnce("Erreur catchée: Erreur");

        const result = try1.catch(catched).runSafely();
        expect(result).toBe("Erreur catchée: Erreur");
        expect(catched).toHaveBeenCalledWith(new Error("Erreur"));
    });

    test("doit permettre d'exécuter une fonction tardivement en toute sécurité et appeler le block finally", () => {    
        const try1 = new Try(() => 1);

        const finallyBlock = jest.fn();
        const result = try1.finally(finallyBlock).runSafely();
        expect(result).toBe(1);
        expect(finallyBlock).toHaveBeenCalledTimes(1);
    });

    test("doit permettre d'exécuter une fonction tardivement en toute sécurité et appelé le block finally, cas sans catch", () => {
        const try1 = new Try(() => {
            throw new Error("Erreur");
        });

        const finallyBlock = jest.fn();
        const result = try1.finally(finallyBlock).runSafely();
        expect(result).toBeInstanceOf(Error);
        expect(finallyBlock).toHaveBeenCalledTimes(1);
    });
});
