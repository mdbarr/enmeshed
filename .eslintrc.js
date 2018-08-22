module.exports = {
  "parser": "espree",
  "parserOptions": {
    "sourceType": "script"
  },
  "env": {
    "node": true,
    "browser": true,
    "es6": true
  },
  "rules": {
    "no-empty": ["error", {
      "allowEmptyCatch": true
    }],
    "indent": ["error", 2, {
      "SwitchCase": 1
    }],
    "comma-spacing": "error",
    "semi": "error",
    "space-infix-ops": "error",
    "space-before-blocks": "error",
    "no-trailing-spaces": "error",
    "comma-dangle": ["error", "never"],
    "no-multi-spaces": "error",
    "eol-last": "error",
    "quotes": ["error", "single", {
      "avoidEscape": true
    }],
    "no-multiple-empty-lines": ["error", {
      "max": 1
    }],
    "eqeqeq": ["error", "always"],
    "key-spacing": ["error", {
      "beforeColon": false,
      "afterColon": true
    }],
    "no-dupe-args": "error",
    "no-dupe-keys": "error",
    "no-debugger": "error",
    "no-caller": "error",
    "no-undef": "error",

    "keyword-spacing": "error",
    "no-unreachable": "error",
    "no-cond-assign": ["error", "except-parens"],
    "no-sparse-arrays": "error",
    "no-eval": "error",
    "no-proto": "error",
    "no-with": "error",
    "brace-style": ["error", "1tbs", {
      "allowSingleLine": true
    }],

    "array-bracket-spacing": [
      "error",
      "always"
    ],
    "dot-location": [
      "error",
      "object"
    ],
    "dot-notation": "error",
    "no-const-assign": "error",
    "no-constant-condition": "error",
    "no-empty-character-class": "error",
    "no-floating-decimal": "error",
    "no-mixed-requires": "error",
    "no-redeclare": "error",
    "no-shadow": [
      "error",
      {
        "allow": [
          "body",
          "error",
          "reject",
          "resolve",
          "response",
          "result"
        ]
      }
    ],
    "no-unmodified-loop-condition": "error",
    "no-unused-expressions": "error",
    "no-unused-vars": "error",
    "no-use-before-define": [
      "error",
      "nofunc"
    ],
    "no-useless-call": "error",
    "no-useless-escape": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "object-curly-newline": [
      "error",
      {
        "minProperties" : 1
      }
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "object-property-newline": "error",
    "one-var": [
      "error",
      "never"
    ],
    "one-var-declaration-per-line": "error",
    "prefer-const": "error",
    "prefer-promise-reject-errors": "error",
    "yoda": "error"
  }
};
