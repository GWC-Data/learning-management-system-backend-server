"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _courses = require("./courses");
Object.keys(_courses).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _courses[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _courses[key];
    }
  });
});
//# sourceMappingURL=index.js.map