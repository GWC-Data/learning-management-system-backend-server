"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _courseCategory = require("./courseCategory");
Object.keys(_courseCategory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _courseCategory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _courseCategory[key];
    }
  });
});
//# sourceMappingURL=index.js.map