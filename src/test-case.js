/**
 * Exemple d'usage
 */

const { pipe, prop } = require('ramda');
const { object, number } = require('yup');
const { tap, map, chain, maybeToResult } = require('./utils');

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

// Test3
// introduction du type Result permettant l'exécution d'une opération (synchrone) qui peut échouer (i.e. renvoyer une exception)
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

// Test 4
// Introduction de Task. C'est un ADT qui permet un style déclaratif pour les Promise, exécutée uniquement au moment du déclenchement.
console.info('-----');
const { Task } = require('./types/task');
const test4Schema = object({
    value: number().required()
});
const assertInput = schema => input => new Task(({ reject, resolve }) => schema.validate(input).then(resolve).catch(reject));
const mockAPICall = input =>
    input >= 10
        ? Task.rejected({ success: false, reason: 'Unknown error' })
        : Task.of({ success: true, result: input * 10 });
const test4 = pipe(
    Maybe.of,
    tap(logger.infoF('[test4] Api handler started with:')),
    maybeToTask, // transmutation du Maybe en Task pour continuer le chainage
    chain(assertInput(test4Schema)), // usage de chain pour éviter l'imbrication : assertInput renvoie déjà une Task
    map(prop('value')),
    map(x => x + 1),
    chain(mockAPICall), // usage de chain pour éviter l'imbrication : mockAPICall renvoie aussi une Task
    map(({ success, result }) => ({ success, result: result + 1})),
    tap(logger.infoF('[test4] Result:'))
);
console.info(
    'Exécution Test 4:',
    test4({ value: 1 }).match({
        onResolved: x => { console.info('[test4] resolved:', x); },
        onRejected: x => { console.info('[test4] rejected:', x); },
        onFinally: () => {
            console.info('[test4] cleanup resources');
        }
    })
);
console.info(
    'Exécution Test 4b:',
    test4({ value: 9 }).match({
        onResolved: x => { console.info('[test4b] resolved:', x); },
        onRejected: x => { console.info('[test4b] rejected:', x); }
    })
);
console.info(
    'Exécution Test 4c:',
    test4({ foo: 'bar' }).match({
        onResolved: x => { console.info('[test4c] resolved:', x); },
        onRejected: x => { console.info('[test4c] rejected:', x.message); }
    })
);
