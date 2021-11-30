module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "parserOptions": {
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "rules": {
        'quotes': [2, 'single', { 'avoidEscape': true }],
        'indent': [2, 2],
        'no-unused-vars': 'off',
        'no-tabs': 'off',
        'no-multi-assign': 'off',
        'max-len': ['error', {
          code: 125,
          comments: 200,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        }],
        'no-plusplus': 'off',
        'no-restricted-syntax': 'off',
        'global-require': 'off',
        'guard-for-in': 'off',
        'no-shadow': 'off',
        'no-underscore-dangle': 'off',
        'object-curly-newline': ['error', {
          ObjectExpression: { multiline: true, minProperties: 6, consistent: true }
        }]
    }
};
