"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _role = require("./role");
Object.keys(_role).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _role[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _role[key];
    }
  });
});
//# sourceMappingURL=index.js.map