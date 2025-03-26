"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _linkedIn = require("./linkedIn");
Object.keys(_linkedIn).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _linkedIn[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _linkedIn[key];
    }
  });
});
//# sourceMappingURL=index.js.map