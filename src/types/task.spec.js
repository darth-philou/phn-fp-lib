/*
 *  Test du module Task
 */

const { Task } = require('./task');

describe('Task', () => {
    // Une Task doit fournir une opération run
    test("doit fournir une opération run qui lance l'exécution différée de la tâche", () => {
        const effect = Task.of(42);

        expect(typeof effect.run).toBe('function');

        const reject = jest.fn();
        effect.run({
            reject,
            resolve: value => {
                expect(value).toBe(42);
            }
        });

        expect(reject).toHaveBeenCalledTimes(0);
    });

    test("doit fournir une opération run qui traite de l'échec de la tache", () => {
        const effect = Task.rejected(42);

        const resolve = jest.fn();
        effect.run({
            reject: value => {
                expect(value).toBe(42);
            },
            resolve
        }).catch(() => {});

        expect(resolve).toHaveBeenCalledTimes(0);
    });

    test('doit appeler le callback always en toute circonstance', () => {
        const always = jest.fn();
        const resolvedTask = Task.of(42).finally(always);

        resolvedTask.run({});

        expect(always).toHaveBeenCalledTimes(1);

        const rejectedTask = Task.rejected(42).finally(always);

        rejectedTask.run({}).catch(() => {});

        expect(always).toHaveBeenCalledTimes(2);
    });

    // Fonctionnalités de base du type Task (Functor, Apply, Chain, Applicative, Monade)
    test('doit être un functor et fournir une opération map', () => {
        // https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landmap-method
        const try1 = Task.of(1);

        expect(typeof try1.map).toBe('function');

        const try2 = try1.map(x => x + 1);
        expect(try2).toBeInstanceOf(Task);

        try2.run({
            resolve: value => {
                expect(value).toBe(2);
            }
        });
    });

    test("doit être un funcror et respecter la loi de l'identité", () => {
        // u['fantasy-land/map'](a => a) is equivalent to u
        const try1 = Task.of(1);

        const try2 = try1.map(x => x);
        expect(try2).toBeInstanceOf(Task);
        try2.run({
            resolve: value => {
                expect(value).toBe(1);
            }
        });
    });

    test('doit être un functor et respecter la loi de la composition', () => {
        // u['fantasy-land/map'](x => f(g(x))) is equivalent to u['fantasy-land/map'](g)['fantasy-land/map'](f)
        const try1 = Task.of(1);
        const f = x => x + 1;
        const g = x => x * 2;

        const try2 = try1.map(f).map(g);
        const try3 = try1.map(x => g(f(x)));

        try2.run({
            resolve: value => {
                expect(value).toBe(4);
            }
        });
        try3.run({
            resolve: value => {
                expect(value).toBe(4);
            }
        });
    });

    test("doit être de type Apply et fournir une opération 'ap'", () => {
        // https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landap-method
        const try1 = Task.of(1);

        expect(typeof try1.ap).toBe('function');

        const f = Task.of(x => x + 1);
        const try2 = try1.ap(f);

        expect(try2).toBeInstanceOf(Task);
        try2.run({
            resolve: value => {
                expect(value).toBe(2);
            }
        });
    });

    test('doit être de type Apply et respecter la loi de composition', () => {
        // v['fantasy-land/ap'](u['fantasy-land/ap'](a['fantasy-land/map'](f => g => x => f(g(x))))) is equivalent to v['fantasy-land/ap'](u)['fantasy-land/ap'](a)
        const try1 = Task.of(1);
        const f = x => x + 1;
        const g = x => x * 2;
        const af = Task.of(f);
        const ag = Task.of(g);

        const try2 = try1.ap(af.ap(ag.map(f => g => x => f(g(x)))));
        const try3 = try1.ap(af).ap(ag);

        try2.run({
            resolve: value => {
                expect(value).toBe(4);
            }
        });
        try3.run({
            resolve: value => {
                expect(value).toBe(4);
            }
        });
    });

    test("doit être de type Chain et fournir une opération 'chain'", () => {
        // https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landchain-method
        const try1 = Task.of(1);

        expect(typeof try1.chain).toBe('function');

        const f = x => Task.of(x + 1);
        const try2 = try1.chain(f);

        expect(try2).toBeInstanceOf(Task);
        try2.run({
            resolve: value => {
                expect(value).toBe(2);
            }
        });
    });

    test("doit être du type Chain et respecter la loi de l'associativité", () => {
        // m['fantasy-land/chain'](f)['fantasy-land/chain'](g) is equivalent to m['fantasy-land/chain'](x => f(x)['fantasy-land/chain'](g))
        const try1 = Task.of(1);
        const f = x => Task.of(x + 1);
        const g = x => Task.of(x * 2);

        const try2 = try1.chain(f).chain(g);
        const try3 = try1.chain(x => f(x).chain(g));

        try2.run({
            resolve: value => {
                expect(value).toBe(4);
            }
        });
        try3.run({
            resolve: value => {
                expect(value).toBe(4);
            }
        });
    });

    test("doit être de type Applicative et fournir une opération 'of'", () => {
        // https://github.com/fantasyland/fantasy-land?tab=readme-ov-file#fantasy-landof-method
        expect(typeof Task.of).toBe('function');

        const try1 = Task.of(1);

        expect(try1).toBeInstanceOf(Task);
    });

    test("doit être de type Applicative et respecter la loi de l'identité", () => {
        // v['fantasy-land/ap'](A['fantasy-land/of'](x => x)) is equivalent to v
        const try1 = Task.of(1);
        const try2 = Task.of(x => x);
        const try3 = try1.ap(try2);

        try3.run({
            resolve: value => {
                expect(value).toBe(1);
            }
        });
    });

    test("doit être de type Applicative et respecter la loi de l'homomorphisme", () => {
        // A['fantasy-land/of'](x)['fantasy-land/ap'](A['fantasy-land/of'](f)) est équivalent à A['fantasy-land/of'](f(x))
        const f = x => x + 1;

        const left = Task.of(1).ap(Task.of(f));
        left.run({
            resolve: value => {
                expect(value).toBe(2);
            }
        });

        const right = Task.of(f(1));
        right.run({
            resolve: value => {
                expect(value).toBe(2);
            }
        });
    });

    test("doit être de type Applicative et respecter la loi de l'interchange", () => {
        // A['fantasy-land/of'](x)['fantasy-land/ap'](v) est équivalent à v['fantasy-land/ap'](A['fantasy-land/of'](f => f(x)))
        const x = 1;
        const f = x => x + 1;

        const left = Task.of(x).ap(Task.of(f));
        left.run({
            resolve: value => {
                expect(value).toBe(2);
            }
        });

        const right = Task.of(f).ap(Task.of(f => f(x)));
        right.run({
            resolve: value => {
                expect(value).toBe(2);
            }
        });
    });

    test("doit être un Monade et respecter la loi de l'identité à gauche", () => {
        // M['fantasy-land/of'](a)['fantasy-land/chain'](f) is equivalent to f(a)
        const a = 1;
        const f = x => x + 1;

        const left = Task.of(a).chain(x => Task.of(f(x)));
        left.run({
            resolve: value => {
                expect(value).toBe(f(a));
            }
        });
    });

    test("doit être un Monade et respecter la loi de l'identité à droite", () => {
        // m['fantasy-land/chain'](M['fantasy-land/of']) is equivalent to m
        const left = Task.of(1).chain(Task.of);
        left.run({
            resolve: value => {
                expect(value).toBe(1);
            }
        });
    });
});
