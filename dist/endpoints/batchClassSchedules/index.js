"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _batchClassSchedules = require("./batchClassSchedules");
Object.keys(_batchClassSchedules).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _batchClassSchedules[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _batchClassSchedules[key];
    }
  });
});
//# sourceMappingURL=index.js.map