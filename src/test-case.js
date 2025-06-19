/**
 * Exemple d'usage
 */

const { pipe, prop } = require('ramda');
const { object, string } = require('yup');
const { tap, map, chain, maybeToResult } = require('./utils');

const apiParameterSchema = object({
    name: string().required(),
    value: string().required()
});

// Placeholder
const logger = {
    infoF:
        message =>
        (...args) =>
            console.info(message, ...args),
    infoF0: message => () => console.info(message)
};

// Test 1 : usage du type Identity
// Illustre la mise en container d'une valeur et de son usage
const { Identity } = require('./types/identity');
const test1 = pipe(
    Identity.of,
    tap(logger.infoF('[test1] Api handler started with:')),
    map(prop('value')),
    map(x => x + 1),
    map(x => ({ sucess: true, result: x })),
    tap(logger.infoF('[test1] Result:'))
);

// exécution
console.info('Exécution Test 1:', test1({ value: 1 }).extract());

// Test 2 : usage de Maybe
// Illustre la mise en container d'une valeur potentiellement nulle ou vide
console.info('-----');
const { Maybe } = require('./types/maybe');
const test2 = pipe(
    Maybe.of,
    tap(logger.infoF('[test2] Api handler started with:')),
    map(prop('value')),
    map(x => x + 1),
    tap(logger.infoF('[test2] Result:'))
);

// exécution
console.info('Exécution Test 2:', test2({ value: 1 }).extract());
console.info('Exécution Test 2b:', test2({}).extract());
console.info('Exécution Test 2c:', test2({}).extractOrElse('Argument invalide'));
console.info(
    'Exécution Test 2d:',
    test2({ otherProperty: 1 }).match({
        just: x => ({ success: true, result: x }),
        nothing: () => ({ sucess: false, message: 'Argument invalide' })
    })
);

// Test3: introduction du type Result permettant l'exécution d'une opération (synchrone) qui peut échouer (i.e. renvoyer une exception)
console.info('-----');
const { Result } = require('./types/result');
const unsafeOperation = x =>
    Result.tryCatch(() => {
        if (x >= 10) throw Error('unexpected error !');
        return x * 10;
    });

const test3 = pipe(
    Maybe.of,
    tap(logger.infoF('[test3] Api handler started with:')),
    map(prop('value')),
    map(x => x + 1),
    maybeToResult, // transmutation du Maybe en Result pour continuer le chainage
    chain(unsafeOperation), // usage de chain pour éviter l'imbrication de type Result du à l'encapsulation d'une fonction
    map(x => x + 1),
    tap(logger.infoF('[test3] Result:'))
);
console.info('Exécution Test 3:', test3({ value: 1 }).extract());
console.info('Exécution Test 3b:', test3({ value: 9 }).extract());
console.info('Exécution Test 3c:', test3({ value: 9 }).extractOrElse('Erreur inattendue !'));
console.info(
    'Exécution Test 3d:',
    test3({ value: 9 }).match({
        ok: x => ({ sucess: true, result: x }),
        error: error => ({ success: false, result: error.message })
    })
);
console.info(
    'Exécution Test 3e:',
    test3({ value: 1 }).match({
        ok: x => ({ sucess: true, result: x }),
        error: error => ({ success: false, result: error.message })
    })
);
