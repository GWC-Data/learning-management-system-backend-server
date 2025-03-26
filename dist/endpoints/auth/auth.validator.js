"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loginValidator = void 0;
const loginValidator = exports.loginValidator = {
  email: {
    in: 'body',
    exists: {
      errorMessage: 'Email is required'
    },
    isEmail: {
      errorMessage: 'Email is not valid'
    },
    normalizeEmail: true
  },
  password: {
    in: 'body',
    exists: {
      errorMessage: 'Password is required'
    }
  }
};
//# sourceMappingURL=auth.validator.js.map