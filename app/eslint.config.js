module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        require: "readonly",
        module: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        fetch: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        document: "readonly",
        URLSearchParams: "readonly",
        window: "readonly",
        pokemon: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];