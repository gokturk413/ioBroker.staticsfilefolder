import config from '@iobroker/eslint-config';

export default [
    {
        ignores: [
            '**/node_modules/**',
            'admin/**',
            'www/**',
            'test/**',
            '*.test.js',
            'main.test.js',
            'package-lock.json',
        ],
    },
    ...config,
    {
        rules: {
            'no-console': 'off',
        },
    },
];
