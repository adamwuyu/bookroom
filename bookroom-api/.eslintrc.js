module.exports = {
  root: true, // 作用的目录是根目录
  env: {
    browser: true, // 开发环境配置表示可以使用浏览器的方法
    node: true, //
    es6: true,
    jest: true, // Added Jest environment
  },
  parser: '@typescript-eslint/parser', // Changed parser for TypeScript
  parserOptions: {
    ecmaVersion: 2020, // Aligned with tsconfig target
    sourceType: "module",
    // project: './tsconfig.json', // Optional: Usually needed for rules requiring type info
  },
  plugins: [
    '@typescript-eslint', // Added TypeScript plugin
    'jest', // Added Jest plugin
    // "html", // Removed html plugin as it's less common with TS/Jest setups
  ],
  extends: [
    'eslint:recommended', // Basic ESLint recommendations
    'plugin:@typescript-eslint/recommended', // TypeScript recommendations
    'plugin:jest/recommended', // Jest recommendations
    // "standard", // Removed 'standard' as we are using TS specific rules now
  ],
  rules: {
    // 重新覆盖 extends: 'standard'的规则
    // 自定义的规则
    "linebreak-style": [0, "error", "windows"],
    indent: 0,
    // "indent": ['error', 4], // error类型，缩进4个空格
    // indent: ["error", 2], // error类型，缩进2个空格
    "space-before-function-paren": 0, // 在函数左括号的前面是否有空格
    "eol-last": 0, // 不检测新文件末尾是否有空行
    semi: ["error", "always"], // 必须在语句后面加分号
    quotes: ["error", "double"], // 字符串没有使用单引号
    "comma-dangle": 0, // 对象字面量项尾可以有逗号
    "no-console": ["error", { allow: ["log", "warn"] }], // 允许使用console.log()
    "arrow-parens": 0,
    "no-new": 0, // 允许使用 new 关键字

    // Example: You might want to disable specific TS rules if needed
    // '@typescript-eslint/no-unused-vars': 'warn',
    // '@typescript-eslint/no-explicit-any': 'off',
  },
};
