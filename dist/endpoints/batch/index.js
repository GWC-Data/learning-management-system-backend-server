"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _batch = require("./batch");
Object.keys(_batch).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _batch[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _batch[key];
    }
  });
});
//# sourceMappingURL=index.js.map