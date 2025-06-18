/**
 * Exemple d'usage
 */

const { pipe, tap } = require('ramda');
const { object, string } = require('yup');

const { extract } = require('./extract');
const { assert } = require('./assert');

const apiParameterSchema = object({
    name: string().required(),
    value: string().required()
});

// Placeholder
const logger = {
    info: message => (...args) => console.info(message, ...args),
    info0: message => () => console.info(message)
}

const test1 = pipe(
    tap(logger.info0('Api handler started'),
    assert(apiParameterSchema),
    tap(pipe(
        extract,
        logger.info('Api handler finished:')
    )))
);
