"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _createServer = require("./createServer");
Object.keys(_createServer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _createServer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _createServer[key];
    }
  });
});
//# sourceMappingURL=index.js.map