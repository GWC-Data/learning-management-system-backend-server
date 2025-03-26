"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loginEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _auth = require("./auth.handler");
var _auth2 = require("./auth.validator");
var _auth3 = require("./auth.const");
const loginEndpoint = exports.loginEndpoint = new _nodeServerEngine.Endpoint({
  path: "/auth/login",
  method: _nodeServerEngine.EndpointMethod.POST,
  handler: async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;
      const login = await (0, _auth.loginHandler)(email, password);
      if (!login) {
        res.status(404).json({
          message: _auth3.AUTH_USER_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: "Logged in successfully",
        login
      });
    } catch (error) {
      res.status(401).json({
        message: _auth3.AUTH_LOGIN_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: _auth2.loginValidator
});
//# sourceMappingURL=auth.js.map