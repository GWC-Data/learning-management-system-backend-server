"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _users = require("./users");
Object.keys(_users).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _users[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _users[key];
    }
  });
});
//# sourceMappingURL=index.js.map