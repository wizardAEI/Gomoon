module.exports = {
  plugins: ['solid', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:solid/typescript',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ],
  ignorePatterns: [
    '**/{node_modules,lib,es,examples,output}',
    '**/*.d.ts',
    '**/tsconfig.json',
    'src/renderer/public/**.js'
  ],

  rules: {
    '@typescript-eslint/no-explicit-any': [1],
    'import/no-unresolved': [0],
    'import/named': [1],
    'import/unambiguous': [0],
    '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'import/extensions': [0],
    'init-declarations': [0],
    '@typescript-eslint/init-declarations': [0],
    'max-statements-per-line': [0],
    '@typescript-eslint/no-use-before-define': [1],
    '@typescript-eslint/explicit-function-return-type': [0],
    '@typescript-eslint/ban-ts-comment': [0],
    'prefer-const': [1],
    'import/no-extraneous-dependencies': [2],
    'import/order': [
      'warn',
      {
        /* 导出顺序规则：
      1. 内置的 Node.js 模块
      2. 第三方模块（如 react，lodash 等）
      3. 自定义的全局模块（在你的项目中定义的，但在多个文件中使用的模块）
      4. 模块从父级目录导入（使用 ../）
      5. 模块从同级或子级目录导入（使用 ./） */
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always'
      }
    ]
  }
}
