"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _checkPermission = require("./checkPermission");
Object.keys(_checkPermission).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _checkPermission[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _checkPermission[key];
    }
  });
});
//# sourceMappingURL=index.js.map