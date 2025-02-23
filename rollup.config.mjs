import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: './src/index.js',
        output: {
            file: 'dist/index.js',
            format: 'cjs',
            exports: 'named',
            sourcemap: true
        },
        plugins: [
            commonjs({
                include: ['src/**', 'node_modules/**']
            }),
            terser()
        ]
    }
];
