"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _attendance = require("./attendance");
Object.keys(_attendance).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _attendance[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _attendance[key];
    }
  });
});
//# sourceMappingURL=index.js.map